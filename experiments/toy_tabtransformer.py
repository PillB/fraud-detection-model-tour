"""
Toy Example: TabTransformer (Tabular Transformer Simulation) for Fraud
======================================================================

Educational, fully functional toy using sklearn + feature engineering to simulate
TabTransformer behavior (contextual embeddings for categorical features like KYA).

In a full implementation, use PyTorch TabTransformer or HuggingFace for real attention.

Demonstrates processing mixed features (numerical tx + categorical KYA/merchant)
and classification on synthetic fraud data.

Reports PR-AUC and top predictions.

See docs/model-cards/TabTransformer.md for full card.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import average_precision_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from synthetic_fraud_data import generate_synthetic_fraud_data

def prepare_tabular_features(tx):
    """Prepare features mimicking TabTransformer input: num + cat (KYA-like, merchant)."""
    num_features = ['amount', 'hour', 'user_tx_count_1h', 'user_tx_count_24h']
    cat_features = ['category', 'is_night']  # simulate KYA/merchant cats
    
    # Add simulated KYA categorical for demo
    tx['kya_risk_cat'] = pd.cut(tx.get('amount', pd.Series([0]*len(tx))), bins=3, labels=['low','med','high'])
    cat_features.append('kya_risk_cat')
    
    X = tx[num_features + cat_features]
    y = tx['is_fraud']
    
    # Preprocessor: scale num, onehot cat (simulates tokenizer + embedding)
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), num_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_features)
        ])
    
    return X, y, preprocessor, num_features, cat_features

def main():
    print("=" * 60)
    print("TABTRANSFORMER SIMULATION TOY FOR FRAUD")
    print("=" * 60)
    
    tx, _, _, _ = generate_synthetic_fraud_data(n_transactions=2500, fraud_rate=0.012, seed=55)
    X, y, preprocessor, num_f, cat_f = prepare_tabular_features(tx)
    
    # Pipeline: preprocessor (embedding sim) + classifier (attention proxy via RF on transformed)
    # Real TabTrans would have transformer layers here
    clf = RandomForestClassifier(n_estimators=50, random_state=42, class_weight='balanced')
    pipe = Pipeline([
        ('preproc', preprocessor),
        ('clf', clf)
    ])
    
    # Split
    n = len(X)
    train_idx = list(range(int(0.7 * n)))
    test_idx = list(range(int(0.7 * n), n))
    
    pipe.fit(X.iloc[train_idx], y.iloc[train_idx])
    
    proba = pipe.predict_proba(X.iloc[test_idx])[:, 1]
    pr_auc = average_precision_score(y.iloc[test_idx], proba)
    print(f"TabTransformer-sim PR-AUC: {pr_auc:.4f}")
    
    # Top anomalies
    top_idx = np.argsort(-proba)[:3]
    print("\nTop 3 high-risk (sim TabTrans):")
    print(tx.iloc[[test_idx[i] for i in top_idx]][['txn_id', 'amount', 'is_fraud']].to_string(index=False))
    
    print("\nKey insight: Contextual embeddings capture interactions (e.g., amount + KYA risk).")
    print("Full version uses self-attention over feature tokens.")
    print("See TabTransformer card.")
    print("=" * 60)

if __name__ == "__main__":
    main()
