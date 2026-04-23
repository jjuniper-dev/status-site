"""
FastAPI wrapper for Neo4j GraphRAG Pipeline.
Provides REST API endpoints for document ingestion, querying, and graph management.

Usage:
    uvicorn app:app --host 0.0.0.0 --port 8001 --reload

Endpoints:
    POST   /api/graphrag/setup              - Initialize indexes
    POST   /api/graphrag/ingest/text        - Ingest text content
    POST   /api/graphrag/ingest/pdf         - Ingest PDF file
    POST   /api/graphrag/ingest/directory   - Ingest directory of PDFs
    POST   /api/graphrag/query              - Query the knowledge graph
    GET    /api/graphrag/status             - Get graph statistics
    GET    /api/graphrag/health             - Health check
"""

import os
import asyncio
import logging
from pathlib import Path
from typing import Optional
import sys

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Add parent directory to path to import graphrag_pipeline
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "neo4j_graphrag_pipeline"))

from graphrag_pipeline import GraphRAGPipeline
from retrievers import RetrieverStrategy
from config import load_config

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%H:%M:%S",
)

app = FastAPI(
    title="Neo4j GraphRAG API",
    description="REST API for knowledge graph ingestion and retrieval",
    version="1.0.0",
)

# CORS middleware for web UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global pipeline instance
pipeline = None


def get_pipeline() -> GraphRAGPipeline:
    """Lazy initialization of pipeline."""
    global pipeline
    if pipeline is None:
        try:
            pipeline = GraphRAGPipeline(cfg=load_config())
            logger.info("GraphRAG Pipeline initialized")
        except Exception as e:
            logger.error(f"Failed to initialize pipeline: {e}")
            raise HTTPException(status_code=500, detail=f"Pipeline init failed: {str(e)}")
    return pipeline


# ============================================================================
# Pydantic Models
# ============================================================================

class QueryRequest(BaseModel):
    question: str
    strategy: str = "vector_cypher"
    top_k: int = 5
    return_context: bool = False


class QueryResponse(BaseModel):
    answer: str
    context: Optional[dict] = None


class StatusResponse(BaseModel):
    node_count: int
    relationship_count: int
    indexes: list


class IngestResponse(BaseModel):
    success: bool
    message: str
    chunks: int = 0


# ============================================================================
# Setup Endpoints
# ============================================================================

@app.post("/api/graphrag/setup")
async def setup_indexes():
    """Initialize Neo4j indexes for GraphRAG."""
    try:
        pipeline = get_pipeline()
        pipeline.setup()
        return {"success": True, "message": "Indexes created successfully"}
    except Exception as e:
        logger.error(f"Setup failed: {e}")
        raise HTTPException(status_code=500, detail=f"Setup failed: {str(e)}")


# ============================================================================
# Ingestion Endpoints
# ============================================================================

