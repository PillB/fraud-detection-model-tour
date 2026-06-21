# Findings Summary: Graph & Temporal GNNs for Fraud & Anomaly Detection

**Research Scope (STORM)**: Static GNNs (GCN, GraphSAGE, GAT), temporal/dynamic (TGN, TGAT, JODIE, CTDNE), heterogeneous temporal (HTGNN, MAST-GNN, C2GAT), advanced (FraudGT), cross-cutting issues (dynamic edges, heterogeneity, imbalance, drift), datasets (DGraph, IEEE-CIS), industry/academic practices, scalability/interpretability. All tied to relational + transactional fraud (customer-txn-merchant, KYA/KYE relations).

**Key Files Produced** (all in data/subagents/graph-temporal-gnn/):
- progress_log.md (detailed session history)
- papers_and_sources.md (curated 2023-2026 + foundational + safe-graph)
- model_notes.md (rigorous per-model: origin, mechanism, fraud detection, pros/cons, assumptions, limitations, claims, relevance)
- roadmap_contribution.md
- limitations_and_fraud_fit.md
- implementation_ideas.md (sketches for construction, static, TGN, hybrid, etc.)
- This summary

## Strongest SOTA Candidates & Why They Matter

### 1. TGN (Temporal Graph Networks) + Variants — Top Temporal Pick
- **Evidence**: Kim et al. (2024, arXiv:2404.00060) on **DGraph** (3.7M nodes, time-stamped financial relations): TGN(Mean) Test AUC **0.7747**, TGN(GCN) **0.7716** vs. strongest baselines MLP 0.6465 / GraphSAGE 0.6344 / GCN 0.6135 / HGNN ~0.645 (11-13%+ relative lift).
- **Why for transaction+relationship fraud**: Native continuous-time dynamic edges (txns, KYA-like contacts evolve). Memory module + time encoding captures user trajectory and sudden anomalous shifts (fraud rings forming). Edge-prediction pretrain + downstream node fraud classification.
- **Related strong**: TGAT mechanisms (time-aware attention, used in GTAN/Xiang 2023 for semi-supervised credit card); real payment platform TGN results (Saldaña-Ulloa 2024).
- **Caveat**: Memory can be costly (some DGraph runs omitted full memory).

### 2. GraphSAGE (often hybridized) — Production / Scale Champion
- **Evidence**: Consistently recommended as "production standard" for million+ node fraud graphs (Kumo/PyG guides, NVIDIA 2025 AI Blueprint). Inductive + neighbor sampling (fan_out).
- **Why**: Handles new entities (users, merchants); scales via mini-batching/sampling; embeddings feed strong tabular heads (XGBoost). NVIDIA: GraphSAGE_XGBoost hybrid for accuracy + reduced FPs + real-time (Triton) + explainability.
- **Fraud fit**: Excellent backbone for customer-merchant + KYA graphs. Hybrid pattern beats pure GNN or pure trees.

### 3. Heterogeneous GNNs with Attention (HGNN + GAT extensions) + Temporal Decay
- **Evidence**: Sha et al. (2025, arXiv:2504.08183) on IEEE-CIS (converted to user-merchant-transaction hetero graph): Proposed HGNN + GAT + temporal decay outperforms plain GCN/GAT/GraphSAGE. SMOTE + cost-sensitive.
- **Why**: Directly models multi-type nodes/relations (KYA/KYE as typed edges/nodes, devices, workers). Attention for interpretability + higher-order paths (fraud rings).

### 4. HTGNN Family, MAST-GNN, C2GAT (Hetero + Temporal + Real-time)
- **Evidence**: Nguyen & Le (2025) real-time HTGNN txn fraud framework; Chen et al. (2026) C2GAT adaptation for financial dynamic graphs; MAST-GNN memory-aug spatio-temporal for dynamic financial fraud (production gains claimed).
- **Why**: Best match for full project (heterogeneous + dynamic txns + relations). Hierarchical/temporal attention + memory handles evolving multi-faceted fraud.

### 5. FraudGT (Graph Transformer)
- **Evidence**: Lin et al. (2024). Outperforms standard GNNs (incl. GAT/GIN/Multi-PNA) on AML/financial directed multi-graphs by explicitly using rich txn edge features and supporting complex laundering patterns.
- **Why**: Addresses core GNN weaknesses (edge neglect, limited expressivity for cycles/smurfing). Strong complement when txns are edge-heavy.

