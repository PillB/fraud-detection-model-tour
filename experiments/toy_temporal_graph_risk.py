"""
Temporal Graph Risk Proxy
=========================

Dependency-light proxy for temporal GNN ideas. It constructs time-aware
user/merchant/edge features from timestamped transactions and evaluates
fraud risk with a temporal split.

Run:
    python experiments/toy_temporal_graph_risk.py
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import average_precision_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

from synthetic_fraud_data import generate_synthetic_fraud_data


def recall_at_k(y_true, scores, k=50):
    y = np.asarray(y_true)
    idx = np.argsort(-np.asarray(scores))[:k]
    return float(y[idx].sum() / y.sum()) if y.sum() else 0.0


def add_temporal_graph_features(tx: pd.DataFrame) -> pd.DataFrame:
    df = tx.sort_values("timestamp").copy()
    df["user_seen_before"] = df.groupby("user_id").cumcount()
    df["merchant_seen_before"] = df.groupby("merchant_id").cumcount()
    df["edge_seen_before"] = df.groupby(["user_id", "merchant_id"]).cumcount()

    df["prev_user_time"] = df.groupby("user_id")["timestamp"].shift(1)
    gap = (df["timestamp"] - df["prev_user_time"]).dt.total_seconds().div(60)
    df["minutes_since_user_txn"] = gap.fillna(gap.median()).clip(lower=0, upper=24 * 60)

    user_expanding_mean = (
        df.groupby("user_id")["amount"]
        .expanding()
        .mean()
        .shift(1)
        .reset_index(level=0, drop=True)
    )
    df["amount_vs_user_history"] = df["amount"] / (user_expanding_mean.fillna(df["amount"].median()) + 1e-6)
    df["new_user_merchant_edge"] = (df["edge_seen_before"] == 0).astype(int)

    merchant_velocity = df.groupby("merchant_id").cumcount()
    df["merchant_velocity_proxy"] = merchant_velocity % 50
    df["temporal_burst_score"] = (
        df["user_tx_count_1h"] * 0.45
        + df["new_user_merchant_edge"] * 2.0
        + (df["minutes_since_user_txn"] < 5).astype(int) * 1.5
    )
    return df.fillna(0)


def temporal_split(df: pd.DataFrame, test_frac=0.3):
    cutoff = int(len(df) * (1 - test_frac))
    return df.iloc[:cutoff].copy(), df.iloc[cutoff:].copy()


def main():
    tx, _, _, meta = generate_synthetic_fraud_data(n_transactions=4000, fraud_rate=0.012, seed=21)
    df = add_temporal_graph_features(tx)
    train, test = temporal_split(df)

    features = [
        "amount",
        "hour",
        "is_night",
        "user_tx_count_1h",
        "user_tx_count_24h",
        "user_seen_before",
        "merchant_seen_before",
        "edge_seen_before",
        "minutes_since_user_txn",
        "amount_vs_user_history",
        "new_user_merchant_edge",
        "merchant_velocity_proxy",
        "temporal_burst_score",
    ]

    model = Pipeline(
        [
            ("scale", StandardScaler()),
            ("clf", HistGradientBoostingClassifier(max_iter=90, learning_rate=0.08, random_state=42)),
        ]
    )
    model.fit(train[features], train["is_fraud"])
    scores = model.predict_proba(test[features])[:, 1]

    baseline_scores = test["temporal_burst_score"].to_numpy()
    y = test["is_fraud"].to_numpy()

    print("=== Temporal Graph Risk Proxy ===")
    print(f"Transactions={meta['n_transactions']} | fraud rate={meta['fraud_rate']:.2%}")
    print(f"Temporal feature model PR-AUC={average_precision_score(y, scores):.4f} | Recall@50={recall_at_k(y, scores):.3f}")
    print(f"Transparent burst baseline PR-AUC={average_precision_score(y, baseline_scores):.4f} | Recall@50={recall_at_k(y, baseline_scores):.3f}")
    print("Production upgrade: replace proxy features with TGN/TGAT node memory and temporal message embeddings.")


if __name__ == "__main__":
    main()

