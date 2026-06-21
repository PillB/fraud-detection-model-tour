# Limitations and Assumptions: Classical Anomaly Detection & Supervised ML for Fraud on Tabular Data

**Scope**: Rigorous, honest documentation per perspective (unsup, sup, hybrids, FE, relational). Covers general ML assumptions + fraud domain specifics (extreme imbalance ~0.1%, concept/adversarial drift, noisy/delayed labels, real-time latency, FP costs vs losses, regulatory needs). Notes what fails or requires mitigation for rare fraud labels. Cross-refs model_notes.md and papers.

**Principle**: DO NOT overstate capabilities. Where evidence limited (e.g., few direct Elliptic fraud papers), note explicitly. Sources in papers_and_sources.md.

## Cross-Cutting Assumptions in Classical Methods

1. **Data Characteristics**:
   - Tabular/structured transactions: Rows independent or weakly dependent (iid assumption in most batch training; violated by temporal/sequential nature of user behavior).
   - Features numerical or easily encoded (raw + aggregates). High-cardinality categoricals (merchants) problematic without encoding.
   - Sufficient volume of "normal" for profiling (unsup) or training (sup).

2. **Anomaly/Fraud Properties** (esp. Liu 2008/2012):
   - Unsup core: "Few and different". Fraud rate 0.01-0.5% fits "few". But "different" fails for sophisticated mimicry (fraudsters copy normal distributions, use stolen creds that look legit initially).
   - Global vs local: Some fraud global (new device burst), some local (subtle deviation for one user).

3. **Label Availability & Quality** (Supervised):
   - Assumes clean binary labels (fraud=1/0). Reality: Delayed (chargebacks weeks later), noisy (unreported fraud labeled normal; false positives from rules labeled fraud; friendly fraud), incomplete.
   - Training on historical → future fraud must resemble past (violated by adversarial evolution).

4. **Stationarity**:
   - Distributions fixed. Fraud: Strong concept drift (new attack vectors, seasonal, economic changes, model feedback loops where fraudsters adapt to deployed detectors).

5. **Evaluation**:
   - Assumes metrics reflect business (accuracy useless; see below).

## Limitations by Category

### Unsupervised Anomaly Detection (IF, LOF, OCSVM, Elliptic, Stats)

**Shared**:
- No use of available labels → suboptimal when labels exist (even if scarce).
- Thresholding/contamination: Hard without holdout anomalies or domain knowledge. In 0.172% data, default 10% contamination wildly overflags.
- FP rate: High in production; each FP has cost (review time, customer friction, declined legit txns).
- Concept drift: Static model degrades as "normal" behavior shifts or new fraud appears.
- Scalability for real-time: Training ok w/ subsampling (IF); scoring must be <ms. LOF/OCSVM heavy.
- Explainability: Scores (path length, LOF, decision fn, Mahalanobis) somewhat interpretable but not feature attributions like SHAP coefs. Regulatory (e.g., GDPR explain) challenging.
- Imbalanced data specific: Designed for rarity, but "rare normal" events (e.g., vacation spending) flagged as fraud; subtle coordinated fraud (multiple small txns) may have normal density.

**Isolation Forest Specific** (Liu 2008/2012 + fraud apps):
- Relies on isolation via random axis-aligned splits → struggles if fraud differs only on complex non-axis or interaction-heavy dimensions without good FE.
- Subsampling helps efficiency/masking but can introduce variance or miss rare structures.
- In fraud benchmarks: Strong (e.g., 91% AUC reported) but not perfect; outperformed or complemented by sup when labels present.
- Limitation evidence: Papers note it as good baseline; hybrids improve it.

**LOF Specific**:
- Distance-based → curse of dimensionality (V1-V28 PCA still high-dim; worse on rich FE 50+ cols). Distances concentrate.
- k-parameter: No universal; per-user or adaptive k rare in practice → poor locality capture.
- Batch nature: Hard for pure streaming without incremental variants.
- Fraud: Often inferior to IF in direct CC fraud comparisons (global "different" frauds more common than purely local density deviations). Slow on full Kaggle-scale without approx.
- Evidence: Kaggle analyses + IEEE papers consistently note scalability and k-sensitivity issues.

**One-Class SVM Specific**:
- Quadratic scaling/memory → impractical for full historical txn datasets (millions+). Requires heavy subsampling or approx.
- Hyperparam (nu, gamma, kernel) brittle; validation requires some anomaly examples or proxy (rare).
- Assumes training mostly normal → any mislabeled fraud in "normal" pollutes boundary badly.
- Fraud: Competitive on smaller/curated sets but rarely leads large tabular fraud leaderboards vs trees or IF. Kernel mismatch common pitfall for mixed numeric/behavioral features.
- Evidence: Literature uses but tunes carefully; scalability cited as drawback.