@app.post("/api/graphrag/ingest/text", response_model=IngestResponse)
async def ingest_text(text: str, background_tasks: BackgroundTasks):
    """Ingest plain text content into the knowledge graph."""
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Text content required")

    try:
        pipeline = get_pipeline()

        async def async_ingest():
            result = await pipeline.ingest_text(text)
            logger.info(f"Text ingestion complete: {result}")

        # Run asynchronously in background
        background_tasks.add_task(asyncio.create_task, async_ingest())

        return IngestResponse(
            success=True,
            message="Text ingestion started",
            chunks=1
        )
    except Exception as e:
        logger.error(f"Text ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=f"Ingest failed: {str(e)}")


@app.post("/api/graphrag/ingest/pdf", response_model=IngestResponse)
async def ingest_pdf(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    """Ingest PDF file into the knowledge graph."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDF file required")

    # Create temp directory for uploads
    temp_dir = Path("/tmp/graphrag_uploads")
    temp_dir.mkdir(exist_ok=True)

    try:
        # Save uploaded file temporarily
        file_path = temp_dir / file.filename
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        pipeline = get_pipeline()

        async def async_ingest():
            try:
                result = await pipeline.ingest_pdf(file_path)
                logger.info(f"PDF ingestion complete: {file.filename}")
                # Clean up temp file
                file_path.unlink(missing_ok=True)
            except Exception as e:
                logger.error(f"PDF ingestion failed: {e}")
                file_path.unlink(missing_ok=True)

        if background_tasks:
            background_tasks.add_task(asyncio.create_task, async_ingest())
        else:
            await async_ingest()

        return IngestResponse(
            success=True,
            message=f"PDF ingestion started: {file.filename}",
            chunks=0
        )
    except Exception as e:
        logger.error(f"PDF upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"PDF ingest failed: {str(e)}")


@app.post("/api/graphrag/ingest/directory", response_model=IngestResponse)
async def ingest_directory(directory: str, glob_pattern: str = "*.pdf", background_tasks: BackgroundTasks = None):
    """Ingest all files from a directory (e.g., PDFs)."""
    dir_path = Path(directory)

    if not dir_path.exists():
        raise HTTPException(status_code=400, detail=f"Directory not found: {directory}")

    try:
        pipeline = get_pipeline()

        async def async_ingest():
            results = await pipeline.ingest_directory(dir_path, glob_pattern)
            logger.info(f"Directory ingestion complete: {len(results)} files processed")

        if background_tasks:
            background_tasks.add_task(asyncio.create_task, async_ingest())
        else:
            await async_ingest()

        return IngestResponse(
            success=True,
            message=f"Directory ingestion started: {directory}",
            chunks=0
        )
    except Exception as e:
        logger.error(f"Directory ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=f"Directory ingest failed: {str(e)}")


# ============================================================================
# Query Endpoints
# ============================================================================

@app.post("/api/graphrag/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """Query the knowledge graph with retrieval and LLM generation."""
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question required")

    try:
        pipeline = get_pipeline()

        # Validate strategy
        try:
            strategy = RetrieverStrategy(request.strategy)
        except ValueError:
            valid_strategies = [s.value for s in RetrieverStrategy]
            raise HTTPException(
                status_code=400,
                detail=f"Invalid strategy. Valid: {', '.join(valid_strategies)}"
            )

        result = pipeline.query(
            question=request.question,
            strategy=strategy,
            top_k=request.top_k,
            return_context=request.return_context,
        )

        return QueryResponse(
            answer=result.get("answer", ""),
            context=result.get("context")
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Query failed: {e}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")


# ============================================================================
# Status & Admin Endpoints
# ============================================================================

@app.get("/api/graphrag/status", response_model=StatusResponse)
async def get_status():
    """Get knowledge graph statistics and index status."""
    try:
        pipeline = get_pipeline()
        status = pipeline.status()

        return StatusResponse(
            node_count=status.get("node_count", 0),
            relationship_count=status.get("relationship_count", 0),
            indexes=status.get("indexes", [])
        )
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")


@app.get("/api/graphrag/health")
async def health_check():
    """Health check endpoint."""
    try:
        pipeline = get_pipeline()
        status = pipeline.status()
        return {
            "status": "ok",
            "neo4j_connected": True,
            "nodes": status.get("node_count", 0),
        }
    except Exception as e:
        logger.warning(f"Health check: neo4j unreachable: {e}")
        return {
            "status": "degraded",
            "neo4j_connected": False,
            "error": str(e)
        }, 503


@app.on_event("shutdown")
async def shutdown():
    """Clean up pipeline on shutdown."""
    global pipeline
    if pipeline:
        pipeline.close()
        logger.info("Pipeline closed")


# ============================================================================
# Root & Documentation
# ============================================================================

@app.get("/")
async def root():
    """API documentation."""
    return {
        "service": "Neo4j GraphRAG API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "setup": "POST /api/graphrag/setup",
            "ingest_text": "POST /api/graphrag/ingest/text",
            "ingest_pdf": "POST /api/graphrag/ingest/pdf",
            "ingest_directory": "POST /api/graphrag/ingest/directory",
            "query": "POST /api/graphrag/query",
            "status": "GET /api/graphrag/status",
            "health": "GET /api/graphrag/health",
        }
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
