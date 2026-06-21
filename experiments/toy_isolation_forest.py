"""
Toy Example: Isolation Forest for Fraud/Anomaly Detection
=========================================================

This script is a **minimal, fully functional, documented** demonstration of
Isolation Forest on synthetic fraud-like data.

Intended for:
- Model Card "Isolation Forest"
- Early validation that all pipeline code runs
- Educational handholding

Why Isolation Forest?
---------------------
Isolation Forest (Liu et al., 2008/2012) is an unsupervised anomaly detection
algorithm that explicitly isolates anomalies instead of profiling normal data.

Core intuition:
- Anomalies are "few and different"
- They get isolated with fewer random splits in a tree than normal points.

How it works (conceptual):
1. Randomly subsample the data.
2. Build many isolation trees by randomly selecting a feature and a split value.
3. Points that require fewer splits to isolate get lower path lengths → higher anomaly score.
4. Average across trees → final anomaly score (higher = more anomalous).

Why chosen for fraud:
- Works well in high-dimensional spaces
- No assumption on data distribution
- Fast and scalable
- Excellent first filter before supervised models or graph models
- Naturally handles the "rare event" nature of fraud

Pros:
- No labels needed
- Good at detecting novel fraud patterns
- Interpretable via feature importance in some implementations

Cons / Limitations:
- Can flag rare but legitimate behavior (high FP if contamination high)
- Less effective if fraud is not "outlier" but subtle (e.g. mimicry)
- Hyperparameters: n_estimators, max_samples, contamination

Assumptions:
- Anomalies are minority and statistically different
- Features are meaningful (good feature engineering is critical)

In this toy:
- We use our synthetic generator (transactions + behavioral features)
- Train IForest
- Evaluate with proper fraud metrics (even though unsupervised)
- Show top anomalies
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.metrics import average_precision_score, precision_recall_curve, f1_score
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

from synthetic_fraud_data import generate_synthetic_fraud_data


def prepare_features(tx: pd.DataFrame) -> np.ndarray:
    """
    Feature engineering for the toy model.

    Why these features?
    - amount: core monetary signal
    - is_night, hour: time-based behavioral deviation
    - user_tx_count_1h / 24h: velocity — common fraud signal
    - One-hot of category (simple)

    Real systems use far richer features (aggregates over history, graph features, etc.).
    """
    features = tx[['amount', 'is_night', 'hour', 'user_tx_count_1h', 'user_tx_count_24h']].copy()

    # Simple one-hot for category
    cat_dummies = pd.get_dummies(tx['category'], prefix='cat')
    features = pd.concat([features, cat_dummies], axis=1)

    return features.values


def run_isolation_forest_toy(
    n_tx: int = 5000,
    contamination: float = 0.015,
    random_state: int = 42
):
    """
    End-to-end toy run of Isolation Forest on fraud-like data.

    Steps explained inline.
    """
    print("=" * 60)
    print("ISOLATION FOREST TOY — Fraud / Anomaly Detection")
    print("=" * 60)

    # 1. Generate data (see synthetic_fraud_data.py for why representative)
    print("\n[1/5] Generating synthetic transactional + behavioral data...")
    tx, _, _, meta = generate_synthetic_fraud_data(
        n_transactions=n_tx, fraud_rate=0.012, seed=random_state
    )
    print(f"    Generated {len(tx)} txns | Fraud rate: {meta['fraud_rate']:.2%}")

    # 2. Prepare features
    print("\n[2/5] Preparing features (amount, velocity, time, category)...")
    X = prepare_features(tx)
    print(f"    Feature matrix shape: {X.shape}")

    # Scale (good practice though IForest is quite robust to scale)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 3. Train Isolation Forest
    # contamination = expected proportion of anomalies (we set slightly above true rate)
    print(f"\n[3/5] Training Isolation Forest (contamination={contamination})...")
    model = IsolationForest(
        n_estimators=200,
        max_samples='auto',
        contamination=contamination,
        random_state=random_state,
        n_jobs=-1
    )
    model.fit(X_scaled)

    # 4. Score & predict
    # decision_function: lower = more anomalous (we negate for convention)
    scores = -model.decision_function(X_scaled)  # higher = more anomalous
    tx['anomaly_score'] = scores
    tx['predicted_fraud'] = model.predict(X_scaled)  # -1 = anomaly, 1 = normal
    tx['predicted_fraud'] = (tx['predicted_fraud'] == -1).astype(int)

    # 5. Evaluation using fraud-appropriate metrics
    print("\n[4/5] Evaluating (using ground truth for educational purposes only)...")
    y_true = tx['is_fraud'].values
    y_pred = tx['predicted_fraud'].values
    y_scores = tx['anomaly_score'].values

    # Key metrics for fraud (imbalanced)
    pr_auc = average_precision_score(y_true, y_scores)
    precision, recall, thresholds = precision_recall_curve(y_true, y_scores)
    f1s = 2 * (precision * recall) / (precision + recall + 1e-8)
    best_f1 = np.max(f1s)

    print(f"    PR-AUC (Average Precision): {pr_auc:.4f}")
    print(f"    Best F1 (on scores):        {best_f1:.4f}")
    print(f"    Detected frauds (model):    {y_pred.sum()} / {y_true.sum()} actual")

    # Show top anomalies
    print("\n[5/5] Top 5 highest anomaly score transactions:")
    top = tx.nlargest(5, 'anomaly_score')[['txn_id', 'amount', 'is_night', 'user_tx_count_1h', 'is_fraud', 'anomaly_score']]
    print(top.to_string(index=False))

    print("\n" + "=" * 60)
    print("KEY INSIGHT: Isolation Forest ranks anomalies without labels.")
    print("In production: Use scores as features or filter, then apply supervised/graph models.")
    print("=" * 60)

    return tx, model, {'pr_auc': pr_auc, 'best_f1': best_f1}


if __name__ == "__main__":
    # Run the full toy
    tx_results, model, metrics = run_isolation_forest_toy()

    # Optional quick plot (saves figure)
    try:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt

        plt.figure(figsize=(8, 4))
        plt.hist(tx_results[tx_results['is_fraud']==0]['anomaly_score'], bins=50, alpha=0.6, label='Normal')
        plt.hist(tx_results[tx_results['is_fraud']==1]['anomaly_score'], bins=30, alpha=0.8, label='Fraud')
        plt.xlabel('Anomaly Score (higher = more anomalous)')
        plt.ylabel('Count')
        plt.title('Isolation Forest Anomaly Scores on Synthetic Fraud Data')
        plt.legend()
        plt.tight_layout()
        plt.savefig('experiments/iforest_toy_score_dist.png', dpi=120)
        print("\nSaved score distribution plot: experiments/iforest_toy_score_dist.png")
    except Exception as e:
        print(f"(Plot skipped: {e})")

    print("\nToy completed successfully. All steps runnable.")
