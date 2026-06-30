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

