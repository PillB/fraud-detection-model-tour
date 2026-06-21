# Exhaustive Taxonomy of DL Model Families for Fraud/Anomaly Detection

**Scope**: Structured transactions + relational (KYA/KYE) + behavioral sequences + unstructured logs (as seq). 
**Basis**: Chen et al. (2025 arXiv:2502.00201 SLR 57 papers) + Thivaios et al. (2026 MDPI taxonomy survey) + direct 2023-2026 literature (TabTrans apps, MoE hybrids, KAN, Capsule, seq hybrids, generative mixtures). Hierarchical: Families > Subtypes > Variants/Examples + Fraud Notes.
**Structure Notes**: Beyond current roadmap (basic classifiers, AD, GNN, ensembles/SSL): Emphasizes pure seq DL, tabular-specialized DL, attention/hybrid seq, generative-seq crosses, specialized (Capsule/EBM). Cross-modal integration (tabular feats incl KYA aggs + seq history + graph nodes + log seq). Promising: MoE hybrids, seq+gen.

## Level 0: DL for Fraud/Anomaly (Overall)
- **Data Representations**:
  - Tabular/Structured Tx: Rows (amount, time, merchant, KYA flags/aggs, velocity).
  - Behavioral Sequences: Per-entity (user/account) ordered history (txns as tokens w/ deltas, cats).
  - Relational/Graph: KYA/KYE links (shared devices, emergency contacts, employee relations); often multi-relational.
  - Logs/Unstructured: Event sequences (timestamps + types + text); NLP embeddings + seq models.
- **Cross-Cutting Challenges Addressed by DL**: Extreme imbalance (<0.2% fraud); concept drift (adversarial); real-time (<ms-latency preferred); interpret (attn/SHAP); cold-start (new users); multi-modal fusion.
- **High-Level Families** (per Chen/Thivaios synthesis + expansions):
  1. Supervised DL Classifiers (tabular-focused)
  2. Sequence / Recurrent Models
  3. Attention & Transformers (incl tabular/seq)
  4. Generative & Representation Learning (AE/VAE/GAN + seq ties)
  5. Hybrids & Mixture-of-Experts (seq + cross)
  6. Other Specialized DL Families
  7. Cross-Modal / Integrated (seq+graph+log+tabular)

## 1. Supervised DL Classifiers (Tabular / Structured Tx + Flattened KYA)
**Core**: Direct classification (fraud label) on engineered tabular features (incl KYA aggs, velocity as "seq" proxies). Mechanism: Learned non-linear decision boundary; output prob or logit.
- **MLP / Dense / Feedforward Networks**
  - Subtypes: Standard MLP; wide/deep; with embeddings for cats.
  - Origin: Classic (backprop era); fraud refs ubiquitous.
  - Fraud ex: Amount profiling, non-linear feature interactions. KYA risk scores as inputs.
  - Chen 2025: Competitive baseline for structured.
  - Pros: Simple, fast inference, scalable. Cons: No native seq/graph; needs heavy FE.
  - Assumptions: i.i.d. samples. Limits: Ignores order/relations without FE.
- **1D-CNN / Convolutional for Tabular/Seq-Feats**
  - Subtypes: 1D conv over feature vector or short seq windows; multi-scale kernels.
  - Origin: LeCun CNN lineage; adapted tabular (treat features as 1D "signal").
  - Fraud: Local patterns (e.g., burst velocity in window, merchant clusters). Heatmaps of tx features.
  - Chen: Feature extraction + hybrid w/ trees.
  - Pros: Local invariance, param efficient. Cons: Limited long-range (use w/ pooling/RNN).
  - Real-time friendly.
- **ResNet-style / Residual for Tabular**
  - Subtypes: Residual blocks on dense or 1D conv layers; ResNeXt variants.
  - Fraud ex: Deeper nets without degradation for high-dim tx feats (Chen cites ResNeXt-GRU hybrid).
  - Pros: Train deeper for complex interactions. Cons: Still tabular-static.
