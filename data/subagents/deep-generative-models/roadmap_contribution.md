# Roadmap Contribution: Deep Generative, Representation Learning, and Hybrid/Mixture Models for Fraud Detection

**Subagent**: deep-generative-models (STORM exhaustive research output)
**Contribution**: Expands roadmap significantly beyond current Tier 3 (brief AE/VAE mention) and Tier 6-8 hybrids. Provides generative foundations (AE/VAE/DAGMM families), adversarial/score-based synth+AD (GAN, Diffusion), and practical mixtures (VAE-GAN, MoE+experts, aug pipelines). Grounded in Chen 2025 SLR (57 papers), An&Cho 2015, Zong 2018, Ding 2023, Vallarino 2025, Bekkaye 2025, diffusion 2024 fraud papers, etc. Ensures "from classifiers (Tier 1) to AD (Tier 2/3) to mixtures" progression is rigorous and fraud-specific (structured tx + imbalance + KYA/KYE + logs).

**Scope Alignment**: Tabular/structured transactions primary (engineered + raw); relational as cond or flattened features (KYA/KYE aggregates, entity links); seq behavior for temporal; extensibility notes for logs/unstruct. Toy/runnable focus in future model cards (PyTorch + sklearn/XGB minimal). Matches classical (FE/hybrids), graph (relational native), ensembles (stacking/MoE).

## Position in Current Roadmap (Recommended Updates)
Current roadmap has:
- Tier 1: Classical sup (XGB dominant)
- Tier 2: Classical unsup AD (IF/LOF)
- Tier 3: Deep Unsupervised/Rep (AE standard + variational; hybrid latent + XGB)
- Tier 4: GNN relational
- Tier 5: TGN temporal graph SOTA
- Tier 6: Ensembles/cascades
- Tier 7: SSL/semi
- Tier 8: LLM/multimodal hybrids

**Proposed Expansions**:
- **Enhanced Tier 3: Deep Unsupervised / Generative Representation Learning**
  - Sub: AE family (standard + denoising/sparse/contractive; VAE subfamily w/ recon prob, beta, LSTM-VAE, cVAE, attention; DAGMM).
  - Why: Pure generative AD for novel fraud (no labels); latents as powerful features. Chen validates VAE/GAN/hybrid use. An&Cho recon prob paradigm shift.
  - Add: Diffusion/score-based as emerging generative (mostly aug but direct AD possible).
  - Keep AE + XGB hybrid here or promote.

- **New Tier 3b or Sub-layer: Generative Adversarial & Diffusion for AD + Augmentation**
  - GAN family: Vanilla/WGAN, AnoGAN/f-AnoGAN (AD scores), cGAN/CTGAN (primary for imbalance oversampling fraud data).
  - Diffusion: DDPM variants, FraudDiffuse-style (synth fraud aug); DDMT for seq AD.
  - Fraud fit: Synth realistic minority (often > SMOTE per papers); AD via mismatch/score.
  - Refs: Schlegl 2019, Pushkarenko 2024, Roy 2024, Strelcenia survey, Chen.

- **New Tier 6b or Integrated in Ensembles (Hybrids & Mixtures)**
  - VAE-GAN / LSTM-VAE-GAN (end-to-end).
  - AE/Gen latent/recon/energy + XGB/RF/LightGBM (pipelines or cascades).
  - MoE: RNN (seq) + Transformer (interactions) + AE (recon) w/ gating (Vallarino 2025 exemplar).
  - Generative aug + ensemble (Bekkaye 2025: DM/GAN/VAE + XGB + IF/SMOTE; insurance superior).
  - Why: Mixtures frequently SOTA for mixed novel/known + extreme imbalance. Dynamic (MoE) or staged.
  - Bridge to Tier 7 (SSL pretrain gen) + Tier 8 (LLM on gen outputs/logs).

- **Rationale for Placement**:
  - Educational: Classifiers (known patterns w/ labels) -> pure AD/generative (novel, unlabeled, density/recon) -> mixtures (adaptive, best real-world perf).
  - Evidence: Chen (GAN/VAE emerging for synth; hybrids common); recent 2024-25 papers show gen aug + hybrid lift; Vallarino/Bekkaye explicit high-perf fraud hybrids.
  - Production: Layered (Tier 0/2 fast gate -> gen AD or aug -> sup/hybrid -> graph/LLM). Matches Stripe/PayPal multi-technique.
  - Motivates progression: Pure XGB strong baseline (tabular); exposes limits (novel fraud, synth quality) -> gen/hybrids.

