import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.api.deps import get_db
from app.models.base import Base

# Setup temporary SQLite database for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_temp.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop tables after tests finish
    Base.metadata.drop_all(bind=engine)
    import os
    if os.path.exists("./test_temp.db"):
        os.remove("./test_temp.db")

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_register():
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "newuser@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "newuser@example.com"

def test_login():
    # Login with the registered user
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "newuser@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "token" in response.json()["data"]
