from __future__ import annotations

from typing import Any


def score_scenario(scenario: dict[str, Any], summary: dict[str, Any]) -> dict[str, Any]:
    fit = float(summary.get("fit_score_avg", 0.0))
    disagreement = float(summary.get("disagreement_score", 0.0))
    risk_modifier = {"low": 0.15, "medium": 0.0, "high": -0.15}.get(scenario.get("risk_level", "medium"), 0.0)
    rubric_score = round(max(0.0, min(1.0, fit - disagreement + risk_modifier)), 3)
    return {
        "rubric_id": f"rub-{scenario['scenario_id']}",
        "criteria": {
            "architectural_fit": fit,
            "review_alignment": round(1 - disagreement, 3),
            "risk_adjustment": risk_modifier,
        },
        "score": rubric_score,
        "verdict": "strong" if rubric_score >= 0.75 else "conditional" if rubric_score >= 0.58 else "weak",
    }
