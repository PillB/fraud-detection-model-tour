# Model Card: HBOS, ECOD, COPOD, kNN, and PyOD-Style Density Outlier Models

## Origin

PyOD popularized a unified Python interface for many outlier detectors, including histogram, empirical distribution, copula, nearest-neighbor, and ensemble methods. These models are useful for fraud programs that need many cheap anomaly views before committing to heavier graph or deep-learning layers.

## How It Works

Density outlier methods estimate how rare a transaction is under one or more feature distributions. HBOS scores independent feature histograms. ECOD and COPOD use empirical or copula-style distributional tails. kNN-style scores use distance to nearby observations. The output is a continuous anomaly score.

## Fraud Fit

Use density models as a broader anomaly gate alongside Isolation Forest. They can catch skewed amount/velocity tails that tree isolation misses and are easy to add to a stacking model.

## Pros

- Fast and dependency-light when implemented with histograms and empirical CDFs.
- Good for explainable tail-risk detection.
- Works as a feature generator for cascades.

## Cons

- Independent-feature methods miss interactions.
- kNN scales poorly without approximate indexes.
- Scores are not calibrated probabilities.
- Distribution shift changes tail definitions.

## References

- PyOD documentation and model zoo.
- HBOS, ECOD, and COPOD original papers.
- Fraud Detection Handbook practical anomaly and ensemble material.

## Runnable Example

- `experiments/toy_density_outlier_suite.py`

