from __future__ import annotations

from typing import Any

from ..base_agent import BaseAgent


class AzureMcpAgent(BaseAgent):
    agent_id = "azure-mcp"
    display_name = "Azure MCP Architecture Agent"

    def evaluate(self, submission: dict[str, Any], evidence: list[dict[str, Any]]) -> dict[str, Any]:
        text = (submission.get("description", "") + " " + submission.get("title", "")).lower()
        fit_score = 0.55
        gaps = []
        risks = []
        requirements = []

        if "azure" in text:
            fit_score += 0.18
            requirements.append("Confirm Azure landing zone and policy assignments")
        else:
            gaps.append("Cloud provider strategy is underspecified for Azure operations")

        if "security" not in text and "compliance" not in text:
            fit_score -= 0.12
            risks.append("Security and compliance controls are not explicitly documented")

        if "budget" not in text:
            fit_score -= 0.05
            requirements.append("Provide infrastructure cost envelope")

        recommendation = "approve_with_conditions" if fit_score >= 0.62 else "needs_revision"
        rationale = "Azure readiness weighted by cloud alignment, controls, and operating detail."

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
