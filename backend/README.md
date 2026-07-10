# Retail Sales Analytics Platform - Backend

This is the production-ready backend for the Retail Sales Analytics Platform. It is built using FastAPI, PostgreSQL, SQLAlchemy 2.0, and various Machine Learning libraries.

## Features
- **Data Upload & Cleaning**: Upload CSV/Excel files and automatically clean and store the data.
- **Analytics & Dashboards**: Endpoints to fetch KPIs and charts.
- **Machine Learning**: Sales Forecasting (Prophet), Anomaly Detection (Isolation Forest), Customer Segmentation (KMeans).
- **Reporting**: Export dashboards and metrics to PDF, Excel, and CSV.
- **Authentication**: JWT-based authentication with Role-Based Access Control (Admin, Manager, Analyst).

## Setup & Running with Docker

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Spin up the Database and API using Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

3. Run Alembic Migrations:
   ```bash
   docker-compose exec api alembic revision --autogenerate -m "Initial migration"
   docker-compose exec api alembic upgrade head
   ```

4. API Documentation:
   Access the Swagger UI at: `http://localhost:3001/docs`

## Architecture
- **Clean Architecture**: Business logic is separated into `services/` and models/schemas are strictly decoupled.
- **Dependency Injection**: FastAPI `Depends` handles database sessions and user auth.
- **Async Endpoints**: Prepared for high concurrency.
