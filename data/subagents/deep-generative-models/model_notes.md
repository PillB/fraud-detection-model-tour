# Model Notes: Deep Generative, Representation Learning & Hybrid/Mixture DL for Fraud/Anomaly Detection

**Scope**: Rigorous per-family/subtype notes. For each: Origin, How it Works (mechanism + key math/alg sketch from papers), Pros, Cons, Assumptions, Limitations (general + structured tx/imbalance/relational/drift), Fraud-Specific Considerations (novel vs known, tx+logs+KYA fit, eval). Tables for pros/cons. Mixtures/hybrids section detailed. Sources cross-ref papers_and_sources.md. Grounded in searches/PDF extracts (Chen, An&Cho, Zong, Schlegl, Vallarino, etc.). Tabular/structured tx primary (rows=txns; feats=amount/time/merchant + velocity + flattened/cond KYA/KYE).

**Key Distinctions**: Pure generative/unsup AD (recon prob/energy/score -> flag novel); Representation (latents for downstream); Hybrids (combine + classif or multi-expert). Reconstruction probability (VAE) or energy vs direct classification.

## 1. Autoencoders Family

### 1.1 Standard / Deep AE (+ Denoising, Sparse, Contractive Variants)
**Origin**: Early DL AD (e.g. extensions of PCA); variants: Vincent et al. denoising (2010); Rifai contractive; sparsity common in rep learning. Fraud apps widespread (Bisen 2024 CC; Chen hybrids).

**How it Works**:
- Encoder f_φ(x) -> latent h; Decoder g_θ(h) -> recon x'. Minimize ||x - x'|| (L2/MSE) or variant.
- Anomaly: High recon error.
- Denoising: Train on x_noisy -> x_clean.
- Sparse: + KL(sparsity) or L1 on h.
- Contractive: + ||J_f(x)||_F^2 (Jacobian penalty for local constancy).
- Deep: Stacked layers for hierarchical.

**Pros** (table):
| Aspect | Pros |
|--------|------|
| Simplicity/Scalability | Fast train/infer once fit; works on tabular after encoding. |
| Rep Learning | Latents capture "normal" manifold; reusable features. |
| No labels (unsup) | Good for novel fraud. |
| Variants robustness | Denoising handles noise; sparse meaningful codes. |

**Cons**:
| Aspect | Cons |
|--------|------|
| Thresholding | Recon error needs calib (contamination-like); sensitive to outliers in "normal" train. |
| High-dim structured | Loses info if bottleneck too aggressive; poor on categorical w/o proper enc. |
| Imbalance | Can treat rare legitimate as anomalous. |
| No density | Pure recon ignores global structure. |

**Assumptions**: Normal data lies on low-dim manifold well-reconstructible by NN; anomalies incompressible/deviate.

**Limitations**: Ignores probabilistic variability (addressed by VAE); curse dim if not regularized; drift requires retrain. For tx: velocity/agg feats critical (cross classical FE).

**Fraud-Specific**:
- CC benchmarks (Kaggle): Competitive baseline; often +XGB lift.
- Novel fraud: Strong (no labels). Known: Weaker alone.
- KYA/KYE: Feed aggregates (linked count, prior flags) as dims or cond.
- Logs: Seq extensions better.
- Eval: PR-AUC; recon distrib analysis (hist for thresh).
- Hybrids: Latents/scores -> XGBoost (common, per Chen).

**Open Impl**: PyTorch AE; PyOD DeepAE wrappers.

### 1.2 Variational Autoencoder (VAE) Family (incl. variants)
**Origin**: Kingma & Welling 2013/14 VAE; An & Cho 2015 for AD using recon prob. Extensions widespread.

**How it Works** (from An&Cho PDF):
- Probabilistic: q_φ(z|x) approx posterior (encoder NN outputs mu/logvar); p_θ(x|z) decoder.
- Train: Maximize ELBO = E[log p(x|z)] - KL(q(z|x) || p(z)) ; p(z)=N(0,I) typical.
- AD (An&Cho): Reconstruction *probability* p(x) approx via Monte Carlo or analytic under decoder (accounts var); lower prob = anomaly. More principled than ||x-x'||.
- Variants:
  - beta-VAE: beta*KL for disentanglement.
  - cVAE: Cond on c (e.g. user_id embed, time, KYC).
  - LSTM-VAE: RNN for p/q on seq x_{1:T}.
  - Attention variants: Self-attn for deps.

**Pros**:
- Probabilistic scores + generative (sample "what if" normal).
- Structured latent (good features).
- Handles uncertainty better.
- Synth data generation.

**Cons**:
- Posterior collapse (uninformative z; beta mitigates).
- Lower sample quality vs GAN.
- Still needs thresh on prob/score.
- Compute (sampling).

**Assumptions**: Latent prior Gaussian (or chosen); data generated from latent + noise; normal dist well-modeled.

**Limitations**: Assumes "normal" train clean (contamination hurts); for tabular: need good cat encoding (one-hot or embed); seq needs aligned lengths/windows.

