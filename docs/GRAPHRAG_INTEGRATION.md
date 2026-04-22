# GraphRAG Integration Guide

End-to-end integration of Neo4j GraphRAG pipeline with the AI Governance Platform web UI.

## Overview

The GraphRAG integration consists of three layers:

```
┌─────────────────────────────────────┐
│  Web UI: graphrag-ui.html           │ (This file)
│  - Ingest tab (text, PDF, directory)│
│  - Query tab (multi-strategy search)│
│  - Explorer tab (graph visualization│
│  - Status tab (health & stats)      │
└────────────────┬────────────────────┘
                 │ HTTP + CORS
                 │ fetch() with JSON
                 ▼
┌─────────────────────────────────────┐
│  Backend Service: services/graphrag-api/│
│  - app.py (FastAPI)                │
│  - 8 REST endpoints                 │
│  - Async document processing        │
│  - Multi-strategy retrieval         │
└────────────────┬────────────────────┘
                 │ Neo4j Driver
                 │ graph queries & writes
                 ▼
┌─────────────────────────────────────┐
│  Database: Neo4j                    │
│  - Knowledge graph nodes            │
│  - Relationship patterns            │
│  - Vector embeddings                │
│  - Full-text indexes                │
└─────────────────────────────────────┘
```

## Frontend Layer: graphrag-ui.html

**Location**: `/graphrag-ui.html`

**Features**:
1. **Ingest Tab**
   - Text ingestion: Paste content, max 50KB
   - PDF upload: Single file, up to 50MB
   - Directory ingestion: Batch process stored PDFs
   - Async processing with background tasks

2. **Query Tab**
   - Natural language questions
   - Retrieval strategy selector:
     - `vector_cypher`: Hybrid (Vector AND Graph) - **Recommended**
     - `vector`: Vector similarity only
     - `cypher`: Graph pattern matching only
     - `hybrid`: Vector OR Graph (union)
   - Result count: 3, 5, 10, or 20 results
   - Context display toggle
   - LLM-synthesized answers

3. **Explorer Tab**
   - Interactive graph visualization (vis.js)
   - Real-time node/edge rendering
   - Node count, relationship count, index stats
   - Pan, zoom, drag interactions

4. **Status Tab**
   - API health check
   - Graph statistics (nodes, relationships)
   - Index status
   - Database initialization trigger

### Implementation Details

**API Endpoint**: `http://localhost:8001/api/graphrag`

**All requests use CORS** (cross-origin enabled on backend):

```javascript
// Example: Query the graph
const response = await fetch('http://localhost:8001/api/graphrag/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'What are governance gaps?',
    strategy: 'vector_cypher',
    top_k: 5,
    return_context: false
  })
});
const data = await response.json();
console.log(data.answer);
```

**Error Handling**:
```javascript
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  // Handle success
} catch (error) {
  // Handle error (API down, network issue, etc.)
  console.error(`Failed: ${error.message}`);
}
```

## Backend Layer: FastAPI Service

**Location**: `services/graphrag-api/`

