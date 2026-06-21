# Findings Summary: Deep Generative, Representation Learning, and Hybrid/Mixture DL for Fraud & Anomaly Detection

**Date**: 2026-06-20
**Subagent**: deep-generative-models
**Task Completed**: Exhaustive STORM research + all required artifacts saved to data/subagents/deep-generative-models/ (progress_log.md, papers_and_sources.md, model_family_taxonomy.md, model_notes.md, roadmap_contribution.md, limitations_and_fraud_fit.md, hybrid_mixture_ideas.md, this file).

## Expanded Families Summary (Exhaustive Taxonomy Highlights)
Major families mapped (full in model_family_taxonomy.md; details + pros/cons/mech in model_notes.md; sources in papers_and_sources.md):

1. **Autoencoders Family**:
   - Standard/Deep AE + variants (Denoising, Sparse, Contractive).
   - VAE subfamily: Standard (An & Cho 2015 recon *probability* paradigm), conditional (cVAE), beta-VAE, LSTM-VAE (seq), CNN-VAE, attention variants.
   - DAGMM (Zong 2018 ICLR): Joint AE + GMM (latent + recon feats -> energy score; end-to-end).

2. **GAN Family**:
   - Vanilla/WGAN/DC; AnoGAN/f-AnoGAN (Schlegl 2017/2019; tabular 2024 adaptation); Conditional (cGAN/CTGAN for tabular oversampling).

3. **Diffusion / Score-Based**:
   - DDPM variants; tabular (FinDiff); fraud aug (FraudDiffuse Roy 2024, Pushkarenko 2024 DDPM synth); TS AD (DDMT).

4. **Hybrids/Mixtures**:
   - VAE-GAN / LSTM-VAE-GAN (Ding 2023 CC; Niu 2020 TS).
   - AE/Gen + XGBoost/ensemble (latents/scores or aug pipelines; Bekkaye 2025).
   - MoE (Mixture of Experts): RNN seq + Trans interactions + AE recon (Vallarino 2025 arXiv CC fraud).
   - GAN/Diffusion + supervised + IF.

5. **Other Representation**:
   - Capsule Networks (RMGACNet Shi 2025 financial fraud; BankGuard-CapsNet).
   - Energy-Based Models (GAD-EBM graph AD w/ financial fraud apps; Elsa semi-sup).
   - (Context: Deep SVDD, SSL reps.)

**Cross-cutting**: All extensible via conditioning (cVAE/cGAN/diff), flattened KYA/KYE aggs, seq models for behavior, graph hybrids for relational. Logs via seq/cond or Tier 8 RAG.

**SOTA 2024-2026 Examples/Benchmarks** (Chen 2025 SLR of 57 papers 2019-2024 + later arXiv):
- CC fraud (Kaggle European 284k txns, 0.172% fraud dominant proxy): Ding 2023 improved VAE-GAN (recall gains); Vallarino 2025 MoE hybrid (98.7% acc/94.3% prec/91.5% rec on synth); AnoGAN tabular adaptations.
- Insurance: Bekkaye 2025 generative hybrids (VAE/GAN/DM + XGB/RF/LightGBM/IF/SMOTE; diffusion combo often tops acc/calib/robustness).
- Banking/others: Chen trends (credit card + banking high pubs); diffusion aug (Pushkarenko/Roy 2024) on txn benchmarks.
- Broader: Chen notes GAN/VAE for synth imbalance; Autoencoder-LSTM, other hybrids; GNN context but generative focus here.

All claims traceable (Chen arXiv:2502.00201 extracts; primary PDFs for mech).

## Training Challenges, Eval, & Mixtures Insights
- **Challenges**: GAN instability/mode collapse; diffusion slow sampling; VAE collapse (mit beta); compute (vs trees); contamination of "normal" train; synth quality (fidelity checks needed); drift.
- **Eval**: PR-AUC (imbalance), Recall@K, cost (FN=loss, FP=review); temporal splits; recon/energy distribs; synth downstream lift (not just visual).
- **Mixtures vs Pure**:
  - Pure classifiers (XGB): Strong for known fraud + labels + FE.
  - Pure gen AD (VAE recon prob, DAGMM energy, AnoGAN score, diff): Novel/zero-label/unseen patterns.
  - Mixtures/hybrids outperform when: Mixed novel+known, extreme imbalance, relational/behavioral complexity (latents/aug + sup or MoE routing). Evidence: Hybrids in Chen; Vallarino MoE > standalones; Bekkaye DM+classif; Ding VAE-GAN; classical IF+XGB lift extended.
