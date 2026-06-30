"""
Offline GraphRAG Analyst Workflow
=================================

Demonstrates retrieval-augmented fraud case explanation without external APIs.
It retrieves local evidence snippets and emits a deterministic analyst memo.

Run:
    python experiments/toy_graphrag_analyst.py
"""

import networkx as nx
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from synthetic_fraud_data import generate_synthetic_fraud_data


def build_evidence_docs(tx, graph):
    docs = []
    risky_tx = tx.sort_values(["is_fraud", "amount", "user_tx_count_1h"], ascending=False).head(80)
    pagerank = nx.pagerank(nx.Graph(graph))
    for row in risky_tx.itertuples(index=False):
        user_neighbors = list(graph.neighbors(row.user_id))[:8] if row.user_id in graph else []
        merchant_neighbors = list(graph.neighbors(row.merchant_id))[:8] if row.merchant_id in graph else []
        docs.append(
            {
                "id": row.txn_id,
                "text": (
                    f"Transaction {row.txn_id}: user {row.user_id} paid merchant {row.merchant_id} "
                    f"amount {row.amount:.2f} at hour {row.hour}; category {row.category}; "
                    f"night={row.is_night}; velocity_1h={row.user_tx_count_1h}; "
                    f"velocity_24h={row.user_tx_count_24h}; user_pagerank={pagerank.get(row.user_id, 0):.5f}; "
                    f"merchant_pagerank={pagerank.get(row.merchant_id, 0):.5f}; "
                    f"user_neighbors={','.join(user_neighbors)}; merchant_neighbors={','.join(merchant_neighbors)}."
                ),
                "label": int(row.is_fraud),
            }
        )
    return docs


def retrieve(query, docs, top_k=5):
    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform([d["text"] for d in docs])
    query_vec = vectorizer.transform([query])
    sims = cosine_similarity(query_vec, matrix).ravel()
    ranked = np.argsort(-sims)[:top_k]
    return [(docs[i], float(sims[i])) for i in ranked]


def analyst_memo(case_query, retrieved):
    lines = [
        "=== Offline GraphRAG Analyst Memo ===",
        f"Question: {case_query}",
        "Assessment: prioritize review if multiple retrieved facts show high amount, night timing, high velocity, or risky graph context.",
        "",
        "Retrieved evidence:",
    ]
    for rank, (doc, score) in enumerate(retrieved, 1):
        lines.append(f"{rank}. score={score:.3f} | {doc['text']}")
    lines.extend(
        [
            "",
            "Suggested next checks:",
            "- Verify whether the user-merchant edge is new or part of a known cluster.",
            "- Compare amount against user history and merchant peer group.",
            "- Inspect shared devices, worker access links, and recent KYA/KYE changes.",
            "- Treat this memo as triage support, not a final fraud determination.",
        ]
    )
    return "\n".join(lines)


def main():
    tx, _, graph, meta = generate_synthetic_fraud_data(n_transactions=2500, fraud_rate=0.012, seed=11)
    docs = build_evidence_docs(tx, graph)
    query = "high amount night transaction with velocity burst and suspicious graph neighbors"
    retrieved = retrieve(query, docs, top_k=5)
    print(f"Evidence corpus: {len(docs)} snippets from {meta['n_transactions']} transactions")
    print(analyst_memo(query, retrieved))


if __name__ == "__main__":
    main()

