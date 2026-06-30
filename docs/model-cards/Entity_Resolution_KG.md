# Model Card: Entity Resolution and Fraud Knowledge Graphs

## Origin

Fraud graphs are only as good as the entity resolution layer that links accounts, devices, phones, emails, addresses, cards, merchants, workers, and cases. Probabilistic entity resolution and knowledge graph construction are foundational for graph fraud systems and GraphRAG workflows.

## How It Works

Entity resolution blocks candidate pairs, computes similarity features, estimates match probability, and clusters records into entities. The resulting entity IDs become graph nodes; relationships become typed edges. Downstream models use graph features, GNN embeddings, path evidence, and retrieved case summaries.

## Fraud Fit

Use this layer to find synthetic identity clusters, duplicate account abuse, shared device rings, merchant collusion, and hidden KYA/KYE relationships. It is also necessary for reliable criminal-network analysis.

## Pros

- Converts fragmented records into usable graph intelligence.
- Makes graph and GraphRAG models more accurate.
- Provides explicit uncertainty via match probability.

## Cons

- False merges can wrongly implicate legitimate users.
- False splits hide fraud rings.
- Blocking rules can encode bias or miss adversarial variants.
- Requires privacy, audit, and human-review guardrails.

## References

- Splink probabilistic entity resolution documentation.
- Neo4j and Microsoft GraphRAG materials on graph-grounded retrieval.
- Model risk management guidance for high-impact decision systems.

## Runnable Example

- `experiments/toy_entity_resolution.py`

