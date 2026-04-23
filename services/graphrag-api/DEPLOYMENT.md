# GraphRAG API Service - Deployment Guide

This guide covers deployment of the FastAPI GraphRAG service in development, staging, and production environments.

## Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                    Static Web UI                           │
│  (GitHub Pages / localhost:3000)                           │
│                                                            │
│  - Dashboard                                              │
│  - Intelligence Page                                      │
│  - Decision Pages                                         │
│  - Artifact Browser                                       │
└──────────────────┬─────────────────────────────────────────┘
                   │ HTTP + CORS
                   ▼
┌────────────────────────────────────────────────────────────┐
│            FastAPI GraphRAG Service                        │
│            (localhost:8001 / cloud deployment)            │
│                                                            │
│  Endpoints:                                               │
│  - POST /api/graphrag/ingest/*                           │
│  - POST /api/graphrag/query                              │
│  - GET  /api/graphrag/status                             │
│  - GET  /api/graphrag/health                             │
│  - POST /api/graphrag/setup                              │
└──────────────────┬─────────────────────────────────────────┘
                   │ Neo4j Driver
                   ▼
┌────────────────────────────────────────────────────────────┐
│              Neo4j Graph Database                          │
│         (localhost:7687 / cloud deployment)               │
│                                                            │
│  - Knowledge Graph                                        │
│  - Vector Embeddings                                      │
│  - Cypher Indexes                                         │
│  - LLM-Generated Summaries                                │
└────────────────────────────────────────────────────────────┘
```

## Local Development

### Prerequisites

- Docker & Docker Compose (recommended)
- Python 3.11+
- OpenAI API key

### Setup

1. **Clone & Configure**:
   ```bash
   cd /path/to/status-site
   cp services/graphrag-api/.env.example services/graphrag-api/.env
   # Edit .env with your API key and Neo4j password
   ```

2. **Start Services**:
   ```bash
   docker-compose up -d
   ```

3. **Verify**:
   ```bash
   # Check health
   curl http://localhost:8001/api/graphrag/health

   # Initialize indexes
   curl -X POST http://localhost:8001/api/graphrag/setup

   # Check status
   curl http://localhost:8001/api/graphrag/status
   ```

4. **Access Docs**:
   - Swagger UI: http://localhost:8001/docs
   - ReDoc: http://localhost:8001/redoc
   - Neo4j Browser: http://localhost:7474 (username: neo4j)

### Local Development Without Docker

1. **Install Dependencies**:
   ```bash
   pip install -r services/graphrag-api/requirements.txt
   ```

2. **Start Neo4j Separately**:
   ```bash
   # Option 1: Docker only for Neo4j
   docker run -d \
     --name neo4j-dev \
     -p 7474:7474 -p 7687:7687 \
     -e NEO4J_AUTH=neo4j/password \
     -e NEO4J_ACCEPT_LICENSE_AGREEMENT=yes \
     -e NEO4J_PLUGINS='["apoc"]' \
     neo4j:5-enterprise

   # Option 2: Local Neo4j installation
   # Download from https://neo4j.com/download/
   ```

3. **Start API Server**:
   ```bash
   cd services/graphrag-api
   export OPENAI_API_KEY=your_key_here
   uvicorn app:app --host 0.0.0.0 --port 8001 --reload
   ```

4. **Verify**:
   ```bash
   curl http://localhost:8001/api/graphrag/health
   ```

## Staging Deployment

### Using Docker Compose (Recommended)

```bash
# Build images
docker-compose build

# Start in production mode
docker-compose up -d

# Monitor logs
docker-compose logs -f graphrag-api
docker-compose logs -f neo4j

# Check status
docker-compose ps
```

### Environment Configuration

Create a `.env.staging` file:

```bash
# Copy from .env and adjust for staging
cp .env .env.staging

# Update production values
NEO4J_PASSWORD=secure_staging_password
OPENAI_API_KEY=staging_api_key
LOG_LEVEL=INFO
```

Use it:
```bash
docker-compose --env-file .env.staging up -d
```

### Persistence & Backups

Neo4j data is persisted in Docker volumes:

```bash
# View volumes
docker volume ls | grep neo4j

# Backup database
docker exec neo4j-graphrag \
  bin/neo4j-admin dump \
    --database=neo4j \
    --to=/tmp/neo4j-backup.dump

# Restore database
docker exec neo4j-graphrag \
  bin/neo4j-admin load \
    --from=/tmp/neo4j-backup.dump \
    --database=neo4j \
    --overwrite-destination=true
```

### Health Monitoring

```bash
# Check API health
curl http://localhost:8001/api/graphrag/health

# Monitor Docker resource usage
docker stats graphrag-api neo4j-graphrag

# View detailed logs
docker logs --follow --tail 100 graphrag-api
```

## Production Deployment

### Prerequisites

- Kubernetes cluster (recommended) or managed VM
- Cloud storage for backups (S3, GCS, etc.)
- Managed OpenAI API endpoint or local LLM
- Network security (VPC, firewalls, TLS)
- Monitoring (Prometheus, CloudWatch, Datadog, etc.)

### Cloud Deployment Options

#### Option 1: Kubernetes

```yaml
# services/graphrag-api/k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: graphrag-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: graphrag-api
  template:
    metadata:
      labels:
        app: graphrag-api
    spec:
      containers:
      - name: api
        image: your-registry/graphrag-api:latest
        ports:
        - containerPort: 8001
        env:
        - name: NEO4J_URI
          value: "bolt://neo4j-service:7687"
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: openai-secret
              key: api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/graphrag/health
            port: 8001
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/graphrag/health
            port: 8001
          initialDelaySeconds: 5
          periodSeconds: 5
```

Deploy:
```bash
kubectl apply -f services/graphrag-api/k8s-deployment.yaml
kubectl apply -f services/graphrag-api/k8s-service.yaml
```

#### Option 2: AWS ECS/Fargate

1. **Create ECR Repository**:
   ```bash
   aws ecr create-repository --repository-name graphrag-api
   ```

2. **Build & Push Image**:
   ```bash
   docker build -t graphrag-api services/graphrag-api/
   docker tag graphrag-api:latest \
     your-account-id.dkr.ecr.us-east-1.amazonaws.com/graphrag-api:latest
   docker push \
     your-account-id.dkr.ecr.us-east-1.amazonaws.com/graphrag-api:latest
   ```

3. **Create ECS Task Definition**:
   ```json
   {
     "family": "graphrag-api",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "512",
     "memory": "1024",
     "containerDefinitions": [
       {
         "name": "graphrag-api",
         "image": "your-account-id.dkr.ecr.us-east-1.amazonaws.com/graphrag-api:latest",
         "portMappings": [
           {"containerPort": 8001}
         ],
         "environment": [
           {"name": "NEO4J_URI", "value": "bolt://neo4j-endpoint:7687"}
         ],
         "secrets": [
           {"name": "OPENAI_API_KEY", "valueFrom": "arn:aws:secretsmanager:..."}
         ]
       }
     ]
   }
   ```

4. **Create ECS Service**:
   ```bash
   aws ecs create-service \
     --cluster production \
     --service-name graphrag-api \
     --task-definition graphrag-api:1 \
     --desired-count 2 \
     --load-balancers targetGroupArn=arn:aws:...,containerName=graphrag-api,containerPort=8001
   ```

### Managed Neo4j (Optional)

For production, consider managed Neo4j options:
- **Neo4j Aura**: https://neo4j.com/cloud/aura/
- **AWS Neptune**: https://aws.amazon.com/neptune/
- **Google Cloud Memorystore for Redis**: (alternative for caching)

Configuration with Neo4j Aura:
```bash
# .env.production
NEO4J_URI=neo4j+s://your-instance-id.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_secure_password
```

### Network & Security

1. **TLS/HTTPS**:
   ```bash
   # Using Let's Encrypt with Nginx
   docker run -d \
     --name graphrag-nginx \
     -p 443:443 \
     -v /etc/letsencrypt:/etc/letsencrypt \
     -v /path/to/nginx.conf:/etc/nginx/nginx.conf \
     nginx:latest
   ```

2. **Firewall Rules**:
   - API accessible only from web UI domain
   - Neo4j accessible only from API service
   - No public Neo4j access

3. **CORS Configuration**:
   ```python
   # app.py already has CORS enabled
   # For production, restrict to specific origin:
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-domain.com"],
       allow_credentials=True,
       allow_methods=["POST", "GET"],
       allow_headers=["*"],
   )
   ```

### Monitoring & Logging

1. **Application Logging**:
   ```bash
   # Structured logs
   docker logs graphrag-api --since 10m

   # Export to CloudWatch/Datadog
   # (Use Docker container log drivers)
   ```

2. **Metrics**:
   ```python
   # Add Prometheus metrics to app.py (Phase 2)
   from prometheus_client import Counter, Histogram

   query_count = Counter('graphrag_queries_total', 'Total queries')
   query_duration = Histogram('graphrag_query_duration_seconds', 'Query duration')
   ```

3. **Alerting**:
   - API health endpoint failing
   - Neo4j connection timeout
   - High query latency (>5s)
   - Ingestion backlog growing

## Scaling Considerations

### Horizontal Scaling

- API can scale horizontally (stateless)
- Load balance across multiple API instances
- Share Neo4j backend (single database scales well up to 100M+ nodes)

### Vertical Scaling

- Neo4j heap size: adjust `NEO4J_dbms_memory_heap_maxSize`
- Page cache size: adjust `NEO4J_dbms_memory_pagecache_size`
- API workers: adjust Uvicorn workers parameter

### Caching Layer (Phase 2)

Add Redis for query caching:
```bash
docker run -d --name redis -p 6379:6379 redis:latest
```

Update app.py:
```python
from redis import Redis
cache = Redis(host='redis', port=6379)

@app.post("/api/graphrag/query")
async def query(request: QueryRequest):
    cache_key = f"query:{hash(request.question)}"
    cached = cache.get(cache_key)
    if cached:
        return QueryResponse(**json.loads(cached))
    # ... execute query ...
    cache.setex(cache_key, 3600, json.dumps(...))
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Neo4j connection timeout | Neo4j not running or unreachable | Check `docker-compose ps`, verify network connectivity |
| API returns 503 | Neo4j unavailable | Restart Neo4j: `docker-compose restart neo4j` |
| Ingestion slow | Large documents, slow network | Use async endpoints, monitor Neo4j resources |
| Query results poor | Insufficient training data | Ingest more documents, adjust retrieval strategy |
| High memory usage | Large graph, insufficient page cache | Increase memory allocation or partition data |

### Debug Commands

```bash
# View Neo4j logs
docker logs neo4j-graphrag --tail 50

# Execute Cypher directly
docker exec neo4j-graphrag cypher-shell -u neo4j -p password \
  "MATCH (n) RETURN count(n) AS nodes"

# Check API metrics
curl http://localhost:8001/metrics (Phase 2)

# Profile slow queries
docker exec neo4j-graphrag cypher-shell -u neo4j -p password \
  "EXPLAIN MATCH (n) RETURN n LIMIT 10"
```

## Rollback & Recovery

### Database Rollback

```bash
# Create backup before major changes
docker exec neo4j-graphrag \
  bin/neo4j-admin dump \
    --database=neo4j \
    --to=/backups/neo4j-pre-upgrade.dump

# Restore if needed
docker stop neo4j
docker-compose up -d
docker exec neo4j-graphrag \
  bin/neo4j-admin load \
    --from=/backups/neo4j-pre-upgrade.dump \
    --database=neo4j \
    --overwrite-destination=true
```

### Service Rollback

```bash
# Revert to previous Docker image
docker-compose down
docker image rm graphrag-api:latest
docker pull your-registry/graphrag-api:v1.0.0
docker-compose up -d
```

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| API Health Check | <100ms | Should be instant |
| Query Latency | <2s | Excluding LLM inference |
| Ingestion Speed | >1MB/s | Depends on network/disk |
| Uptime | 99.9% | 43 minutes/month downtime |
| Neo4j Memory | <2GB heap | Adjust for workload |

## Next Steps

- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Configure automated backups
- [ ] Implement caching layer (Redis)
- [ ] Add API authentication (OAuth, API keys)
- [ ] Set up CI/CD for deployments
- [ ] Load testing & performance tuning
- [ ] Disaster recovery plan

---

**Version**: 1.0.0  
**Last Updated**: 2026-04-22
