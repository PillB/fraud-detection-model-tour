# Exhaustive Taxonomy of Deep Learning Model Families for Fraud & Anomaly Detection (Generative, Representation, Hybrid/Mixture Focus)

**Scope**: Comprehensive hierarchical taxonomy derived from research (Chen 2025 SLR, primary papers 2015-2025, 2024-2026 SOTA). Focus generative (synth + AD via density/recon/likelihood), representation learning (latent features for downstream), hybrids/mixtures (combos w/ classif or multi-expert). Covers tabular/structured transactions + seq behavior + relational (KYA/KYE flattened or cond) + extensibility to logs.

**Sources**: All from papers_and_sources.md (Chen extracts on GAN/VAE/hybrids; An&Cho; Zong DAGMM; Schlegl Ano/f-Ano; Ding VAE-GAN; Vallarino MoE; Bekkaye generative insurance; Pushkarenko/Roy diffusion; Shi Caps; Roy EBM; etc.). No invention.

**Structure**: Major Families > Subtypes/Variants > Notes (core use in fraud, key refs). Cross-ref model_notes.md for depth.

## 1. Autoencoders (AE) Family
Reconstruction-based representation + AD. Train on (mostly) normal data; high recon error/prob -> anomaly. Strong for novel fraud; latents as features for classifiers/hybrids. Suited to high-dim tabular after encoding.

- **Standard / Deep / Stacked AE**
  - Encoder-decoder (often MLP or conv) minimizes recon error (L2/MSE). Deep for hierarchical features.
  - Fraud: Baseline recon AD or pretrain features + XGBoost. (Bisen 2024 CC insights; Chen AE-LSTM hybrid).
  - Variants for regularization: 
    - **Denoising AE (DAE)**: Corrupt input (noise), recon clean. Robust to noise in tx data.
    - **Sparse AE**: Sparsity penalty (KL on activations or L1) -> meaningful sparse codes.
    - **Contractive AE (CAE)**: Penalty on Jacobian (local invariance). (Background in An&Cho 2015).
  - Key refs: An&Cho background; general AD lit.

- **Variational Autoencoders (VAE) Subfamily** (probabilistic; recon *probability* paradigm)
  - Core: ELBO optimization (KL regularize latent to prior + recon log-likelihood). Latent ~ Gaussian (or structured). Generative sampling.
  - **Standard VAE for AD**: An & Cho (2015) - reconstruction *probability* (integrates variability) as principled anomaly score > error. Train normal only.
  - **Conditional VAE (cVAE)**: Condition on labels/context (e.g. user segment, time, KYC flags) for controlled generation or conditioned recon.
  - **beta-VAE**: Beta-weighted KL for disentangled latents -> better interpretability/separation of fraud factors.
  - **LSTM-VAE / Sequence VAE**: LSTM/GRU encoder-decoder for behavioral sequences/time-series txns (velocity patterns, evolving user behavior). (Niu 2020 context; KPI/time-series AD papers adaptable to fraud seqs).
  - **CNN-VAE**: For "image-like" or grid/tabular reshaped (less common for raw tx; useful w/ engineered 2D feats).
  - **Attention-augmented / Bal-VAE-Attention variants**: Attention in encoder/decoder or latent for long-range deps or focus on suspicious features (emerging in seq AD).
  - Fraud fit: Novel fraud (unsup); synth data for aug; latents excellent for downstream XGB (Chen notes VAE rep learning strengths). Imbalance handled via generation.
  - Key: An&Cho 2015; extensions in Ding 2023 hybrid; Chen survey.

- **Deep Autoencoding Gaussian Mixture Model (DAGMM)**
  - AE compression (latent + explicit recon error feats: rel. Euclidean, cosine) + GMM via estimation net (membership prediction for params). End-to-end; energy score.
  - Fraud: High-dim structured AD w/ complex density (cyber/fraud proxies strong). Jointly optimizes recon + density.
  - Key: Zong et al. ICLR 2018. Ablations show value of recon feats + joint training.

