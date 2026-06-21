# Hybrid & Mixture Architecture Ideas for Fraud Pipelines

**Purpose**: Specific, actionable architecture sketches for combining generative AD/representation with classifiers or end-to-end hybrids. Focused on fraud use-case (structured tx + imbalance + KYA/KYE relational + behavioral seq + logs extensibility). Includes high-level pseudocode/sketch (PyTorch/XGB style), integration points, when to use, toy impl notes. Complements model_notes + roadmap. All inspired by verifiable papers (Vallarino 2025 MoE, Ding 2023 VAE-GAN, Bekkaye 2025 generative+classif, An&Cho VAE, Zong DAGMM, diffusion aug papers, Chen hybrids).

**Core Principles**:
- Pure generative: Novel fraud + synth data.
- Mixtures: Novel + known; imbalance handling; adaptive.
- Gating/cascade for production (cost/latency).
- Reuse FE (velocity + KYA aggs) from classical.
- Eval: PR-AUC + cost + synth fidelity.

## 1. Simple Pipeline: Generative Features / Scores + Classifier (Most Practical Starter)
**Idea**: Train unsup gen on (mostly) normal or full data -> extract recon prob/error/energy/latent -> concat engineered feats -> XGBoost/LightGBM (cost-sensitive).
**Why**: Easy, modular, leverages XGB strength on tabular + gen for novel signal. Common pattern (Chen AE-LSTM; classical IF+XGB extended; Bekkaye variants).

**Sketch (Pseudocode)**:
```python
# Train phase (normal-heavy or all)
ae = VAE(latent_dim=16)  # or DAGMM, standard AE
ae.fit(normal_txns)  # or all, w/ masking known fraud if avail

# Feature extraction
def extract_gen_features(txns, ae):
    latents, recon_probs, errors = ae.encode_recon(txns)  # VAE recon prob per An&Cho
    return concat([engineered_feats(txns), latents, recon_probs, errors])  # + DAGMM energy

X_train_hybrid = extract_gen_features(train_txns, ae)
xgb = XGBClassifier(scale_pos_weight=neg/pos, eval_metric='aucpr')
xgb.fit(X_train_hybrid, y_train)

# Inference (real-time candidate or all)
scores = xgb.predict_proba(extract_gen_features(new_txns, ae))[:,1]
# Or cascade: if ae.recon_prob(new) < thresh: detailed xgb
```

**Extensions**:
- DAGMM: Use energy instead of recon prob.
- cVAE: Cond on KYA (account_age, entity_risk) during fit/infer.
- LSTM-VAE: For seq window per user (last 10 txns behavior).
- Diffusion/CTGAN: Generate synth fraud samples; oversample train set before XGB (no latent extract needed).

**Fraud Fit**: Structured tx (tabular feats + latents); imbalance (synth or tolerant AD scores); KYA (cond or extra cols); novel (low prob flags before XGB). Logs: seq variant.

**When**: Labelled data available but novel fraud concern. Low extra latency (precompute or fast AE).

**Toy Notes**: PyTorch VAE (standard ELBO) on Kaggle subsample + XGB. Compare PR-AUC: base XGB vs +latents vs +recon.

## 2. VAE-GAN / End-to-End Generative Hybrid (Ding-style)
**Idea**: Joint VAE (prob latent + recon) + GAN (adversarial sharpness) or improved VAE-GAN. Synth + recon for AD or aug.
**Mech** (from Ding 2023 + general): Shared or dual components; combined loss (ELBO + adv + recon).

**Sketch**:
```python
class VAEGAN(nn.Module):
    # encoder, decoder (VAE), generator/discriminator (GAN aspects)
    def forward(self, x, cond=None): ...  # cVAE cond on KYA

model = ImprovedVAEGAN()
model.fit(train)  # joint

# For AD: recon_prob or disc mismatch or hybrid score
# For aug: sample from decoder/G conditioned on fraud flag or metadata
synth_fraud = model.generate(num_fraud_samples, cond=high_risk_profile)
```

**Fraud Fit**: CC fraud (Ding recall gains); seq via LSTM version (Niu 2020). Good for both novel (AD component) and known (synth quality).

**Pros/Tradeoff**: Better samples than pure VAE; more stable than pure GAN. Complex to train.

**Toy**: Basic VAE + adversarial term on decoder output.

## 3. MoE Hybrid (Vallarino 2025 Exemplar - Recommended Advanced)
**Idea**: Gating network dynamically weights/routs to experts specialized for fraud dimensions: RNN/LSTM (seq behavior/velocity), Transformer (feature interactions), AE (recon anomaly/novel).
**Why**: Adaptive to fraud type (burst seq vs structural anomaly vs coordinated). High perf reported (98+% on synth CC).

**Architecture Sketch**:
- Inputs: tx feats + KYA aggs + optional seq window + log embeds.
- Gating: small MLP or Trans -> softmax weights (or top-k).
- Experts:
  - Expert1 (RNN): LSTM/GRU on seq (user history or tx window) -> seq anomaly score.
  - Expert2 (Trans): Self-attn or small encoder on flattened/feat set -> interaction score.
  - Expert3 (AE/VAE): Recon prob/energy -> outlier score.
