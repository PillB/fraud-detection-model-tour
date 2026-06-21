# Implementation Ideas & Sketches: Graph-Temporal GNNs for Fraud

**Goal**: Practical, executable starting points for the project. Focus on functional toy Python (PyTorch Geometric / DGL / minimal torch preferred for reproducibility). Graph construction from transactional + relational (KYA/KYE style). Hybrid patterns. Feed model cards (toy examples) + experiments pipeline.

**Principles**:
- Start small/synthetic or public subset (IEEE-CIS graph-ified, DGraph sample if downloadable, or generator).
- Modular: graph build → model → train (static vs temporal) → metrics (PR-AUC, F1, Recall@10 etc.).
- Respect time for temporal (no future leakage).
- Include imbalance handling, sampling.
- Reference real: safe-graph/DGFraud patterns, NVIDIA blueprint (GraphSAGE + XGB), TGN reference impl (twitter-research/tgn or PyG Temporal).
- All sketches must be runnable immediately with minimal deps (torch, torch-geometric or networkx + sklearn fallback).

## 1. Graph Construction Sketch (Core for KYA/KYE + Txns)
Synthetic generator or loader that produces:
- Nodes: users (with KYC features), merchants, devices, "workers" (for KYE), optional txn nodes.
- Edges:
  - Transaction edges: user → merchant (or user-txn-merchant), with attrs (amount, timestamp, channel).
  - KYA/KYE relations: user-user (emergency contact like DGraph), user-device, user-worker (ownership), shared attribute edges (same email/IP/device as relation type for rings).
- Multi-relational / hetero or homogeneous with edge types.
- Time: All edges have timestamps.

```python
# sketch: simple hetero graph builder (PyG or DGL)
import torch
from torch_geometric.data import HeteroData
import numpy as np

def build_fraud_hetero_graph(num_users=1000, num_merchants=200, fraud_ratio=0.02, seed=42):
    # ... generate features, labels (imbalanced)
    data = HeteroData()
    # Node features and labels
    data['user'].x = torch.randn(num_users, 16)
    data['user'].y = torch.tensor([1 if np.random.rand() < fraud_ratio else 0 for _ in range(num_users)])
    data['merchant'].x = torch.randn(num_merchants, 8)
    # Edges: txns (dynamic)
    # txn_src, txn_dst, timestamps, edge_attr (amount etc.)
    data['user', 'txn', 'merchant'].edge_index = ...
    data['user', 'txn', 'merchant'].edge_attr = ...  # [amt, t_encoded, ...]
    # KYA relations (user-user)
    data['user', 'kya', 'user'].edge_index = ...  # emergency / verified relations
    data['user', 'kya', 'user'].edge_attr = torch.tensor(timestamps_for_kya)
    # Similarly for device, kye (user-worker)
    return data, timestamps  # for temporal splits
```

**Tips**:
- For IEEE-CIS: Map TransactionID → txn or user-merchant edges; use isFraud as labels on txns or users.
- For DGraph-like: Users + time-stamped emergency contact edges.
- Add noise/camouflage: Fraud nodes have many legit neighbors.
- Temporal split: Train on events < T, val < T2, test future.

## 2. Static GNN Toy (GraphSAGE + GAT baselines)
PyG recommended.

```python
# sketch (PyG)
from torch_geometric.nn import SAGEConv, GATConv
import torch.nn as nn
import torch.nn.functional as F

class FraudGNN(nn.Module):
    def __init__(self, in_channels, hidden, out=1, heads=4):
        super().__init__()
        self.sage = SAGEConv(in_channels, hidden)
        self.gat = GATConv(hidden, hidden, heads=heads, concat=False)
        self.classifier = nn.Linear(hidden, out)
    
    def forward(self, x, edge_index):
        x = F.relu(self.sage(x, edge_index))
        x = F.relu(self.gat(x, edge_index))  # attention weights accessible via gat.alpha
        return self.classifier(x).squeeze(-1)

# Training loop sketch (handle imbalance)
# Use pos_weight in BCEWithLogits or sampler
criterion = nn.BCEWithLogitsLoss(pos_weight=torch.tensor([imbalance_ratio]))
# For hetero: use HeteroConv or manual per-relation
```

**Add**:
- Neighbor sampling for scale: `NeighborLoader`.
- Attention extraction for interpret: return gat attn.
- Metrics: from sklearn (average_precision_score for PR-AUC).

## 3. TGN / Temporal Sketch
Use reference or simplified.

**Option A**: Simplified memory-less or basic from Kim 2024 paper ideas (edge pred pretrain + downstream).
**Option B**: Install/use torch_geometric_temporal or official TGN patterns (memory module).

