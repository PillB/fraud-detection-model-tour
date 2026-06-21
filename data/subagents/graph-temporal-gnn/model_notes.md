# Model Notes: GNNs and Temporal Graph Networks for Fraud Detection

**Structure per model/section** (as required):
- **Origin / Key Paper(s)**
- **Core Idea / Mechanism**
- **How Anomaly/Fraud is Detected** (esp. on relational + transactional data, customer-txn-merchant, KYA/KYE-style relations)
- **Pros / Cons for Structured + Relational Fraud Data**
- **Assumptions** (e.g., graph connectivity, homophily)
- **Limitations** (label scarcity, scalability, concept drift, etc.)
- **Concrete SOTA / Performance Claims** (from papers; note datasets)
- **Relevance to KYA/KYE / Transaction Graphs + Industry Notes**

Models grouped: Static GNNs, Temporal/Dynamic, Heterogeneous/Temporal Hybrids, Advanced/Transformers, Fraud-Specific Tooling.

---

## Static GNNs

### GCN (Graph Convolutional Network)
- **Origin / Key Paper(s)**: Kipf & Welling (2017), "Semi-Supervised Classification with Graph Convolutional Networks". ICLR. Foundational; heavily used as baseline in fraud papers 2023-2025.
- **Core Idea / Mechanism**: Spectral graph convolution approximated via first-order Chebyshev. Message passing: aggregate normalized neighbor features + self, apply linear transform + nonlinearity. Simple isotropic aggregation.
- **How Anomaly/Fraud is Detected**: Node embeddings learned on (often bipartite or multi-relational) customer-merchant or user-txn graph. Fraud score via downstream classifier (MLP) on embedding. Captures local neighborhood "guilt by association" (e.g., users connected via shared merchants or emergency contacts flagged if neighbors fraudulent).
- **Pros / Cons for Structured + Relational Fraud Data**:
  - Pros: Simple, effective baseline; captures structural signals beyond tabular features (e.g., rings).
  - Cons: Isotropic (all neighbors equal weight); sensitive to heterophily (fraudsters camouflage by linking to legit); over-smoothing with depth; poor on directed/time-varying.
- **Assumptions**: Homophily (similar nodes connect); static undirected or symmetrized graph; sufficient connectivity.
- **Limitations**: Label scarcity exacerbates (semi-supervised variants help); no native time/heterogeneity; scalability (full graph Laplacian); concept drift (static).
- **Concrete SOTA / Performance Claims**: On DGraph (2024 TGN paper baseline): GCN Test AUC ~0.6135. On IEEE-CIS hetero extensions (Sha 2025): Outperformed by proposed HGNN (exact deltas not always numeric in abstract but "notable improvements").
- **Relevance to KYA/KYE / Transaction Graphs + Industry Notes**: Basic for mapping KYA relations (e.g., verified links) or txn edges. Rarely production solo; used in ablations. Industry (NVIDIA etc.) prefers sampling-based over plain GCN.

### GraphSAGE (Graph Sample and Aggregate)
- **Origin / Key Paper(s)**: Hamilton, Ying, Leskovec (2017). "Inductive Representation Learning on Large Graphs". NeurIPS. Extensively adapted (e.g., HMOA-GNN 2025).
- **Core Idea / Mechanism**: Inductive framework. Sample fixed-size neighbor sets (fan-out); aggregate (mean/pool/LSTM) then combine with self via learnable funcs. Supports unseen nodes (inductive). Mini-batch friendly.
- **How Anomaly/Fraud is Detected**: Generate embeddings for users/accounts by sampling txn/relation neighbors (merchants, other users via KYA contacts). Fraud classification on final embedding. Handles new users/merchants at inference (critical in streaming txns).
- **Pros / Cons for Structured + Relational Fraud Data**:
  - Pros: Scales to massive graphs (millions-hundreds of millions nodes via sampling); inductive for dynamic user acquisition; flexible aggregators.
  - Cons: Sampling can miss rare fraud signals; still limited on rich edge features or strong heterophily without adaptations.
