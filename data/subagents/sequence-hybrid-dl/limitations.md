# Limitations & Assumptions: Sequence-Hybrid DL Research for Fraud Detection

**Context**: Honest retrospective per STORM methodology and project guardrails (AGENT_STATE, other subagents). All claims backed by real searches/browses (Chen 2025 arXiv:2502.00201, Thivaios 2026, Vallarino 2025, etc.). No hallucinations. This file + findings_summary.md provide balanced view for roadmap / model cards.

## Data & Evidence Limitations
- **Benchmarks Heavy on Public/Synthetic**:
  - Dominant: Kaggle European CC Fraud (~0.172% fraud, PCA features, old 2013). Easy to overfit/reproduce but not fully representative of real prod distributions, adversarial evolution, or full KYA/KYE richness.
  - IEEE-CIS, DGraph (temporal), Elliptic (crypto) used; synth for generative/ rare patterns (Vallarino 2025 MoE high numbers on synth).
  - Real bank/payment platform data in some papers (proprietary; e.g. TGN/LSTM apps) — exact numbers, FE details, latency often redacted. Performance in prod likely higher with domain FE but harder to compare.
- **Survey Cutoffs & Recency**:
  - Chen 2025: 57 papers 2019-2024 (Kitchenham). Excellent breadth but misses 2025-2026 specifics (e.g. Vallarino MoE, new KAN/Capsule fraud, Temporal Trans+CTGAN, 2025 TabTrans weighted variants). We supplemented w/ targeted searches.
  - Thivaios 2026: Strong taxonomy but high-level (no exhaustive per-model perf tables in abstracts).
- **Numeric Claims**: Often abstract-only or on specific preproc/FE. Cross-verified where possible (e.g. TGN DGraph AUCs from 2024 paper; MoE from 2025 full claims). Exact deltas sensitive to splits, thresholds, cost matrices. PR-AUC preferred but not always reported uniformly.
- **Diffusion Models**: Sparse direct fraud/seq applications 2023-2026 (emerging; more in general AD). Noted as gap/future.

## Model-Specific Limitations (Domain-Relevant)
- **All DL (esp seq/Trans/hybrids)**:
  - Label scarcity/delay/noise: Fraud often unreported or delayed. Relies on semi/unsup/gen or costly labels. Extreme imbalance amplifies (majority bias in seq models).
  - Interpretability: Black-box vs trees. Attn scores help (TabTrans, Trans seq, MoE gates) but not sufficient for regulators/analysts alone (post-hoc SHAP/LIME needed; see classical/graph agents).
  - Compute & Scale: Trans quadratic in seq length (long user histories or log streams expensive). RNN sequential inference. MoE routing overhead. Real-time prod (<100ms) requires truncation, distillation, sparse activation, or hybrid w/ fast gates (MLP/trees).
  - Data Hunger: Need rich history per entity for seq models; high-dim feats for KANs/Trans.
- **Sequence/Recurrent (LSTM/GRU/BiLSTM)**:
  - Cold-start: New users/accounts lack seq history → fallback to tabular/global models.
  - Long seq: Vanishing mitigated but still; truncation loses signal.
  - Streaming real-time: Full backprop difficult; state carry-over or online learning needed.
  - Assumption violation: Fraud adversarial — patterns shift faster than model adapts without continual learning.
- **Transformers (incl TabTrans, seq, MoE-Trans)**:
  - Positional/time encoding critical and error-prone for irregular tx times.
  - Over-smoothing or attention dilution on noisy tx data.
  - TabTrans: Numerics handled separately (less "pure" Trans power); still benefits from good FE.
- **KANs**:
  - Empirical mixed (arXiv:2408.10263 2024: "in general, is not suitable for fraud detection problems"; works under spline-separability post-PCA test). Slower training vs MLP. Limited large-scale fraud benchmarks. Promising for time-series AD (KAN-AD) but not universal.
- **Generative (VAE/GAN + seq crosses)**:
  - Train instability (GAN mode collapse; VAE posterior collapse).
  - Synth quality: May not capture full adversarial diversity or tail real fraud (Chen notes potential but "moderately applied").
  - Evaluation: Synth perf optimistic.
- **Hybrids/MoE (RNN+Trans+AE)**:
  - Vallarino 2025: Strong reported numbers but on synthetic high-fid data. Gating complexity, load imbalance in MoE, multi-loss tuning. Modular but higher dev/ops cost vs monolithic.
  - General: More moving parts = more failure modes (staging, fusion weights).
- **Capsule (RMGACNet 2025)**:
  - Newer in fraud lit (graph-attn + capsules); promising for hierarchical rings but fewer independent replications/benchmarks than LSTM/Trans.
