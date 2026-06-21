"""
Regression Test for Isolation Forest Toy Example
================================================

This is a **regression gate test**.

It runs the documented toy example and asserts that:
- It executes without error
- It produces reasonable fraud detection metrics (PR-AUC above floor)
- The output DataFrame contains expected columns and scores

This test MUST pass before marking any checklist item involving
"functional code", "experiments", or "model cards" as complete.

Run as part of full regression:
    python -m pytest tests/test_isolation_forest_toy.py -v
"""

import sys
import pytest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "experiments"))

from toy_isolation_forest import run_isolation_forest_toy


class TestIsolationForestToyRegression:
    """Enforced regression checks for the Isolation Forest toy."""

    def test_toy_runs_and_returns_metrics(self):
        """Full toy must complete and return usable metrics."""
        tx, model, metrics = run_isolation_forest_toy(n_tx=2000, contamination=0.015, random_state=42)

        assert 'anomaly_score' in tx.columns
        assert 'is_fraud' in tx.columns
        assert 'pr_auc' in metrics
        assert 'best_f1' in metrics

    def test_pr_auc_above_minimum_floor(self):
        """
        On our controlled synthetic data, the toy IForest must achieve
        a minimum PR-AUC. This is a regression guard.

        Note: Exact number is data-dependent but provides a stable floor
        for our generator. If it drops, it indicates a breaking change.
        """
        _, _, metrics = run_isolation_forest_toy(n_tx=2000, contamination=0.015, random_state=42)
        assert metrics['pr_auc'] > 0.15, f"PR-AUC regression: {metrics['pr_auc']} below floor 0.15"

    def test_detected_anomalies_are_ranked(self):
        """Anomaly scores must vary and top scores should be higher than average."""
        tx, _, _ = run_isolation_forest_toy(n_tx=1500, contamination=0.01, random_state=99)
        scores = tx['anomaly_score']
        assert scores.max() > scores.mean() + 0.01
        assert scores.nunique() > 10  # Not all identical
