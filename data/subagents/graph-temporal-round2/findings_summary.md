# Graph, Temporal Graph, and Criminal Network Research Stream

Status: research-only sub-agent completed; no files edited by the sub-agent.

## Key Sources

- safe-graph graph fraud papers: https://github.com/safe-graph/graph-fraud-detection-papers
- GNNs for financial fraud detection review, 2024/2025: https://arxiv.org/abs/2411.05815
- Deep graph anomaly detection survey, 2024/2025: https://arxiv.org/abs/2409.09957
- Awesome deep graph anomaly detection repo: https://github.com/mala-lab/Awesome-Deep-Graph-Anomaly-Detection
- Dynamic graph anomaly detection survey, 2024: https://arxiv.org/abs/2406.00134
- Dynamic GNN survey, 2024: https://arxiv.org/abs/2405.00476
- DGFraud toolbox: https://github.com/safe-graph/DGFraud
- PyGOD: https://github.com/pygod-team/pygod
- GADBench: https://arxiv.org/abs/2306.12251 and https://github.com/squareRoot3/GADBench
- BAG dynamic graph anomaly benchmark, 2026: https://ojs.aaai.org/index.php/AAAI/article/view/38510

## Missing Families Identified

- Classical graph mining: OddBall, FRAUDAR, CopyCatch/SynchroTrap-style lockstep detection, MIDAS, DenseAlert/SPADE, FlowScope, AntiBenford.
- Community/criminal network: Louvain, Leiden, Infomap, stochastic block models, dense subgraph search, community-aware GAD.
- Role discovery: ReFeX/RolX, struc2vec, GraphWave, participation coefficient, within-community z-score.
- Static GNNs: GCN, GraphSAGE, GAT, R-GCN/R-GAT, HAN/HGT, SemiGNN, GraphConsis, CARE-GNN, PC-GNN, BWGNN.
- Temporal/dynamic: NetWalk, AddGraph, EvolveGCN, DySAT, JODIE, DyRep, TGAT, TGN, APAN, CAW, GraphMixer.

## Implementation Actions Taken

- Added `docs/model-cards/Community_Role_Detection.md`.
- Added `docs/model-cards/Temporal_GNNs.md`.
- Added `experiments/toy_community_role_detection.py`.
- Added `experiments/toy_temporal_graph_risk.py`.

## Fit And Limits

Graph methods are strongest for collusion, mule rings, shared devices, employee/agent-assisted abuse, and criminal network prioritization. Use them for investigative prioritization, not determinations. Avoid temporal leakage and random graph splits that split rings across train/test.

