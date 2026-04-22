from __future__ import annotations

import importlib
import json
import logging
from pathlib import Path

from .base_agent import BaseAgent

logger = logging.getLogger(__name__)


def load_agents(registry_path: str | Path | None = None) -> list[BaseAgent]:
    registry_file = Path(registry_path or Path(__file__).with_name("agent_registry.json"))
    payload = json.loads(registry_file.read_text(encoding="utf-8"))
    loaded: list[BaseAgent] = []

    for agent_def in payload.get("agents", []):
        if not agent_def.get("enabled", True):
            continue
        class_path = agent_def.get("class_path", "")
        try:
            module_path, class_name = class_path.rsplit(".", 1)
            module = importlib.import_module(module_path)
            cls = getattr(module, class_name)
            instance = cls()
            if not isinstance(instance, BaseAgent):
                raise TypeError(f"{class_path} is not a BaseAgent")
            loaded.append(instance)
            logger.info("[AGENT:%s] Loaded %s", agent_def.get("id", "unknown"), class_path)
        except Exception as exc:  # graceful failure by design
            logger.exception("[AGENT:%s] Failed to load agent '%s': %s", agent_def.get("id", "unknown"), class_path, exc)
    return loaded
