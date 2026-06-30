"""
Synthetic Fraud Data Generator
==============================

Purpose:
Generate realistic toy transactional + relational data that simulates:
- Users / accounts (with KYA-like attributes)
- Merchants / counterparties
- Workers / employees (KYE-like)
- Timestamped transactions (structured features)
- Some graph edges (shared device, KYA links, KYE)
- Rare fraud labels (imbalanced, ~1%)

Why this generator:
- Captures the exact use-case: structured (tx + relations + profiles) 
- Enables graph construction for GNN experiments
- Temporal component (timestamps)
- Behavioral signals (amounts, frequency)
- Easy to extend for unstructured log placeholders

This data is used in:
- Full documented pipeline (scripts/full_pipeline.py)
- Model comparison experiments
- All toy examples

All parameters are tunable. Default creates ~10k txns, ~200 users, small fraud rate.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Tuple, Dict
import networkx as nx


def generate_synthetic_fraud_data(
    n_users: int = 200,
    n_merchants: int = 80,
    n_transactions: int = 10000,
    fraud_rate: float = 0.01,
    seed: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, nx.MultiDiGraph, Dict]:
    """
    Generate end-to-end synthetic fraud dataset.

    Returns:
        transactions: pd.DataFrame with rich features
        entities: pd.DataFrame (users + merchants + workers profiles)
        graph: networkx MultiDiGraph (entities + tx edges + relation edges)
        metadata: dict with generation info and label distribution

    Example:
        >>> tx, ents, G, meta = generate_synthetic_fraud_data(n_transactions=5000)
        >>> print(tx['is_fraud'].value_counts())
    """
    np.random.seed(seed)

    # === Entities ===
    user_ids = [f"U{str(i).zfill(4)}" for i in range(n_users)]
    merchant_ids = [f"M{str(i).zfill(3)}" for i in range(n_merchants)]
    worker_ids = [f"W{str(i).zfill(3)}" for i in range(30)]  # KYE-style

    # User profiles (KYA-style)
    users = pd.DataFrame({
        'entity_id': user_ids,
        'type': 'user',
        'account_age_days': np.random.randint(5, 2000, n_users),
        'num_linked_entities': np.random.poisson(2, n_users),
        'avg_tx_amount': np.random.lognormal(4.5, 0.8, n_users),
        'risk_score_baseline': np.clip(np.random.beta(2, 8, n_users), 0, 0.6)
    })

    # Merchants
    merchants = pd.DataFrame({
        'entity_id': merchant_ids,
        'type': 'merchant',
        'category_risk': np.random.choice(['low', 'medium', 'high'], n_merchants, p=[0.6, 0.3, 0.1]),
        'num_tx_processed': np.random.randint(50, 5000, n_merchants)
    })

    # Workers (KYE)
    workers = pd.DataFrame({
        'entity_id': worker_ids,
        'type': 'worker',
        'tenure_days': np.random.randint(30, 1500, 30),
        'access_level': np.random.choice([1, 2, 3], 30, p=[0.5, 0.35, 0.15])
    })

    entities = pd.concat([users, merchants, workers], ignore_index=True)

    # === Transactions (core structured data) ===
    start_time = datetime(2025, 1, 1)
    tx_times = [start_time + timedelta(minutes=int(x)) for x in np.cumsum(np.random.exponential(1.5, n_transactions))]

    user_sample = np.random.choice(user_ids, n_transactions)
    merchant_sample = np.random.choice(merchant_ids, n_transactions)

    amounts = np.random.lognormal(mean=4.0, sigma=1.0, size=n_transactions).round(2)
    amounts = np.clip(amounts, 1, 15000)

    # Time features
    hours = np.array([t.hour for t in tx_times])
    is_night = ((hours < 6) | (hours > 22)).astype(int)

    # Create base transaction frame
    tx = pd.DataFrame({
        'txn_id': [f"TXN{str(i).zfill(6)}" for i in range(n_transactions)],
        'timestamp': tx_times,
        'user_id': user_sample,
        'merchant_id': merchant_sample,
        'amount': amounts,
        'hour': hours,
        'is_night': is_night,
        'category': np.random.choice(['retail', 'travel', 'services', 'crypto', 'other'], n_transactions),
    })

    # Velocity features (simulated per-user recent activity)
    tx = tx.sort_values('timestamp')
    tx['user_tx_count_1h'] = tx.groupby('user_id').cumcount() % 5 + np.random.randint(0, 3, n_transactions)  # toy proxy
    tx['user_tx_count_24h'] = tx.groupby('user_id').cumcount() % 20 + np.random.randint(0, 8, n_transactions)

    # === Inject Fraud (rare + realistic patterns) ===
    n_fraud = int(n_transactions * fraud_rate)
    fraud_indices = np.random.choice(tx.index, size=n_fraud, replace=False)

    tx['is_fraud'] = 0
    tx.loc[fraud_indices, 'is_fraud'] = 1

    # Partition fraud indices into 3 groups of (approx) equal size for pattern injection
    parts = np.array_split(fraud_indices, 3)

    # Fraud patterns (make them stand out in features)
    # 1. High amount night txns
    if len(parts[0]) > 0:
        tx.loc[parts[0], 'amount'] *= np.random.uniform(4, 9, len(parts[0]))
        tx.loc[parts[0], 'is_night'] = 1
    # 2. Sudden velocity spike
    if len(parts[1]) > 0:
        tx.loc[parts[1], 'user_tx_count_1h'] = np.random.randint(6, 15, len(parts[1]))
        tx.loc[parts[1], 'user_tx_count_24h'] = np.random.randint(25, 45, len(parts[1]))
    # 3. Unusual category
    if len(parts[2]) > 0:
        tx.loc[parts[2], 'category'] = 'crypto'

    tx['amount'] = tx['amount'].round(2)

    # === Build Graph (for GNN / relational) ===
    G = nx.MultiDiGraph()

    # Add entity nodes with attributes
    for _, row in entities.iterrows():
        G.add_node(row['entity_id'], **row.to_dict())

    # Transaction edges (main)
    for _, row in tx.iterrows():
        G.add_edge(
            row['user_id'], row['merchant_id'],
            key=row['txn_id'],
            amount=row['amount'],
            timestamp=row['timestamp'],
            is_fraud=int(row['is_fraud']),
            edge_type='transaction'
        )

    # Add some KYA-style relationship edges (shared attributes / family / business)
    for i in range(0, len(user_ids)-1, 3):
        if i+1 < len(user_ids):
            G.add_edge(user_ids[i], user_ids[i+1], edge_type='kya_link', weight=1.0)

    # Add some KYE worker links
    for w in worker_ids[:10]:
        linked_user = np.random.choice(user_ids)
        G.add_edge(w, linked_user, edge_type='kye_access', weight=1.0)

    metadata = {
        'n_transactions': n_transactions,
        'n_fraud': int(tx['is_fraud'].sum()),
        'fraud_rate': float(tx['is_fraud'].mean()),
        'n_users': n_users,
        'n_merchants': n_merchants,
        'seed': seed,
        'graph_nodes': G.number_of_nodes(),
        'graph_edges': G.number_of_edges()
    }

    return tx.reset_index(drop=True), entities, G, metadata


if __name__ == "__main__":
    # Quick validation run
    tx, ents, G, meta = generate_synthetic_fraud_data(n_transactions=2000, fraud_rate=0.012, seed=123)
    print("=== Synthetic Fraud Data Generated ===")
    print("Transactions shape:", tx.shape)
    print("Fraud distribution:\n", tx['is_fraud'].value_counts())
    print("Sample columns:", list(tx.columns)[:8])
    print("Graph: nodes=", G.number_of_nodes(), "edges=", G.number_of_edges())
    print("Metadata:", meta)
    print("\nFirst 3 tx rows:")
    print(tx.head(3).to_string())
