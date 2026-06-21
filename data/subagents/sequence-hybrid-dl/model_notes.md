# Model Notes: Key DL Families (Sequence, Tabular DL, Transformers, Hybrids, Generative Crosses) for Fraud Detection

**Card Structure** (per subagent pattern):
- **Origin / Key Paper(s)**
- **Core Idea / Mechanism**
- **How Fraud/Anomaly is Modeled** (seq pred err, attn scores, classif, recon, energy; tie KYA/KYE features/seq/graph, logs as seq)
- **Pros / Cons for Fraud** (imbalance, real-time, drift, tabular+seq+graph)
- **Assumptions**
- **Limitations**
- **Concrete SOTA / Performance Examples** (datasets, metrics)
- **Relevance to KYA/KYE / Sequences / Logs + Industry**

Focus on "new" or expanded families (beyond basic classifiers/AD/GNN in roadmap). Citations from papers_and_sources.md. Chen 2025 (arXiv:2502.00201), Thivaios 2026, 2025 specifics.

---

## Supervised DL Classifiers: MLP / 1D-CNN / ResNet-Tabular / KANs

### MLP / Dense Networks (Tabular Baseline)
- **Origin / Key Paper(s)**: Foundational (pre-DL); Chen 2025 survey identifies as competitive for structured financial fraud (amount-based profiling, non-linear relations).
- **Core Idea / Mechanism**: Stacked fully-connected layers + non-linearities (ReLU); learn hierarchical feature transforms. Final sigmoid/softmax for binary fraud classif. Often w/ embeddings for categorical (incl KYE flags).
- **How Fraud/Anomaly is Modeled**: Supervised classification on flattened tx + KYA features (agg velocity, linked counts, risk scores). Output fraud probability.
- **Pros / Cons for Fraud**:
  - Pros: Fast inference (real-time), simple, handles mixed numeric/categorical w/ FE; scalable to high volume.
  - Cons: Requires strong feature eng (no native seq order or graph); sensitive to imbalance without weights/focal/cost-sens.
- **Assumptions**: Features capture all signal; i.i.d. txns.
- **Limitations**: Misses temporal dependencies or relational structure unless explicitly engineered (velocity/aggs as seq proxies).
- **Concrete SOTA / Performance Examples**: Steady usage in Chen 57-paper review (2019-2024); often baseline or hybrid component. On Kaggle Euro CC (~0.17% fraud) w/ proper FE + class_weight: competitive AUC-PR but usually surpassed by trees or seq models unless tuned.
- **Relevance to KYA/KYE / Sequences / Logs + Industry**: Primary for KYA/KYE as input features (flattened). Logs via NLP embeddings concat. Industry: Part of cascades (e.g., fast MLP gate). Cross classical FE (Bahnsen velocity).

### 1D-CNN / ResNet-style for Tabular
- **Origin / Key Paper(s)**: CNN lineage (LeCun); tabular adaptations in fraud papers (Chen 2025 cites CNN for time-series embeddings/heatmaps + ResNeXt-GRU hybrid).
- **Core Idea / Mechanism**: 1D convolutions (kernels slide over feature vec or short seq) extract local patterns; residual connections (ResNet) enable deeper stacks w/o degradation. Pooling + dense head for classif.
- **How Fraud/Anomaly is Modeled**: Local anomalous patterns (e.g. unusual amount+time clusters in windowed features); recon or classif.
- **Pros / Cons for Fraud**:
  - Pros: Efficient local feature detection; parameter sharing good for similar tx patterns; fast.
  - Cons: Limited long-range temporal (pair w/ RNN/attn); assumes grid-like local structure in feats.
- **Assumptions**: Nearby features (in engineered order) are locally related.
- **Limitations**: Feature ordering arbitrary for pure tabular; poor alone on long behavioral seq or complex graphs.
- **Concrete SOTA / Performance Examples**: Used in 2024-2026 comparative/hybrid studies; deep CNN feats boost traditional (SVM etc.) per Chen. Hybrids w/ LSTM show gains.
- **Relevance**: KYA aggs in feature "image"; short seq windows. Logs limited.

