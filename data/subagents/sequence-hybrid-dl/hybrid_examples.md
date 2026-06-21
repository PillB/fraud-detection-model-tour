# Hybrid Examples: Specific Mixture Architectures for Transaction Fraud (Seq + Tabular + Relational + Generative)

**Focus**: Concrete architectures for structured tx + KYA/KYE (as feats/seq events/graph) + behavioral seq + logs-as-seq. Emphasis on 2025+ promising mixtures (esp MoE + AE). Mechanisms, pseudocode sketches (functional PyTorch-style), fraud modeling, integration patterns. Tie to Chen 2025 (AE-LSTM, ResNeXt-GRU, Trans hybrids) + Vallarino 2025 MoE.

All examples assume:
- Input: Tabular tx features (numeric + cat KYA/KYE aggs/flags), per-user seq of recent txns (or log events), optional graph snapshot.
- Extreme imbalance handled via focal loss / class weights / GAN/VAE synth / cost-sensitive.
- Output: Fraud score (prob or anomaly score) + optional attn/recon for explain.

---

## 1. Core Promising Mixture: MoE (RNN + Transformer + AE) — Vallarino 2025 Exemplar
**Paper**: Vallarino, D. (2025). Advancing Fraud Detection with Hybrid AI: A MoE, RNN, and Transformer-Based Approach... Journal of Information Economics. 98.7% acc / 94.3% prec / 91.5% rec on high-fidelity synthetic CC fraud (outperforms standalones + classical ML).

**Architecture Overview** (3 experts + gate):
- **Input**: Tx features (incl KYA aggs) + seq of past N txns (amount, t-delta, merchant, KYE flags, device etc.) or log seq.
- **Gating Network**: Lightweight MLP or small Trans on pooled input → softmax weights (or top-k sparse).
- **Expert 1: RNN (LSTM/GRU/BiLSTM)**: Processes seq → captures behavioral evolution (e.g. velocity ramp, KYA link change patterns).
- **Expert 2: Transformer Encoder**: Self-attn on seq + feature tokens → high-order interactions (relational + global context).
- **Expert 3: Autoencoder (or VAE)**: Encodes full input (tabular+seq flattened or dual) → recon error as anomaly expert (novel patterns, drift).
- **Fusion**: Weighted sum of expert outputs (classif logits or scores) or concat + final head. Joint or staged loss (classif + recon).
- **Fraud Modeling**: RNN detects seq anomalies (sudden behavior shift); Trans relational (KYA ring-like in features); AE high recon = atypical (new fraud type). Gate learns when to trust each (e.g. AE heavy for novel).

**Pseudocode Sketch (PyTorch-like, functional)**:
```python
import torch
import torch.nn as nn

class MoEHybrid(nn.Module):
    def __init__(self, feat_dim, seq_len, hidden=128, num_experts=3):
        super().__init__()
        self.gate = nn.Sequential(nn.Linear(feat_dim + hidden, num_experts), nn.Softmax(-1))
        # Expert 1: RNN seq
        self.rnn_expert = nn.LSTM(feat_dim, hidden, batch_first=True, bidirectional=True)
        # Expert 2: Trans (simplified encoder)
        self.trans_expert = nn.TransformerEncoderLayer(d_model=feat_dim, nhead=4)
        # Expert 3: AE (encoder-decoder for recon)
        self.ae_encoder = nn.Sequential(nn.Linear(feat_dim*seq_len, hidden), nn.ReLU(), nn.Linear(hidden, 32))
        self.ae_decoder = nn.Sequential(nn.Linear(32, hidden), nn.ReLU(), nn.Linear(hidden, feat_dim*seq_len))
        self.head = nn.Linear(hidden * 3, 1)  # or per-expert heads + fuse

    def forward(self, tabular_x, seq_x):  # seq_x: [B, T, F]
        # Gate on pooled/tabular + last seq state
        pooled = torch.cat([tabular_x, seq_x.mean(1)], -1)
        gate_w = self.gate(pooled)  # [B, 3]

        # RNN expert
        rnn_out, _ = self.rnn_expert(seq_x)
        rnn_feat = rnn_out[:, -1, :]  # last or pool

        # Trans expert
        trans_out = self.trans_expert(seq_x.permute(1,0,2)).permute(1,0,2)
        trans_feat = trans_out.mean(1)

        # AE expert (recon err as feat)
        flat_seq = seq_x.reshape(seq_x.size(0), -1)
        latent = self.ae_encoder(flat_seq)
        recon = self.ae_decoder(latent)
        ae_err = ((flat_seq - recon)**2).mean(-1, keepdim=True)  # anomaly signal
        ae_feat = torch.cat([latent, ae_err], -1)  # or use err directly

        # Fuse (example: weighted or concat)
        combined = torch.stack([rnn_feat, trans_feat, ae_feat.expand(-1, rnn_feat.size(-1))], 1)
        fused = (gate_w.unsqueeze(-1) * combined).sum(1)
        score = torch.sigmoid(self.head(fused))
        return score, {'gate': gate_w, 'ae_recon_err': ae_err}  # for explain
```
**Integration**: Pre-filter w/ rules/IF; feed score to ensemble meta; attn/recon_err as SHAP features or human review signal. KYA: include as seq tokens or extra tabular.

**Pros for Domain**: Addresses Chen-noted multi-faceted (seq + interactions + novel). 2025 paper emphasizes AML/KYC alignment.

---

## 2. LSTM + AE (or VAE) Hybrid (Chen 2025 + Common 2023-25)
**Refs**: Chen AE-LSTM [61]; "Auto-Encoder and LSTM-Based Credit Card Fraud Detection" (2023); BiLSTM + Attn CAE (2025).

