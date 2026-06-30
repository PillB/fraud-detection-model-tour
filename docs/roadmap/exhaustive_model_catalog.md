# Exhaustive Fraud Detection Model Catalog

This catalog is the broad coverage layer behind the Model Tour. The six flagship cards remain the guided path, while this document records the wider set of techniques that should be considered for professional fraud, anomaly, and criminal network detection work.

## Phase 1-2 Completion Criteria

- Repository baseline inspected: website, roadmap, model cards, synthetic generator, comparison harness, pipeline, tests, and current dirty files.
- Research fan-out started across four streams: classical/ensemble, graph/temporal graph/criminal networks, deep/self-supervised, and LLM/GraphRAG analyst workflows.
- Scope widened beyond the six flagship cards into a representative taxonomy of production and research techniques.
- Lightweight implementation strategy selected: keep examples runnable with existing dependencies (`numpy`, `pandas`, `scikit-learn`, `networkx`, `matplotlib`) and use PyTorch/PyG/TGN references as production extensions rather than mandatory local dependencies.

## 1. Rules, Statistics, and Monitoring

| Technique | Fraud Fit | Toy Implementation |
|---|---|---|
| Hard rules and blacklists | Mandatory first guardrail; interpretable blocks and watchlists | Threshold on amount, night activity, velocity |
| Velocity checks | Detect bursts, account takeover, card testing | Rolling counts per user/device/merchant |
| Robust z-score / MAD | Simple amount or frequency outliers | Median absolute deviation score |
| IQR / quantile fences | Explainable anomaly baseline | Amount and velocity fences |
| EWMA / CUSUM | Drift and sudden behavior shifts | Streaming risk score over time |
| Benford-like tests | Accounting and invoice anomaly screens | Digit-distribution check where domain-valid |

## 2. Classical Unsupervised Anomaly Detection

| Technique | Strength | Limitation |
|---|---|---|
| Isolation Forest | Fast high-recall gate for novel outliers | Sensitive to contamination and feature scaling |
| Local Outlier Factor | Local density anomalies and rare peer-group behavior | Weak extrapolation; expensive at large scale |
| One-Class SVM | Flexible boundary around normal data | Scaling and kernel sensitivity |
| Elliptic Envelope / robust covariance | Transparent Gaussian-ish baseline | Poor fit for multimodal transaction behavior |
| kNN distance / average distance | Direct local outlier score | Expensive without approximate indexes |
| HBOS / histogram methods | Fast independent-feature baseline | Misses feature interactions |

Runnable example: `experiments/toy_classical_anomaly_suite.py`.

## 3. Supervised Trees and Cost-Sensitive Learning

| Technique | Fraud Fit | Notes |
|---|---|---|
| Logistic regression | Calibrated baseline and governance reference | Strong with good feature engineering |
| Random Forest / ExtraTrees | Robust nonlinear baseline | Less sharp than boosted trees on many tabular tasks |
| Gradient Boosting / XGBoost / LightGBM / CatBoost | Production workhorse for known fraud | Use temporal splits and class/cost weighting |
| Balanced bagging / RUSBoost / EasyEnsemble | Extreme class imbalance | Useful when false negatives dominate cost |
| Focal loss / class-balanced loss | Hard-positive emphasis | Needs careful calibration |
| Threshold optimization / cost curves | Operational queue alignment | Use `Recall@K`, expected loss, review capacity |

Existing card: `docs/model-cards/XGBoost_Supervised.md`.

## 4. Deep Reconstruction, Density, and Generative Models

| Technique | Fraud Fit | Notes |
|---|---|---|
| Autoencoder, denoising AE, sparse AE | Reconstruction anomaly score | High false positives on rare legitimate cases |
| VAE / beta-VAE / conditional VAE | Probabilistic normality and latent features | Needs calibration and drift retraining |
| Deep SVDD | Compact hypersphere around normal behavior | Sensitive to representation collapse |
| DAGMM | Joint AE representation plus density estimation | More complex but educationally valuable |
| AnoGAN / f-AnoGAN | Generative anomaly search | Heavier and harder to train |
| CTGAN / diffusion synthesis | Rare fraud scenario augmentation | Must avoid unrealistic synthetic artifacts |

Existing card: `docs/model-cards/VAE.md`.
New family card: `docs/model-cards/DeepSVDD_DAGMM.md`.

## 5. Sequence and Temporal Behavior

| Technique | Fraud Fit | Notes |
|---|---|---|
| LSTM / GRU / BiLSTM | Per-account behavior and access-log sequences | Cold-start needs tabular fallback |
| LSTM autoencoder / LSTM-VAE | Sequence reconstruction anomaly | Good for account takeover and insider sequences |
| Temporal CNN / TCN | Faster windowed sequence modeling | Fixed receptive field |
| Transformer sequence encoders | Long-range merchant, device, and event context | Needs more data and careful latency control |
| Time-aware attention | Irregular transaction gaps | Useful for burst and dormancy patterns |

Existing card: `docs/model-cards/LSTM_Sequence.md`.
Runnable temporal feature example: `experiments/toy_temporal_graph_risk.py`.

## 6. Tabular Deep Learning

