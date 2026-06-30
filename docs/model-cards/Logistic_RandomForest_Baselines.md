# Model Card: Logistic Regression, Random Forest, and ExtraTrees Baselines

## Origin

Most mature fraud programs keep simple supervised baselines in the model inventory even when deep and graph models are available. Logistic regression gives a calibrated governance reference; Random Forest and ExtraTrees give robust nonlinear baselines for labeled tabular fraud.

## How It Works

The model consumes engineered transaction features such as amount, hour, night flag, rolling velocity, category, merchant risk, account age, shared-device counts, and graph aggregates. Logistic regression learns weighted additive effects. Random Forest and ExtraTrees average many decision trees trained on bootstrapped or randomized splits.

## Fraud Fit

Use these models to benchmark known fraud patterns before adding more expensive families. They are also strong fallbacks for new entities where graph history or sequence history is sparse.

## Pros

- Fast and reproducible.
- Easy to compare with XGBoost/LightGBM.
- Logistic regression supports audit-friendly coefficients and calibration checks.
- Random Forest and ExtraTrees capture nonlinear interactions without heavy tuning.

## Cons

- Logistic regression misses complex interactions unless features are engineered.
- Random Forest can be less sharp than boosted trees on tabular fraud.
- All supervised baselines depend on label quality and temporal validation.

## Assumptions

- Historical labels represent the deployment fraud patterns.
- Feature engineering captures velocity, amount deviation, and entity risk.
- Review thresholds are optimized for Recall@K and cost, not accuracy.

## References

- scikit-learn `LogisticRegression`, `RandomForestClassifier`, and `ExtraTreesClassifier`.
- PayPal public fraud material describing rule and machine learning layers across identity, device, and transaction signals.
- Microsoft Azure real-time fraud detection examples using classical ML baselines.

## Runnable Example

- `experiments/toy_supervised_baselines.py`
- `experiments/compare_models.py`

