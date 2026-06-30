# Priority Models for Model Cards & Experiments

Selected based on:
- Coverage of roadmap tiers
- Prevalence in research (surveys, safe-graph, recent TGN/HTGNN papers)
- Representativeness for structured transaction + relational fraud
- Educational value + runnable simplicity
- Balance between classical, graph, temporal, and ensemble

Target: 8 core cards.

## 1. Isolation Forest (Tier 2 - Classical Unsupervised AD)
- Foundational anomaly detection.
- Excellent starting point for toy viz (random cuts).
- Used widely alone or in hybrid.
- Sources: Liu et al., frequent in all fraud benchmarks.

## 2. XGBoost (Tier 1 - Supervised Tabular)
- Dominant in production tabular fraud.
- Strong baseline to beat or combine with.
- Feature importance = handholding for beginners.

## 3. Autoencoder (Tier 3 - Deep Unsupervised + Hybrid)
- Common in hybrids with tree models.
- Good reconstruction error visualization.

## 4. GraphSAGE or GAT (Tier 4 - Graph)
- Captures KYA/KYE + transaction relations.
- Educational: neighborhood aggregation.

## 5. Temporal Graph Network (TGN) simplified (Tier 5 - SOTA)
- Key focus per research.
- Represent temporal dynamics.
- For toy: simplified memory + time-aware aggregation or use networkx simulation + sklearn proxy. Full impl note.

## 6. Local Outlier Factor (LOF)
- Complementary density-based AD.

## 7. Ensemble / Stacking Hybrid
- Realistic production pattern: IF + XGBoost + graph score.

## 8. VAE (Variational Autoencoder) Family for Anomaly Detection
- Core generative AD model. Encoder to latent (with variational approx), decoder for reconstruction. Anomaly = high reconstruction error or low reconstruction probability.
- Mixtures: VAE latents + XGBoost classifier; LSTM-VAE for sequences.
- Toy: Simple VAE (PyTorch or TF) on synthetic tx data; evaluate via recon prob vs labels.

## 9. Sequence Models (LSTM / Transformer)
- LSTM/GRU or Transformer for modeling transaction sequences/behavior over time.
- Hybrids: AE-LSTM, Transformer + VAE.
- Strong for temporal drift and behavioral anomalies.

## 10. Hybrid Mixtures (e.g., MoE + RNN + Transformer + AE)
- Advanced: Mixture of Experts where gating selects among specialized DL modules (RNN for seq, Transformer for interactions, AE for AD).
- Recent 2025 examples show strong results on synthetic real-world fraud data.
- Recommended for production-like layered systems.

## 11. GAN & Diffusion for Anomaly + Synthesis
- GAN variants for oversampling or AnoGAN-style AD.
- Diffusion models (newer) for generating realistic anomalies or detection via denoising process.
- Critical for extreme imbalance.

## 12. VAE (Variational Autoencoder) with Reconstruction Probability (An & Cho paradigm)
- Foundational generative AD: Train on normal; anomaly via low recon probability (probabilistic, accounts variability) or latent deviation.
- Variants: LSTM-VAE (seq), cVAE (cond on KYA), beta-VAE.
- Mixtures: Latents + XGB; end-to-end VAE-GAN.
- Toy: PyTorch VAE on synthetic tx; score via recon prob.

## 13. DAGMM (Deep Autoencoding Gaussian Mixture Model)
- Joint AE compression + GMM on latent + recon feats; energy score for AD.
- Strong for complex high-dim tabular (fraud proxies).

## 14. CTGAN / Conditional GAN for Oversampling + Downstream Classifier
- Generate realistic synthetic fraud samples (mode-specific handling for tabular).
- Train XGB/LightGBM on augmented data. Practical imbalance fix.

## 15. Diffusion Models for Augmentation / Anomaly (FraudDiffuse-style)
- High-quality diverse synth data (often superior to GAN in recent papers).
- Emerging direct AD via score/denoising deviation.

## 16. MoE Hybrid (RNN/seq + Transformer + AE experts, Vallarino 2025 style)
- Gating network routes input to specialized experts (seq behavior, high-order/KYA interactions, anomaly recon).
- Adaptive, high reported perf (98.7% acc / 91.5% rec on synth realistic fraud). Flagship mixture.

## 17. LSTM / BiLSTM + Attention for Behavioral Sequences
- Model per-user txn history or log events.
- Anomaly via prediction error or classification on hidden state.
- Native for velocity, drift, temporal KYA events.

## 18. TabTransformer / Structured Transformers (Tabular + KYA)
- Self-attn on mixed features (strong for categorical KYC/KYE flags).
- Contextual embeddings + MLP/classif.

## 19. LSTM-VAE-GAN / VAE-GAN Hybrids
- Combine VAE stability/prob with GAN quality for seq or tabular.
- Synth + recon AD.

## 20. Specialized (Capsule RMGACNet for relational rings; EBM for energy AD)
- Capsule: Hierarchical part-whole for fraud networks.
- EBM: Learn energy function; high energy = anomaly.

## 21. LLM / RAG Hybrid Note (Tier 8)
- Not full model toy (cost), but architecture + simple example using structured context. (Layered on top of above.)

## Additional Notes
- All cards must include runnable Python code.
- Visuals: IForest (JS cuts), GNN (aggregation diagram), TGN (time memory flow).
- Experiments will compare at least 1-2 from each tier + one ensemble.

Next: After sub-agent results, lock final list and start Fase 2 cards.
