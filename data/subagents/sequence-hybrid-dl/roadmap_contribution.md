# Roadmap Contribution: Expanding DL Sequence, Attention/Transformers, Hybrids & Generative Mixtures

**Context**: This sub-agent research (STORM) contributes to overall Model Tour roadmap (basic → SOTA per AGENT_STATE.md + current docs/roadmap/roadmap.md). Focus: sequence/hybrid DL for fraud on structured tx + relational KYA/KYE + behavioral seq + logs-as-seq. Complements classical (Tier 1-2), deep unsup AE (Tier 3), GNN/TGN (Tier 4-5), ensembles/SSL/LLM (Tier 6-8).
**Goal**: Propose new tiers/subsections, integration patterns, model card recommendations. Exhaustive taxonomy (see dl_model_taxonomy.md) as backbone. Cite Chen 2025 (arXiv:2502.00201), Thivaios 2026, Vallarino 2025 MoE, etc.

**Current Roadmap Gaps Identified** (from reading roadmap.md):
- Strong on classical/tabular, basic AD (IF/AE), GNN (static + TGN), ensembles/cascades, SSL, LLM/RAG.
- Under-represents: Pure sequence DL (LSTM/Trans beyond graph-temporal), specialized tabular DL (TabTransformer, KANs, 1D-CNN/ResNet), advanced seq hybrids (CNN-LSTM, LSTM-AE), generative-seq crosses (VAE/GAN+Trans/LSTM), MoE architectures, Capsule/EBM.
- Seq/behavioral: Mostly implicit in TGN or FE (velocity); explicit seq modeling + logs underrepresented.
- Generative mixtures: Tier 3 AE/VAE noted but limited seq/hybrid detail (tie to sibling deep-generative-models agent).
- Taxonomy: No exhaustive DL family hierarchy yet.

## Proposed Roadmap Expansions

### Insert / Enhance Tier 3: Deep Unsupervised / Representation (expand w/ seq)
- Keep AE/VAE basics.
- **Add 3.x Sequence-Aware Representation**:
  - LSTM-AE, VAE seq (LSTM-VAE, Trans-VAE).
  - Mechanism: Recon error on tx seq or log events.
  - Hybrids: AE pre-filter + downstream classif (Chen 2025 AE-LSTM superior).
  - KYA/Logs: Embed KYA events or log seq in latent space.
  - Refs: Chen 2025, AE-LSTM papers 2023+.

### New Tier 3.5 or Sub-Tier: Supervised Tabular DL Classifiers (Beyond Trees)
- **MLP/Dense, 1D-CNN, ResNet-tabular, KANs**.
- Why: Handles non-linear + mixed types w/ less FE than classical; KAN for interpret/theory; CNN local patterns.
- Data fit: Tabular tx + flattened KYA/KYE (aggs, flags, risk scores).
- Pros: Fast, scalable. Cons: Needs imbalance handling; misses native seq.
- Examples: TabTransformer-adjacent or direct MLP/CNN in Chen.
- **Placement**: After classical sup (Tier 1), parallel or before pure seq. Or "Tabular DL" sub in deep.
- Integration: Embeddings as features to XGB (common pattern).

### New / Expanded Tier 4.x: Sequence & Recurrent DL Models (Behavioral + Logs)
- **Core Addition** (distinct from graph-temporal Tier 5):
  - LSTM, GRU, Bi-LSTM, stacked RNNs for per-user txn histories or log event seq.
  - Mechanism: Hidden state summarizes behavioral trajectory; fraud = classif logit or next-pred/recon deviation.
  - **Why Critical**: Fraud is inherently sequential (velocity, ramp-up, deviation from personal history). Chen 2025: LSTM sharpest growth due to "sequential nature of fraud datasets".
  - KYA/KYE: As event tokens in seq (e.g. "linked account added") or attributes.
  - Logs: Native (event streams for insider fraud or mule detection).
  - Pros/Cons (per research): Strong drift handling; real-time via streaming updates or truncated windows. Limits: Cold-start, compute seq.
  - SOTA: BiLSTM-BiGRU ensembles (Ghrib 2024 ~89%+); attention variants.
  - Placement: After tabular DL; before or parallel GNN. "Behavioral Sequence Modeling" subsection.