| Technique | Fraud Fit | Notes |
|---|---|---|
| TabTransformer | Categorical KYA/KYE interactions | Strong when category semantics matter |
| FT-Transformer | Numerical and categorical transformer baseline | Heavier than trees |
| TabNet | Attentive feature selection | Useful explanation view but sensitive to tuning |
| MLP + embeddings | Simple neural tabular baseline | Often beaten by boosted trees without scale |

Existing card: `docs/model-cards/TabTransformer.md`.

## 7. Graph and Criminal Network Detection

| Technique | Fraud/Crime Fit | Notes |
|---|---|---|
| Degree, PageRank, HITS, k-core | Mule hubs, brokers, shell merchants | Fast graph-risk features |
| Louvain / Leiden / label propagation | Fraud communities and collusion rings | Communities need analyst validation |
| Role discovery: RolX, struc2vec, GraphWave-style features | Find brokers, mules, recruiters, cash-out nodes | Good criminal-network lens |
| Subgraph anomaly / dense block search | Coordinated rings and merchant collusion | Can be expensive |
| Node2Vec / DeepWalk | Unsupervised graph embeddings | Static unless retrained |
| GCN / GraphSAGE / GAT | Relational fraud classification | Requires graph quality and sampling |
| Heterogeneous GNN / R-GCN / HAN / HGT | Users, merchants, devices, workers, accounts | Best fit for KYA/KYE/KYB schemas |

Existing card: `docs/model-cards/GraphSAGE.md`.
New card: `docs/model-cards/Community_Role_Detection.md`.
Runnable example: `experiments/toy_community_role_detection.py`.

## 8. Temporal Graph Neural Networks and Dynamic Graphs

| Technique | Fraud Fit | Notes |
|---|---|---|
| TGAT | Time-encoded attention over temporal neighbors | Good continuous-time baseline |
| TGN | Memory-based dynamic node states | Strong for transaction streams |
| JODIE / DyRep-style dynamic embeddings | Evolving user-merchant interactions | Useful for link prediction and anomaly |
| EvolveGCN / DCRNN-style dynamic GNNs | Snapshot sequence graphs | Fit daily/hourly aggregate graphs |
| Heterogeneous TGN / HTGNN | Entity types plus timestamps | Best research target for full KYA/KYE graphs |

New card: `docs/model-cards/Temporal_GNNs.md`.
Runnable local proxy: `experiments/toy_temporal_graph_risk.py`.

## 9. Self-Supervised, Semi-Supervised, and Contrastive Learning

| Technique | Fraud Fit | Notes |
|---|---|---|
| Masked feature modeling / VIME / SubTab-style | Label-efficient tabular pretraining | Feed learned embeddings to trees |
| Graph contrastive learning | Robust graph representations with few labels | View design matters |
| Attribute/edge reconstruction | Heterogeneous graph SSL | Useful for KYA/KYE graphs |
| Pseudo-labeling and positive-unlabeled learning | Delayed or noisy fraud labels | Needs leakage controls |
| Few-shot / zero-shot graph anomaly methods | Emerging fraud rings | Treat as research layer |

## 10. Hybrid, Ensemble, and Cascade Architectures

| Pattern | Production Use |
|---|---|
| Rules + Isolation Forest gate -> supervised tree | Low-latency high-recall screen |
| Anomaly scores as supervised features | Novel-signal injection into XGBoost/LightGBM |
| VAE latents + tree classifier | Representation plus calibrated tabular classifier |
| Graph embeddings + tabular model | Practical way to deploy graph signal |
| Stacking and blending | Combine tree, anomaly, sequence, and graph scores |
| MoE routing | Route cases to sequence, interaction, graph, or anomaly experts |

Existing card: `docs/model-cards/MoE_Hybrid.md`.
New card: `docs/model-cards/Cost_Sensitive_Ensembles.md`.

## 11. LLM-Augmented Analyst Workflows and GraphRAG

| Pattern | Fit | Guardrails |
|---|---|---|
| Evidence retrieval over transactions, KYC/KYE notes, graph summaries | Analyst explanation and triage | Ground every answer in retrieved evidence |
| GraphRAG neighborhood summaries | Collusion and criminal-network case narratives | Never let LLM be the primary detector |
| Local template-based analyst report | Offline educational substitute for API LLM | Deterministic and auditable |
| Entity resolution assistance | Merge accounts/devices/merchants | Human review and privacy controls |
| Synthetic scenario generation | Red-team rare fraud patterns | Mark synthetic data clearly |

New card: `docs/model-cards/GraphRAG_Analyst.md`.
Runnable example: `experiments/toy_graphrag_analyst.py`.

## Practical Coverage Standard

A consulting-grade fraud platform should include all families above in the roadmap, but it does not need to make every research model a heavy local dependency. The durable implementation pattern is:

1. Keep fast, reproducible local examples for the core intuition.
2. Use model cards to document production-grade variants and limitations.
3. Compare families through PR-AUC, Recall@K, and cost-sensitive queue metrics.
4. Treat graph, temporal graph, SSL, and LLM/GraphRAG as layered additions over strong feature engineering and supervised baselines.

