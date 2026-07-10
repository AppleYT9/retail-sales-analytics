from fastapi import APIRouter, Depends, Response, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.api import deps
from app.services import report_service
from app.models.user import User

router = APIRouter()

@router.get("/csv")
def download_csv_report(
    type: str = Query("summary"),
    upload_id: int | None = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    csv_data = report_service.generate_csv_report(db, type=type, upload_id=upload_id)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={type}_report.csv"}
    )

@router.get("/excel")
def download_excel_report(
    type: str = Query("summary"),
    upload_id: int | None = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    excel_data = report_service.generate_excel_report(db, type=type, upload_id=upload_id)
    return StreamingResponse(
        excel_data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={type}_report.xlsx"}
    )

@router.get("/pdf")
def download_pdf_report(
    type: str = Query("summary"),
    upload_id: int | None = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    pdf_data = report_service.generate_pdf_report(db, type=type, upload_id=upload_id)
    return StreamingResponse(
        pdf_data,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={type}_report.pdf"}
    )
