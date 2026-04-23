"""
Example usage of FHIR connector with Health Canada/PHAC data exchanges.

This example demonstrates:
1. Configuring a FHIR connector for health data exchanges
2. Testing connection
3. Scheduling automatic ingestion
4. Monitoring ingestion status
"""

import asyncio
import os
from fhir_connector import FHIRConnector, FHIRConnectorConfig
from scheduler import ConnectorScheduler
from base_connector import AuthType, PIIHandling


# Mock GraphRAG client for demonstration
class MockGraphRAGClient:
    """Mock client for testing without running GraphRAG service"""

    async def ingest_text(self, text: str, metadata: dict = None):
        """Mock ingest method"""
        print(f"[GraphRAG] Ingested: {len(text)} chars, metadata keys: {list(metadata.keys()) if metadata else []}")


async def example_provincial_health_exchange():
    """
    Example: Configure and ingest from provincial health data exchange (e.g., Ontario Health)

    This would connect to a FHIR server for public health surveillance data.
    """
    print("=" * 70)
    print("Example 1: Provincial Health Data Exchange")
    print("=" * 70)

    # Configure FHIR connector for health exchange
    config = FHIRConnectorConfig(
        name="ontario-health-exchange",
        connector_type="fhir",
        description="Ontario Health Services public health data exchange",
        fhir_server="https://fhir.health.gov.on.ca/api",
        resources=["Patient", "Observation", "Condition"],
        filter_params="status=final&date>=2024-01-01",
        auth_type=AuthType.OAUTH2,
        oauth2_client_id=os.getenv("FHIR_CLIENT_ID"),
        oauth2_client_secret=os.getenv("FHIR_CLIENT_SECRET"),
        oauth2_scope="patient/*.read system/*.read",
        pii_handling=PIIHandling.ANONYMIZE,  # Strip PHI for compliance
        schedule="0 2 * * *",  # Daily at 2am
        tags=["health", "public-health", "ontario"]
    )

    # Create connector instance
    connector = FHIRConnector(config)

    # Test connection
    print("\n[1] Testing connection...")
    try:
        connected = await connector.test_connection()
        print(f"    ✓ Connection successful: {connected}")
    except Exception as e:
        print(f"    ✗ Connection failed: {e}")
        return

    # Create scheduler and register connector
    scheduler = ConnectorScheduler()
    graphrag_client = MockGraphRAGClient()

    print("\n[2] Registering connector...")
    await scheduler.initialize(graphrag_client)
    connector_id = await scheduler.register_connector(connector)
    print(f"    ✓ Connector registered: {connector_id}")

    # List connectors
    print("\n[3] Listing connectors...")
    connectors = scheduler.list_connectors()
    for c in connectors:
        print(f"    - {c['id']}")
        print(f"      Status: {c['status']}")
        print(f"      Scheduled: {c['scheduled']}")

    # Get connector info
    print("\n[4] Connector status...")
    status = connector.get_status_info()
    print(f"    FHIR Server: {status['fhir_server']}")
    print(f"    Resources: {', '.join(status['resources'])}")
    print(f"    Schedule: {status['schedule']}")
    print(f"    PII Handling: anonymize")

    print("\n[5] Manual ingestion (would run scheduled at 2am UTC)...")
    print("    In production, this runs automatically on schedule")
    # result = await scheduler.run_ingestion_manual(connector_id)
    # print(f"    Status: {result.status}")
    # print(f"    Records: {result.records_ingested}/{result.records_processed}")

    await scheduler.shutdown()
    print("\n✓ Example complete")


async def example_lab_data_source():
    """
    Example: Configure a FHIR connector for lab system results

    Many modern LIMS (Lab Information Management Systems) expose FHIR APIs
    for laboratory results, test orders, and specimen data.
    """
    print("\n" * 2)
    print("=" * 70)
    print("Example 2: Lab System FHIR Interface")
    print("=" * 70)

    config = FHIRConnectorConfig(
        name="pathology-lab-results",
        connector_type="fhir",
        description="Hospital pathology lab automated FHIR results feed",
        fhir_server="https://lims.hospital.internal/fhir",
        resources=["Observation", "DiagnosticReport", "Specimen"],
        filter_params="status=final&date>=2024-01-01",
        auth_type=AuthType.BEARER,
        pii_handling=PIIHandling.ANONYMIZE,  # Always anonymize patient data
        schedule="*/4 * * * *",  # Every 4 hours
        tags=["lab", "pathology", "observations"]
    )

    connector = FHIRConnector(config)

    print("\n[1] Lab FHIR Configuration:")
    print(f"    FHIR Server: {config.fhir_server}")
    print(f"    Ingestion interval: Every 4 hours")
    print(f"    Resources: {', '.join(config.resources)}")
    print(f"    PII Handling: {config.pii_handling.value}")

    print("\n[2] Expected data extraction:")
    print("    - Test orders and results (Observation)")
    print("    - Diagnostic reports (DiagnosticReport)")
    print("    - Specimen information (Specimen)")
    print("    - All timestamps and patient references anonymized")

    print("\n✓ Lab data source example complete")


async def example_public_health_surveillance():
    """
    Example: Configure for Public Health Agency of Canada (PHAC) data feeds

    PHAC provides various surveillance data through FHIR and other standard formats.
    """
    print("\n" * 2)
    print("=" * 70)
    print("Example 3: PHAC Public Health Surveillance")
    print("=" * 70)

    config = FHIRConnectorConfig(
        name="phac-surveillance-data",
        connector_type="fhir",
        description="PHAC public health surveillance and outbreak data",
        fhir_server="https://fhir.phac-aspc.gc.ca/api",
        resources=["Observation", "Condition", "Organization"],
        filter_params="status=final",
        auth_type=AuthType.API_KEY,
        pii_handling=PIIHandling.PRESERVE,  # Surveillance data is already aggregated
        schedule="0 */6 * * *",  # Every 6 hours
        tags=["phac", "surveillance", "outbreak"]
    )

    print("\n[1] PHAC Data Source Configuration:")
    print(f"    Server: {config.fhir_server}")
    print(f"    Update frequency: Every 6 hours")
    print(f"    Resources: {', '.join(config.resources)}")

    print("\n[2] Expected PHAC data streams:")
    print("    - Disease surveillance indicators")
    print("    - Outbreak event monitoring")
    print("    - Laboratory test results aggregates")
    print("    - Vaccination rates and campaign progress")
    print("    - Regional health organization data")

    print("\n✓ PHAC surveillance example complete")


async def main():
    """Run all examples"""
    print("\n" + "=" * 70)
    print("FHIR Data Connector Examples - Health Canada / PHAC")
    print("=" * 70)
    print("\nThese examples demonstrate configuring FHIR connectors for:")
    print("- Provincial health data exchanges")
    print("- Lab system integration")
    print("- PHAC public health surveillance")

    await example_provincial_health_exchange()
    await example_lab_data_source()
    await example_public_health_surveillance()

    print("\n" + "=" * 70)
    print("All examples complete!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
