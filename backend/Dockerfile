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

# Copy template db to persistent volume on start and run Uvicorn on port 3001 with system diagnostics
CMD ["sh", "-c", "echo '=== SYSTEM DIAGNOSTICS ===' && echo 'User:' $(whoami) && ls -ld /app/data && (cp /app/retail_analytics.db /app/data/retail_analytics.db || echo 'Copy failed') && ls -la /app/data && uvicorn app.main:app --host 0.0.0.0 --port 3001"]
