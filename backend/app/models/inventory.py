from datetime import datetime
from sqlalchemy import Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class Inventory(Base):
    __tablename__ = "inventory"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), unique=True, index=True, nullable=False)
    stock_level: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_restock_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
