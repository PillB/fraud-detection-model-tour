# Papers and Sources: Sequence, Hybrid, Transformer & DL Families for Fraud/Anomaly Detection

**Focus**: Real citations (2023-2026 prioritized; foundational noted explicitly). Exhaustive for supervised DL classifiers (MLP, 1D-CNN, ResNet-tabular, KANs), sequence/recurrent (LSTM/GRU/BiLSTM/stacked), attention & transformers (self-attn, TabTransformer, FT-Transformer, Structured Data Trans, MoE-Trans), hybrids (LSTM+AE, Trans+VAE, CNN-LSTM, MoE RNN+Trans+AE), generative mixtures (VAE/GAN/Diffusion + seq), other (Capsule, EBMs). 
**Coverage**: Structured transactions + KYA/KYE relational/behavioral (as features, seq attrs, or graph nodes) + logs as sequences. Fraud mechanisms (prediction/recon error, attention scores, classification, energy). SOTA perf, surveys.
**Primary Surveys (Backbone)**:
- Chen, Y. et al. (2025). "Year-over-Year Developments in Financial Fraud Detection via Deep Learning: A Systematic Literature Review". arXiv:2502.00201 (v1 Jan 2025; v2 Jul 2025). Kitchenham SLR of 57 DL papers 2019-2024. Details CNN, LSTM/GRU/RNN, MLP, Transformers, VAE/GAN, GNN, hybrids (AE-LSTM, ResNeXt-GRU, Transformer hybrids), imbalance handling, metrics (PR-AUC preferred). [arXiv PDF/HTML extracts].
- Thivaios, S. et al. (2026). "A Survey of Machine Learning and Deep Learning for Financial Fraud Detection: Architectures, Data Modalities, and Real-World Deployment Challenges". Algorithms (MDPI), 19(5), 354. DOI: 10.3390/a19050354. Structured taxonomy across classical ML, deep NN (incl seq/Trans), graph, multimodal, cost-sensitive, RL, federated, LLM. Data modalities (tabular tx, relational KYE/KYA, seq/behavioral, logs/text). Deployment (real-time, drift).

**Repos & Curated**:
- safe-graph/graph-fraud-detection-papers (GitHub): 250+ Graph/Transformer/seq-related fraud papers (2014-2026). Dashboard + RAG. Extends to seq/hybrid DL.
- Kaggle European CC Fraud, IEEE-CIS (graph-ext), DGraph (temporal), synth datasets in papers.

## Foundational (pre-2023, noted; heavily referenced in 2023+ fraud DL)
- Hochreiter, S. & Schmidhuber, J. (1997). "Long Short-Term Memory". Neural Computation. (LSTM origin; seq modeling basis).
- Huang, X. et al. (2020). "TabTransformer: Tabular Data Modeling Using Contextual Embeddings". arXiv:2012.06678. (Tabular Transformer; categorical contextual via self-attn layers; robust to noise/missing).
- Rubachev, I. et al. (2022). FT-Transformer (feature tokenizer + Transformer for tabular).
- Liu, Z. et al. (2024/2025 ICLR). "KAN: Kolmogorov-Arnold Networks". (KAN origin; spline-based activations vs MLP weights).
- Standard AE/VAE (Kingma 2013/2014), GAN (Goodfellow 2014), CNN (LeCun), basic RNN/GRU (Cho 2014).
- Bahnsen et al. (2016) FE (velocity/aggs for seq-like features; cross-ref classical subagent).

## 2023-2026 Papers & Sources (Fraud-Specific or Direct DL Apps)
### Supervised DL Classifiers (MLP/Dense, 1D-CNN, ResNet-style Tabular, KANs)
- Chen et al. (2025) survey: MLP widely used/competitive for structured tx (non-linear relations, amount profiling). CNN for high-dim/time-series embeddings + heatmaps; deep CNN feats + SVM/KNN etc. hybrids. ResNeXt-GRU hybrid noted.
- Akouhar, M. et al. (2025). "Dynamic oversampling-driven Kolmogorov–Arnold Networks for fraud detection" (or similar B-spline KAN fraud). ScienceDirect/related. Expressive for fraud; spline interp.
- arXiv:2408.10263 (2024). "Kolmogorov–Arnold Networks in Fraud Detection: Bridging the Gap Between Theory and Practice". Mixed: promising low-FP in some cases (spline-separable post-PCA), but "not suitable" generally for fraud. Quick test proposed.
- 2025 KAN fraud/AD: KAN-AD (ICML 2025 poster; time-series AD with Fourier vs B-spline; robust global patterns). Supply chain fraud KAN ex. in repos.
- Tabular CNN/ResNet refs: Multiple comparative studies (2024-2026) use 1D-CNN kernels on tx feature vectors/seq; ResNet-style residual for deeper tabular. Often in hybrids.
- Performance: MLP/CNN strong baselines in Chen (steady usage); gains w/ imbalance techniques.