### Kolmogorov-Arnold Networks (KANs)
- **Origin / Key Paper(s)**: Liu et al. (ICLR 2025 Oral) "KAN: Kolmogorov–Arnold Networks". Fraud-specific: arXiv:2408.10263 (2024); 2025 dynamic oversampling KAN fraud papers; KAN-AD ICML 2025 (time-series AD).
- **Core Idea / Mechanism**: Learnable univariate spline (or Fourier) activations on edges (not weights on nodes like MLP). Kolmogorov-Arnold thm decomposition. Grid + spline interp.
- **How Fraud/Anomaly is Modeled**: Classification or AD (recon/pred); interpretable function learning for decision boundaries on tx features.
- **Pros / Cons for Fraud**:
  - Pros: Potentially more accurate/interpretable than MLP for certain data (symbolic extract); good for low-FP fraud (precise boundaries).
  - Cons: Slower training; empirical results mixed for fraud (arXiv:2408.10263 concludes "not suitable" in general; works if spline-separable post-PCA).
- **Assumptions**: Target function decomposable per Kolmogorov-Arnold.
- **Limitations**: Scalability (high-dim tx features); limited large-scale fraud benchmarks; compute overhead.
- **Concrete SOTA / Performance Examples**: KAN-AD robust on time-series AD; fraud oversampling KAN 2025 shows gains in specific setups; supply-chain fraud ex. Often compared favorably to MLP on small/structured but not always vs XGB.
- **Relevance to KYA/KYE / Sequences / Logs**: Tabular KYA feats primary. Time-series variant (KAN-AD) fits behavioral seq or logs.

---

## Sequence / Recurrent: LSTM, GRU, Bi-LSTM, Stacked

### LSTM (Core Sequence Model)
- **Origin / Key Paper(s)**: Hochreiter & Schmidhuber (1997) "Long Short-Term Memory". Fraud: Dominant in Chen 2025 (sharp growth 2022-2024 due to sequential tx data); "Auto-Encoder and LSTM-Based Credit Card Fraud Detection" (2023).
- **Core Idea / Mechanism**: Gates (forget/input/output) + cell state for long-term memory. Processes seq step-by-step: hidden state summarizes history.
- **How Fraud/Anomaly is Modeled**: Input: ordered user tx seq (amount, time-delta, merchant cat, KYA flag events). Supervised: classif on last hidden. Unsup/hybrid: next-tx prediction error or combined w/ AE recon error. High deviation = fraud (e.g. sudden high-amount after quiet).
- **Pros / Cons for Fraud**:
  - Pros: Excellent for behavioral seq / drift (recency bias via memory); captures bursts/velocity patterns natively. Pairs well w/ KYA event flags in seq.
  - Cons: Sequential (slower inference than Trans for long histories); gradient issues mitigated but still present in very long; needs sufficient history.
- **Assumptions**: Temporal dependencies exist and are learnable; normal behavior consistent enough for contrast.
- **Limitations**: Cold-start (new users w/ short seq); batching for streaming real-time; label scarcity (often semi-sup).
- **Concrete SOTA / Performance Examples**: Chen review: most frequent/growing DL. Specific: LSTM/GRU + resampling 2025 papers; Kaggle PyTorch LSTM notebooks competitive. AE-LSTM superior to pure LSTM (Chen). Typical Kaggle Euro: high AUC w/ FE but PR-AUC critical.
- **Relevance to KYA/KYE / Sequences / Logs + Industry**: **Primary for behavioral sequences**. Include KYA changes (new link) as seq events. Logs: direct event seq anomaly (system fraud indicators). Industry: PayPal/Stripe behavioral models; often hybrid (embeddings to trees or cascade).

### GRU & Bi-LSTM / Bidirectional Variants
- **Origin / Key Paper(s)**: GRU (Cho 2014); Bi-LSTM common extension. Fraud: Ghrib et al. (2024) BiLSTM-BiGRU ensemble (Applied Computer Science, 89.22% score); 2025 BiLSTM + Attn CAE hybrid.
- **Core Idea / Mechanism**: GRU: simplified gates (reset/update) vs LSTM. Bi: forward + backward passes; concat states. +Attn: weight important steps.
- **How Fraud/Anomaly is Modeled**: Same seq input as LSTM; bidirectional gives full context (pre/post fraud signals in history window); attn scores pinpoint suspicious txns.
- **Pros / Cons**: Pros: GRU faster/lighter; Bi captures context better for batch fraud analysis; attn adds interpret (which past tx drove flag). Cons: Still sequential compute; Bi requires full seq (not pure streaming).
- **Assumptions / Limitations**: Similar to LSTM; Bi less causal for real-time.
- **SOTA**: Ghrib BiLSTM-BiGRU outperforms RF/LR etc. on card fraud; attention-LSTM GitHubs report accuracy lifts. Multiple CNN-BiLSTM hybrids.
- **Relevance**: Logs/seq same as LSTM; KYE insider seq patterns (e.g. anomalous access seq).

