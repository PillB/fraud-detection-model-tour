# Model Card: XGBoost (Supervised Tabular Classifier for Fraud)

## Origin
- Chen & Guestrin (2016) XGBoost: A Scalable Tree Boosting System.
- Dominant in fraud detection benchmarks and production (e.g., credit card, banking per Chen 2025 survey and industry reports).

## How It Works
Gradient boosting on decision trees:

1. **Base Learners**: Shallow trees that sequentially correct errors of previous.
2. **Objective**: Minimize loss + regularization (L1/L2 on leaves, tree complexity).
3. **Fraud Features**: Engineered (amount stats, velocity, time, KYA aggs, merchant risk).
4. **Training**: scale_pos_weight or focal loss for imbalance.
5. **Prediction**: Probability of fraud; feature importance for explainability.

**Mixture**: Often final stage after unsupervised filter (IF/VAE) or with embeddings from DL (TabTrans, VAE latents).

## Pros
- Excellent performance on tabular structured data.
- Built-in handling for missing, categorical (with encoding).
- Fast inference, interpretable (gain, cover, SHAP).
- Strong baseline; hard to beat without complex features/hybrids.

## Cons
- Sensitive to feature engineering quality.
- Can overfit without proper regularization on rare fraud.
- Less native for sequences/graphs (use with LSTM or GNN features).

## Assumptions
- Tabular features capture the signal (velocity + KYA critical).
- Sufficient labeled data for known fraud patterns.

## Limitations
- Poor on novel fraud without hybrid AD component.
- Concept drift requires monitoring/retraining.
- Relational signals need flattening or graph extension.

**Fraud-Specific Fit**: Core for known fraud patterns in tx data. Combine with KYA features and velocity. Use in cascades: rules/IF → XGBoost. Production staple (often >90% of alerts in layered systems).

## Runnable Example (Production Note)
See experiments/toy_xgboost.py. In production, prefer the native xgboost package for scale_pos_weight and full SHAP support. Reports PR-AUC and importances.

## Conceptual Visualization
- Feature importance bar chart (top: velocity, amount dev, KYA flags).
- Partial dependence plot for key feature (e.g., amount vs fraud prob).

## References
- Chen & Guestrin 2016.
- Chen 2025 survey (XGBoost/LightGBM prevalence).
- Bahnsen et al. on feature engineering for fraud.
- Full in sub-agent papers.

**Production Note**: Primary supervised layer in cascades. Use native xgboost package in production for scale_pos_weight and SHAP. Tested runnable example.