- **Assumptions**: Local neighborhood sufficient (k-hop); uniform or importance sampling works; graph structure stable enough for sampling.
- **Limitations**: Extreme imbalance can bias samples toward majority; no built-in temporal; over-squashing in deep stacks; requires careful fan-out tuning for fraud sparsity.
- **Concrete SOTA / Performance Claims**: DGraph baseline (2024): GraphSAGE ~0.6344 AUC. HMOA-GNN (2025 Sci Rep, adversarial adaptive GraphSAGE variant): F1 from ~0 to 0.6372+ on simulated credit card; strong precision-recall balance post-adversarial. NVIDIA blueprint (2025): Core production choice with fan_out sampling + XGB.
- **Relevance to KYA/KYE / Transaction Graphs + Industry Notes**: **Production standard** for large fraud graphs (per PyG/Kumo/NVIDIA 2025). Map KYA/KYE as typed neighbors (emergency contacts like DGraph, device links). Hybrid with trees common. Safe-graph includes baseline impl.

### GAT (Graph Attention Networks)
- **Origin / Key Paper(s)**: Veličković et al. (2017/2018). arXiv:1710.10903 / ICLR. Used in many fraud GAT extensions and as baseline.
- **Core Idea / Mechanism**: Self-attention on neighbors. Compute attention coefficients α_{ij} via LeakyReLU on concatenated transformed features; softmax normalize; weighted sum. Multi-head for stability. Can be edge-aware in variants.
- **How Anomaly/Fraud is Detected**: Attention weights highlight "suspicious" connections (e.g., high-attention link from user to high-risk merchant or via shared KYE relation). Embedding fed to fraud classifier. Enables path/subgraph explanation of why a txn/user flagged.
- **Pros / Cons for Structured + Relational Fraud Data**:
  - Pros: Built-in interpretability (attention maps show which relations matter - gold for fraud analysts/regulators); handles varying neighbor importance (e.g., different txn types).
  - Cons: Computationally heavier (attention); quadratic in dense neighborhoods; still static/homophily-biased without hetero extensions.
- **Assumptions**: Attention can learn meaningful relative importance; static graph.
- **Limitations**: Scalability (attention on high-degree nodes in txn graphs); label scarcity (attention can overfit noise); no native dynamics.
- **Concrete SOTA / Performance Claims**: DGraph baseline ~0.73 AUC range (various reports). Sha et al. (2025 HGNN) explicitly outperforms plain GAT on IEEE-CIS. GAT attention frequently praised for fraud explainability (Kumo notes).
- **Relevance to KYA/KYE / Transaction Graphs + Industry Notes**: Excellent for relational fraud (attention on KYA edges vs txn edges). Industry uses GATConv when interpretability prioritized over pure scale (GraphSAGE more common for prod scale). Many 2025 papers add partitioned/multi-temporal GAT for finance.

---

## Temporal / Dynamic Models

### TGN (Temporal Graph Networks)
- **Origin / Key Paper(s)**: Rossi et al. (2020). "Temporal Graph Networks for Deep Learning on Dynamic Graphs". ICML/GRL. arXiv:2006.10637. (Many fraud adaptations 2023-2026 build directly on it.)
- **Core Idea / Mechanism**: Framework for continuous-time dynamic graphs (sequence of timed events/edges). Components: (1) Memory module (stores compressed historical state per node, updated on events); (2) Message function; (3) Graph embedding operator (e.g., attention, mean, GCN-style on temporal neighbors with time encoding ϕ(t)); (4) Optional link prediction or other. Supports inductive. Efficient parallel training via sequential event processing.
- **How Anomaly/Fraud is Detected**: On dynamic txn/relation streams (e.g., time-stamped user-user emergency contacts or txns). Memory captures evolving user "state". Embeddings at current time used for fraud node/txn classification. Pretrain often via future link/edge prediction (learns "normal" evolution); downstream supervised or anomaly on embeddings. Detects anomalous *trajectories* or sudden changes in interaction patterns (fraud rings forming over time).
- **Pros / Cons for Structured + Relational Fraud Data**:
  - Pros: Native handling of dynamic edges (txns over time); memory for long-term dependencies without full history; strong empirical on financial dynamic graphs; unifies prior temporal methods.
  - Cons: Memory module memory-intensive on very large node sets (some papers drop full memory for DGraph); training sequential aspects.
