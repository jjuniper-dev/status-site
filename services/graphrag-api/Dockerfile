FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and pipeline
COPY app.py .
COPY ../../neo4j_graphrag_pipeline /app/neo4j_graphrag_pipeline

# Create upload directory
RUN mkdir -p /tmp/graphrag_uploads

# Expose port
EXPOSE 8001

# Run API server
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
