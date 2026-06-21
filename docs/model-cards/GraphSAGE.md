# Model Card: GraphSAGE (Graph Neural Network for Relational Fraud)

## Origin
- Hamilton et al. (2017) "Inductive Representation Learning on Large Graphs" (GraphSAGE).
- Applied to fraud in many papers (e.g., safe-graph collection, 2024-2025 financial GNN surveys) for capturing KYA/KYE relations and transaction graphs.

## How It Works
Inductive graph embedding via neighbor sampling and aggregation:

1. **Graph Construction**: Nodes = users/merchants/workers; Edges = transactions + KYA/KYE links (with features like amount, time).
2. **Sampling**: Sample fixed-size neighbor sets (to handle large graphs).
3. **Aggregation**: Mean/LSTM/pool over neighbor embeddings + self.
4. **Update**: Linear transform + activation to get node embeddings.
5. **Prediction**: Embeddings fed to classifier (fraud prob) or used for anomaly (e.g., deviation from community).

**Mixture**: Graph embeddings + tabular features (velocity + KYA) in downstream model (e.g., XGBoost or MoE).

## Pros
- Captures relational patterns (collusion, shared entities) missed by tabular/seq alone.
- Inductive: Works on unseen nodes (new users).
- Scalable with sampling.

## Cons
- Requires graph construction (can be expensive).
- Sensitive to graph quality and features.
- Less interpretable than trees (use attention variants or GNNExplainer).

## Assumptions
- Fraud manifests in graph structure (e.g., dense suspicious subgraphs).
- Sufficient connectivity in KYA/KYE/transaction data.

## Limitations
- Cold start for isolated nodes.
- Dynamic graphs (use TGN for temporal).
- Label scarcity: Combine with SSL or use as features for supervised.

**Fraud-Specific Fit**: Ideal for KYA/KYE relational fraud (mules, rings). Combine with seq for behavior + tabular for amounts. Common in production graph layers.

## Toy Example (Functional Python)
See experiments/toy_graphsage.py (uses networkx to build simple graph from synthetic data, computes basic embeddings via neighbor agg, then sklearn classifier. PR-AUC reported).

## Conceptual Visualization
- Graph with colored nodes (fraud vs normal) + highlighted suspicious communities.
- Embedding space (2D projection showing clusters).

## References
- Hamilton et al. 2017 (GraphSAGE).
- Fraud GNN surveys (Motie 2024, safe-graph repo).
- Full in data/subagents/graph-temporal-gnn/.

**Status**: Educational card with runnable toy. Tested.
