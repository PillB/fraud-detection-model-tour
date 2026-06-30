# Industry and Research Model Map

This document maps public industry/research evidence to the model families used in the Fraud Detection Model Tour. It should be read as a public-source model-family map, not a claim about private internal model registries.

## Public Source Themes

| Source | Public evidence | Model families to represent in this repo |
|---|---|---|
| Stripe Radar | Stripe describes real-time fraud prevention with AI trained on large payment volume, risk scores for payments, hundreds of signals, device fingerprints, proxy detection, historical snapshots, custom rules, review tooling, and platform/account-fraud coverage. | Supervised tabular models, rules, network intelligence, device/entity features, review queues, LLM-assisted analyst tools. |
| AWS Amazon Fraud Detector | AWS describes ML-based online payment fraud, new-account fraud, loyalty abuse, and account-takeover detection, with custom business rules and real-time predictions. | Supervised tabular classifiers, rules, account-takeover sequence features, cascades. |
| Graph-fraud research and safe-graph repository | The safe-graph repository curates graph/transformer fraud, anomaly, outlier, LLM, and dynamic graph papers through 2026. | GraphSAGE, GAT, R-GCN/HGT, temporal GNNs, graph anomaly, LLM+GraphRAG, contrastive/SSL graph fraud. |
| BRIGHT real-time graph fraud paper | BRIGHT targets marketplace/e-commerce transaction fraud with GNNs while addressing temporal leakage and P99 latency. | Real-time graph scoring, temporal graph validation, batch embeddings + online inference. |
| PyOD | PyOD provides a broad anomaly-detection model zoo and unified API. | Isolation Forest, LOF, OCSVM, HBOS, ECOD, COPOD, PCA, kNN, SUOD, XGBOD-style anomaly stacks. |
| DGL / PyTorch Geometric | DGL and PyG provide implementation paths for R-GCN, GAT, heterogeneous graphs, and link prediction. | Production upgrade path for local NetworkX/sklearn graph demos. |

## Company-Pattern Interpretation

Top fraud platforms usually combine:

1. Rules, allow/deny lists, velocity thresholds, and watchlists for transparent hard controls.
2. Supervised tabular models for known labeled fraud.
3. Unsupervised anomaly gates for novel behavior and weak labels.
4. Graph features and GNNs for collusion, mule networks, shared devices, synthetic identities, and merchant/worker rings.
5. Sequence or temporal models for account takeover, burst behavior, and drift.
6. Analyst workbenches, GraphRAG, and evidence retrieval for explainability and case handling.
7. Entity resolution as the data-quality prerequisite for any graph or criminal-network model.

## Model Families Added From This Map

- Isolation Forest
- Logistic Regression / Random Forest / ExtraTrees baselines
- LOF / One-Class SVM / PCA reconstruction / robust covariance
- HBOS / ECOD / COPOD / kNN / PyOD-style density outlier models
- R-GCN and heterogeneous GNNs
- GAT attention-based graph evidence
- Graph link prediction for criminal-network prediction
- Entity resolution and knowledge graph construction
- Federated and privacy-preserving fraud learning

## Key Public Resources

- Stripe Radar: https://stripe.com/radar
- Amazon Fraud Detector: https://aws.amazon.com/fraud-detector/
- safe-graph curated graph fraud papers: https://github.com/safe-graph/graph-fraud-detection-papers
- PyOD documentation: https://pyod.readthedocs.io/en/latest/
- R-GCN paper: https://arxiv.org/abs/1703.06103
- PyTorch Geometric heterogeneous graphs: https://pytorch-geometric.readthedocs.io/en/latest/notes/heterogeneous.html
- BRIGHT real-time graph fraud paper: https://arxiv.org/abs/2205.13084

