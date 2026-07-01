"""
Regression + Unit Tests for Synthetic Fraud Data Generator
==========================================================

These tests ensure the data generator (core of all experiments and pipeline)
produces valid, representative, reproducible data.

Part of the mandatory Regression Test Gate:
- Before marking any checklist item "done", these + other regression tests
  MUST be executed and pass.

Run:
    python -m pytest tests/test_synthetic_data.py -v --tb=line
"""

import pytest
import pandas as pd
import sys
from pathlib import Path

# Ensure experiments on path
sys.path.insert(0, str(Path(__file__).parent.parent / "experiments"))

from synthetic_fraud_data import generate_synthetic_fraud_data


class TestSyntheticDataRegression:
    """Regression tests — must always pass for data quality invariants."""

    def test_reproducible_with_seed(self):
        """Same seed must produce identical data (critical for regression)."""
        tx1, _, _, _ = generate_synthetic_fraud_data(n_transactions=1000, seed=123)
        tx2, _, _, _ = generate_synthetic_fraud_data(n_transactions=1000, seed=123)
        pd.testing.assert_frame_equal(tx1, tx2)

    def test_fraud_rate_in_range(self):
        """Fraud rate should be low (realistic for fraud) but > 0."""
        _, _, _, meta = generate_synthetic_fraud_data(n_transactions=5000, fraud_rate=0.01, seed=42)
        assert 0.005 < meta['fraud_rate'] < 0.03, f"Unexpected fraud rate: {meta['fraud_rate']}"

    def test_graph_structure(self):
        """Graph must contain transaction edges and some KYA/KYE relations."""
        _, _, G, meta = generate_synthetic_fraud_data(n_transactions=2000, seed=99)
        assert G.number_of_nodes() > 50
        assert G.number_of_edges() > 1000
        edge_types = set()
        for _, _, data in G.edges(data=True):
            edge_types.add(data.get('edge_type', 'unknown'))
        assert 'transaction' in edge_types

    def test_required_columns(self):
        """Transactions must have the minimal columns used by models."""
        tx, _, _, _ = generate_synthetic_fraud_data(n_transactions=500, seed=1)
        required = {'txn_id', 'timestamp', 'user_id', 'amount', 'is_fraud', 'user_tx_count_1h'}
        assert required.issubset(set(tx.columns))

    def test_imbalance(self):
        """Fraud examples must be rare — critical assumption for all models."""
        tx, _, _, _ = generate_synthetic_fraud_data(n_transactions=3000, fraud_rate=0.012, seed=55)
        fraud_count = tx['is_fraud'].sum()
        assert 5 < fraud_count < 100  # realistic rarity

    def test_temporal_order(self):
        """Timestamps should be increasing (simulates real transaction stream)."""
        tx, _, _, _ = generate_synthetic_fraud_data(n_transactions=800, seed=77)
        assert tx['timestamp'].is_monotonic_increasing

    def test_richer_signal_schema(self):
        """Generator should expose signals for tabular, temporal, anomaly, and graph models."""
        tx, _, _, meta = generate_synthetic_fraud_data(n_transactions=4000, fraud_rate=0.012, seed=2026)
        required = {
            'device_id',
            'ip_block',
            'card_id',
            'geo_distance_km',
            'prior_decline_count',
            'amount_zscore_user',
            'device_user_count',
            'ip_user_count',
            'card_user_count',
            'temporal_burst_score',
            'entity_link_risk',
            'graph_risk_score',
            'fraud_archetype',
            'label_delay_days',
            'label_quality',
            'is_chargeback_confirmed',
        }
        assert required.issubset(set(tx.columns))
        assert set(meta['signal_views']) == {
            'tabular',
            'anomaly',
            'sequence',
            'graph',
            'temporal_graph',
            'entity_resolution',
            'analyst_evidence',
        }
        assert tx['graph_risk_score'].between(0, 1).all()
        assert tx['label_quality'].between(0, 1).all()

    def test_fraud_archetypes_and_graph_edge_types(self):
        """Large samples should include diverse fraud scenarios and heterogeneous graph relations."""
        tx, _, G, meta = generate_synthetic_fraud_data(n_transactions=6000, fraud_rate=0.012, seed=2027)
        fraud_types = set(tx.loc[tx['is_fraud'].eq(1), 'fraud_archetype'])
        assert {
            'amount_night_outlier',
            'velocity_burst',
            'account_takeover',
            'collusion_ring',
            'merchant_abuse',
            'mimicry_low_signal',
        }.issubset(fraud_types)
        edge_types = {data.get('edge_type') for _, _, data in G.edges(data=True)}
        assert {
            'transaction',
            'used_device',
            'from_ip',
            'shares_address',
            'used_card',
            'worker_access',
        }.issubset(edge_types)
        assert meta['fraud_archetype_counts']['legit'] > meta['n_fraud']
        assert meta['edge_type_counts']['transaction'] == meta['n_transactions']

    def test_graph_signal_lift_for_relational_fraud(self):
        """Relational archetypes should have higher graph risk without making every fraud obvious."""
        tx, _, _, _ = generate_synthetic_fraud_data(n_transactions=5000, fraud_rate=0.012, seed=2028)
        fraud = tx[tx['is_fraud'].eq(1)]
        legit = tx[tx['is_fraud'].eq(0)]
        relational = fraud[fraud['fraud_archetype'].isin(['collusion_ring', 'mimicry_low_signal', 'account_takeover'])]
        assert relational['entity_link_risk'].median() > legit['entity_link_risk'].median()
        assert fraud['graph_risk_score'].median() > legit['graph_risk_score'].median()
        assert fraud['graph_risk_score'].min() < legit['graph_risk_score'].quantile(0.9)
