"""
Knowledge Graph Builder — extracts entities/relationships from text/PDFs,
generates embeddings, and writes into Neo4j via SimpleKGPipeline.
"""

import asyncio
import logging
from pathlib import Path

import neo4j
from neo4j_graphrag.embeddings import OpenAIEmbeddings
from neo4j_graphrag.experimental.pipeline.kg_builder import SimpleKGPipeline
from neo4j_graphrag.llm import OpenAILLM

from .config import PipelineConfig

logger = logging.getLogger(__name__)


def _create_embedder(cfg: PipelineConfig):
    if cfg.embedding.provider == "openai":
        return OpenAIEmbeddings(model=cfg.embedding.model)
    elif cfg.embedding.provider == "sentence-transformers":
        from neo4j_graphrag.embeddings import SentenceTransformerEmbeddings
        return SentenceTransformerEmbeddings(model=cfg.embedding.st_model)
    else:
        raise ValueError(f"Unsupported embedding provider: {cfg.embedding.provider}")


def _create_llm(cfg: PipelineConfig):
    if cfg.llm.provider == "openai":
        return OpenAILLM(
            model_name=cfg.llm.model,
            model_params={
                "temperature": cfg.llm.temperature,
                "max_tokens": cfg.llm.max_tokens,
            },
        )
    else:
        raise ValueError(f"Unsupported LLM provider: {cfg.llm.provider}")


class KnowledgeGraphBuilder:
    def __init__(self, cfg: PipelineConfig, driver: neo4j.Driver):
        self.cfg = cfg
        self.driver = driver
        self.embedder = _create_embedder(cfg)
        self.llm = _create_llm(cfg)

        self.pipeline = SimpleKGPipeline(
            llm=self.llm,
            driver=self.driver,
            embedder=self.embedder,
            entities=cfg.schema.node_labels,
            relations=cfg.schema.relationship_types,
            on_error="IGNORE",
            perform_entity_resolution=True,
        )
        logger.info("KnowledgeGraphBuilder initialised.")

    async def ingest_text(self, text: str) -> dict:
        logger.info("Ingesting text (%d chars)...", len(text))
        result = await self.pipeline.run_async(text=text)
        logger.info("Text ingestion complete.")
        return result

    async def ingest_pdf(self, path: str | Path) -> dict:
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"PDF not found: {path}")
        logger.info("Ingesting PDF: %s", path)
        result = await self.pipeline.run_async(file_path=str(path))
        logger.info("PDF ingestion complete: %s", path.name)
        return result

    async def ingest_directory(self, directory: str | Path, glob: str = "*.pdf") -> list[dict]:
        directory = Path(directory)
        files = sorted(directory.glob(glob))
        logger.info("Found %d files matching '%s' in %s", len(files), glob, directory)
        results = []
        for f in files:
            res = await self.ingest_pdf(f)
            results.append(res)
        return results

    @staticmethod
    def chunk_text(text: str, size: int = 1000, overlap: int = 200) -> list[str]:
        chunks, start = [], 0
        while start < len(text):
            chunks.append(text[start:start + size])
            start += size - overlap
        return chunks
