# Classical, Statistical, and Ensemble Research Stream

Status: research-only sub-agent completed; no files edited by the sub-agent.

## Key Sources

- Chen et al. 2025 deep learning financial fraud SLR: https://arxiv.org/abs/2502.00201
- Digital banking fraud SLR, 2025: https://arxiv.org/abs/2510.05167
- Practical anomaly framework, 2025: https://arxiv.org/abs/2506.10842
- Stacked XGBoost/LightGBM/CatBoost fraud paper, 2025: https://arxiv.org/abs/2505.10050
- scikit-learn outlier detection docs: https://scikit-learn.org/stable/modules/outlier_detection.html
- PyOD docs: https://pyod.readthedocs.io/en/latest/
- XGBoost parameter docs: https://xgboost.readthedocs.io/en/stable/parameter.html
- LightGBM parameter docs: https://lightgbm.readthedocs.io/en/stable/Parameters.html
- imbalanced-learn ensemble docs: https://imbalanced-learn.org/stable/references/ensemble.html
- River Half-Space Trees docs: https://riverml.xyz/latest/api/anomaly/HalfSpaceTrees/

## Missing Families Identified

- Statistical: robust z-score/MAD, IQR, rolling z-score, EWMA, CUSUM/Page-Hinkley, Mahalanobis, MinCovDet/EllipticEnvelope.
- Unsupervised: Isolation Forest variants, LOF, One-Class SVM, HBOS, ECOD, COPOD, PCA/KPCA reconstruction, KDE, GMM, kNN distance, clustering anomaly.
- Supervised: logistic scorecards, calibrated linear models, Random Forest, ExtraTrees, HistGradientBoosting, AdaBoost.
- Production ensembles: LightGBM, CatBoost, balanced forests, EasyEnsemble, RUSBoost, stacking, anomaly-score augmented GBDT, threshold/cost optimized cascades.

## Implementation Actions Taken

- Added `docs/roadmap/exhaustive_model_catalog.md`.
- Added `docs/model-cards/Cost_Sensitive_Ensembles.md`.
- Added `experiments/toy_classical_anomaly_suite.py`.

## Fit And Limits

Classical models are the fast, auditable first layer. They are not replacements for graph/sequence/deep models, but they make the production cascade credible. Use temporal splits, PR-AUC, Recall@K, and cost framing; avoid accuracy and random splits.

