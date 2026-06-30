"""
Classical Anomaly Detection Suite for Fraud
===========================================

Compares transparent statistical and classical unsupervised anomaly detectors
on the shared synthetic transaction data.

Run:
    python experiments/toy_classical_anomaly_suite.py
"""

import os
from pathlib import Path

os.environ.setdefault("MPLCONFIGDIR", str(Path(__file__).resolve().parent / ".mplconfig"))

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.covariance import EllipticEnvelope
from sklearn.decomposition import PCA
from sklearn.ensemble import IsolationForest
from sklearn.metrics import average_precision_score
from sklearn.neighbors import LocalOutlierFactor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import OneClassSVM

from synthetic_fraud_data import generate_synthetic_fraud_data


NUMERIC_FEATURES = ["amount", "hour", "user_tx_count_1h", "user_tx_count_24h", "is_night"]


def temporal_train_test_split(df: pd.DataFrame, test_frac: float = 0.3):
    df = df.sort_values("timestamp").reset_index(drop=True)
    cutoff = int(len(df) * (1 - test_frac))
    return df.iloc[:cutoff].copy(), df.iloc[cutoff:].copy()


def recall_at_k(y_true, scores, k=50):
    y = np.asarray(y_true)
    idx = np.argsort(-np.asarray(scores))[:k]
    return float(y[idx].sum() / y.sum()) if y.sum() else 0.0


def robust_mad_score(train: pd.DataFrame, test: pd.DataFrame) -> np.ndarray:
    med = train[NUMERIC_FEATURES].median()
    mad = (train[NUMERIC_FEATURES] - med).abs().median().replace(0, 1e-6)
    z = 0.6745 * (test[NUMERIC_FEATURES] - med).abs() / mad
    return z.max(axis=1).to_numpy()


def pca_reconstruction_score(train: pd.DataFrame, test: pd.DataFrame) -> np.ndarray:
    pipe = Pipeline(
        [
            ("scale", StandardScaler()),
            ("pca", PCA(n_components=2, random_state=42)),
        ]
    )
    train_x = train[NUMERIC_FEATURES]
    test_x = test[NUMERIC_FEATURES]
    z = pipe.fit_transform(train_x)
    pca = pipe.named_steps["pca"]
    scaler = pipe.named_steps["scale"]
    test_scaled = scaler.transform(test_x)
    recon = pca.inverse_transform(pca.transform(test_scaled))
    _ = z  # Keeps the fitted representation explicit for readers.
    return np.mean((test_scaled - recon) ** 2, axis=1)


def fit_score_models(train: pd.DataFrame, test: pd.DataFrame):
    contamination = max(float(train["is_fraud"].mean()), 0.01)
    x_train = train[NUMERIC_FEATURES]
    x_test = test[NUMERIC_FEATURES]

    models = {
        "Isolation Forest": Pipeline(
            [
                ("scale", StandardScaler()),
                ("model", IsolationForest(contamination=contamination, random_state=42)),
            ]
        ),
        "LOF novelty": Pipeline(
            [
                ("scale", StandardScaler()),
                ("model", LocalOutlierFactor(n_neighbors=30, novelty=True, contamination=contamination)),
            ]
        ),
        "One-Class SVM": Pipeline(
            [
                ("scale", StandardScaler()),
                ("model", OneClassSVM(nu=min(max(contamination, 0.01), 0.08), gamma="scale")),
            ]
        ),
        "Robust covariance": Pipeline(
            [
                ("scale", StandardScaler()),
                (
                    "model",
                    EllipticEnvelope(
                        contamination=contamination,
                        support_fraction=0.8,
                        random_state=42,
                    ),
                ),
            ]
        ),
    }

    scores = {
        "Robust MAD": robust_mad_score(train, test),
        "PCA reconstruction": pca_reconstruction_score(train, test),
    }

    normal_train = train[train["is_fraud"] == 0]
    for name, pipe in models.items():
        pipe.fit(normal_train[NUMERIC_FEATURES])
        scores[name] = -pipe.decision_function(x_test)

    return scores


def main():
    tx, _, _, meta = generate_synthetic_fraud_data(n_transactions=3500, fraud_rate=0.012, seed=42)
    train, test = temporal_train_test_split(tx)
    y = test["is_fraud"].to_numpy()

    print("=== Classical Anomaly Detection Suite ===")
    print(f"Transactions: {meta['n_transactions']} | Fraud rate: {meta['fraud_rate']:.2%}")
    print("Temporal split:", len(train), "train /", len(test), "test")

    scores = fit_score_models(train, test)
    rows = []
    for name, score in scores.items():
        pr_auc = average_precision_score(y, score)
        rec50 = recall_at_k(y, score, k=50)
        rows.append((name, pr_auc, rec50))

    rows = sorted(rows, key=lambda r: r[1], reverse=True)
    for name, pr_auc, rec50 in rows:
        print(f"{name:20s} PR-AUC={pr_auc:.4f} | Recall@50={rec50:.3f}")

    out = Path(__file__).with_name("classical_anomaly_suite_pr_auc.png")
    plt.figure(figsize=(8, 4))
    plt.bar([r[0] for r in rows], [r[1] for r in rows], color="#1e40af")
    plt.xticks(rotation=25, ha="right")
    plt.ylabel("PR-AUC")
    plt.title("Classical anomaly detectors on synthetic fraud data")
    plt.tight_layout()
    plt.savefig(out, dpi=140)
    print("Saved visualization:", out)


if __name__ == "__main__":
    main()
