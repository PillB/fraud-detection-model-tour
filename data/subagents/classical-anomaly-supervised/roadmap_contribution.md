# Roadmap Contribution: Classical Anomaly Detection & Supervised ML for Fraud

**Subagent**: classical-anomaly-supervised (STORM research output)
**Contribution to overall Model Tour**: Foundational layer. Provides rigorous baselines, building blocks, and feature engineering primitives for the educational roadmap (basic → advanced ensembles → GNNs → LLM/hybrids). Ensures claims grounded in papers (Liu 2008/2012, Bahnsen 2016, etc.), industry patterns (Stripe/PayPal), and limitations on imbalanced tabular fraud data.

**Scope Alignment** (per AGENT_STATE + task): Tabular/structured first (transactions + flattened KYA/KYE relational as features). Note extensibility. Toy examples runnable (sklearn/XGB). Model cards will reference these notes. Experiments should compare on realistic imbalanced txn data w/ proper metrics (PR-AUC, Recall@K, cost).

## Position in Roadmap (Recommended Structure)

**Phase / Layer 1: Classical Foundations (this research)**
- Unsupervised baselines: Isolation Forest (primary rec), LOF (local complement), OCSVM (niche), Elliptic (limited use), Statistical (rules layer).
- Supervised tabular: LR (interpretability), RF (robust), XGBoost/LightGBM/CatBoost (strong default for structured).
- Core FE primitives: velocity, amount stats, time/periodic, behavioral aggregates. KYC/relational flattened.
- Hybrids: Unsup score injection + cascade.

**Rationale for Placement**:
- Educational progression: Start simple/unsupervised (no labels), add labels → sup, combine.
- Many real systems still use these or variants as fast filters + explainable components.
- Strong on Kaggle-style benchmarks when FE good; expose limitations early (drift, FP, label issues) to motivate SOTA (ensembles, GNN for relational, temporal, LLM for unstructured).

**Integration with Other Subagents**:
- Ensembles/SOTA-LLM: Classical scores as base learners or meta-features. FE patterns reused. Hybrids extended w/ deep/LLM.
- Graph-Temporal-GNN: Flattened relational/KYA features here as tabular baseline; GNNs for native multi-hop. Temporal extensions build on time/velocity FE.
- Coordinator: Aggregate into unified pipeline (data → FE (classical) → unsup/sup/hybrid → ensemble → metrics).

## Recommended Models & Configurations for Roadmap

**For Baseline / Low-Label / Novel Fraud Scenarios**:
- **Isolation Forest** (primary unsup rec): n_estimators=100-200, max_samples=256 or 'auto' (subsample), contamination='auto' or 0.001-0.002 (match expected). Use decision_scores_ or -path_length as feature. Fast, scalable, paper-backed (Liu).
- Stats rules: Per-user or per-cohort z-score/IQR on amount/velocity (log transform first).
- Hybrid starter: IF score + basic aggregates → simple threshold or LR.

**For Labeled Tabular Fraud (Recommended Primary)**:
- **XGBoost or LightGBM** (with careful config): 
  - scale_pos_weight = (n_neg / n_pos) or tuned via CV on PR-AUC.
  - objective='binary:logistic', eval_metric='aucpr' or custom cost.
  - max_depth=3-6 (shallow for fraud to avoid overfit), learning_rate=0.05-0.1, n_estimators early-stop on val.
  - Feature importances + SHAP for explanations.
- **Random Forest** alternative: class_weight='balanced' or 'balanced_subsample'.
- **LR** for explainable baseline / regulatory layer: L2 reg, class_weight.

**Hybrids (Strongly Recommended for Realism)**:
- Stage 1: IF (or ensemble unsup) on all or normal-only → top-X% or score > thresh as candidate set.
- Stage 2: XGB/RF on candidates using full FE + unsup scores as columns.
- Or: Concat IF/LOF/OCSVM decision scores as 1-3 extra features to any sup model.
- Evidence: Multiple papers show lift; aligns w/ industry (PayPal Simility unsup + sup layers; Stripe multi-technique).

**Feature Engineering (Mandatory Layer, Not Optional)**:
- Always include: 
  - Velocity (counts/sums last 1h/24h/7d per card).
  - Amount stats (user rolling avg/std, current deviation).
  - Time (hour sin/cos or von Mises per Bahnsen 2016; weekend; delta last).
  - Behavioral (merchant cat aggregates, channel).
- KYA/KYE flattened tabular: KYC_risk_score, account_age_days, num_shared_devices_30d, linked_entities_count, prior_fraud_flags_on_entity, device_age.
- Preproc: RobustScaler or log1p on amounts; target encode or embed cats if high card.
- Storage: Feature store for historical aggregates (critical for production realism in experiments).

