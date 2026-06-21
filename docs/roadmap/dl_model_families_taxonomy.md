# Exhaustive Taxonomy of Deep Learning Model Families for Fraud & Anomaly Detection

**Purpose**: Systematic expansion beyond basic classifiers (XGBoost, etc.), classical AD (Isolation Forest), GNNs, and basic ensembles/SSL. This document catalogs DL architectures from supervised classifiers to pure anomaly detection models to complex **mixtures/hybrids** (e.g., VAE + classifier, MoE + RNN + Transformer + Autoencoder).

**Scope**: Focus on fraud use-cases (structured financial transactions, KYA/KYE relationships, user/worker behavioral sequences, logs/OSINT extensibility). Based on 2024-2026 surveys (Chen 2025, Thivaios 2026, Hafez 2025) + specific papers (MoE hybrids, VAE variants, GANs, Diffusion, LSTM-VAE-GAN, etc.).

**Methodology**: Multi-perspective (academic papers, surveys, industry patterns, implementation considerations). Will be refined with dedicated sub-agent outputs in `data/subagents/deep-generative-models/` and `data/subagents/sequence-hybrid-dl/`.

## High-Level Families (Hierarchical Taxonomy)

### 1. Supervised Deep Classifiers (Label-driven prediction)
- Multi-Layer Perceptron (MLP / Dense DNN)
- 1D-CNN / ResNet-style for tabular/sequence features
- Transformer-based classifiers (TabTransformer, Structured Data Transformer)
- Kolmogorov-Arnold Networks (KANs) — emerging alternative to MLPs
- **Fraud role**: Direct classification on engineered features (amount, velocity, time, flattened KYA).
- Mixtures: Often meta-learners in ensembles or on top of generative latents.

### 2. Unsupervised / Representation-Learning Anomaly Detection (Reconstruction or density based)
- **Autoencoder Family**:
  - Standard / Denoising / Sparse AE
  - Contractive AE
  - CNN-VAE, LSTM-VAE variants
  - Variational Autoencoder (VAE) core: encoder → latent (mean/var) → decoder; anomaly via reconstruction probability or high KL divergence.
  - Beta-VAE, Conditional VAE
  - Deep Autoencoding Gaussian Mixture Model (DAGMM)
  - Bal-VAE-Attention (imbalance-aware + attention)
- **One-class / Representation**:
  - Deep SVDD
  - Energy-based models
- **Fraud role**: Detect novel/unseen fraud via high reconstruction error or low likelihood in latent space. Excellent for extreme imbalance (no labels needed for training on normal).
- **Key paper basis**: An & Cho (VAE reconstruction prob), various 2025-2026 VAE fraud papers.

### 3. Generative Models for Anomaly Detection & Data Synthesis
- **GAN Family**:
  - Standard GAN / WGAN for oversampling rare fraud.
  - AnoGAN / f-AnoGAN (adversarial for anomaly scoring via latent search).
  - Gated Attention GAN (GA-GAN), R-GAN (spectral norm).
- **Diffusion Models** (emerging SOTA for tabular/time-series):
  - DDPM / score-based diffusion for anomaly (denoising process deviation).
  - Hybrids: VAE-SMOTE + Diffusion for augmentation + AD.
- **VAE-GAN / Hybrid Generative**:
  - LSTM-based VAE-GAN for time-series.
  - Generative hybrids combining VAE/GAN/Diffusion with ensembles.
- **Fraud role**: 
  - Synth data to combat imbalance (conditioned on fraud type or KYA context).
  - Pure AD via generation difficulty or latent anomalies.
- Mixtures: Generative front-end (synth or latent features) + downstream classifier.

### 4. Sequence / Temporal Deep Models (Behavioral sequences & time-series)
- RNN / LSTM / GRU / Bi-LSTM (capture transaction velocity and history).
- Stacked / Attention-augmented RNNs.
- Transformer encoders / self-attention for long-range dependencies in tx sequences (no recurrence).
- LSTM-Transformer hybrids.
- **Fraud role**: Model evolving user behavior over time; anomaly in prediction error or attention patterns. Complements graph temporal (TGN).
- Examples: Autoencoder-LSTM, Transformer for fraud sequences.

