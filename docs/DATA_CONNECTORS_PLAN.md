# GraphRAG Multi-Source Data Ingestion Pipeline

Architecture for connecting corporate databases, APIs, lab systems, and public health data exchanges.

## Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                  Data Sources                              │
├────────────────────────────────────────────────────────────┤
│ REST APIs    │ SQL DB    │ Lab Systems  │ FHIR/HL7        │
│ (Anthropic,  │ (SQL Svr, │ (LIMS, ELN) │ (Health Data    │
│  OpenAI,     │  PostgreSQL,             │  Exchanges)     │
│  other APIs) │  Oracle)  │              │                 │
└────────────┬──┴────┬─────┴───────┬──────┴────────────────┘
             │       │             │
             ▼       ▼             ▼
┌────────────────────────────────────────────────────────────┐
│          Connector Framework (services/data-connectors/)   │
├────────────────────────────────────────────────────────────┤
│ ┌─────────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐  │
│ │ APIConnector│  │ SQLConn. │  │ FHIRConn│  │ WebhookR │  │
│ │ - GET/POST  │  │ - ODBC   │  │ - Parse │  │ - Listen │  │
│ │ - Auth      │  │ - Query  │  │ - Map   │  │ - Queue  │  │
│ │ - Paginate  │  │ - Fetch  │  │ - Norm. │  │ - Retry  │  │
│ └─────────────┘  └──────────┘  └─────────┘  └──────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │  Transformer/Normalizer                              │  │
│ │  - Convert any format → standardized chunks          │  │
│ │  - Extract metadata (source, timestamp, tags)        │  │
│ │  - Handle nested/complex data structures             │  │
│ └──────────────────────────────────────────────────────┘  │
└────────────┬──────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│         Scheduler & Orchestration (APScheduler)            │
├────────────────────────────────────────────────────────────┤
│ - Schedule jobs (hourly, daily, weekly, on-demand)        │
│ - Retry logic with exponential backoff                    │
│ - Track ingestion status and errors                       │
│ - Deduplicate incoming data                               │
└────────────┬──────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│              GraphRAG API Service                          │
│  (services/graphrag-api/app.py)                           │
│  - Enhanced /ingest endpoints for streaming               │
│  - Store data source metadata                             │
└────────────┬──────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│         Neo4j Knowledge Graph Database                     │
│  - Documents + source lineage                             │
│  - Ingestion history and versioning                       │
└────────────────────────────────────────────────────────────┘
```

## Phase 1: Core Connectors (4-5 hours)

### 1. API Connector (`services/data-connectors/api_connector.py`)

**Supports**:
- REST APIs (GET, POST, paginated endpoints)
- Authentication (Bearer, API Key, OAuth2)
- JSON/CSV response parsing
- Polling intervals (hourly, daily, etc.)

**Example: Anthropic API**
```python
connector = APIConnector(
    name="anthropic-models",
    url="https://api.anthropic.com/v1/models",
    auth_type="bearer",
    auth_token="${ANTHROPIC_API_KEY}",
    method="GET",
    schedule="daily",
    transform="extract_description_from_models"
)
```

**Example: Health Data Exchange API**
```python
connector = APIConnector(
    name="public-health-data",
    url="https://health-api.example.com/data/latest",
    auth_type="oauth2",
    oauth2_config={"client_id": "...", "client_secret": "..."},
    pagination="cursor",
    schedule="hourly"
)
```

### 2. SQL Database Connector (`services/data-connectors/sql_connector.py`)

**Supports**:
- PostgreSQL, MySQL, SQL Server, Oracle, SQLite
- Connection pooling
- Complex queries and views
- Incremental sync (timestamp-based)
- Schema introspection

**Example: Corporate Database**
```python
connector = SQLConnector(
    name="governance-db",
    dialect="postgresql",
    host="db.company.internal",
    port=5432,
    database="governance",
    username="${DB_USER}",
    password="${DB_PASS}",
    query="SELECT id, title, description, created_at FROM policies WHERE updated_at > :last_sync",
    schedule="daily",
    incremental_column="updated_at"
)
```

**Example: Lab Database**
```python
connector = SQLConnector(
    name="lab-results-db",
    dialect="oracle",
    host="lims.lab.internal",
    query="SELECT test_id, test_name, result, lab_notes FROM test_results WHERE status='completed'",
    schedule="every_4_hours",
    deduplication_key="test_id"
)
```

### 3. FHIR/HL7 Connector (`services/data-connectors/fhir_connector.py`)

**Supports**:
- FHIR REST APIs (Patient, Observation, Condition, etc.)
- HL7 v2 message parsing
- EDI format transformation
- Public health data standards (CDS Hooks, etc.)

**Example: Public Health Data Exchange**
```python
connector = FHIRConnector(
    name="provincial-health-exchange",
    fhir_server="https://fhir.health.gov.on.ca",
    auth_type="oauth2",
    resources=["Patient", "Observation", "Condition"],
    filter="status=final&date>=2024-01-01",
    schedule="daily_2am",
    pii_handling="anonymize"  # Strip PHI before storing
)
```

### 4. Data Source UI (`data-sources.html`)

**Tab Interface**:
- Configured Sources: List all active connectors with status
- Add Source: Form to create new connector
- Test Connection: Validate credentials before scheduling
- Ingestion History: View past runs, errors, records processed
- Scheduling: Manage frequency and retry policies

## Phase 1 Implementation Files

```
services/
├── data-connectors/
│   ├── __init__.py
│   ├── base_connector.py          # Abstract base class
│   ├── api_connector.py           # REST/GraphQL APIs
│   ├── sql_connector.py           # SQL databases
│   ├── fhir_connector.py          # Health data standards
│   ├── transformers.py            # Data normalization
│   ├── scheduler.py               # APScheduler orchestration
│   └── requirements.txt           # APScheduler, requests, sqlalchemy, fhirclient
│
├── graphrag-api/
│   ├── app.py                     # Add /sources endpoints
│   └── (existing files)
│
└── (existing graphrag-api files)

