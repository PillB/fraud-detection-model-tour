"""
Entity Resolution and Knowledge Graph Starter
============================================

Creates noisy duplicate identity records, blocks candidate pairs, scores string
similarity, and clusters likely matches into entity IDs. Fraud graphs and
GraphRAG workflows depend on this layer.

Run:
    python experiments/toy_entity_resolution.py
"""

from difflib import SequenceMatcher
from itertools import combinations

import networkx as nx
import pandas as pd


def similarity(a, b):
    return SequenceMatcher(None, str(a).lower(), str(b).lower()).ratio()


def make_records():
    return pd.DataFrame(
        [
            ("r1", "Ana Torres", "ana.torres@email.com", "Lima", "999111222"),
            ("r2", "Ana M Torres", "ana.torres@email.com", "Lima", "999111222"),
            ("r3", "A Torres", "atorres@mail.com", "Lima", "999111220"),
            ("r4", "Carlos Vega", "c.vega@email.com", "Bogota", "555100200"),
            ("r5", "Carlos B Vega", "c.vega@email.com", "Bogota", "555100200"),
            ("r6", "Maria Ruiz", "mruiz@email.com", "Mexico City", "441200300"),
            ("r7", "M Ruiz", "maria.ruiz@email.com", "Mexico City", "441200301"),
            ("r8", "Luis Gomez", "lgomez@email.com", "Lima", "999111222"),
        ],
        columns=["record_id", "name", "email", "city", "phone"],
    )


def candidate_pairs(records):
    pairs = []
    for _, block in records.groupby(records["email"].str.split("@").str[-1]):
        pairs.extend(combinations(block["record_id"], 2))
    return sorted(set(pairs))


def score_pair(records, left, right):
    a = records.set_index("record_id").loc[left]
    b = records.set_index("record_id").loc[right]
    email_exact = float(a["email"] == b["email"])
    phone_exact = float(a["phone"] == b["phone"])
    city_exact = float(a["city"] == b["city"])
    name_sim = similarity(a["name"], b["name"])
    # Simple transparent match probability proxy.
    score = 0.35 * email_exact + 0.30 * phone_exact + 0.15 * city_exact + 0.20 * name_sim
    return score, {"email": email_exact, "phone": phone_exact, "city": city_exact, "name_sim": round(name_sim, 3)}


def cluster_matches(records, threshold=0.72):
    g = nx.Graph()
    g.add_nodes_from(records["record_id"])
    scored = []
    for left, right in candidate_pairs(records):
        score, details = score_pair(records, left, right)
        scored.append((left, right, score, details))
        if score >= threshold:
            g.add_edge(left, right, weight=score)
    clusters = list(nx.connected_components(g))
    cluster_map = {}
    for i, cluster in enumerate(clusters, start=1):
        for record_id in cluster:
            cluster_map[record_id] = f"E{i:03d}"
    return scored, cluster_map


def main():
    records = make_records()
    scored, cluster_map = cluster_matches(records)
    output = records.assign(entity_id=records["record_id"].map(cluster_map))

    print("=== Entity Resolution + Knowledge Graph Starter ===")
    print("Candidate pairs scored:", len(scored))
    for left, right, score, details in sorted(scored, key=lambda r: r[2], reverse=True)[:8]:
        print(f"{left}-{right} match_score={score:.3f} evidence={details}")
    print("\nResolved entities:")
    print(output[["record_id", "entity_id", "name", "email", "phone"]].to_string(index=False))
    print("Graph note: use resolved entity IDs before building KYA/KYE fraud graphs, GNN features, or GraphRAG case packets.")


if __name__ == "__main__":
    main()

