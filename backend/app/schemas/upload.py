from datetime import datetime
from pydantic import BaseModel

class UploadResponse(BaseModel):
    id: int
    filename: str
    status: str
    records_processed: int
    uploaded_at: datetime

    model_config = {"from_attributes": True}
