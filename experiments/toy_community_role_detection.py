"""
Community and Role Detection for Criminal Network Signals
=========================================================

Builds graph features from the shared synthetic data, detects communities,
assigns simple structural roles, and scores fraud risk with a supervised model.

Run:
    python experiments/toy_community_role_detection.py
"""

import os
from pathlib import Path

os.environ.setdefault("MPLCONFIGDIR", str(Path(__file__).resolve().parent / ".mplconfig"))

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import networkx as nx
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import average_precision_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

from synthetic_fraud_data import generate_synthetic_fraud_data


def recall_at_k(y_true, scores, k=50):
    y = np.asarray(y_true)
    idx = np.argsort(-np.asarray(scores))[:k]
    return float(y[idx].sum() / y.sum()) if y.sum() else 0.0


def build_simple_graph(tx: pd.DataFrame) -> nx.Graph:
    graph = nx.Graph()
    for row in tx.itertuples(index=False):
        graph.add_edge(row.user_id, row.merchant_id, weight=float(row.amount), is_fraud=int(row.is_fraud))
    return graph


def community_map(graph: nx.Graph):
    communities = list(nx.algorithms.community.greedy_modularity_communities(graph))
    mapping = {}
    for idx, members in enumerate(communities):
        for node in members:
            mapping[node] = idx
    return mapping, communities


def node_feature_frame(graph: nx.Graph) -> pd.DataFrame:
    degrees = dict(graph.degree())
    weighted_degree = dict(graph.degree(weight="weight"))
    pagerank = nx.pagerank(graph, weight="weight")
    clustering = nx.clustering(graph)
    core = nx.core_number(graph)
    comm_map, communities = community_map(graph)
    comm_sizes = {idx: len(nodes) for idx, nodes in enumerate(communities)}

    rows = []
    for node in graph.nodes:
        degree = degrees[node]
        pr = pagerank[node]
        if degree >= 12 or pr > np.quantile(list(pagerank.values()), 0.9):
            role = "hub"
        elif core[node] >= 3 and clustering[node] > 0:
            role = "ring_member"
        elif degree <= 2:
            role = "peripheral"
        else:
            role = "broker"
        rows.append(
            {
                "entity_id": node,
                "degree": degree,
                "weighted_degree": weighted_degree[node],
                "pagerank": pr,
                "clustering": clustering[node],
                "core": core[node],
                "community": comm_map[node],
                "community_size": comm_sizes[comm_map[node]],
                "role": role,
            }
        )
    return pd.DataFrame(rows)


def transaction_graph_features(tx: pd.DataFrame, node_features: pd.DataFrame) -> pd.DataFrame:
    user_features = node_features.add_prefix("user_").rename(columns={"user_entity_id": "user_id"})
    merchant_features = node_features.add_prefix("merchant_").rename(columns={"merchant_entity_id": "merchant_id"})
    enriched = tx.merge(user_features, on="user_id", how="left").merge(merchant_features, on="merchant_id", how="left")
    enriched["same_community"] = (enriched["user_community"] == enriched["merchant_community"]).astype(int)
    enriched["hub_to_peripheral"] = (
        (enriched["user_role"].eq("hub") & enriched["merchant_role"].eq("peripheral"))
        | (enriched["merchant_role"].eq("hub") & enriched["user_role"].eq("peripheral"))
    ).astype(int)
    return enriched


def main():
    tx, _, _, meta = generate_synthetic_fraud_data(n_transactions=3000, fraud_rate=0.012, seed=8)
    graph = build_simple_graph(tx)
    node_features = node_feature_frame(graph)
    enriched = transaction_graph_features(tx, node_features)

    feature_cols = [
        "amount",
        "user_tx_count_1h",
        "user_tx_count_24h",
        "user_degree",
        "merchant_degree",
        "user_pagerank",
        "merchant_pagerank",
        "user_core",
        "merchant_core",
        "same_community",
        "hub_to_peripheral",
        "user_community_size",
        "merchant_community_size",
    ]
    x = enriched[feature_cols].fillna(0)
    y = enriched["is_fraud"]
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.3, shuffle=False)

    model = Pipeline(
        [
            ("scale", StandardScaler()),
            ("rf", RandomForestClassifier(n_estimators=120, class_weight="balanced", random_state=42)),
        ]
    )
    model.fit(x_train, y_train)
    scores = model.predict_proba(x_test)[:, 1]

    print("=== Community and Role Detection ===")
    print(f"Graph nodes={graph.number_of_nodes()} edges={graph.number_of_edges()} | fraud rate={meta['fraud_rate']:.2%}")
    print("Detected communities:", node_features["community"].nunique())
    print("Role counts:", node_features["role"].value_counts().to_dict())
    print(f"PR-AUC={average_precision_score(y_test, scores):.4f} | Recall@50={recall_at_k(y_test, scores):.3f}")

    risk_by_role = (
        enriched.groupby("user_role")["is_fraud"]
        .agg(["count", "mean"])
        .sort_values("mean", ascending=False)
    )
    print("\nUser-role fraud concentration:")
    print(risk_by_role.to_string())

    out = Path(__file__).with_name("community_role_risk.png")
    plt.figure(figsize=(7, 5))
    plt.scatter(node_features["degree"], node_features["pagerank"], c=node_features["core"], cmap="viridis", s=35)
    plt.xlabel("Degree")
    plt.ylabel("PageRank")
    plt.title("Entity roles: centrality and core structure")
    plt.colorbar(label="k-core")
    plt.tight_layout()
    plt.savefig(out, dpi=140)
    print("Saved visualization:", out)


if __name__ == "__main__":
    main()
