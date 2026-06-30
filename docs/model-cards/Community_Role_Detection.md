# Model Card: Community and Role Detection for Criminal Networks

## Origin

Community detection and role discovery predate GNNs and remain central in criminal network analysis. Methods such as modularity optimization, label propagation, k-core decomposition, PageRank, HITS, RolX-style structural roles, struc2vec-style structural similarity, and GraphWave-style role signatures identify rings, brokers, mules, cash-out hubs, and bridge entities.

## How It Works

1. Build an entity graph: users, merchants, workers, devices, accounts, addresses, IPs, and transaction edges.
2. Compute local structure: degree, weighted degree, triangles, clustering coefficient, k-core, PageRank, betweenness.
3. Detect communities: Louvain/Leiden or greedy modularity clusters suspiciously dense groups.
4. Detect roles: nodes with similar structural positions are grouped even if they are far apart in the graph.
5. Score risk: combine community fraud concentration, role type, bridge centrality, and transaction velocity.

## Pros

- Highly explainable compared with black-box GNNs.
- Works with few labels and supports analyst workflows.
- Good for collusion rings, mule networks, shell merchants, insider access clusters, and AML-style layering.
- Produces visual artifacts that investigators can inspect.

## Cons

- Community membership is not automatically fraud; it is a lead.
- Results depend on entity resolution and graph construction quality.
- Static community methods can lag fast-moving fraud rings.
- Dense legitimate communities, such as payroll or marketplace hubs, can create false positives.

## Assumptions

- Fraud or criminal behavior creates structural signals: dense coordination, shared infrastructure, repeated brokers, or unusual bridges.
- The graph has enough relationship signal beyond individual transactions.

## Limitations

- Needs temporal analysis for evolving networks.
- Role labels require domain interpretation.
- Privacy, governance, and explainability controls are essential when graph links include KYC/KYE/KYB or worker data.

## Fraud-Specific Fit

Use this family when the investigation question is "who is connected to whom, and why is this group suspicious?" It is especially practical before deploying a full GNN because the features can be fed directly into XGBoost or graph models.

## Runnable Example

See `experiments/toy_community_role_detection.py`. It computes NetworkX graph features, communities, role labels, PR-AUC, Recall@K, and saves a risk scatter visualization.

## Production Guidance

- Use an entity-resolution layer before graph modeling.
- Prefer temporal communities for live fraud rings.
- Combine role/community features with transaction features in a supervised model.
- Review top communities, not only top transactions, to reduce duplicated alerts.