- **Sub**: Time-aware encodings, bidirectional for batch analysis.

### Enhance Tier 4-5: Attention & Transformers (Tabular + Seq + Hybrids)
- **Add**:
  - Self-attn encoders for tx seq.
  - TabTransformer / FT-Transformer / Structured Data Trans for tabular + KYA cats (robust contextual embeddings; 2024-2025 fraud apps w/ cost-sens).
  - Temporal Transformer (time encoding + attn).
  - MoE with Transformers.
- Mechanism: Parallel attn scores highlight key txns/features/relations in seq; classif or hybrid.
- Why: Long-range deps (Chen); interpret via attn; tabular strength (TabT); parallelism for real-time.
- KYA Fit: Excellent for categorical relational (contextualized flags).
- Placement: New "Tabular & Sequence Transformers" sub-tier under or after GNN (or dedicated Tier 4.5).
- Overlap w/ graph: Graph Trans (FraudGT) cross-ref.
- Refs: Huang 2020 TabT + 2024-25 fraud; Chen 2025 Trans emphasis; Vallarino 2025.

### Expand Tier 5 or New Tier 5.5: Hybrids, MoE & Generative-Sequence Mixtures
- **Core**:
  - CNN-LSTM (local + temporal).
  - Seq + AE/VAE (LSTM-AE, Trans-VAE; Chen 2025).
  - Transformer + GAN/VAE (SAGAN, Temporal Trans + CTGAN 2026).
  - **MoE Hybrids (RNN + Transformer + AE)**: Vallarino 2025 flagship. Experts: RNN (behavioral seq), Trans (interactions/KYA), AE (novelty recon). Gating. High perf on synth; modular for drift/imbalance.
  - LSTM-VAE-GAN / similar mixtures.
- **Why Promising**: Addresses multi-faceted fraud (Chen themes: seq + relational + novel patterns + imbalance via gen). Layered experts or fusion.
- Integration w/ Generative Sibling: Seq model + VAE/GAN/Diffusion for latent seq modeling + synth rare behavioral patterns + joint training.
- Placement: "Advanced Hybrids & MoE" after pure seq/Trans. Explicit "Generative Mixtures (VAE/GAN/Diffusion + Sequence)" subsection (ties sibling).
- Cross Tier 6 Ensembles: Inject DL seq/hybrid scores or embeddings as features; cascade (classical gate → DL seq/MoE → graph/SSL).
- SOTA Ex: Vallarino 98.7%/91.5% rec; Chen hybrids +5-15% lifts.

### Tier 7-8 Enhancement: SSL/Semi on Seq + Multimodal
- Pretext on tx seq (masked prediction like BERT-seq); contrastive user histories.
- Multimodal: NLP Trans on logs + seq DL fusion; KYA text profiles in RAG + seq embeddings.
- Foundation seq models (TransactionGPT refs in current roadmap).

### Cross-Cutting Additions (All Tiers)
- **Data Modalities Section** (inspired by Thivaios 2026 taxonomy):
  - Tabular tx + KYA/KYE flattened.
  - Behavioral seq (primary for this agent).
  - Relational seq/graph (cross GNN).
  - Logs as seq/events or text.
- **Evaluation**: Always PR-AUC / Recall@K / cost (vs ROC-AUC). Drift monitoring.
- **Implementation Path** (update current "Recommended"):
  1. Feature-eng XGB + IF.
  2. Add tabular DL (MLP/TabTrans/KAN) or seq (LSTM on history).
  3. Hybrids (CNN-LSTM or LSTM-AE).
  4. MoE / Trans seq or seq-gen.
  5. Full layered (incl TGN/GNN + selective LLM on seq summaries).
