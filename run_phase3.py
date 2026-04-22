from __future__ import annotations

import logging

from neo4j_graphrag_pipeline.evaluation.phase3_runner import Phase3Runner

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

def main() -> None:
    runner = Phase3Runner()
    try:
        count = runner.run()
        print(f"Generated phase3 artifacts: {count}")
    finally:
        runner.close()


if __name__ == "__main__":
    main()
