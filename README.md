# Fraud Detection Knowledge & Experimentation System

**Professional-grade educational platform** covering fraud and anomaly detection techniques from classical methods to state-of-the-art Temporal Graph Neural Networks and advanced ensembles.

Built in the style of top-tier strategy consulting deliverables (BCG/McKinsey clarity + rigor) combined with senior AI/ML research standards.

## Mission
Provide a complete, self-contained system that allows:
- Beginners to rapidly understand concepts with handholding
- Practitioners to see real runnable code, pros/cons, and trade-offs
- Researchers to explore SOTA (Graph + Temporal) backed by actual papers

Focus domain: **Structured data** (financial transactions, KYA/KYE relationships, user/worker profiles) + notes on **unstructured** (logs, OSINT).

## Deliverables
- **Complete Roadmap** (basic → SOTA) — see [docs/roadmap/roadmap.md](docs/roadmap/roadmap.md)
- **Model Cards** collection with:
  - Origin & mechanism
  - Pros / Cons / Assumptions / Limitations
  - Functional Python runnable example implementations
  - Conceptual visualizations
- **Professional Website** (Tailwind, clean consulting aesthetic)
- **Fully Documented End-to-End Python Pipeline**
- **Comparative Experiments** on realistic synthetic transactional + relational data
- **Tests** (unit, integration, regression, blackbox) + **CI/CD**
- GitHub repo (PillB)

## Quick Start (Local)
```bash
# After cloning
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run the complete documented pipeline
python scripts/full_pipeline.py

# Run comparison experiments
python experiments/compare_models.py

# Run tests
pytest tests/ -v
```

## Project Structure
```
.
├── AGENT_STATE.md                 # Internal execution state (strict cycle)
├── README.md
├── docs/
│   ├── FASE0_PLANNING.md
│   └── roadmap/roadmap.md
├── data/
│   └── subagents/                 # All deep research agent outputs saved here
├── website/                       # Self-contained professional site (Tailwind)
├── experiments/                   # Reproducible model comparisons + demonstration data generator
├── scripts/                       # Full documented pipeline
├── tests/                         # Comprehensive test suite
└── .github/workflows/             # CI/CD
```

## Key Models Covered (Initial)
From roadmap tiers:
- Isolation Forest
- LOF, One-Class SVM
- XGBoost / tree ensembles
- Autoencoders (hybrid)
- GraphSAGE / GAT
- Temporal Graph Networks (TGN family, HTGNN)
- Advanced ensembles & hybrids
- Notes on LLM / self-supervised extensions

## Research Foundation
- Systematic reviews 2024-2025 (arXiv, journals)
- Curated graph-fraud papers (safe-graph)
- Foundational works + recent SOTA on temporal graphs for financial anomaly
- Industry surveys (AI adoption in fraud detection)

All content is research-backed. Sub-agents used for breadth + depth following STORM methodology.

## Development Notes
- All code is functional and tested.
- Phase-by-phase execution with honest retrospectives (see AGENT_STATE.md history).
- Strict adherence to 3-step execution cycle.

## License & Usage
Educational and research use. Adapt for production with care (drift monitoring, fairness, regulatory compliance).

---

**Status:** In active phased development (see current AGENT_STATE.md).

Start with the Roadmap and then explore the website.
