"""
Retriever Factory -- 4 strategies for GraphRAG querying.
"""

import logging
from enum import Enum

import neo4j
from neo4j_graphrag.embeddings import OpenAIEmbeddings
from neo4j_graphrag.retrievers import (
    HybridCypherRetriever, HybridRetriever,
    VectorCypherRetriever, VectorRetriever,
)
from config import PipelineConfig

logger = logging.getLogger(__name__)


class RetrieverStrategy(str, Enum):
    VECTOR = "vector"
    VECTOR_CYPHER = "vector_cypher"
    HYBRID = "hybrid"
    HYBRID_CYPHER = "hybrid_cypher"


DEFAULT_RETRIEVAL_QUERY = """
WITH node AS chunk, score
OPTIONAL MATCH (chunk)<-[:FROM_CHUNK]-(entity)
OPTIONAL MATCH (entity)-[rel:!FROM_CHUNK]->(related)
WITH chunk, score,
     collect(DISTINCT entity {.*, labels: labels(entity)}) AS entities,
     collect(DISTINCT {
         type: type(rel), source: entity.name,
         target: related.name, properties: properties(rel)
     }) AS relationships
RETURN chunk.text AS text, score,
       {source: chunk.source, page: chunk.page} AS metadata,
       entities, relationships
"""


def _create_embedder(cfg: PipelineConfig):
    if cfg.embedding.provider == "openai":
        return OpenAIEmbeddings(model=cfg.embedding.model)
    elif cfg.embedding.provider == "sentence-transformers":
        from neo4j_graphrag.embeddings import SentenceTransformerEmbeddings
        return SentenceTransformerEmbeddings(model=cfg.embedding.st_model)
    else:
        raise ValueError(f"Unsupported embedding provider: {cfg.embedding.provider}")


class RetrieverFactory:
    def __init__(self, cfg: PipelineConfig, driver: neo4j.Driver):
        self.cfg = cfg
        self.driver = driver
        self.embedder = _create_embedder(cfg)

    def build(self, strategy: RetrieverStrategy = RetrieverStrategy.VECTOR_CYPHER,
              retrieval_query: str | None = None,
              return_properties: list[str] | None = None):
        props = return_properties or ["text"]
        query = retrieval_query or DEFAULT_RETRIEVAL_QUERY

        match strategy:
            case RetrieverStrategy.VECTOR:
                return VectorRetriever(
                    driver=self.driver, index_name=self.cfg.index.vector_index_name,
                    embedder=self.embedder, return_properties=props,
                )
            case RetrieverStrategy.VECTOR_CYPHER:
                return VectorCypherRetriever(
                    driver=self.driver, index_name=self.cfg.index.vector_index_name,
                    embedder=self.embedder, retrieval_query=query,
                )
            case RetrieverStrategy.HYBRID:
                return HybridRetriever(
                    driver=self.driver, vector_index_name=self.cfg.index.vector_index_name,
                    fulltext_index_name=self.cfg.index.fulltext_index_name,
                    embedder=self.embedder, return_properties=props,
                )
            case RetrieverStrategy.HYBRID_CYPHER:
                return HybridCypherRetriever(
                    driver=self.driver, vector_index_name=self.cfg.index.vector_index_name,
                    fulltext_index_name=self.cfg.index.fulltext_index_name,
                    embedder=self.embedder, retrieval_query=query,
                )
