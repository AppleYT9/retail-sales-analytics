FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -c "import pathlib, prophet; p = pathlib.Path(prophet.__file__).parent / 'stan_model'; next(p.glob('cmdstan-*')).joinpath('makefile').touch()"

# Copy source code
COPY . .

# Expose port (Railway will override this with $PORT env variable)
EXPOSE 3001

# Copy template db to persistent volume on start and run Uvicorn on port 3001
CMD ["sh", "-c", "mkdir -p /data && (test -f /data/retail_analytics.db || cp /app/retail_analytics.db /data/retail_analytics.db) && uvicorn app.main:app --host 0.0.0.0 --port 3001"]