### Sequence / Recurrent Models (LSTM, GRU, Bi-LSTM, Stacked for Tx/Behavioral Seq)
- Chen et al. (2025): RNN/LSTM/GRU most prominent/growing (sharp 2022-2024 rise) for transaction histories/sequential patterns. LSTM dominant; GRU lighter alternative. Bi/ stacked implied in seq modeling.
- Ghrib, T. et al. (2024). "ADVANCED FRAUD DETECTION IN CARD-BASED FINANCIAL SYSTEMS USING A BIDIRECTIONAL LSTM-GRU ENSEMBLE MODEL". Applied Computer Science. BiLSTM-BiGRU ensemble; 89.22% fraud detection score outperforming AdaBoost/NB/DT/LR/RF/Voting.
- Yousefimehr, B. et al. (2025). Distribution-preserving resampling + LSTM/GRU for fraud (ScienceDirect).
- ACM/Springer 2023: "Auto-Encoder and LSTM-Based Credit Card Fraud Detection".
- Multiple Kaggle/2024-25: Attention-LSTM, BiLSTM seq modeling (e.g. github bibtissam/LSTM-Attention-FraudDetection: UMAP + LSTM + attn on tx seq).
- Fraud-detection-handbook (ref): LSTM on seq for fraud; input per-user ordered txns.
- Mechanism ex: Model seq → final state or next-pred error for anomaly/classif. Bi for full context.
- SOTA/Perf: BiLSTM variants outperform standalones; + velocity/agg seq feats boost (cross Bahnsen).

