"""
Neo4j GraphRAG Pipeline -- end-to-end orchestrator with CLI.

Usage:
    python graphrag_pipeline.py setup
    python graphrag_pipeline.py ingest --text "..." | --pdf path.pdf | --dir ./docs
    python graphrag_pipeline.py query "What are the key findings?"
    python graphrag_pipeline.py status
"""

import argparse, asyncio, logging, sys
from pathlib import Path

import neo4j
from neo4j_graphrag.generation import GraphRAG
from neo4j_graphrag.llm import OpenAILLM

from config import PipelineConfig, load_config
from index_manager import IndexManager
from kg_builder import KnowledgeGraphBuilder
from retrievers import RetrieverFactory, RetrieverStrategy

logger = logging.getLogger(__name__)


class GraphRAGPipeline:
    def __init__(self, cfg: PipelineConfig | None = None):
        self.cfg = cfg or load_config()
        logging.basicConfig(
            level=getattr(logging, self.cfg.log_level.upper(), logging.INFO),
            format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
            datefmt="%H:%M:%S",
        )
        self.driver = neo4j.GraphDatabase.driver(
            self.cfg.neo4j.uri,
            auth=(self.cfg.neo4j.username, self.cfg.neo4j.password),
        )
        self.index_mgr = IndexManager(self.cfg, self.driver)
        self.kg_builder = KnowledgeGraphBuilder(self.cfg, self.driver)
        self.retriever_factory = RetrieverFactory(self.cfg, self.driver)

    def setup(self, label: str = "Chunk") -> None:
        self.index_mgr.setup_indexes(label=label)

    async def ingest_text(self, text: str) -> dict:
        return await self.kg_builder.ingest_text(text)

    async def ingest_pdf(self, path: str | Path) -> dict:
        return await self.kg_builder.ingest_pdf(path)

    async def ingest_directory(self, directory: str | Path, glob: str = "*.pdf") -> list[dict]:
        return await self.kg_builder.ingest_directory(directory, glob)

    def query(self, question: str,
              strategy: RetrieverStrategy = RetrieverStrategy.VECTOR_CYPHER,
              top_k: int = 5, return_context: bool = False) -> dict:
        retriever = self.retriever_factory.build(strategy=strategy)
        llm = OpenAILLM(
            model_name=self.cfg.llm.model,
            model_params={"temperature": self.cfg.llm.temperature,
                          "max_tokens": self.cfg.llm.max_tokens},
        )
        rag = GraphRAG(retriever=retriever, llm=llm)
        result = rag.search(
            query_text=question,
            retriever_config={"top_k": top_k},
            return_context=return_context,
        )
        return {
            "answer": result.answer,
            "context": getattr(result, "retriever_result", None) if return_context else None,
        }

    def status(self) -> dict:
        indexes = self.index_mgr.list_indexes()
        with self.driver.session(database=self.cfg.neo4j.database) as session:
            node_count = session.run("MATCH (n) RETURN count(n) AS cnt").single()["cnt"]
            rel_count = session.run("MATCH ()-[r]->() RETURN count(r) AS cnt").single()["cnt"]
        return {"indexes": indexes, "node_count": node_count, "relationship_count": rel_count}

    def close(self):
        self.driver.close()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()


def cli():
    parser = argparse.ArgumentParser(description="Neo4j GraphRAG Pipeline CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("setup", help="Create indexes")

    p_ingest = sub.add_parser("ingest", help="Ingest documents")
    group = p_ingest.add_mutually_exclusive_group(required=True)
    group.add_argument("--text", type=str)
    group.add_argument("--pdf", type=str)
    group.add_argument("--dir", type=str)
    p_ingest.add_argument("--glob", type=str, default="*.pdf")

    p_query = sub.add_parser("query", help="Query the graph")
    p_query.add_argument("question", type=str)
    p_query.add_argument("--strategy", type=str, default="vector_cypher",
                         choices=[s.value for s in RetrieverStrategy])
    p_query.add_argument("--top-k", type=int, default=5)
    p_query.add_argument("--show-context", action="store_true")

    sub.add_parser("status", help="Show graph stats")
    args = parser.parse_args()

    with GraphRAGPipeline() as pipeline:
        match args.command:
            case "setup":
                pipeline.setup()
                print("Indexes created.")
            case "ingest":
                if args.text:
                    asyncio.run(pipeline.ingest_text(args.text))
                elif args.pdf:
                    asyncio.run(pipeline.ingest_pdf(args.pdf))
                elif args.dir:
                    asyncio.run(pipeline.ingest_directory(args.dir, args.glob))
                print("Ingestion complete.")
            case "query":
                result = pipeline.query(
                    question=args.question,
                    strategy=RetrieverStrategy(args.strategy),
                    top_k=args.top_k,
                    return_context=args.show_context,
                )
                print(f"\n-- Answer --\n{result['answer']}")
            case "status":
                info = pipeline.status()
                print(f"Nodes: {info['node_count']}  |  Rels: {info['relationship_count']}")
                for idx in info["indexes"]:
                    print(f"  - {idx['name']} ({idx['type']})")


if __name__ == "__main__":
    cli()