- **Toy Data**: Must include seq generator (per-user ordered tx + KYA events + log snippets). See experiments/synthetic_fraud_data.py extensions.
- **Website / Model Cards**: Handholding "seq vs static" (why history matters for fraud ramp-up); attn visualizations; comparisons (LSTM AUC delta vs MLP); MoE expert activation demo. Cards per model_notes.md (origin, toy PyTorch seq example, pros/cons, KYA notes).

## Top Recommendations for Model Cards (docs/model-cards/)
From exhaustive research + taxonomy:
1. **Transformer Seq / Temporal Trans** (self-attn for long behavioral seq + time encoding). Strong for dependencies + interpret.
2. **VAE (or LSTM-VAE / Trans-VAE)**: Recon + generative for imbalance/novel. Ties generative.
3. **MoE Hybrid (RNN + Trans + AE)**: 2025 SOTA exemplar; specialization for complex fraud.
4. **LSTM (or BiLSTM + Attn) variants**: Foundational seq; efficient; ubiquitous in Chen.
5. **TabTransformer**: Tabular + KYA cats strength.
6. **KANs** (with caveats): Emerging for tabular/seq AD.
7. **CNN-LSTM Hybrids**: Local-temporal.
8. **Capsule (RMGACNet)**: For relational rings.

**Integration Patterns**:
- **Embeddings Cascade**: DL seq/Trans produce user-behavior embeddings → feed XGB/ensemble or GNN.
- **Score Injection**: Recon err / attn max / MoE gate as extra feature.
- **Cascaded Pipeline** (production best per ensembles agent): Fast gate (rules/IF/tabular MLP) → seq DL or MoE on suspicious → relational GNN/Trans → LLM review over seq logs + KYA evidence.
- **Pretrain + Fine-tune**: Unlabeled tx seq/logs for seq Trans/AE/VAE → fine-tune w/ labels or hybrid.
- **Multi-Rep Fusion**: Tabular feats (KYA) + seq input (behavior) + graph snapshot (relations) in hybrid/MoE or late fusion.
- **Real-time/Drift**: Memory update (RNN state or Trans continual), sliding window + synth replay, monitoring recon drift.

## Quantitative / Evidence Highlights (for Roadmap)
- Chen 2025: 57 papers; LSTM growth leader; imbalance in 48/57; hybrids common; PR-AUC recs; credit card dominant.
- Vallarino 2025 MoE: 98.7% acc / 91.5% rec synth (strong vs baselines).
- TabTrans fraud apps: Gains on imbalanced/small data w/ cost-sens.
- BiLSTM ensembles: ~89%+ reported.
- Cross-ref graph: TGN ~0.77 AUC DGraph (temporal seq+graph).
- General: Hybrids + synth (GAN/VAE) critical for <0.2% fraud.

## Limitations / Honest Caveats (to include in roadmap)
- Many SOTA on Kaggle/synth (real prod data proprietary; FE often dominates).
- DL data/compute hungry vs trees; interpret post-hoc needed (attn helps).
- Drift/adversarial: Seq/hybrids better but not immune; require monitoring/active learning.
- Real-time: Long seq or full Trans needs truncation/distill/sparse MoE.
- KYA/logs integration: Strong in theory; privacy/storage challenges for full histories.
- See findings_summary.md + limitations.md for full.

**Sources Feeding This**: Chen 2025, Thivaios 2026 taxonomy, Vallarino 2025 MoE, TabTrans fraud papers 2024-25, KAN 2024-25, seq hybrids 2023-26, safe-graph, cross subagents (graph for TGN overlap; classical for FE; ensembles for cascades).
**Action for Main Roadmap**: Update tiers 3-5 + add "DL Families Taxonomy" appendix or section (link dl_model_taxonomy.md). Enrich sources list.

**Last updated**: 2026-06-20. Aligns with full subagent outputs.
