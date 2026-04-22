from __future__ import annotations

from typing import Any

from ..base_agent import BaseAgent


class TogafAgent(BaseAgent):
    agent_id = "togaf-core"
    display_name = "TOGAF Core Architecture Agent"

    def evaluate(self, submission: dict[str, Any], evidence: list[dict[str, Any]]) -> dict[str, Any]:
        text = (submission.get("description", "") + " " + submission.get("title", "")).lower()
        fit_score = 0.5
        gaps = []
        risks = []
        requirements = []

        if "governance" in text:
            fit_score += 0.2
        else:
            gaps.append("Governance model is not explicitly defined")

        if "stakeholder" in text or "owner" in text:
            fit_score += 0.1
        else:
            requirements.append("Identify accountable stakeholders and decision rights")

        if "timeline" not in text and "roadmap" not in text:
            risks.append("No transition roadmap provided for target architecture")
            fit_score -= 0.1

        recommendation = "approve" if fit_score >= 0.72 else "approve_with_conditions" if fit_score >= 0.6 else "needs_revision"
        rationale = "TOGAF fit based on governance, ownership model, and transition-state clarity."

        return {
            "agent_id": self.agent_id,
            "display_name": self.display_name,
            "fit_score": round(max(min(fit_score, 1.0), 0.0), 3),
            "gaps": gaps,
            "risks": risks,
            "requirements": requirements,
            "recommendation": recommendation,
            "rationale": rationale,
            "evidence_count": len(evidence),
        }
