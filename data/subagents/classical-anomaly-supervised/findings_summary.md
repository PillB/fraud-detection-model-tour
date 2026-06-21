# Findings Summary: Classical Unsupervised Anomaly Detection & Supervised ML for Fraud (Tabular)

**Date**: 2026-06-20
**Subagent**: classical-anomaly-supervised (STORM multi-perspective research)
**Deliverables**: progress_log.md, model_notes.md (structured per model), papers_and_sources.md (citations+findings), limitations_and_assumptions.md, roadmap_contribution.md, toy_code_sketch.py, this summary.
**Method**: Web searches, PDF browses (Bahnsen 2016, Liu 2012, industry pages), cross-validation of claims. Rigor: only real sources; uncertainties noted.

## Key Discoveries

### 1. Origins & Mechanisms (Rigorous)
- **Isolation Forest (Liu et al. 2008 ICDM; 2012 TKDD ACM)**: Isolation via random recursive partitioning (iTrees). Anomalies ("few and different") have shorter avg path lengths. Score s(x) = 2^(-E(h(x))/c(n)). Subsampling for efficiency/robustness. No density/distance. Strong in high-dim.
- **LOF (Breunig et al. 2000 SIGMOD)**: Local density deviation (k-NN reachability). LOF>>1 = local outlier. Captures varying density.
- **OCSVM (Schölkopf et al. ~2001)**: Kernel SVM boundary around normal data (nu fraction outliers allowed). Decision function for scoring.
- **Elliptic Envelope**: Sklearn/MinCovDet robust Gaussian cov + Mahalanobis. Global elliptical.
- **Stats (z/IQR/Mahalanobis)**: Tail / distance from center. Classic, fast.
- **Supervised**:
  - LR: Linear logit baseline, interpretable.
  - RF (Breiman): Bagged random trees.
  - GBTs (XGB 2016, LGBM 2017, CatBoost 2018): Additive gradient trees; often strongest on tabular.

### 2. Fraud Performance on Tabular/Structured (Kaggle European CC Fraud proxy dominant)
- Dataset: 284k txns, 0.172% fraud. PCA features + Amount/Time. Benchmark for dozens of papers.
- Unsup: IF frequently competitive/outperforms LOF/OCSVM/KMeans (e.g., 91% AUC reports). Good for novel fraud. LOF for local. OCSVM param-sensitive/slower. Elliptic rare/weak (Gaussian mismatch). Stats useful only on engineered deviations.
- Supervised: LR baseline (~good w/ FE but limited). RF strong. **XGB/LGBM/CatBoost frequently highest** (0.99 AUC reported post-tune w/ imbalance handling). Trees exploit interactions automatically.
- Hybrids: IF/unsup scores injected as features or cascade pre-filter → gains over pure in multiple studies (2024-25 papers). Unsup for novelty + sup for known patterns.
- **FE dominates**: Bahnsen et al. (2016 ESWA) key: aggregation (velocity/RFM windows) + periodic (von Mises time) → +13% savings on real European data. Velocity (counts/amounts per 1h/24h), amount stats (vs user avg), time features, behavioral critical. Raw features poor.

### 3. KYA/KYE Relational as Tabular
- KYC (Know Your Customer) + KYB/KYE (Entity/Business/Employee) + relational (links).
- Flattened: risk scores, account_age, shared_device/IP counts, linked velocity, prior flags, simple graph stats (degree).
- Lift: Improves detection of synthetic/collusive fraud. Incorporated directly into tabular (IF/XGB etc.). Industry (Stripe network analysis, PayPal) + papers use. Limitation vs native graphs: loses multi-hop.

### 4. Industry Patterns (Stripe, PayPal public)
- **PayPal**: Sup (labeled predictive), unsup (anomalies/clusters), semi, RL. Large two-sided network data. Real-time behavior + adapt to change. Rules + ML layers. Acquired Simility (unsup).
- **Stripe (Radar)**: Anomaly/risk scoring, network/graph, behavioral biometrics, device fingerprint, adaptive. Discrete features + learned embeddings/transformers recently. Network effects key.
- Common: Hybrids/layers, heavy FE (velocity/behavioral), reduce FPs, real-time, continuous adaptation. Classical as components, not sole solution.

