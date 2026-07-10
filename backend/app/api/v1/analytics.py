from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.models.order import Order
from app.models.customer import Customer
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.user import User

router = APIRouter()

@router.get("/sales")
def get_sales_analytics(
    db: Session = Depends(deps.get_db),
    range_type: str | None = Query("30days", alias="range"),
    upload_id: int | None = Query(None),
    skip: int = 0,
    limit: int = 200,
    current_user: User = Depends(deps.get_current_active_user)
):
    query = db.query(
        Order.id,
        Order.order_date,
        Product.category,
        Product.name,
        Order.quantity,
        Product.price,
        Order.total_price,
        Customer.region
    ).join(Product, Order.product_id == Product.id).join(Customer, Order.customer_id == Customer.id)
    
    if upload_id is not None:
        query = query.filter(Order.upload_id == upload_id)
    
    from sqlalchemy import func
    from datetime import timedelta
    
    max_date = db.query(func.max(Order.order_date)).scalar()
    if max_date and range_type:
        end = max_date
        if range_type == "7days":
            start = end - timedelta(days=7)
            query = query.filter(Order.order_date >= start, Order.order_date <= end)
        elif range_type == "30days":
            start = end - timedelta(days=30)
            query = query.filter(Order.order_date >= start, Order.order_date <= end)
        elif range_type == "90days":
            start = end - timedelta(days=90)
            query = query.filter(Order.order_date >= start, Order.order_date <= end)
        elif range_type == "1year":
            start = end - timedelta(days=365)
            query = query.filter(Order.order_date >= start, Order.order_date <= end)
        elif range_type == "all":
            pass
        elif range_type.isdigit() and len(range_type) == 4:
            year = int(range_type)
            from datetime import datetime
            start = datetime(year, 1, 1)
            end_yr = datetime(year, 12, 31, 23, 59, 59)
            query = query.filter(Order.order_date >= start, Order.order_date <= end_yr)
            
    results = query.offset(skip).limit(limit).all()
    
    sales = []
    for r in results:
        sales.append({
            "id": str(r[0]),
            "date": r[1].isoformat() if r[1] else "",
            "category": r[2],
            "product": r[3],
            "quantity": r[4],
            "price": r[5],
            "revenue": r[6],
            "region": r[7] or "Unknown"
        })
    return sales

@router.get("/customers")
def get_customer_analytics(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
):
    customers = db.query(Customer).offset(skip).limit(limit).all()
    return customers

@router.get("/products")
def get_product_analytics(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
):
    products = db.query(Product).offset(skip).limit(limit).all()
    return products

@router.get("/inventory")
def get_inventory_analytics(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
):
    inventory = db.query(Inventory).offset(skip).limit(limit).all()
    return inventory
