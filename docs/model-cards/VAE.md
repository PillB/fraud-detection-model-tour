# Model Card: Variational Autoencoder (VAE) for Anomaly Detection in Fraud

## Origin
- Kingma & Welling (2013-2014) for the core VAE (ELBO optimization with latent Gaussian prior).
- An & Cho (2015) "Variational Autoencoder based Anomaly Detection using Reconstruction Probability" — the key paper adapting VAE to fraud/anomaly via probabilistic reconstruction score instead of raw error.
- Widely used in fraud surveys (Chen 2025 SLR of 57 papers) for tabular/seq data; extensions in Ding 2023 (VAE-GAN for CC), Niu 2020 (LSTM-VAE-GAN), Vallarino/Bekkaye 2025 hybrids.

## How It Works
VAE is a generative model that learns a probabilistic latent representation of "normal" data.

1. **Encoder**: Neural net q_φ(z|x) approximates posterior as Gaussian (outputs μ, logσ² for latent z).
2. **Reparameterization**: z = μ + σ * ε (ε ~ N(0,1)) for differentiable sampling.
3. **Decoder**: p_θ(x|z) reconstructs x from z.
4. **Training** (on mostly normal data): Maximize ELBO = E[log p(x|z)] - KL(q(z|x) || p(z)) where p(z)=N(0,I). Balances reconstruction fidelity and latent regularization.
5. **Anomaly Scoring (An & Cho)**: Use reconstruction *probability* p(x) ≈ ∫ p(x|z) p(z) dz (Monte Carlo average over samples from posterior). Low probability = anomaly (better than ||x - x'|| as it accounts for variability in latent).
6. **In Fraud Context**: Train on legit transactions (or with light contamination). High recon prob deviation or latent outlier flags novel fraud. Latents can be fed to downstream classifiers (hybrid).

**Mixture Extension**: VAE latents/recon-prob as features to XGBoost; or end-to-end VAE-GAN; or LSTM-VAE for seq behavior.

## Pros
- Probabilistic: Better calibrated scores than deterministic AE.
- Generative: Can synthesize realistic "normal" or (conditioned) fraud samples for imbalance.
- Unsupervised/Semi: Excellent for novel/zero-day fraud (no labels needed for base training).
- Latent Features: Powerful representations for hybrids or visualization.
- Handles high-dim tabular after proper encoding.

## Cons
- Posterior collapse risk (uninformative latents) — mitigated by beta-VAE or careful tuning.
- Training instability/sensitivity to hyperparameters (latent dim, beta, architecture).
- Thresholding/calibration needed (use validation normal vs known fraud).
- Compute heavier than trees/IF for inference.
- Assumes data generated from latent + noise (may not perfectly fit discrete/categorical tx features without good embeddings).

## Assumptions
- "Normal" data lies on a lower-dimensional manifold well-captured by the decoder.
- Latent prior is standard normal (or chosen); anomalies deviate in reconstruction probability or latent space.
- Training data is mostly clean (low contamination).

## Limitations
- On extreme imbalance: May flag rare legit behavior as anomalous unless FE (velocity + KYA) or hybrids used.
- Relational/Graph: Native tabular/seq; for KYA/KYE use as conditional inputs or flattened features (or graph-VAE extension).
- Drift: Requires periodic retraining or continual learning; synth data helps simulate novel patterns.
- Interpretability: Latents + recon can be inspected, but less direct than tree importance or attn.
- Real-time: Feasible but heavier than IF/XGB; best as part of cascade (gate first).
- Benchmarks: Strong on Kaggle CC proxies and synth; real banking results often in hybrids.

**Fraud-Specific Fit**: Captures unknown fraud patterns via manifold deviation. Synth generation directly addresses 0.1% fraud rates. Works well with structured tx features + behavioral seq (LSTM-VAE). Combine with classical (IF scores) or graph for KYA rings. Used in production-like insurance/banking hybrids (Bekkaye 2025, Ding 2023).

## Toy Example (Functional Python)
See companion script: experiments/toy_vae.py (requires PyTorch; pip install torch torchvision).

Simplified excerpt (runnable with torch):

```python
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.preprocessing import StandardScaler
import numpy as np
# Assume tx_data from synthetic_fraud_data.py (normal only for train)
# ... (full script in experiments/toy_vae.py)

class VAE(nn.Module):
    def __init__(self, input_dim, latent_dim=8):
        super().__init__()
        self.encoder = nn.Sequential(nn.Linear(input_dim, 64), nn.ReLU())
        self.fc_mu = nn.Linear(64, latent_dim)
        self.fc_logvar = nn.Linear(64, latent_dim)
        self.decoder = nn.Sequential(nn.Linear(latent_dim, 64), nn.ReLU(), nn.Linear(64, input_dim))
    
    def encode(self, x):
        h = self.encoder(x)
        return self.fc_mu(h), self.fc_logvar(h)
    
    def reparam(self, mu, logvar):
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std
    
    def forward(self, x):
        mu, logvar = self.encode(x)
        z = self.reparam(mu, logvar)
        return self.decoder(z), mu, logvar

# Training loop (on normal tx only), anomaly score = -recon_prob approx or high MSE + KL
# Full example includes recon probability scoring per An & Cho and hybrid with XGB.
```

**How to run toy**: python experiments/toy_vae.py (after pip install torch). Outputs PR-AUC on synthetic fraud data, top anomalies, latent viz suggestion.

## Conceptual Visualization
- Latent space plot (2D PCA of z for normal vs fraud): Normal clusters tightly; fraud outliers.
- Recon probability histogram: Clear separation (low prob for fraud).
- Decoder samples: Generate "what normal tx would look like" for comparison.

## References
- An & Cho 2015 (recon prob).
- Kingma & Welling VAE.
- Chen 2025, Ding 2023, Vallarino 2025 (hybrids), Zong DAGMM (related).
- Full in data/subagents/deep-generative-models/papers_and_sources.md

**Status**: Ready for website integration and comparison experiments.
