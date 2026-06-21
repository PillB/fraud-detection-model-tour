# Roadmap Contribution: Ensembles, SSL/Semi-Supervised, LLM/Hybrid Approaches for Fraud Detection

**Purpose**: Concise input to main "Model Tour" roadmap (basic → SOTA incl. Temporal GNNs + advanced ensembles). Structured notes for educational progression, model cards, experiments, website comparisons. Backed by synthesis, detailed notes, papers_sources.md. Focus: actionable recs for scenarios.

**Overall Philosophy (from STORM Synthesis)**: No single SOTA winner. **Layered hybrids** are 2024-2026 state: fast classical/ensemble gates (imbalance/real-time) + SSL/graph for reps/relations + selective LLM/RAG/agent for unstruct/context/XAI. Teach components rigorously (origin/mech/pros/cons/lim) then integration patterns. Experiments on structured+graph primary (per AGENT_STATE), extensibility notes for logs/KYE/KYA/unstruct. All content accurate, citable; runnable toys.

**Position in Roadmap**:
- **Basic**: Rules + LR/RF + simple imbalance (SMOTE, class weight).
- **Intermediate**: XGBoost/LGBM cost-sens, IF anomaly, basic ensembles (voting/stacking).
- **Advanced Classical/Anomaly**: Hybrids (this subagent ensembles_notes).
- **Graph/Temporal GNN** (sibling subagent): Het GNN, temporal, self-explain (SEFraud).
- **SOTA/Enriched**: SSL pretrain (tabular/graph), semi/few-shot, full hybrids w/ LLM/RAG/agentic, transaction FMs, KYA integration.
- **Cross**: Synthetic data, XAI throughout, monitoring/drift, layered pipelines.

**Key Educational Messages**:
- Imbalance, drift, XAI, latency as first-class constraints (not afterthoughts).
- Unsup/SSL crucial when labels scarce/novel fraud.
- Hybrids > sum of parts; architecture (cascade vs fusion) matters as much as algos.
- LLM augments (review/enrich) not primary detector.
- KYE/KYA/logs: Extend graph + text; emerging for agentic threats.

## Top Recommended Models/Combinations by Scenario

**1. High-Recall First (minimize missed fraud; tolerate some FP for investigation)**:
- **Primary Rec**: Isolation Forest (or AE) + cost-sensitive XGBoost/LGBM cascade or score fusion/IF-anomaly as feature.
  - Why: IF catches novel/unknown (unsup); XGB known patterns w/ weight. High recall tunable via thresh/contamination. Fast prefilter.
  - From: Monteiro/Shanaa/Devarakonda hybrids, classic prod.
  - Extensions: + simple voting of bases.
  - Metrics focus: Recall@K (top-N), PR-AUC. Cost matrix: low FN penalty.
  - Latency: Excellent (IF prefilter most txns).
  - Toy: sklearn IF + xgb w/ scale_pos_weight.
  - Sibling: Add basic graph degree feats.
  - LLM ext: Selective agent review only on top uncertain (RAG for context).
  - SSL: Pretrain feats w/ Hyphatia/T-JEPA style for better base.
  - KYE/KYA: Basic user stats; extend later.

**2. Low-FP (minimize customer friction/churn; precision critical; review budget limited)**:
- **Primary Rec**: Cost-sensitive stacking ensemble (FinStack-Net style: hierarchical cross-feats + LGBM/CatBoost + residual attn DNN + LR/XGB meta) + calibrated thresholds + cost-aware post-processing. Or tuned cost-sens XGB alone if simpler.
  - Why: Learned combination reduces variance; explicit costs align w/ FP expensive. Threshold move for target precision.
  - From: Cheng FinStack-Net 2025, Btoush stacking, cost-sens ensemble refs, Thivaios survey.
  - Extensions: IF/XGB hybrid as one "base" in stack.
  - Metrics: Precision at high-recall, expected cost, FP rate @ fixed recall.
  - XAI: SHAP global + local mandatory.
  - Latency: Med (multi-model; can distill).
  - SSL: SSL-pretrained embeddings as input feats to stack.
  - Graph ext: GNN scores as additional base learner in stack.
  - LLM ext: LLM only on borderline cases (RAG evidence to confirm/override low FP risk).
  - KYE/KYA: Include as high-importance features (insider/agent risk strong FP signal if misused).

