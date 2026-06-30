import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def run_script(script_name):
    result = subprocess.run(
        [sys.executable, str(ROOT / "experiments" / script_name)],
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=60,
        check=True,
    )
    return result.stdout


def test_classical_anomaly_suite_runs():
    output = run_script("toy_classical_anomaly_suite.py")
    assert "PR-AUC" in output
    assert "Recall@50" in output


def test_community_role_detection_runs():
    output = run_script("toy_community_role_detection.py")
    assert "Detected communities" in output
    assert "Role counts" in output


def test_temporal_graph_risk_runs():
    output = run_script("toy_temporal_graph_risk.py")
    assert "Temporal feature model PR-AUC" in output
    assert "Production upgrade" in output


def test_graphrag_analyst_runs():
    output = run_script("toy_graphrag_analyst.py")
    assert "Offline GraphRAG Analyst Memo" in output
    assert "Retrieved evidence" in output


def test_supervised_baselines_run():
    output = run_script("toy_supervised_baselines.py")
    assert "Supervised Fraud Baselines" in output
    assert "PR-AUC" in output
    assert "Recall@50" in output


def test_density_outlier_suite_runs():
    output = run_script("toy_density_outlier_suite.py")
    assert "Density Outlier Suite" in output
    assert "PR-AUC" in output
    assert "Production upgrade" in output


def test_graph_link_prediction_runs():
    output = run_script("toy_graph_link_prediction.py")
    assert "Graph Link Prediction" in output
    assert "Link prediction PR-AUC" in output
    assert "Top predicted hidden/future links" in output


def test_entity_resolution_runs():
    output = run_script("toy_entity_resolution.py")
    assert "Entity Resolution" in output
    assert "match_score" in output
    assert "Resolved entities" in output


def test_comparison_harness_mentions_expanded_families():
    output = run_script("compare_models.py")
    assert "Coordinated Model Families" in output
    assert "Isolation Forest (fast anomaly gate)" in output
    assert "LOF novelty" in output
    assert "GBDT + Isolation Forest score hybrid" in output
    assert "Every displayed family has a model card" in output
