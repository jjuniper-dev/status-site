from __future__ import annotations

from typing import Any


def generate_scenarios(submission: dict[str, Any], summary: dict[str, Any], assessments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    scenario_id = f"scn-{submission['submission_id']}"
    risk_count = sum(len(a.get("risks", [])) for a in assessments)
    scenario = {
        "scenario_id": scenario_id,
        "title": f"{submission.get('title', 'Submission')} delivery scenario",
        "description": "Generated scenario based on multi-agent architecture screening.",
        "risk_level": "high" if risk_count >= 2 else "medium" if risk_count == 1 else "low",
        "evidence_basis": len(assessments),
        "fit_score_avg": summary.get("fit_score_avg", 0.0),
    }
    return [scenario]