**Elliptic Envelope / Robust Cov**:
- Gaussian elliptical assumption → strong mismatch for txn data (amounts right-skewed, velocities count-like, time cyclic, many zeros).
- High-dim breakdown: sklearn docs warn; cov matrix estimation fails or ill-conditioned when features > ~dozens or n not sufficient. Raw Kaggle 30 feats borderline; engineered 100+ bad.
- Global only; no local or cluster-aware.
- Fraud: Very few direct high-performing citations in fraud lit. Mostly used in general AD toolkits or after heavy preprocessing (log, PCA). Not recommended standalone for transactional fraud.
- Evidence: Searches returned mostly sklearn docs + general AD; rare in top CC fraud papers vs IF/LOF/trees.

**Statistical (z-score, IQR, Mahalanobis)**:
- Univariate (z/IQR) or linear cov (Mahalanobis) → miss higher-order interactions/velocity patterns central to fraud.
- Distributional: Z-score fails on skew (amounts, inter-tx times). IQR more robust but still per-feature; tails contain legit extremes.
- Static thresholds: Seasonal/behavioral shifts (holidays, paydays) cause FPs.
- Fraud: Good only as simple rules layer or on heavily engineered "deviation" features (e.g., amount_z_user). Fraudsters stay within statistical norms.
- Evidence: General AD refs; practitioner notes favor ML over pure stats for complex fraud.

### Supervised ML (LR, RF, XGBoost/LightGBM/CatBoost)

**Shared**:
- Label dependence: Requires sufficient, timely, accurate fraud labels. In low-label regimes (new products, rare fraud types), performance collapses.
- Overfitting to historical fraud: Adversarial drift (fraudsters probe and adapt). Models can be gamed.
- Imbalance handling required: Without class_weight, scale_pos_weight, undersampling, or cost-sensitive, defaults bias to all-negative (high accuracy, zero recall).
- Feature dependence: Raw data poor. Performance highly sensitive to velocity/amount-stats/time/behavioral/KYC features. (Bahnsen 2016: FE lifts savings 13%; other studies 2x+ relative gains.)
- Evaluation trap: Accuracy/ROC-AUC inflated and misleading. Fraud rate low → trivial classifier "always legit" has 99.8% acc. Must use PR-AUC, F1 (macro/weighted careful), Recall@K (operational: investigate top-K), cost-based savings (Bahnsen), precision-recall at business thresholds.
- Calibration & threshold: Prob outputs need tuning for expected fraud cost vs FP cost. Varying txn amounts → instance-dependent costs.
- Real-time: Inference latency; feature computation (aggregates require history store).
- Data leakage: Time-travel (future info), user-level leakage if not careful split (by time or user).
- Cold-start/new entities: Poor for new users/cards with no history (KYC features help but limited).

**Logistic Regression Specific**:
- Linearity in logit: Misses non-linear interactions (e.g., high velocity AND odd hour AND new device). Requires manual polynomial/cross terms.
- Fraud: Strong for interpretability/explainability (coef signs/magnitudes map to "risk factors"). Good baseline or in hybrid ensemble for regulatory. But underperforms trees/GBDT on complex patterns in Kaggle studies.
- Limitation: Rarely SOTA; used for transparency layer.

**Random Forest Specific**:
- Tree bias/variance: Can over-emphasize high-importance features; less "boosted" correction than GBDT.
- Fraud: Very solid (often 2nd to XGB). Handles mixed features, some missing. Feature importances useful. With proper imbalance (balanced_subsample), strong.
- Limitation: Slower scoring than linear or LGBM hist; less precise on very rare events without depth.

**XGBoost / LightGBM / CatBoost Specific**:
- Hyperparameter & regularization sensitivity: Easy to overfit small fraud class without early stopping, reg params, proper pos_weight.
- Sequential nature (XGB): Slower train on huge data vs RF (LGBM faster leaf-wise).
- Fraud: Frequently highest reported metrics on structured txn data when FE + imbalance handled (scale_pos_weight = neg/pos ratio typical). Excellent at learning velocity + relational interactions. CatBoost good for merchant categories etc.
- Limitation: "Black box" (mitigated by SHAP, but adds complexity). Sensitive to train/test temporal split. Can latch onto spurious correlations that drift.
- Evidence: Numerous comparative papers; XGB tops many post-2016 fraud detection studies.

### Hybrids (Unsup Pre-filter + Supervised)

**Assumptions**: Stages are complementary (unsup catches novelty/global anomaly; sup exploits labels + rich features). Scores/features from unsup add signal.
**Limitations**:
- Pipeline complexity: Sync drift between stages; tune contamination + sup threshold jointly. Error propagation (unsup misses → sup never sees).
- Overhead: Two models to maintain/monitor/retrain.
- Validation: Need careful holdout design (temporal).
- Fraud evidence: Papers show gains (e.g., IF score + XGB > either alone), but not universal. Depends on data. Adds operational latency if not optimized.
- Not a panacea for label scarcity: Sup stage still needs labels for its portion.
- Positive: Reduces volume for expensive sup or human review; unsup provides "anomaly view" orthogonal to behavioral FE.

**Common Pitfalls**: Using same data for both without care; ignoring that good FE helps both stages.

### Feature Engineering (Velocity, Amount Stats, Time, Behavioral)