- **Assumptions**: Events arrive in continuous time order; memory update captures relevant history; graph events (edges) are the primary signal.
- **Limitations**: Label scarcity (mitigated by self-supervised edge pretrain); concept drift handled better than static but still requires ongoing updates/memory refresh; scalability (large DGraph needed ablations).
- **Concrete SOTA / Performance Claims**: Kim et al. (2024 arXiv:2404.00060) on **DGraph**: TGN variants Test AUC 0.7640 (Sum), 0.7747 (Mean), 0.7716 (GCN), 0.7691 (GAT). vs. best non-TGN ~0.6829 (improvement 11.83-13.18%). Saldaña-Ulloa et al. (2024) TGN effective on real payment platform txn fraud events.
- **Relevance to KYA/KYE / Transaction Graphs + Industry Notes**: **Strongest temporal candidate for dynamic transaction+relationship graphs**. DGraph emergency contacts analogous to KYA relations. Production interest high for real-time (see related HetMem-TGN on 2.6M events). Safe-graph papers list and NVIDIA ecosystem reference temporal extensions indirectly via dynamics.

### TGAT (Temporal Graph Attention)
- **Origin / Key Paper(s)**: Related to Xu et al. works on temporal GNNs (~2020); frequently referenced alongside TGN (e.g., "Temporal Graph Attention" mechanisms in fraud papers). Often implemented within or compared to TGN framework.
- **Core Idea / Mechanism**: Extends GAT with temporal encoding. For each temporal neighbor, concatenate node feats + time delta encoding (ϕ(t-t_j)); compute attention over time-respecting neighbors. Aggregates with time-aware weights.
- **How Anomaly/Fraud is Detected**: Temporal attention on transaction sequences or relation events. Flags txns/users whose recent interaction patterns deviate (attention focuses on anomalous recent links).
- **Pros / Cons for Structured + Relational Fraud Data**:
  - Pros: Explicit time decay/attention; good for short-term fraud patterns (bursty fraud).
  - Cons: Still requires discretization or careful time encoding; less memory for very long histories vs full TGN.
- **Assumptions**: Time order respected; recent events more relevant (with learnable encoding).
- **Limitations**: Similar to TGN but less comprehensive memory; scalability on high-volume streams.
- **Concrete SOTA / Performance Claims**: Used as mechanism in Xiang et al. (2023 AAAI GTAN) for semi-supervised credit card fraud; mentioned in 2026 C2GAT comparisons. Baselines in fraud temporal papers often include TGAT variants.
- **Relevance to KYA/KYE / Transaction Graphs + Industry Notes**: Directly applied in credit card temporal graphs. Complements TGN for attention-heavy relational views.

### JODIE
- **Origin / Key Paper(s)**: Kumar et al. (2019). "Predicting Dynamic Embedding Trajectory in Temporal Interaction Networks". (Often baseline/comparator in TGN-era papers.)
- **Core Idea / Mechanism**: Two coupled RNNs (user/item or dual entities) that evolve embeddings along interaction trajectory. Predicts future embedding trajectory and interaction time.
- **How Anomaly/Fraud is Detected**: Deviation from predicted trajectory in user-merchant or user-user (KYA) interaction space signals fraud (e.g., sudden anomalous merchant interactions).
- **Pros / Cons for Structured + Relational Fraud Data**:
  - Pros: Explicit trajectory modeling for evolving behavior.
  - Cons: Primarily for bipartite interaction networks; less general for arbitrary multi-relational fraud graphs.
- **Assumptions**: Interactions are bipartite or paired; predictable smooth trajectories.
- **Limitations**: Less cited in recent 2023-2026 pure fraud temporal results (TGN dominates); may not handle multi-type relations as well.
- **Concrete SOTA / Performance Claims**: Primarily comparative (lower than TGN in dynamic benchmarks); used in fraud-related temporal interaction papers indirectly.
- **Relevance to KYA/KYE / Transaction Graphs + Industry Notes**: Fits user-merchant txn streams well. Less dominant for full KYA multi-relational than HTGNN/TGN.

### CTDNE (Continuous-Time Dynamic Network Embeddings)
- **Origin / Key Paper(s)**: Nguyen et al. (2018). WWW Companion. Foundational pre-deep temporal embedding via temporal random walks.
- **Core Idea / Mechanism**: Generate temporal random walks (edges sampled respecting increasing timestamps only). Feed sequences to skip-gram-like embedding (like DeepWalk but time-ordered).
- **How Anomaly/Fraud is Detected**: Embeddings capture temporal proximity. Anomaly via reconstruction, distance to clusters, or downstream classifier on embeddings.
- **Pros / Cons for Structured + Relational Fraud Data**:
  - Pros: Simple, respects time strictly; no GNN overhead initially.
  - Cons: Shallow (no deep message passing or features); weaker than modern GNNs.
