# Model Notes: Classical Unsupervised Anomaly Detection & Supervised ML for Fraud Detection (Tabular/Structured Data)

**Scope**: Rigorous per-technique notes. Structure for each: Origin, How it Works (mechanism + key math/algorithm sketch), Pros, Cons, Assumptions, Limitations (general + high-dim/imbalance), Fraud-Specific Considerations. Hybrids + Feature Engineering section at end. Sources cross-ref to papers_and_sources.md. All backed by searches; no hallucination.

Focus: Tabular transactional data (rows = txns, columns = features incl. amount, time, user id + aggregates). Relational/KYA/KYE signals incorporated as additional tabular columns (e.g., device share count, KYC risk score).

## 1. Isolation Forest (iForest / IF)

**Origin**: Liu, F.T., Ting, K.M., Zhou, Z.H. (2008). "Isolation Forest". Proceedings of the 8th IEEE International Conference on Data Mining (ICDM). DOI: 10.1109/ICDM.2008.17. Extended in Liu et al. (2012) "Isolation-Based Anomaly Detection", ACM Transactions on Knowledge Discovery from Data (TKDD). [web:0-9,116-118, web from fraud apps]

**How it Works**:
- Core idea: Anomalies are "few and different" → easier to isolate (separate) with random partitions than normal points.
- Builds ensemble of Isolation Trees (iTrees): Randomly select feature + random split value between min/max; recurse until isolation or height limit. No density/distance.
- Anomaly Score: s(x,n) = 2 ^ (-E(h(x)) / c(n)), where h(x) = path length to isolate x in a tree; E avg over trees; c(n) = avg path length of unsuccessful search in BST of n points (normalization ~ ln(n) + gamma).
- Subsampling (size ψ << n) used during training for speed + to mitigate swamping/masking. Height limit for clusters.
- sklearn: IsolationForest(n_estimators=100, max_samples='auto', contamination='auto', ...). Predict or decision_function for scores.

**Pros**:
- Linear time O(t ψ log ψ), low memory (subsample + trees).
- Scales to large/high-dim data; insensitive to irrelevant attributes (random feature selection).
- No distribution assumptions; effective even without anomalies in training sample.
- Fast inference; provides continuous anomaly scores.
- Robust to masking/swamping per 2012 analysis.

**Cons**:
- Scores relative; threshold (or contamination) needs tuning/validation.
- May underperform if anomalies not "different" in isolation sense (e.g., clustered dense anomalies or very subtle).
- Randomness: variance across runs (seed).
- Less interpretable than tree-based sup (though path features or SHAP possible).
- Subsampling can miss some structure if not repeated well.

**Assumptions**:
- Anomalies are few and different (minority + deviate on attributes).
- Data can be partitioned effectively via axis-aligned random splits.
- Normal points require longer paths on average.

**Limitations**:
- General: Not optimized for local vs global; can miss dense anomaly groups without height limit care.
- High-dim: Actually strong here vs distance methods, but irrelevant features dilute if too many (mitigated by subsampling).
- Imbalance: Naturally suited (designed for rare outliers); but in extreme fraud (0.01%), score calibration/threshold hard; FP rate can be high without domain tuning.
- Fraud: No use of labels when available. Concept drift: fixed forest on old data misses evolving fraud.

**Fraud-Specific Considerations**:
- Widely applied to credit card fraud (Kaggle European dataset benchmarks show competitive AUC ~0.9+, often > LOF/OCSVM in direct comps). Good for detecting novel/zero-day fraud patterns without labels.
- Complements velocity: anomalies in raw + engineered features both work, but FE dramatically helps.
- In hybrids: IF anomaly score (or path features) as additional tabular feature to supervised models (XGB etc.).
- Limitations in practice: High volume txns → need efficient scoring; FPs costly (customer friction). Often used as pre-filter (flag top suspicious for review/sup model).
- Real-world proxy: Common in Kaggle/notebooks + some IEEE fraud papers; banks use variants in ensembles.
- For KYA/KYE: Feed in tabular relational (e.g. "num_linked_accounts", "shared_device_velocity") – IF isolates on those too.

**Open Impl**: sklearn.ensemble.IsolationForest; PyOD.models.iforest.IForest. Easy to add contamination=expected_fraud_rate.