---

## Attention & Transformers: Self-Attn, TabTransformer, Structured, MoE-Trans

### TabTransformer (Tabular Transformer)
- **Origin / Key Paper(s)**: Huang et al. (2020) arXiv:2012.06678. Fraud apps: 2024 "Credit Card Fraud Detection with Imbalanced Small Data Using TabTransformer and Cost-Sensitive Learning"; 2025 IEEE weighted-loss TabTrans variants; GitHub comparisons vs FT-Trans.
- **Core Idea / Mechanism**: Categorical features → embeddings → stacked Transformer layers (self-attn for contextual reps) → concat numerical + MLP head. (Pretrain possible).
- **How Fraud/Anomaly is Modeled**: Classification on tabular tx + KYA/KYE cats (robust contextual cat embeddings). Attn highlights important feature interactions (e.g. high-risk merchant + new device).
- **Pros / Cons for Fraud**:
  - Pros: Strong on categorical (KYA flags, merchant types); robust to missing/noisy data (common in tx); matches/exceeds trees in some tabular fraud; semi-sup friendly.
  - Cons: Still static (pair w/ seq for behavior); quadratic attn cost.
- **Assumptions**: Cat features benefit from context (co-occurrences).
- **Limitations**: Numerical treated separately (vs pure Trans); less temporal native.
- **Concrete SOTA / Performance Examples**: Outperforms MLP on noisy imbalanced CC fraud; competitive w/ GBDT per papers + Keras ex. Used w/ cost-sensitive.
- **Relevance**: **Ideal for KYA/KYE categorical relational features**. Combine w/ seq feats or velocity. Logs: cat from parsed events.

### Self-Attention / (Temporal) Transformer Encoders + MoE-Trans
- **Origin / Key Paper(s)**: Vaswani et al. (2017) Attention is All You Need (foundational); Chen 2025 highlights for fraud seq/relations. Temporal: 2026 "Temporal Transformer with Conditional Tabular GAN". MoE: Vallarino 2025.
- **Core Idea / Mechanism**: Multi-head self-attn + FFN + pos/time encoding. Parallel over seq. MoE: router selects expert Trans (or inside FFN).
- **How Fraud/Anomaly is Modeled**: Seq of txns → attn weights (suspicious history segments) + classif head. Or recon error in hybrid. Temporal encoding preserves order/deltas.
- **Pros / Cons**:
  - Pros: Long-range deps (slow fraud build-up); parallel (real-time scalable); attn interpret; handles variable seq.
  - Cons: No strong locality bias (CNN better for local); memory for long seq/logs; needs positional care for time.
- **Assumptions**: Order/position encodes time meaningfully.
- **Limitations**: Data hungry; drift requires retrain or continual.
- **SOTA**: Transformer-LOF-RF hybrid (Chen) beats XGB/LSTM on rare patterns. Temporal Trans+CTGAN strong on seq fraud.
- **Relevance**: Behavioral seq primary. KYA as additional tokens or attrs. MoE variant specializes.

---

## Hybrids with Sequences + Generative Mixtures

### CNN-LSTM Hybrids
- **Origin / Key Paper(s)**: Multiple 2024-2025 (e.g. blockchain CNN-LSTM; 2025 thesis hybrid CNN+LSTM; Chen ResNeXt-GRU analog).
- **Core Idea / Mechanism**: CNN extracts local patterns from tx window/feat map; LSTM models temporal evolution of those features.
- **How Fraud/Anomaly is Modeled**: Local anomaly (CNN) + seq deviation (LSTM). Classif or joint loss.
- **Pros/Cons**: Pros: Best of local + global temporal. Cons: More params; staging needed.
- **SOTA**: Gains vs single models in CC/blockchain fraud papers.
- **Relevance**: Seq tx w/ local bursts (velocity) + KYA.

