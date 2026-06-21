# Limitations and Fraud Fit Analysis: Graph & Temporal GNNs

**Purpose**: Honest assessment of where these models shine or struggle on relational + transactional fraud data (customer-txn-merchant graphs, KYA/KYE relations as nodes/edges). Informs roadmap, model cards (caveats section), experiments, and industry expectations. Synthesized from academic papers (DGraph, IEEE-CIS, safe-graph), industry (NVIDIA), and cross-cutting challenges.

## General Challenges in Fraud Graphs (All Models)
- **Extreme Label Imbalance**: Fraud typically <<1-2%. DGraph has fraud/normal/bg with heavy skew. Leads to high accuracy but useless models without PR-AUC, Recall@K, calibration.
  - Mitigations seen: SMOTE + cost-sensitive (Sha 2025 HGNN on IEEE-CIS); hierarchical hybrid sampling + adversarial (HMOA-GNN 2025); self-supervised pretrain (TGN edge prediction); semi-supervised (SemiGNN, GTAN/Xiang 2023); reweighting/focal.
- **Heterophily / Camouflage**: Fraudsters deliberately connect to many legitimate entities (high-degree legit neighbors) to "blend in". Violates GNN homophily assumption. Classic issue addressed in safe-graph/DGFraud papers (GraphConsis 2020, CARE-GNN lineage, GraphConsis inconsistency alleviation).
- **Concept Drift & Adversarial Evolution**: Fraud patterns change rapidly (new attack vectors, seasonal, economic). Static models degrade fast.
- **Scalability**: Real graphs: millions (DGraph 3.7M nodes / 4.3M edges) to hundreds of millions nodes/edges. Full-batch impossible.
- **Interpretability & Regulatory Needs**: Fraud teams/auditors need *why* (attention, paths, subgraphs). Black-box deep GNNs insufficient alone.
- **Data Construction & Heterogeneity**: Raw txns + KYC/KYA/KYE must be turned into typed nodes (user, merchant, device, worker, txn) + multi-relational edges. Missing attributes, privacy, entity resolution challenges.
- **Temporal Aspects**: Transactions are streaming/continuous-time. Batches or snapshots lose fidelity.

## Model-Class Specific Limitations & Fraud Fit

### Static GNNs (GCN, GraphSAGE, GAT, basic HGNN)
**Fit**:
- Good entry point for relational signals (rings via shared merchants, KYA links, devices).
- GraphSAGE: Strongest fit for scale/inductive (new customers, new merchants). Production de-facto (NVIDIA blueprint uses GraphSAGE embeddings + XGBoost; Kumo notes "GraphSAGE with neighbor sampling is the production standard").
- GAT: Best pure-GNN interpretability (attention coefficients show "this KYA relation or high-risk merchant connection drove the score").
- HGNN (Sha 2025): Excellent fit for IEEE-CIS style (user-merchant-txn nodes). Captures higher-order + attention. Temporal decay added as hybrid.

**Limitations**:
- Ignore time → poor on evolving fraud / drift. DGraph baselines show GCN 0.61, GraphSAGE 0.63 AUC (Kim 2024) vs TGN 0.77.
- Homophily assumption broken by camouflage → needs special handling (DGFraud models).
- Over-smoothing / limited expressivity on complex laundering patterns (addressed later by FraudGT).
- Scalability: Plain GCN weak; even SAGE requires careful sampling (fan_out hyperparam sensitive).
- Imbalance: Standard training fails; requires explicit mitigations.

**Fraud-Specific Risks**: False negatives on sophisticated rings (camouflaged); stale on drift.

### Temporal / Dynamic (TGN, TGAT, JODIE, CTDNE)
**Fit**:
- **Excellent for transaction + dynamic KYA-style relations**. DGraph (time-stamped emergency contacts = proxy for relational evolution) shows clear superiority.
- TGN: Memory captures user "state" evolution; time encoding ϕ(t) for event timing; link-pred pretrain learns "normal dynamics".
- TGAT: Time-respecting attention focuses on recent suspicious bursts.
- Real data successes: TGN on payment platforms (Saldaña-Ulloa 2024/2025); HetMem-TGN on 2.6M events.
- C2GAT (2026): Real-time dynamic context + attention.

**Limitations**:
- Memory footprint: Full per-node memory OOM on DGraph-scale in some ablations (Kim 2024 omitted memory module).
- Training: More sequential / harder to parallelize than static mini-batch.
- Concept drift: Better than static (online memory updates) but not automatic "forgetting" or continual learning without extra mechanisms (MAST-GNN memory augments this).
- Label scarcity: Relies heavily on self-supervised pretrain (edge pred); pure supervised weak.
- CTDNE/JODIE: Shallower or interaction-specific; weaker than full TGN in 2024+ comparisons (CTDNE often ~0.4-0.6 AUC).

**Fraud-Specific Risks**: Memory poisoning by adversarial events; latency in real-time memory updates; need for time-respecting negative sampling.

