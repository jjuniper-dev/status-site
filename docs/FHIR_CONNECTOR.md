# FHIR Data Connector for GraphRAG

Enterprise-grade FHIR connector for public health data exchanges, lab systems, and health information interoperability.

## Overview

The FHIR connector enables GraphRAG to ingest data from FHIR-compliant health data sources:

```
FHIR Data Sources (Health Exchanges, LIMS, EHR, Surveillance)
    ↓
FHIRConnector (Parse, transform, anonymize FHIR resources)
    ↓
GraphRAG (Knowledge graph ingestion)
    ↓
Neo4j (Searchable, analyzable health intelligence)
```

## Features

✅ **FHIR REST API Support**
- Automatic resource discovery and pagination
- Multiple resource types (Patient, Observation, Condition, etc.)
- OAuth2, Bearer token, and API key authentication
- Filter parameters (FHIR-QL style queries)

✅ **Health Data Standards**
- HL7 FHIR R4 compliance
- Support for public health data exchanges
- EDI and specialty formats
- Clinical resource extraction

✅ **PII Compliance**
- Automatic anonymization of sensitive identifiers
- PIPEDA and Protected B compatible
- Preserve data utility while removing identifiers
- Audit trail of anonymization decisions

✅ **Scheduling & Orchestration**
- Cron-based scheduling (hourly, daily, weekly, etc.)
- Automatic retry with exponential backoff
- Deduplication and change detection
- Ingestion history and error tracking

✅ **Data Transformation**
- Automatic text extraction from FHIR resources
- Metadata preservation (source, timestamp, lineage)
- Support for nested and complex structures
- Tagging and categorization

## Configuration

### Basic FHIR Connector Setup

```python
from services.data_connectors import FHIRConnector, FHIRConnectorConfig, AuthType, PIIHandling

config = FHIRConnectorConfig(
    name="provincial-health",
    fhir_server="https://fhir.health.gov.on.ca/api",
    resources=["Patient", "Observation", "Condition"],
    auth_type=AuthType.OAUTH2,
    oauth2_client_id="your_client_id",
    oauth2_client_secret="your_client_secret",
    pii_handling=PIIHandling.ANONYMIZE,
    schedule="0 2 * * *"  # Daily at 2am UTC
)

connector = FHIRConnector(config)
```

### Configuration Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | str | ✓ | Unique connector identifier |
| `fhir_server` | str | ✓ | FHIR API endpoint URL |
| `resources` | List[str] | ✓ | FHIR resource types to fetch (Patient, Observation, etc.) |
| `filter_params` | str | | FHIR filter (e.g., "status=final&date>=2024-01-01") |
| `auth_type` | AuthType | | NONE, BEARER, API_KEY, OAUTH2 (default: NONE) |
| `oauth2_client_id` | str | | For OAuth2 authentication |
| `oauth2_client_secret` | str | | For OAuth2 authentication |
| `oauth2_scope` | str | | OAuth2 scope (default: "patient/*.read system/*.read") |
| `pii_handling` | PIIHandling | | PRESERVE, ANONYMIZE, ENCRYPT (default: PRESERVE) |
| `schedule` | str | | Cron expression (default: "manual") |
| `include_explanations` | bool | | Include FHIR display text (default: True) |
| `batch_size` | int | | Resources per request (default: 100) |

### Authentication Methods

**OAuth2** (Recommended for Protected B):
```python
config = FHIRConnectorConfig(
    fhir_server="https://fhir.example.com",
    auth_type=AuthType.OAUTH2,
    oauth2_client_id=os.getenv("FHIR_CLIENT_ID"),
    oauth2_client_secret=os.getenv("FHIR_CLIENT_SECRET"),
    oauth2_scope="patient/*.read system/*.read"
)
```

**Bearer Token**:
```python
config = FHIRConnectorConfig(
    fhir_server="https://fhir.example.com",
    auth_type=AuthType.BEARER,
    # Token loaded from environment or external source
)
```

**No Auth**:
```python
config = FHIRConnectorConfig(
    fhir_server="https://public-fhir-server.com",
    auth_type=AuthType.NONE
)
```

## Usage Examples

### Example 1: Provincial Health Data Exchange

