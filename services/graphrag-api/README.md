# Neo4j GraphRAG API Service

FastAPI wrapper for the Neo4j GraphRAG pipeline, providing REST endpoints for knowledge graph ingestion, querying, and management.

## Features

- 📥 **Document Ingestion**: Text, PDF, and directory-based ingestion with automatic knowledge graph construction
- 🔍 **Multi-Strategy Querying**: Vector, Cypher, Hybrid, and Vector-Cypher retrieval strategies
- 📊 **Real-time Status**: Graph statistics and index monitoring
- 🚀 **Async Processing**: Background tasks for large document ingestions
- 🔒 **CORS Enabled**: Ready for web UI integration
- 📖 **Auto-generated Docs**: Interactive Swagger UI at `/docs`

## Quick Start

### 1. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
# - NEO4J_PASSWORD: Set a secure password
# - OPENAI_API_KEY: Add your OpenAI API key
```

### 2. Docker Compose (Recommended)

```bash
cd /path/to/status-site
docker-compose up -d
```

This starts:
- Neo4j at `http://localhost:7474` (browser) and `bolt://localhost:7687` (driver)
- GraphRAG API at `http://localhost:8001`

### 3. Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Start API (requires Neo4j running separately)
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

## API Endpoints

### Health & Status

```bash
# Health check
curl http://localhost:8001/api/graphrag/health

# Get graph statistics
curl http://localhost:8001/api/graphrag/status
```

### Setup

```bash
# Initialize indexes
curl -X POST http://localhost:8001/api/graphrag/setup
```

### Ingestion

**Text**:
```bash
curl -X POST "http://localhost:8001/api/graphrag/ingest/text?text=Your%20text%20content%20here"
```

**PDF**:
```bash
curl -X POST \
  -F "file=@document.pdf" \
  http://localhost:8001/api/graphrag/ingest/pdf
```

**Directory**:
```bash
curl -X POST \
  "http://localhost:8001/api/graphrag/ingest/directory?directory=/path/to/docs&glob_pattern=*.pdf"
```

### Querying

```bash
curl -X POST http://localhost:8001/api/graphrag/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the main governance gaps?",
    "strategy": "vector_cypher",
    "top_k": 5,
    "return_context": true
  }'
```

**Available Strategies**:
- `vector`: Pure vector similarity search
- `cypher`: Graph pattern matching only
- `hybrid`: Vector OR Cypher union
- `vector_cypher`: Vector AND Cypher intersection (recommended)

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEO4J_URI` | `bolt://neo4j:7687` | Neo4j driver URI |
| `NEO4J_USERNAME` | `neo4j` | Neo4j username |
| `NEO4J_PASSWORD` | - | Neo4j password (required) |
| `NEO4J_DATABASE` | `neo4j` | Database name |
| `LLM_MODEL` | `gpt-4-turbo-preview` | OpenAI model |
| `LLM_TEMPERATURE` | `0.7` | Temperature for LLM generation |
| `LLM_MAX_TOKENS` | `1024` | Max tokens in response |
| `OPENAI_API_KEY` | - | OpenAI API key (required) |
| `LOG_LEVEL` | `INFO` | Logging level |

## Development

### Testing Endpoints

Use the interactive Swagger UI:
```
http://localhost:8001/docs
```

Or ReDoc:
```
http://localhost:8001/redoc
```

### Async Processing

Large document ingestions run in background tasks. The endpoint returns immediately with a job status, and processing continues asynchronously.

### Error Handling

All endpoints return consistent error responses:

```json
{
  "detail": "Error description"
}
```

HTTP Status Codes:
- `200`: Success
- `400`: Bad request (validation error)
- `500`: Server error (pipeline failure)
- `503`: Degraded (Neo4j unavailable)

## Integration with Web UI

The API is CORS-enabled for browser requests. To integrate with the web UI:

```javascript
// Query example
const response = await fetch('http://localhost:8001/api/graphrag/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'Your question here',
    strategy: 'vector_cypher',
    top_k: 5,
    return_context: false
  })
});
const data = await response.json();
console.log(data.answer);
```

## Architecture

```
┌─────────────────────┐
│   Web Browser UI    │ (localhost:3000 or GitHub Pages)
└──────────┬──────────┘
           │ HTTP + CORS
           ▼
┌─────────────────────┐
│  FastAPI Service    │ (localhost:8001)
│ - Ingestion         │
│ - Query             │
│ - Status            │
└──────────┬──────────┘
           │ Neo4j Driver
           ▼
┌─────────────────────┐
│    Neo4j Graph      │ (localhost:7687)
│  - Knowledge Graph  │
│  - Vector Indexes   │
│  - Cypher Queries   │
└─────────────────────┘
```

## Troubleshooting

### Neo4j Connection Failed
```
✓ Check docker-compose is running: docker-compose ps
✓ Verify password: docker logs neo4j-graphrag | grep "password"
✓ Wait for Neo4j startup: check health endpoint
```

### API Not Responding
```
✓ Check service logs: docker logs graphrag-api
✓ Verify OpenAI API key is set
✓ Ensure Neo4j is healthy: curl http://localhost:7474
```

### Ingestion Slow
```
✓ Large PDFs/directories are processed asynchronously
✓ Check Neo4j logs for query performance
✓ Monitor memory usage: docker stats
```

## Performance Notes

- **First Query**: May be slow while LLM context is loading (~2-5 seconds)
- **Large Documents**: Async processing ensures non-blocking ingestion
- **Memory**: Neo4j allocated 2GB heap + 1GB page cache by default (adjust in docker-compose.yml)

## References

- **Pipeline Source**: `neo4j_graphrag_pipeline/`
- **Neo4j GraphRAG Docs**: https://neo4j.com/docs/graphrag-python/
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Docker Compose**: [docker-compose.yml](../../docker-compose.yml)

---

**Version**: 1.0.0  
**Status**: MVP