- **Kolmogorov-Arnold Networks (KANs)**
  - Subtypes: B-spline KAN; Fourier/truncated variants (KAN-AD); dynamic oversampling KAN.
  - Origin: Liu et al. ICLR 2025 (Kolmogorov-Arnold thm; learnable activations on edges vs MLP weights).
  - Fraud: arXiv:2408.10263 (2024); 2025 oversampling KAN fraud; KAN-AD time-series AD (ICML 2025).
  - Mechanism: Spline-based univariate funcs + grid; interpretable (symbolic potential); classif or AD.
  - Pros: Better accuracy/interpret than MLP in some low-dim; theoretical grounding. Cons: Slower train; mixed fraud suitability (best if PCA+spline separable); not universal winner.
  - Assumptions: Function approximable via Kolmogorov decomp. Limits: Scalability to very high-dim tx; empirical fraud mixed results.

## 2. Sequence / Recurrent Models (Behavioral Tx Sequences + Logs as Seq)
**Core**: Model ordered history (user tx seq or log events). Mechanism: Hidden state carries temporal context; fraud via:
  - Supervised classif on final/ pooled state.
  - Unsup: Next-tx prediction error or reconstruction deviation (high err = anomaly).
  - KYA: Seq can include relational flags (e.g., "new linked account" events).
- **RNN (vanilla) / Stacked RNNs**
  - Foundational but rare standalone (gradient issues).
- **LSTM**
  - Subtypes: Standard, stacked, seq2seq.
  - Origin: Hochreiter & Schmidhuber 1997.
  - Fraud: Dominant in Chen 2025 (sharp growth); user txn seq history. Kaggle/PyTorch LSTM examples.
  - SOTA ex: Many 2023-25 papers; standalone competitive w/ FE.
- **GRU**
  - Lighter (no separate cell); faster than LSTM.
  - Fraud: Often in ensembles (e.g. w/ BiLSTM).
- **Bi-LSTM / Bi-GRU / Bidirectional**
  - Subtypes: + Attention layers.
  - Fraud: Full forward+backward context on batch seq (e.g. Ghrib 2024 BiLSTM-BiGRU 89+% score; LSTM-Attn GitHubs).
  - Pros for fraud: Captures "before/after" suspicious patterns.
- **Other Seq Variants**: Seq2Seq (encoder-decoder for anomaly); Time-aware (delta encodings).
- **Logs as Seq**: Direct application (event streams → LSTM/GRU for system anomaly/fraud indicators).
- **Pros/Cons**: Pros: Native temporal/behavioral (drift handling via recency); velocity/burst detection. Cons: Sequential compute (real-time latency); vanishing (mitigated by gates); needs per-entity history (cold start).
- **Assumptions**: Markovian-ish temporal deps; sufficient seq length. Limits: Long seq (use attn/Trans); label delay in streaming.

## 3. Attention & Transformers (Self-Attn for Tx Seq + Tabular + Interactions)
**Core**: Self-attention (parallel, long-range); multi-head. Mechanism: Attention weights as importance (suspicious tx or feature relations score fraud); encoder for reps → classif/recon.
- **Self-Attention / Transformer Encoders (Seq-focused)**
  - Subtypes: Pure encoder for tx seq (positional + temporal encoding).
  - Fraud: Long deps in user history (e.g. slow build-up then burst); parallel over seq.
  - Chen 2025: Key for seq/relational patterns.
- **TabTransformer (Tabular)**
  - Subtypes: Cat embeddings → Trans layers → concat num feats → MLP head. (Semi-sup variants).
  - Origin: Huang et al. 2020 arXiv:2012.06678.
  - Fraud: 2024-2025 direct apps (e.g. "TabTransformer + cost-sensitive" for imbalanced small CC data; IEEE weighted-loss variants). Outperforms MLP on cats; robust noise.
  - KYA: Excellent for categorical KYC/KYE flags (contextualized).
