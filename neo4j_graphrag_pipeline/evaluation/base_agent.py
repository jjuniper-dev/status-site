from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class BaseAgent(ABC):
    """Common interface for all architecture evaluation agents."""

    agent_id: str
    display_name: str

    @abstractmethod
    def evaluate(self, submission: dict[str, Any], evidence: list[dict[str, Any]]) -> dict[str, Any]:
        """Return normalized assessment output for a submission."""
