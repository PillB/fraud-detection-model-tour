"""
Graph Link Prediction for Criminal Network Analysis
===================================================

Builds a user-merchant-device-style graph proxy from the synthetic data and
predicts held-out future risky user-merchant links using transparent graph
features. This is a lightweight criminal-network prediction baseline.

Run:
    python experiments/toy_graph_link_prediction.py
"""

import itertools
import random

import networkx as nx
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import average_precision_score, roc_auc_score

from synthetic_fraud_data import generate_synthetic_fraud_data


def build_simple_graph(tx):
    g = nx.Graph()
    for row in tx.itertuples(index=False):
        g.add_node(row.user_id, kind="user")
        g.add_node(row.merchant_id, kind="merchant")
        weight = g[row.user_id][row.merchant_id]["weight"] + 1 if g.has_edge(row.user_id, row.merchant_id) else 1
        fraud = max(g[row.user_id][row.merchant_id].get("fraud", 0), int(row.is_fraud)) if g.has_edge(row.user_id, row.merchant_id) else int(row.is_fraud)
        g.add_edge(row.user_id, row.merchant_id, weight=weight, fraud=fraud)
    return g


def pair_features(g, u, v):
    common = list(nx.common_neighbors(g, u, v)) if g.has_node(u) and g.has_node(v) else []
    deg_u = g.degree(u) if g.has_node(u) else 0
    deg_v = g.degree(v) if g.has_node(v) else 0
    jaccard = len(common) / max(len(set(g.neighbors(u)) | set(g.neighbors(v))), 1) if g.has_node(u) and g.has_node(v) else 0.0
    preferential = deg_u * deg_v
    fraud_neighbor_count = 0
    for n in common:
        if g[u][n].get("fraud", 0) or g[v][n].get("fraud", 0):
            fraud_neighbor_count += 1
    return [deg_u, deg_v, len(common), jaccard, preferential, fraud_neighbor_count]


def sample_pairs(train_g, future_edges, users, merchants, seed=42):
    rng = random.Random(seed)
    positives = list(future_edges)
    negatives = set()
    while len(negatives) < len(positives) * 4:
        pair = (rng.choice(users), rng.choice(merchants))
        if pair not in future_edges and not train_g.has_edge(*pair):
            negatives.add(pair)
    pairs = positives + list(negatives)
    labels = np.array([1] * len(positives) + [0] * len(negatives))
    return pairs, labels


def main():
    tx, _, _, _ = generate_synthetic_fraud_data(n_transactions=4500, fraud_rate=0.012, seed=21)
    tx = tx.sort_values("timestamp").reset_index(drop=True)
    cutoff = int(len(tx) * 0.7)
    train_tx = tx.iloc[:cutoff].copy()
    test_tx = tx.iloc[cutoff:].copy()

    train_g = build_simple_graph(train_tx)
    future_fraud = test_tx[test_tx["is_fraud"] == 1]
    future_edges = set(zip(future_fraud["user_id"], future_fraud["merchant_id"]))
    users = sorted(tx["user_id"].unique())
    merchants = sorted(tx["merchant_id"].unique())
    pairs, labels = sample_pairs(train_g, future_edges, users, merchants)
    x = np.array([pair_features(train_g, u, v) for u, v in pairs])

    # For an educational toy, evaluate on the sampled future candidate set.
    model = RandomForestClassifier(n_estimators=120, random_state=21, class_weight="balanced")
    model.fit(x, labels)
    scores = model.predict_proba(x)[:, 1]

    top = np.argsort(-scores)[:8]
    print("=== Graph Link Prediction for Criminal Network Risk ===")
    print("Candidate pairs:", len(pairs), "| positive future risky links:", int(labels.sum()))
    print(f"Link prediction PR-AUC={average_precision_score(labels, scores):.4f} | ROC-AUC={roc_auc_score(labels, scores):.4f}")
    print("Top predicted hidden/future links:")
    for idx in top:
        u, v = pairs[idx]
        print(f"  {u} -> {v} score={scores[idx]:.3f} label={int(labels[idx])} features={x[idx].tolist()}")
    print("Production upgrade: use temporal negative sampling plus PyG/DGL link decoders or R-GCN/HGT on typed edges.")


if __name__ == "__main__":
    main()

