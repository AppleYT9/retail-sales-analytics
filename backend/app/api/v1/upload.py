from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.services.upload_service import process_upload
from app.models.user import User
from app.models.analytics import Upload
from app.models.order import Order
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.upload import UploadResponse
from pydantic import BaseModel

router = APIRouter()

class BulkDeleteRequest(BaseModel):
    ids: list[int]

@router.post("", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    mapping: str | None = Form(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    try:
        import json
        mapping_dict = json.loads(mapping) if mapping else None
        upload_record = await process_upload(file, db, current_user, mapping_dict)
        return upload_record
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history", response_model=list[UploadResponse])
def get_upload_history(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    uploads = db.query(Upload).order_by(Upload.uploaded_at.desc()).limit(20).all()
    return uploads

@router.delete("/{upload_id}")
def delete_upload(
    upload_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    upload = db.query(Upload).filter(Upload.id == upload_id).first()
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    # Delete associated orders
    db.query(Order).filter(Order.upload_id == upload_id).delete(synchronize_session=False)
    
    # Delete upload record
    db.delete(upload)
    db.commit()
    return {"success": True, "message": f"Upload {upload_id} and its associated orders deleted successfully."}

@router.post("/bulk-delete")
def bulk_delete_uploads(
    request_data: BulkDeleteRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    uploads = db.query(Upload).filter(Upload.id.in_(request_data.ids)).all()
    if not uploads:
        raise HTTPException(status_code=404, detail="No uploads found to delete")
    
    # Delete associated orders
    db.query(Order).filter(Order.upload_id.in_(request_data.ids)).delete(synchronize_session=False)
    
    # Delete upload records
    for upload in uploads:
        db.delete(upload)
    
    db.commit()
    return {"success": True, "message": f"Successfully deleted {len(uploads)} uploads and their associated orders."}

@router.get("/{upload_id}/data")
def get_upload_data(
    upload_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    upload = db.query(Upload).filter(Upload.id == upload_id).first()
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    # Fetch orders associated with this upload
    results = db.query(
        Order.id,
        Order.order_date,
        Order.quantity,
        Order.total_price,
        Product.name.label("product_name"),
        Product.category.label("category"),
        Customer.customer_code.label("customer_code"),
        Customer.region.label("region")
    ).join(Product, Order.product_id == Product.id)\
     .join(Customer, Order.customer_id == Customer.id)\
     .filter(Order.upload_id == upload_id)\
     .order_by(Order.order_date.desc())\
     .limit(100).all()
     
    data = []
    for r in results:
        data.append({
            "id": r.id,
            "order_date": r.order_date.isoformat() if r.order_date else None,
            "quantity": r.quantity,
            "total_price": r.total_price,
            "product_name": r.product_name,
            "category": r.category,
            "customer_code": r.customer_code,
            "region": r.region
        })
        
    return {
        "success": True,
        "filename": upload.filename,
        "records_processed": upload.records_processed,
        "uploaded_at": upload.uploaded_at.isoformat() if upload.uploaded_at else None,
        "data": data
    }