- **Assumptions**: Temporal walks meaningfully encode proximity.
- **Limitations**: Pre-GNN (2018); outperformed by TGN/GAT in 2024+ fraud papers (e.g., one 2026 paper shows CTDNE AUCs ~0.45-0.60 vs GAT 0.68+).
- **Concrete SOTA / Performance Claims**: Comparative baselines: lower AUC in financial fraud dynamic graphs (e.g., ~0.4-0.6 range vs modern 0.7+).
- **Relevance to KYA/KYE / Transaction Graphs + Industry Notes**: Historical reference; temporal walks can inspire sampling for KYA time-respecting relations.

---

## Heterogeneous Temporal & Advanced

### HTGNN (Heterogeneous Temporal Graph Neural Network) / Variants (SE-HTGNN, MHT-GNN)
- **Origin / Key Paper(s)**: Foundational HTGNN ~2021 (e.g., for dynamic hetero); Xu et al. multi-view (PRICAI); Nguyen & Le (2025) real-time fraud; SE-HTGNN (efficient attention-based, OpenReview). MHT-GNN for click-farming fraud.
- **Core Idea / Mechanism**: Hierarchical attentions: node-level, relation/type-level (for heterogeneity), + temporal self-attention or RNN over snapshots/events. Captures multi-type nodes/edges evolving over time.
- **How Anomaly/Fraud is Detected**: On multi-type graphs (users + merchants + devices + txns + workers for KYE). Temporal evolution per type/relation flags coordinated fraud (e.g., fake accounts linking across types over short windows). Multi-view (MHT) combines behavior snapshots.
- **Pros / Cons for Structured + Relational Fraud Data**:
  - Pros: Natively handles heterogeneity (critical for KYA/KYE + txn + device); temporal + relational combined.
  - Cons: Complex hyperparameters (multi attentions); compute heavy.
- **Assumptions**: Multiple meaningful relation/node types; temporal snapshots or events available.
- **Limitations**: Label scarcity (contrastive or semi variants help); scalability on full multi-relational large graphs.
- **Concrete SOTA / Performance Claims**: Nguyen & Le (2025) claim strong real-time txn fraud performance (framework outperforms existing). MHT-GNN effective for WeChat click-farming (specific fraud). SE-HTGNN improves efficiency over base HTGNN.
- **Relevance to KYA/KYE / Transaction Graphs + Industry Notes**: **Highly relevant**. Directly maps to customer (user) - merchant - device - "worker"/KYA relations. Real-time HTGNN paper targets transaction fraud exactly.

### MAST-GNN (Memory-Augmented Spatio-Temporal GNN)
- **Origin / Key Paper(s)**: Recent (2024-2025 refs in ResearchGate/safe-graph ecosystem). "Memory-Augmented Spatio-Temporal Graph Neural Networks for Dynamic Financial Fraud Detection".
- **Core Idea / Mechanism**: Spatio-temporal GNN + memory augmentation (external or node memory for historical spatio-temporal states). Adaptive for dynamic evolution.
- **How Anomaly/Fraud is Detected**: Captures both spatial (relational structure) and temporal (drift in fraud patterns) + memory for long-range dependencies in financial graphs.
- **Pros / Cons for Structured + Relational Fraud Data**:
  - Pros: Explicit spatio-temporal + memory for drift; production-oriented claims.
  - Cons: Details sparser in public snippets; potentially high memory.
- **Assumptions**: Spatio (graph) and temporal dimensions both critical and separable/augmentable.
- **Limitations**: Newer, fewer independent verifications; implementation complexity.
- **Concrete SOTA / Performance Claims**: "Deliver measurable production gains, establishing new benchmarks for production-grade fraud".
- **Relevance to KYA/KYE / Transaction Graphs + Industry Notes**: Direct fit for dynamic financial fraud. Complements TGN memory ideas.

