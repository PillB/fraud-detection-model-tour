# Model Card: TabTransformer (Tabular Transformer for Fraud Detection)

## Origin
- Introduced by Huang et al. (2020) "TabTransformer: Tabular Data Modeling Using Contextual Embeddings".
- Applied to fraud in recent works (e.g., 2024-2025 studies on credit card and banking fraud with cost-sensitive variants).
- Complements sequence models and classical tabular (XGBoost).

## How It Works
TabTransformer uses self-attention on categorical features for contextual embeddings:

1. **Feature Tokenizer**: Splits numerical and categorical features. Categoricals are embedded.
2. **Transformer Encoder**: Self-attention layers learn contextual representations for each feature (e.g., how "high amount" interacts with "new merchant" and KYA flags).
3. **MLP Head**: Concatenated embeddings + numerical features fed to classifier or anomaly scorer.
4. **For Fraud**: Captures complex interactions in tabular tx data + relational signals (KYA as cats). Can be used for classification or combined with recon error for hybrid AD.

**Mixture**: Embeddings as features to downstream models (e.g., + XGBoost or in MoE).

## Pros
- Strong on mixed numerical/categorical data (common in tx + KYA).
- Attention provides interpretability (feature importance per tx).
- Outperforms simple MLPs on tabular benchmarks; robust to noise.
- Handles KYA/KYE categorical flags naturally via embeddings.

## Cons
- Computationally heavier than trees for very large data.
- Requires sufficient data for attention to learn useful contexts.
- Less effective on pure numerical without good FE.

## Assumptions
- Features have contextual relationships that attention can exploit.
- Categorical features (e.g., merchant type, KYA status) are informative.

## Limitations
- Not native for sequences (pair with LSTM or use temporal variants).
- For extreme imbalance: Combine with synth data or cost-sensitive loss.
- Scalability: Use for flagged subsets in cascades.

**Fraud-Specific Fit**: Excellent for structured tx data with KYA categoricals. Captures "unusual combination" fraud patterns. Use in production tabular pipelines alongside velocity FE.

## Toy Example (Functional Python)
See companion script: experiments/toy_tabtransformer.py (sklearn-based simulation of TabTransformer using embeddings + attention proxy for educational runnability without heavy DL deps; in full would use PyTorch TabTransformer).

The script demonstrates contextual feature processing on synthetic data and reports metrics.

## Conceptual Visualization
- Attention heatmap: Shows which features (e.g., amount + KYA link) the model focuses on for a fraud tx.
- Embedding space: 2D projection of categorical embeddings (e.g., merchant clusters).

## References
- Huang et al. 2020 (TabTransformer).
- Chen 2025 survey (tabular DL applications).
- Fraud papers using TabTrans + cost-sensitive (2024-2025).
- Full sources in data/subagents/sequence-hybrid-dl/papers_and_sources.md.

**Status**: Educational card with runnable toy. Ready for experiments.
