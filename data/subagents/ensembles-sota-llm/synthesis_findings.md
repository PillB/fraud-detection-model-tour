# Synthesis Findings: Integrated Insights on Ensembles, SSL/Semi-Supervised, and LLM/Hybrid for Fraud Detection

**Purpose**: Synthesize across all researched areas into coherent findings. Trade-offs, comparisons, emergent patterns. Supports main project roadmap and model cards. Accuracy-prioritized; all backed by papers_sources.md.

**Key Fraud Challenges Recurring**:
- **Extreme Imbalance (0.01-0.1% fraud)**: Every approach must address (unsup/SSL for novel, cost-sens for sup, synth for aug, recall-focused metrics like PR-AUC/Recall@K over accuracy).
- **Real-time & Scale**: <100ms typical target; high vol (k tx/s). Prefilter/cascade essential; heavy models (full LLM/GNN) selective.
- **Interpretability & Regulatory**: XAI mandatory (SHAP, self-explain like SEFraud masks, retrieved evidence in RAG/agent). Auditable decisions; human oversight.
- **Drift & Adversarial**: Fraud evolves (camouflage, AI-gen attacks like deepfakes >50% per 2025 reports). SSL pretrain + RAG (fresh retrieval) + monitoring > static sup.
- **Structured + Unstructured**: Txns/users/KYC/KYE/KYA (struct + rels) + logs/descriptions/OSINT (unstruct). Hybrids win.
- **Data Scarcity**: Few labels common → SSL/semi/few-shot/foundation models key. Privacy (synth, FL).

**Cross-Area Emergent Patterns (2024-2026 SOTA)**:
1. **Layered/Cascaded Hybrids Dominate over Monolithic**: Fast classical ensembles (IF+XGB cost-sens or stack) gate 95%+; graph/SSL on flagged; LLM/agent selective review. (IBM ensembles, Sardine layered, cascade papers, pipeline sketches in LLM notes). Not "LLM replaces" - "force multiplier".
2. **Self-Supervised Pretraining as Foundation**: Tabular (Hyphatia SubTab +2.14% AUROC vs XGB; T-JEPA latent mask no-aug) and graph (GraphGuard contrastive, SEFraud masks+triplet, AnomalyGFM zero/few). Pretrain on unlabeled massive data → robust reps for downstream sup/semi/few-label + better drift resistance. Complements classical (better feats) and LLM (domain-adapt embeds).
3. **Self-Explainable + Retrieval for XAI**: SEFraud (masks in GNN forward pass, ms expl) + RAG (cited evidence) + agent reasoning > pure post-hoc. Addresses regulatory + trust. Deployed (ICBC).
4. **Graph + Text/LLM Convergence**: Text-attributed graphs, LLM-enhanced GNN (FLAG KDD25), GraphRAG/RAG-reasoning (2025 papers), DGP prompting. Transaction foundation models (TransactionGPT/TREASURE KDD26, PANTHER) self-sup on seq/behavior.
5. **Cost-Sensitive + Imbalance-Native Everywhere**: Applied to ensembles, losses, thresholds, fusion. Paired w/ synth or semi.
6. **Few/Zero-Shot & Semi via SSL**: CGNN (1-5 labels), AnomalyGFM, CRoC limited sup. Gray samples (suspicious unlabeled) leveraged in semi graph fraud.
7. **Agentic Evolution**: From static RAG to Agentic RAG (2026 survey); multi-agent review systems for complex cases (logs+graph+KYA). Orchestration over raw gen.
8. **GenAI Dual-Use**: Offense (deepfakes, fake docs, agent fraud → KYA critical); Defense (synth data, LLM log analysis, agent defense).
9. **Survey Consensus (Chen25, Thivaios26, Hafez25)**: Hybrids/multimodal/XAI/cost-sens/ federated/privacy + emerging LLM-assist. Classical/ML still core; DL/graph add power.

**Technique-by-Technique Synthesis & Trade-offs** (see ensembles_notes.md and llm_and_hybrid_notes.md for per-technique depth):

**Ensembles**:
- IF+XGB hybrids (cascade/fusion): Best entry for imbalance + novel (IF) + known (XGB). Fast, interpretable. Trade-off: simple vs misses relational (add graph). Complements SSL (pretrain feats) perfectly.
- Stacking (FinStack-Net style): Max performance on complex tabular. Higher latency/complexity. Fuse w/ GNN/LLM scores.
- Cascade + Cost-sens: Latency + business alignment. Essential for real-time. Easy to layer (classical cascade -> LLM).
- Voting: Baseline robustness only.
- Overall: Strong w/ SSL (pretrained bases) or as gate for LLM.

**SSL/Semi-Supervised**:
- Tabular pretext (mask/recon in data or latent space): Scalable pretrain w/o labels/augs. Hyphatia shows beats strong baseline on real CCFD. Feeds improved tabular to ensembles.
- Graph contrastive/generative/predictive: Handles camouflage, structure. SEFraud adds self-explain + performance. Semi: use few labels + abundant unlabeled/gray.
- Complements: Pretrain then ensemble fine-tune or GNN; LLM on top of SSL embeds (text+graph).
- Few labels: Foundation pretrain (zero/few-shot) + prompt/adapt or semi label prop.

