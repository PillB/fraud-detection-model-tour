# Model Card: Cost-Sensitive Ensembles and Cascades

## Origin

Production fraud systems rarely rely on a single model. They combine rules, anomaly gates, supervised tree ensembles, graph features, sequence models, and analyst feedback. Cost-sensitive fraud modeling formalizes the fact that false negatives, false positives, review time, and customer friction have different economic costs.

## How It Works

1. Define the operational objective: top-K review queue, expected dollar loss, investigation cost, or customer-friction budget.
2. Train strong base models: rules, Isolation Forest/LOF, Gradient Boosting, Random Forest, graph/sequence proxies.
3. Calibrate or normalize scores.
4. Fuse with stacking, blending, weighted averages, or explicit gates.
5. Optimize thresholds against PR-AUC, Recall@K, and expected cost rather than accuracy.

## Pros

- Aligns model output with real fraud operations.
- Usually improves robustness across known and novel fraud patterns.
- Lets expensive graph/deep/LLM layers run only where justified.
- Produces a clear architecture for governance: cheap gate, primary model, specialist layer, review.

## Cons

- More moving parts and monitoring surfaces.
- Stacking can leak if out-of-fold predictions and temporal validation are not handled correctly.
- Score calibration can drift.
- Business cost assumptions must be explicit and revisited.

## Assumptions

- Different models capture complementary signals.
- Operational costs can be estimated well enough to guide thresholds.
- Validation reflects deployment chronology and review constraints.

## Limitations

- High offline PR-AUC does not guarantee acceptable queue quality.
- Thresholds tuned on old fraud patterns may underperform after drift.
- Cascades can hide coverage gaps if rejected cases are never reviewed.

## Fraud-Specific Fit

Use this as the default production architecture: rules/IF for fast recall, cost-sensitive tree model for known patterns, graph/sequence/deep models for specialist evidence, and analyst review for top-risk or uncertain cases.

## Runnable Example

See `scripts/full_pipeline.py` and `experiments/compare_models.py`. The pipeline already demonstrates late fusion of supervised and anomaly scores. Extend it with out-of-fold stacking and explicit cost curves for production work.