**Fraud-Specific**:
- Novel fraud detection via low recon prob (An&Cho cites CC fraud). 
- Imbalance: Generate synth normal or cond fraud for aug.
- Relational: cVAE conditions on KYA/KYE feats (account age, entity links).
- Logs/unstruct: Cond or LSTM-VAE on event seqs.
- Hybrids: Latents + XGB (Chen: VAE "better for representation learning").
- SOTA ex: Ding 2023 improved VAE-GAN CC (recall boost).

**Key Ref**: An&Cho 2015 (theory + prob superiority).

### 1.3 DAGMM
**Origin**: Zong et al. ICLR 2018.

**How it Works** (PDF extracts):
- Compression net: AE -> z_c (latent); recon x'; z_r = feats (||x-x'||_rel, cos sim); z = [z_c, z_r].
- Estimation net: MLP(z) -> softmax mixture membership \hat{\gamma}.
- GMM params from batch weighted: \hat{\phi}_k, \mu_k, \Sigma_k.
- Energy E(z) = -log \sum_k \phi_k N(z; \mu_k, \Sigma_k) (anomaly score).
- Obj (end-to-end): (1/N) sum recon L2 + E(zi) + \lambda reg(1/\Sigma diag).
- No pretrain needed; joint helps escape bad optima.

**Pros**:
- Joint dim-red + density est.
- Explicit recon feats + latent.
- GMM handles multimodal normal.
- Strong empirical (14% F1 lift).

**Cons**:
- GMM assumes elliptical components; singularity risk (reg helps).
- Batch stats for params.
- Hyperparams (K mixtures, \lambda).

**Assumptions**: Low-dim z captures essential + recon signal; data mixture of Gaussians in that space.

**Limitations**: High-dim input still requires good AE arch; tabular cats need handling; energy calib.

**Fraud-Specific**:
- Excellent for complex txn distributions (KDDCUP cyber proxy w/ 0.2% anomaly).
- Novel AD + density.
- Hybrids: Energy as feature to sup models.
- Relational: Include graph-derived feats in z_r or input.

**Key Ref**: Zong 2018 (full mech + ablations).

## 2. GAN Family

**Origin**: Goodfellow 2014 GAN; Schlegl AnoGAN 2017; f- 2019; CTGAN Xu 2019 for tabular.

**How it Works** (general + specifics):
- G(z) -> fake; D(x) real/fake. Adversarial (minimax or W).
- Ano/f-AnoGAN: G/D trained normal only. Test: find z* = argmin recon(G(z),x) + disc_feat_loss; score = that loss. f- uses encoder E(x) ~ z fast.
- Conditional/CTGAN: G(z, c) or tabular-specific (handling discrete/continuous modes).

**Pros** (for AD + aug):
| Aspect | Pros |
|--------|------|
| Sample quality | Realistic synth fraud (esp CTGAN tabular). |
| AnoGAN score | Combines recon + "realness" (disc). |
| Fast variants | f-AnoGAN inference speed. |
| Oversampling | Addresses imbalance w/o simple interp. |

**Cons**:
- Training instability (collapse, oscillation; WGAN helps).
- Mode collapse (misses fraud diversity).
- Latent search slow in orig AnoGAN.
- Hyper sensitive.

**Assumptions**: "Normal" has coherent manifold learnable by G/D; equilibrium exists.

**Limitations**: Hard to train on small/tabular mixed; synth may not be adversarial-robust; compute heavy.

**Fraud-Specific**:
- Oversampling (CTGAN + RF/XGB) common + strong lift on CC (Strelcenia survey; Patil; Fiore 2019).
- AD: AnoGAN for novel (CC cited); tabular 2024 adaptation.
- Hybrids: GAN synth + classif (or VAE-GAN).
- KYA: Cond cGAN on entity profiles.
- SOTA: Ding 2023 VAE-GAN hybrid CC.

**Refs**: Schlegl 2019; Reddy 2024 tabular; Ding 2023.

## 3. Diffusion Family

**Origin**: Sohl-Dickstein 2015; Ho DDPM 2020; tabular/fraud 2024+ (Pushkarenko, Roy).

**How it Works**:
- Forward: x_t = sqrt(1-beta) x_{t-1} + ... noise schedule.
- Reverse: Learn denoiser/score to predict noise or x0.
- Sampling: Iterative from noise -> data.
- AD: Score magnitude or likelihood proxy; or primarily aug.
- Tabular: Special handling (e.g. discrete).

**Pros**:
- High quality/diverse synth (better coverage than GAN often).
- More stable training (no adversarial).
- Good for complex distribs (txns).

**Cons**:
- Slow sampling (many steps; accelerated variants exist).
- Compute heavy forward/reverse.
- Tabular adaptations non-trivial.

**Assumptions**: Data from diffusion process; score well-estimable.

**Limitations**: Inference latency for real-time fraud; quality depends on prior (non-fraud prior common for fraud aug).

