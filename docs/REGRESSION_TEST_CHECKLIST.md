# Regression Test Checklist Gate

**CRITICAL RULE (per user instruction):**

> Before marking a checklist as done you MUST force tests to ensure it is done.

This document + `scripts/validate_regression_checklist.py` enforce that rule.

## How the Gate Works

1. **Before** flipping any todo item or state checklist to `completed`:
   - Run: `python scripts/validate_regression_checklist.py`
   - (Or full `pytest tests/ -v --tb=no`)

2. The validator runs dedicated **regression tests** that protect core invariants:
   - Data generator correctness & reproducibility
   - Toy model executability + minimum performance floors
   - (Future) Full pipeline, model comparison, ensemble behavior

3. If validator fails → **BLOCKED**. Fix tests or code. Re-run until green.

4. Only after **green run** may you update:
   - `todo_write` status
   - AGENT_STATE.md ledger / pipeline
   - Any "done" claims in docs or reflections

## Current Regression Tests (Must Pass)

| Test File                        | Purpose                                      | Key Assertions |
|----------------------------------|----------------------------------------------|----------------|
| `tests/test_synthetic_data.py`   | Data generator quality + reproducibility     | Seed equality, fraud rate bounds, graph structure, columns, temporal order |
| `tests/test_isolation_forest_toy.py` | IForest toy functional + metric floor     | Runs end-to-end, PR-AUC > 0.15 floor, scores ranked |
| (Future) Pipeline regression | Temporal split, multi-seed, Recall@K, cost | Full pipeline produces consistent metrics with temporal awareness |

## Adding New Regression Tests

When adding a new major component (new model, pipeline step, website code if testable):
1. Create `tests/test_<component>_regression.py`
2. Add strong invariants (not just unit coverage)
3. Register the file in `scripts/validate_regression_checklist.py`
4. Run the validator and confirm pass before claiming done.

## Example Enforcement in Phases

- End of Fase 1: After roadmap, run validator before "Fase1-research completed"
- End of Fase 2: After each Model Card + toy, run + add specific regression test
- End of Fase 4: Experiments comparison must have regression test asserting best model + metrics
- End of Fase 5: Full CI must include the validate script

## Quick Commands

```bash
# Run the official gate
python scripts/validate_regression_checklist.py

# Full test suite
python -m pytest tests/ -v

# Specific regression
python -m pytest tests/test_synthetic_data.py tests/test_isolation_forest_toy.py -v
```

This gate guarantees that "done" means **actually working and tested**, not aspirational.