**3. Graph-Heavy (fraud rings, relationships, KYA clusters, multi-entity, camouflage dominant)**:
- **Primary Rec**: Self-explainable graph methods like SEFraud (het graph transformer + learnable feat/edge masks + supervised contrastive triplet loss) or extensions (temporal GNN sibling). Pretrain w/ graph SSL (contrastive like GraphGuard or generative).
  - Why: Captures relations (fraud networks, shared devices/agents); self-explain built-in (masks fast + faithful); strong gains (+8.6% AUC in paper). Handles heterophily/camouflage.
  - From: SEFraud KDD24 (ICBC deploy), safe-graph papers (PC-GNN, CARE-GNN, BWGNN etc.), contrastive SSL GAD.
  - Ensemble: Fuse w/ classical tabular scores (late) or include flat feats.
  - SSL/Semi: Essential (pretrain on unlabeled graph; few-shot AnomalyGFM or CGNN for labels scarce).
  - LLM ext: RAG over graph (subgraph retrieval + summaries) + agentic review of GNN flags. Text-attributed (log embeds on nodes/edges).
  - KYE/KYA critical: Agent/employee nodes + "agent_of"/"reviewed_by" edges. Detect hidden orchestrators via connectivity.
  - Metrics: AUC/Rec + graph-specific (community detection proxy). Explain: masks + top edges/feats.
  - Latency: GNN on flagged subgraphs (sample or incremental).
  - Limitations note: Dynamic graph maintenance; pair w/ fast gate.
  - Sibling synergy: Temporal GNN + this.

**4. Log-Heavy / Unstructured Dominant (access logs, descriptions, notes, OSINT, behavioral text; structured secondary)**:
- **Primary Rec**: LLM/RAG pipeline gated by classical (or simple rules). RAG over logs + txn summaries + KYC/KYA profiles. Agentic multi-agent review (retrieve, reason over evidence, decide).
  - Why: LLMs excel at semantic log analysis, intent, anomaly phrasing. RAG grounds + cites (low halluc). Selective for cost/latency.
  - From: Singh RAG fraud arXiv, Mastercard RAG, IBM encoder LLMs + ML ensemble, OCR-APT (logs+subgraph+LLM), GuARD text-rich, LLM tabular anomaly ICLR25, Agentic RAG survey.
  - Gate: IF/XGB or stack on structured first (pass-through most).
  - Graph synergy: Log events as edges or text attrs; retrieve graph context too. Text-attributed GNN.
  - SSL: Embed logs via sentence/LLM; or contrastive on log seqs.
  - Synthetic: Gen realistic log fraud variants.
  - KYE/KYA: Agent/employee logs + profiles in RAG chunks and graph. "Know Your Agent" for delegated/AI actions in logs.
  - Metrics: Detection lift on unstruct signals; human review utility (evidence quality).
  - Latency: Gate critical; LLM on <1% candidates or async.
  - Full: Log embeds concat to tabular/graph feats for hybrid tower.
  - Foundation: Use txn/log pretrain models (PANTHER, TransactionGPT) for seq understanding.

