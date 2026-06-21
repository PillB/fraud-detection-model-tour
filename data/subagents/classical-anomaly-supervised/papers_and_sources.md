# Papers and Sources: Classical Anomaly Detection & Supervised ML for Fraud

**Purpose**: Full citations (authors, year, venue, DOI/URL where available), key findings/extracts relevant to fraud/tabular, limitations noted. Organized by topic. All sourced from tool searches (web: ids) and browses. Prioritizes primary papers + representative fraud applications + industry. No invented sources.

**Usage**: Cross-reference in model_notes.md, limitations, roadmap. Use for roadmap_contribution and findings. For final outputs, prefer primary over secondary.

## Core Unsupervised Anomaly Detection Papers (Origins)

1. **Liu, F.T., Ting, K.M., Zhou, Z.H. (2008)**. "Isolation Forest". 2008 Eighth IEEE International Conference on Data Mining (ICDM), Pisa, 15-19 Dec 2008, pp. 413-422. DOI: 10.1109/ICDM.2008.17. ISBN 978-0-7695-3502-9.
   - Key findings: Proposes isolation (random partitioning) vs profiling normal. Anomalies "few and different" → isolated closer to root (short path lengths). iForest ensemble of iTrees. Empirical superiority in AUC/time vs existing on benchmarks. Handles high-dim, irrelevant attrs via random splits + subsampling.
   - Fraud relevance: Directly applicable to rare events. Later fraud papers cite heavily.
   - URL/PDF refs: lamda.nju.edu.cn/publication/icdm08b.pdf; researchgate. [web:0-9]

2. **Liu, F.T., Ting, K.M., Zhou, Z.H. (2012)**. "Isolation-Based Anomaly Detection". ACM Transactions on Knowledge Discovery from Data (TKDD), Vol. 6, Issue 1, Article 3.
   - Key findings (extended): Detailed analysis of isolation. Subsampling mitigates swamping/masking. Linear time O(t ψ log ψ), small mem. Outperforms ORCA, OCSVM, LOF, RF on AUC/time/robustness. Works in high-dim, when no anomalies in train. Score formula s=2^(-E(h)/c(n)).
   - Fraud: Ideal for large txn streams. Explicitly mentions credit card txns as motivating ex.
   - PDF: lamda.nju.edu.cn/publication/tkdd11.pdf. [web:116-118]

3. **Breunig, M.M., Kriegel, H.-P., Ng, R.T., Sander, J. (2000)**. "LOF: Identifying Density-Based Local Outliers". Proceedings of the 2000 ACM SIGMOD International Conference on Management of Data, pp. 93–104. DOI: 10.1145/335191.335388.
   - Key: Local Outlier Factor measures degree via local density deviation vs k-neighbors. lrd + LOF formula. Local vs global.
   - Fraud: Captures local behavioral deviations (user-specific). Commonly compared in fraud benchmarks.
   - PDF: webdocs.cs.ualberta.ca/~zaiane/pub/check/breunig.pdf. [web:10-14]

4. **Schölkopf, B. et al. (2001 / 1999 NIPS)**. "Support Vector Method for Novelty Detection". In Advances in Neural Information Processing Systems. (Related: Tax, D.M.J., Duin, R.P.W. SVDD).
   - Key: One-class SVM maps to feature space, separates data from origin w/ max margin + nu fraction outliers. Kernel for non-linear.
   - Fraud: Novelty detection on "normal" txns. Used in fraud lit.
   - Refs: papers.neurips.cc/paper/1723-... ; related JMLR. [web:15-19]

5. **Rousseeuw, P.J. & Van Driessen, K. (1999)**. "A Fast Algorithm for the Minimum Covariance Determinant Estimator". Technometrics (basis for EllipticEnvelope/MinCovDet in sklearn).
   - Key: Robust cov estimator resistant to contamination for multivariate Gaussian outlier detection via Mahalanobis.
   - Fraud: Limited direct; baseline for Gaussian-assuming data post-transform.
   - Sklearn doc + stats refs. [web:40-44]

## Feature Engineering & Cost-Sensitive (Critical for Fraud)

