# Model Card: Deep SVDD and DAGMM

## Origin

Deep SVDD adapts one-class support vector ideas to neural representations by learning a compact hypersphere for normal data. DAGMM combines an autoencoder representation with a Gaussian mixture density estimator, scoring anomalies by reconstruction and energy.

## How It Works

Deep SVDD:
1. Train a neural encoder on mostly normal transactions.
2. Pull embeddings toward a center point.
3. Score anomalies by distance from the center.

DAGMM:
1. Train an autoencoder.
2. Concatenate latent features, reconstruction error, and reconstruction similarity.
3. Fit a density estimator over that representation.
4. Score low-density/high-energy points as anomalies.

## Pros

- More expressive than simple covariance or One-Class SVM baselines.
- Useful when normal behavior is nonlinear but mostly compact.
- DAGMM combines reconstruction and density, which is attractive for transaction anomalies.

## Cons

- Heavier than Isolation Forest and LOF.
- Sensitive to contamination in "normal" training data.
- Can collapse or overfit without careful regularization.
- Requires more explanation work for investigators.

## Assumptions

- Normal transactions occupy a learnable compact or high-density region.
- Fraud deviates in learned representation space.

## Limitations

- Not native for graph structure unless paired with graph encoders.
- Rare legitimate customer behavior can look anomalous.
- Thresholds need validation against review capacity and known fraud labels.

## Fraud-Specific Fit

Use these as advanced anomaly layers after classical baselines. They are useful for educational comparison because they show the continuum from Isolation Forest to learned density models.

## Runnable Example

The current repo keeps VAE as the runnable deep anomaly flagship. A lightweight extension can approximate Deep SVDD with `MLPRegressor` embeddings or add PyTorch when heavy dependencies are acceptable.

