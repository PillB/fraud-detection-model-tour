# Must-Complete Model Expansion Checklist

This checklist keeps the website, model cards, experiments, and tests coordinated. A model family is not considered complete until every item below is satisfied.

## Per-Model Definition of Done

- Model appears in `docs/roadmap/exhaustive_model_catalog.md`.
- Model has a dedicated card in `docs/model-cards/` or is explicitly grouped in a family card.
- Card includes origin, mechanism, inputs/outputs, fraud fit, criminal-network fit where relevant, assumptions, limitations, references, and runnable implementation pointer.
- Website has a visible link to the card before any experiment table row or production cascade reference depends on it.
- A runnable Python example exists in `experiments/` or the card names the exact script that implements the family.
- Example uses the shared synthetic transaction/entity/graph data where feasible.
- Example reports PR-AUC, Recall@K, ranked alerts, link-prediction quality, or a clear graph/community output.
- Example runs under the default dependency set unless marked as an optional production upgrade.
- Tests cover the script or the website/card coordination.
- Spanish/English website copy stays understandable and does not introduce untranslated `data-i18n` keys.

## Current Expansion Tasks

- [x] Add first-class Isolation Forest card because comparative experiments and cascades already reference it.
- [x] Add supervised baseline card for logistic regression, Random Forest, and ExtraTrees.
- [x] Add LOF / One-Class SVM / PCA / robust covariance anomaly card.
- [x] Add density-outlier card for HBOS, ECOD, COPOD, kNN, and PyOD-style models.
- [x] Add heterogeneous graph / R-GCN card for multi-relation KYA/KYE fraud graphs.
- [x] Add GAT attention card for analyst-facing graph evidence.
- [x] Add link-prediction card for criminal network prediction.
- [x] Add entity-resolution / knowledge-graph card because graph fraud depends on identity resolution quality.
- [x] Add federated/privacy-preserving fraud card for cross-institution network intelligence.
- [x] Add runnable supervised baseline experiment.
- [x] Add runnable density-outlier experiment.
- [x] Add runnable graph link-prediction experiment.
- [x] Add runnable entity-resolution experiment.
- [x] Update website catalog so model links and experiment rows are coordinated.
- [x] Update comparative experiment script so Isolation Forest and classical families are not dangling references.
- [x] Add tests that enforce card coverage for visible/experiment model families.

## Deferred Optional Production Upgrades

- Full PyOD dependency and model zoo benchmark.
- PyTorch Geometric or DGL R-GCN/GAT/TGN examples.
- CTGAN/TabDDPM synthetic fraud augmentation.
- TensorFlow Federated or Flower federated fraud simulation.
- External LLM GraphRAG case reviewer with prompt-injection and PII controls.