### LSTM + AE / Transformer + VAE / Seq + Generative
- **Origin / Key Paper(s)**: Chen 2025 AE-LSTM; 2025 BiLSTM+Attn CAE; VAE+Trans papers; Zhao 2024 SAGAN; 2026 Temporal Trans+CTGAN; LSTM-VAE-GAN refs.
- **Core Idea / Mechanism**: AE/VAE for dimensionality/recon (normal manifold); seq model (LSTM/Trans) for temporal; GAN for synth minority or adversarial.
- **How Fraud/Anomaly is Modeled**: High recon error (AE/VAE) flags anomaly; seq model predicts or classifies conditioned on latent; GAN augments rare fraud seq for training.
- **Pros/Cons**: Pros: Handles imbalance (synth); robust reps for drift; joint modeling of structure + time. Cons: Complex training (esp GAN/VAE stability); two-stage or multi-loss tuning.
- **Assumptions**: Normal data dense/low-energy manifold.
- **Limitations**: Synth may not capture all adversarial; interpret harder.
- **SOTA**: AE-LSTM > pure LSTM (Chen); high numbers on Kaggle/synth w/ hybrids.
- **Relevance**: Perfect for behavioral seq + KYA events; logs as seq recon.

### MoE (RNN + Transformer + AE) Hybrid (Promising 2025)
- **Origin / Key Paper(s)**: Vallarino, D. (2025). "Advancing Fraud Detection with Hybrid AI: A MoE, RNN, and Transformer-Based Approach for Financial Risk Assessment". Journal of Information Economics.
- **Core Idea / Mechanism**: Gating network routes input (tx seq + feats) to specialized experts: RNN (sequential behavior), Transformer (high-order feature interactions), Autoencoder (reconstruction anomaly). Weighted combination or selection. Modular.
- **How Fraud/Anomaly is Modeled**: Expert outputs fused (seq patterns + interactions + recon err); final fraud score. AE component directly surfaces atypical behaviors.
- **Pros / Cons for Fraud**:
  - Pros: Specialization addresses multi-faceted fraud (seq bursts + relational + novel); efficient (MoE sparse); scalable/modular; strong on evolving (2025 paper claims); high perf (98.7% acc, 94.3% prec, 91.5% rec on synth CC fraud data, outperforming standalones + classical).
  - Cons: Gating/routing overhead; needs careful load balancing; synthetic data validation primary.
- **Assumptions**: Sub-problems separable into expert domains (seq vs global vs anomaly).
- **Limitations**: Complexity vs single model; limited real-world (non-synth) public numbers.
- **Relevance to KYA/KYE / Sequences / Logs + Industry**: Excellent multi-rep: RNN on behavioral/KYA-event seq; Trans on KYE relational feats; AE on full tx+log seq. Ties generative (AE) + seq. Industry promise for layered defense.

---

## Other Families: Capsule Networks, Energy-Based Models

### Capsule Networks (RMGACNet)
- **Origin / Key Paper(s)**: Shi et al. (2025). "Innovative novel regularized memory graph attention capsule network for financial fraud detection". PLOS ONE.
- **Core Idea / Mechanism**: Capsules (vectors encode properties + pose); dynamic routing or attn; + memory + graph attn for relations.
- **How Fraud/Anomaly is Modeled**: Hierarchical structure (fraud ring parts → whole) via capsules + graph/attn.
- **Pros/Cons**: Pros: Superior part-whole/equivariance for coordinated fraud (rings, mules) vs flat CNN. Cons: Less mature in fraud lit.
- **SOTA**: 2025 paper reports improvements on financial fraud benchmarks.
- **Relevance**: KYA/KYE graphs/relations native (graph attn capsules); seq via memory.

### Energy-Based Models (EBM) / RBM
- **Origin / Key Paper(s)**: Foundational RBM (Smolensky); GAD-EBM (recent graph AD); 2024 RBM + xLSTM CC fraud ensemble; EBM anomaly scoring refs.
- **Core Idea / Mechanism**: Learn energy function E(x); low energy = normal (high likelihood). Anomaly = high energy. Score matching or contrastive for training.
- **How Fraud/Anomaly is Modeled**: Energy score threshold or input to classif. Graph EBM on subgraphs.
- **Pros/Cons**: Pros: Principled (density est); good for AD/novel fraud; some versions interpretable.
- **Cons**: Sampling difficult for discrete tx/graphs; training challenges.
- **SOTA**: Competitive in graph AD (GAD-EBM); ensemble gains in CC fraud.
- **Relevance**: Seq or graph inputs; logs events as configs. KYA relations in graph EBM.

---

**Integration Notes**: These cards feed Model Cards (docs/model-cards/). Recommend toy impls (PyTorch minimal functional: seq LSTM on synthetic tx history; TabTrans on KYA tabular; MoE sketch). Combine: seq embeddings + tabular DL + GNN (graph subagent) + cascade (ensembles).

**Last updated**: 2026-06-20. All backed by Chen/Thivaios + primary papers.