**Not Recommended as Primary (but document)**:
- EllipticEnvelope: Only after log/PCA on low-dim Gaussian-ish subsets. Note limitations in model cards.
- Pure LOF/OCSVM standalone on high-dim raw: Scalability + param issues.

## Key Contributions to Roadmap Content

1. **Model Cards Inputs** (origin, how works, pros/cons, assumptions, limitations, toy Python, viz notes):
   - Detailed in model_notes.md. Each card should include:
     - Fraud toy: Kaggle-like synthetic or subsample (imbalanced).
     - Metrics: Report PR-AUC, ROC-AUC (for contrast), F1, recall@100, estimated savings.
     - Viz: Path length hist for IF; decision boundary sketches; feature importance bar; PR curve.
     - Runnable: sklearn + xgboost snippets (minimal deps).

2. **Experiments Design**:
   - Dataset: Primary Kaggle Credit Card Fraud (or simulated w/ similar imbalance + user keys for FE). Train/test temporal split (time-ordered).
   - Ablations: Raw features vs +velocity/aggregates vs +KYA tabular. Pure sup vs +unsup scores. Single vs hybrid cascade.
   - Metrics focus: PR-AUC primary; Recall@K (K=0.1% or 1% of volume); cost model (Bahnsen: FN cost = amount, FP=cost_review).
   - Baselines: Always include IF, LR, RF, XGB, simple stats.
   - Imbalance handling variants.
   - Drift simulation: Later phases inject concept shift.

3. **Educational Narrative**:
   - "Classical methods establish intuition: unsup for 'different/few' (Liu), density for local (LOF), boundaries (OCSVM). But for fraud, feature engineering (Bahnsen) often matters more than algorithm. Supervised trees leverage labels + interactions. Hybrids combine strengths."
   - Limitations section: Link to limitations_and_assumptions.md. "These are powerful but insufficient alone for production (drift, relational native, scale, explain). Motivates ensembles/GNNs/LLMs."
   - Real cases: Cite Kaggle ubiquity, Stripe (anomaly + network + behavioral), PayPal (sup+unsup+network data), Bahnsen real processor dataset.

4. **Progression Hooks**:
   - To ensembles: Classical as diverse base models (IF + XGB + LR stack).
   - To GNN: Tabular relational FE → "now represent as graph for multi-hop KYA signals".
   - To LLM: Unstructured logs/OSINT alongside tabular classical outputs.
   - To temporal: Velocity/time FE → sequence models.

## Gaps Identified for Roadmap (Honest)

- **Data**: Public benchmarks (Kaggle) PCA-anonymized, limited relational depth, short time window (2 days). Real txn data has richer entities, longer history, more features. Recommend synthetic generator w/ users + links for experiments.
- **Relational Depth**: Flattening loses power. Roadmap should quantify lift of tabular KYA vs full graph (cross-ref graph subagent).
- **Production Fidelity**: No public latency/scale/FP-cost numbers from Stripe/PayPal exact pipelines. Use proxies + caveats.
- **Recent SOTA Comparison**: Classical still used as strong baselines in 2025 papers; quantify vs pure deep in roadmap experiments.
- **Drift & Adaptation**: Classical static by default. Roadmap should include online/retrain notes or point to later phases.
- **Evaluation Realism**: Most papers report inflated metrics; roadmap experiments must emphasize proper temporal + cost eval.
- **Elliptic/Stats**: Weak evidence for fraud efficacy → position as teaching examples of assumptions failing (Gaussian, univariate) rather than recommended.
- **Uncertainties**: "KYA" acronym less standard than KYC/KYB; interpret as entity/relational signals.

## Suggested Roadmap Milestones / Validation

- Milestone: "Classical layer complete" when model_notes + papers + toy runnable examples pass basic tests (e.g., IF detects synthetic outliers; XGB PR-AUC >0.7 on imbalanced toy).
- Compare: Unsup vs sup vs hybrid on same data; document where each wins (novel vs known fraud; low vs high label).
- Website: Clean comparison table (pros/cons, when to use, fraud metrics), interactive toy (slider on contamination/FE).
- End-to-end pipeline doc: FE module (velocity etc.) reusable.

**References to Use**: Liu 2008/2012, Bahnsen 2016, Hilal 2022 survey, Stripe/PayPal pages, Kaggle dataset + representative IEEE fraud comps. Full list in papers_and_sources.md.

This contribution ensures the roadmap starts rigorous, realistic, and educational — highlighting classical power AND limits on rare fraud labels in structured data.
