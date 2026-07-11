from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine
from app.models.base import Base
# Register models
from app.models.user import User
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.models.analytics import SalesForecast, Report, Upload, AuditLog
from app.models.inventory import Inventory

import os
print(f"=== DB CONFIG DEBUG ===")
print(f"DATABASE_URL: {settings.DATABASE_URL}")
if "sqlite" in settings.DATABASE_URL:
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    # Handle absolute vs relative path
    db_dir = os.path.dirname(db_path) if db_path.startswith("/") else os.path.dirname(os.path.abspath(db_path))
    print(f"Parsed DB Path: {db_path}")
    print(f"Target DB Directory: {db_dir}")
    print(f"Directory Exists: {os.path.exists(db_dir)}")
    if os.path.exists(db_dir):
        print(f"Directory Writeable: {os.access(db_dir, os.W_OK)}")
        # Test writing a dummy file
        try:
            test_file = os.path.join(db_dir, ".write_test")
            with open(test_file, "w") as f:
                f.write("test")
            os.remove(test_file)
            print("Write test: SUCCESS")
        except Exception as e:
            print(f"Write test: FAILED - {e}")
print(f"=========================")

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend for Retail Sales Analytics Platform",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://retail-sales-analytics-production.up.railway.app"
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

from app.api.v1 import auth, upload, dashboard, analytics, ml, reports

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["Upload"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(ml.router, prefix="/api/v1/ml", tags=["Machine Learning"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