### Attention & Transformers (Self-Attn, TabTrans, Structured, MoE w/ Trans)
- Huang et al. (2020 TabTransformer foundational; applied 2024+: "Credit Card Fraud Detection with Imbalanced Small Data Using TabTransformer and Cost-Sensitive Learning" (2024 CSE / Springer; multiple 2025 IEEE/others). Contextual embeddings for cats; robust.
- Hartomo, K.D. et al. (2025). "A Novel Weighted Loss TabTransformer..." (IEEE). For credit risk/fraud; weighted loss + explain.
- GitHub/comparisons (2025): TabTransformer vs FT-Transformer on CC fraud.
- Chen (2025): Transformers highlighted for parallel self-attn on seq/relations/behavior; superior long-range vs RNN. Hybrid Transformer-LOF-RF (202? in review) beats XGB/LGBM/LSTM on imbalance/rare patterns.
- Lin, J. et al. (2024). FraudGT (Graph Transformer; edge-rich financial; see graph subagent).
- MoE + Trans: Vallarino, D. (2025). "Advancing Fraud Detection with Hybrid AI: A MoE, RNN, and Transformer-Based Approach for Financial Risk Assessment". Journal of Information Economics (Anser Press). MoE framework w/ RNN/Trans experts + AE. 98.7% acc, 94.3% prec, 91.5% rec on high-fid synthetic CC fraud data (outperforms standalones/classical).
- Temporal Transformer refs: Chen, J. et al. (2026). "Temporal Transformer with Conditional Tabular GAN..." (MDPI Mathematics).
- Mechanism: Self-attn scores highlight suspicious tx in seq or feature interactions; classif head or recon.
- Pros for tabular+seq: Parallelism (real-time friendly), long deps, robustness (TabT).

### Hybrids with Sequences + Generative Mixtures
- Chen (2025): AE-LSTM (AE dim-reduce/recon + LSTM temporal; superior to LSTM alone [61]); RXT-J (ResNeXt feat + GRU seq); CatBoost-DNN; Transformer hybrids.
- BiLSTM + Attention-Based Convolutional AE (2025 IRJMT): Hybrid for financial tx fraud.
- CNN-LSTM: Multiple (e.g. "Detection of Blockchain Online Payment Fraud Via CNN-LSTM"; thesis 2025 "CNN with LSTM"; 2024-25 papers).
- VAE/GAN + seq: Zhao, C. et al. (2024). "Advancing financial fraud detection: Self-attention generative adversarial networks (SAGANs)" (Finance Research Letters?). SAGAN + LSTM/BiLSTM refs.
- Chen, J. (2026). Temporal Transformer + CTGAN (CTGAN synth fraud oversample + time-aware Trans seq).
- VAE + Transformer: "A Robust Deep Learning Approach... VAE + Transformer-based fraud" (two-stage anomaly + classif).
- LSTM-VAE-GAN / ALGAN refs (time-series AD/fraud; 2024-25 papers e.g. Bashar, Niu et al.).
- Vallarino 2025 MoE (RNN seq + Trans interactions + AE recon anomaly) — key 2025 exemplar.
- Diffusion: Limited direct 2023-26 fraud seq hits (emerging; cross generative sibling); conditional tabular + seq Trans analogs.
- Mechanism cross: Seq prediction/recon error (AE/VAE/LSTM); GAN synth + classif; joint or cascaded. MoE gates experts.
- Perf: Hybrids often +5-15% over single (per Chen/specific); MoE high 90+% on synth.

### Other Families
- Capsule Networks: Shi, X. et al. (2025). "Innovative novel regularized memory graph attention capsule network for financial fraud detection". PLOS ONE 20(5). RMGACNet: memory-aug + graph attn + capsules; improves part-whole for fraud rings vs standard.
- Energy-Based Models (EBM) / RBM: GAD-EBM (graph AD via EBM likelihood; OpenReview 202?); RBM/xLSTM ensemble for CC fraud (2024 Authorea/Baghdadi); EBM anomaly scoring (high energy = outlier/fraud). Explainable Boosting Machine (EBM/GA2M, interpretml) used for feature sel + fraud classif (transparent alt to blackbox DL).
- DBNs: Chen (2025) notes foundational but limited vs CNN etc.

### Datasets, Industry, Cross-Cutting
- Datasets: Kaggle European CC (0.172% fraud); IEEE-CIS (tabular + graph ext); DGraph (temporal); synth for gen models; real bank/payment platforms (proprietary, e.g. in TGN/LSTM papers).
- Industry: PayPal/Stripe (ML incl DL seq/hybrids + network; real-time); refs to foundation txn models (TransactionGPT etc in roadmap).
- KYA/KYE/Logs: Flattened relational (aggs, flags) as input feats for all DL; seq attrs (history w/ KYE); logs as event seq (LSTM/Trans anomaly) or NLP text. Chen: text claims/reports via NLP+DL. Thivaios: multimodal/relational modalities.
- Imbalance/Drift/Real-time: Universal (SMOTE/GAN/VAE synth, focal/cost-sens, weights). Seq/Trans better drift via temporal encoding/memory. Real-time: fast MLP/Trans (parallel); optimize RNN.
- Surveys/Additional: Motie 2024 ESWA GNN (cross); Hafez 2025 AI CC fraud; safe-graph list; fraud-detection-handbook (seq chapter).

**Notes on Citations & Usage**:
- All verified via 2026-06 tool searches/browses (arXiv, MDPI, IEEE, ScienceDirect, ResearchGate). Chen/Thivaios primary for breadth/taxonomy. Specific perf quoted/paraphrased (synth/Kaggle common; real often higher w/ FE but proprietary).
- Cross-ref: graph-temporal-gnn (TGN/Trans-graph), classical (FE/velocity for seq-like), ensembles (hybrids/cascades), deep-generative (VAE/GAN details).
- Gaps flagged: Full Chen perf tables limited in public extracts; Diffusion seq fraud sparse pre-2026; exact prod latency numbers rare.
- For roadmap/model cards: Cite these + subagent files. Recommend primary sources.

---
*Last updated: 2026-06-20. Expand with new post-2026 papers or full PDFs.*