**Integration w/ Other Subagents**:
- Classical: Extend IF/LOF scores + deep recon/energy as features; FE (velocity + KYA aggregates) foundational for all cond/gen inputs.
- Graph-Temporal-GNN: Flattened KYA as tabular input here; promote to native (graph VAE, GAD-EBM, graph caps, cond on graph feats). TGN seq + gen seq (LSTM-VAE).
- Ensembles-SOTA-LLM: Gen models as base learners or feature extractors in stacks; synth data for training ensembles; MoE as advanced ensemble; LLM/RAG over gen explanations + logs (Tier 8). SEFraud-style SSL + gen.
- Coordinator: Aggregate into unified "generative layer" narrative; update priority_models.md w/ 4-6 new (see below); synthetic data gen in toy generator.

## Recommended Models & Configurations for Roadmap / Future Model Cards
Target expansion: Add 4-6 generative/hybrid to priority list (total ~12-14 cards). Runnable toys: PyTorch VAE/DAGMM simple + XGB; CTGAN or diffusion sketch (or proxy); MoE simplified gating.

**Priority for Cards (Top Educational + Fraud-Relevant)**:
1. **VAE (standard + recon probability focus, w/ cVAE note)** (Enhanced Tier 3)
   - Config: Latent dim 8-32; beta=1 or tuned; train normal-only or w/ light labels. Recon prob or error.
   - Why: Foundational (An&Cho); probabilistic + features + synth; direct fraud cite.

2. **DAGMM** (Tier 3)
   - Config: AE arch per data (e.g. 120->... for KDD-like); K=2-4 GMM; recon feats (rel+cos); end-to-end.
   - Why: Joint density+recon; strong on complex tabular AD.

3. **CTGAN / Conditional GAN for Oversampling** (New gen aug tier or Tier 3b)
   - Config: Use sdv CTGAN lib; cond on fraud flag or metadata; sample minority; train XGB on aug.
   - Why: Dominant practical use for imbalance CC/insurance; verifiable lift.

4. **f-AnoGAN or Tabular-adapted AnoGAN** (Gen AD)
   - Or proxy: WGAN + latent search / encoder.
   - Why: Adversarial AD score; fraud domain cited.

5. **Diffusion Aug (FraudDiffuse-style or DDPM proxy)** (New)
   - Config: Simple tabular diffusion or note custom; aug + classifier.
   - Why: 2024+ SOTA aug; often superior diversity to GAN. Bekkaye insurance.

6. **VAE-GAN Hybrid or MoE (RNN+Trans+AE)** (Hybrids tier)
   - MoE: Simplified gating + 3 expert heads (LSTM/RNN, small Trans, AE).
   - Or VAE-GAN (Ding style).
   - Why: Vallarino 2025 high-perf CC (98+%); Ding recall gains; mixtures narrative.

**Additional / Advanced**: Capsule (RMGACNet), EBM (GAD-EBM) for relational extensions; LSTM-VAE for pure seq.

**Feature Engineering (Mandatory, Reuse Classical)**:
- Always: Velocity (1h/24h/7d), amount stats/dev, time (sin/cos or von Mises), merchant/chan.
- KYA/KYE: account_age, linked_entities, shared_device_count, prior_flags, risk_score; use as cond in cVAE/cGAN/diff or input feats.
- Preproc: Robust scale/log1p amounts; embed or target cats; seq windows for LSTM.
- Synth quality check: Compare distribs (KS, corr) + downstream PR-AUC lift.

**Not Primary (but note)**: Pure vanilla GAN (instability); image-only w/o adaptation; very deep diffusion for real-time (use fast samplers or aug-only).

## Key Contributions to Roadmap Content
1. **Model Cards Inputs** (origin, mech, pros/cons tables, assump, lim, fraud fit, toy Python notes, viz):
   - Detailed in model_notes.md + taxonomy.
   - Viz ideas: Recon error/prob distribs (normal vs fraud hist); latent 2D PCA/TSNE (separation); synth vs real scatter (CTGAN/diff); MoE gating heatmap; energy surface.
   - Runnable: Minimal PyTorch AE/VAE + sklearn/XGB on synthetic or Kaggle subsample. Metrics: PR-AUC primary, Recall@0.1%, estimated cost savings (Bahnsen-style).
   - Code sketches: See hybrid_mixture_ideas.md.

