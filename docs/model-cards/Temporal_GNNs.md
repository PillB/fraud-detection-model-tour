# Model Card: Temporal Graph Neural Networks

## Origin

Temporal graph learning includes TGAT, TGN, JODIE, DyRep, EvolveGCN, and heterogeneous temporal GNN variants. These methods extend static graph learning by modeling timestamped interactions and evolving node states.

## How It Works

1. Represent every transaction or access event as a timestamped edge.
2. Maintain node memory or time-aware embeddings for users, merchants, devices, workers, and accounts.
3. Update embeddings through temporal message passing after each event or time snapshot.
4. Score fraud by edge classification, link prediction surprise, state deviation, or anomalous neighborhood evolution.
5. Feed temporal graph embeddings into a cascade or analyst review layer.

## Pros

- Models transaction streams directly instead of collapsing history into static aggregates.
- Captures dormancy, bursts, new counterparties, evolving mule rings, and account takeover patterns.
- Better fit for real-time fraud than static GNNs when graph behavior changes quickly.

## Cons

- Heavier engineering footprint: event stores, memory states, negative sampling, temporal batching.
- Harder to explain than trees and static graph features.
- Requires strict temporal validation to avoid leakage.
- PyG/DGL/TGL-style stacks are heavier than this repo's default dependencies.

## Assumptions

- Timestamp order carries signal.
- Relevant entity histories are available at inference time without future leakage.
- Fraud patterns alter node or edge dynamics before or during the suspicious event.

## Limitations

- Cold-start entities still need rules/tabular fallback.
- Memory can encode bias or stale behavior if not monitored.
- Production latency must be managed through cascades and approximate retrieval.

## Fraud-Specific Fit

Temporal GNNs are the right target when the graph is not just relational but event-driven: payments, logins, device changes, employee access, merchant settlement, and account-link events. They are the SOTA-oriented extension of GraphSAGE for transaction streams.

## Runnable Example

See `experiments/toy_temporal_graph_risk.py`. The local script is a dependency-light temporal graph proxy: it builds rolling user/merchant/edge features from timestamped transactions and trains a supervised risk model with PR-AUC and Recall@K. Production implementation should replace the proxy features with TGN/TGAT embeddings.

## Production Guidance

- Split by time, not random rows.
- Keep a rules/tree fallback for new nodes.
- Monitor temporal drift in score distributions and embeddings.
- Explain predictions with recent event paths, community context, and feature/attention summaries.

