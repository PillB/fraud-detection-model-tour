"""
Toy Example: Variational Autoencoder (VAE) for Fraud Anomaly Detection
======================================================================

This script demonstrates the VAE model card using the synthetic fraud data.

It implements a basic VAE (PyTorch) following An & Cho (2015) reconstruction
probability idea for anomaly scoring.

Requirements (for full run):
    pip install torch numpy pandas scikit-learn matplotlib

Why VAE for fraud:
- Learns "normal" manifold probabilistically.
- Anomaly = low reconstruction probability (accounts for uncertainty).
- Latents useful for downstream hybrids (e.g. + XGB).
- Handles imbalance via generation potential.

The example trains on mostly normal data, scores all tx, and reports
PR-AUC on the toy labels.

Full Model Card: docs/model-cards/VAE.md
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import DataLoader, TensorDataset
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False
    print("PyTorch not found. Install with: pip install torch")
    print("Falling back to a very simplified reconstruction proxy (not true VAE).")

from sklearn.preprocessing import StandardScaler
from sklearn.metrics import average_precision_score
from sklearn.ensemble import IsolationForest  # for hybrid demo

from synthetic_fraud_data import generate_synthetic_fraud_data

def prepare_normal_data(tx: pd.DataFrame, use_normal_only: bool = True):
    """Prepare features. Train only on 'normal' for classic unsupervised VAE setup."""
    features = tx[['amount', 'is_night', 'hour', 'user_tx_count_1h', 'user_tx_count_24h']].copy()
    cat_dummies = pd.get_dummies(tx['category'], prefix='cat')
    X = pd.concat([features, cat_dummies], axis=1).values
    
    if use_normal_only:
        mask = tx['is_fraud'] == 0
        X_train = X[mask]
    else:
        X_train = X
    
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_all = scaler.transform(X)
    return X_train, X_all, scaler, tx['is_fraud'].values

class SimpleVAE(nn.Module):
    """Minimal VAE for tabular data (educational)."""
    def __init__(self, input_dim, latent_dim=8, hidden=64):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU()
        )
        self.fc_mu = nn.Linear(hidden, latent_dim)
        self.fc_logvar = nn.Linear(hidden, latent_dim)
        
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Linear(hidden, input_dim)
        )
    
    def encode(self, x):
        h = self.encoder(x)
        return self.fc_mu(h), self.fc_logvar(h)
    
    def reparameterize(self, mu, logvar):
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std
    
    def forward(self, x):
        mu, logvar = self.encode(x)
        z = self.reparameterize(mu, logvar)
        recon = self.decoder(z)
        return recon, mu, logvar

def vae_loss(recon, x, mu, logvar):
    """Standard VAE loss: recon + KL."""
    recon_loss = nn.functional.mse_loss(recon, x, reduction='sum')
    kl = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
    return recon_loss + kl

def train_vae(X_train, epochs=30, batch_size=128, latent_dim=8, lr=1e-3):
    if not HAS_TORCH:
        return None
    device = torch.device('cpu')
    model = SimpleVAE(X_train.shape[1], latent_dim=latent_dim).to(device)
    opt = optim.Adam(model.parameters(), lr=lr)
    loader = DataLoader(TensorDataset(torch.FloatTensor(X_train)), batch_size=batch_size, shuffle=True)
    
    for ep in range(epochs):
        model.train()
        total = 0
        for (xb,) in loader:
            xb = xb.to(device)
            opt.zero_grad()
            recon, mu, logvar = model(xb)
            loss = vae_loss(recon, xb, mu, logvar)
            loss.backward()
            opt.step()
            total += loss.item()
        if (ep + 1) % 10 == 0:
            print(f"Epoch {ep+1}/{epochs} - loss: {total/len(X_train):.2f}")
    return model

def anomaly_score_vae(model, X, n_samples=10):
    """Approximate reconstruction probability (An & Cho style). Lower = more anomalous."""
    if model is None or not HAS_TORCH:
        # Fallback: use simple reconstruction error via IsolationForest or mean
        return -np.mean(X, axis=1)  # dummy
    
    model.eval()
    X_t = torch.FloatTensor(X)
    with torch.no_grad():
        scores = []
        for _ in range(n_samples):
            recon, mu, logvar = model(X_t)
            # Use -MSE as proxy for log-prob (simplified)
            mse = torch.mean((recon - X_t)**2, dim=1)
            # Use .tolist() to avoid numpy issues in some torch builds
            scores.append([-float(m) for m in mse.tolist()])
        # average across samples
        avg_scores = [sum(s)/len(s) for s in zip(*scores)]
        return np.array(avg_scores)

def main():
    print("=" * 60)
    print("VAE TOY FOR FRAUD ANOMALY DETECTION")
    print("=" * 60)
    
    tx, _, _, meta = generate_synthetic_fraud_data(n_transactions=4000, fraud_rate=0.012, seed=42)
    print(f"Generated data: {len(tx)} tx | Fraud rate ~{meta['fraud_rate']:.2%}")
    
    X_train, X_all, scaler, y = prepare_normal_data(tx)
    
    model = None
    if HAS_TORCH:
        print("\n[Training VAE on normal transactions only...]")
        model = train_vae(X_train, epochs=25, latent_dim=8)
    else:
        print("\n[Using proxy scoring (install torch for full VAE)]")
    
    scores = anomaly_score_vae(model, X_all)
    
    # Simple hybrid: add VAE score as feature to IF
    if_model = IsolationForest(contamination=0.015, random_state=42)
    if_scores = -if_model.fit(X_all).decision_function(X_all)
    hybrid_scores = scores + 0.5 * if_scores  # simple fusion
    
    pr_auc = average_precision_score(y, -hybrid_scores)  # higher anomaly = lower score in some conventions; flip
    print(f"\nHybrid (VAE + IF) PR-AUC: {pr_auc:.4f}")
    
    # Top anomalies
    top_idx = np.argsort(-hybrid_scores)[:5]
    print("\nTop 5 highest anomaly score tx (hybrid):")
    print(tx.iloc[top_idx][['txn_id', 'amount', 'is_fraud']].to_string(index=False))
    
    print("\nKey insight: VAE gives probabilistic view of 'normal'. Use as feature or score in mixtures.")
    print("See docs/model-cards/VAE.md for full card and theory.")
    print("=" * 60)

if __name__ == "__main__":
    main()
