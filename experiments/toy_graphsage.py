"""
Toy Example: GraphSAGE (Simplified Graph Embedding) for Relational Fraud
========================================================================

Educational, functional toy using networkx to simulate GraphSAGE on synthetic data.

Builds a simple graph (users/merchants + KYA links + tx edges).
Computes basic inductive embeddings (neighbor mean agg).
Uses sklearn classifier on embeddings + tabular features.

Reports PR-AUC.

See docs/model-cards/GraphSAGE.md
"""

import numpy as np
import pandas as pd
import networkx as nx
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import average_precision_score
from sklearn.preprocessing import StandardScaler

from synthetic_fraud_data import generate_synthetic_fraud_data

def build_graph(tx, entities):
    G = nx.MultiDiGraph()
    # Add nodes
    for _, row in entities.iterrows():
        G.add_node(row['entity_id'], type=row.get('type', 'unknown'))
    # Add tx edges (simplified as user-merchant)
    for _, row in tx.iterrows():
        G.add_edge(row['user_id'], row['merchant_id'], amount=row['amount'], is_fraud=row['is_fraud'])
    # Add some KYA links (from generator or simple)
    users = [n for n,d in G.nodes(data=True) if d.get('type')=='user']
    for i in range(0, len(users)-1, 3):
        if i+1 < len(users):
            G.add_edge(users[i], users[i+1], type='kya')
    return G

def simple_graphsage_embeddings(G, tx):
    """Simplified GraphSAGE: mean neighbor agg for demo."""
    embeddings = {}
    for node in G.nodes():
        neighbors = list(G.neighbors(node))
        if neighbors:
            # Simple: avg 'amount' or degree features from edges
            neigh_feats = []
            for n in neighbors[:5]:  # sample
                edges = G.get_edge_data(node, n) or {}
                for e in edges.values():
                    neigh_feats.append(e.get('amount', 1.0))
            emb = np.mean(neigh_feats) if neigh_feats else 0.0
        else:
            emb = 0.0
        # Add degree
        emb = np.array([emb, G.degree(node)])
        embeddings[node] = emb
    return embeddings

def main():
    print("=" * 60)
    print("GRAPHSAGE SIM TOY FOR FRAUD")
    print("=" * 60)
    
    tx, ents, G, _ = generate_synthetic_fraud_data(n_transactions=1500, fraud_rate=0.012, seed=99)
    # Build enhanced G if needed
    G = build_graph(tx, ents)
    
    embs = simple_graphsage_embeddings(G, tx)
    
    # Merge with tabular for hybrid
    feats = []
    for uid in tx['user_id']:
        tab = tx[tx['user_id']==uid][['amount','user_tx_count_1h','user_tx_count_24h']].mean().values
        gfeat = embs.get(uid, np.zeros(2))
        feats.append(np.concatenate([tab, gfeat]))
    X = np.array(feats)
    y = tx['is_fraud'].values
    
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    
    n = len(X)
    train = slice(0, int(0.7*n))
    test = slice(int(0.7*n), n)
    
    clf = RandomForestClassifier(n_estimators=50, random_state=42, class_weight='balanced')
    clf.fit(X[train], y[train])
    proba = clf.predict_proba(X[test])[:,1]
    pr = average_precision_score(y[test], proba)
    print(f"GraphSAGE proxy (graph feats + tabular) PR-AUC: {pr:.4f}")
    
    top = np.argsort(-proba)[:3]
    print("Top graph-influenced anomalies:")
    print(tx.iloc[top][['txn_id', 'amount', 'is_fraud']].to_string(index=False))
    
    print("\nKey: Graph embeddings capture relational structure (KYA links). Combine with seq/tabular.")
    print("See GraphSAGE card. Extend with real PyG/DGL for full SAGE layers.")
    print("=" * 60)

if __name__ == "__main__":
    main()