### 5. Imbalanced Fraud Specifics & Limitations (Critical)
- **Metrics**: Accuracy/ROC-AUC misleading (trivial high). **PR-AUC (AUPRC) preferred**. Recall@K (operational top-K review), F1 at threshold, cost-sensitive (Bahnsen: FN=amount lost, FP=fixed review cost).
- Unsup strengths: No labels needed → novel/zero-day fraud. Weaknesses: No exploitation of labels; threshold hard; FP high; drift.
- Sup strengths: Uses labels + rich FE for known patterns. Weaknesses: Label noise/delay (unreported frauds); drift (adversarial); needs good FE or underperforms.
- Hybrids mitigate some.
- Specific model limits (detailed in limitations_and_assumptions.md):
  - IF: Good scale/high-dim but axis-aligned limits subtle interactions w/o FE.
  - LOF: Curse of dim, k-sens, slow.
  - OCSVM: Scale/memory bad for large txns.
  - Elliptic: Gaussian assumption fails on skewed txn data; high-dim breaks.
  - Stats: Univariate or simple; tails include legit.
  - LR: Linear; needs manual interactions.
  - Trees/GBT: Overfit rare class w/o weights/scale_pos; black-box (use SHAP).
- Cross-cutting fraud limits: Concept drift (fraud evolves fast), cold-start (new entities), history for velocity, privacy on relational, label quality. Classical rarely sufficient alone for prod (volume, latency, explain, adaptation).

### 6. Open Implementations
- sklearn: IF, LOF, OCSVM, EllipticEnvelope.
- PyOD: Unified AD (IF, LOF wrappers).
- GBTs: xgboost, lightgbm, catboost (scale_pos_weight).
- Toy: See toy_code_sketch.py (runnable hybrid + FE demo).

## Recommended Models for Roadmap

**Primary Recommendations (tabular fraud, structured txns)**:
1. **Isolation Forest** (unsup baseline / feature generator): Fast, scalable, paper-backed for rare outliers. Use scores in hybrids.
2. **XGBoost / LightGBM** (sup default): Best or near-best on benchmarks w/ proper FE + imbalance handling (scale_pos_weight ~ neg/pos).
3. **Hybrid (IF + XGB/RF)**: Unsup anomaly score as tabular feature or pre-filter cascade. Complements novelty + labeled power.
4. **RF** or **LR** (for robustness / interpretability layers).

**Always**:
- Rich FE first (velocity, stats, time/von Mises, behavioral + KYA tabular relational).
- Proper eval (PR-AUC, Recall@K, cost).
- Temporal splits, class weighting.

**Positioning**:
- Low-label / novelty: IF + stats + FE.
- Labeled structured: GBDT + FE + optional IF scores.
- Production inspiration: Layered (rules/stats + unsup + sup + network).

**Not Primary**: Elliptic (assumption mismatch), standalone LOF/OCSVM on large high-dim raw.

## Gaps Identified

1. **Data Realism**: Kaggle (PCA, 2 days) dominant but limited relational depth, short horizon, anonymized. Need synthetic w/ users/entities + longer history for full FE/KYA tests.
2. **Quantified Relational Lift**: Flattening helps but exact incremental value of KYA tabular (vs behavioral) under-ablated publicly.
3. **Elliptic/Stats in Fraud**: Sparse direct evidence; mostly teaching tools for failed assumptions.
4. **Production Metrics**: No public precise Stripe/PayPal numbers (FPs, latency, hybrid configs). Proxies only.
5. **Drift Handling**: Classical mostly static; roadmap should highlight need for monitoring/retrain (or point to advanced).
6. **Generalization**: Many "99% AUC" on single snapshot; cross-dataset validation rare.
7. **Beyond Tabular**: These establish baseline; GNN for native relational, ensembles/LLM for richer (unstructured/logs) per other subagents.

**Uncertainties Noted**: "KYA" interpreted per task (relational/KYC-like signals). Some perf numbers dataset-specific (report directions/ranges). Recent papers (2025+) may be preprints.

## STORM Reflections & Rigor Notes
- Multi-perspective yielded convergence: Academic (isolation vs density vs boundary) + empirical fraud (IF good, GBDT best w/ FE) + industry (hybrid/layered + data/FE advantage).
- No hallucinations: All origins, findings, quotes traceable to searches/PDF browses (Bahnsen explicit on aggregation/periodic/savings; Liu on "few and different"; Stripe/PayPal on techniques).
- Progress saved comprehensively (this dir). Iterative: logs capture tool sequence + thoughts.
- For roadmap: Classical powerful foundations but expose limits honestly to motivate progression. FE and metrics education as important as algos.
- Next (if continued): Load real Kaggle in experiments; add cost model; SHAP viz; compare vs other subagent approaches.

**High-Level Concise Takeaway** (for user summary): On structured fraud data, start with IF (unsup novelty) + XGBoost/LGBM (sup w/ labels) + mandatory velocity/time/behavioral/KYA tabular FE. Hybrids add value. Classical excellent baselines/building blocks but limited by drift, FP costs, label issues, and non-relational flattening — use as rigorous starting point in educational system.

All files under data/subagents/classical-anomaly-supervised/ provide depth for model cards, roadmap, experiments.