## 2. Local Outlier Factor (LOF)

**Origin**: Breunig, M.M., Kriegel, H.-P., Ng, R.T., Sander, J. (2000). "LOF: Identifying Density-Based Local Outliers". ACM SIGMOD International Conference on Management of Data. [web:10-14]

**How it Works**:
- Local density-based: Compare density of a point to densities of its k-nearest neighbors.
- k-distance(p): distance to k-th nearest neighbor.
- Reachability distance: max(k-dist(neigh), dist(p,neigh)).
- Local reachability density (lrd) of p: 1 / avg reach-dist over k neighbors.
- LOF(p) = avg (lrd(neigh) / lrd(p)) over k neighbors. LOF ~1 normal; >>1 outlier (local).
- sklearn: LocalOutlierFactor(n_neighbors=20, contamination='auto', novelty=False for unsupervised or True for novelty detection).

**Pros**:
- Captures local outliers (anomalies in dense regions, normal in sparse).
- No global distribution assumption.
- Degree (not binary) of outlierness.
- Works on varying density clusters.

**Cons**:
- O(n^2) naive (or O(n log n) w/ indexing); slow/large data.
- Sensitive to choice of k (neighborhood size); no single k good for all.
- Curse of dimensionality: distances become meaningless/uniform in high-dim.
- Batch-oriented; variants for streaming.
- Computationally heavier than IF for large n.

**Assumptions**:
- Local density contrast defines outlierness.
- k is appropriate for data density variations.
- Euclidean (or chosen) distance meaningful.

**Limitations**:
- High-dim / tabular fraud: Poor without dim reduction (PCA common pre-step on Kaggle V1-V28).
- Imbalance: Can flag rare clusters as outliers even if "normal rare" (e.g. high-value legitimate users); global fraud anomalies may be missed if local density similar.
- Scalability: Not ideal for millions of txns without approx.
- General: Fails when anomalies not low-density locally.

