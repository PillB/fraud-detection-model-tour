# Roadmap Contribution: Graph-Temporal GNNs for Fraud Detection System

**Context**: This sub-agent research contributes to the overall project roadmap (basic → SOTA, per AGENT_STATE.md). Focus: structured (transactions + KYA/KYE relational) + graph + behavioral fraud data. Feeds model cards, experiments, website tour.

## Positioning in Roadmap (Basic → Advanced → SOTA)

### Level 1: Basics / Tabular + Simple Graph Features
- Traditional ML (XGBoost, RF) on handcrafted features (amount, time, velocity, KYC flags).
- Simple graph features: degree, centrality, connected component size (pre-GNN).
- **Role of GNN research**: Baseline comparator. Industry often starts here (NVIDIA blueprint supports pure XGB path).

### Level 2: Static GNNs (Foundational Message Passing)
- Introduce GCN, GraphSAGE, GAT on constructed graphs.
  - Graph construction: nodes = users/merchants/transactions/devices/workers; edges = txns (amount/time attrs), KYA/KYE relations (verified links, shared device/IP, emergency contacts), multi-relational.
- Key teaching points (from model_notes):
  - GraphSAGE: Inductive + sampling for scale (prod standard).
  - GAT: Attention for interpretability.
  - GCN: Simple baseline.
- Fraud-specific from safe-graph/DGFraud: Introduce GraphConsis/SemiGNN early to show homophily issues.
- **Datasets for experiments**: IEEE-CIS (extended to graph), small synthetic or YelpChi subset.
- **Contribution**: Model cards for GCN/GraphSAGE/GAT + toy PyG/DGL impls. Pros/cons table. Visualization of message passing on txn rings.

### Level 3: Heterogeneous GNNs + Imbalance Handling
- HGNN, RGCN, HGT-style for multi-type (user-merchant-device-KYA).
- Techniques: Relation-specific agg, attention per type, SMOTE/cost-sensitive/adversarial sampling (HMOA-GNN).
- **KYA/KYE emphasis**: Explicit modeling of identity/relationship edges as typed relations.
- **Contribution**: Extend model cards; heterogeneous graph construction sketches; metrics for imbalanced (PR-AUC, Recall@K, F1).

### Level 4: Temporal / Dynamic GNNs (Core SOTA Addition)
- TGN (Rossi 2020 + 2024 DGraph fraud paper), TGAT mechanisms, JODIE/CTDNE for comparison.
- How they handle: Continuous-time events (txns as timed edges), memory for history, time encodings.
- **SOTA highlight**: Kim et al. 2024 TGN on DGraph: ~0.77 AUC vs static GNNs ~0.61-0.68.
- **Contribution**:
  - Dedicated model cards for TGN + TGAT.
  - Experiments: Static vs Temporal on time-split DGraph-like or IEEE-CIS temporal extension.
  - Pipeline: Event stream simulation → TGN memory update → fraud score.
  - Website: Animated temporal evolution (SVG/JS or matplotlib) of graph + fraud flags.

### Level 5: Heterogeneous Temporal + Advanced (SOTA)
- HTGNN / SE-HTGNN / MHT-GNN, MAST-GNN (memory spatio-temporal), C2GAT (2026 real-time), FraudGT (transformer for edge-heavy directed financial).
- Hybrid industry: GNN embeddings (GraphSAGE/TGN) + XGBoost (NVIDIA 2025 blueprint).
- LLM+Graph (2025-2026 safe-graph papers): FLAG, DGP, etc. (for future extensibility).
- **Contribution**: Model cards or advanced sections. Roadmap notes "production hybrid" track. Implementation sketches for real-time (memory + inference).

### Level 6: Full System, Ensembles, Interpretability, Experiments
- Ensemble: Tabular + Static GNN + Temporal GNN + rules.
- Interpretability: GAT attention + subgraph expl + SHAP on hybrid.
- Scalability: Sampling, mini-batch (PyG neighborloader), cuGraph/RAPIDS (NVIDIA).
- Drift handling: Online updates, sliding temporal windows.
- **Contribution from this research**: 
  - limitations_and_fraud_fit.md + findings_summary.md feed honest model card caveats.
  - implementation_ideas.md for toy end-to-end (data gen with KYA relations → graph build → models → metrics).
  - Cross-cites safe-graph, DGraph paper, IEEE-CIS extensions, NVIDIA blueprint.
- Validation: Reproducible experiments on toy transactional+relational data; PR-AUC etc. as specified.

## Specific Contributions to Project Artifacts
- **Roadmap document**: Insert progression table (above levels). Mark temporal GNNs as key differentiator vs classical (subagent classical-anomaly-supervised).
- **Model Cards** (docs/model-cards/): Use rigorous structure from model_notes.md. Each includes: origin, diagram (text or code-gen), toy Python (functional, PyG or minimal torch), pros/cons/assumptions/limitations, fraud example (txn ring / KYA link detection).
- **Experiments**: Recommend time-respecting splits; DGraph/IEEE-CIS subsets or synthetic generator matching project schema (relational + txn).
- **Website**: Handholding explanations of "why temporal matters for fraud evolution"; comparisons (static vs TGN AUC deltas); interactive (filter papers from safe-graph insights?).
- **Pipeline script**: Modular: graph_construction (KYA/txn edges) → feature_store/graph_store → static_gnn / tgn_module → ensemble → metrics.
- **Tests**: Blackbox checks on toy data for fraud metrics; regression on known benchmark deltas where possible.

## Dependencies / Interfaces with Other Subagents
- classical-anomaly-supervised: Tabular baselines + supervised anomaly for comparison/ensemble.
- ensembles-sota-llm: Hybrid GNN+LLM (2025 papers like FLAG, GuARD from safe-graph list); LLM for explanation of GNN attention.
- coordinator: Overall orchestration of research → cards → code.
- Docs/roadmap: This file as source material.

## Assumptions & Open Items for Roadmap
- Graph construction tooling needed (or synthetic data gen) for KYA/KYE + txns.
- Compute: Assume PyTorch Geometric or DGL available for experiments (toy scale first).
- Recency: 2023-2026 papers prioritized; note pre-2023 as foundations.
- Gaps: Full MAST-GNN/C2GAT code availability; real production numbers (NVIDIA claims qualitative + "millions saved").
- Future extensions: Online continual learning for drift; privacy-preserving GNN (federated).

## Evidence Base
- DGraph TGN superiority (Kim 2024).
- IEEE-CIS HGNN wins (Sha 2025).
- Production: NVIDIA GraphSAGE_XGBoost blueprint (2025).
- Tooling: safe-graph/DGFraud (fraud-specific challenges).
- Curated in papers_and_sources.md.

**Actionable for Next Phases**: Prioritize TGN + GraphSAGE + GAT + one HTGNN variant for initial model cards/experiments. Use safe-graph papers list for citations. Reference this file in roadmap.md.

---
*Generated from STORM research 2026-06-20. Update iteratively.*