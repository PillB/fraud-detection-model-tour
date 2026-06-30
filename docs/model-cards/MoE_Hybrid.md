# Model Card: Mixture of Experts (MoE) Hybrid for Fraud Detection

## Origin
- Original MoE concept: Jacobs et al. (1991) "Adaptive Mixtures of Local Experts".
- In fraud: Recent application in Vallarino 2025 "Detecting Financial Fraud with Hybrid Deep Learning: A Mix-of-Experts Approach" (arXiv:2504.03750) — MoE combining RNN (seq), Transformer (interactions/KYA), AE (anomaly recon) for credit card fraud, achieving high metrics on realistic synth data.
- Complements classical ensembles (Tier 6) and DL (this expansion).

## How It Works
MoE uses a gating network to dynamically route inputs to specialized "expert" sub-models.

1. **Gating Network**: Softmax or top-k router takes input features (tx + KYA) and outputs weights for experts.
2. **Experts**: Specialized models, e.g.:
   - Expert 1 (RNN/LSTM): Captures behavioral sequences/velocity.
   - Expert 2 (Transformer or MLP): Models high-order feature interactions and KYA/KYE flags.
   - Expert 3 (AE): Computes reconstruction error for novel anomaly detection.
3. **Output**: Weighted sum of expert predictions (class prob or score) or late fusion.
4. **Training**: End-to-end or staged; often with load balancing loss for experts.
5. **In Fraud**: Routes "seq-heavy" tx to seq expert, "relational" to interaction expert, "atypical" to AE expert. Handles mixed fraud types better than single model.

**Mixture Power**: Combines strengths of seq DL + tabular DL + generative AD in one adaptive system.

## Pros
- Adaptive: Different experts for different fraud patterns (novel vs known, seq vs relational).
- Scalable: Sparse activation (only some experts used).
- Strong on complex data: Reported 98.7% acc / 91.5% rec on synth realistic fraud (Vallarino 2025).
- Interpretable routing: See which expert fired for a tx.

## Cons
- Complexity: More hyperparameters (num experts, router).
- Training: Can have expert collapse if not balanced.
- Latency: Slightly higher than single model, but sparse MoE mitigates.
- Data hungry for good routing.

## Assumptions
- Input space can be partitioned into regions where different experts excel.
- Sufficient diversity in training data for specialization.

## Limitations
- Overkill for simple cases (use classical first).
- Harder to debug than single XGB or IF.
- For KYA/KYE: Needs good representation in features or experts.
- Real-time: Gate with fast model (IF) first.

**Fraud-Specific Fit**: Excellent for mixed fraud (collusion rings + velocity bursts + novel amounts). KYA as features or in interaction expert. Logs as additional seq input to RNN expert. Use in layered pipeline after classical gate.

## Runnable Example (Production Note)
See companion: experiments/toy_moe_hybrid.py. For production, implement learned gating with load-balancing loss and monitor expert utilization.

Simplified: 3 "experts" (RF, GBT, IF scores) with simple feature-based gate (e.g., if high velocity -> seq expert).

Full example reports metrics on synthetic data.

## Conceptual Visualization
- Gating heatmap: tx features vs expert activation probabilities.
- Expert contribution bar: For a flagged tx, % from each expert.
- Decision tree of router if simple gate.

## References
- Vallarino 2025 (MoE hybrid for fraud).
- Jacobs 1991 (original MoE).
- Chen 2025 survey (hybrids).
- Full in data/subagents/ensembles-sota-llm/ and deep-generative-models/.

**Production Note**: Core mixture example for roadmap. Tested runnable script.
