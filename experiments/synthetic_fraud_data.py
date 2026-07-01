"""
Synthetic Fraud Data Generator
==============================

Purpose:
Generate realistic toy transactional + relational data that simulates:
- Users / accounts with KYA-like attributes
- Merchants / counterparties
- Devices, IP blocks, addresses, cards, and workers
- Timestamped transactions with behavioral features
- Heterogeneous graph edges for graph / criminal-network models
- Rare fraud labels with several archetypes and label delay

This remains a dependency-light educational generator. It is not a substitute
for production data, but it gives each model family a fair signal surface:
tabular, anomaly, sequence, graph, temporal graph, entity-resolution, and
analyst evidence.
"""

from datetime import datetime, timedelta
from typing import Dict, Tuple

import networkx as nx
import numpy as np
import pandas as pd


ARCHETYPES = [
    "amount_night_outlier",
    "velocity_burst",
    "account_takeover",
    "collusion_ring",
    "merchant_abuse",
    "mimicry_low_signal",
]


def _rolling_count_minutes(df: pd.DataFrame, minutes: int) -> pd.Series:
    """Per-user rolling count over a timestamp window, excluding current tx."""
    counts = pd.Series(0, index=df.index, dtype=int)
    window = np.timedelta64(minutes, "m")
    for _, group in df.groupby("user_id", sort=False):
        times = group["timestamp"].values.astype("datetime64[ns]")
        left = np.searchsorted(times, times - window, side="left")
        counts.loc[group.index] = np.arange(len(group)) - left
    return counts


def _safe_zscore(values: pd.Series, center: pd.Series, scale: pd.Series) -> pd.Series:
    return ((values - center) / scale.replace(0, 1e-6)).fillna(0.0)