**Fraud-Specific**:
- Oversampling primary (Pushkarenko 2024: DDPM synth improves classif on imbalanced fraud txn benchmarks; H1/H2 supported).
- FraudDiffuse 2024: Non-fraud prior -> synth fraud patterns.
- Direct AD: Emerging (DDMT TS).
- Fit: Realistic minority samples for known-pattern classifiers; aug + tree/ensemble.
- Insurance/banking: Bekkaye 2025 compares DM favorably vs VAE/GAN in hybrids.
- KYA/logs: Condition diffusion on profiles/seq embeds.

**Refs**: Pushkarenko 2024; Roy FraudDiffuse 2024; DDMT.

## 4. Hybrids & Mixtures (Detailed)

**Core Idea**: Leverage gen strengths (novel AD, synth, reps) + sup (known patterns, calibrated) or routing.

### 4.1 VAE-GAN / LSTM-VAE-GAN
- Joint or combined: VAE for latent/prob + GAN adversarial for sharp recon/gen.
- Mech: Shared or dual encoder/decoder/G; losses combine ELBO + adv.
- Fraud: Ding 2023 CC (improved VAE-GAN: synth + AE recon -> superior recall). Niu 2020 LSTM version for seq AD.
- Pros: Stable + high qual; end-to-end.
- Cons: Complex training.
- Fit: Mixed known/novel + imbalance.

### 4.2 AE/Gen + Classifier (e.g. + XGBoost)
- Pipeline: Train AE/VAE/DAGMM on normal or all -> extract latent/recon/energy/score -> concat to engineered feats -> XGB (scale_pos_weight or focal).
- Or cascade: High anomaly score gate -> detailed sup.
- Fraud: Ubiquitous pattern (Chen AE-LSTM; Bekkaye algos w/ VAE/GAN/DM + XGB/IF). Classical subagent hybrids extended.
- Pros: Combines unsup novel + sup accuracy; interpretable (XGB + SHAP on latents).
- When wins: Scarce/delayed labels or novel+known mix. Latents often add lift over raw FE.

### 4.3 MoE (Mixture of Experts) Hybrids
- Vallarino 2025: Gating net + experts (RNN seq behavior; Transformer high-order interactions; AE recon anomaly). Dynamic soft/hard assignment.
- Mech: Gate(x) weights experts; final = sum w_i * expert_i(x). Train jointly or staged.
- Fraud: 98.7% acc/94.3p/91.5r on synth CC (outperforms standalones). AE expert catches atypical/novel. Aligns AML/KYC.
- Pros: Adaptive to fraud type (seq vs structural vs outlier); modular.
- Cons: Complexity, compute (multiple experts).
- Ext: Add graph expert for KYE.

### 4.4 Generative Aug + Ensemble (Bekkaye 2025 insurance ex)
- VAE/GAN/DM generate synth fraud claims; + SMOTE/ADASYN/IF; train XGB/RF/LGBM.
- DM+XGB+SMOTE best in study (acc/calib/robust).
- Fit: Insurance/banking claims (structured + relational?); imbalance heavy.

### 4.5 End-to-End vs Pipeline
- Pipeline: Practical, modular (gen pretrain/aug separate).
- End-to-end: Joint opt (VAE-GAN, MoE) can be superior but harder.

**General Hybrid Notes**: Mixtures outperform pure classifiers (better novel recall) or pure AD (better precision on known) per papers. Eval: Always ablate (pure sup vs +gen feats vs full hybrid).

## 5. Other Representation (Capsule, EBM)
- **Capsule Nets**: Shi 2025 RMGACNet for financial fraud (BiLSTM + graph att + caps). Pros: Hierarchical/relational modeling (collusion). Cons: Less mature for pure tabular.
- **EBM**: GAD-EBM (graph likelihood via energy; financial fraud apps); Elsa semi-sup. Score = energy. Good for graph/relational anomaly + OOD.
- Fit: KYA/KYE rings (graph versions); complement gen.

## Cross-Cutting: Training Challenges, Eval, Mixtures Outperformance
- **Challenges**: GAN instability (mit: WGAN, spectral norm); diffusion steps (mit: DDIM fast); VAE collapse (beta, annealing); overall: data leakage in synth, contamination in "normal" train, high GPU needs vs trees.
- **Eval**: For pure AD: PR-AUC (imbalance), Recall@K (ops), anomaly score distribs, cost (FN=loss amt, FP=review). Temporal splits. Synth quality (distrib stats, downstream lift).
- **When Mixtures Win**: Extreme imbalance + mixed fraud (novel+known); relational signals (cond/ latents capture); label scarcity (gen pretrain). Pure sup (XGB) often still strong baseline for known tabular (per Chen + classical). Pure gen for zero-label exploration.
- **KYA/KYE/Logs**: All families extensible via conditioning (cVAE/cGAN/diff cond), extra feats (flattened), seq (LSTM/Trans experts), or graph hybrids (cross graph subagent). Logs: event seqs as input or cond context.

**Open Impl Ideas**: See hybrid_mixture_ideas.md. Start w/ simple VAE (PyTorch) + XGB on Kaggle-like; add CTGAN aug; prototype DAGMM or MoE sketch.

All backed by cited papers. Update w/ new 2026+.
