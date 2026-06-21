# Limitations and Fraud Fit: Deep Generative, Representation & Hybrid Models for Fraud/Anomaly Detection

**Purpose**: Cross-cutting + per-family analysis of limitations, assumptions, training challenges, evaluation pitfalls. Detailed fraud-specific fit: structured transaction data (tabular mixed-type, high volume, velocity/agg), extreme imbalance (0.01-0.2%), relational (KYA/KYE entity links, collusion), behavioral sequences, novel vs known fraud, extensibility to logs/unstructured. When pure gen/AD vs mixtures outperform pure classifiers. All grounded in papers (Chen 2025, An&Cho, Zong DAGMM, Ding/Vallarino/Bekkaye 2023-25, diffusion fraud papers, etc.).

**Key Fraud Context (from Chen + industry)**: CC dominant in research (Kaggle proxy ubiquitous); insurance/banking claims heavy; losses trillions-scale; imbalance pervasive (48/57 Chen papers); drift/adversarial constant; FP costly (customer friction); FN = direct loss + reg. Feature eng (velocity, periodic, aggregates) often > model (Bahnsen). Layered systems standard.

## Cross-Cutting Limitations & Challenges
- **Training Instability & Compute**:
  - GANs: Mode collapse, non-convergence, sensitive to arch/lr (WGAN/GP mitigates but not eliminates). High variance runs.
  - Diffusion: Iterative (hundreds steps); slow training/sampling (real-time fraud <100ms hard; use for aug/offline or accelerated samplers).
  - Deep AE/VAE/MoE: GPU heavy vs trees; large models overfit small fraud sets or "normal" contamination.
  - Hybrids/MoE: More params, gating tuning, joint opt instability.
  - General: Need clean "normal" train data (unreported fraud contaminates); label delay/noise.

- **Data Fit for Structured Tabular Tx**:
  - Mixed numeric/categorical: Poor w/o encoding (one-hot explodes dim; embeds or CTGAN mode handling needed). High-dim curse (recon/density degrade).
  - Non-stationary: Tx distribs drift (season, economy, fraud evolution); fixed models fail.
  - Rare legit behaviors mimic fraud (high-value users, holidays) -> high FP.
  - Evidence: Chen notes preprocessing/FE critical; many papers use PCA Kaggle (limits relational).

- **Imbalance Handling**:
  - Pure AD (recon/energy) naturally tolerant (no labels) but can flag rare normal.
  - Synth gen (cGAN/CTGAN, VAE, diffusion) addresses by oversampling minority: often lifts recall/F1 (Pushkarenko, Ding, Bekkaye). But synth quality key — unrealistic samples hurt or introduce bias.
  - Hybrids best: Gen for diversity + cost-sensitive sup (scale_pos_weight, focal).
  - Pitfall: Over-reliance on synth without fidelity checks (KS stats, downstream only).

- **Evaluation Pitfalls**:
  - Acc/F1 misleading (dominated by majority). Prefer PR-AUC (imbalance focus), Recall@K (investigate top risk), cost-sensitive (Bahnsen: FN=loss amt, FP=admin/review).
  - Thresholds: Recon prob/energy/anomaly score need validation (contamination param or PR curve); hard in prod w/ evolving base rate.
  - No temporal splits -> leakage (future info).
  - Synth eval weak if only report classif on aug data (ignore if aug "cheats").
  - Chen: Economic metrics (FP/FN costs) underused.

- **Drift & Adaptability**:
  - All static models brittle. Fraud evolves (adversarial). Requires monitoring (score distrib shift), retrain, or continual (online VAE, replay synth).
  - Hybrids can incorporate adaptation (MoE re-gating).

- **Interpretability & Compliance**:
  - Deep gen black-box (recon score hard to explain vs tree SHAP). Mit: Latent inspection, feature contrib to recon, attention in seq variants, XAI on hybrid head.
  - GDPR/CCPA "right to explanation"; anonymization needs (Chen).
  - KYC/AML alignment possible (Vallarino) but must be auditable.

- **Relational (KYA/KYE) & Unstructured (Logs)**:
  - Flattening loses multi-hop/collusion (rings, shared devices). Pure tabular gen weak here -> graph extensions (graph VAE, GAD-EBM, caps w/ graph att) or cond on aggregates.
  - Logs: Seq models (LSTM-VAE, RNN experts) or cond (cGAN on log embeds) help; full unstructured needs hybrid w/ NLP/LLM (Tier 8).
  - Cold-start new entities: Hard (gen models assume historical normal).

- **Scalability/Real-time**:
  - High volume tx (millions/day): Inference cost critical. Gate w/ fast rules/IF (Tier 0/2) -> expensive gen/hybrid only on candidates.
  - Latency: Diffusion/GAN search bad; MoE multiple forwards.

## Per-Family Limitations & Fraud Fit
**Autoencoders (incl. VAE, DAGMM)**:
- Assumptions: Normal manifold low-dim/reconstructible; (for VAE) latent prior Gaussian + data ~ p(x|z). DAGMM: z + recon Gaussian mixture.
- Limitations: Pure recon misses density (DAGMM fixes); VAE collapse; sensitive to bottleneck size/FE; no native relational.
- Fraud fit: **Excellent for novel/unseen fraud** (train normal only; high error/prob flags deviation in tx patterns or behavior). Good on high-dim engineered features (velocity + KYA aggs). VAE recon prob (An&Cho) more robust than error. DAGMM joint recon+density strong for multimodal txn (KDDCUP proxy). 
- Imbalance/known: Weaker alone (use for aug or latents to XGB). Synth (VAE/cVAE) helps oversample.
- KYA/logs: Cond cVAE or LSTM-VAE for user/entity seqs + logs. Flattened relational works.
- When wins vs pure classif: Zero/low labels or novel patterns. Mixtures (latents + XGB) often best.
- Evidence: Chen (VAE rep learning praised); An&Cho CC cite; Bisen 2024 AE CC; Zong benchmarks.