Core sketch (inspired by TGN + paper):
```python
# High-level TGN-like for events
class SimpleTGN(nn.Module):
    def __init__(self, ...):
        self.memory = {}  # or tensor per node, update on events
        self.time_encoder = ...  # phi(t)
        self.gnn_op = GATConv or mean or custom  # with time encoding concat
    
    def update_memory(self, node, event_time, msg):
        # compress history
        pass
    
    def forward_temporal(self, events_batch):
        # for each timed event: aggregate temporal neighbors + time enc
        # produce z_t for nodes
        pass

# Pipeline
# 1. Pretrain: edge prediction (positive future/past link vs negative)
# 2. Downstream: freeze or fine-tune embeddings + MLP for fraud label at "current" time
```

**Practical starting point**:
- PyG Temporal examples or port from https://github.com/twitter-research/tgn (adapt).
- On toy stream: list of (src, dst, t, edge_feat, label?).
- For DGraph/IEEE toy: sort by time, process chronologically in batches.
- Negative sampling respecting time.

**For GTAN / TGAT mechanism**: Add time delta to neighbor features before attention.

## 4. Heterogeneous Temporal Sketch (HTGNN-inspired)
Use DGL HeteroGraphConv + temporal RNN or attention over time.

Or PyG with manual:
- Separate conv per relation type.
- Temporal: maintain per-node time series of embeddings or use snapshot sequence + self-attn.

Simple multi-relation + time decay (from Sha 2025 idea):
```python
# In agg: weight by exp(-decay * (now - edge_t))
```

## 5. Hybrid Production-Style (NVIDIA Blueprint Pattern)
```python
# GNN produces embeddings (GraphSAGE or TGN)
gnn_emb = gnn_model(node_features, edges)  # or per event

# Then XGBoost on concat(tabular_features, gnn_emb)
import xgboost as xgb
# Train xgb on [raw_txn_feats + gnn_embs]
# Predict with both for final score + explanations (xgb + attention)
```

Matches NVIDIA: GraphSAGE (hidden=16, n_hops=1, fan_out=16) → XGB.

## 6. Imbalance, Sampling, Training Tricks
- Loss: BCE pos_weight, focal loss.
- Sampler: Stratified or graph-aware (avoid oversampling connected legit).
- HMOA-style: Adversarial perturbation on features during training.
- GraphConsis-inspired: Relation-specific or consistency loss.
- Pretrain: Link prediction or contrastive (reconstruction of normal dynamics).

## 7. Evaluation & Experiments Ideas
- Datasets: 
  - Toy synthetic with planted rings + temporal bursts.
  - IEEE-CIS → hetero graph (many Kaggle notebooks exist).
  - DGraph sample (if full too big, subsample time window).
- Splits: Temporal (critical for TGN validity).
- Metrics: PR-AUC (primary), ROC-AUC, F1, Precision@K, Recall@K (fraud teams care about top alerts).
- Ablations: w/ vs w/o temporal, w/ vs w/o KYA edges, static GNN vs TGN, with/without imbalance handling.
- Baselines: Pure XGB on tabular, simple degree features, CTDNE embeddings, plain GCN.
- Reproducibility: Seed everything, log configs, time-respecting.

## 8. Scalability & Real-Time Ideas
- Sampling: NeighborLoader (PyG), fan_out like NVIDIA config.
- Inference: Pre-compute or update embeddings incrementally (TGN memory).
- Serving: Export embeddings → Triton / simple API (NVIDIA pattern).
- Storage: Separate graph store (edges + times) + feature store.

## 9. Interpretability Sketches
- GAT: Visualize top attention edges per flagged node.
- Subgraph: Extract k-hop around fraud prediction.
- Hybrid: Feature importances from XGB head + GNN attention.
- Text: "Flagged due to high attention (0.8) on KYA link to node X + anomalous txn velocity."

## 10. References for Code
- safe-graph/DGFraud: Study algorithms/ for fraud-specific layers (even if TF, port ideas).
- PyG examples: upfd (fake news), temporal examples.
- NVIDIA GitHub blueprint (Financial-Fraud-Detection): Config + container patterns.
- TGN official or PyG ports.
- Kaggle: "Fraud Detection - GNN + Graph aware GAN - IEEE CIS", waittim/graph-fraud-detection (DGL hetero IEEE-CIS).

**Recommended First Impl Order (for model cards / experiments)**:
1. Graph builder (synthetic or IEEE loader).
2. GraphSAGE + GAT toy (static baseline).
3. Simple TGN (memory or time-aware agg) on same data with temporal split.
4. Hybrid GNN-embed + sklearn/XGB.
5. Metrics + attention viz.
6. Extend to hetero (user-merchant-kya).

**Caveats from limitations**: Do not overclaim SOTA without full DGraph run. Toy scale first (1k-10k nodes) to validate pipeline before larger. Always time-aware validation.

**Next**: Turn sketches into executable .py in experiments/ or scripts/. Add to model cards as "toy example".

---
*Sketches designed to run immediately. Expand with real data loaders. 2026-06-20.*