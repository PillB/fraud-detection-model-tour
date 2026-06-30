# Model Card: Isolation Forest

## Origin

Isolation Forest was introduced by Liu, Ting, and Zhou (2008) as an anomaly detector that isolates unusual observations with random partitioning trees. It is one of the most practical first-line fraud gates because it is fast, label-free, and available in scikit-learn.

## How It Works

Isolation Forest repeatedly samples features and split points to build random trees. Points that require fewer splits to isolate receive higher anomaly scores. In transaction fraud, the input is a scaled tabular matrix such as amount, hour, night flag, rolling velocity, account age, merchant risk, and KYA/KYE aggregates. The output is an anomaly score that can be turned into a top-K review queue or used as a feature in a supervised model.

## Fraud Fit

Use Isolation Forest as a low-latency screen for amount spikes, sudden velocity bursts, unusual timing, or behavior that does not match the normal transaction population. It is especially useful when labels are delayed or incomplete.

## Pros

- Does not require fraud labels.
- Fast enough for a first-pass gate on structured features.
- Works well as a score feature for XGBoost, LightGBM, or cascade models.
- Easy to explain operationally: unusual rows are isolated quickly.

## Cons

- Sensitive to feature scaling and contamination settings.
- Detects point anomalies better than coordinated fraud rings.
- Can overflag rare legitimate high-value customers.
- Scores are not calibrated probabilities.

## Assumptions

- Fraud creates feature patterns that are easier to isolate than normal behavior.
- Training data is not overwhelmed by fraud contamination.
- Temporal validation is used so future behavior does not leak into the gate.

## Limitations

Isolation Forest does not understand shared devices, mule rings, hidden intermediaries, or sequence context by itself. Pair it with graph features, sequence features, and analyst review for collusion or criminal-network detection.

## References

- Liu, Ting, and Zhou, "Isolation Forest", ICDM 2008.
- scikit-learn `IsolationForest` documentation.
- PyOD anomaly detection documentation for production-style anomaly detector APIs.

## Runnable Example

- `experiments/toy_isolation_forest.py`
- `experiments/toy_classical_anomaly_suite.py`
- `experiments/compare_models.py`

