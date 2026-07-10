import os
import csv
from io import StringIO, BytesIO
from sqlalchemy.orm import Session
from app.services.analytics_service import get_dashboard_stats

canvas = None
letter = None
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
except ImportError:
    pass

openpyxl = None
try:
    import openpyxl
except ImportError:
    pass

def generate_csv_report(db: Session, type: str = "summary", upload_id: int | None = None) -> str:
    from app.models.order import Order
    from app.models.product import Product
    from app.models.customer import Customer
    from app.models.inventory import Inventory
    
    output = StringIO()
    writer = csv.writer(output)
    
    if type == "summary" or type == "executive":
        stats = get_dashboard_stats(db, upload_id=upload_id)
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Total Revenue", stats.total_revenue])
        writer.writerow(["Total Profit", stats.total_profit])
        writer.writerow(["Total Orders", stats.total_orders])
        writer.writerow(["Total Customers", stats.total_customers])
        
    elif type == "sales":
        query = db.query(
            Order.order_date, Product.category, Product.name,
            Order.quantity, Product.price, Order.total_price, Customer.region
        ).join(Product, Order.product_id == Product.id).join(Customer, Order.customer_id == Customer.id)
        
        if upload_id is not None:
            query = query.filter(Order.upload_id == upload_id)
            
        results = query.all()
        writer.writerow(["Date", "Category", "Product", "Quantity", "Price", "Revenue", "Region"])
        for r in results:
            writer.writerow([r[0].strftime('%Y-%m-%d') if r[0] else "", r[1], r[2], r[3], r[4], r[5], r[6] or "Unknown"])
            
    elif type == "forecast":
        from app.ml.forecast import generate_forecast
        forecast = generate_forecast(db, periods=30, upload_id=upload_id)
        writer.writerow(["Date", "Predicted Sales", "Confidence Lower", "Confidence Upper"])
        for i in range(len(forecast.dates)):
            writer.writerow([forecast.dates[i], forecast.predictions[i], forecast.lower_bounds[i], forecast.upper_bounds[i]])
            
    elif type == "inventory":
        query = db.query(
            Product.sku, Product.name, Product.category, Inventory.stock_level, Product.price
        ).join(Inventory, Product.id == Inventory.product_id)
        
        if upload_id is not None:
            query = query.filter(Inventory.product_id.in_(db.query(Order.product_id).filter(Order.upload_id == upload_id)))
            
        results = query.all()
        writer.writerow(["SKU", "Product Name", "Category", "Stock Level", "Price"])
        for r in results:
            writer.writerow([r[0], r[1], r[2], r[3], r[4]])
            
    return output.getvalue()

def generate_excel_report(db: Session, type: str = "summary", upload_id: int | None = None) -> BytesIO:
    if openpyxl is None:
        raise ValueError("openpyxl is not installed on this server. Cannot generate Excel reports.")
        
    from app.models.order import Order
    from app.models.product import Product
    from app.models.customer import Customer
    from app.models.inventory import Inventory
    
    wb = openpyxl.Workbook()
    ws = wb.active
    
    if type == "summary" or type == "executive":
        ws.title = "Dashboard Summary"
        stats = get_dashboard_stats(db, upload_id=upload_id)
        ws.append(["Metric", "Value"])
        ws.append(["Total Revenue", stats.total_revenue])
        ws.append(["Total Profit", stats.total_profit])
        ws.append(["Total Orders", stats.total_orders])
        ws.append(["Total Customers", stats.total_customers])
        
    elif type == "sales":
        ws.title = "Sales Analysis"
        ws.append(["Date", "Category", "Product", "Quantity", "Price", "Revenue", "Region"])
        query = db.query(
            Order.order_date, Product.category, Product.name,
            Order.quantity, Product.price, Order.total_price, Customer.region
        ).join(Product, Order.product_id == Product.id).join(Customer, Order.customer_id == Customer.id)
        
        if upload_id is not None:
            query = query.filter(Order.upload_id == upload_id)
            
        results = query.all()
        for r in results:
            ws.append([r[0].strftime('%Y-%m-%d') if r[0] else "", r[1], r[2], r[3], r[4], r[5], r[6] or "Unknown"])
            
    elif type == "forecast":
        ws.title = "Forecast Report"
        ws.append(["Date", "Predicted Sales", "Confidence Lower", "Confidence Upper"])
        from app.ml.forecast import generate_forecast
        forecast = generate_forecast(db, periods=30, upload_id=upload_id)
        for i in range(len(forecast.dates)):
            ws.append([forecast.dates[i], forecast.predictions[i], forecast.lower_bounds[i], forecast.upper_bounds[i]])
            
    elif type == "inventory":
        ws.title = "Inventory Levels"
        ws.append(["SKU", "Product Name", "Category", "Stock Level", "Price"])
        query = db.query(
            Product.sku, Product.name, Product.category, Inventory.stock_level, Product.price
        ).join(Inventory, Product.id == Inventory.product_id)
        
        if upload_id is not None:
            query = query.filter(Inventory.product_id.in_(db.query(Order.product_id).filter(Order.upload_id == upload_id)))
            
        results = query.all()
        for r in results:
            ws.append([r[0], r[1], r[2], r[3], r[4]])
            
    output = BytesIO()
    wb.save(output)
    output.seek(0)
    return output

