from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import Token

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(login_data: LoginRequest, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    
    # Self-heal/seed user if they don't exist or have the old "mock" string in the database
    if not user and login_data.email == "demo@example.com":
        user = User(
            email="demo@example.com",
            hashed_password=get_password_hash("demo123"),
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user and user.email == "demo@example.com" and user.hashed_password == "mock":
        user.hashed_password = get_password_hash("demo123")
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "success": True,
        "data": {
            "token": access_token,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": "Demo User",
                "createdAt": "2023-01-01T00:00:00Z"
            }
        }
    }

@router.get("/profile")
def get_profile(current_user: User = Depends(deps.get_current_active_user)):
    return {
        "success": True,
        "data": {
            "id": str(current_user.id),
            "email": current_user.email,
            "name": "Demo User",
            "createdAt": "2023-01-01T00:00:00Z"
        }
    }
