# FASE 0: Strategic Planning, Preamble & Checklists

**Project:** Complete Knowledge + Experimentation System for Fraud Detection Techniques (Structured + Unstructured Data)

**Date Started:** 2026-06-20

## Internal Preamble (Executed at Kickoff)

### Key Planning Questions Answered:
1. **Final Objective of Deliverable?**
   - A professional, rigorous, accessible BCG/McKinsey-style knowledge product.
   - Educates practitioners from beginner to advanced on fraud/anomaly detection.
   - Provides runnable code, visual explanations, Model Cards, comparative experiments.
   - Includes full reproducible pipeline, tests, CI/CD, and GitHub (PillB).
   - Serves as reference + experimentation platform.

2. **Depth & Rigor Required?**
   - Senior AI researcher level: real papers, SOTA coverage (incl. Temporal GNNs, HTGNNs, advanced ensembles).
   - Every claim backed. Model Cards with assumptions, limitations, toy code that runs.
   - No fluff. Educational handholding without sacrificing accuracy.

3. **Research Structure (Basic → SOTA)?**
   - Layered roadmap: Rules → Classical ML/AD → Deep AD → Graph → Temporal Graph → Ensembles/Hybrids → Self-supervised → LLM/Multimodal.
   - Use STORM + sub-agents for perspectives (academic, industry, implementation, limitations).
   - Multiple iterations of research + synthesis.

4. **Sub-agents Strategy?**
   - Specialized autonomous researchers:
     - classical-anomaly-supervised
     - graph-temporal-gnn
     - ensembles-sota-llm
   - All outputs saved persistently to `data/subagents/<name>/` (progress logs, papers, notes, contributions).
   - Coordinator aggregates.

5. **Ensuring Functional + Testable Code?**
   - Every Python example must `python script.py` succeed.
   - Full documented pipeline in one script.
   - Experiments script with metrics.
   - pytest for unit/integration/regression/blackbox.
   - GitHub Actions: lint, test, build site (if static), deploy validation.
   - Toy data generator that simulates transactions + graph relations + labels (rare positive).

## Regression Test Gate (Added per explicit instruction)

**New Immutable Process Rule:**

"create checklist 'regression tests' to ensure before marking a checklist as done you force tests to ensure it is done"

Implementation:
- Dedicated `scripts/validate_regression_checklist.py`
- `docs/REGRESSION_TEST_CHECKLIST.md`
- Specific regression tests in `tests/test_*regression*.py` (currently synthetic data + IF toy)
- **Before** any `todo_write` to completed, or state "done", or reflection "Fase X complete":
  1. Execute the validator script
  2. Confirm green output
  3. Log in AGENT_STATE.md ledger: "Regression gate passed for [item]"

This is now part of every phase-end validation.

## Success Checklist (General - Validated at End of Each Phase + Final)

- [ ] Research covers basic → SOTA (incl. Graph Temporal Neural Networks + advanced ensembles).
- [ ] Every model has clear Model Card (origin, pros, cons, assumptions, limitations + toy Python example).
- [ ] Conceptual visualization or animation for each major model (how it detects anomalies).
- [ ] Website professional BCG/McKinsey style, beginner-friendly with handholding.
- [ ] All code examples functional and executable.
- [ ] Comparison experiment with representative toy data (transactions + relations + behavior).
- [ ] Repo has unit + integration + regression tests + functional CI/CD.
- [ ] All content backed by real research (papers, surveys, best practices).
- [ ] **Regression Test Gate enforced** on every checklist "done".

## Per-Phase Checklists (High-Level)

**End of Fase 1 (Research + Roadmap):**
- [ ] Multiple rounds research + sub-agent outputs collected.
- [ ] Complete Roadmap document with timeline.
- [ ] Key models/architectures identified with sources.
- [ ] Gaps explicitly logged.
- [ ] **Regression gate run and passed**.

**End of Fase 2 (Model Cards + Viz):**
- [ ] Model Cards for 8+ key techniques.
- [ ] Each includes runnable Python toy.
- [ ] Visuals/diagrams embedded or referenced.
- [ ] **Regression gate run and passed** (new toys covered).

**End of Fase 3 (Website):**
- [ ] Full static site with Tailwind.
- [ ] Sections: Intro, Roadmap, Tour, Model Cards, Visuals, Experiments, Pipeline.
- [ ] Navigation intuitive, explanations clear.
- [ ] **Regression gate run** (if any executable snippets added).

**End of Fase 4 (Experiments):**
- [ ] Synthetic data generator faithful to use-case.
- [ ] ≥5 models compared.
- [ ] Fraud-appropriate metrics (PR-AUC, F1, Recall@K, etc.).
- [ ] Analysis + selection guidance.
- [ ] **Regression gate run and passed** (new comparison tests).

**End of Fase 5 (Repo + CI/CD):**
- [ ] GitHub PillB repo live.
- [ ] Tests comprehensive + passing.
- [ ] CI green on push (includes regression gate script).
- [ ] Site deployable (e.g. GitHub Pages or static).
- [ ] Fully documented end-to-end pipeline script committed.
- [ ] **Final full regression gate passed**.

## Project Structure Initialized
```
.
├── AGENT_STATE.md
├── docs/
│   ├── FASE0_PLANNING.md
│   ├── REGRESSION_TEST_CHECKLIST.md
│   └── roadmap/
├── data/
│   └── subagents/          # All sub-agent work saved here
├── website/                # Self-contained Tailwind site
├── experiments/            # Comparison experiments
├── scripts/                # validate_regression_checklist.py + full documented pipeline
├── tests/                  # Includes regression tests
└── .github/workflows/      # CI/CD (will call validator)
```

## Next Steps (Post Fase 0)
Execute phases sequentially with **mandatory regression gate** before any done status.

All sub-agent outputs → data/subagents/

## Guardrails Reaffirmed
- 3-Step Cycle on every turn.
- Sequential phases.
- **Regression Test Gate before marking done.**
- Rigor > speed.
- All code tested and runnable.
