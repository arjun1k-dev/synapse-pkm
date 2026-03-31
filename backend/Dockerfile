# Use Python 3.12 Slim (Lightweight)
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies (needed for Postgres)
RUN apt-get update && apt-get install -y gcc libpq-dev

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port
EXPOSE 8000

# Command to run the app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]