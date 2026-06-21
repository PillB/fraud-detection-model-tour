"""
Comparative Experiments: 6 Model Families on Synthetic Fraud Data
================================================================

This script compares the core model families covered by the Model Cards
on realistic synthetic transactional + relational fraud data.

It uses consistent production-style patterns (sklearn stand-ins for
illustration where full DL/graph libs are heavy) and integrates the
actual runnable implementations from the model cards via subprocess.

Primary metric: PR-AUC. Re-run for different seeds.
See full_pipeline.py for end-to-end documented hybrid scoring.

Run:
    python experiments/compare_models.py

All experiments should use the regression gate and proper metrics (PR-AUC primary).
"""

import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import average_precision_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from synthetic_fraud_data import generate_synthetic_fraud_data


def temporal_train_test_split(df, time_col='timestamp', test_frac=0.3):
    """Production temporal split to avoid leakage."""
    df = df.sort_values(time_col).reset_index(drop=True)
    cutoff = df[time_col].quantile(1 - test_frac)
    train_mask = df[time_col] < cutoff
    return df[train_mask].copy(), df[~train_mask].copy()


def recall_at_k(y_true, scores, k=50):
    idx = np.argsort(-scores)[:k]
    return float(y_true.iloc[idx].sum() / y_true.sum()) if y_true.sum() > 0 else 0.0


def run_single_seed(tx, seed):
    """Run one seed with temporal split and full metrics."""
    np.random.seed(seed)
    train_df, test_df = temporal_train_test_split(tx)
    num = ['amount', 'hour', 'user_tx_count_1h', 'user_tx_count_24h']
    cat = ['category', 'is_night']
    X_train = train_df[num + cat]
    y_train = train_df['is_fraud']
    X_test = test_df[num + cat]
    y_test = test_df['is_fraud']

    pre = ColumnTransformer([('num', StandardScaler(), num), ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat)])

    models = {
        'XGBoost (Supervised Baseline)': GradientBoostingClassifier(n_estimators=50, random_state=seed),
        'Tabular DL (educational stand-in)': RandomForestClassifier(n_estimators=50, random_state=seed, class_weight='balanced'),
        'Sequence (educational stand-in)': GradientBoostingClassifier(n_estimators=30, random_state=seed),
        'MoE Hybrid (educational stand-in)': RandomForestClassifier(n_estimators=100, random_state=seed, class_weight='balanced'),
        'VAE+IF Hybrid (educational stand-in)': GradientBoostingClassifier(n_estimators=40, random_state=seed)
    }

    results = {}
    for name, model in models.items():
        pipe = Pipeline([('pre', pre), ('clf', model)])
        pipe.fit(X_train, y_train)
        proba = pipe.predict_proba(X_test)[:, 1]
        pr = average_precision_score(y_test, proba)
        rec = recall_at_k(y_test, proba, k=50)
        results[name] = {'pr_auc': pr, 'recall_at_50': rec}
    return results


def main():
    print("=== Comparative Experiments (6 Model Families) ===")
    tx, _, _, _ = generate_synthetic_fraud_data(n_transactions=2000, fraud_rate=0.012, seed=42)

    # Multi-seed for variance (P0 hardening)
    seeds = [42, 123, 99]
    all_results = []
    for s in seeds:
        r = run_single_seed(tx, s)
        all_results.append(r)

    # Aggregate mean +/- std
    print("\nMean +/- std across seeds (temporal split):")
    for name in all_results[0].keys():
        prs = [r[name]['pr_auc'] for r in all_results]
        recs = [r[name]['recall_at_50'] for r in all_results]
        print(f"{name}: PR-AUC = {np.mean(prs):.4f} +/- {np.std(prs):.4f} | Recall@50 = {np.mean(recs):.3f} +/- {np.std(recs):.3f}")

    print("\nComparison complete. Educational stand-ins + real runnable examples. Production note: use temporal splits and full libs (PyG etc.) for real deployments.")
    print("See roadmap, model cards, and scripts/full_pipeline.py for hybrid details.")

    # Integration demos (cleaned)
    print("\n--- Integration: real GraphSAGE implementation ---")
    import subprocess
    result = subprocess.run(['python', 'experiments/toy_graphsage.py'], capture_output=True, text=True, timeout=30)
    print(result.stdout[-400:] if len(result.stdout) > 400 else result.stdout)
    if result.returncode == 0:
        print("Implementation executed successfully.")

    print("\n--- Integration: real XGBoost implementation ---")
    result2 = subprocess.run(['python', 'experiments/toy_xgboost.py'], capture_output=True, text=True, timeout=30)
    print(result2.stdout[-300:] if len(result2.stdout) > 300 else result2.stdout)
    if result2.returncode == 0:
        print("Implementation executed successfully.")

if __name__ == "__main__":
    main()
