# 📊 Retail Sales Analytics & Machine Learning Platform

<p align="center">

<a href="https://www.linkedin.com/posts/madhan-senthilkumar_machinelearning-datascience-fastapi-ugcPost-7481699101168787456-u63L/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFWGGIsBZb4-NALu7hN4jvqbSclky7KsWBI">
<img src="https://img.shields.io/badge/🎥_Watch_Project_Demo_on_LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white">
</a>

A production-grade, full-stack analytics platform built with **Next.js 16 (React 19)** and **FastAPI (Python)**, backed by a persistent **SQLite** database. 

This platform integrates time-series sales forecasting, unsupervised customer segmentation, and transaction anomaly detection pipelines using **scikit-learn** and **Facebook Prophet**.

---

## 🌟 Key Features

### 1. Interactive Machine Learning Hub
* **K-Means Customer Clustering**: Segments customer bases using Recency, Frequency, and Monetary (RFM) transaction weights, visualized with interactive clustering distributions.
* **Isolation Forest Anomaly Detection**: Automatically scans, flags, and charts transaction outliers (contaminations like pricing abnormalities or bulk purchasing) on an interactive scatter plot of Price vs. Quantity.

### 2. Time-Series Sales Forecasting
* Powered by **Facebook Prophet** (and a baseline Seasonal Autoregression fallback).
* Generates daily predictive sales charts with confidence bands ($95\%$ margin) and horizon tuners.
* Displays model health statistics: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and Coefficient of Determination ($R^2$ fit).

### 3. Dynamic Schema Column Mapper
* Upload any transaction CSV file.
* Map varying header columns (e.g. `"Date"`, `"Item Name"`, `"Cost"`) directly to the system database attributes.

### 4. Custom Business Reports
* Generate and download Executive Summaries, Sales Analyses, and Forecasts in **PDF**, **Excel**, or **CSV** formats on-demand.

---

## 🛠️ Tech Stack
* **Frontend**: Next.js 16 (React 19), Recharts (for charts), Tailwind CSS, Lucide Icons, Axios.
* **Backend**: FastAPI, SQLAlchemy (ORM), Uvicorn, Pandas.
* **Machine Learning**: Facebook Prophet, Scikit-learn (K-Means, Isolation Forest).
* **Database**: SQLite (persisted natively in container volumes to resolve file locking).
* **Orchestration & DevOps**: Docker, Docker Compose (production multi-stage builds).

---

## 🚀 Local Quickstart (Host)

### Prerequisites
* Node.js (v18+) & `pnpm`
* Docker (for the backend API)

### 1. Start the Backend API (Docker)
```bash
cd backend
docker compose up -d
```
The backend API exposes port `3002`.

### 2. Start the Frontend client (Next.js)
```bash
# From the root directory
pnpm install
pnpm build
pnpm start
```
The frontend is optimized and runs on [http://localhost:3000](http://localhost:3000).

---

## 📦 Docker Compose Quickstart (Single-Command Run)
To run both the backend API and frontend client together in containerized production mode:
```bash
docker compose up -d --build
```
* **Frontend**: [http://localhost:3000](http://localhost:3000)
* **Backend API**: [http://localhost:3002](http://localhost:3002)
* **Database**: Persisted inside the Docker named volume `api_data`.

---

## 🌐 Production Deployment

For detailed deployment steps on **VPS (AWS/DigitalOcean)** or **PaaS (Railway/Render)**, consult the [Deployment Guide](deployment_guide.md).

### Quick Steps for Railway.app:
1. Push the code to your GitHub repo.
2. Deploy `backend` service pointing to the `./backend` directory, add a **Persistent Volume** mounted at `/data`, and set:
   * `DATABASE_URL` = `sqlite:////data/retail_analytics.db`
   * `PORT` = `3002`
3. Deploy `frontend` service pointing to the `./` root directory, and set:
   * `NEXT_PUBLIC_API_URL` = `https://<your-backend-domain>/api/v1`
4. Expose public domains for both and run!
