"""
Toy Code Sketch: Classical Anomaly Detection + Supervised + Hybrid + Feature Engineering for Fraud
- Minimal runnable examples (sklearn + xgboost + pandas/numpy).
- Simulates imbalanced transactional data (inspired by Kaggle European CC Fraud: ~0.17% fraud).
- Includes: raw features + velocity/amount/time aggregates (critical FE).
- Models: IsolationForest, LOF (optional), LR, RandomForest, XGBoost.
- Hybrid idea: IF anomaly score as extra feature to XGB.
- Metrics: accuracy (misleading), PR-AUC, ROC-AUC, F1, simple recall@K.
- KYA/KYE relational example: flattened "shared_device_count", "kyc_risk_score".
- Notes: Run with pip install scikit-learn xgboost pandas numpy matplotlib (optional viz).
- For roadmap/model cards: Extend w/ real Kaggle load, temporal split, hyperparam, cost model.
- DO NOT use for production. Educational only. Tune contamination/scale_pos_weight to prevalence.
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (roc_auc_score, average_precision_score, 
                             f1_score, precision_recall_curve, recall_score)
from sklearn.neighbors import LocalOutlierFactor
import warnings
warnings.filterwarnings('ignore')

# Optional: import xgboost as xgb
try:
    import xgboost as xgb
    HAS_XGB = True
except ImportError:
    HAS_XGB = False
    print("XGBoost not installed; skipping XGB examples. pip install xgboost")

np.random.seed(42)
N = 20000  # toy size; scale up for realism. Fraud rate ~0.17%
FRAUD_RATE = 0.0017

def generate_toy_fraud_data(n=N, fraud_rate=FRAUD_RATE):
    """Generate synthetic tabular txn data with user ids for FE.
    Features mimic: amount, time (hour), + user history for velocity.
    Add KYA/KYE relational tabular: shared_device, kyc_risk.
    Fraud = rare + different (high amount relative, velocity burst, odd time, high relational risk).
    """
    n_fraud = int(n * fraud_rate)
    n_normal = n - n_fraud
    
    # Users for relational/velocity
    n_users = 800
    user_ids = np.random.randint(0, n_users, n)
    
    # Base normal txns
    amount_normal = np.random.lognormal(mean=3.5, sigma=0.8, size=n_normal)  # ~30 mean-ish
    hour_normal = np.random.choice(range(24), n_normal, p=[0.03]*6 + [0.05]*12 + [0.03]*6)  # more daytime
    time_delta_normal = np.random.exponential(20, n_normal)  # secs since last
    
    # KYA/KYE flattened
    kyc_risk_normal = np.random.beta(2, 5, n_normal)  # low risk mostly
    shared_device_normal = np.random.poisson(1.2, n_normal)  # few shares
    
    X_normal = pd.DataFrame({
        'user_id': user_ids[:n_normal],
        'amount': amount_normal,
        'hour': hour_normal,
        'time_since_last': time_delta_normal,
        'kyc_risk_score': kyc_risk_normal,
        'shared_device_count': shared_device_normal,
        'label': 0
    })
    
    # Fraud: different (higher rel amount, burst velocity implied, odd hours, higher relational)
    amount_fraud = np.random.lognormal(mean=5.5, sigma=1.0, size=n_fraud)  # higher
    hour_fraud = np.random.choice([0,1,2,3,22,23,4], n_fraud)  # night/odd
    time_delta_fraud = np.random.exponential(3, n_fraud)  # quick succession (velocity)
    kyc_risk_fraud = np.random.beta(5, 2, n_fraud)  # higher risk
    shared_device_fraud = np.random.poisson(4.5, n_fraud)  # more sharing (KYA signal)
    
    # Inject some fraud into same users for realistic velocity (but rare)
    fraud_user_ids = np.random.choice(range(n_users), n_fraud)
    
    X_fraud = pd.DataFrame({
        'user_id': fraud_user_ids,
        'amount': amount_fraud,
        'hour': hour_fraud,
        'time_since_last': time_delta_fraud,
        'kyc_risk_score': kyc_risk_fraud,
        'shared_device_count': shared_device_fraud,
        'label': 1
    })
    
    df = pd.concat([X_normal, X_fraud], ignore_index=True).sample(frac=1, random_state=42).reset_index(drop=True)
    
    # === CRITICAL FEATURE ENGINEERING (velocity, amount stats, time, behavioral, KYA) ===
    # Simulate history aggregates (in real: use feature store / groupby rolling)
    # For toy: global + simple per-user stats (leakage note: in real use past-only)
    user_stats = df.groupby('user_id').agg(
        user_avg_amount=('amount', 'mean'),
        user_txn_count=('amount', 'count'),
        user_max_amount=('amount', 'max')
    ).reset_index()
    df = df.merge(user_stats, on='user_id', how='left')
    
    df['amount_vs_user_avg'] = df['amount'] / (df['user_avg_amount'] + 1e-6)
    df['is_high_velocity_proxy'] = (df['time_since_last'] < 5).astype(int)  # crude
    df['odd_hour'] = ((df['hour'] < 6) | (df['hour'] > 21)).astype(int)
    df['log_amount'] = np.log1p(df['amount'])
    df['kyc_high_risk'] = (df['kyc_risk_score'] > 0.6).astype(int)
    
    # Velocity-like (toy global proxy; real = per user window)
    df['amount_z_global'] = (df['amount'] - df['amount'].mean()) / (df['amount'].std() + 1e-6)
    
    feature_cols = ['amount', 'hour', 'time_since_last', 'kyc_risk_score', 'shared_device_count',
                    'amount_vs_user_avg', 'is_high_velocity_proxy', 'odd_hour', 'log_amount',
                    'kyc_high_risk', 'amount_z_global', 'user_avg_amount', 'user_txn_count']
    
    X = df[feature_cols].values
    y = df['label'].values
    return df, X, y, feature_cols

# Generate
df, X, y, feat_names = generate_toy_fraud_data()
print(f"Data shape: {X.shape}, fraud rate: {y.mean():.4f} ({y.sum()} frauds)")
print("Sample features:", feat_names[:5], "... (incl. FE + KYA relational)")

# Temporal-ish split (sort by 'hour' proxy for time)
df_sorted = df.sort_values('hour').reset_index(drop=True)
split = int(0.7 * len(df_sorted))
X_train, X_test = df_sorted[feat_names].iloc[:split].values, df_sorted[feat_names].iloc[split:].values
y_train, y_test = df_sorted['label'].iloc[:split].values, df_sorted['label'].iloc[split:].values
print(f"Train frauds: {y_train.sum()}, Test frauds: {y_test.sum()}")

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

# =====================
# 1. UNSUPERVISED: Isolation Forest (primary rec for classical AD)
# =====================
print("\n=== Isolation Forest ===")
# contamination ~ expected fraud or 'auto'
iforest = IsolationForest(n_estimators=100, max_samples='auto', contamination='auto', 
                          random_state=42, n_jobs=-1)
iforest.fit(X_train_s)
scores_if = -iforest.decision_function(X_test_s)  # higher = more anomalous (flip sign convention)
y_pred_if = iforest.predict(X_test_s)  # -1 outlier, 1 inlier -> map
y_pred_if = (y_pred_if == -1).astype(int)

print(f"IF predicted frauds: {y_pred_if.sum()}")
print(f"IF ROC-AUC: {roc_auc_score(y_test, scores_if):.4f}")
print(f"IF PR-AUC (avg precision): {average_precision_score(y_test, scores_if):.4f}")
print(f"IF F1: {f1_score(y_test, y_pred_if):.4f}")
# Recall@K: sort by score, take top K
k = max(50, int(0.01 * len(y_test)))  # e.g. top 1%
topk_idx = np.argsort(scores_if)[-k:]
recall_at_k = y_test[topk_idx].sum() / max(1, y_test.sum())
print(f"IF Recall@top{k}: {recall_at_k:.4f}")

# =====================
# 2. LOF (local, for comparison; slower)
# =====================
print("\n=== LOF (toy subset for speed) ===")
# LOF on train for fit; novelty on test conceptually
lof = LocalOutlierFactor(n_neighbors=20, contamination='auto', novelty=True)
lof.fit(X_train_s[:5000])  # toy subsample
scores_lof = -lof.decision_function(X_test_s[:2000])  # higher anomalous
print(f"LOF PR-AUC (small test): {average_precision_score(y_test[:2000], scores_lof):.4f}")

# =====================
# 3. SUPERVISED: LR, RF, (XGB)
# =====================
print("\n=== Supervised ===")

# LR (baseline, interpretable)
lr = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
lr.fit(X_train_s, y_train)
probs_lr = lr.predict_proba(X_test_s)[:, 1]
pred_lr = (probs_lr > 0.5).astype(int)
print(f"LR PR-AUC: {average_precision_score(y_test, probs_lr):.4f}, F1: {f1_score(y_test, pred_lr):.4f}")

# RF
rf = RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42, n_jobs=-1)
rf.fit(X_train_s, y_train)
probs_rf = rf.predict_proba(X_test_s)[:, 1]
pred_rf = (probs_rf > 0.5).astype(int)
print(f"RF PR-AUC: {average_precision_score(y_test, probs_rf):.4f}, F1: {f1_score(y_test, pred_rf):.4f}")

# XGB (if avail) - recommended for tabular fraud
if HAS_XGB:
    # scale_pos_weight = neg/pos approx
    pos = y_train.sum()
    neg = len(y_train) - pos
    spw = neg / max(1, pos)
    dtrain = xgb.DMatrix(X_train_s, label=y_train)
    dtest = xgb.DMatrix(X_test_s, label=y_test)
    params = {
        'objective': 'binary:logistic',
        'eval_metric': 'aucpr',
        'scale_pos_weight': spw,
        'max_depth': 4,
        'eta': 0.1,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'seed': 42
    }
    bst = xgb.train(params, dtrain, num_boost_round=100, 
                    evals=[(dtest, 'test')], early_stopping_rounds=10, verbose_eval=False)
    probs_xgb = bst.predict(dtest)
    pred_xgb = (probs_xgb > 0.5).astype(int)
    print(f"XGB PR-AUC: {average_precision_score(y_test, probs_xgb):.4f}, F1: {f1_score(y_test, pred_xgb):.4f}")
    # Feature importance sketch
    imp = bst.get_score(importance_type='weight')
    print("XGB top feat importance (sample):", dict(list(imp.items())[:3]))

# =====================
# 4. HYBRID: IF scores as feature to supervised (XGB or RF)
# =====================
print("\n=== Hybrid: IF anomaly score + features -> XGB/RF ===")
# Train IF on train, get scores for train+test as feature
if_scores_train = -iforest.decision_function(X_train_s)
if_scores_test = scores_if  # from earlier

X_train_h = np.hstack([X_train_s, if_scores_train.reshape(-1,1)])
X_test_h = np.hstack([X_test_s, if_scores_test.reshape(-1,1)])

if HAS_XGB:
    dtrain_h = xgb.DMatrix(X_train_h, label=y_train)
    dtest_h = xgb.DMatrix(X_test_h, label=y_test)
    bst_h = xgb.train(params, dtrain_h, num_boost_round=80, 
                      evals=[(dtest_h, 'test')], early_stopping_rounds=8, verbose_eval=False)
    probs_h = bst_h.predict(dtest_h)
    print(f"Hybrid (IF+XGB) PR-AUC: {average_precision_score(y_test, probs_h):.4f}")
else:
    rf_h = RandomForestClassifier(n_estimators=80, class_weight='balanced', random_state=42)
    rf_h.fit(X_train_h, y_train)
    probs_h = rf_h.predict_proba(X_test_h)[:,1]
    print(f"Hybrid (IF+RF) PR-AUC: {average_precision_score(y_test, probs_h):.4f}")

# =====================
# 5. Simple Statistical baseline (amount z + rules)
# =====================
print("\n=== Statistical baseline (global z + odd hour + high kyc) ===")
stat_score = (df_sorted['amount_z_global'].iloc[split:].values > 2.5).astype(float) \
             + df_sorted['odd_hour'].iloc[split:].values * 0.5 \
             + (df_sorted['kyc_risk_score'].iloc[split:].values > 0.65).astype(float)
stat_pred = (stat_score > 1.5).astype(int)
print(f"Stat F1: {f1_score(y_test, stat_pred):.4f}, Recall: {recall_score(y_test, stat_pred):.4f}")

print("\n=== Key Takeaways for Roadmap ===")
print("- PR-AUC and Recall@K matter far more than accuracy (which will be ~0.998 trivial).")
print("- FE (velocity proxies, amount_vs_user, KYA relational like shared_device) drives big lifts.")
print("- IF provides useful anomaly signal even unsup; adding its score to XGB/RF often helps (hybrid).")
print("- Tune for your fraud rate (contamination, scale_pos_weight). Use temporal splits.")
print("- Extend: load real Kaggle, proper user-grouped rolling FE, cost-sensitive threshold, SHAP.")
print("- Limitations demo: change fraud to mimic normal more closely -> unsup PR-AUC drops.")

# Optional viz sketch (uncomment if matplotlib)
# import matplotlib.pyplot as plt
# plt.hist(scores_if[y_test==0], bins=50, alpha=0.5, label='normal')
# plt.hist(scores_if[y_test==1], bins=20, alpha=0.7, label='fraud')
# plt.legend(); plt.title('IF Anomaly Scores (higher=more fraud-like)'); plt.show()
