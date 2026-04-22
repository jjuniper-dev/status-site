from __future__ import annotations

import json
from pathlib import Path


class JsonProjectionBuilder:
    def __init__(self, repo_root: str | Path = "."):
        self.root = Path(repo_root)
        self.data_dir = self.root / "data"
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def write(self, payload: dict) -> list[Path]:
        files = {
            "submissions.json": {"submissions": payload.get("submissions", [])},
            "recommendations.json": {"recommendations": payload.get("recommendations", [])},
            "generated-scenarios.json": {"scenarios": payload.get("generated_scenarios", [])},
            "generated-decisions.json": {"decisions": payload.get("generated_decisions", [])},
            "evaluation-summaries.json": {"summaries": payload.get("evaluation_summaries", [])},
        }
        written = []
        for filename, content in files.items():
            out = self.data_dir / filename
            out.write_text(json.dumps(content, indent=2), encoding="utf-8")
            written.append(out)
        return written
