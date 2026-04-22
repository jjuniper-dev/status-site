from __future__ import annotations


def build_summary(assessments: list[dict], disagreement_score: float) -> dict:
    fit_scores = [float(item.get("fit_score", 0.0)) for item in assessments]
    avg = round(sum(fit_scores) / len(fit_scores), 3) if fit_scores else 0.0
    requires_human_review = disagreement_score >= 0.22 or avg < 0.62
    top_recommendation = "approve_with_conditions"
    if avg >= 0.75 and disagreement_score < 0.15:
        top_recommendation = "approve"
    elif avg < 0.58:
        top_recommendation = "needs_revision"

    return {
        "fit_score_avg": avg,
        "disagreement_score": disagreement_score,
        "requires_human_review": requires_human_review,
        "top_recommendation": top_recommendation,
    }
