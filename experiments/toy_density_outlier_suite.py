"""
Density and Tail Outlier Suite
==============================

Dependency-light proxies for HBOS/ECOD/COPOD/kNN-style anomaly views. PyOD is
the production upgrade path; this script keeps the model-tour example runnable
with the default requirements.

Run:
    python experiments/toy_density_outlier_suite.py
"""

import numpy as np
import pandas as pd
from sklearn.metrics import average_precision_score
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

from synthetic_fraud_data import generate_synthetic_fraud_data


FEATURES = ["amount", "hour", "user_tx_count_1h", "user_tx_count_24h", "is_night"]


def temporal_split(df, test_frac=0.3):
    df = df.sort_values("timestamp").reset_index(drop=True)
    cutoff = int(len(df) * (1 - test_frac))
    return df.iloc[:cutoff].copy(), df.iloc[cutoff:].copy()


def recall_at_k(y_true, scores, k=50):
    y = np.asarray(y_true)
    idx = np.argsort(-np.asarray(scores))[:k]
    return float(y[idx].sum() / y.sum()) if y.sum() else 0.0


def empirical_tail_score(train_x, test_x):
    train = pd.DataFrame(train_x, columns=FEATURES)
    test = pd.DataFrame(test_x, columns=FEATURES)
    scores = []
    for col in FEATURES:
        values = np.sort(train[col].to_numpy())
        ranks = np.searchsorted(values, test[col].to_numpy(), side="right") / max(len(values), 1)
        tail = np.minimum(ranks, 1 - ranks)
        scores.append(-np.log(np.clip(tail, 1e-4, 1.0)))
    return np.mean(np.vstack(scores), axis=0)


def hbos_proxy_score(train_x, test_x, bins=12):
    total = np.zeros(len(test_x))
    for j in range(train_x.shape[1]):
        hist, edges = np.histogram(train_x[:, j], bins=bins, density=True)
        hist = np.clip(hist, 1e-6, None)
        idx = np.clip(np.searchsorted(edges, test_x[:, j], side="right") - 1, 0, len(hist) - 1)
        total += -np.log(hist[idx])
    return total / train_x.shape[1]


def knn_distance_score(train_x, test_x, k=15):
    nn = NearestNeighbors(n_neighbors=k)
    nn.fit(train_x)
    distances, _ = nn.kneighbors(test_x)
    return distances[:, -1]


def main():
    tx, _, _, meta = generate_synthetic_fraud_data(n_transactions=3200, fraud_rate=0.012, seed=11)
    train, test = temporal_split(tx)
    normal_train = train[train["is_fraud"] == 0]

    scaler = StandardScaler()
    train_x = scaler.fit_transform(normal_train[FEATURES])
    test_x = scaler.transform(test[FEATURES])
    y = test["is_fraud"].to_numpy()

    scores = {
        "HBOS proxy": hbos_proxy_score(train_x, test_x),
        "ECOD/COPOD tail proxy": empirical_tail_score(train_x, test_x),
        "kNN distance": knn_distance_score(train_x, test_x),
    }

    print("=== Density Outlier Suite ===")
    print(f"Transactions: {meta['n_transactions']} | Fraud rate: {meta['fraud_rate']:.2%}")
    for name, score in sorted(scores.items(), key=lambda kv: average_precision_score(y, kv[1]), reverse=True):
        print(f"{name:22s} PR-AUC={average_precision_score(y, score):.4f} | Recall@50={recall_at_k(y, score):.3f}")
    print("Production upgrade: replace proxies with PyOD HBOS, ECOD, COPOD, KNN, SUOD, or XGBOD.")


if __name__ == "__main__":
    main()