**Architecture**:
- AE (dense or conv) on individual tx or window for recon/normal manifold.
- LSTM on seq of (tx feats or AE latents).
- Joint: AE recon loss + LSTM classif loss (or LSTM on AE-encoded seq).
- Variant: VAE for probabilistic latent + KL.

**Fraud Modeling**: High AE recon error flags structural anomaly; LSTM detects temporal deviation in latent space or raw seq. Combined score.
**Sketch**:
- Encoder (tabular tx or per-timestep) → latent.
- LSTM( seq of latents ) → classif head.
- Decoder for recon.
- Loss = classif + beta * recon ( + KL for VAE).

**Example Perf Tie-in**: Superior to standalone LSTM (Chen). Good for logs-as-seq + tx.

**KYA Fit**: KYA aggs in tx input; relational changes as special seq events.

---

## 3. CNN-LSTM (or ResNeXt-GRU) for Local + Temporal
**Refs**: 2024-2025 blockchain/CC papers; Chen ResNeXt-embedded GRU (RXT-J) outperforming BERT/ANN/LR.

**Architecture**:
- 1D-CNN (or Res blocks) over short seq windows or feature channels for local patterns (e.g. amount patterns).
- LSTM/GRU on CNN feature maps over time.
- Head for fraud classif.

**Fraud**: Local "texture" of fraud (testing bursts) + sequence evolution.
**Sketch** (high-level):
```python
cnn = nn.Sequential(Conv1d(...), ... )  # on seq or feat
lstm = nn.LSTM(cnn_out_channels, ...)
out = lstm(cnn(seq_x))[0][:, -1]
```
**Relevance**: Velocity as local; KYE patterns.

---

## 4. Temporal Transformer + Conditional Tabular GAN (Generative-Seq Cross)
**Refs**: Chen, J. (2026) "Temporal Transformer with Conditional Tabular GAN for Credit Card Fraud Detection" (MDPI); Zhao SAGAN (2024 self-attn GAN + LSTM refs).

**Architecture**:
- CTGAN (or similar) trained on tx (conditioned on fraud or time) to synth realistic rare fraud samples.
- Time-aware Transformer encoder on real + synth seq (pos encoding + time deltas).
- Classifier (or anomaly head) trained on augmented seq data.
- Optional: VAE component in latent space.

**Fraud Modeling**: GAN augments minority seq patterns (novel fraud); Trans models long-range + temporal in augmented data. High attn or recon (if hybrid) flags.
**Integration Pattern**: Generate synth → train Trans seq model → deploy w/ real-time seq buffer.

**Perf Tie-in**: Addresses Chen imbalance (GAN/VAE synth key theme).

---

## 5. Other Notable Hybrids (Chen + Lit)
- **Transformer + LOF / RF** (Chen): Trans for deep feats/extraction → classical anomaly/ensemble for final (reduces FP on imbalance).
- **ResNeXt + GRU (RXT-J)**: Feature extraction (ResNeXt) + seq (GRU); outperforms pure DL/classical per Chen.
- **CatBoost + DNN**: Trees for cats/imbalance + DL for raw patterns.
- **SAGAN + BiLSTM**: Self-attn GAN for generation + recurrent detector.
- **VAE + Transformer (two-stage)**: VAE anomaly stage → Trans classif on flagged.

**Cascade / Layered (Production Pattern)**: Rules/IF (high-recall) → DL seq/hybrid (MoE or LSTM-AE) on subset → GNN or Trans on relational flagged → selective LLM/RAG over logs + seq summary + KYA (cross ensembles/LLM agent).

---

## Representation Patterns for KYA/KYE + Logs + Seq
- **As Tabular Feats** (for MLP/CNN/TabTrans/KAN): Account age, #linked entities (KYA), prior flags, employee risk (KYE), device/IP shared counts. Velocity/aggs over windows (Bahnsen-style).
- **As Seq Events**: Append to user txn seq: "KYA_link_added", "KYE_access_event", time-delta. BiLSTM/Trans attend to them.
- **As Graph Nodes/Edges**: KYA emergency contacts / KYE relations (cross graph-temporal subagent); seq models run on temporal paths or edge seq.
- **Logs as Seq**: Parse to event tokens (type, time, user, outcome) → LSTM/Trans/VAE recon or classif. Fuse w/ tx seq (multi-modal head or shared latent).
- **Cold-start**: Default to tabular MLP/TabTrans or global stats; seq models use short-history fallbacks or meta-learn.

**Training Tips (Imbalance/Drift/Real-time)**:
- Loss: Focal + recon term; cost-sensitive (FN cost >> FP).
- Synth: CTGAN / VAE conditional on time/KYA for rare.
- Continual: Replay buffer or memory (like TGN) for drift.
- Efficiency: Sparse MoE, distilled student Trans, GRU over LSTM, truncated seq (recent N + summary feats).
- Eval: PR-AUC, Recall@K (top suspicious), cost savings (Bahnsen), F1 w/ threshold tuned to ops.

**Roadmap Tie**: These as Tier 3.5-5 expansions (seq DL, tabular Trans, seq-gen hybrids, MoE). See roadmap_contribution.md.

**Sources**: Vallarino 2025 primary for MoE; Chen 2025 for AE-LSTM/ResNeXt-GRU/Trans+LOF; 2024-26 specific papers.

---
*Functional sketches; extend w/ full data loaders (synthetic tx seq gen). Last updated 2026-06-20.*
