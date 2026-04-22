from __future__ import annotations

from statistics import pstdev


def compute_disagreement(assessments: list[dict]) -> float:
    if len(assessments) <= 1:
        return 0.0
    scores = [float(item.get("fit_score", 0.0)) for item in assessments]
    score_dispersion = pstdev(scores)
    recommendations = {item.get("recommendation", "") for item in assessments}
    rec_divergence = 0.2 if len(recommendations) > 1 else 0.0
    return round(min(1.0, score_dispersion + rec_divergence), 3)