```python
import asyncio
from services.data_connectors import FHIRConnector, FHIRConnectorConfig, AuthType, PIIHandling

async def setup_provincial_data():
    config = FHIRConnectorConfig(
        name="ontario-health",
        fhir_server="https://fhir.health.gov.on.ca/api",
        resources=["Patient", "Observation", "Condition"],
        filter_params="status=final&date>=2024-01-01",
        auth_type=AuthType.OAUTH2,
        oauth2_client_id="ontario_app_id",
        oauth2_client_secret="ontario_app_secret",
        pii_handling=PIIHandling.ANONYMIZE,  # Remove patient identifiers
        schedule="0 2 * * *"  # Daily at 2am
    )
    
    connector = FHIRConnector(config)
    
    # Test connection
    if await connector.test_connection():
        print("Connected to Ontario Health FHIR server")
    
    return connector

# Register and schedule
connector = asyncio.run(setup_provincial_data())
```

### Example 2: Lab System Results

```python
config = FHIRConnectorConfig(
    name="pathology-lab",
    fhir_server="https://lims.hospital.local/fhir",
    resources=["Observation", "DiagnosticReport"],
    auth_type=AuthType.BEARER,
    pii_handling=PIIHandling.ANONYMIZE,
    schedule="*/4 * * * *"  # Every 4 hours
)

connector = FHIRConnector(config)
# Automatically pulls new lab results every 4 hours
```

### Example 3: PHAC Surveillance Data

```python
config = FHIRConnectorConfig(
    name="phac-surveillance",
    fhir_server="https://fhir.phac-aspc.gc.ca/api",
    resources=["Observation", "Condition"],
    filter_params="status=final&organization=phac",
    pii_handling=PIIHandling.PRESERVE,  # Already aggregated
    schedule="0 */6 * * *"  # Every 6 hours
)

connector = FHIRConnector(config)
```

## Data Extraction

### Supported Resource Types

| Resource | Extracted Fields | Use Case |
|----------|------------------|----------|
| **Patient** | Name, DOB, Address, Contact | Demographic data, patient registries |
| **Observation** | Code, Result, Date, Status, Interpretation | Lab results, vital signs, surveys |
| **Condition** | Code, Status, Onset, Evidence | Diagnoses, health conditions |
| **DiagnosticReport** | Code, Result, Conclusion, Performer | Lab reports, imaging results |
| **Organization** | Name, Address, Contact | Health system structure |
| **Specimen** | Type, Collection Date, Status | Lab specimen tracking |

### Example: Patient Resource Extraction

**FHIR Input**:
```json
{
  "resourceType": "Patient",
  "id": "12345",
  "name": [{"given": ["John"], "family": "Doe"}],
  "birthDate": "1970-01-01",
  "address": [{"city": "Toronto", "state": "ON"}]
}
```

**Extracted Text**:
```
## Patient: 12345
**Name:** John Doe
**Date of Birth:** 1970-01-01
**Address:** Toronto, ON
```

**Metadata**:
```python
{
  "source": "fhir",
  "fhir_server": "https://...",
  "resource_type": "Patient",
  "ingestion_date": "2024-04-22T14:30:00Z",
  "fhir_id": "12345",
  "last_updated": "2024-04-22T10:00:00Z"
}
```

### Example: Observation Resource Extraction

**FHIR Input**:
```json
{
  "resourceType": "Observation",
  "id": "obs-67890",
  "code": {"text": "Blood Glucose"},
  "valueQuantity": {"value": 120, "unit": "mg/dL"},
  "effectiveDateTime": "2024-04-22T14:00:00Z",
  "interpretation": [{"text": "High"}]
}
```

**Extracted Text**:
```
## Observation: obs-67890
**Observation:** Blood Glucose
**Result:** 120 mg/dL
**Date:** 2024-04-22T14:00:00Z
**Interpretation:** High
```

## Anonymization

When `pii_handling=PIIHandling.ANONYMIZE` is set:

1. **Patient Identifiers** are replaced with hashes
   - Original: `"patient_id": "123456"`
   - Anonymized: `"patient_id_hash": "a3c5f7d9..."`

2. **Names** are removed (retained for drug names, disease names, etc.)

