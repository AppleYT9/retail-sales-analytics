from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.services import analytics_service
from app.schemas.analytics import DashboardStats, TopProduct, RegionalSales
from app.models.user import User

router = APIRouter()

@router.get("", response_model=DashboardStats)
def get_dashboard(
    upload_id: int | None = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return analytics_service.get_dashboard_stats(db, upload_id=upload_id)

@router.get("/top-products", response_model=list[TopProduct])
def get_dashboard_top_products(
    upload_id: int | None = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return analytics_service.get_top_products(db, upload_id=upload_id)

@router.get("/regional-sales", response_model=list[RegionalSales])
def get_dashboard_regional_sales(
    upload_id: int | None = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return analytics_service.get_sales_by_region(db, upload_id=upload_id)

@router.get("/daily-revenue")
def get_daily_revenue(
    upload_id: int | None = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return analytics_service.get_daily_revenue(db, upload_id=upload_id)

@router.get("/category-sales")
def get_category_sales(
    upload_id: int | None = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return analytics_service.get_category_sales(db, upload_id=upload_id)

