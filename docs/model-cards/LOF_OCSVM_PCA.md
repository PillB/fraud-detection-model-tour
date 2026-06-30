# Model Card: LOF, One-Class SVM, Robust Covariance, and PCA Reconstruction

## Origin

Classical anomaly detection includes density, boundary, covariance, and reconstruction methods that remain useful as fast baselines and as auxiliary fraud signals.

## How It Works

- Local Outlier Factor compares each point with the density of its neighbors.
- One-Class SVM learns a boundary around mostly normal data.
- Robust covariance estimates a stable multivariate center and flags large Mahalanobis distances.
- PCA reconstruction flags rows that are poorly reconstructed by a low-dimensional normal subspace.

Inputs are scaled numeric transaction features. Outputs are anomaly scores that can be ranked, thresholded, or passed into a supervised ensemble.

## Fraud Fit

Use these methods to expose different definitions of "unusual": locally sparse behavior, boundary violations, multivariate distance, and reconstruction error. They are helpful when teaching why no single anomaly detector is enough.

## Pros

- Covers several anomaly assumptions with the same feature table.
- No fraud labels required for the detector itself.
- Good benchmark suite for new synthetic data patterns.

## Cons

- LOF and kernel One-Class SVM can be slow at high scale.
- Robust covariance assumes roughly elliptical normal behavior.
- PCA misses nonlinear behavior and categorical interactions.
- All can produce low precision under extreme imbalance.

## References

- Breunig et al., "LOF: Identifying Density-Based Local Outliers", KDD 2000.
- Schölkopf et al., one-class support estimation.
- scikit-learn novelty and outlier detection documentation.

## Runnable Example

- `experiments/toy_classical_anomaly_suite.py`

