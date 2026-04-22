from __future__ import annotations

import logging
from datetime import datetime, timezone

import neo4j

from ..config import load_config
from .recommendation_engine import build_recommendation
from .rubric_engine import score_scenario
from .scenario_generator import generate_scenarios

logger = logging.getLogger(__name__)


class Phase3Runner:
    def __init__(self):
        cfg = load_config()
        self.cfg = cfg
        self.driver = neo4j.GraphDatabase.driver(
            cfg.neo4j.uri,
            auth=(cfg.neo4j.username, cfg.neo4j.password),
        )

    def run(self) -> int:
        processed = 0
        now = datetime.now(timezone.utc).isoformat()
        with self.driver.session(database=self.cfg.neo4j.database) as session:
            rows = session.run(
                """
                MATCH (s:Submission)-[:HAS_SUMMARY]->(sum:EvaluationSummary)
                OPTIONAL MATCH (s)-[:HAS_ASSESSMENT]->(a:AgentAssessment)
                WITH s, sum, collect(a) AS assessments
                RETURN s, sum, assessments
                """
            )
            for row in rows:
                s = dict(row["s"])
                summary = dict(row["sum"])
                assessments = [dict(a) for a in row["assessments"] if a is not None]

                logger.info("[SCENARIO] Generating scenario for submission_id=%s", s["submission_id"])
                scenarios = generate_scenarios(s, summary, assessments)
                for scenario in scenarios:
                    rubric = score_scenario(scenario, summary)
                    logger.info("[RUBRIC] rubric_score=%s for %s", rubric["score"], scenario["scenario_id"])
                    recommendation = build_recommendation(s, scenario, rubric)
                    logger.info("[RECOMMENDATION] outcome=%s for %s", recommendation["outcome"], scenario["scenario_id"])
                    session.run(
                        """
                        MATCH (s:Submission {submission_id: $submission_id})
                        MERGE (scn:Scenario {scenario_id: $scenario_id})
                        SET scn += $scenario,
                            scn.updated_at = $updated_at
                        MERGE (s)-[:LEADS_TO]->(scn)
                        MERGE (rub:RubricEvaluation {rubric_id: $rubric_id})
                        SET rub.criteria = $criteria,
                            rub.score = $score,
                            rub.verdict = $verdict,
                            rub.updated_at = $updated_at
                        MERGE (scn)-[:BASED_ON]->(rub)
                        MERGE (rec:Recommendation {recommendation_id: $recommendation_id})
                        SET rec += $recommendation,
                            rec.updated_at = $updated_at
                        MERGE (rub)-[:RESULTS_IN]->(rec)
                        MERGE (s)-[:HAS_RECOMMENDATION]->(rec)
                        """,
                        submission_id=s["submission_id"],
                        scenario_id=scenario["scenario_id"],
                        scenario=scenario,
                        updated_at=now,
                        rubric_id=rubric["rubric_id"],
                        criteria=rubric["criteria"],
                        score=rubric["score"],
                        verdict=rubric["verdict"],
                        recommendation_id=recommendation["recommendation_id"],
                        recommendation=recommendation,
                    )
                    processed += 1
        return processed

    def close(self) -> None:
        self.driver.close()
