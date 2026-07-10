from pydantic import BaseModel
from typing import List, Dict, Any

class ForecastRequest(BaseModel):
    periods: int | None = None
    horizon: int | None = None
    upload_id: int | None = None

class ForecastResponse(BaseModel):
    dates: List[str]
    predictions: List[float]
    lower_bounds: List[float]
    upper_bounds: List[float]

class AnomalyResponse(BaseModel):
    total_anomalies: int
    anomalies: List[Dict[str, Any]]

class SegmentationResponse(BaseModel):
    clusters: int
    distribution: Dict[str, int]