### Supporting Fraud-Specific (safe-graph lineage)
- DGFraud models (SemiGNN, GraphConsis, GEM, HACUD etc.): Tailored exactly for camouflage, label scarcity, financial/opinion fraud inconsistency. Foundational but highly relevant; still cited.

## Why These Matter for Transaction + Relationship (KYA/KYE) Fraud
- **Dynamic edges**: Txns and relations (emergency contacts, verified KYA links, shared devices) are timestamped streams. Temporal models (TGN family) process events natively without full retraining.
- **Heterogeneity**: Users, merchants, devices, workers (KYE), txns-as-nodes/edges. HGNN/HTGNN families excel.
- **Rings & higher-order**: Attention + path analysis (GAT/HGNN) or expressivity (FraudGT) surface coordinated fraud invisible to tabular.
- **Imbalance + drift**: Self-sup pretrain (TGN), sampling (HMOA-GNN, GraphSAGE), memory (MAST/TGN), temporal decay.
- **Industry translation**: Hybrids + sampling (NVIDIA) deliver measurable FP reduction and ROI. Safe-graph provides practical implementations addressing real fraud GNN pitfalls.

**Concrete Benchmarks**:
- DGraph (primary temporal financial GAD): TGN dominates static GNNs.
- IEEE-CIS graph extensions: HGNN variants win over vanilla GNNs.
- Real platforms: TGN/HTGNN papers demonstrate on payment data (millions events).

## Open Challenges & Limitations (Actionable)
- **No universal winner**: TGN strongest on DGraph dynamics; GraphSAGE for scale/hybrids; need hybrids for prod.
- **Scalability**: Sampling essential; full memory/Temporal on 100M+ graphs requires engineering (NVIDIA cuGraph/RAPIDS patterns).
- **Interpretability**: GAT attention + hybrid XGB + subgraph methods required for fraud teams. Pure deep models insufficient.
- **Drift & Adversarial**: Temporal helps but continual learning, online memory refresh, adversarial robustness (HMOA) still active needs.
- **Data & Graph Construction**: Biggest practical hurdle—mapping raw txns + KYA/KYE/identity relations cleanly into typed dynamic graph. Entity resolution, privacy, missing data.
- **Labels**: Extreme scarcity demands semi/self-supervised + cost-sensitive always.
- **Reproducibility/Eval**: Temporal splits mandatory; public large dynamic fraud graphs limited (DGraph is standout).
- **From limitations file**: Camouflage breaks homophily; over-smoothing on complex patterns; compute for hetero-temporal + transformers.

**Gaps in Current Literature** (for project awareness): Exact production latency/$, full MAST-GNN/C2GAT details/code, very long-horizon drift studies.

## Actionable Recommendations for Project
1. **Prioritize for roadmap/model cards**: GraphSAGE (scale), GAT (interp), TGN (temporal SOTA), one HTGNN-style or simple hetero-temporal, + hybrid XGB head. Include DGFraud-inspired fraud-specific notes.
2. **Experiments**: Synthetic + IEEE-CIS graph loader + DGraph subset/time window. Time splits. Compare static vs temporal. Metrics: PR-AUC primary.
3. **Implementation path** (see implementation_ideas.md): Modular graph builder (KYA edges explicit) → sampling → static GNN → TGN sketch → hybrid → metrics + attention viz.
4. **Citations & Rigor**: Use papers_and_sources.md (safe-graph central, Kim 2024, Sha 2025, NVIDIA 2025, FraudGT 2024, etc.). No hallucinations.
5. **Website/education**: Highlight "temporal lifts fraud detection on dynamic relations by X% on DGraph"; handhold graph construction for KYA/txn; contrast industry hybrid vs academic pure.
6. **Risk mitigation**: Always note assumptions (homophily etc.) and limitations; provide toy runnable code; hybrid for practicality.

**Strongest Overall Synthesis**: For relational + transactional fraud, **TGN (or temporal attention variants) on dynamic multi-relational graphs (with GraphSAGE-scale sampling and GAT/hybrid interpretability)** represent the current high-water mark. They directly address time-evolving edges and relationships that tabular or static GNNs miss, with demonstrated gains on realistic large financial benchmarks. However, success requires careful graph construction, imbalance/drift mitigations, and production hybrids.

**Sources**: All backed by safe-graph repos, arXiv 2024-2025 papers (DGraph TGN, IEEE HGNN), 2025-2026 adaptations (C2GAT/MAST/HTGNN fraud), NVIDIA production blueprint, DGFraud tooling. See papers_and_sources.md and progress_log for full traceability.

---
*STORM research complete 2026-06-20. Ready for integration into roadmap, cards, and experiments.*