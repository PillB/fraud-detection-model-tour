# Model Card: R-GCN and Heterogeneous Graph Neural Networks

## Origin

Relational GCNs extend graph convolution to multiple edge types. Heterogeneous GNNs generalize this further to multiple node and edge types such as users, merchants, cards, devices, IPs, employees, transactions, and cases.

## How It Works

The model builds separate message transformations for different relation types. A user receiving messages from a shared device, merchant, worker access edge, and transaction edge can learn a risk representation that captures how different relations contribute to fraud.

## Fraud and Criminal-Network Fit

Use R-GCN/HGT/HAN-style models when fraud is relational: shared device rings, merchant collusion, mule networks, employee-assisted abuse, fake-account farms, or hidden criminal intermediaries. This is the production upgrade path from simple GraphSAGE when KYA/KYE schemas have multiple relation types.

## Pros

- Native fit for entity graphs with typed relationships.
- Better than flat tabular rows for collusion and ring detection.
- Can support node classification, edge classification, and link prediction.

## Cons

- Requires high-quality entity resolution and graph construction.
- Temporal leakage is easy if future edges are included.
- Sampling and serving are operationally harder than tabular scoring.
- Explanations require relation-level evidence summaries.

## References

- Schlichtkrull et al., "Modeling Relational Data with Graph Convolutional Networks".
- DGL R-GCN tutorial.
- AWS and DGL public examples for heterogeneous graph fraud detection patterns.
- Uber-style public discussions of graph and relational modeling for marketplace risk.

## Runnable Example

- `experiments/toy_graphsage.py` for the lightweight local graph-learning proxy.
- `experiments/toy_graph_link_prediction.py` for typed-relation criminal-network prediction patterns.
- Production upgrade: PyTorch Geometric or DGL R-GCN/HGT layers.