def generate_pdf_report(db: Session, type: str = "summary", upload_id: int | None = None) -> BytesIO:
    if canvas is None or letter is None:
        raise ValueError("reportlab is not installed on this server. Cannot generate PDF reports.")
        
    from app.models.order import Order
    from app.models.product import Product
    from app.models.customer import Customer
    from app.models.inventory import Inventory
    
    stats = get_dashboard_stats(db, upload_id=upload_id)
    output = BytesIO()
    c = canvas.Canvas(output, pagesize=letter)
    
    # Header styling
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, 750, f"Retail Sales Analytics - {type.upper()} Report")
    c.setFont("Helvetica", 10)
    
    if type == "summary" or type == "executive":
        c.drawString(100, 700, f"Total Revenue: ${stats.total_revenue:.2f}")
        c.drawString(100, 680, f"Total Profit: ${stats.total_profit:.2f}")
        c.drawString(100, 660, f"Total Orders: {stats.total_orders}")
        c.drawString(100, 640, f"Total Customers: {stats.total_customers}")
        
    elif type == "sales":
        query = db.query(
            Order.order_date, Product.name, Order.quantity, Order.total_price
        ).join(Product, Order.product_id == Product.id)
        
        if upload_id is not None:
            query = query.filter(Order.upload_id == upload_id)
            
        results = query.limit(25).all()
        
        y = 700
        c.drawString(100, y, "Date | Product Name | Qty | Revenue")
        c.drawString(100, y - 5, "----------------------------------------------------------------------")
        y -= 20
        for r in results:
            date_str = r[0].strftime('%Y-%m-%d') if r[0] else ""
            c.drawString(100, y, f"{date_str} | {r[1][:25]} | {r[2]} | ${r[3]:.2f}")
            y -= 20
            
    elif type == "forecast":
        from app.ml.forecast import generate_forecast
        forecast = generate_forecast(db, periods=25, upload_id=upload_id)
        y = 700
        c.drawString(100, y, "Date | Predicted Revenue | Confidence Bounds")
        c.drawString(100, y - 5, "----------------------------------------------------------------------")
        y -= 20
        for i in range(len(forecast.dates)):
            c.drawString(100, y, f"{forecast.dates[i]} | ${forecast.predictions[i]:.2f} | (${forecast.lower_bounds[i]:.2f} - ${forecast.upper_bounds[i]:.2f})")
            y -= 20
            
    elif type == "inventory":
        query = db.query(
            Product.sku, Product.name, Inventory.stock_level
        ).join(Inventory, Product.id == Inventory.product_id)
        
        if upload_id is not None:
            query = query.filter(Inventory.product_id.in_(db.query(Order.product_id).filter(Order.upload_id == upload_id)))
            
        results = query.limit(25).all()
        y = 700
        c.drawString(100, y, "SKU | Product Name | Stock Level")
        c.drawString(100, y - 5, "----------------------------------------------------------------------")
        y -= 20
        for r in results:
            c.drawString(100, y, f"{r[0]} | {r[1][:30]} | {r[2]} units")
            y -= 20
            
    c.save()
    output.seek(0)
    return output
