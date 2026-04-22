from __future__ import annotations


def build_recommendation(submission: dict, scenario: dict, rubric: dict) -> dict:
    score = float(rubric.get("score", 0.0))
    if score >= 0.78:
        outcome = "proceed"
    elif score >= 0.58:
        outcome = "proceed_with_mitigations"
    else:
        outcome = "defer"

    return {
        "recommendation_id": f"rec-{scenario['scenario_id']}",
        "submission_id": submission["submission_id"],
        "submission_title": submission.get("title", "Untitled"),
        "outcome": outcome,
        "rationale": f"Outcome derived from rubric verdict '{rubric.get('verdict')}' and score {score}.",
        "score": score,
        "recommendation_type": outcome,
    }