**LLM/Hybrid**:
- Log analysis / OSINT: Fills unstructured gap. RAG grounds it.
- RAG (txn graphs + text): Key for evidence-based, low-halluc. Selective use.
- Agentic: Reasoning over retrieved + models. Multi-agent for review.
- Synthetic: Imbalance fixer; privacy; test.
- Full integration: Cascaded (fast ensemble gate -> graph/SSL -> selective LLM/agent) or late fusion. Early fusion powerful but heavy.
- KYE/KYA + Logs: Treat as first-class: KYA agent nodes/edges + text logs in het graph + RAG chunks. Critical for agentic/AI fraud 2025+.
- Trade-off: Power (context, reasoning) vs latency/cost/reliability. Always gate.

**Comparisons Across Paradigms**:
- Pure Classical/Ensemble: Fastest, cheapest, good XAI baseline. Weak on novel/relational/unstruct. (Use as gate.)
- SSL/Semi (no/few labels): Generalization, pretrain leverage unlabeled. Less "supervised signal" initially; pair w/ downstream sup.
- Graph (GNN/SSL): Captures relations (fraud rings, KYA clusters). Computation heavy for dynamic; interpret via SEFraud-style.
- LLM/RAG/Agentic: Semantics + unstructured + reasoning. Expensive, selective; halluc risk mitigated by retrieval.
- **Winning Pattern**: Layered hybrid (ensemble/SSL/graph base + LLM top). Performance > any single; addresses all challenges.

**Pipeline Integration Patterns (Recommended)**:
- **Data**: Het graph (struct KYE/KYA/rels + text embeds/logs) + RAG index (subgraphs, logs, OSINT, profiles).
- **Flow**: Ingestion -> classical ensemble gate (IF/XGB cost-sens or stack; high-recall) -> graph/SSL layer (flagged; SEFraud-like w/ masks) -> selective agentic RAG LLM (evidence + reason) -> fused decision + full explain (masks + citations + SHAP) -> feedback.
- **Fusion Levels**: Score (late), embedding (mid), or agent-orchestrated.
- **Adaptation**: SSL foundation update (unlabeled); RAG refresh; supervised fine on new labels; cost review.
- **KYE/KYA Emphasis**: Include explicitly in graph + text. RAG query on agent behaviors. Helps hidden orchestrators/mules/AI agents.

**Limitations of Current SOTA (High-Level; see dedicated file)**:
- Hybrids complex to implement/monitor.
- Eval: Hard to compare across papers (different datasets, metrics; imbalance makes apples-apples tough). Few public graph+text+log fraud benchmarks.
- Compute/Privacy: LLM/graph heavy; real prod uses selective + on-prem/small models.
- No silver bullet: All need human oversight, continuous adaptation.
- Emerging: Agentic safety, foundation model eval for fraud, KYA standards.

**Strengths & Opportunities**:
- SSL pretrain + hybrids: Label efficient, drift resilient.
- Self-explain + RAG: Regulatory ready.
- Transaction FMs + Graph LLM: Future foundation for the domain (like vision/language FMs).
- Layered: Practical, measurable ROI (e.g. ensembles 50%+ fraud red; RAG big lifts reported).
- Extensibility: Classical experiments (main focus per AGENT_STATE) easy to extend w/ these notes (e.g., add IF feat, SSL pretrain stub, LLM review note).

**Quantitative Highlights (from sources, use cautiously - validate in expts)**:
- Hyphatia: +2.14% AUROC over XGBoost (tabular SSL).
- SEFraud: +8.6% AUC, +8.5% Rec, 10x expl speed; ICBC prod.
- Hybrids: Often 50%+ fraud red, 80%+ FP red vs legacy (various).
- RAG/LLM: Significant lifts in unstructured (Mastercard refs); layered gains.
- Imbalance papers: Focus PR-AUC; cost-sens improves business metrics.

**Gaps Identified for Main Project**:
- Need realistic toy data w/ graph + some unstructured simulation (logs text) for model cards.
- Experiments: Compare layered (classical gate + ...) vs pure; measure latency, PR-AUC, explain fidelity, drift sim.
- Model cards: Include hybrid cards or "integration patterns".
- Roadmap: Scenarios (high-recall, low-FP, graph-heavy, log-heavy) w/ recs (detailed in roadmap_contribution.md).
- Tests: Blackbox for pipeline behaviors (imbalance, drift).

**Conclusion of Synthesis**: For fraud detection (esp. structured+unstructured), the SOTA 2024-2026 is **not any single advanced method but principled integration**: ensembles (esp. IF+XGB or cost-sens stack) for speed/recall/imbalance, SSL (tabular/graph pretext) for representation and few-label, graph for relations (w/ self-explain), and LLM/RAG/agentic selective for unstructured/context/reasoning/XAI. Cascaded layered pipelines best balance constraints. KYE/KYA/logs represented as graph nodes/edges + text in RAG. This directly informs educational content: teach components then integration.

**Next**: Use for roadmap_contribution.md (concise recs per scenario), limitations_and_best_practices.md, and main docs/roadmap.

*All claims cross-ref papers_sources.md + detailed notes. Prioritize for accuracy.*