**Core Files**:
- `app.py`: FastAPI application with 8 endpoints
- `client.py`: Python client library (optional)
- `requirements.txt`: Dependencies (FastAPI, Neo4j, Pydantic)
- `Dockerfile`: Containerization
- `.env`: Configuration (API keys, Neo4j credentials)

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/setup` | Initialize Neo4j indexes |
| POST | `/ingest/text` | Ingest text content |
| POST | `/ingest/pdf` | Upload and ingest PDF |
| POST | `/ingest/directory` | Batch ingest directory |
| POST | `/query` | Query with retrieval |
| GET | `/status` | Graph statistics |
| GET | `/health` | Health check |

### Request/Response Models

**Query Request**:
```json
{
  "question": "What are governance gaps?",
  "strategy": "vector_cypher",
  "top_k": 5,
  "return_context": false
}
```

**Query Response**:
```json
{
  "answer": "Based on the knowledge graph...",
  "context": null
}
```

**Status Response**:
```json
{
  "node_count": 234,
  "relationship_count": 512,
  "indexes": [
    { "name": "idx_embedding_vector", "type": "VECTOR" },
    { "name": "idx_chunk_text", "type": "FULLTEXT" }
  ]
}
```

**Health Response**:
```json
{
  "status": "ok",
  "neo4j_connected": true,
  "nodes": 234
}
```

### Error Responses

All errors return HTTP status code with detail message:

```json
{
  "detail": "Error description"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request (validation error) |
| 500 | Server error (pipeline failure) |
| 503 | Degraded (Neo4j unavailable) |

## Database Layer: Neo4j

**Location**: Docker Compose managed or external instance

**Connection**:
- Bolt URI: `bolt://neo4j:7687` (Docker) or `bolt://localhost:7687` (Local)
- Username: `neo4j`
- Password: Set in `.env`

**Graph Structure**:
```cypher
(Document) -[:CONTAINS]-> (Chunk)
(Chunk) -[:MENTIONS]-> (Entity)
(Entity) -[:RELATED_TO]-> (Entity)
(Chunk) -[:HAS]-> (Embedding)
```

**Indexes**:
- Vector index on Chunk embeddings (for similarity search)
- Full-text index on chunk text (for keyword search)
- Hash index on entity names (for Cypher lookups)

## Running End-to-End

### 1. Start Backend Services

```bash
cd /path/to/status-site
docker-compose up -d
```

Check status:
```bash
docker-compose ps
docker logs graphrag-api
docker logs neo4j-graphrag
```

### 2. Access Frontend

```
http://localhost:3000/graphrag-ui.html
# or (if GitHub Pages):
https://jjuniper-dev.github.io/status-site/graphrag-ui.html
```

### 3. Initialize Database

In Status tab, click "Initialize Database" to create indexes.

### 4. Ingest Documents

In Ingest tab:
- Paste governance documents, architecture notes, policy text
- Upload PDFs
- Or batch ingest from directory

### 5. Query Graph

In Query tab:
- Ask questions about ingested content
- Review answers with retrieved context
- Adjust retrieval strategy if needed

### 6. Explore Graph

In Explorer tab:
- View knowledge graph visualization
- See nodes and relationships extracted from documents
- Monitor growth as documents are ingested

## Integration Points

### Intelligence Page (`intelligence.html`)

Could add a query widget:
```html
<div id="graphrag-query-widget">
  <input type="text" placeholder="Ask about AI governance..." id="q">
  <button onclick="queryGraph()">Ask</button>
  <div id="answer"></div>
</div>

<script>
async function queryGraph() {
  const q = document.getElementById('q').value;
  const res = await fetch('http://localhost:8001/api/graphrag/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: q, strategy: 'vector_cypher', top_k: 3 })
  });
  const data = await res.json();
  document.getElementById('answer').textContent = data.answer;
}
</script>
```

### Decisions Page (`decisions.html`)

Could add context suggestions:
```javascript
// Suggest related decisions when user asks about something
async function suggestContext(topic) {
  const res = await fetch(`http://localhost:8001/api/graphrag/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: `What decisions relate to ${topic}?`,
      strategy: 'vector_cypher',
      top_k: 3,
      return_context: true
    })
  });
  return await res.json();
}
```

### Assessment Pages (`assessments-compare.html`, etc.)

Could add platform assessment suggestions:
```javascript
async function suggestPlatforms(requirement) {
  const res = await fetch(`http://localhost:8001/api/graphrag/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: `Which platforms meet the ${requirement} requirement?`,
      strategy: 'vector_cypher',
      top_k: 5
    })
  });
  return await res.json();
}
```

## Configuration

### Backend Configuration

**File**: `services/graphrag-api/.env`

```bash
# Neo4j Connection
NEO4J_URI=bolt://neo4j:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password_here
NEO4J_DATABASE=neo4j

# LLM Configuration
LLM_MODEL=gpt-4-turbo-preview
OPENAI_API_KEY=your_key_here

# Logging
LOG_LEVEL=INFO
```

### Frontend Configuration

**File**: `graphrag-ui.html` (JavaScript section)

```javascript
const API_BASE = 'http://localhost:8001/api/graphrag';
```

Change to point to remote API if deployed:
```javascript
const API_BASE = 'https://api.example.com/api/graphrag';
```

## Troubleshooting

### API Not Responding

```bash
# Check if service is running
docker ps | grep graphrag-api

# View logs
docker logs graphrag-api

# Test health endpoint
curl http://localhost:8001/api/graphrag/health
```

### Neo4j Connection Failed

```bash
# Check Neo4j service
docker logs neo4j-graphrag

# Verify password
# Neo4j requires password change on first login
docker exec neo4j-graphrag cypher-shell -u neo4j -p neo4j "ALTER USER neo4j SET PASSWORD 'your_password_here'"
```

### CORS Errors

**Browser console shows**: `Access-Control-Allow-Origin` error

**Solution**: Ensure backend has CORS enabled (it does by default in app.py).

For production, restrict CORS to specific origin:
```python
# In app.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)
```

### Graph Visualization Not Loading

```bash
# Ensure vis.js is loaded
# Check browser network tab for 404 errors on vis.js CDN

# If CDN is down, download and serve locally
```

### Query Results Improving Over Time

- More documents ingested → better query results
- LLM has more context to draw from
- Vector embeddings become more meaningful

## Performance Notes

**Typical Latencies**:
- Health check: <100ms
- Query (small graph): 1-2 seconds
- Query (large graph, 100k+ nodes): 2-5 seconds
- Document ingest: Asynchronous (doesn't block)

**Scaling**:
- API scales horizontally (stateless)
- Neo4j should use managed service for >10GB data
- Consider Redis caching for frequent queries

## Next Steps

Phase 3 improvements:
- [ ] Graph visualization improvements (d3.js)
- [ ] Real-time ingestion progress feedback (WebSocket)
- [ ] Query history and saved searches
- [ ] Export results (CSV, PDF)
- [ ] Authentication and authorization
- [ ] Collaborative features

---

**Version**: 1.0.0
**Status**: MVP (MVP = Minimum Viable Product)
**Last Updated**: 2026-04-22