- Output: weighted sum or concat + final head (or direct gate for routing to review/sup).
- Optional: Add graph expert (KYA links).

**Pseudocode**:
```python
class FraudMoE(nn.Module):
    def __init__(self):
        self.gate = nn.Sequential(nn.Linear(d_in, 32), nn.Softmax(dim=-1))
        self.expert_rnn = LSTMExpert(...)
        self.expert_trans = TransformerExpert(...)
        self.expert_ae = VAEExpert(...)  # or DAGMM head
        self.head = nn.Linear(3, 1)  # or use gate weights directly

    def forward(self, x_tab, x_seq, cond_kya):
        weights = self.gate(concat(x_tab, cond_kya))
        s1 = self.expert_rnn(x_seq)
        s2 = self.expert_trans(x_tab)
        s3 = self.expert_ae(x_tab).energy_or_prob  # or recon
        combined = weights * stack([s1,s2,s3])  # or concat + head
        return sigmoid(head(combined))  # or weighted scores

# Train joint (or staged pretrain experts)
moe.fit(...)
```

**Fraud Fit**: CC (Vallarino); novel (AE expert) + known (others). KYA via cond/gate input. Logs via seq or extra expert. AML/KYC align (per paper).

**When**: Heterogeneous fraud patterns; want modularity.

**Toy**: 2-3 experts (MLP + small LSTM + AE) + linear gate on synthetic data.

## 4. Generative Augmentation Pipeline (Diffusion / CTGAN + Ensemble, Bekkaye-style)
**Idea**: Use diffusion or cGAN to generate high-quality synth fraud; augment train; + IF or other AD prefilter; train ensemble (XGB + RF + LGBM).
**From Bekkaye 2025**: VAE/GAN/DM + resampling + IF + classifiers; DM + XGB + SMOTE often tops for insurance claims.

**Sketch**:
```python
# 1. Synth
diffuser = FraudDiffusionModel()  # or CTGAN
synth_fraud = diffuser.generate_fraud(num=desired, prior=nonfraud_dist, cond=kya_profile)

# 2. Augment + optional AD gate
X_aug = concat(real, synth_fraud)
y_aug = ...
# Optional: IF or DAGMM prefilter high-susp on aug or real

# 3. Ensemble
models = [XGB(..., scale_pos), LGBM(...), RF(...) ]
# Stack or average or meta XGB on probs
# Or IF on top for final anomaly boost
```

**Fraud Fit**: Insurance (Bekkaye), CC txn (Pushkarenko 2024, Roy FraudDiffuse 2024). Realistic samples address imbalance better in some cases.

**Pros**: Boosts known-pattern recall w/o changing inference (aug offline).
**Cons**: Synth may not generalize if drift.

**Toy**: Use sdv CTGAN or simple DDPM proxy + XGB; measure lift.

## 5. Cascade / Layered Production Pattern (Recommended Overall)
1. Tier 0/2: Rules + IF (fast, high-recall gate; volume reduction).
2. Gen layer: VAE/DAGMM or diffusion score or f-Ano on candidates (novel filter).
3. Hybrid/MoE or sup: Full features + gen latents/scores -> XGB or MoE.
4. Selective: Top uncertain/high-risk -> graph (TGN) or LLM RAG (logs + KYE + subgraphs) review.
5. Fusion: Late score blend (weighted or meta-learner).

**KYA/KYE Ext**: All cond inputs or extra tabular cols; promote to graph experts/links.
**Logs Unstruct**: Seq experts or cond; RAG chunks for LLM tier.
**Imbalance**: Synth at aug stages + tolerant AD + cost loss.

## 6. Other Ideas
- **End-to-End AE + Sup multi-task**: AE recon loss + classif loss (joint).
- **Graph-aware gen**: Graph VAE or cond diffusion on KYE graph (cross GNN).
- **Continual**: Replay synth or EWC on VAE/MoE for drift.
- **XAI Integration**: SHAP on XGB head; recon feature attribution (which dims drive high error); MoE expert activation viz.

## Implementation Roadmap for Toys/Experiments
1. Baseline: Kaggle-like synth or subsample + FE + XGB.
2. Add VAE (PyTorch minimal) -> latents + recon_prob -> XGB.
3. Add CTGAN aug or simple diffusion note.
4. Prototype DAGMM (follow Zong: compression + estimation nets).
5. Simplified MoE (gating + 2 experts).
6. Full pipeline ablations + metrics (PR-AUC, cost).
7. Viz: latent plots, score hists, gating.

**Deps**: torch, xgboost, scikit-learn, (sdv for CTGAN), numpy/pandas.
**Caveats**: Synth data quality first; temporal splits; no prod deployment w/o gating + monitoring.

These sketches directly support roadmap experiments and Model Cards (runnable examples + diagrams of flow: data -> FE/cond -> gen -> mixture -> score).
See findings_summary for top model recs.