2. **Experiments Design** (post-classical/graph):
   - Dataset: Kaggle CC (temporal split) + insurance proxy or synth generator (users + tx + KYA links + labels ~0.1-1% + seq logs placeholders). Add synth fraud via diffusion/CTGAN variants.
   - Ablations: Raw/FE vs +gen latents/recon vs full hybrid (VAE/XGB; MoE); pure sup vs pure AD vs mixture; normal-only train vs contaminated.
   - Variants: beta-VAE vs standard; w/ vs w/o recon feats (DAGMM); cond vs uncond.
   - Metrics: PR-AUC, F1-macro, Recall@K (ops volume), cost (FN=avg fraud amt, FP=review), synth fidelity (for aug), temporal robustness.
   - Baselines: XGB (Tier1), IF (Tier2), basic AE (current Tier3), graph if avail.
   - Drift: Inject post-train fraud evolution.
   - Compare: Quantify where gen/hybrid wins (novel fraud recall; imbalance robustness).

3. **Educational Narrative**:
   - "Classifiers (XGB) excel known patterns w/ good labels/FE. Classical AD (IF) for simple outliers. Deep generative (VAE recon prob, DAGMM energy, AnoGAN scores, diffusion) model normal manifold/density for novel/zero-label fraud + produce synth data. Hybrids/MoE orchestrate (latents to trees; expert routing) for production reality: mixed fraud types, imbalance, relational signals. Chen 2025 confirms generative/hybrid trends."
   - Limitations motivate: Instability/compute -> gated hybrids; flattening relational -> graph ext.
   - Real cases: Kaggle ubiquity; Ding/Vallarino/Bekkaye 2023-25 fraud-specific gains; Stripe/PayPal multi (anomaly + network + behavioral); insurance claims fraud.

4. **Progression Hooks**:
   - From Tier 1/2: Inject gen scores/latents (like IF).
   - To Tier 4/5: Use gen reps as node/edge feats or cond; seq experts -> TGN.
   - To Tier 6/7: MoE as ensemble; gen pretrain for SSL.
   - To Tier 8: Gen outputs/explanations + logs to RAG/LLM; synth for LLM training.
   - Continuous: Active learning on gen-flagged; monitoring synth drift.

## Gaps Identified (Honest) & Recommendations
- **Data**: Kaggle PCA-limited (relational weak); real has richer entities/history. Recommend enhanced synthetic generator (tx + KYA graph links + behavior seq + log snippets + controllable fraud types/novelty). Diffusion/CTGAN toys for aug experiments.
- **Benchmarks**: Strong CC; fewer public insurance/banking w/ ground truth for gen models. 2024+ diffusion mostly aug (need more direct AD comparisons).
- **Tabular Challenges**: Many orig papers image/TS; adaptations (CTGAN, tabular AnoGAN, FinDiff) exist but perf varies. Note in cards.
- **Prod Fidelity**: No exact Stripe/PayPal gen usage numbers; proxies via Chen + surveys. Latency: Gen heavy -> always gate (Tier 0/2/6).
- **Eval Realism**: Papers sometimes use acc/F1 (misleading); roadmap must use PR-AUC + cost + temporal.
- **Recent SOTA**: Chen to 2024; 2025 arXiv (Vallarino, Bekkaye) strong additions. Monitor 2026.
- **Uncertainties**: "Bal-VAE-Attention" interpreted as attention variants (common); exact KYA acronym vs KYC/KYE/KYB (use as relational/entity signals).
- **Compute**: Deep gen > trees; recommend hybrids w/ tree heads for inference.

**Suggested Milestones / Validation**:
- "Generative layer complete" when model_notes + papers + taxonomy pass review; toys run (VAE detects synth outliers; aug lifts PR-AUC).
- Ablation report: Pure XGB vs +VAE-latent vs VAE-GAN vs MoE on same data.
- Website: Comparison matrix (mech, fraud fit, compute, when to use); interactive latent viz or synth sampler.
- End-to-end: Reusable gen feature extractor + aug module + hybrid trainer.

**References (Primary for Updates)**: Full in papers_and_sources.md (Chen 2025, An&Cho 2015, Zong 2018 ICLR, Schlegl 2019, Ding 2023 IEEE, Vallarino 2025 arXiv, Pushkarenko 2024, Roy 2024 FraudDiffuse, Bekkaye 2025, Shi 2025). Also classical Bahnsen FE, Kaggle dataset, safe-graph for relational.

This ensures the roadmap comprehensively covers "classifiers to AD to mixtures" with depth, realism, and educational value for structured fraud use-cases.
