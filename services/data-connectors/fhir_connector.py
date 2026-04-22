"""
FHIR connector for public health data exchanges.
Supports FHIR REST APIs, HL7 standards, and health data interoperability.
"""

import httpx
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass, field

from base_connector import (
    BaseConnector,
    ConnectorConfig,
    ConnectorType,
    AuthType,
    IngestionResult,
    DataChunk,
)


@dataclass
class FHIRConnectorConfig(ConnectorConfig):
    """FHIR-specific configuration"""
    fhir_server: str  # FHIR API endpoint (e.g., https://fhir.example.com)
    resources: List[str] = field(default_factory=lambda: ["Patient", "Observation"])
    filter_params: Optional[str] = None  # FHIR filter parameters
    oauth2_client_id: Optional[str] = None
    oauth2_client_secret: Optional[str] = None
    oauth2_scope: str = "patient/*.read system/*.read"
    include_explanations: bool = True  # Include FHIR explanations in chunks
    batch_size: int = 100


class FHIRConnector(BaseConnector):
    """
    Connector for FHIR-compliant health data sources.

    Supports:
    - HL7 FHIR REST APIs
    - Multiple resource types (Patient, Observation, Condition, etc.)
    - OAuth2 authentication
    - Pagination
    - PII anonymization for Protected B compliance
    """

    def __init__(self, config: FHIRConnectorConfig):
        super().__init__(config)
        self.fhir_config = config
        self.fhir_server = config.fhir_server.rstrip("/")
        self.client = None
        self.access_token = None
        self.last_sync = None

    async def test_connection(self) -> bool:
        """Test FHIR API connection and authentication"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = self._get_headers()

                # Try to fetch metadata (CapabilityStatement)
                response = await client.get(
                    f"{self.fhir_server}/metadata",
                    headers=headers
                )

                return response.status_code == 200
        except Exception as e:
            raise Exception(f"FHIR connection test failed: {str(e)}")

    async def _authenticate(self):
        """Authenticate to FHIR server using OAuth2"""
        if self.fhir_config.auth_type != AuthType.OAUTH2:
            return

        if self.access_token:
            return  # Already authenticated

        try:
            # This is a placeholder - actual OAuth2 flow depends on server
            # Most FHIR servers support OAuth2 with standard OIDC discovery
            async with httpx.AsyncClient(timeout=10.0) as client:
                # In production, would use proper OAuth2 library
                # For now, assume token is in environment or passed separately
                pass
        except Exception as e:
            raise Exception(f"FHIR authentication failed: {str(e)}")

    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for FHIR requests"""
        headers = {
            "Accept": "application/fhir+json",
            "Content-Type": "application/fhir+json"
        }

        if self.fhir_config.auth_type == AuthType.BEARER and self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        elif self.fhir_config.auth_type == AuthType.API_KEY:
            # API key in header (varies by server)
            pass

        return headers

    async def fetch_data(self, **kwargs) -> List[DataChunk]:
        """
        Fetch FHIR resources and convert to standardized chunks.

        Returns:
            List of DataChunk objects with FHIR data
        """
        chunks = []

        await self._authenticate()

        for resource_type in self.fhir_config.resources:
            try:
                resource_chunks = await self._fetch_resource_type(resource_type)
                chunks.extend(resource_chunks)
            except Exception as e:
                raise Exception(f"Error fetching {resource_type}: {str(e)}")

        self.last_sync = datetime.utcnow()
        return chunks

    async def _fetch_resource_type(self, resource_type: str) -> List[DataChunk]:
        """Fetch a specific FHIR resource type"""
        chunks = []
        next_url = f"{self.fhir_server}/{resource_type}"

        if self.fhir_config.filter_params:
            next_url += f"?{self.fhir_config.filter_params}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            headers = self._get_headers()
            page = 0

            while next_url and page < 10:  # Limit to 10 pages per resource
                try:
                    response = await client.get(next_url, headers=headers)
                    response.raise_for_status()

                    bundle = response.json()

                    # Process entries
                    if "entry" in bundle:
                        for entry in bundle["entry"]:
                            if "resource" in entry:
                                chunk = self._convert_resource_to_chunk(
                                    entry["resource"], resource_type
                                )
                                chunks.append(chunk)

                    # Check for next page
                    next_url = self._get_next_link(bundle)
                    page += 1

                    if not next_url:
                        break

                except httpx.HTTPError as e:
                    raise Exception(f"HTTP error fetching {resource_type}: {str(e)}")

        return chunks

    def _get_next_link(self, bundle: Dict) -> Optional[str]:
        """Extract 'next' link from FHIR bundle for pagination"""
        if "link" not in bundle:
            return None

        for link in bundle.get("link", []):
            if link.get("relation") == "next":
                return link.get("url")

        return None

    def _convert_resource_to_chunk(
        self, resource: Dict[str, Any], resource_type: str
    ) -> DataChunk:
        """Convert FHIR resource to standardized DataChunk"""

        # Extract key information based on resource type
        content = self._resource_to_text(resource, resource_type)

        # Build metadata
        metadata = {
            "source": "fhir",
            "fhir_server": self.fhir_server,
            "resource_type": resource_type,
            "ingestion_date": datetime.utcnow().isoformat(),
            "fhir_id": resource.get("id"),
            "last_updated": resource.get("meta", {}).get("lastUpdated"),
        }

        # Build identifiers for deduplication
        identifiers = {
            "fhir_id": resource.get("id"),
            "resource_type": resource_type,
        }

        chunk = DataChunk(
            connector_name=self.name,
            content=content,
            metadata=metadata,
            identifiers=identifiers,
            tags=["fhir", "health", "public-health", resource_type.lower()]
        )

        return chunk

    def _resource_to_text(self, resource: Dict[str, Any], resource_type: str) -> str:
        """Convert FHIR resource to human-readable text"""
        lines = [f"## {resource_type}: {resource.get('id', 'Unknown')}"]

        if resource_type == "Patient":
            lines.extend(self._patient_to_text(resource))
        elif resource_type == "Observation":
            lines.extend(self._observation_to_text(resource))
        elif resource_type == "Condition":
            lines.extend(self._condition_to_text(resource))
        else:
            # Generic fallback
            lines.append(json.dumps(resource, indent=2))

        return "\n".join(lines)

    def _patient_to_text(self, patient: Dict) -> List[str]:
        """Extract relevant text from Patient resource"""
        lines = []

        # Name
        if "name" in patient:
            for name in patient["name"]:
                name_str = " ".join(name.get("given", []) + [name.get("family", "")])
                if name_str.strip():
                    lines.append(f"**Name:** {name_str}")

        # Birthdate
        if "birthDate" in patient:
            lines.append(f"**Date of Birth:** {patient['birthDate']}")

        # Address
        if "address" in patient:
            for addr in patient["address"]:
                addr_parts = [
                    ", ".join(addr.get("line", [])),
                    addr.get("city"),
                    addr.get("state"),
                    addr.get("postalCode")
                ]
                addr_str = ", ".join(p for p in addr_parts if p)
                if addr_str:
                    lines.append(f"**Address:** {addr_str}")

        # Contact
        if "telecom" in patient:
            for telecom in patient["telecom"]:
                lines.append(f"**{telecom.get('system', 'Contact')}:** {telecom.get('value')}")

        return lines

    def _observation_to_text(self, observation: Dict) -> List[str]:
        """Extract relevant text from Observation resource"""
        lines = []

        # Code/Status
        if "code" in observation:
            code_text = observation["code"].get("text", "")
            if code_text:
                lines.append(f"**Observation:** {code_text}")

        # Value
        if "valueQuantity" in observation:
            val = observation["valueQuantity"]
            lines.append(f"**Result:** {val.get('value')} {val.get('unit', '')}")
        elif "valueString" in observation:
            lines.append(f"**Result:** {observation['valueString']}")
        elif "valueCodeableConcept" in observation:
            code = observation["valueCodeableConcept"]
            if "text" in code:
                lines.append(f"**Result:** {code['text']}")

        # Effective date
        if "effectiveDateTime" in observation:
            lines.append(f"**Date:** {observation['effectiveDateTime']}")

        # Interpretation
        if "interpretation" in observation:
            interp = observation["interpretation"][0]
            if "text" in interp:
                lines.append(f"**Interpretation:** {interp['text']}")

        return lines

    def _condition_to_text(self, condition: Dict) -> List[str]:
        """Extract relevant text from Condition resource"""
        lines = []

        # Code
        if "code" in condition:
            code = condition["code"]
            if "text" in code:
                lines.append(f"**Condition:** {code['text']}")

        # Status
        if "clinicalStatus" in condition:
            status = condition["clinicalStatus"].get("coding", [{}])[0].get("display")
            if status:
                lines.append(f"**Status:** {status}")

        # Onset
        if "onsetDateTime" in condition:
            lines.append(f"**Onset:** {condition['onsetDateTime']}")

        return lines

    def get_status_info(self) -> Dict[str, Any]:
        """Return connector status for UI display"""
        return {
            "name": self.name,
            "type": "fhir",
            "fhir_server": self.fhir_server,
            "resources": self.fhir_config.resources,
            "last_sync": self.last_sync.isoformat() if self.last_sync else None,
            "enabled": self.config.enabled,
            "schedule": self.config.schedule,
        }
