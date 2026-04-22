from __future__ import annotations

import logging

from .graph_exporter import GraphExporter
from .json_projection_builder import JsonProjectionBuilder

logger = logging.getLogger(__name__)


def run_phase4(repo_root: str = ".") -> list[str]:
    logger.info("[EXPORT] Starting graph export and JSON projection build")
    exporter = GraphExporter()
    try:
        payload = exporter.export()
    finally:
        exporter.close()

    builder = JsonProjectionBuilder(repo_root=repo_root)
    files = builder.write(payload)
    for file in files:
        logger.info("[EXPORT] Wrote %s", file)
    return [str(f) for f in files]
