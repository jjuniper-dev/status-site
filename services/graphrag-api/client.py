"""
Python client library for GraphRAG API.
Can be used by backend services or CLI tools to interact with the API.

Usage:
    from client import GraphRAGClient
    client = GraphRAGClient(base_url="http://localhost:8001")

    # Query
    result = client.query("What are governance gaps?", strategy="vector_cypher")
    print(result.answer)

    # Status
    status = client.get_status()
    print(f"Nodes: {status.node_count}")
"""

import httpx
from typing import Optional
import asyncio


class QueryResult:
    """Query response wrapper."""
    def __init__(self, data: dict):
        self.answer = data.get("answer", "")
        self.context = data.get("context")

    def __repr__(self):
        return f"QueryResult(answer={self.answer[:50]}...)"


class StatusInfo:
    """Status response wrapper."""
    def __init__(self, data: dict):
        self.node_count = data.get("node_count", 0)
        self.relationship_count = data.get("relationship_count", 0)
        self.indexes = data.get("indexes", [])

    def __repr__(self):
        return f"StatusInfo(nodes={self.node_count}, rels={self.relationship_count})"


class GraphRAGClient:
    """Synchronous client for GraphRAG API."""

    def __init__(self, base_url: str = "http://localhost:8001", timeout: float = 30.0):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._client = httpx.Client(timeout=timeout)

    def close(self):
        """Close the underlying HTTP client."""
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()

    # ========================================================================
    # Health & Status
    # ========================================================================

    def health_check(self) -> dict:
        """Check API health."""
        resp = self._client.get(f"{self.base_url}/api/graphrag/health")
        resp.raise_for_status()
        return resp.json()

    def get_status(self) -> StatusInfo:
        """Get knowledge graph statistics."""
        resp = self._client.get(f"{self.base_url}/api/graphrag/status")
        resp.raise_for_status()
        return StatusInfo(resp.json())

    # ========================================================================
    # Setup
    # ========================================================================

    def setup_indexes(self) -> dict:
        """Initialize Neo4j indexes."""
        resp = self._client.post(f"{self.base_url}/api/graphrag/setup")
        resp.raise_for_status()
        return resp.json()

    # ========================================================================
    # Ingestion
    # ========================================================================

    def ingest_text(self, text: str) -> dict:
        """Ingest plain text."""
        resp = self._client.post(
            f"{self.base_url}/api/graphrag/ingest/text",
            params={"text": text}
        )
        resp.raise_for_status()
        return resp.json()

    def ingest_pdf(self, file_path: str) -> dict:
        """Ingest a PDF file."""
        with open(file_path, "rb") as f:
            resp = self._client.post(
                f"{self.base_url}/api/graphrag/ingest/pdf",
                files={"file": f}
            )
        resp.raise_for_status()
        return resp.json()

    def ingest_directory(self, directory: str, glob_pattern: str = "*.pdf") -> dict:
        """Ingest all files from a directory."""
        resp = self._client.post(
            f"{self.base_url}/api/graphrag/ingest/directory",
            params={"directory": directory, "glob_pattern": glob_pattern}
        )
        resp.raise_for_status()
        return resp.json()

    # ========================================================================
    # Querying
    # ========================================================================

    def query(
        self,
        question: str,
        strategy: str = "vector_cypher",
        top_k: int = 5,
        return_context: bool = False
    ) -> QueryResult:
        """Query the knowledge graph."""
        resp = self._client.post(
            f"{self.base_url}/api/graphrag/query",
            json={
                "question": question,
                "strategy": strategy,
                "top_k": top_k,
                "return_context": return_context
            }
        )
        resp.raise_for_status()
        return QueryResult(resp.json())


class AsyncGraphRAGClient:
    """Asynchronous client for GraphRAG API."""

    def __init__(self, base_url: str = "http://localhost:8001", timeout: float = 30.0):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._client = None

    async def _ensure_client(self):
        """Lazy initialize async client."""
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=self.timeout)
        return self._client

    async def close(self):
        """Close the underlying HTTP client."""
        if self._client:
            await self._client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        await self.close()

    # ========================================================================
    # Health & Status
    # ========================================================================

    async def health_check(self) -> dict:
        """Check API health."""
        client = await self._ensure_client()
        resp = await client.get(f"{self.base_url}/api/graphrag/health")
        resp.raise_for_status()
        return resp.json()

    async def get_status(self) -> StatusInfo:
        """Get knowledge graph statistics."""
        client = await self._ensure_client()
        resp = await client.get(f"{self.base_url}/api/graphrag/status")
        resp.raise_for_status()
        return StatusInfo(resp.json())

    # ========================================================================
    # Setup
    # ========================================================================

    async def setup_indexes(self) -> dict:
        """Initialize Neo4j indexes."""
        client = await self._ensure_client()
        resp = await client.post(f"{self.base_url}/api/graphrag/setup")
        resp.raise_for_status()
        return resp.json()

    # ========================================================================
    # Ingestion
    # ========================================================================

    async def ingest_text(self, text: str) -> dict:
        """Ingest plain text."""
        client = await self._ensure_client()
        resp = await client.post(
            f"{self.base_url}/api/graphrag/ingest/text",
            params={"text": text}
        )
        resp.raise_for_status()
        return resp.json()

    async def ingest_pdf(self, file_path: str) -> dict:
        """Ingest a PDF file."""
        client = await self._ensure_client()
        with open(file_path, "rb") as f:
            resp = await client.post(
                f"{self.base_url}/api/graphrag/ingest/pdf",
                files={"file": f}
            )
        resp.raise_for_status()
        return resp.json()

    async def ingest_directory(self, directory: str, glob_pattern: str = "*.pdf") -> dict:
        """Ingest all files from a directory."""
        client = await self._ensure_client()
        resp = await client.post(
            f"{self.base_url}/api/graphrag/ingest/directory",
            params={"directory": directory, "glob_pattern": glob_pattern}
        )
        resp.raise_for_status()
        return resp.json()

    # ========================================================================
    # Querying
    # ========================================================================

    async def query(
        self,
        question: str,
        strategy: str = "vector_cypher",
        top_k: int = 5,
        return_context: bool = False
    ) -> QueryResult:
        """Query the knowledge graph."""
        client = await self._ensure_client()
        resp = await client.post(
            f"{self.base_url}/api/graphrag/query",
            json={
                "question": question,
                "strategy": strategy,
                "top_k": top_k,
                "return_context": return_context
            }
        )
        resp.raise_for_status()
        return QueryResult(resp.json())


# ============================================================================
# CLI Examples
# ============================================================================

def example_sync():
    """Example: Synchronous usage."""
    with GraphRAGClient("http://localhost:8001") as client:
        # Health check
        health = client.health_check()
        print(f"Health: {health}")

        # Setup
        print("Setting up indexes...")
        client.setup_indexes()

        # Ingest
        print("Ingesting text...")
        client.ingest_text("AI governance requires control planes for runtime enforcement.")

        # Status
        status = client.get_status()
        print(f"Status: {status}")

        # Query
        result = client.query("What is AI governance?")
        print(f"Answer: {result.answer}")


async def example_async():
    """Example: Asynchronous usage."""
    async with AsyncGraphRAGClient("http://localhost:8001") as client:
        # Health check
        health = await client.health_check()
        print(f"Health: {health}")

        # Setup
        print("Setting up indexes...")
        await client.setup_indexes()

        # Ingest
        print("Ingesting text...")
        await client.ingest_text("AI governance requires control planes for runtime enforcement.")

        # Status
        status = await client.get_status()
        print(f"Status: {status}")

        # Query
        result = await client.query("What is AI governance?")
        print(f"Answer: {result.answer}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "async":
        asyncio.run(example_async())
    else:
        example_sync()