data-sources.html                  # UI for data source management
docs/DATA_CONNECTORS.md            # Configuration documentation
```

## Phase 1 API Additions

Add to `services/graphrag-api/app.py`:

```python
@app.get("/api/graphrag/sources")
async def list_data_sources():
    """List all configured data sources"""
    return {"sources": [...]}

@app.post("/api/graphrag/sources")
async def create_data_source(source: DataSourceConfig):
    """Register a new data source"""
    connector = build_connector(source)
    scheduler.add_job(connector.fetch_and_ingest, ...)
    return {"id": source_id, "status": "scheduled"}

@app.get("/api/graphrag/sources/{source_id}/status")
async def get_source_status(source_id: str):
    """Get ingestion status for a data source"""
    return {"last_run": "2024-04-22T14:30:00Z", "records": 1250, "errors": 0}

@app.post("/api/graphrag/sources/{source_id}/test")
async def test_data_source(source_id: str):
    """Test connection before enabling"""
    return {"status": "ok", "sample_data": [...]}

@app.delete("/api/graphrag/sources/{source_id}")
async def remove_data_source(source_id: str):
    """Unregister and stop a data source"""
    return {"status": "removed"}
```

## Configuration Examples

### Setup File (`services/data-connectors/config.yaml`)

```yaml
connectors:
  anthropic-models:
    type: api
    url: https://api.anthropic.com/v1/models
    auth:
      type: bearer
      token_env: ANTHROPIC_API_KEY
    schedule: "0 9 * * *"  # Daily at 9am
    
  corporate-policies:
    type: sql
    dialect: postgresql
    host: db.company.internal
    database: governance
    credentials_env: DB_CREDENTIALS
    query: |
      SELECT id, title, description, updated_at 
      FROM policies 
      WHERE updated_at > :last_sync
    schedule: "0 */6 * * *"  # Every 6 hours
    incremental: true
    
  health-exchange:
    type: fhir
    server: https://fhir.health.gov.on.ca
    auth:
      type: oauth2
      client_id_env: FHIR_CLIENT_ID
      client_secret_env: FHIR_CLIENT_SECRET
    resources:
      - Patient
      - Observation
      - Condition
    schedule: "0 2 * * *"  # Daily at 2am
    pii_handling: anonymize
    
  lab-system:
    type: sql
    dialect: oracle
    host: lims.lab.internal
    query: |
      SELECT test_id, test_name, result, lab_notes 
      FROM test_results 
      WHERE status='completed' AND created_date > :last_sync
    schedule: "*/4 * * * *"  # Every 4 hours
    deduplication_key: test_id
```

### Environment Variables

```bash
# API Keys
ANTHROPIC_API_KEY=sk-...
OPENAI_API_KEY=sk-...

# Database Credentials
DB_CREDENTIALS=postgresql://user:pass@host:5432/db
ORACLE_CREDENTIALS=oracle://user:pass@host:1521/db

# Health Data Exchange
FHIR_CLIENT_ID=health-app-client-id
FHIR_CLIENT_SECRET=health-app-secret
FHIR_SCOPE="patient/*.read system/*.read"

# Scheduling
SCHEDULER_TIMEZONE=America/Toronto
SCHEDULER_MAX_WORKERS=4
```

## Phase 1 Effort Breakdown

| Component | Hours | Description |
|-----------|-------|-------------|
| Base connector framework | 1 | Abstract class, interfaces, utils |
| API connector + tests | 1 | REST/GraphQL, auth, pagination |
| SQL connector + tests | 1.5 | ODBC, pooling, incremental sync |
| FHIR/HL7 connector | 1.5 | Standards parsing, PII handling |
| Scheduler integration | 1 | APScheduler, job management, retry |
| Data sources UI | 2 | graphrag-ui.html new tab |
| API endpoints | 1 | /sources endpoints |
| Documentation | 1 | Configuration guide |
| **Total** | **~9 hours** | Full Phase 1 delivery |

## Phase 2 Enhancements (Future)

- Webhook receivers (GitHub, Slack, custom)
- Data transformation templates (drag-drop pipeline builder)
- Validation rules (data quality checks)
- Change Data Capture (CDC) for real-time sync
- Distributed scheduling (multi-instance orchestration)
- Audit logging and compliance tracking
- GraphQL support for APIs

## Next Steps

Would you like me to implement Phase 1 (9 hours)? Priority sequence:

1. **API Connector** (1 hour) - Start with generic REST API support
2. **SQL Connector** (1.5 hours) - PostgreSQL/SQL Server support
3. **FHIR Connector** (1.5 hours) - Health data exchange standard
4. **Scheduler** (1 hour) - APScheduler integration
5. **Data Sources UI** (2 hours) - Management interface
6. **API Endpoints** (1 hour) - /sources endpoints
7. **Documentation** (1 hour) - Configuration guide

Or would you prefer to focus on specific connectors first (e.g., just API + SQL)?

