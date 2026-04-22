"""
Index Manager — creates and manages Neo4j vector and fulltext indexes.
"""

import logging
from typing import Optional

import neo4j
from neo4j_graphrag.indexes import create_vector_index, create_fulltext_index, upsert_vectors
from neo4j_graphrag.types import EntityType

from .config import PipelineConfig

logger = logging.getLogger(__name__)


class IndexManager:
    def __init__(self, cfg: PipelineConfig, driver: neo4j.Driver):
        self.cfg = cfg
        self.driver = driver

    def create_vector_index(self, name: Optional[str] = None, label: str = "Chunk",
                            embedding_property: str = "embedding") -> None:
        idx_name = name or self.cfg.index.vector_index_name
        logger.info("Creating vector index '%s' on :%s.%s (%d dims, %s)",
                     idx_name, label, embedding_property,
                     self.cfg.embedding.dimensions, self.cfg.index.similarity_fn)
        create_vector_index(
            driver=self.driver, name=idx_name, label=label,
            embedding_property=embedding_property,
            dimensions=self.cfg.embedding.dimensions,
            similarity_fn=self.cfg.index.similarity_fn,
        )

    def create_fulltext_index(self, name: Optional[str] = None, label: str = "Chunk",
                              text_properties: Optional[list[str]] = None) -> None:
        idx_name = name or self.cfg.index.fulltext_index_name
        props = text_properties or ["text"]
        create_fulltext_index(
            driver=self.driver, name=idx_name, label=label, node_properties=props,
        )

    def upsert_vectors(self, ids: list[str], embeddings: list[list[float]],
                       embedding_property: str = "embedding") -> None:
        upsert_vectors(
            driver=self.driver, ids=ids, embedding_property=embedding_property,
            embeddings=embeddings, entity_type=EntityType.NODE,
        )

    def list_indexes(self) -> list[dict]:
        with self.driver.session(database=self.cfg.neo4j.database) as session:
            result = session.run("SHOW INDEXES YIELD name, type, labelsOrTypes, properties")
            return [dict(record) for record in result]

    def setup_indexes(self, label: str = "Chunk") -> None:
        self.create_vector_index(label=label)
        self.create_fulltext_index(label=label)
        logger.info("All indexes ready.")
