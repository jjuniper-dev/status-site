import asyncio
from config import load_config
from graphrag_pipeline import GraphRAGPipeline
from retrievers import RetrieverStrategy

SAMPLE_TEXT = """
Artificial intelligence (AI) is transforming the public sector by automating
routine tasks and enabling data-driven decision-making. The Government of
Canada has adopted the Directive on Automated Decision-Making (DADM) to
ensure that AI systems are transparent, accountable, and fair.

Key frameworks include the Algorithmic Impact Assessment (AIA), which
evaluates risks before deploying automated systems. Treasury Board
Secretariat (TBS) oversees compliance and publishes guidelines for
responsible AI. Machine learning models in immigration, tax assessment,
and benefit eligibility must undergo impact assessments.
"""

async def main():
    pipeline = GraphRAGPipeline(load_config())
    try:
        pipeline.setup()
        await pipeline.ingest_text(SAMPLE_TEXT)

        status = pipeline.status()
        print(f"Graph: {status['node_count']} nodes, {status['relationship_count']} rels")

        for strategy in [RetrieverStrategy.VECTOR, RetrieverStrategy.VECTOR_CYPHER]:
            result = pipeline.query(
                "What is the Directive on Automated Decision-Making?",
                strategy=strategy, top_k=3, return_context=True,
            )
            print(f"\n[{strategy.value}] {result['answer'][:300]}")
    finally:
        pipeline.close()

if __name__ == "__main__":
    asyncio.run(main())