### 5. Attention, Transformers, and Modern Architectures
- Self-attention standalone or in Transformers for feature interactions.
- Tabular-specific Transformers.
- **Mixture of Experts (MoE)**: Gating network routes to specialized experts (RNN for seq, Transformer for interactions, AE for AD).
  - Recent example (2025): MoE + RNN + Transformer + Autoencoder hybrid for credit card fraud (high accuracy on synthetic real-world sim).
- **Fraud role**: Dynamic specialization (different "experts" for different fraud types or contexts). Scalable capacity with sparse activation.

### 6. Hybrid & Mixture Models (The practical SOTA pattern)
Combinations that mix families for strengths:
- **Generative + Classifier**: VAE/AE latent vectors fed to XGBoost/LightGBM or MLP classifier.
- **Generative + Sequence**: LSTM-VAE, VAE-GAN for seq AD.
- **MoE Hybrids**: MoE(RNN-expert, Transformer-expert, AE-expert) — as in 2025 papers achieving 98.7% acc / 91.5% recall.
- **Multi-stage Cascades**: Classical gate → DL sequence/Transformer → Generative AD (VAE) → LLM reviewer.
- **Generative + Graph**: Text-attributed or VAE embeddings in GNNs.
- **Full End-to-End**: CNN-VAE + attention + ensemble, Diffusion + XGBoost + SMOTE.
- **Foundation + Hybrid**: Transaction FMs (pretrained seq models) + fine-tune + VAE head or classifier.
- **Fraud advantages**: Covers known fraud (supervised head), novel (generative AD), sequences (RNN/Trans), relations (graph), imbalance (generative synth or cost-sens), unstructured (LLM on top).

### 7. Other / Emerging Families
- Capsule Networks (for hierarchical representations).
- Energy-Based Models.
- Kolmogorov-Arnold Networks (KAN) in fraud classifiers.
- Federated + Privacy-preserving DL variants.

## How to Expand the Main Roadmap
- Extend Tier 2/3 (Classical AD) → "Deep Representation & Generative AD" (AE/VAE family, GAN/Diffusion AD).
- New Tier or sub: "Deep Sequence & Attention Models" (LSTM, Transformer, MoE).
- Tier 6/8 expansion: "Advanced DL Hybrids & Mixtures" — emphasize MoE, VAE+classifier, generative+supervised, full layered (classical + DL generative + seq + selective LLM).
- Emphasize: From pure classifiers → pure AD (reconstruction) → **mixtures** (generative features + classification or MoE routing).

**Key Mixtures to Prioritize for Model Cards / Experiments**:
1. VAE (or AE) for AD + XGBoost on latent features.
2. LSTM-VAE or LSTM-AE for sequence anomaly.
3. MoE (RNN + Transformer + AE) hybrid.
4. GAN / Diffusion for synthetic fraud augmentation + downstream classifier.
5. Transformer sequence classifier + VAE anomaly score fusion.
6. Diffusion + ensemble for tabular anomaly.

## Sources (Initial)
- Vallarino 2025: MoE + RNN + Transformer + Autoencoders (arXiv 2504.03750 and follow-ups).
- Chen 2025 survey (VAE/GAN/Diffusion, AE-LSTM, Transformers).
- Thivaios 2026 survey (CNN/RNN, AE/Capsule, generative, Transformer).
- Specific: LSTM-VAE-GAN papers, VAE-SMOTE Diffusion, CNN-based VAE, Bal-VAE-Attention, GA-GAN, etc.
- IBM/ general DL refs for AE/VAE/GAN foundations.

**This taxonomy will be made fully exhaustive via dedicated sub-agents (see data/subagents/ deep-generative-models/ and sequence-hybrid-dl/).**

Next steps in project: Integrate sub-agent findings → update main roadmap.md → add to priority models for Fase 2 Model Cards (include VAE, MoE hybrid, etc.) with toy implementations (e.g., simple VAE in PyTorch or sklearn-compatible where possible).