## 2. Generative Adversarial Networks (GAN) Family
Adversarial training (G vs D). For AD: train on normal; anomaly via recon + disc mismatch or latent search. Excellent for high-quality synthetic minority (fraud oversampling).

- **Vanilla / DCGAN / WGAN (improved)**
  - Standard minimax; DCGAN conv; WGAN (Wasserstein + gradient penalty) for stability.
  - Fraud: Synth data base; WGAN backbone in f-Ano.

- **AnoGAN / f-AnoGAN**
  - AnoGAN: GAN on normal; test-time latent z optimization (recon loss + disc features) -> anomaly score + localization.
  - f-AnoGAN: Fast learned encoder (no iterative opt at inference).
  - Fraud: Image-orig but CC fraud cited; tabular adaptations (2024).
  - Key: Schlegl 2017/2019; Reddy & Singh 2024 tabular.

- **Conditional GAN (cGAN, CTGAN)**
  - Condition on class/context (fraud/normal or metadata). CTGAN: tabular-specific (mode-specific norm, etc.).
  - Fraud: Primary for oversampling rare fraud -> train classifiers on balanced synth. Huge lift on imbalanced CC (many papers).
  - Key: Xu et al. CTGAN 2019; Patil 2021; Strelcenia 2023 survey; Fiore 2019; Almarshad/Alshawi 2023 (Chen).

- **Other GAN variants (GA-GAN, R-GAN, etc.)**: Recurrent/seq GANs for time-series fraud; graph-aware.

## 3. Diffusion Models / Score-Based Generative Models
Iterative denoising (forward noise, reverse learn score/denoise). High-quality diverse samples; likelihood/score for AD possible.

- **DDPM / Denoising Diffusion Probabilistic Models & Variants**
  - Ho et al. (build Sohl-Dickstein). Markov chain denoising.
  - **Tabular adaptations**: Mode handling, etc. (FinDiff for financial).
  - Fraud: Primarily oversampling (generate realistic fraud txns from non-fraud prior or conditioned). Improves downstream classifiers on imbalance.
  - **Time-series / seq variants**: DDMT (Diffusion + Transformer + dynamic mask) for MV TS AD.

- **Score-based Generative Models**: Continuous score matching for density est / sampling.

- Fraud-specific:
  - Pushkarenko 2024 (ISIJ): DDPM synth for fraud detection oversampling; classifier gains.
  - Roy et al. 2024 (FraudDiffuse, ICAIF): Diffusion fraud aug w/ non-fraud prior.
  - Emerging direct AD (score as anomaly).

- Strengths vs GAN: Often more stable training, better mode coverage/diversity for synth.

## 4. Hybrids & Mixtures
Combinations for best-of: gen AD (novel) + sup (known) + adaptive routing. Often outperform pure.

- **VAE-GAN Hybrids (incl. improved / LSTM-VAE-GAN)**
  - Combine VAE (stable latent/prob) + GAN (sharp samples) or joint training.
  - Fraud: Ding 2023 improved VAE-GAN for CC (synth + recon); Niu 2020 LSTM-VAE-GAN for TS AD (seq fraud behavior).
  - End-to-end or staged.

- **AE + Classifier / Ensemble (e.g. AE/XGB, AE + IF + XGB)**
  - AE latents/recon scores as features to XGBoost/RF/LightGBM; or cascade (AE prefilter high-recon -> sup).
  - Fraud: Very common pattern (Chen AE-LSTM; classical subagent hybrids extended w/ deep). Bekkaye 2025 insurance variants (VAE/GAN/DM + XGB/IF).

- **Mixture of Experts (MoE) + DL Components**
  - Gating network routes to specialized experts (RNN for seq, Trans for interactions, AE for recon AD).
  - Fraud: Vallarino 2025 arXiv (MoE + RNN + Trans + AE for CC fraud; dynamic, high perf on novel+known; KYC/AML align).
  - Broader: MoE + SMOTE/DNN oversample variants (Yang 2024 etc.).