**GAN Family**:
- Assumptions: Adversarial equilibrium; normal coherent for G to model.
- Limitations: Instability/mode collapse (miss diverse fraud or legit modes); slow in AnoGAN (f- helps); synth may lack adversarial robustness or capture subtle known fraud.
- Fraud fit: **Outstanding for oversampling** (CTGAN realistic minority fraud txns -> big classif lifts on CC/insurance per Strelcenia survey, Patil, Fiore 2019, Almarshad). Ano/f-AnoGAN for AD (recon+disc mismatch; CC fraud domain cited; tabular adaptations 2024). Good for novel (unsup GAN) + known (via aug).
- Imbalance: Primary practical strength.
- Relational/logs: Cond cGAN on KYA profiles or log context; seq GANs.
- Limitations in fit: Training on contaminated "normal" leaks fraud; tabular harder than images (use CTGAN).
- Vs mixtures: Pure GAN synth + sup > pure GAN AD for known; hybrids (VAE-GAN Ding 2023) combine.
- Evidence: Chen (GAN synth emerging); Ding 2023 VAE-GAN CC gains; Schlegl fraud cites.

**Diffusion / Score-Based**:
- Assumptions: Data diffusion-reversible; score estimable.
- Limitations: Slow multi-step sampling (mit for aug); newer for fraud (less mature tabular/AD code); compute.
- Fraud fit: **Strong emerging for realistic synth aug** (Pushkarenko 2024 DDPM txn synth improves classif perf/robustness on imbalanced; Roy FraudDiffuse 2024 non-fraud prior fraud patterns; Bekkaye 2025 DM top in insurance hybrid vs VAE/GAN). Direct AD (score or DDMT TS) for seq anomalies.
- Imbalance: Excellent diversity/coverage often > GAN/SMOTE.
- KYA/logs: Cond on profiles/seqs.
- Novel: Possible via low likelihood/score; primarily aug for known-pattern boost.
- Vs others: Promising 2024-25; complements VAE/GAN in hybrids.
- Evidence: Pushkarenko, Roy, DDMT, Bekkaye, Chen mentions generative.

**Hybrids & Mixtures**:
- Assumptions: Components complementary (e.g. AE for outliers, RNN seq, gate learns routing).
- Limitations: Complexity (tuning, compute, debugging); risk of one weak expert dominating; data hunger for joint.
- Fraud fit: **Often superior overall** (Vallarino 2025 MoE: 98.7% acc/94.3% prec/91.5% rec CC synth, AE catches novel/emerging; Bekkaye 2025 DM+XGB+SMOTE best insurance acc/calib/robust). Combines novel detection (gen/AD experts) + known accuracy (sup experts) + imbalance (aug or tolerant AD). Adaptive to fraud type/context.
- Imbalance/relational: Synth (gen part) + routing or features for KYA. Seq experts for behavior/logs.
- When outperforms pure: Mixed fraud (novel+known), relational signals, label scarcity. Pure XGB still competitive baseline for well-labeled tabular known fraud (per Chen/surveys).
- Cascades practical (cheap gate -> hybrid).
- Evidence: Vallarino MoE CC; Bekkaye generative insurance; Ding VAE-GAN; Chen multiple hybrids (AE-LSTM etc.).

**Other (Capsule, EBM)**:
- Capsule: Promising for hierarchical/relational fraud (Shi 2025 RMGACNet financial fraud; graph att + caps). Limitations: Maturity, compute for tabular.
- EBM: Likelihood via energy (GAD-EBM graph fraud apps). Good OOD/relational. Limitations: Training (score matching hard on graphs).
- Fit: Complement for KYE collusion graphs; novel fraud.

## When Mixtures Outperform Pure Classifiers or Pure AD
- **Pure Classifiers (XGB etc.)**: Best for *known* fraud w/ abundant quality labels + strong FE (velocity + KYA). Fast, interpretable, SOTA on many tabular. Weak on novel/zero-day, if labels biased/delayed.
- **Pure Generative AD (AE/VAE/DAGMM/AnoGAN/diff score)**: Best for *novel/unseen* fraud, no/low labels, density/recon deviations in high-dim. Weak calibrated precision on known subtle patterns; FP on rare legit.
- **Mixtures win when**:
  - Imbalance extreme + both fraud types present (aug/gen + sup).
  - Relational/behavioral complexity (cond or multi-expert).
  - Need robustness (MoE routing adapts).
  - Evidence: Hybrids in Chen (outperform standalones); Vallarino (MoE > experts alone); Bekkaye (DM+classif >); Ding (VAE-GAN recall); classical subagent IF+XGB lift extended.
- Pipeline (gen pre/aug -> classif) often sufficient/practical vs full end-to-end.

## Recommendations to Mitigate
- Always gate (rules/IF + gen/hybrid only subset).
- Synth fidelity + downstream ablations mandatory.
- Cost-sensitive everywhere + proper metrics.
- Monitor + retrain; use continual or online variants.
- For relational: Start flattened/cond; advance to graph-native (cross GNN subagent).
- XAI: SHAP on hybrid heads; recon contrib analysis; attention viz.
- Start simple: VAE latents + XGB or CTGAN aug before full MoE/diffusion.

**Honest Uncertainties**: Public benchmarks proxies (Kaggle PCA hides real entity richness); few head-to-head 2025+ gen vs classical on identical real banking data; adversarial robustness of synth understudied. Claims traceable to cited sources.

This analysis ensures realistic positioning: generative/hybrid powerful but not panacea; best in layered "classifiers + AD + mixtures" systems.
