"""
Base connector class for all data sources.
Defines the interface that all connectors must implement.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum


class ConnectorType(str, Enum):
    """Supported connector types"""
    API = "api"
    SQL = "sql"
    FHIR = "fhir"
    WEBHOOK = "webhook"


class AuthType(str, Enum):
    """Authentication methods"""
    NONE = "none"
    BEARER = "bearer"
    API_KEY = "api_key"
    BASIC = "basic"
    OAUTH2 = "oauth2"


class PIIHandling(str, Enum):
    """How to handle Personally Identifiable Information"""
    PRESERVE = "preserve"  # Keep as-is
    ANONYMIZE = "anonymize"  # Remove/hash identifiers
    ENCRYPT = "encrypt"  # Encrypt sensitive fields


@dataclass
class ConnectorConfig:
    """Base configuration for all connectors"""
    name: str
    connector_type: ConnectorType
    description: Optional[str] = None
    enabled: bool = True
    schedule: str = "manual"  # cron expression or "manual"
    auth_type: AuthType = AuthType.NONE
    pii_handling: PIIHandling = PIIHandling.PRESERVE
    tags: Optional[List[str]] = None


@dataclass
class IngestionResult:
    """Result of a connector ingestion run"""
    connector_name: str
    status: str  # "success", "partial", "failed"
    records_processed: int = 0
    records_ingested: int = 0
    errors: List[str] = None
    start_time: datetime = None
    end_time: datetime = None
    source_metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.errors is None:
            self.errors = []
        if self.start_time is None:
            self.start_time = datetime.utcnow()


@dataclass
class DataChunk:
    """Standardized data chunk for ingestion into GraphRAG"""
    connector_name: str
    content: str  # Main text content
    metadata: Dict[str, Any]  # Source info, timestamp, etc.
    identifiers: Optional[Dict[str, str]] = None  # For deduplication
    tags: Optional[List[str]] = None  # For categorization

    def anonymize(self):
        """Remove/hash PII from metadata if needed"""
        if "patient_id" in self.metadata:
            # Hash the ID instead of removing it for deduplication
            import hashlib
            self.metadata["patient_id_hash"] = hashlib.sha256(
                str(self.metadata["patient_id"]).encode()
            ).hexdigest()
            del self.metadata["patient_id"]


class BaseConnector(ABC):
    """Abstract base class for all data connectors"""

    def __init__(self, config: ConnectorConfig):
        self.config = config
        self.name = config.name
        self.connector_type = config.connector_type

    @abstractmethod
    async def test_connection(self) -> bool:
        """Test if connection to data source works"""
        pass

    @abstractmethod
    async def fetch_data(self, **kwargs) -> List[DataChunk]:
        """
        Fetch data from source and convert to standard chunks.

        Returns:
            List of DataChunk objects ready for ingestion
        """
        pass

    async def ingest(self, graphrag_client) -> IngestionResult:
        """
        Fetch and ingest data into GraphRAG.

        Args:
            graphrag_client: GraphRAG API client

        Returns:
            IngestionResult with stats and status
        """
        result = IngestionResult(
            connector_name=self.name,
            status="failed",
            start_time=datetime.utcnow()
        )

        try:
            # Fetch data
            chunks = await self.fetch_data()
            result.records_processed = len(chunks)

            if not chunks:
                result.status = "success"
                result.end_time = datetime.utcnow()
                return result

            # Apply PII handling
            if self.config.pii_handling == PIIHandling.ANONYMIZE:
                for chunk in chunks:
                    chunk.anonymize()

            # Ingest into GraphRAG
            for chunk in chunks:
                try:
                    await graphrag_client.ingest_text(
                        text=chunk.content,
                        metadata=chunk.metadata
                    )
                    result.records_ingested += 1
                except Exception as e:
                    result.errors.append(f"Chunk error: {str(e)}")

            # Set final status
            if result.records_ingested == result.records_processed:
                result.status = "success"
            elif result.records_ingested > 0:
                result.status = "partial"
            else:
                result.status = "failed"

        except Exception as e:
            result.status = "failed"
            result.errors.append(str(e))

        finally:
            result.end_time = datetime.utcnow()

        return result

    def get_config_dict(self) -> Dict[str, Any]:
        """Return configuration as dictionary for storage"""
        return {
            "name": self.config.name,
            "type": self.config.connector_type.value,
            "description": self.config.description,
            "enabled": self.config.enabled,
            "schedule": self.config.schedule,
            "pii_handling": self.config.pii_handling.value,
            "tags": self.config.tags or []
        }

    @abstractmethod
    def get_status_info(self) -> Dict[str, Any]:
        """Return connector status for UI display"""
        pass
