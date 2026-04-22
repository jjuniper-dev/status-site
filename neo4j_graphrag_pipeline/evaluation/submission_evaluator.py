from __future__ import annotations

import hashlib
import logging
from datetime import datetime, timezone
from typing import Any

import neo4j

from ..config import PipelineConfig, load_config
from .agent_loader import load_agents
from .disagreement_engine import compute_disagreement
from .summary_builder import build_summary

logger = logging.getLogger(__name__)


class SubmissionEvaluator:
    def __init__(self, cfg: PipelineConfig | None = None):
        self.cfg = cfg or load_config()
        self.driver = neo4j.GraphDatabase.driver(
            self.cfg.neo4j.uri,
            auth=(self.cfg.neo4j.username, self.cfg.neo4j.password),
        )
        self.agents = load_agents()

    def _submission_id(self, submission: dict[str, Any]) -> str:
        stable = f"{submission.get('title','')}-{submission.get('description','')}"
        return hashlib.sha256(stable.encode("utf-8")).hexdigest()[:16]

    def _retrieve_evidence(self, submission: dict[str, Any]) -> list[dict[str, Any]]:
        logger.info("[RETRIEVAL] Retrieving supporting context")
        try:
            with self.driver.session(database=self.cfg.neo4j.database) as session:
                result = session.run(
                    "MATCH (c:Chunk) RETURN c.text AS text, c.source AS source LIMIT 5"
                )
                return [dict(r) for r in result]
        except Exception as exc:
            logger.exception("[RETRIEVAL] Retrieval failed, continuing without evidence: %s", exc)
            return []

    def evaluate_submission(self, submission: dict[str, Any]) -> dict[str, Any]:
        submission_id = self._submission_id(submission)
        now = datetime.now(timezone.utc).isoformat()
        logger.info("[SUBMISSION] Processing submission_id=%s", submission_id)

        evidence = self._retrieve_evidence(submission)

        assessments: list[dict[str, Any]] = []
        for agent in self.agents:
            try:
                logger.info("[AGENT:%s] Running evaluation", agent.agent_id)
                assessment = agent.evaluate(submission, evidence)
                assessment["assessment_id"] = hashlib.sha256(
                    f"{submission_id}:{agent.agent_id}".encode("utf-8")
                ).hexdigest()[:20]
                assessments.append(assessment)
            except Exception as exc:
                logger.exception("[AGENT:%s] Execution failed; continuing pipeline: %s", agent.agent_id, exc)

        disagreement_score = compute_disagreement(assessments)
        logger.info("[DISAGREEMENT] score=%s", disagreement_score)
        summary = build_summary(assessments, disagreement_score)
        summary_id = hashlib.sha256(f"summary:{submission_id}".encode("utf-8")).hexdigest()[:20]

        try:
            self._persist(submission_id, submission, now, assessments, summary_id, summary)
        except Exception as exc:
            logger.exception("[SUBMISSION] Neo4j persistence failed: %s", exc)
            raise

        return {
            "submission_id": submission_id,
            "submitted_at": now,
            "assessments": assessments,
            "summary": summary,
        }

    def _persist(
        self,
        submission_id: str,
        submission: dict[str, Any],
        now: str,
        assessments: list[dict[str, Any]],
        summary_id: str,
        summary: dict[str, Any],
    ) -> None:
        with self.driver.session(database=self.cfg.neo4j.database) as session:
            session.run(
                """
                MERGE (s:Submission {submission_id: $submission_id})
                SET s.title = $title,
                    s.description = $description,
                    s.owner = $owner,
                    s.created_at = $created_at
                """,
                submission_id=submission_id,
                title=submission.get("title", "Untitled submission"),
                description=submission.get("description", ""),
                owner=submission.get("owner", "unknown"),
                created_at=now,
            )

            for item in assessments:
                session.run(
                    """
                    MATCH (s:Submission {submission_id: $submission_id})
                    MERGE (a:AgentAssessment {assessment_id: $assessment_id})
                    SET a.agent_id = $agent_id,
                        a.display_name = $display_name,
                        a.fit_score = $fit_score,
                        a.recommendation = $recommendation,
                        a.rationale = $rationale,
                        a.evidence_count = $evidence_count,
                        a.updated_at = $updated_at
                    MERGE (s)-[:HAS_ASSESSMENT]->(a)
                    """,
                    submission_id=submission_id,
                    updated_at=now,
                    **item,
                )

                self._persist_items(session, submission_id, item["assessment_id"], "Gap", "gaps", item.get("gaps", []), now)
                self._persist_items(session, submission_id, item["assessment_id"], "Risk", "risks", item.get("risks", []), now)
                self._persist_items(session, submission_id, item["assessment_id"], "Requirement", "requirements", item.get("requirements", []), now)

            session.run(
                """
                MATCH (s:Submission {submission_id: $submission_id})
                MERGE (sum:EvaluationSummary {summary_id: $summary_id})
                SET sum.fit_score_avg = $fit_score_avg,
                    sum.disagreement_score = $disagreement_score,
                    sum.requires_human_review = $requires_human_review,
                    sum.top_recommendation = $top_recommendation,
                    sum.updated_at = $updated_at
                MERGE (s)-[:HAS_SUMMARY]->(sum)
                WITH s, sum
                MATCH (s)-[:HAS_ASSESSMENT]->(a:AgentAssessment)
                MERGE (sum)-[:SUMMARIZES]->(a)
                """,
                submission_id=submission_id,
                summary_id=summary_id,
                updated_at=now,
                **summary,
            )

    def _persist_items(self, session, submission_id: str, assessment_id: str, label: str, field: str, values: list[str], now: str) -> None:
        for value in values:
            node_id = hashlib.sha256(f"{submission_id}:{assessment_id}:{field}:{value}".encode("utf-8")).hexdigest()[:24]
            session.run(
                f"""
                MATCH (a:AgentAssessment {{assessment_id: $assessment_id}})
                MERGE (n:{label} {{item_id: $item_id}})
                SET n.text = $text,
                    n.updated_at = $updated_at
                MERGE (a)-[:HAS_{label.upper()}]->(n)
                """,
                assessment_id=assessment_id,
                item_id=node_id,
                text=value,
                updated_at=now,
            )

    def close(self) -> None:
        self.driver.close()
