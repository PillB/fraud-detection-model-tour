"""
Supervised Baselines for Fraud Detection
=======================================

Runs logistic regression, random forest, ExtraTrees, and gradient boosting on
the shared synthetic transaction data. These are the production sanity checks
that every deeper fraud model should beat.

Run:
    python experiments/toy_supervised_baselines.py
"""

import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import ExtraTreesClassifier, GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from synthetic_fraud_data import generate_synthetic_fraud_data


NUMERIC = ["amount", "hour", "user_tx_count_1h", "user_tx_count_24h"]
CATEGORICAL = ["category", "is_night"]


def temporal_split(df, test_frac=0.3):
    df = df.sort_values("timestamp").reset_index(drop=True)
    cutoff = int(len(df) * (1 - test_frac))
    return df.iloc[:cutoff].copy(), df.iloc[cutoff:].copy()


def recall_at_k(y_true, scores, k=50):
    y = np.asarray(y_true)
    idx = np.argsort(-np.asarray(scores))[:k]
    return float(y[idx].sum() / y.sum()) if y.sum() else 0.0


def preprocessor():
    return ColumnTransformer(
        [
            ("num", StandardScaler(), NUMERIC),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL),
        ]
    )


def main():
    tx, _, _, meta = generate_synthetic_fraud_data(n_transactions=3500, fraud_rate=0.012, seed=7)
    train, test = temporal_split(tx)
    x_train = train[NUMERIC + CATEGORICAL]
    y_train = train["is_fraud"]
    x_test = test[NUMERIC + CATEGORICAL]
    y_test = test["is_fraud"].to_numpy()

    class_weight = "balanced"
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, class_weight=class_weight),
        "Random Forest": RandomForestClassifier(n_estimators=120, random_state=7, class_weight="balanced_subsample"),
        "ExtraTrees": ExtraTreesClassifier(n_estimators=160, random_state=7, class_weight="balanced"),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=80, random_state=7),
    }

    print("=== Supervised Fraud Baselines ===")
    print(f"Transactions: {meta['n_transactions']} | Fraud rate: {meta['fraud_rate']:.2%}")
    print("Temporal split:", len(train), "train /", len(test), "test")

    rows = []
    for name, model in models.items():
        pipe = Pipeline([("pre", preprocessor()), ("model", model)])
        pipe.fit(x_train, y_train)
        if hasattr(pipe.named_steps["model"], "predict_proba"):
            score = pipe.predict_proba(x_test)[:, 1]
        else:
            score = pipe.decision_function(x_test)
        rows.append((name, average_precision_score(y_test, score), recall_at_k(y_test, score, 50)))

    for name, pr_auc, rec50 in sorted(rows, key=lambda r: r[1], reverse=True):
        print(f"{name:22s} PR-AUC={pr_auc:.4f} | Recall@50={rec50:.3f}")

    print("Production note: keep these baselines as governance references before adding graph/deep layers.")


if __name__ == "__main__":
    main()