6. **Bahnsen, A.C., Aouada, D., Stojanovic, A., Ottersten, B. (2016)**. "Feature engineering strategies for credit card fraud detection". Expert Systems with Applications, 51, 134–142. DOI: 10.1016/j.eswa.2015.12.030.
   - Key findings (from full PDF browse): Expands transaction aggregation (prior Whitrow 2008, Jha 2012). New periodic features via von Mises distribution on time-of-transaction (circular stats for hour/day patterns). Real European card processor dataset. State-of-the-art models (incl. cost-sensitive). Periodic + aggregation → average 13% increase in savings. Emphasizes actual financial costs (FP admin vs variable FN loss) over misclassification error. Skew, cost-sensitivity, feature extraction key challenges.
   - Fraud-specific: "when constructing a credit card fraud detection model, it is very important how to extract the right features from the transactional data... aggregating the transactions in order to observe the spending behavioral patterns".
   - PDF: albahnsen.github.io/files/..._published.pdf. Highly cited (600+). [web:57,92-94, browse extract]

7. **Whitrow, C., Hand, D.J., et al. (2008)**. "Transaction aggregation as a strategy for credit card fraud detection". Data Mining and Knowledge Discovery.
   - Precursor to Bahnsen; aggregation over time windows.
   - Cited in Bahnsen.

8. **Jha, S. et al. (2012)**. "Employing transaction aggregation strategy to detect credit card fraud". Expert Systems with Applications.
   - Aggregation features.

Additional FE papers (velocity etc.): Multiple 2020-2024 works confirm RFM-like, rolling velocity, amount stats, time features boost performance 100%+ relative in some studies. [web:55-62]

## Fraud Application Papers & Benchmarks (Primarily Kaggle European CC Fraud Dataset)

Common dataset: "Credit Card Fraud Detection" (Kaggle, MLG-ULB / Dal Pozzolo et al. refs). 284,807 European txns Sept 2013 (2 days), 492 fraud (0.172%). Features: Time, Amount, V1..V28 (PCA anonymized), Class. Highly imbalanced. Used as standard benchmark.

9. Representative IF/LOF fraud:
   - Ounacer et al. (various). "Using Isolation Forest in anomaly detection: the case of credit card transactions". IF 91% AUC > LOF/OCSVM/KMeans.
   - Zadafiya et al. (2022). Detecting Credit Card Frauds Using Isolation Forest... IEEE.
   - Waspada et al. Performance Analysis of Isolation Forest... 97.69% acc, F1 0.82 (note: acc misleading due imbalance).
   - Multiple Kaggle notebooks + IEEE 2022: IF + LOF direct comps; IF generally stronger for this data.
   - Negi et al. (2022). Degree of Accuracy... LOF + IF.
   - [web:20-34]

10. OCSVM fraud:
    - Hejazi & Abadeh (2013). "ONE-CLASS SUPPORT VECTOR MACHINES...". Applied Intelligence. Two-class vs one-class SVM for CC fraud.
    - Garg et al. (2024). Fine-tuned OCSVM for anomaly.
    - Medium/practical guides tune nu~0.01. [web:35-39]

11. Supervised / GBT comparisons:
    - Afriyie et al. (2023). "A supervised machine learning algorithm for detecting and predicting fraud in credit card transactions". Decision Analytics Journal. LR, RF, DT eval; RF strong.
    - Many 2024-2025 IEEE/others: XGB often tops after tuning (AUC 0.99+, high recall w/ SMOTE/weight). RF close second. LR baseline. CatBoost/LGBM strong on categoricals/ speed.
    - Ujkani et al., "Performance Comparison of Supervised...". 
    - Gamal et al. (2026). Hybrid w/ XGB meta. [web:45-54]
    - Specific: "XGBoost model surpassed Random Forest and Logistic Regression, with a ROC AUC of 99%" (various post-tune reports).

