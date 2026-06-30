# Model Card: Graph Attention Networks for Fraud Evidence

## Origin

Graph Attention Networks use attention weights over neighbors so a node can learn which relationships matter most. In fraud work, attention is attractive because analyst teams need evidence, not only scores.

## How It Works

For each node, a GAT computes attention coefficients over neighbors and aggregates neighbor embeddings with learned weights. In fraud, those neighbors may be devices, merchants, accounts, workers, or prior suspicious entities.

## Fraud Fit

Use GAT-style models when the graph is moderately sized and explanations about important neighbors are useful. They pair naturally with GraphRAG workbench views that show the key relationships behind an alert.

## Pros

- Learns relation importance at the neighborhood level.
- Helpful bridge from graph scoring to analyst evidence.
- Can be adapted to heterogeneous graphs with relation-aware attention.

## Cons

- Attention is not a perfect causal explanation.
- Large fraud graphs require sampling and careful latency design.
- Fraud rings may use camouflage edges that attention can overtrust.

## References

- Velickovic et al., "Graph Attention Networks".
- PyTorch Geometric `GATConv` documentation.
- Graph-fraud surveys and safe-graph curated graph fraud paper lists.

## Runnable Example

- Local proxy: `experiments/toy_community_role_detection.py` for neighbor and community evidence.
- Production upgrade: PyG `GATConv` or DGL `GATConv`.

