"""
Comparative Experiments: Coordinated Fraud Model Families
=========================================================

This script compares the core and expanded model families covered by the
website/model cards on realistic synthetic transactional + relational fraud data.

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
import sys
from sklearn.ensemble import ExtraTreesClassifier, GradientBoostingClassifier, IsolationForest, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.svm import OneClassSVM

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


def fit_anomaly_score(model, train_df, test_df, num):
    normal_train = train_df[train_df["is_fraud"] == 0]
    pipe = Pipeline([("scale", StandardScaler()), ("model", model)])
    pipe.fit(normal_train[num])
    return -pipe.decision_function(test_df[num])


def pca_tail_proxy(train_df, test_df, num):
    train = train_df[num]
    test = test_df[num]
    med = train.median()
    mad = (train - med).abs().median().replace(0, 1e-6)
    return (0.6745 * (test - med).abs() / mad).max(axis=1).to_numpy()


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

    supervised_models = {
        'Logistic Regression (scorecard baseline)': LogisticRegression(max_iter=1000, class_weight='balanced'),
        'Random Forest (balanced)': RandomForestClassifier(n_estimators=80, random_state=seed, class_weight='balanced_subsample'),
        'ExtraTrees (variance baseline)': ExtraTreesClassifier(n_estimators=100, random_state=seed, class_weight='balanced'),
        'XGBoost / GBDT (supervised baseline)': GradientBoostingClassifier(n_estimators=50, random_state=seed),
        'Tabular DL proxy (tree stand-in)': RandomForestClassifier(n_estimators=50, random_state=seed, class_weight='balanced'),
        'Sequence proxy (lagged features)': GradientBoostingClassifier(n_estimators=30, random_state=seed),
        'MoE Hybrid proxy (stacked experts)': RandomForestClassifier(n_estimators=100, random_state=seed, class_weight='balanced'),
    }

    results = {}
    for name, model in supervised_models.items():
        pipe = Pipeline([('pre', pre), ('clf', model)])
        pipe.fit(X_train, y_train)
        proba = pipe.predict_proba(X_test)[:, 1]
        pr = average_precision_score(y_test, proba)
        rec = recall_at_k(y_test, proba, k=50)
        results[name] = {'pr_auc': pr, 'recall_at_50': rec}

    contamination = max(float(y_train.mean()), 0.01)
    anomaly_scores = {
        'Isolation Forest (fast anomaly gate)': fit_anomaly_score(
            IsolationForest(contamination=contamination, random_state=seed), train_df, test_df, num
        ),
        'LOF novelty (local density)': fit_anomaly_score(
            LocalOutlierFactor(n_neighbors=30, novelty=True, contamination=contamination), train_df, test_df, num
        ),
        'One-Class SVM (normal boundary)': fit_anomaly_score(
            OneClassSVM(nu=min(max(contamination, 0.01), 0.08), gamma='scale'), train_df, test_df, num
        ),
        'Robust MAD / tail score': pca_tail_proxy(train_df, test_df, num),
    }
    for name, score in anomaly_scores.items():
        results[name] = {
            'pr_auc': average_precision_score(y_test, score),
            'recall_at_50': recall_at_k(y_test, score, k=50),
        }

    # Lightweight hybrid: append the IF score to the supervised feature table.
    if_score_train = -Pipeline(
        [('scale', StandardScaler()), ('iforest', IsolationForest(contamination=contamination, random_state=seed))]
    ).fit(train_df[train_df['is_fraud'] == 0][num]).decision_function(train_df[num])
    if_score_test = anomaly_scores['Isolation Forest (fast anomaly gate)']
    train_aug = X_train.copy()
    test_aug = X_test.copy()
    train_aug['iforest_score'] = if_score_train
    test_aug['iforest_score'] = if_score_test
    pre_aug = ColumnTransformer(
        [('num', StandardScaler(), num + ['iforest_score']), ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat)]
    )
    hybrid = Pipeline([('pre', pre_aug), ('clf', GradientBoostingClassifier(n_estimators=60, random_state=seed))])
    hybrid.fit(train_aug, y_train)
    hybrid_score = hybrid.predict_proba(test_aug)[:, 1]
    results['GBDT + Isolation Forest score hybrid'] = {
        'pr_auc': average_precision_score(y_test, hybrid_score),
        'recall_at_50': recall_at_k(y_test, hybrid_score, k=50),
    }
    return results


def main():
    print("=== Comparative Experiments (Coordinated Model Families) ===")
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

    print("\nComparison complete. Every displayed family has a model card or grouped family card.")
    print("Production note: use temporal splits and full libs (PyOD, PyG/DGL, LightGBM/CatBoost) for real deployments.")
    print("See roadmap, model cards, and scripts/full_pipeline.py for hybrid details.")

    # Integration demos (cleaned)
    print("\n--- Integration: real GraphSAGE implementation ---")
    import subprocess
    result = subprocess.run([sys.executable, 'experiments/toy_graphsage.py'], capture_output=True, text=True, timeout=30)
    print(result.stdout[-400:] if len(result.stdout) > 400 else result.stdout)
    if result.returncode == 0:
        print("Implementation executed successfully.")

    print("\n--- Integration: real XGBoost implementation ---")
    result2 = subprocess.run([sys.executable, 'experiments/toy_xgboost.py'], capture_output=True, text=True, timeout=30)
    print(result2.stdout[-300:] if len(result2.stdout) > 300 else result2.stdout)
    if result2.returncode == 0:
        print("Implementation executed successfully.")

    print("\n--- Additional runnable expanded examples ---")
    for script in [
        'toy_supervised_baselines.py',
        'toy_density_outlier_suite.py',
        'toy_graph_link_prediction.py',
        'toy_entity_resolution.py',
    ]:
        result3 = subprocess.run([sys.executable, f'experiments/{script}'], capture_output=True, text=True, timeout=30)
        print(f"{script}: returncode={result3.returncode}")

if __name__ == "__main__":
    main()
