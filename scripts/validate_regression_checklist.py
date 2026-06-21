#!/usr/bin/env python3
"""
Regression Test Gate Validator
==============================

MANDATORY before marking ANY checklist item as DONE.

Usage:
    python scripts/validate_regression_checklist.py

This script:
1. Runs the full regression test suite (pytest -m regression or all marked tests)
2. Runs critical end-to-end toys / pipelines
3. Exits non-zero if any test fails

Rule:
- You are FORBIDDEN from updating todos, state checklists, or declaring
  "done" on any item until this script (or equivalent full test run) passes.

This enforces the instruction: "create checklist 'regression tests' to ensure
before marking a checklist as done you force tests to ensure it is done"

Add new regression tests under tests/ with appropriate markers.
"""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent

REGRESSION_TEST_FILES = [
    "tests/test_synthetic_data.py",
    "tests/test_isolation_forest_toy.py",
    # Add more regression files here as they are created:
    # "tests/test_full_pipeline.py",
    # "tests/regression/test_model_comparison.py",
]

def run_regression_tests() -> bool:
    print("=" * 70)
    print("REGRESSION TEST GATE — ENFORCED BEFORE ANY CHECKLIST MARKING")
    print("=" * 70)

    cmd = [
        sys.executable, "-m", "pytest",
        "-v",
        "--tb=short",
    ] + REGRESSION_TEST_FILES

    print(f"\nRunning: {' '.join(cmd)}\n")
    result = subprocess.run(cmd, cwd=ROOT)

    if result.returncode != 0:
        print("\n❌ REGRESSION TESTS FAILED")
        print("   You MUST fix failures before marking any checklist item done.")
        return False

    print("\n✅ ALL REGRESSION TESTS PASSED")
    print("   Safe to consider checklist progress (after also running full test suite).")
    return True


if __name__ == "__main__":
    success = run_regression_tests()
    sys.exit(0 if success else 1)