**Assumptions**: History per entity (user/card/device) available and linkable; real-time feature store for aggregates; no privacy blocks.
**Limitations & Risks**:
- History dependency & cold start: New accounts/users have no velocity → fall back to global or KYC priors (higher uncertainty, more FPs or misses).
- Computational: Real-time rolling windows (last 24h txns per user) expensive at scale (millions users); requires efficient storage/indexing or approximations (sketches).
- Concept in features themselves: "Normal" velocity changes (promo, travel, lifestyle) → features drift, need normalization or adaptive baselines.
- Overfitting to FE: Models exploit specific window sizes; brittle if fraud shifts timing.
- Privacy/Regulatory: Storing full history for aggregates; KYC data sensitive. Aggregation can leak.
- Evidence: Bahnsen 2016 + many FE papers stress importance but also that aggregation alone not enough without periodic/cost considerations. Poor FE makes even best model fail.
- Amount skew: Always log/robust-scale; raw amount dominates wrongly.

**Fraud-specific**: Velocity captures card-testing (many small) or bust-out (high sudden). But sophisticated fraud (synthetic identities, mule accounts) may build history to look normal. FE alone insufficient vs graph/relational for collusion.

### KYA/KYE / Relational Signals as Tabular Features

**Interpretation**: KYC (Know Your Customer) + KYB/KYE (Know Your Business/Entity/Employee) provide identity/verification + risk signals. Relational = links (shared devices, IPs, emails, counterparties, accounts). Flattened: counts, flags, aggregates, risk scores, graph-derived stats (degree, communities) as columns in txn feature vector.

**Assumptions**: Reliable entity resolution (hard in practice: fake IDs, VPNs); graph pre-computed or queryable at scoring time; features stable.
**Limitations**:
- Entity resolution errors → noisy/wrong relational features → model garbage-in.
- Dynamic graphs: Links evolve; static snapshot features stale.
- Scalability/privacy: Computing "shared_device_count across all" expensive; PII.
- Information loss vs native graph: Flattening loses multi-hop, structure. (Task notes "as tabular features" so this is intentional scope; full GNN later.)
- Cold entities: New fraud rings have no prior links.
- Fraud: Strong signal for synthetic/collusive (e.g., many txns from same device cluster). But sophisticated avoid shared signals. KYC risk static (onboarding) while fraud dynamic.
- Evidence: Industry (Stripe network analysis, PayPal); papers on "network-based extensions" (Van Vlasselaer APATE), KYC enrichment in feature stores. Tabular models gain from them but hybrids w/ GNNs mentioned for native relational.
- Gaps: Limited public rigorous ablations quantifying lift of specific KYA tabular vs pure behavioral on same data.

## Metrics & Operational Limitations (Imbalance Focus)

- Accuracy: Misleading (99%+ trivial).
- ROC-AUC: Over-optimistic; insensitive to prevalence.
- Preferred: PR-AUC / AUPRC (focuses on fraud class); F1 at operating point; Recall@K (K= review capacity); Precision@K; Expected cost/savings (Bahnsen cost model: FN = txn amount, FP = fixed review/admin).
- Threshold selection: Business-driven, not 0.5. Varies by amount, channel, customer segment.
- Label delay: Train on labels available at time t for txns at t-delta; evaluation must simulate production.
- Evidence: Practitioner papers (Dal Pozzolo), imbalance lit, fraud surveys.

## Industry-Reported Realities (Stripe, PayPal)

- Mix of techniques (not pure classical): rules + ML (sup + unsup + semi) + network + behavioral biometrics.
- Large proprietary data advantage (not available in public benchmarks).
- Focus: Reduce false positives (customer experience), real-time (<100ms?), adaptation.
- Hybrids + layered: Common.
- Limitations acknowledged implicitly: Ongoing arms race; ML not magic (data quality, feature eng key).
- No public detailed benchmarks vs classical only (proprietary).

## Summary of What Works for Rare Fraud Labels

- **Low/zero label**: Unsup (esp IF for speed/scale) + strong FE + simple stats/rules. Hybrids where partial labels.
- **Some labels**: Sup GBDT (XGB/LGBM) with class weights/scale_pos + excellent velocity/relational FE. Unsup scores as features.
- **Always**: Temporal splits, cost-sensitive or PR-focused eval, monitoring for drift, human-in-loop review of flags.
- **Gaps classical alone**: Novel sophisticated fraud (drift), coordinated relational (better w/ graph), very high volume low-latency explainable production.

**Honest Gaps Identified**:
- Few head-to-head on same recent real (non-Kaggle) data for Elliptic vs others.
- Limited public quantification of KYA tabular feature lift isolated from other FE.
- Most "high 99% AUC" reports highly tuned on specific Kaggle snapshot; generalization unknown.
- Production systems far more complex (feature stores, online learning, ensembles of dozens models) than single classical or sup.

**Recommendations within Scope**: Classical as robust baselines and feature generators. Pair always with rigorous FE. For roadmap: layer them (unsup scores + sup on engineered tabular incl. relational).

All claims traceable to cited searches. Update as new evidence found.
