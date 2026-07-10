from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import get_db
from app.models.user import User, RoleEnum
from app.schemas.token import TokenData

from app.core.security import get_password_hash

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_current_user(db: Session = Depends(get_db)) -> User:
    # Open-source mode: Bypass JWT validation and always return a default user
    user = db.query(User).filter(User.email == "demo@example.com").first()
    if not user:
        user = User(
            email="demo@example.com",
            hashed_password=get_password_hash("demo123"),
            is_active=True,
            role=RoleEnum.ADMIN
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_role(allowed_roles: list[RoleEnum]):
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker
