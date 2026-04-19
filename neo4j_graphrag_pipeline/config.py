"""
Configuration module for Neo4j GraphRAG Pipeline.
Loads settings from environment variables with sensible defaults.
"""

import os
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Neo4jConfig:
    uri: str = field(default_factory=lambda: os.getenv("NEO4J_URI", "neo4j://localhost:7687"))
    username: str = field(default_factory=lambda: os.getenv("NEO4J_USERNAME", "neo4j"))
    password: str = field(default_factory=lambda: os.getenv("NEO4J_PASSWORD", "password"))
    database: str = field(default_factory=lambda: os.getenv("NEO4J_DATABASE", "neo4j"))


@dataclass
class EmbeddingConfig:
    provider: str = field(default_factory=lambda: os.getenv("EMBEDDING_PROVIDER", "openai"))
    model: str = field(default_factory=lambda: os.getenv("EMBEDDING_MODEL", "text-embedding-3-large"))
    dimensions: int = field(default_factory=lambda: int(os.getenv("EMBEDDING_DIMENSIONS", "3072")))
    st_model: str = field(default_factory=lambda: os.getenv("ST_MODEL", "all-MiniLM-L6-v2"))


@dataclass
class LLMConfig:
    provider: str = field(default_factory=lambda: os.getenv("LLM_PROVIDER", "openai"))
    model: str = field(default_factory=lambda: os.getenv("LLM_MODEL", "gpt-4o"))
    temperature: float = field(default_factory=lambda: float(os.getenv("LLM_TEMPERATURE", "0.0")))
    max_tokens: int = field(default_factory=lambda: int(os.getenv("LLM_MAX_TOKENS", "2000")))


@dataclass
class IndexConfig:
    vector_index_name: str = field(default_factory=lambda: os.getenv("VECTOR_INDEX_NAME", "document_embeddings"))
    fulltext_index_name: str = field(default_factory=lambda: os.getenv("FULLTEXT_INDEX_NAME", "document_fulltext"))
    similarity_fn: str = "cosine"


@dataclass
class SchemaConfig:
    node_labels: list[str] = field(default_factory=lambda: [
        "Document", "Chunk", "Entity", "Person", "Organization",
        "Location", "Concept", "Event", "Technology",
    ])
    relationship_types: list[str] = field(default_factory=lambda: [
        "MENTIONS", "RELATES_TO", "PART_OF", "LOCATED_IN",
        "WORKS_FOR", "AUTHORED", "ASSOCIATED_WITH", "DEPENDS_ON",
        "PRECEDED_BY", "FOLLOWED_BY", "CONTAINS",
    ])
    chunk_size: int = field(default_factory=lambda: int(os.getenv("CHUNK_SIZE", "1000")))
    chunk_overlap: int = field(default_factory=lambda: int(os.getenv("CHUNK_OVERLAP", "200")))

            
@dataclass
class PipelineConfig:
    neo4j: Neo4jConfig = field(default_factory=Neo4jConfig)
    embedding: EmbeddingConfig = field(default_factory=EmbeddingConfig)
    llm: LLMConfig = field(default_factory=LLMConfig)
    index: IndexConfig = field(default_factory=IndexConfig)
    schema: SchemaConfig = field(default_factory=SchemaConfig)
    log_level: str = field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))


def load_config() -> PipelineConfig:
    return PipelineConfig()
