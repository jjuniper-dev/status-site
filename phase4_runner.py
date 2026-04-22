from __future__ import annotations

import logging

from neo4j_graphrag_pipeline.evaluation.phase4_runner import run_phase4

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

def main() -> None:
    files = run_phase4(repo_root=".")
    print("Exported files:")
    for file in files:
        print(f" - {file}")


if __name__ == "__main__":
    main()