- **FT-Transformer / Structured Data Transformers**
  - Origin: Rubachev 2022+.
  - Fraud: Direct comparisons vs TabT on fraud datasets (2025 studies); feature-tokenizer + attn.
  - Pros: Handles mixed types natively.
- **MoE with Transformers**
  - Subtypes: Experts as Trans layers or FFN; router.
  - Fraud: Vallarino 2025 hybrid (see Hybrids).
- **Temporal / Time-Aware Trans**
  - Subtypes: Positional time encoding; 2026 Temporal Transformer + CTGAN.
  - Fraud: Order + interval preservation in tx seq.
- **Pros/Cons**: Pros: Parallel (real-time scalable); attn interpretability (which tx/feat drove score); long-range + global interactions (tab+seq). Cons: Quadratic complexity (long seq/logs); data hungry; less inductive bias than RNN/CNN.
- **Assumptions**: Attention learns meaningful weights; positional encoding sufficient for time. Limits: Over-attn on noise; compute for prod.

## 4. Generative & Representation Learning (AE/VAE/GAN/Diffusion + Seq Ties)
**Core**: Learn "normal" manifold; fraud = high recon error / low likelihood / synthetic contrast. Cross seq for behavioral.
- **Autoencoders (AE) + Seq**
  - LSTM-AE, CNN-AE.
  - Fraud (Chen): AE-LSTM (recon + temporal classif).
- **Variational Autoencoders (VAE)**
  - Subtypes: LSTM-VAE, Trans-VAE, conditional.
  - Fraud: Latent seq modeling; synth + classif; two-stage anomaly/classif (VAE+Trans papers).
- **GANs (incl Self-Attn)**
  - SAGAN (Zhao 2024); CTGAN conditional tabular + seq.
  - Fraud: Synth minority class; adversarial training for robust detector.
- **Diffusion Models**
  - Emerging: Conditional tabular diffusion + seq Trans analogs (fewer direct 2023-26 fraud hits; tie generative sibling for future).
- **Mechanism**: Recon/pred error or energy/likelihood as anomaly score. GAN for data aug.
- **Pros for imbalance/drift**: Synth rare fraud; robust reps.
- **Cons**: Train instability (GAN); posterior collapse (VAE); compute.
- **KYA/Logs**: Embed relational or log text in latent; seq VAE on log events.

## 5. Hybrids & Mixture-of-Experts (RNN + Trans + AE + Cross)
**Core**: Ensemble experts or staged (e.g. AE pre-filter + classif). Gating or fusion.
- **CNN-LSTM Hybrids**
  - Local CNN + temporal LSTM. Fraud: Tx graphs or 1D seq (multiple 2024-26 blockchain/CC papers).
- **LSTM/Seq + AE/VAE**
  - AE-LSTM (Chen); BiLSTM + Attn CAE (2025); VAE+Trans.
- **Transformer + Generative**
  - Temporal Trans + CTGAN (2026); SAGAN variants.
- **MoE Hybrids (RNN + Transformer + AE)**
  - Vallarino 2025 (Anser): MoE w/ RNN (seq behavior expert), Transformer (high-order interactions), Autoencoder (anomaly recon expert). Gating on tx input. 98.7% acc/91.5% rec on synth CC fraud. Scalable, modular; addresses evolving/adversarial via specialization.
  - Subtypes: Sparse MoE (activate subset experts); hierarchical.
  - Pros: Expert specialization (seq vs global vs anomaly); efficiency (sparse); strong on complex/multi-modal (tab+seq+relat).
  - Cons: Routing complexity; train stability.
- **Other Hybrids**: ResNeXt-GRU (Chen); CatBoost-DNN; Trans + LOF/RF (Chen); stacked seq + trees.
- **Integration w/ GNN/Graph**: Seq on temporal edges (overlap TGN); seq feats to GNN.
- **Generative Cross**: Seq model pretrain + GAN/VAE aug + downstream classif (or joint).

