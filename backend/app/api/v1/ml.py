from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.schemas.ml import ForecastRequest, ForecastResponse, AnomalyResponse, SegmentationResponse
from app.ml.forecast import generate_forecast
from app.ml.anomaly import detect_anomalies
from app.ml.segmentation import segment_customers

router = APIRouter()

@router.post("/forecast", response_model=ForecastResponse)
def get_sales_forecast(
    request: ForecastRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    periods = request.periods or request.horizon or 30
    return generate_forecast(db, periods=periods, upload_id=request.upload_id)

@router.post("/anomaly-detection", response_model=AnomalyResponse)
def get_anomaly_detection(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return detect_anomalies(db)

@router.post("/customer-segmentation", response_model=SegmentationResponse)
def get_customer_segmentation(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return segment_customers(db)