- **Fraud Fit**: Structured tx (all after FE/encoding); imbalance (gen synth primary); novel (unsup AD); KYA/KYE (cond or aggs; graph ext); logs (seq/cond). Pure gen for exploration; mixtures for prod layered systems.

## Top 4-6 New Models Recommended for Future Model Cards
(Expand priority_models.md + roadmap Tier 3 + new hybrid sub-layers. Runnable toys + viz.)

1. **VAE (w/ An & Cho recon probability focus + cVAE note)**: Foundational probabilistic AD + reps + synth. Direct CC fraud relevance. Latent + recon_prob -> XGB easy hybrid.
2. **DAGMM**: Joint AE + GMM density for complex tabular. Energy score. Strong on high-dim proxies (KDDCUP/cyber-fraud like).
3. **CTGAN / Conditional GAN for Oversampling**: Practical imbalance fix for CC/insurance. Synth fraud -> classifier. (Strelcenia survey + many papers.)
4. **Diffusion-based Aug (FraudDiffuse / DDPM proxy)**: 2024+ emerging; often superior diversity/quality. Aug + XGB (Pushkarenko, Roy, Bekkaye insurance wins).
5. **VAE-GAN Hybrid**: Combines VAE stability/prob + GAN quality (Ding 2023 CC gains). End-to-end or staged.
6. **MoE (RNN + Transformer + AE experts)**: Adaptive routing (Vallarino 2025). Exemplar for mixtures; catches novel via AE + seq/interactions.

**Bonus/Advanced**: f-AnoGAN (AD score), Capsule (RMGACNet relational fraud), EBM (graph).

**Fit into "from classifiers to AD to mixtures"**:
- **Classifiers (Tier 1 baseline)**: XGB/LGBM on FE (incl. flattened KYA). Dominant known fraud.
- **AD / Generative (enhanced Tier 3)**: Pure AE/VAE (recon prob), DAGMM (energy), GAN Ano (mismatch score), Diffusion (score/likelihood). Novel fraud, no labels, density modeling + synth data gen.
- **Mixtures/Hybrids (new sub-layer pre Tier 6/8)**: Latent feats/scores + XGB (pipeline); VAE-GAN end-to-end; MoE orchestration (dynamic experts); gen aug (CTGAN/diff) + ensemble (Bekkaye). Best real-world: adaptive to fraud types, imbalance, relational. Bridge to graph (cond or native) + LLM (explanations + logs).
- **Overall Progression**: Start XGB + IF; add gen AD (novel) + synth; advance to mixtures/MoE for production (layered gates). Aligns roadmap objective (basics -> SOTA). Hybrids close the gap between classical strength and deep/relational needs.

## Artifacts Created (All Saved)
- progress_log.md: Full chrono research log + extracts + reflections.
- papers_and_sources.md: Verifiable primaries (Chen, An&Cho, Zong, Ding, Vallarino, Bekkaye, Pushkarenko, Roy, Shi, etc.) + findings.
- model_family_taxonomy.md: Exhaustive families/subtypes + cross-cuts.
- model_notes.md: Per-type origin/mech/pros/cons/assump/lim/fraud (tables).
- roadmap_contribution.md: Tier placements, recs, experiments, gaps.
- limitations_and_fraud_fit.md: Detailed cross/per-family + when mixtures win.
- hybrid_mixture_ideas.md: Sketches (pipeline, VAE-GAN, MoE, aug, cascade) + pseudocode.
- findings_summary.md (this): Concise overview + top models.

**Next for Project**: Coordinator aggregate; update docs/roadmap/roadmap.md + priority_models.md; Fase 2 Model Cards (4-6 above w/ runnable Python, viz); enhanced synth data gen (incl. diffusion/CTGAN options + KYA links); expts comparing tiers + hybrids on imbalanced txn data.

**Rigor Note**: Exhaustive but bounded to verifiable (50+ searches, PDF browses of An&Cho/DAGMM/Vallarino/Chen extracts, specific fraud papers). No hallucinations. Gaps (e.g. limited public 2025+ direct diffusion AD benchmarks) noted honestly. Ready for integration.