- **EBM/RBM**:
  - Sampling hard for discrete high-dim tx or graph data. Scalability limits vs modern DL. Some "EBM" refs actually refer to Explainable Boosting Machines (GA2M/interpretml) — distinct but related interpret use.
- **Cross-Modal (KYA + seq + logs + graph)**:
  - Privacy/storage: Full histories + relational logs raise compliance (GDPR). Cold entities, missing links.
  - Fusion complexity: Early concat vs late (attn/MoE) vs embeddings.
  - Alignment: Different temporal granularities (tx vs log events).

## Assumptions in Literature & This Research
- **Data Assumptions**: Sufficient labeled (or pseudo) data for sup; normal dominant for AE/unsup; timestamps accurate/ordered; entity-linkable history (for seq/KYA).
- **Stationarity/Slow Drift**: Many models assume patterns evolve gradually; adversarial fraud violates (new types appear suddenly).
- **Feature Richness**: Strong results often depend on excellent FE (velocity, aggs, periodic — Bahnsen 2016 cross-ref). Raw data rarely sufficient.
- **Evaluation**: Metrics reported assume tuned thresholds; operational cost (FP review vs FN loss) not always modeled.
- **Reproducibility**: Code often not public; hyperparams/FE pipelines critical but under-specified.
- **Our Synthesis Assumptions**: Prioritized peer-reviewed/arXiv high-visibility + surveys; 2023-2026 focus w/ foundational noted. Performance paraphrased accurately where accessible.

## Deployment & Real-World Limitations (per Thivaios 2026 + Chen)
- Latency/Throughput: Pure DL seq on high-volume streams needs optimization (cascades, sampling, edge deployment).
- Concept Drift & Adversarial: Fraud evolves (smurfing, mules, AI-generated); models degrade. Requires active learning, monitoring (recon drift, performance), retrain pipelines.
- Cost-Sensitivity & Ops: FP expensive (customer friction); FN costly (losses). Thresholds/domain costs must be explicit.
- Regulatory/Explain: "Black box" DL faces scrutiny (EU AI Act etc.). Hybrids + attn + post-hoc + rules preferred.
- Scale: Millions tx/day; graphs 10M+ nodes. Sampling (GraphSAGE-style) or mini-batch seq essential.
- Privacy/Federated: Cross-bank KYA data sharing limited; federated DL seq promising but immature in fraud.
- Multimodal Logs: Parsing noisy/unstructured logs adds error; text + seq fusion non-trivial.

## Gaps & Future Work (for Roadmap / Experiments)
- Diffusion models for realistic seq synth (under-represented).
- Full production benchmarks + latency (NVIDIA blueprints etc. lean hybrid tree+DL).
- KAN/seq/Trans hybrids (early stage).
- Explicit longitudinal drift experiments on seq models.
- More KYA/KYE-native seq modeling (vs flattened).
- Automated architecture search or NAS for fraud-specific MoE/hybrids.
- Integration w/ LLM agentic (RAG over seq summaries + KYA + attn paths).
- Regression/blackbox tests: Toy seq data (synthetic_fraud_data.py ext) must validate DL behaviors.

## Mitigation Strategies (Recommended for Project)
- **Always Hybrid/Layered**: Classical (IF/XGB fast gate) → DL seq/hybrid (MoE/Trans) → graph/SSL → selective review (human/LLM). Reduces risk of any single family.
- **Imbalance Toolkit**: Synth (CTGAN/VAE) + focal/cost + PR-AUC + Recall@K.
- **Interpret + Trust**: Attn + SHAP + rules as guardrails; model cards w/ honest caveats.
- **Monitoring**: Drift detection (seq distribution shift, recon error baseline), A/B, human-in-loop.
- **Efficiency**: Distillation (heavy Trans → lightweight student), sparse MoE, truncated recent history + summary feats, GRU/LightTrans.
- **Data**: Augment toy generator w/ realistic seq (per-user Markov + fraud injections + KYA events + log placeholders). Use public + synth for dev.
- **Cross-Agent**: Combine w/ GNN (relational), ensembles (cascades), generative (synth/VAE details), classical (FE).
- **Validation**: Run regression gate on any toy DL code before "done".

**Cross-Refs**: findings_summary.md (positive synthesis), roadmap_contribution.md (how to expand tiers w/ caveats), model_notes.md (per-family limits), papers_and_sources.md (full cites for verification).
**Overall Assessment**: Research rigorous and exhaustive within constraints. DL seq/hybrids/MoE add significant value beyond current roadmap tiers but are complements (not replacements) for trees/ensembles in prod fraud systems. Layered + multi-family is the real SOTA pattern (reinforced by ensembles-sota-llm and graph agents).

*Compiled 2026-06-20 from verified sources. Update as new papers emerge.*