**Fraud-Specific Considerations**:
- Applied in CC fraud papers; good for local behavioral anomalies (e.g. unusual pattern in a user's normal dense txns). Often compared to IF; mixed results (IF wins more for global "burst" fraud).
- With extreme imbalance: Useful complement (catches different outlier types), but high FP if k not tuned per user or segment.
- Feature eng synergy: Best on rich FE (velocity + time aggregates); raw PCA data limits locality.
- Hybrids: LOF scores as features or pre-filter.
- KYA/KYE tabular: Incorporate as dims (e.g. deviation from linked-entity behavior) – local density can capture collusion-like relational anomalies.
- Impl note: Use novelty=True for new txn scoring against historical "normal".

**Open Impl**: sklearn.neighbors.LocalOutlierFactor; PyOD.

## 3. One-Class SVM (OCSVM / One-Class Support Vector Machine)

**Origin**: Schölkopf, B., Williamson, R., Smola, A., Shawe-Taylor, J., Platt, J. (2001/1999 variants). "Support Vector Method for Novelty Detection" (NIPS). Related: Tax & Duin SVDD. [web:15-19]

**How it Works**:
- Learns a decision boundary (hyperplane in feature space via kernel) that separates normal data from origin with max margin; allows fraction nu of outliers in training.
- Decision function: sign( f(x) ) where f uses kernel (RBF common) + support vectors from "normal" training data.
- Anomaly score via decision_function (negative = more anomalous) or distance to boundary.
- Params: nu (upper bound on fraction outliers, lower bound on SVs; set ~fraud rate), kernel (rbf), gamma.
- sklearn: svm.OneClassSVM(nu=0.1, kernel='rbf', gamma='scale').

**Pros**:
- Handles non-linear boundaries via kernels.
- Solid theoretical foundation (SVM margin).
- Effective when "normal" class well-sampled and coherent.
- Provides scores.

**Cons**:
- O(n^2) to O(n^3) training (quadratic programming); poor scalability to large fraud datasets without approx/subsampling.
- Very sensitive to kernel choice, gamma, nu (hard to set without validation anomalies).
- Memory intensive (stores SVs).
- Assumes training data is (mostly) normal; sensitive to contamination.

**Assumptions**:
- All (or most) training examples are from the target ("normal") distribution.
- Data separable from origin in some (kernel) space.
- nu reflects expected outlier fraction.

**Limitations**:
- High-dim: Kernel trick helps but computation explodes; feature selection/PCA needed.
- Imbalance/extreme rare: nu tuning critical but validation hard (few positives); can overfit noise in "normal".
- General: Slow retraining for drift; not great for very high volume real-time without approximations.

**Fraud-Specific Considerations**:
- Used in CC fraud detection literature; often tuned with nu=0.001-0.01 matching prevalence. Competitive in small/medium datasets but lags IF/trees on large tabular in benchmarks.
- Good for "one-class" setting: train only on confirmed normal (filter known frauds out).
- Weakness in fraud: Novel frauds ok but known patterns better caught by sup; high FP or missed subtle if kernel mismatch.
- With KYC/relational tabular: Kernel can capture complex interactions if features include them (e.g. device + amount + entity links).
- In practice: Best as part of hybrid or for specific segments (e.g. per-user OCSVM for behavioral).
- Hybrids: OCSVM anomaly score or distance to boundary fed as feature to RF/XGB.

**Open Impl**: sklearn.svm.OneClassSVM. Note: for fraud often combined w/ scaling.

## 4. Elliptic Envelope (Robust Covariance / MinCovDet)

**Origin**: sklearn implementation wrapping Minimum Covariance Determinant (MCD) estimator (Rousseeuw & Van Driessen, ~1999 FastMCD). Not a single "fraud paper" origin but classic robust stats for multivariate outlier detection. [web:40-44,84]

**How it Works**:
- Assumes normal data ~ multivariate Gaussian.
- Estimates robust location (mean) and covariance via MCD: find h-subset (h ~ (n+p+1)/2) with smallest determinant cov matrix (resistant to contamination).
- Mahalanobis distance: (x - mu)^T * inv(Sigma) * (x-mu); flag points beyond chi^2 quantile or contamination threshold as outliers.
- sklearn.covariance.EllipticEnvelope(contamination=0.1, support_fraction=None, ...). Uses MinCovDet internally.

**Pros**:
- Interpretable (statistical distances).
- Robust to some contamination vs classical cov.
- Fast for moderate n, p (dim).
- Provides Mahalanobis dist scores.

**Cons**:
- Strong Gaussian assumption; fails on skewed, multimodal, heavy-tailed (common in tx amounts).
- High-dimensional breakdown: MCD computation unstable/poor when p large or n not >> p (fraud tabular often 20-100+ FE dims).
- Sensitive to contamination param.
- Not local; global elliptical.

**Assumptions**:
- Inliers follow (approx) elliptical Gaussian distribution.
- Outliers are <50% (MCD breakdown point).
- Data not too high-dim relative to sample.

**Limitations**:
- High-dim: Explicit warning in sklearn docs; cov estimation breaks.
- Non-Gaussian data: Severe degradation (fraud amounts log-normal-ish, counts discrete).
- Imbalance: Can work if "normal" is the bulk Gaussian-like after transform, but fraud rarely is.
- General: Outperformed by modern methods on complex data.

**Fraud-Specific Considerations**:
- Rarely top performer in fraud papers (more academic baseline or for pre-PCA Gaussian data). Some use in broader anomaly toolkits (PyOD ECOD etc variants).
- Useful after strong FE + log transform on amount or dim reduction.
- Not recommended primary for raw/high-dim txn data.
- Hybrids: Mahalanobis as feature or filter.
- KYA/KYE: If relational features Gaussian after norm, can flag entity outliers (unusual link patterns).
- Stats tie-in: Multivariate extension of z-score/Mahalanobis distance.

**Open Impl**: sklearn.covariance.EllipticEnvelope / MinCovDet. Consider robust scalers first.

## 5. Statistical Methods (Univariate/Multivariate)

**Origin**: Classic stats: z-score (standardized deviation), IQR (Tukey boxplot method), Mahalanobis (multivariate distance, 1936). Applied in AD for decades; no single fraud paper.

**How it Works**:
- Z-score: (x - mean)/std ; |z| > 3 flag (assumes normal).
- IQR: Q1 - 1.5*IQR to Q3 + 1.5*IQR; outside = outlier. Robust to extremes.
- Mahalanobis: As above, accounts for correlations via cov.
- Variants: modified z (MAD), rolling stats for time series.

**Pros**:
- Extremely fast, interpretable, no training/ML overhead.
- No labels.
- Easy to implement/monitor per feature or segment.

**Cons**:
- Distributional assumptions (normal for z; IQR more robust but univariate).
- Ignores multivariate interactions unless Mahalanobis.
- Thresholds arbitrary or distribution-derived; many FPs in real skewed data.
- Static; no learning complex patterns.

**Assumptions**:
- Data (or transforms) follow assumed dist (Gaussian for z/Mahalanobis).
- Independence or known correlations.
- Outliers are tail events.

**Limitations**:
- Skew/multimodal (fraud amounts, velocities): Massive FPs or misses.
- High-dim/interactions: Blind without manual combos.
- Drift: Stats shift with seasons/behavior; need adaptive (rolling).
- Imbalance: Flags statistical tails which include legit extremes (weekend spend, salary deposits).

**Fraud-Specific Considerations**:
- Baseline/simple rules layer in production (e.g., amount > 3-sigma per user). Combined with ML.
- Strong with velocity/amount FE: e.g., z-score on "amount / user_avg_30d".
- Useful pre-filter or explainable signals.
- KYA: "unusual number of linked entities" via IQR per cohort.
- Limitations amplified: Fraudsters mimic distributions; adversarial.
- Common in industry: PayPal/Stripe likely have statistical monitors alongside ML.

## Supervised ML for Fraud (Tabular Transactional)

## 6. Logistic Regression (LR)

**Origin**: Classic GLM (many refs); applied early to fraud (e.g., 2000s papers).

**How it Works**: Linear model + sigmoid for P(fraud). Maximize log-likelihood (or regularized). Coefficients directly interpretable (odds ratios).

**Pros**: Fast, interpretable (feature importances via coefs), probabilistic output, works with regularization (L1/L2), baseline.

**Cons**: Assumes linear logit; poor on complex interactions/non-linear without heavy manual FE/polynomials. Sensitive to imbalance (needs weighting).

**Assumptions**: Linearity in logit space; independent features (or handled); sufficient positives.

**Limitations**: Underfits complex fraud patterns (velocity interactions, non-linear amount effects).

**Fraud-Specific**: Excellent baseline/explainability layer (regulators like). On Kaggle often 0.9+ AUC w/ good FE but trails trees. Use class_weight or focal loss variants. Good for KYC tabular risk scores as features.

## 7. Random Forest (RF)

**Origin**: Breiman 2001; popular in fraud early.

**How it Works**: Bagged decision trees + random feature subsets at splits. Majority vote or prob avg. Handles non-linear, interactions automatically.

**Pros**: Robust, handles mixed types/missing (somewhat), feature importance (MDI/permutation), less overfitting than single trees, parallelizable.

**Cons**: Can overfit noise if not tuned; less interpretable than LR (though trees + SHAP); slower inference than LR; bias toward high-cardinality if not careful.

**Assumptions**: Sufficient data; trees capture structure.

**Limitations on imbalance**: Default tends to majority; use class_weight='balanced', balanced_subsample, or sampling.

**Fraud-Specific**: Strong performer on structured txn data + FE (Kaggle studies: competitive or best among classics). Captures complex behavioral (e.g. if velocity high AND time odd AND amount deviant). Good with relational tabular features. Often baseline in hybrids.

## 8-10. Gradient Boosting: XGBoost, LightGBM, CatBoost

**Origin**: XGBoost Chen & Guestrin 2016; LightGBM Microsoft 2017 (leaf-wise + hist); CatBoost Yandex 2018 (ordered boosting, native cats).

**How it Works**: Sequential additive trees minimizing loss (logistic for binary fraud). Gradient on residuals. Regularization, early stopping. XGB: exact/greedy; LGBM fast histogram/leaf-wise; Cat: handles categoricals well, less leakage.

**Pros**: Often SOTA on tabular (Kaggle fraud leaderboards). Automatic feature interactions, handles imbalance via scale_pos_weight / class weights. Feature importances + SHAP. Fast scoring variants. Regularization prevents overfit.

**Cons**: Hyperparam sensitive (depth, lr, n_estimators, scale_pos); can overfit small positives; sequential training slower than RF for huge data; black-box (mitigate w/ SHAP).

**Assumptions**: Boosting reduces bias; data sufficient for sequential correction.

**Limitations/Imbalance**: Critical to set pos_weight = (neg/pos) or use sampling. PR-AUC sensitive to calibration.

**Fraud-Specific**:
- Dominant in modern fraud papers on structured data: XGB/LGBM frequently highest AUC/F1 after tuning on Kaggle (0.99+ reported w/ FE+imbalance handling). Better than classical AD or LR.
- Velocity/amount stats/time/behavioral FE essential (boosting exploits them).
- Hybrids: Base learners or meta; or input IF/LOF scores.
- KYA/KYE: Excellent at using flattened relational (cat features native in CatBoost/LGBM).
- Industry: PayPal/Stripe likely heavy on GBTs or ensembles thereof for tabular risk.
- Real use: Cost-sensitive training or post-hoc threshold on expected value (Bahnsen cost model).

## Hybrids: Unsupervised Pre-filter + Supervised

**Common Patterns** (from papers):
1. Unsup (IF/LOF) scores/distances as extra features → train supervised (XGB/RF/LR). Captures "anomaly signal" explicitly.
2. Cascade: Unsup flags high-score candidates (reduce volume 10-100x); supervised classifies only those (saves compute + focuses labels).
3. Two-stage training: Unsup on all (or normal only); sup on labeled.
4. Ensemble: Average or stack scores + probs.
Examples: Multiple 2024-25 papers show gains over pure sup or unsup. Electricity/insurance fraud analogs apply to txns. [web:63-70]

**Pros of Hybrids**: Leverages labels where avail + novelty detection; reduces FP via multi-view; robust to label scarcity/noise.
**Cons**: More complex pipeline (drift sync, tuning both stages); potential error propagation.
**Fraud**: Ideal for production: unsup catches novel; sup refines known + uses rich FE. Common pattern in finance.

## Critical Feature Engineering for Transactions

**Why Critical**: Raw (amount, time, merchant) insufficient. Fraud often subtle deviation from *user* or *cohort* behavior. Studies (Bahnsen 2016 + others) show 100%+ relative gains.

**Key Categories** (tabular, computable in real-time w/ feature store):
- **Velocity**: # txns / total amount / distinct merchants in last 1h/6h/24h/7d/30d (per card/account or device). Ratio to historical avg.
- **Amount Statistics**: user/card avg/std/median amount last N txns or windows; deviation (z-score like) of current from personal avg; max/ min recent.
- **Time Features**: hour of day, day of week, is_weekend, time since last txn (interarrival), periodicity (von Mises transform per Bahnsen for circular time).
- **Behavioral**: rolling aggregates (count/ sum/ avg by merchant_cat, country, channel); recency-frequency-monetary (RFM); user profile drift (e.g. location change).
- **Derived/Risk**: amount / balance ratio; high-risk MCC flags; device newness.
- **KYA/KYE / Relational as Tabular**: KYC risk tier/score; account_age; num_previous_flags; shared_device_count (last 30d); linked_account_velocity; graph degree/num_communities if precomputed; entity similarity scores. Flattens relational without full graph model.
- **Preprocessing**: log(amount+1) for skew; scaling (robust); imputation; one-hot or target-encode cats.

**Implementation Notes**: Feature stores (e.g. for streaming aggregates). History keyed by user/card. Cold start: defaults or global stats. Privacy: careful with PII.

**Evidence**: Bahnsen 2016: aggregation + periodic → +13% savings. Multiple papers confirm FE > algo choice for classical sup. [web:55-62]

## Overall Notes for Roadmap / Model Cards
- Classical unsup: strong for exploration/novelty, low label reliance. Best as scores/features.
- Sup trees/GBDT: primary for labeled structured fraud; pair w/ excellent FE.
- Hybrids + FE: recommended path for real systems.
- All: Evaluate w/ PR-AUC, business metrics (savings, recall@1000), not accuracy. Monitor drift.
- Toy examples: See toy_code_sketch.py.

**Citations**: See papers_and_sources.md for full. All claims traceable to listed searches + browses.
