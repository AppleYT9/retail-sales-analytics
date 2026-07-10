import os
import tempfile
import pandas as pd
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.utils.data_cleaner import clean_sales_data
from app.models.analytics import Upload
from app.models.user import User
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order


def _safe_str(row, col):
    """Safely extract a string value from a row."""
    if col and col in row.index:
        val = row[col]
        if pd.notna(val):
            return str(val).strip()
    return None


async def process_upload(file: UploadFile, db: Session, user: User, mapping: dict | None = None) -> Upload:
    # ── 1. Read file into memory ──────────────────────────────────────
    contents = await file.read()
    temp_dir = os.path.join(os.getcwd(), "tmp")
    os.makedirs(temp_dir, exist_ok=True)
    file_location = os.path.join(temp_dir, file.filename)
    with open(file_location, "wb") as f:
        f.write(contents)

    if file.filename.endswith('.csv'):
        df = pd.read_csv(file_location)
    elif file.filename.endswith(('.xls', '.xlsx')):
        df = pd.read_excel(file_location)
    else:
        raise ValueError("Unsupported file format. Please upload CSV or Excel.")

    # ── 2. Clean data ─────────────────────────────────────────────────
    cleaned_df = clean_sales_data(df)

    # ── 3. Column mapping ─────────────────────────────────────────────
    # Normalize spaces and hyphens to underscores for clean lookup
    col_map = {c.lower().replace(' ', '_').replace('-', '_'): c for c in cleaned_df.columns}

    def get_col(names, system_key=None):
        if mapping and system_key and system_key in mapping:
            custom_name = mapping[system_key]
            if custom_name in cleaned_df.columns:
                return custom_name
            norm_custom = custom_name.lower().replace(' ', '_').replace('-', '_')
            if norm_custom in col_map:
                return col_map[norm_custom]

        for n in names:
            if n in col_map:
                return col_map[n]
        return None

    date_col     = get_col(['date', 'order_date', 'transaction_date', 'timestamp'], 'date_col')
    customer_col = get_col(['customer_id', 'customer_code', 'customer', 'customer_name', 'buyer_name', 'order_id', 'order_code'], 'customer_col')
    category_col = get_col(['product_category', 'category', 'item_category', 'type'], 'category_col')
    product_col  = get_col(['product', 'product_name', 'item', 'item_name', 'title', 'sku', 'style', 'asin'], 'product_col')
    quantity_col = get_col(['quantity', 'qty', 'quantity_ordered', 'units', 'count'], 'quantity_col')
    price_col    = get_col(['price_per_unit', 'price', 'unit_price', 'rate', 'unitprice'], 'price_col')
    total_col    = get_col(['total_amount', 'total_price', 'revenue', 'total', 'amount', 'sales', 'grand_total'], 'total_col')
    gender_col   = get_col(['gender', 'sex'], 'gender_col')
    region_col   = get_col(['region', 'ship_state', 'state', 'ship_city', 'city', 'location', 'country'], 'region_col')

    # ── 4. Create upload record ───────────────────────────────────────
    upload_record = Upload(
        filename=file.filename,
        status="PENDING",
        records_processed=0,
        uploaded_by=user.id,
    )
    db.add(upload_record)
    db.flush()

    # ── 5. Pre-load existing Customers & Products into memory caches ─
    # Store code/sku -> id mappings in memory instead of full objects to save memory
    customer_cache = {c.customer_code: c.id for c in db.query(Customer.customer_code, Customer.id).all()}
    product_cache = {p.sku: p.id for p in db.query(Product.sku, Product.id).all()}

    # ── 6. Single-pass: resolve entities, collect orders ──────────────
    new_customers = {}
    new_products = {}
    order_rows = []

    for idx, row in cleaned_df.iterrows():
        try:
            # --- Customer ---
            cust_code = _safe_str(row, customer_col) or f"CUST_{idx}"
            if cust_code not in customer_cache and cust_code not in new_customers:
                region = _safe_str(row, region_col) or _safe_str(row, gender_col) or "Unknown"
                new_customers[cust_code] = {
                    "customer_code": cust_code,
                    "name": cust_code,
                    "region": region,
                    "segment": None
                }

            # --- Order quantities and totals ---
            qty = 1
            try:
                if quantity_col and quantity_col in row.index and pd.notna(row[quantity_col]):
                    qty = int(row[quantity_col])
            except (ValueError, TypeError):
                pass

            total_price = 0.0
            try:
                if total_col and total_col in row.index and pd.notna(row[total_col]):
                    total_price = float(row[total_col])
                elif price_col and price_col in row.index and pd.notna(row[price_col]):
                    total_price = float(row[price_col]) * qty
            except (ValueError, TypeError):
                pass

            # --- Product price determination ---
            unit_price = 0.0
            try:
                if price_col and price_col in row.index and pd.notna(row[price_col]):
                    unit_price = float(row[price_col])
                elif total_price > 0 and qty > 0:
                    unit_price = total_price / qty
            except (ValueError, TypeError):
                pass

            # --- Product SKU and details ---
            cat = _safe_str(row, category_col) or "General"
            prod_name = _safe_str(row, product_col) or cat
            sku = f"{cat[:3].upper()}_{prod_name[:5].upper()}".replace(" ", "")

            if sku not in product_cache and sku not in new_products:
                new_products[sku] = {
                    "sku": sku,
                    "name": prod_name,
                    "category": cat,
                    "price": unit_price,
                    "cost": unit_price * 0.6
                }

            order_date = pd.Timestamp.now()
            try:
                if date_col and date_col in row.index and pd.notna(row[date_col]):
                    parsed = pd.to_datetime(row[date_col], errors='coerce')
                    if pd.notna(parsed):
                        order_date = parsed
            except Exception:
                pass

            order_rows.append({
                "cust_code": cust_code,
                "sku": sku,
                "qty": qty,
                "total_price": total_price,
                "order_date": order_date.to_pydatetime() if hasattr(order_date, 'to_pydatetime') else order_date,
            })
        except Exception:
            continue

    # ── 7. Batch-insert new customers ─────────────────────────────────
    if new_customers:
        db.execute(Customer.__table__.insert(), list(new_customers.values()))
        db.flush()
        # Refresh customer cache with new IDs
        customer_cache = {c.customer_code: c.id for c in db.query(Customer.customer_code, Customer.id).all()}

    # ── 8. Batch-insert new products ──────────────────────────────────
    if new_products:
        db.execute(Product.__table__.insert(), list(new_products.values()))
        db.flush()
        # Refresh product cache with new IDs
        product_cache = {p.sku: p.id for p in db.query(Product.sku, Product.id).all()}

    # ── 9. Build and batch-insert orders ──────────────────────────────
    orders = []
    for r in order_rows:
        cust_id = customer_cache.get(r["cust_code"])
        prod_id = product_cache.get(r["sku"])
        if not cust_id or not prod_id:
            continue

        total_cost = r["total_price"] * 0.6
        orders.append({
            "order_date": r["order_date"],
            "product_id": prod_id,
            "customer_id": cust_id,
            "quantity": r["qty"],
            "total_price": r["total_price"],
            "total_cost": total_cost,
            "profit": r["total_price"] - total_cost,
            "upload_id": upload_record.id,
        })

    if orders:
        # Use database raw batch insert for maximum performance
        db.execute(Order.__table__.insert(), orders)

    # ── 10. Finalize ──────────────────────────────────────────────────
    upload_record.status = "SUCCESS"
    upload_record.records_processed = len(orders)
    db.commit()
    db.refresh(upload_record)

    # Clean up temp file
    try:
        os.remove(file_location)
    except OSError:
        pass

    return upload_record