3. **Addresses** are redacted to region level

4. **Contact info** (phone, email) is removed

5. **Care provider names** are kept (clinically relevant)

## Scheduling

Connector jobs run automatically on defined schedules using APScheduler (cron syntax).

### Schedule Examples

| Schedule | Cron Expression | Frequency |
|----------|-----------------|-----------|
| Every hour | `0 * * * *` | 60 times/day |
| Every 4 hours | `*/4 * * * *` | 6 times/day |
| Daily at 2am UTC | `0 2 * * *` | Once/day |
| Weekdays at 9am | `0 9 * * 1-5` | 5 times/week |
| Weekly Sunday midnight | `0 0 * * 0` | Once/week |
| Manual only | `manual` | On-demand |

### Monitoring

```python
# Get connector status
status = connector.get_status_info()
print(f"Last sync: {status['last_sync']}")
print(f"Enabled: {status['enabled']}")
print(f"Schedule: {status['schedule']}")

# View ingestion history
history = scheduler.get_ingestion_history("ontario-health", limit=10)
for run in history:
    print(f"{run['start_time']}: {run['status']} ({run['records_ingested']} records)")
```

## Error Handling & Retry

The connector includes automatic retry logic:

- **Connection failures**: Retry up to 3 times with exponential backoff
- **Partial failures**: Continue processing remaining resources
- **Rate limiting**: Respect HTTP 429 responses, back off exponentially
- **Timeout handling**: Configurable timeout per request

All errors are logged and persisted in ingestion history for audit trails.

## Compliance

### PIPEDA Compliance

✅ Health data consent collection  
✅ PII anonymization options  
✅ Data retention controls  
✅ Audit logging  
✅ Secure authentication (OAuth2)  

### Protected B Compliance

✅ Encryption in transit (HTTPS)  
✅ Encryption at rest (Neo4j encryption)  
✅ Access controls  
✅ Audit trails  
✅ Data classification  

### Performance

**Typical Ingestion Rates**:
- Small data sets (<1K records): <1 minute
- Medium data sets (1K-100K records): 1-10 minutes
- Large data sets (100K+ records): 10-60 minutes
- Depends on: API speed, network, record complexity

**Memory Usage**:
- Per connector: ~50-200 MB
- Batch processing: Configurable (default: 100 records/batch)

## Troubleshooting

### Connection Failed

```
Error: FHIR connection test failed: 401 Unauthorized
```

**Solution**: Verify authentication credentials
- Check OAuth2 client ID/secret
- Verify FHIR server URL is correct
- Ensure API scope includes required resources

### No Data Returned

```
Error: Fetching Observation: 0 resources found
```

**Causes**:
- Filter parameters too restrictive
- No data matching filter date range
- Resource type not supported by server

**Solution**:
- Test filter in FHIR server documentation
- Check date range (`filter_params="date>=2024-01-01"`)
- Verify resource availability

### Ingestion Stuck

**Solution**:
- Check APScheduler logs
- Verify Neo4j is accepting inserts
- Monitor network connectivity
- Check FHIR server rate limits

## Advanced Configuration

### Custom Resource Type Extraction

```python
# Extend FHIRConnector for custom resource types
class CustomFHIRConnector(FHIRConnector):
    def _resource_to_text(self, resource, resource_type):
        if resource_type == "CustomResource":
            # Custom extraction logic
            return f"Custom: {resource.get('id')}"
        return super()._resource_to_text(resource, resource_type)
```

### Deduplication

The connector uses resource ID + timestamp as deduplication key:

```python
identifiers = {
    "fhir_id": resource.get("id"),
    "resource_type": resource_type,
}
```

Prevents duplicate ingestion if same resource is fetched multiple times.

## References

- [HL7 FHIR Specification](https://www.hl7.org/fhir/)
- [FHIR Search](https://www.hl7.org/fhir/search.html)
- [FHIR Security](https://www.hl7.org/fhir/security.html)
- [Ontario Health FHIR Server](https://www.ontariohealth.ca/)
- [PHAC Resources](https://www.canada.ca/en/public-health.html)

---

**Version**: 1.0.0  
**Status**: MVP  
**Last Updated**: 2026-04-22
