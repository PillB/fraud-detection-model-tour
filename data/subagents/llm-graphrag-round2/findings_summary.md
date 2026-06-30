# LLM, GraphRAG, Entity Resolution, and Analyst Workflow Research Stream

Status: research-only sub-agent completed; no files edited by the sub-agent.

## Key Sources

- Microsoft GraphRAG paper/repo: graph index, entity KG, community summaries, private-data Q&A.
- Neo4j GraphRAG and fraud use cases: graph retrievers, path traversal, fraud rings, AML paths, entity resolution.
- Chainalysis 2025 Crypto Crime Report intro: professionalized crime networks and AI-enabled fraud pressure.
- Splink probabilistic entity resolution docs.
- FinFRE-RAG, MLED, SAGE, and RAG-based scam-detection preprints.
- BRIGHT real-time GNN latency design and graph feature preprocessor patterns for streaming AML/fraud features.
- Model Cards paper, NIST AI RMF/GenAI profile, and Fed/OCC SR 11-7 model risk guidance.

## Missing Patterns Identified

- GraphRAG Fraud Analyst.
- Entity Resolution + Knowledge Graph.
- LLM Case Reviewer.
- Evidence-Grounded Explanation Layer.
- Analyst-in-the-Loop Active Learning.
- Three-pane analyst workbench: alert summary, evidence graph, case memo.

## Implementation Actions Taken

- Added `docs/model-cards/GraphRAG_Analyst.md`.
- Added `experiments/toy_graphrag_analyst.py`, a deterministic offline retrieval-and-memo workflow using TF-IDF and NetworkX context.
- Added website catalog language positioning GraphRAG as selective analyst support, not primary detection.

## Fit And Limits

LLMs should not decide fraud alone. Every narrative claim must be grounded in retrieved evidence. Main risks are hallucination, PII leakage, prompt injection through notes/logs, biased explanations, false entity-resolution merges, automation bias, and future-edge leakage in graph context.

