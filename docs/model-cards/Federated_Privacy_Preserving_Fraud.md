# Model Card: Federated and Privacy-Preserving Fraud Learning

## Origin

Fraudsters operate across institutions, but privacy, regulation, and commercial boundaries prevent simple pooling of raw customer data. Federated learning and privacy-preserving analytics attempt to share model signal without centralizing sensitive records.

## How It Works

Institutions train local models or local updates on their own data. A coordinator aggregates updates, secure statistics, embeddings, or risk signals. In graph settings, privacy-preserving linkage and shared typology features can help detect cross-platform mule networks.

## Fraud Fit

Use this family when a single organization sees only part of the fraud graph: banking consortia, payment networks, marketplaces, delivery platforms, wallet providers, or cross-border scam monitoring.

## Pros

- Expands fraud coverage without raw-data pooling.
- Can improve new-pattern detection across institutions.
- Aligns with data-minimization goals.

## Cons

- Operationally complex.
- Still vulnerable to privacy leakage if not designed carefully.
- Hard to debug and validate across institutions.
- Requires governance agreements and monitoring.

## References

- TensorFlow Federated tutorials.
- Recent public research on federated fraud detection.
- Payment-network and consortium fraud intelligence materials.

## Runnable Example

- Lightweight local pattern: split synthetic data by pseudo-institution, train local classifiers, average calibrated scores in `experiments/compare_models.py`.
- Production upgrade: TensorFlow Federated, Flower, secure aggregation, and privacy audits.