**Cross-Scenario Top Combinations (Concise for Roadmap)**:
- **Baseline/Entry SOTA**: IF + cost-sens XGB cascade/hybrid (or stack). + SSL pretrain (Hyphatia/T-JEPA). XAI (SHAP). Easy to implement, strong imbalance handling.
- **Balanced Production**: Layered cascade - classical ensemble gate (high-recall/low-lat) -> graph/SSL (SEFraud-style or temporal GNN on flagged) -> selective RAG + agentic LLM review (evidence-grounded). Late fusion or LLM meta. Includes KYE/KYA in graph + logs in RAG.
- **Max Performance (research/tolerate cost)**: Stacking (incl. GNN/SSL scores as bases) + text-attributed graph foundation + full agentic RAG/LLM + synth aug. Multi-modal early/mid fusion.
- **Few-Label / Cold-Start / New Domain**: SSL pretrain (tabular + graph) or transaction foundation model (TREASURE-like) -> few-shot GNN/ prompt (AnomalyGFM, CGNN) -> RAG on small labeled cases. Semi w/ gray samples.
- **High-Drift / Novel Fraud**: Heavy SSL pretrain + RAG (fresh retrieval) + unsup/IF component + agent red-teaming. Continuous index update.
- **Regulatory/Explain-Heavy**: SEFraud (or XAI-wrapped) + RAG citations + cost-sens calibrated + full decision audit trail (masks + SHAP + retrieved). Human review default on flags.
- **Log + Graph Integrated**: Text-attributed het GNN (or GNN + LLM tower) + RAG over subgraph+logs + classical gate. KYA nodes prominent.
- **With Synth**: Any above + LLM/VAE synth rare fraud (conditioned on type/KYA) mixed in train + RAG.

**Implementation Notes for Roadmap**:
- **Progression**: Component teaching (ensembles_notes detailed per tech) → SSL/semi → LLM/hybrid integration (llm_notes pipeline sketches) → full layered expt.
- **Model Cards**: One per major (IF, XGB cost, Stacking, SEFraud, Hyphatia SSL, RAG-LLM reviewer). + "Hybrid Pipeline" card (w/ toy cascade code stub). Include: origin/mech/pros/cons/assump/lim/fraud fit + runnable Python (sklearn/xgb/torch minimal) + viz (PR curve, graph, attention).
- **Experiments**: Toy transactional+relational+behavioral (simulate logs as text). Compare: single vs hybrid vs layered. Metrics: PR-AUC, Recall@100, latency, FP@recall=0.9, explain quality. Ablations: w/wo SSL, KYA features, RAG. Temporal drift sim. Imbalance levels.
- **Website**: Comparisons table (per scenario); interactive "build your pipeline" (select gate + graph + LLM); handholding explanations; citations.
- **Extensibility**: Notes in cards: "For logs: add LLM embed tower"; "KYA: add agent nodes"; "full: RAG agent on top".
- **Risks in Roadmap**: Avoid overclaiming LLM; emphasize gating/layering. Cite surveys/papers. Validate all toys run.
- **SOTA 24-26 Snapshot**: Ensembles/hybrids mature; SSL practical gains (tabular beats XGB); graph self-explain prod; LLM/RAG/agentic rising (selective); foundation txn models emerging; layered consensus.

**Contributions to Broader Roadmap**:
- Fills "advanced ensembles" + "self-sup/semi + LLM/hybrid" gaps.
- Complements classical-anomaly-supervised (add hybrids/SSL) and graph-temporal-gnn (add classical gate, LLM top, KYA, integration).
- Synthesis: Layered hybrid is the practical SOTA.
- Limitations/best_practices.md: For honest content.
- papers_sources: All recs traceable.

**References**: Full grounding in papers_sources.md (surveys Chen/Thivaios/Hafez; SEFraud; Hyphatia; FLAG/DGP/TransactionGPT etc from safe-graph; RAG Singh/Mastercard; Sardine layered; KYA sources). See ensembles_notes.md, llm_and_hybrid_notes.md, synthesis_findings.md for depth.

**Actionable for Next Phases**: Use this + detailed files to draft main roadmap section, model cards, expt scripts. Prioritize accuracy; add citations/links.

*Concise by design for main roadmap. Details in sibling files.*
