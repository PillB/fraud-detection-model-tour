# Model Card: GraphRAG Analyst Workflow

## Origin

GraphRAG combines retrieval-augmented generation with graph context. In fraud and financial-crime workflows, the useful pattern is not "LLM replaces detector"; it is "detectors retrieve evidence, graph neighborhoods, and case history, then a grounded assistant drafts an analyst narrative."

## How It Works

1. Score transactions/entities using rules, ML, graph, and temporal models.
2. Build evidence documents: transaction summary, entity profile, recent history, graph neighbors, community context, prior alerts, notes/logs.
3. Retrieve the most relevant evidence for a suspicious case.
4. Generate or template an analyst memo with citations to retrieved facts.
5. Keep final disposition under human or governed workflow control.

## Pros

- Converts model scores into investigation-ready evidence.
- Handles unstructured notes/logs alongside graph summaries.
- Can reduce analyst time when constrained to retrieved facts.
- Useful for education because the reasoning path is visible.

## Cons

- Hallucination risk if generation is unconstrained.
- Privacy, data retention, and explainability requirements are high.
- Latency/cost make it unsuitable as a first-line detector.
- Entity resolution errors can lead to misleading narratives.

## Assumptions

- Retrieval corpus contains accurate, timestamped, auditable evidence.
- The primary fraud decision is made by deterministic models, rules, or governed human review, not by free-form LLM judgment.

## Limitations

- Never use retrieved narratives as ground truth labels.
- Prompt-injection and sensitive-data exposure must be controlled.
- External LLM APIs may be inappropriate for regulated data unless governance is in place.

## Fraud-Specific Fit

Use for high-risk or uncertain cases after a model cascade. Best outputs include: why flagged, evidence list, graph neighborhood, missing data, suggested next checks, and what would reduce uncertainty.

## Runnable Example

See `experiments/toy_graphrag_analyst.py`. It runs fully offline using TF-IDF retrieval and a deterministic template, so it demonstrates GraphRAG mechanics without external APIs.

