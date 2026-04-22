from __future__ import annotations

import neo4j

from ..config import load_config


class GraphExporter:
    def __init__(self):
        cfg = load_config()
        self.cfg = cfg
        self.driver = neo4j.GraphDatabase.driver(
            cfg.neo4j.uri,
            auth=(cfg.neo4j.username, cfg.neo4j.password),
        )

    def export(self) -> dict:
        with self.driver.session(database=self.cfg.neo4j.database) as session:
            submissions = [dict(r) for r in session.run(
                "MATCH (s:Submission) RETURN s.submission_id AS submission_id, s.title AS title, s.owner AS owner, s.created_at AS created_at ORDER BY s.created_at DESC"
            )]
            recommendations = [dict(r) for r in session.run(
                "MATCH (s:Submission)-[:HAS_RECOMMENDATION]->(r:Recommendation) RETURN r.recommendation_id AS id, s.submission_id AS submission_id, s.title AS submission_title, r.outcome AS outcome, r.rationale AS rationale, r.score AS score, r.recommendation_type AS recommendation_type, r.updated_at AS updated_at ORDER BY r.updated_at DESC"
            )]
            scenarios = [dict(r) for r in session.run(
                "MATCH (s:Submission)-[:LEADS_TO]->(scn:Scenario) RETURN scn.scenario_id AS id, s.submission_id AS submission_id, scn.title AS title, scn.description AS description, scn.risk_level AS risk_level, scn.fit_score_avg AS fit_score_avg ORDER BY scn.updated_at DESC"
            )]
            decisions = [dict(r) for r in session.run(
                "MATCH (s:Submission)-[:LEADS_TO]->(scn:Scenario)-[:BASED_ON]->(rub:RubricEvaluation)-[:RESULTS_IN]->(rec:Recommendation) RETURN s.submission_id AS submission_id, scn.scenario_id AS scenario_id, rub.rubric_id AS rubric_id, rub.score AS rubric_score, rec.recommendation_id AS recommendation_id, rec.outcome AS outcome ORDER BY rec.updated_at DESC"
            )]
            summaries = [dict(r) for r in session.run(
                "MATCH (s:Submission)-[:HAS_SUMMARY]->(sum:EvaluationSummary) RETURN s.submission_id AS submission_id, s.title AS title, sum.fit_score_avg AS fit_score_avg, sum.disagreement_score AS disagreement_score, sum.requires_human_review AS requires_human_review, sum.top_recommendation AS top_recommendation, sum.updated_at AS updated_at ORDER BY sum.updated_at DESC"
            )]
        return {
            "submissions": submissions,
            "recommendations": recommendations,
            "generated_scenarios": scenarios,
            "generated_decisions": decisions,
            "evaluation_summaries": summaries,
        }

    def close(self):
        self.driver.close()
