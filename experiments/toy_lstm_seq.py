"""
Toy Example: LSTM / Sequence Model for Behavioral Fraud
=======================================================

Simple, functional toy using sklearn on engineered sequence features (lags, velocity stats) to simulate LSTM behavior modeling.

Real LSTM would use torch/tensorflow on tx sequences per user.

Trains, scores, reports PR-AUC on synthetic.

See docs/model-cards/LSTM_Sequence.md
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import average_precision_score
from sklearn.preprocessing import StandardScaler

from synthetic_fraud_data import generate_synthetic_fraud_data

def engineer_seq_features(tx):
    """Create simple seq features (lags, stats) to proxy LSTM."""
    tx = tx.sort_values(['user_id', 'timestamp'])
    tx['lag_amount'] = tx.groupby('user_id')['amount'].shift(1).fillna(0)
    tx['lag_hour'] = tx.groupby('user_id')['hour'].shift(1).fillna(0)
    tx['vel_1h'] = tx['user_tx_count_1h']
    tx['dev_amount'] = tx.groupby('user_id')['amount'].transform(lambda x: (x - x.mean()) / (x.std() + 1e-6))
    feats = tx[['amount', 'is_night', 'hour', 'vel_1h', 'lag_amount', 'lag_hour', 'dev_amount']].copy()
    cat = pd.get_dummies(tx['category'], prefix='cat')
    X = pd.concat([feats, cat], axis=1).fillna(0).values
    y = tx['is_fraud'].values
    return X, y, tx

def main():
    print("=" * 60)
    print("LSTM SEQ TOY (sklearn proxy for behavior modeling)")
    print("=" * 60)
    
    tx, _, _, _ = generate_synthetic_fraud_data(n_transactions=2500, fraud_rate=0.012, seed=77)
    X, y, tx_sorted = engineer_seq_features(tx)
    
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    
    # Simple split
    n = len(X)
    train = slice(0, int(0.7*n))
    test = slice(int(0.7*n), n)
    
    clf = RandomForestClassifier(n_estimators=50, random_state=42, class_weight='balanced')
    clf.fit(X[train], y[train])
    
    proba = clf.predict_proba(X[test])[:,1]
    pr_auc = average_precision_score(y[test], proba)
    print(f"Seq-proxy PR-AUC: {pr_auc:.4f}")
    
    top = np.argsort(-proba)[:3] + (int(0.7*n) if isinstance(test, slice) else 0)
    print("Top seq anomalies:")
    print(tx_sorted.iloc[top][['txn_id', 'amount', 'is_fraud']].to_string(index=False))
    
    print("\nInsight: Seq models capture history deviation. LSTM would use recurrent state.")
    print("See LSTM card.")
    print("=" * 60)

if __name__ == "__main__":
    main()