def generate_synthetic_fraud_data(
    n_users: int = 200,
    n_merchants: int = 80,
    n_transactions: int = 10000,
    fraud_rate: float = 0.01,
    seed: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame, nx.MultiDiGraph, Dict]:
    """
    Generate end-to-end synthetic fraud dataset.

    Returns:
        transactions: pd.DataFrame with legacy columns plus richer features
        entities: pd.DataFrame with users, merchants, devices, IPs, addresses,
            cards, and workers
        graph: networkx.MultiDiGraph with typed entity, relation, and tx edges
        metadata: dict with generation info and label/graph summaries
    """
    rng = np.random.default_rng(seed)

    n_workers = 30
    n_devices = max(80, int(n_users * 1.25))
    n_ip_blocks = max(35, int(n_users * 0.35))
    n_addresses = max(70, int(n_users * 0.6))
    n_cards = max(120, int(n_users * 1.5))

    user_ids = np.array([f"U{str(i).zfill(4)}" for i in range(n_users)])
    merchant_ids = np.array([f"M{str(i).zfill(3)}" for i in range(n_merchants)])
    worker_ids = np.array([f"W{str(i).zfill(3)}" for i in range(n_workers)])
    device_ids = np.array([f"D{str(i).zfill(4)}" for i in range(n_devices)])
    ip_ids = np.array([f"IP{str(i).zfill(3)}" for i in range(n_ip_blocks)])
    address_ids = np.array([f"A{str(i).zfill(4)}" for i in range(n_addresses)])
    card_ids = np.array([f"C{str(i).zfill(5)}" for i in range(n_cards)])

    regions = np.array(["NA", "LATAM", "EU", "APAC"])
    user_region = rng.choice(regions, n_users, p=[0.45, 0.28, 0.17, 0.10])
    user_device = rng.choice(device_ids, n_users)
    user_ip = rng.choice(ip_ids, n_users)
    user_address = rng.choice(address_ids, n_users)
    user_card = rng.choice(card_ids, n_users)
    activity_propensity = rng.gamma(1.4, 1.0, n_users)
    user_weights = activity_propensity / activity_propensity.sum()
    user_avg_amount = rng.lognormal(4.25, 0.75, n_users)
    account_age_days = rng.integers(5, 2200, n_users)
    baseline_risk = np.clip(rng.beta(2, 9, n_users), 0, 0.7)

    users = pd.DataFrame(
        {
            "entity_id": user_ids,
            "type": "user",
            "account_age_days": account_age_days,
            "num_linked_entities": rng.poisson(2.2, n_users),
            "avg_tx_amount": user_avg_amount.round(2),
            "risk_score_baseline": baseline_risk.round(4),
            "region": user_region,
            "home_device_id": user_device,
            "home_ip_block": user_ip,
            "address_cluster": user_address,
            "primary_card_id": user_card,
        }
    )

    merchant_category = rng.choice(
        ["retail", "travel", "services", "crypto", "marketplace", "gaming", "cashout"],
        n_merchants,
        p=[0.36, 0.16, 0.20, 0.06, 0.12, 0.06, 0.04],
    )
    merchant_risk_numeric = np.array(
        [0.85 if cat in {"crypto", "cashout"} else 0.58 if cat in {"gaming", "marketplace"} else 0.22 for cat in merchant_category]
    )
    merchant_risk_numeric = np.clip(merchant_risk_numeric + rng.normal(0, 0.08, n_merchants), 0.03, 0.98)
    merchant_popularity = rng.gamma(1.8, 1.0, n_merchants) * (1 + merchant_risk_numeric * 0.4)
    merchant_weights = merchant_popularity / merchant_popularity.sum()
    merchants = pd.DataFrame(
        {
            "entity_id": merchant_ids,
            "type": "merchant",
            "category_risk": pd.cut(
                merchant_risk_numeric,
                bins=[0, 0.33, 0.66, 1.0],
                labels=["low", "medium", "high"],
                include_lowest=True,
            ).astype(str),
            "merchant_category": merchant_category,
            "merchant_risk_score": merchant_risk_numeric.round(4),
            "num_tx_processed": rng.integers(50, 8000, n_merchants),
        }
    )

    workers = pd.DataFrame(
        {
            "entity_id": worker_ids,
            "type": "worker",
            "tenure_days": rng.integers(30, 1500, n_workers),
            "access_level": rng.choice([1, 2, 3], n_workers, p=[0.5, 0.35, 0.15]),
            "region": rng.choice(regions, n_workers),
        }
    )
    devices = pd.DataFrame({"entity_id": device_ids, "type": "device", "device_age_days": rng.integers(1, 1400, n_devices)})
    ips = pd.DataFrame({"entity_id": ip_ids, "type": "ip_block", "ip_reputation": np.clip(rng.beta(2, 7, n_ip_blocks), 0, 1).round(4)})
    addresses = pd.DataFrame({"entity_id": address_ids, "type": "address", "region": rng.choice(regions, n_addresses)})
    cards = pd.DataFrame({"entity_id": card_ids, "type": "card", "card_age_days": rng.integers(1, 1800, n_cards)})

    entities = pd.concat([users, merchants, workers, devices, ips, addresses, cards], ignore_index=True, sort=False)

    start_time = datetime(2025, 1, 1)
    tx_times = [
        start_time + timedelta(minutes=int(x))
        for x in np.cumsum(rng.exponential(1.4, n_transactions))
    ]

    user_idx = rng.choice(np.arange(n_users), n_transactions, p=user_weights)
    merchant_idx = rng.choice(np.arange(n_merchants), n_transactions, p=merchant_weights)
    hour = np.array([t.hour for t in tx_times])
    is_night = ((hour < 6) | (hour > 22)).astype(int)
    amount = rng.lognormal(np.log(user_avg_amount[user_idx] + 1), 0.55)
    amount = np.clip(amount, 1, 20000)
    category = merchant_category[merchant_idx].copy()

    tx = pd.DataFrame(
        {
            "txn_id": [f"TXN{str(i).zfill(6)}" for i in range(n_transactions)],
            "timestamp": tx_times,
            "user_id": user_ids[user_idx],
            "merchant_id": merchant_ids[merchant_idx],
            "amount": amount,
            "hour": hour,
            "is_night": is_night,
            "category": category,
            "channel": rng.choice(["card_present", "card_not_present", "wallet", "api"], n_transactions, p=[0.46, 0.34, 0.14, 0.06]),
            "region": user_region[user_idx],
            "device_id": user_device[user_idx],
            "ip_block": user_ip[user_idx],
            "address_cluster": user_address[user_idx],
            "card_id": user_card[user_idx],
            "device_age_days": rng.integers(7, 1200, n_transactions),
            "geo_distance_km": np.clip(rng.lognormal(2.8, 1.0, n_transactions), 0, 7000),
            "prior_decline_count": rng.poisson(0.35, n_transactions),
            "merchant_risk_score": merchant_risk_numeric[merchant_idx],
            "account_age_days": account_age_days[user_idx],
            "user_baseline_risk": baseline_risk[user_idx],
        }
    ).sort_values("timestamp").reset_index(drop=True)

    n_fraud = max(1, int(round(n_transactions * fraud_rate)))
    fraud_indices = rng.choice(tx.index.to_numpy(), size=n_fraud, replace=False)
    archetype_sequence = np.resize(np.array(ARCHETYPES), n_fraud)
    rng.shuffle(archetype_sequence)

    tx["is_fraud"] = 0
    tx["fraud_archetype"] = "legit"
    tx["label_delay_days"] = rng.integers(0, 4, n_transactions)
    tx["label_quality"] = np.clip(rng.normal(0.98, 0.03, n_transactions), 0.75, 1.0).round(3)
    tx["is_chargeback_confirmed"] = 0

    ring_users = rng.choice(user_ids, size=max(6, min(18, n_users // 10)), replace=False)
    ring_merchants = rng.choice(merchant_ids, size=max(3, min(8, n_merchants // 8)), replace=False)
    ring_devices = rng.choice(device_ids, size=max(2, min(5, n_devices // 25)), replace=False)
    ring_ips = rng.choice(ip_ids, size=max(2, min(5, n_ip_blocks // 10)), replace=False)
    mule_cards = rng.choice(card_ids, size=max(3, min(8, n_cards // 20)), replace=False)
    risky_workers = rng.choice(worker_ids, size=max(2, min(5, n_workers // 6)), replace=False)

    for row_index, archetype in zip(fraud_indices, archetype_sequence):
        tx.at[row_index, "is_fraud"] = 1
        tx.at[row_index, "fraud_archetype"] = archetype
        tx.at[row_index, "label_delay_days"] = int(rng.integers(2, 45))
        tx.at[row_index, "label_quality"] = float(np.clip(rng.normal(0.86, 0.08), 0.55, 1.0))
        tx.at[row_index, "is_chargeback_confirmed"] = int(rng.random() < 0.72)

        if archetype == "amount_night_outlier":
            tx.at[row_index, "amount"] *= float(rng.uniform(4.0, 8.5))
            tx.at[row_index, "hour"] = int(rng.choice([0, 1, 2, 3, 4, 23]))
            tx.at[row_index, "is_night"] = 1
            tx.at[row_index, "channel"] = "card_not_present"
            tx.at[row_index, "geo_distance_km"] *= float(rng.uniform(2, 6))
        elif archetype == "velocity_burst":
            tx.at[row_index, "amount"] *= float(rng.uniform(1.15, 2.4))
            tx.at[row_index, "prior_decline_count"] += int(rng.integers(3, 9))
            tx.at[row_index, "channel"] = "api"
        elif archetype == "account_takeover":
            tx.at[row_index, "device_id"] = str(rng.choice(device_ids))
            tx.at[row_index, "ip_block"] = str(rng.choice(ip_ids))
            tx.at[row_index, "device_age_days"] = int(rng.integers(1, 12))
            tx.at[row_index, "geo_distance_km"] = float(rng.uniform(900, 7500))
            tx.at[row_index, "prior_decline_count"] += int(rng.integers(2, 7))
            tx.at[row_index, "channel"] = "card_not_present"
        elif archetype == "collusion_ring":
            tx.at[row_index, "user_id"] = str(rng.choice(ring_users))
            tx.at[row_index, "merchant_id"] = str(rng.choice(ring_merchants))
            tx.at[row_index, "device_id"] = str(rng.choice(ring_devices))
            tx.at[row_index, "ip_block"] = str(rng.choice(ring_ips))
            tx.at[row_index, "card_id"] = str(rng.choice(mule_cards))
            tx.at[row_index, "channel"] = "wallet"
        elif archetype == "merchant_abuse":
            risky_merchant_idx = np.argsort(-merchant_risk_numeric)[: max(5, n_merchants // 8)]
            merchant = str(rng.choice(merchant_ids[risky_merchant_idx]))
            tx.at[row_index, "merchant_id"] = merchant
            tx.at[row_index, "category"] = str(merchants.loc[merchants["entity_id"].eq(merchant), "merchant_category"].iloc[0])
            tx.at[row_index, "merchant_risk_score"] = 0.95
            tx.at[row_index, "amount"] *= float(rng.uniform(1.7, 3.4))
        elif archetype == "mimicry_low_signal":
            tx.at[row_index, "amount"] *= float(rng.uniform(0.85, 1.3))
            tx.at[row_index, "device_id"] = str(rng.choice(ring_devices))
            tx.at[row_index, "ip_block"] = str(rng.choice(ring_ips))
            tx.at[row_index, "label_quality"] = float(np.clip(rng.normal(0.7, 0.08), 0.5, 0.9))

    tx["amount"] = np.clip(tx["amount"], 1, 50000).round(2)
    tx["geo_distance_km"] = tx["geo_distance_km"].round(2)
    tx["merchant_risk_score"] = tx["merchant_risk_score"].round(4)

    tx = tx.sort_values("timestamp").reset_index(drop=True)
    tx["user_tx_count_1h"] = _rolling_count_minutes(tx, 60)
    tx["user_tx_count_24h"] = _rolling_count_minutes(tx, 24 * 60)
    tx.loc[tx["fraud_archetype"].eq("velocity_burst"), "user_tx_count_1h"] += rng.integers(
        7, 18, tx["fraud_archetype"].eq("velocity_burst").sum()
    )
    tx.loc[tx["fraud_archetype"].eq("velocity_burst"), "user_tx_count_24h"] += rng.integers(
        20, 55, tx["fraud_archetype"].eq("velocity_burst").sum()
    )

    user_amount_stats = tx.groupby("user_id")["amount"].agg(["mean", "std"]).rename(columns={"mean": "user_amount_mean", "std": "user_amount_std"})
    merchant_counts = tx.groupby("merchant_id")["txn_id"].transform("count")
    device_counts = tx.groupby("device_id")["user_id"].transform("nunique")
    ip_counts = tx.groupby("ip_block")["user_id"].transform("nunique")
    card_counts = tx.groupby("card_id")["user_id"].transform("nunique")
    tx = tx.join(user_amount_stats, on="user_id")
    tx["amount_zscore_user"] = _safe_zscore(tx["amount"], tx["user_amount_mean"], tx["user_amount_std"]).round(4)
    tx["device_user_count"] = device_counts.astype(int)
    tx["ip_user_count"] = ip_counts.astype(int)
    tx["card_user_count"] = card_counts.astype(int)
    tx["merchant_tx_count"] = merchant_counts.astype(int)
    tx["new_device_for_user"] = (tx["device_id"] != tx.groupby("user_id")["device_id"].transform("first")).astype(int)
    tx["temporal_burst_score"] = (
        tx["user_tx_count_1h"] * 0.42
        + tx["prior_decline_count"] * 0.8
        + tx["is_night"] * 0.7
        + tx["new_device_for_user"] * 1.2
    ).round(4)
    tx["entity_link_risk"] = np.clip(
        tx["device_user_count"] / 8
        + tx["ip_user_count"] / 12
        + tx["card_user_count"] / 6
        + tx["merchant_risk_score"],
        0,
        3,
    ).round(4)
    tx["graph_risk_score"] = np.clip(
        tx["entity_link_risk"] * 0.34
        + tx["temporal_burst_score"] / 15
        + tx["user_baseline_risk"] * 0.25,
        0,
        1,
    ).round(4)

    column_order = [
        "txn_id",
        "timestamp",
        "user_id",
        "merchant_id",
        "amount",
        "hour",
        "is_night",
        "category",
        "channel",
        "region",
        "device_id",
        "ip_block",
        "address_cluster",
        "card_id",
        "device_age_days",
        "geo_distance_km",
        "prior_decline_count",
        "merchant_risk_score",
        "account_age_days",
        "user_baseline_risk",
        "user_tx_count_1h",
        "user_tx_count_24h",
        "amount_zscore_user",
        "device_user_count",
        "ip_user_count",
        "card_user_count",
        "merchant_tx_count",
        "new_device_for_user",
        "temporal_burst_score",
        "entity_link_risk",
        "graph_risk_score",
        "is_fraud",
        "fraud_archetype",
        "label_delay_days",
        "label_quality",
        "is_chargeback_confirmed",
    ]
    tx = tx[column_order]

    G = nx.MultiDiGraph()
    for _, row in entities.iterrows():
        G.add_node(row["entity_id"], **row.dropna().to_dict())

    tx_node_limit = min(n_transactions, 5000)
    for i, row in tx.iterrows():
        if i < tx_node_limit:
            tx_node = f"T:{row['txn_id']}"
            G.add_node(tx_node, type="transaction", is_fraud=int(row["is_fraud"]), fraud_archetype=row["fraud_archetype"])
            G.add_edge(row["user_id"], tx_node, edge_type="initiated", is_fraud=int(row["is_fraud"]))
            G.add_edge(tx_node, row["merchant_id"], edge_type="paid_merchant", amount=float(row["amount"]), is_fraud=int(row["is_fraud"]))
        G.add_edge(
            row["user_id"],
            row["merchant_id"],
            key=row["txn_id"],
            amount=float(row["amount"]),
            timestamp=row["timestamp"],
            is_fraud=int(row["is_fraud"]),
            fraud_archetype=row["fraud_archetype"],
            edge_type="transaction",
        )
        G.add_edge(row["user_id"], row["device_id"], edge_type="used_device", is_fraud=int(row["is_fraud"]))
        G.add_edge(row["user_id"], row["ip_block"], edge_type="from_ip", is_fraud=int(row["is_fraud"]))
        G.add_edge(row["user_id"], row["address_cluster"], edge_type="shares_address", is_fraud=int(row["is_fraud"]))
        G.add_edge(row["user_id"], row["card_id"], edge_type="used_card", is_fraud=int(row["is_fraud"]))

    for user, row in users.set_index("entity_id").iterrows():
        G.add_edge(user, row["home_device_id"], edge_type="home_device", weight=1.0)
        G.add_edge(user, row["home_ip_block"], edge_type="home_ip", weight=1.0)
        G.add_edge(user, row["address_cluster"], edge_type="home_address", weight=1.0)
        G.add_edge(user, row["primary_card_id"], edge_type="primary_card", weight=1.0)

    for i in range(0, len(user_ids) - 1, 3):
        G.add_edge(str(user_ids[i]), str(user_ids[i + 1]), edge_type="kya_link", weight=1.0)
    for worker in risky_workers:
        for linked_user in rng.choice(ring_users, size=min(3, len(ring_users)), replace=False):
            G.add_edge(str(worker), str(linked_user), edge_type="worker_access", weight=1.0, risk="elevated")
    for worker in worker_ids[:10]:
        G.add_edge(str(worker), str(rng.choice(user_ids)), edge_type="kye_access", weight=1.0)
    for user in ring_users:
        G.nodes[str(user)]["ring_member"] = True
    for merchant in ring_merchants:
        G.nodes[str(merchant)]["ring_member"] = True

    edge_type_counts: Dict[str, int] = {}
    for _, _, data in G.edges(data=True):
        edge_type = data.get("edge_type", "unknown")
        edge_type_counts[edge_type] = edge_type_counts.get(edge_type, 0) + 1

    metadata = {
        "n_transactions": n_transactions,
        "n_fraud": int(tx["is_fraud"].sum()),
        "fraud_rate": float(tx["is_fraud"].mean()),
        "n_users": n_users,
        "n_merchants": n_merchants,
        "n_devices": n_devices,
        "n_ip_blocks": n_ip_blocks,
        "n_addresses": n_addresses,
        "n_cards": n_cards,
        "seed": seed,
        "graph_nodes": G.number_of_nodes(),
        "graph_edges": G.number_of_edges(),
        "edge_type_counts": edge_type_counts,
        "fraud_archetype_counts": tx["fraud_archetype"].value_counts().to_dict(),
        "label_delay_mean_days": float(tx.loc[tx["is_fraud"].eq(1), "label_delay_days"].mean()),
        "signal_views": [
            "tabular",
            "anomaly",
            "sequence",
            "graph",
            "temporal_graph",
            "entity_resolution",
            "analyst_evidence",
        ],
        "ring_users": [str(x) for x in ring_users],
        "ring_merchants": [str(x) for x in ring_merchants],
    }

    return tx.reset_index(drop=True), entities.reset_index(drop=True), G, metadata


if __name__ == "__main__":
    tx, ents, G, meta = generate_synthetic_fraud_data(n_transactions=2000, fraud_rate=0.012, seed=123)
    print("=== Synthetic Fraud Data Generated ===")
    print("Transactions shape:", tx.shape)
    print("Fraud distribution:\n", tx["is_fraud"].value_counts())
    print("Archetypes:", meta["fraud_archetype_counts"])
    print("Sample columns:", list(tx.columns)[:12])
    print("Graph: nodes=", G.number_of_nodes(), "edges=", G.number_of_edges())
    print("Edge types:", meta["edge_type_counts"])
    print("Metadata:", {k: v for k, v in meta.items() if k not in {"edge_type_counts", "ring_users", "ring_merchants"}})
    print("\nFirst 3 tx rows:")
    print(tx.head(3).to_string())