- **GAN / Diffusion + Supervised**
  - Synth aug (cGAN/CTGAN or diffusion) + classif head or full pipeline (Bekkaye, Pushkarenko).
  - End-to-end GAN-sup or multi-task.

- **Generative + Graph/Relational Hybrids**: (Note cross-ref graph subagent) Graph VAE, conditional on KYE links; EBM-GNN.

- **Multi-stage Cascades**: Unsup gen gate -> graph/seq -> sup/LLM.

## 5. Other Representation Learning (Non- or Semi-Generative but Complementary)
- **Capsule Networks (CapsNet)**
  - Capsules for part-whole hierarchies + equivariance (viewpoint/pose invariant features).
  - Fraud: Shi 2025 RMGACNet (graph attention + memory + caps for financial fraud); BankGuard-CapsNet (cloud banking fraud cat).
  - Fit: Complex relational patterns (collusion) + structured features.

- **Energy-Based Models (EBM)**
  - Learn energy function E(x); low energy = high likelihood (normal).
  - Variants: GAD-EBM (graph AD, financial fraud apps, subgraph score matching); Elsa (semi-sup contrastive + energy); DSEBM (deep structured EBM, DAGMM baseline).
  - Fraud: Graph/relational anomaly (rings, unusual connectivity); OOD/novel fraud.

- **Others**:
  - Deep SVDD (one-class deep hypersphere; recon-adjacent).
  - Contrastive / SSL reps (pretrain then AD/classif; Tier 7 roadmap).
  - Transformer-only or BERT for logs/text fraud (Chen NLP).

## Cross-Cutting Dimensions & Extensibility
- **Data Modalities**: Tabular tx (all families after encoding/scaling); Sequences/behavior (LSTM-VAE, seq GAN/diff, RNN experts); Relational/KYA/KYE (cond inputs, flattened aggregates, native graph extensions like graph VAE/EBM/caps); Unstructured logs (seq models, cond on embeds, hybrid w/ RAG).
- **Training Paradigm**: Pure unsup AD (recon/energy/score on normal); Semi (few labels); Augmentative (gen synth fraud -> sup); End-to-end hybrid; MoE routing.
- **Detection Mechanism**: Recon error/prob (AE/VAE); Density/energy/GMM (DAGMM/EBM); Adversarial mismatch (GAN); Diffusion score/likelihood; Classification on latents/synth.
- **Imbalance Handling**: Synth gen (cGAN, diffusion, VAE) primary strength; focal/cost in hybrids; recon naturally tolerant.
- **Novel vs Known Fraud**: Pure gen/unsup (AE/VAE/DAGMM/AnoGAN/diff AD) for novel/zero-day; sup/hybrids/aug for known patterns; mixtures cover both.
- **SOTA 2024-2026 Snapshot** (from searches/Chen updates): Ding 2023 VAE-GAN CC; Vallarino 2025 MoE CC; Bekkaye 2025 DM+XGBoost insurance; FraudDiffuse 2024 aug; RMGACNet 2025 caps; diffusion/VAE-GAN hybrids in insurance/banking; continued AE/GAN baselines + hybrids in surveys.

**Taxonomy Notes**: Exhaustive but prioritized verifiable fraud/txn-relevant (image-orig noted w/ adaptations). Not exhaustive of *all* DL (e.g. pure CNN less for tabular). Overlaps natural (hybrids span). Evolution: Classical recon (AE) -> probabilistic (VAE) -> adversarial (GAN) -> score/diffusion -> orchestrated mixtures (MoE).

**References**: See papers_and_sources.md for full DOIs/URLs. Chen 2025 provides broad map; primaries for mechanisms.

This taxonomy slots into roadmap as expanded Tier 3 (pure gen/rep AD) + new hybrid sub-layers (pre Tier 6 ensembles).
