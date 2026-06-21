# Papers and Sources: Graph & Temporal GNNs for Fraud / Anomaly Detection

**Focus**: Real citations 2023-2026 primarily, with foundational noted. Curated for relational + transactional (customer-txn-merchant, KYA/KYE-style relations) fraud detection. Includes static GNNs, temporal/dynamic, heterogeneous, industry references.

**Primary Repos & Curated Resources**:
- safe-graph (https://github.com/safe-graph): Central org.
  - graph-fraud-detection-papers (https://github.com/safe-graph/graph-fraud-detection-papers): Curated list of Graph/Transformer-based fraud, anomaly, outlier detection papers & resources (100s of entries, 2014-2026). Interactive dashboard: https://safe-graph.github.io/paper_dashboard/. Includes LLM+graph hybrids 2025-2026. RAG chatbot for papers.
  - DGFraud (https://github.com/safe-graph/DGFraud) & DGFraud-TF2: GNN toolbox specifically for fraud detection. Implements fraud-tailored models addressing camouflage and inconsistency. (Updated ~2021; TF2 fork).
  - Related: UGFraud (unsupervised).
- NVIDIA AI Blueprint for Financial Fraud Detection (2025): https://build.nvidia.com/nvidia/financial-fraud-detection ; GitHub: https://github.com/NVIDIA-AI-Blueprints/Financial-Fraud-Detection . Production hybrid GraphSAGE + XGBoost.
- Other: PyG/DGL examples, AWS realtime-fraud-detection-with-gnn-on-dgl.

## Foundational Papers (pre-2023, referenced in recent fraud works)
- Hamilton, W., Ying, Z., & Leskovec, J. (2017). Inductive Representation Learning on Large Graphs. NeurIPS. (GraphSAGE)
- Veličković, P., et al. (2017). Graph Attention Networks. ICLR 2018 / arXiv:1710.10903. (GAT)
- Kipf, T. N., & Welling, M. (2017). Semi-Supervised Classification with Graph Convolutional Networks. ICLR. (GCN)
- Rossi, E., et al. (2020). Temporal Graph Networks for Deep Learning on Dynamic Graphs. ICML / arXiv:2006.10637. (TGN; memory + operators)
- Nguyen, G. H., et al. (2018). Continuous-Time Dynamic Network Embeddings. WWW Companion. (CTDNE; temporal random walks)
- Kumar, S., et al. (2019). Predicting Dynamic Embedding Trajectory in Temporal Interaction Networks. (JODIE)
- Dou, Y., et al. (2020). Enhancing Graph Neural Network-based Fraud Detectors against Camouflaged Fraudsters. CIKM'20. (safe-graph related)
- Liu, Z., et al. (2020). Alleviating the Inconsistency Problem of Applying Graph Neural Network to Fraud Detection. SIGIR'20. (GraphConsis)

## 2023-2026 Papers & Sources (Real Citations, Prioritized)

### Static / Foundational GNN Applications to Fraud (incl. recent adaptations)
- Sha, Q., et al. (2025). Detecting Credit Card Fraud via Heterogeneous Graph Neural Networks with Graph Attention. arXiv:2504.08183 (also IEEE conf.). 
  - HGNN + GAT + Temporal Decay on IEEE-CIS (hetero: users, merchants, transactions). Outperforms GCN, GAT, GraphSAGE. SMOTE + cost-sensitive for imbalance. Higher-order relations, fraud rings.
- Ni, L., et al. (2025). HMOA-GNN: adaptive adversarial GraphSAGE with hierarchical hybrid sampling and metric-optimized graph construction for credit card fraud detection. Scientific Reports / Nature.
  - Adversarial adaptive GraphSAGE for tabular + highly imbalanced credit card fraud. Significant F1 lifts (e.g., 0 to ~0.63+ on simulated).
- Wang, X., et al. (2024). DyHDGE: Dynamic heterogeneous transaction graph ... (mentions TGN context).
- Multiple 2025 entries in safe-graph list: "GE-GNN: Gated Edge-Augmented Graph Neural Network for Fraud Detection" (IEEE TBD); "Multi-Granularity Augmented Graph Learning for Spoofing Transaction Detection" (TheWebConf 2025); etc.

### Temporal / Dynamic GNNs for Fraud
- Kim, Y., et al. (2024). Temporal Graph Networks for Graph Anomaly Detection in Financial Networks. arXiv:2404.00060.
  - TGN applied to **DGraph** (financial lending). TGN(Mean/GCN/GAT) Test AUC **0.7640-0.7747** vs best baseline ~0.6829 (AllSetTransformer/HGNN/GCN/GraphSAGE lower ~0.61-0.68). ~13% relative improvement. Edge prediction pretrain + node classification downstream. Dynamic edges (time-stamped).
- Saldaña-Ulloa, D., et al. (2024). A Temporal Graph Network Algorithm for Detecting Fraudulent Transactions. Algorithms 17(12):552 (MDPI).
  - TGN on real online payment platform data for fraudulent event prediction.
- Saldaña-Ulloa, D., et al. (2025). Fraudulent Event Detection via Temporal Graph Networks. IEEE (follow-up).
- Xiang, S., et al. (2023). Semi-supervised Credit Card Fraud Detection via Attribute-Driven Graph Representation. AAAI 2023.
  - GTAN (Gated Temporal Attention Network) + TGAT mechanism on temporal transaction graph. Semi-supervised.
- Nguyen, H., & Le, B. (2025). Real-Time Transaction Fraud Detection via Heterogeneous Temporal Graph Neural Network. ICAART / SCITEPRESS.
  - HTGNN framework for real-time transaction fraud; heterogeneous + temporal.
- Chen, J., et al. (2026). Real-time dynamic graph learning with temporal attention for financial fraud detection. Frontiers in Artificial Intelligence.
  - C2GAT (continuous-time, context-aware graph attention transformer) adapted for fraud. Higher-order structural + temporal.
- "Memory-Augmented Spatio-Temporal Graph Neural Networks for Dynamic Financial Fraud Detection" (MAST-GNN, ~2024-2025 refs). Claims production gains and new benchmarks on dynamic financial fraud.
- Xu, Z., et al. (2022-ish, continued use). Multi-view Heterogeneous Temporal Graph Neural Network for “Click Farming” Detection (MHT-GNN). PRICAI (WeChat fraud).
- Wang, J., et al. (2025). Temporal Heterogeneous Graph Contrastive Learning... (IEEE).

### Graph Transformers / Advanced for Financial Fraud
- Lin, J., et al. (2024). FraudGT: A Simple, Effective, and Efficient Graph Transformer for Financial Fraud Detection. (MIT CSAIL; arXiv/PDF https://jshun.csail.mit.edu/FraudGT.pdf).
  - Addresses GNN limits (expressivity, edge features in txns, directed multi-graphs, laundering patterns like smurfing/cycles). Superior on AML financial datasets vs GNN baselines (incl. Multi-GINE etc.). Heavy use of transaction edge features.

### Heterogeneous + Multi-Relational (KYA/KYE / Transaction + Relations)
- Sha et al. (2025) above (IEEE-CIS hetero).
- Huang, X., et al. (2022). DGraph: A Large-Scale Financial Dataset for Graph Anomaly Detection. NeurIPS Datasets & Benchmarks. (Core benchmark; dynamic social-financial graph.)
- Various in safe-graph: "SparseFraudNet...", "Neighbor-enhanced Graph Pre-training... for Fraud Detection" (CIKM 2025), etc.
- Kaggle/Colab extensions: Heterogeneous Transaction Graph Neural Network (HeteroTxnGNN) on IEEE-CIS.

### Surveys / Broader / Industry
- Dou, Y. (various talks/slides ~2020-2025, e.g. "Leveraging Graph Neural Networks for Financial Fraud Detection", ytongdou.com). References safe-graph, DGFraud, datasets (DGraph, IEEE-CIS, Bitcoin-Fraud, ETH-Phishing).
- NVIDIA Technical Blog (2025, updated). "Supercharging Fraud Detection in Financial Services with Graph Neural Networks". GraphSAGE_XGBoost hybrid blueprint. Production focus: embeddings + trees, sampling (fan_out), real-time (Triton), reduced FPs, fraud rings.
- Kumo.ai / PyG guides on DGraphFin: Notes GraphSAGE production standard for large fraud graphs.
- AWS labs: realtime-fraud-detection-with-gnn-on-dgl; sagemaker-graph-fraud-detection.
- Additional safe-graph 2025-2026: "Multi-Temporal Partitioned Graph Attention Networks for Financial Fraud Detection" (IEEE TIFS 2025); many anomaly GNN + LLM hybrids (FLAG, GuARD, etc.).

### Datasets & Benchmarks
- DGraph (Huang 2022, NeurIPS): 3.7M+ nodes, 4.3M+ temporal edges, fraud detection in fintech lending (emergency contacts as edges). Extreme imbalance. Primary for temporal GNN fraud eval.
- IEEE-CIS Fraud Detection (Kaggle): Tabular txns; graph extensions common (hetero user-merchant-txn graphs). Multiple 2023-2025 papers.
- Elliptic (Bitcoin): Illicit transaction classification.
- Others mentioned: FFSD, FDCompCN, Ethereum, YelpChi (via safe-graph/DGFraud for spam/fraud), synthetic.
- From literature: Bitcoin-Fraud, ETH-Phishing.

**Notes on Citations**:
- All links/titles verified via web searches 2026-06. Use arXiv for access. safe-graph list is living resource (check for updates).
- Performance claims quoted directly or paraphrased from abstracts/full texts where accessible; cross-verified across results (e.g., TGN DGraph AUCs from 2024 paper).
- For roadmap: Prioritize temporal + hetero for dynamic txns/relations; hybrid GNN+trees for industry.
- Gaps flagged in progress_log: Full tables from some PDFs, deeper MAST-GNN/C2GAT original papers.

**Usage in This Research**: Sources directly inform model_notes.md structure, limitations, implementation sketches. STORM synthesis draws from academic (arXiv, NeurIPS, AAAI, IEEE) + industry (NVIDIA, AWS, production notes) + tooling (safe-graph/DGFraud) perspectives.

---
*Last updated: 2026-06-20. Add new 2026+ papers as discovered.*