## 6. Other Specialized DL Families
- **Capsule Networks**
  - Subtypes: Graph-Attn Capsule (RMGACNet Shi 2025 PLOS ONE): Regularized memory + GAT + capsules for financial fraud. Captures hierarchical part-whole (e.g. fraud ring components).
  - Mechanism: Capsules for equivariant reps + dynamic routing.
  - Pros: Better structure than CNN for relations/rings. Cons: Newer, fewer fraud benchmarks.
- **Energy-Based Models (EBM) / RBM**
  - Subtypes: GAD-EBM (graph likelihood via EBM); RBM ensembles w/ xLSTM; EBM for anomaly energy scoring.
  - Fraud: High energy = anomalous/fraud (Neyman-Pearson style). Feature sel via EBM (interpretml).
  - Pros: Principled density est (anomaly); some interpret. Cons: Sampling hard for discrete tx/graph; scaling.
- **Deep Belief Networks (DBN)**
  - Chen 2025: Foundational feature extract/classif; less used now vs CNN/Trans.
- **Deep SVDD / One-Class DL**
  - Hypersphere learning for normal; distance as score. (Cross classical AD).

## 7. Cross-Modal / Integrated Families (Tabular + Seq + Graph + Logs)
- **Seq + Graph Hybrids**: LSTM/Trans on temporal graph paths (e.g. HTGNN overlap; FraudGT edge Trans).
- **Multimodal (Logs + Tx Seq)**: NLP Trans (BERT) on log text + seq LSTM/Trans fusion.
- **KYA/KYE Native**: Relational feats in tabular DL; typed seq events; node seq in temporal models.
- **SSL/Semi on Seq**: Masked tx prediction (like BERT for seq); contrastive on user histories (cross Tier 7 roadmap).
- **Foundation / Large Seq Models**: TransactionGPT/PANTHER/TREASURE (roadmap refs); seq Trans pretrain on massive logs/tx.
- **Layered Cascades**: DL seq/Trans as middle layer (after rules/IF, before LLM review).

## Taxonomy Gaps & Emerging (Post-Chen 2024 / 2025-2026)
- Diffusion seq + fraud (promising for high-quality synth seq).
- Federated DL seq (privacy for KYA data across banks).
- Agentic / LLM-aug seq (RAG over tx seq logs).
- KAN + seq/Trans hybrids (early).
- Full multimodal (video logs + tx seq) rare.

**Hierarchical Summary Tree (Text)**:
DL-Fraud
├── Supervised Tabular Classifiers
│   ├── MLP/Dense
│   ├── 1D-CNN / ResNet-tabular
│   └── KANs
├── Sequence/Recurrent
│   ├── LSTM/GRU/BiLSTM/Stacked
│   └── Variants (time-aware, log-seq)
├── Attention/Transformers
│   ├── Self-attn Encoders (seq)
│   ├── Tabular (TabTransformer, FT-Trans)
│   └── MoE-Trans
├── Generative/Rep (cross seq)
│   ├── AE/VAE (+LSTM/Trans)
│   ├── GAN/SAGAN (+CTGAN seq)
│   └── Diffusion (emerging)
├── Hybrids/MoE
│   ├── CNN-LSTM
│   ├── Seq+AE/VAE/Trans
│   └── MoE(RNN+Trans+AE) 2025
├── Specialized
│   ├── Capsule (RMGACNet)
│   └── EBM/RBM
└── Cross-Modal (seq+graph+log+tab w/ KYA)

**Usage**: Feed dl_model_taxonomy into roadmap tiers + model_cards selection. Prioritize hybrids/MoE + seq Trans for SOTA expansion.

---
*Exhaustive per 2026 research. Sources cross-ref papers_and_sources.md.*
