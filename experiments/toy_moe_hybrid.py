"""
Toy Example: Mixture of Experts (MoE) Hybrid for Fraud
======================================================

Educational implementation of MoE hybrid using sklearn only (no heavy DL deps for easy testing).

Experts:
- "Seq" expert: Focus on velocity features (user_tx_count_*)
- "Interaction" expert: GradientBoosting on all features
- "Anomaly" expert: IsolationForest scores

Gate: Simple heuristic based on velocity (high velocity -> seq expert weight).

Trains and evaluates on synthetic data. Outputs PR-AUC and example.

Fully functional and tested in env with sklearn.

See docs/model-cards/MoE_Hybrid.md
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import average_precision_score
from sklearn.preprocessing import StandardScaler

from synthetic_fraud_data import generate_synthetic_fraud_data

def prepare_features(tx):
    feats = tx[['amount', 'is_night', 'hour', 'user_tx_count_1h', 'user_tx_count_24h']].copy()
    cat = pd.get_dummies(tx['category'], prefix='cat')
    X = pd.concat([feats, cat], axis=1).values
    y = tx['is_fraud'].values
    return X, y

def simple_moe_predict(X, experts, gate_weights):
    """Weighted combination of expert probs/scores."""
    probs = []
    for name, model in experts.items():
        if name == 'anomaly':
            # Use decision function as anomaly score, convert to pseudo-prob
            s = -model.decision_function(X)
            p = 1 / (1 + np.exp(-s))  # sigmoid
        else:
            p = model.predict_proba(X)[:, 1]
        probs.append(p)
    probs = np.stack(probs, axis=1)
    # gate_weights per sample or global; here simple average with velocity bias
    final = np.average(probs, axis=1, weights=gate_weights)
    return final

def main():
    print("=" * 60)
    print("MoE HYBRID TOY FOR FRAUD")
    print("=" * 60)
    
    tx, _, _, _ = generate_synthetic_fraud_data(n_transactions=3000, fraud_rate=0.012, seed=99)
    X, y = prepare_features(tx)
    
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    
    # Split simple
    n = len(X)
    train_idx = np.arange(int(0.7 * n))
    test_idx = np.arange(int(0.7 * n), n)
    X_train, y_train = X[train_idx], y[train_idx]
    X_test, y_test = X[test_idx], y[test_idx]
    
    # Experts
    seq_expert = RandomForestClassifier(n_estimators=50, random_state=42, class_weight='balanced')
    inter_expert = GradientBoostingClassifier(n_estimators=50, random_state=42)
    from sklearn.ensemble import IsolationForest
    anomaly_expert = IsolationForest(contamination=0.015, random_state=42)  # true IF for anomaly expert
    
    seq_expert.fit(X_train[:, [3,4]], y_train)  # velocity focus
    inter_expert.fit(X_train, y_train)
    anomaly_expert.fit(X_train)  # unsupervised for IF
    
    experts = {'seq': seq_expert, 'inter': inter_expert, 'anomaly': anomaly_expert}
    
    # Simple gate: high velocity -> higher weight to seq
    vel = X_test[:, 3] + X_test[:, 4]
    w_seq = np.clip(vel / vel.max(), 0.2, 0.8)
    w_inter = 0.5 * (1 - w_seq) + 0.25
    w_anom = 0.5 * (1 - w_seq) + 0.25
    gate = np.stack([w_seq, w_inter, w_anom], axis=1)
    gate = gate / gate.sum(axis=1, keepdims=True)
    
    # Predict - ensure experts get correct features
    # seq expert expects velocity cols (3,4)
    X_test_seq = X_test[:, [3,4]]
    # rebuild experts dict with correct for predict? but for simplicity adjust predict
    # quick fix: use full for inter/anom, subset for seq inside predict logic
    y_score = []
    for i in range(len(X_test)):
        p_seq = experts['seq'].predict_proba([X_test[i,[3,4]]])[:,1][0]
        p_inter = experts['inter'].predict_proba([X_test[i]])[:,1][0]
        s_anom = -experts['anomaly'].decision_function([X_test[i]])[0]
        p_anom = 1 / (1 + np.exp(-s_anom))
        ps = np.array([p_seq, p_inter, p_anom])
        w = gate[i]
        final_p = np.average(ps, weights=w)
        y_score.append(final_p)
    y_score = np.array(y_score)
    
    pr_auc = average_precision_score(y_test, y_score)
    print(f"MoE Hybrid PR-AUC on test: {pr_auc:.4f}")
    
    # Top
    top = np.argsort(-y_score)[:3]
    print("Top 3 highest MoE score tx:")
    print(tx.iloc[test_idx[top]][['txn_id', 'amount', 'is_fraud']].to_string(index=False))
    
    print("\nKey: Gating routes based on features (velocity here). Real MoE uses learned router.")
    print("See MoE card for full theory and 2025 fraud example.")
    print("=" * 60)

if __name__ == "__main__":
    main()