12. Hybrids:
    - Shanaa et al. (2025). "A Hybrid Anomaly Detection Framework Combining supervised (XGBoost, RF) and unsupervised (AE, IF)".
    - Monteiro et al. (2025). IF + XGB framework (electricity but transferable).
    - Chugh et al. (2025). Probabilistic hybrid.
    - Kaggle/LinkedIn: IF score as input to sup. [web:63-70]

13. Surveys / Broader:
    - Hilal, W. et al. (2022). "Financial Fraud: A Review of Anomaly Detection Techniques". Expert Systems with Applications. Comprehensive review of AD (sup/unsup/semi) for financial fraud. Highlights challenges (imbalance, drift) + advances.
    - Dal Pozzolo et al. (2014). "Learned lessons in credit card fraud detection from a practitioner perspective". ESWA. (Often cited dataset context.)

## Industry Reports & Patterns (Stripe, PayPal, Proxies)

14. Stripe resources:
    - "How machine learning works for payment fraud detection and prevention" (2025 update). Covers sup/unsup/reinforcement; anomaly detection, risk scoring, network/graph analysis, device fingerprinting, behavioral biometrics, identity verification, adaptive learning. Real-time examples (e.g. distant locations in short time). Radar product leverages network.
    - Other: Foundation model / transformer approaches for dense vectors on txns (discrete features like BIN/zip + learned).
    - URL: stripe.com/resources/more/how-machine-learning-works... [web:78,119 browse]

15. PayPal:
    - "Harnessing machine learning fraud detection technologies" (2024). Sup for predictive on labeled; unsup for anomalies/patterns in untagged; semi-supervised; reinforcement. Real-time customer behavior assessment. Large proprietary + two-sided network data advantage. Adapt to changing patterns; combine w/ rules. Signup/login/payment fraud types. Acquired Simility (unsup clusters + anomalies).
    - Tech blogs: Large-scale ML CI/CD/shadow for fraud models; real-time risk platform.
    - URL: paypal.com/us/brc/article/payment-fraud-detection-machine-learning [web:76,120 browse]
    - Secondary: Impact studies note Stripe/PayPal reduce FPs via ML.

Banks: Proxies via academic (European processor in Bahnsen) + Kaggle. Common: rules + ML layers; behavioral + velocity heavy.

## Open Implementations & Tooling

16. Scikit-learn (Pedregosa et al. 2011 JMLR): IsolationForest, LocalOutlierFactor, OneClassSVM, EllipticEnvelope (MinCovDet). Core for all classical.
17. PyOD (Zhao et al.): Unified lib 60+ detectors incl. IForest, LOF wrappers; benchmarks. github.com/yzhao062/pyod. [web:108-110]
18. XGBoost (Chen & Guestrin 2016), LightGBM, CatBoost: Standard for sup tabular fraud.
19. imbalanced-learn: Sampling, class weights for fraud.
20. Kaggle datasets: Credit Card Fraud Detection (primary); others simulated.

## Limitations & Metrics References

- ROC vs PR-AUC: Multiple explainers note PR-AUC (or AUPRC) superior for rare positives (fraud). [web:95-99]
- Imbalance challenges: Resampling (SMOTE pros/cons), cost-sensitive, thresholding. Delayed/noisy labels (practitioner papers).
- Concept drift in fraud: Common theme in surveys + practitioner (fraud evolves, arms race).

## Additional Notes on Citations & Rigor
- Primary origins verified via direct search + PDFs.
- Fraud apps: Mostly reproducible Kaggle + IEEE/ResearchGate. Real bank internals proprietary → use public + industry blogs.
- For KYA/KYE relational: Indirect; literature uses "graph features", "network extensions", "KYC enrichment" flattened to tabular (e.g., shared IP/device, community, centrality as columns). See Vallemoni 2023 on embedding KYC/AML + tabular boosting; graph papers for native.
- Uncertainties noted: Some 2025/26 dated results may be projections/preprints. Exact performance numbers dataset/tune-specific (report ranges, not absolutes).
- Recommend for roadmap: Cite Liu 2008/2012, Bahnsen 2016, Hilal 2022, Stripe/PayPal pages as authoritative.

**Next updates**: Append new high-quality finds during research. All used in model_notes, limitations, etc.
