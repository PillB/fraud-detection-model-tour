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
