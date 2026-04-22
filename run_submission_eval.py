from __future__ import annotations

import json
import logging

from neo4j_graphrag_pipeline.evaluation.submission_evaluator import SubmissionEvaluator

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

def main() -> None:
    evaluator = SubmissionEvaluator()
    submission = {
        "title": "Enterprise Graph-backed Architecture Evaluation",
        "description": "Submission for governance review with Azure deployment, stakeholder ownership, security controls, and phased roadmap.",
        "owner": "architecture-office",
    }
    try:
        result = evaluator.evaluate_submission(submission)
        print(json.dumps(result, indent=2))
    finally:
        evaluator.close()


if __name__ == "__main__":
    main()