### C2GAT (Continuous-time Context-aware Graph Attention Transformer)
- **Origin / Key Paper(s)**: Adapted in Chen et al. (2026) "Real-time dynamic graph learning with temporal attention for financial fraud detection". Originally for POI recommendation; extended.
- **Core Idea / Mechanism**: Continuous-time GAT transformer variant. Node-specific temporal encoding + context-aware neighbor aggregation. Models higher-order deps + evolving structure.
- **How Anomaly/Fraud is Detected**: Dynamic focus on relevant historical interactions in txn graph; flags deviations in context/temporal structure.
- **Pros / Cons for Structured + Relational Fraud Data**:
  - Pros: Real-time capable; combines attention transformer expressivity with time.
  - Cons: Transformer overhead; adaptation-specific.
- **Assumptions**: Context (higher-order) and continuous time both key.
- **Limitations**: Recent adaptation; compute for transformers on large graphs.
- **Concrete SOTA / Performance Claims**: Reported effective in 2026 financial fraud dynamic setting vs baselines incl. TGAT, TGN variants, CTDNE.
- **Relevance to KYA/KYE / Transaction Graphs + Industry Notes**: Promising for real-time relational+transactional. Higher-order good for rings spanning KYA links.

### FraudGT (Graph Transformer for Financial Fraud)
- **Origin / Key Paper(s)**: Lin et al. (2024). "FraudGT: A Simple, Effective, and Efficient Graph Transformer for Financial Fraud Detection". (https://jshun.csail.mit.edu/FraudGT.pdf)
- **Core Idea / Mechanism**: Graph Transformer tailored to financial: rich multi-dim edge features (txns), directed multigraph support, ports/ego-ID/RMP etc. for patterns. Overcomes GNN expressivity limits, over-smoothing, edge neglect.
- **How Anomaly/Fraud is Detected**: Learns intricate laundering patterns (smurfing, round-tripping, bipartite, cycles) using edge-heavy info + directed structure. Node/edge scoring for fraud.
- **Pros / Cons for Structured + Relational Fraud Data**:
  - Pros: Superior expressivity for complex financial patterns; explicitly uses txn edge features (amounts, time, etc.).
  - Cons: Transformer cost vs pure GNN; newer.
- **Assumptions**: Edge features dominant (true in txns); directed multi-edges meaningful.
- **Limitations**: Scalability on ultra-large graphs; less "memory" for long temporal unless hybridized.
- **Concrete SOTA / Performance Claims**: Outperforms GNNs (GAT, GIN variants, Multi-GINE/PNA) and tree+graph-feature baselines on AML/financial datasets. Concrete tables in paper show gains.
- **Relevance to KYA/KYE / Transaction Graphs + Industry Notes**: Excellent for transaction-heavy (edges = txns). Can incorporate relation edges (KYA) as additional typed directed edges.

---

## Fraud-Specific / Tooling Models (from safe-graph DGFraud lineage)
- **SemiGNN** (ICDM 2019): Semi-supervised graph attentive for financial fraud. Heterogeneous. Addresses label scarcity directly.
- **GraphConsis** (SIGIR 2020): Alleviates GNN inconsistency (homophily violation) in fraud. Relation-specific or consistency modules.
- **GEM, HACUD**: Heterogeneous attention for malicious accounts / cash-out (AAAI/CIKM). Hierarchical attention.
- **Others (GAS, FdGars, GeniePath, Player2Vec)**: Tailored for opinion/financial/cyber fraud on hetero/homo graphs.
- **Notes**: These directly target fraud pitfalls (camouflage, label scarcity, hetero). Often pre-2023 but foundational and still referenced/cited in 2023-2026 works. Toolbox enables easy comparison. Strongly recommended for implementation baselines.

**Overall Synthesis Notes**:
- Evolution: Static (GCN/GAT/GraphSAGE) → Hetero adaptations → Temporal (TGN family) → Hetero-Temporal (HTGNN/MAST/C2GAT) → Graph Transformers (FraudGT) + hybrids (GNN+LLM or GNN+trees).
- Strongest for transaction+relation: TGN (dynamic edges + memory), HTGNN family (hetero + time), FraudGT (edge features + expressivity), GraphSAGE (scale).
- All assume some graph construction from raw txns/relations (map KYA/KYE to typed edges/nodes; txns as dynamic edges or nodes).

---
*Compiled 2026-06-20 from safe-graph, arXiv, NVIDIA, DGraph/IEEE-CIS papers. Update with new sources. Each section suitable for model card extraction.*