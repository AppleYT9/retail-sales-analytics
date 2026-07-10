from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_revenue: float
    total_profit: float
    total_orders: int
    total_customers: int
    monthly_growth: float

class TopProduct(BaseModel):
    name: str
    revenue: float

class RegionalSales(BaseModel):
    region: str
    revenue: float