### Heterogeneous Temporal (HTGNN family, MAST-GNN)
**Fit**:
- **Highest relevance to full project schema** (multi-type nodes + KYA/KYE relations + txns + temporal).
- HTGNN: Hierarchical (node/relation/temporal) attention. Real-time txn fraud paper (Nguyen 2025) targets exactly this.
- MHT-GNN: Multi-view for diverse behaviors (good for click-farming / coordinated fraud).
- MAST-GNN: Memory + spatio-temporal explicitly for dynamic *financial fraud*.

**Limitations**:
- Complexity: Multiple attention heads/types → hyperparam explosion, harder debugging.
- Compute: Even heavier than TGN on multi-relational large graphs.
- Data hungry for all type/relation combinations.
- Newer models (MAST, C2GAT adaptations): Fewer independent benchmarks/repros.

**Fraud-Specific Risks**: Overfitting to specific relation types present in training; entity resolution errors propagate across types.

### Graph Transformers & Advanced (FraudGT, recent spatio-temporal attention)
**Fit**:
- FraudGT: Superior for *edge-heavy* transaction data (amounts, metadata on edges) + directed + complex subgraph patterns (laundering cycles, smurfing, bipartite). Directly addresses common GNN failure modes on financial graphs.
- C2GAT / Multi-Temporal GATs (2025-2026): Higher-order + temporal in one.
- Hybrids (GNN + XGB): Best of structural + tabular + explainability.

**Limitations**:
- Compute cost (transformers quadratic-ish attention).
- Less "memory" for ultra-long histories unless augmented.
- Data prep: Requires rich edge features (true for txns but extra engineering for KYA).
- Fewer "fraud-specific" toolboxes vs DGFraud's classic models.

**Fraud-Specific Risks**: Over-expressivity on noise if not regularized.

## Industry vs Academic Fit
- **Academic Strengths**: Novel mechanisms, SOTA on public benches (TGN +13% on DGraph; HGNN beats GCN/GAT/SAGE on IEEE-CIS), ablations on imbalance/camouflage (safe-graph papers).
- **Industry Strengths** (NVIDIA 2025, AWS DGL examples, production notes): Hybrids (GraphSAGE embeddings → XGBoost), sampling for real-time inference (Triton), focus on FP reduction (1% lift = $millions), explainability via trees, integration with feature/graph stores. Scalability first.
- **Gap**: Academic rarely reports end-to-end latency/cost or full production drift handling. Industry rarely publishes exact AUCs or full models (NVIDIA blueprint is exception - open).
- **Fraud Teams Practicality**: Prefer GAT attention or hybrid XGB for explanations over pure deep models. Need online learning pipelines (temporal GNN memory helps but not sufficient alone).

## Scalability & Implementation Limitations
- Millions nodes: Requires neighbor sampling (GraphSAGE style), mini-batch loaders (PyG), or distributed (DGL + cuGraph).
- Real-time: Memory modules (TGN) + efficient inference; full retrain rare.
- Storage: Graph store + feature store (NVIDIA emphasizes both).
- Hetero + temporal compound complexity.

## Interpretability Limitations for Fraud Teams
- GAT / attention: Partial (local neighbor importance) but not global "why this ring".
- Post-hoc needed: Subgraph extraction, GNNExplainer, integrated gradients, or hybrid with trees.
- Regulatory: Must justify decisions; pure GNN embeddings hard to audit vs rules or trees.
- Positive: safe-graph and papers emphasize path analysis, attention for "underlying fraud patterns".

## Assumptions That Often Fail in Fraud
- Homophily / smooth label propagation.
- Stationarity (no drift).
- Sufficient labels / balanced.
- Clean, complete graph (no missing KYA links or entity resolution errors).
- Static or easily snapshotted structure.

## Mitigations & Promising Directions (from research)
- Hybrids (GNN embeddings + trees/LLM).
- Self-supervised + temporal pretrain.
- Specialized fraud GNNs (DGFraud: GraphConsis, SemiGNN).
- Memory + adaptive sampling (MAST, HMOA).
- Graph transformers for expressivity (FraudGT).
- Temporal decay / context (Sha 2025, C2GAT).
- For project: Start with GraphSAGE + GAT + TGN toy; add hetero/temporal; always hybrid metrics + explain.

**Key Takeaway for Roadmap/Experiments**: Temporal models (esp. TGN on DGraph-like) show strongest lift for dynamic relational+transactional. But no silver bullet—always combine with imbalance handling, sampling, hybrid explainable head, and ongoing monitoring for drift. Static GNNs sufficient for proof-of-concept or smaller/static relations; move to temporal/hetero-temporal for production fraud value.

**Sources**: See papers_and_sources.md (Kim 2024 DGraph TGN, Sha 2025, NVIDIA blog, safe-graph/DGFraud READMEs, HMOA-GNN 2025, etc.).

---
*Compiled rigorously 2026-06-20. Flag any unverified numeric claims.*