# Model Card: Graph Link Prediction for Criminal Network Prediction

## Origin

Criminal-network analysis often asks which hidden or future relationships are likely, not only which current node is risky. Link prediction covers common-neighbor heuristics, matrix factorization, graph embeddings, and GNN decoders.

## How It Works

The model scores candidate pairs of entities using graph proximity, shared neighbors, community co-membership, time-decayed interactions, and optional node features. A supervised classifier can combine common neighbors, Jaccard, Adamic-Adar, resource allocation, preferential attachment, and risk attributes.

## Fraud and Criminal-Network Fit

Use link prediction to prioritize concealed accomplice ties, mule-account connections, hidden shared-device rings, merchant-customer collusion, or future risky interactions. It is an investigation aid, not a final determination.

## Pros

- Directly supports criminal-network prediction.
- Works with transparent heuristics before using GNNs.
- Produces explainable pair-level evidence.

## Cons

- Missing edges may reflect observation bias rather than true absence.
- Random negative sampling can be unrealistic.
- Temporal splits are mandatory: future links must not leak into features.

## References

- Liben-Nowell and Kleinberg, link prediction in social networks.
- CrimeGraphNet and related criminal-network GNN link-prediction papers.
- PyTorch Geometric link prediction examples.

## Runnable Example

- `experiments/toy_graph_link_prediction.py`

