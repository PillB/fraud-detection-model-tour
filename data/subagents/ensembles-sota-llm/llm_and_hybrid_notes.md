# LLM and Hybrid Notes: LLMs, RAG, Agentic Systems, Synthetic Data, and Full Pipeline Integration for Fraud (Structured + Unstructured)

**Focus Areas**: LLMs for log analysis, OSINT enrichment, RAG over transaction graphs + text, agentic review systems, synthetic data gen. Self-supervised/semi + ensembles + graph + LLM integration. Representation of KYE/KYA + logs in hybrids.  
**Fraud Challenges Addressed**: Extreme imbalance (synthetic + SSL pretrain), real-time (prefilter + selective LLM), interpret/reg (agent explanations + self-explain GNN), drift (pretrained foundations generalize; RAG freshens knowledge), unstructured signals (logs, descriptions, OSINT for context beyond txns).

**Grounding**: papers_sources.md entries (Singh 2025 RAG arXiv, Mastercard RAG, IBM ML+LLM ensemble, safe-graph 2025-26 LLM papers: FLAG, DGP, TransactionGPT, GuARD, AuditCopilot, LLM tabular anomaly ICLR25; SEFraud self-explain; Agentic RAG survey 2026; Sardine layered; Feedzai GenAI trends; Hyphatia/T-JEPA SSL; KYA refs 2025-26).

## 1. LLMs for Log Analysis and Unstructured Data

**Origin/Mechanism**: LLMs (transformers, decoder/encoder like BERT variants, GPT-family, domain FinGPT) for NLP. Fine-tune or zero-shot/prompt for classification, extraction, summarization, anomaly in text. Encoder LLMs for embeddings of logs/descriptions. Recent: "encoder LLMs" in IBM ensembles.

**Fraud Use**:
- Access/auth logs, audit trails, transaction notes/descriptions, customer support chats: detect anomalies (e.g. unusual login seq language, suspicious phrasing).
- Sequence modeling: treat logs as "sentences"; predict next or detect deviation.
- OSINT enrichment: feed public breach/news snippets to detect context (e.g. "user recently in high-risk geo per news").

**Pros**: Handles free-text signals invisible to tabular; semantic understanding; few-shot via prompting.
**Cons**: Hallucination risk (mitigate w/ RAG/grounding); high compute/latency (use small/distilled or selective); privacy (logs may contain PII; on-prem or anonymized); cost.
**Assumptions**: Logs available, parseable (structured fields + free text); domain-adapt or RAG needed (generic LLM weak on fraud jargon).
**Limitations**: Not real-time native for all txns (use as reviewer); drift in language (prompts/RAG update); explain via attention or post.
**Complements**: Embed log text -> concat w/ tabular/graph feats for downstream ensemble/GNN. Or LLM score as input to cost-sens stack.

## 2. RAG over Transaction Graphs + Text

**Origin/Mechanism**: Retrieval-Augmented Generation (classic Lewis 2020; evolved to GraphRAG, Agentic RAG). Retrieve relevant chunks (docs, subgraphs, similar txns) via vector/hybrid search; augment LLM prompt for grounded gen. GraphRAG: build KG from data, retrieve subgraphs + community summaries.

**Fraud Use** (2025+ papers):
- Index historical fraud cases, txn subgraphs (users-edges-txns), log snippets, KYC docs.
- Query: "Given this txn graph + user logs, is fraud? Similar past cases: [retrieved]".
- Real-time fraud (Singh arXiv2501.15290): RAG LLM for AI scams.
- Mastercard: RAG for unstructured in fraud systems.
- safe-graph papers: LLM-Powered Text-Attributed Graph Anomaly via RAG Reasoning (2025); GraphRAG variants for fraud.
- DGP (AAAI26): Dual-granularity prompting w/ graph-enhanced LLMs for fraud.

**Pros**: Reduces hallucination; incorporates fresh/unseen data (graphs + text); explains via retrieved evidence ("similar to case X because...").
**Cons**: Retrieval latency/quality (indexing graphs expensive; need good embedder); context window limits (summarize subgraphs).
**Assumptions**: Vector DB (or graph DB w/ embeddings) of txns/logs; good retriever (e.g. GNN embeds or sentence-transformers for text).
**Limitations**: Graph construction/maintenance for dynamic txns; scalability (sample subgraphs).
**Complements**: RAG on top of graph (GNN pre-embeds nodes/subgraphs) + classical scores. Retrieved evidence + ensemble probs -> LLM review.

**Representation Notes**:
- **Transaction Graph**: Nodes (user, merchant, device, txn, agent); edges (transfers, auth, device-link). Attributed (amount, time, KYC flags). Text attrs: descriptions.
- **RAG Index**: Embeddings of: (1) node/edge summaries or full subgraphs (via GNN or LLM), (2) raw logs as text chunks, (3) OSINT snippets. Hybrid search (vector + graph traversal).
- For KYE/KYA: See dedicated section below.

## 3. Agentic Review Systems

**Origin/Mechanism**: LLM agents (tool use, planning, multi-agent; ReAct, AutoGen-style, 2023-2025 boom; Agentic RAG survey 2026). Multi-step: perceive, plan, act (call tools: DB query, GNN run, rules), reflect. Multi-agent: detector, explainer, risk assessor, human-escalation decider.

**Fraud Use**:
- Layered defense (Sardine 2026): AI agents multiply rules/ML.
- Workflow ex: Input flagged txn (from ensemble) -> Agent1: fetch graph + logs + KYA -> Agent2: run lightweight GNN or retrieve RAG cases -> Agent3: reason w/ LLM + evidence, output score/explain + action (block/review/allow) -> Audit log.
- Synthetic gen agents or red-team for robustness.
- IBM/Sardine: LLMs as assistants for investigators (query data in NL, summarize cases).

**Pros**: Handles complex reasoning, multi-modal (graph+text+rules); adaptive; natural explanations; human-in-loop scalable.
**Cons**: Latency (multi-step), reliability (agent loops/halluc), cost, safety (jailbreaks in agent harm benchmarks noted in surveys).
**Assumptions**: Tool APIs reliable (graph DB, model endpoints); orchestration framework (LangGraph etc.); monitoring.
**Limitations**: Not for every txn (selective on high-uncertainty from classical); eval hard (agent benchmarks emerging).
**Complements**: Classical/ensemble as fast gate (99% pass-through); graph for structure; LLM agent only on 0.1-1% candidates. SSL pretrain helps agent "understand" domain.

**Industry**: Feedzai GenAI for defense; "ensemble of AI models" (ML predictive + LLM encoder).

## 4. Synthetic Data Generation

**Origin/Mechanism**: GANs/VAEs (older), LLMs/GenAI (diffusion, autoregressive) for tabular/graph/text. Prompt or fine-tune to gen realistic fraud samples (rare class oversample); or adversarial (simulate attacker).

**Fraud Use**:
- Gen synthetic fraud txns/logs to balance train (esp. novel patterns).
- Privacy-preserving: share synth instead of real.
- Stress-test: gen edge cases.
- From reports: GenAI both offense (deepfakes >50% fraud per Feedzai 2025) and defense (synth train).

**Pros**: Addresses 0.1% imbalance directly; augments for SSL pretrain or sup fine-tune; privacy.
**Cons**: Synth may not capture real distrib (mode collapse, poor generalization); label leakage or unrealistic; eval needed (TSTR - train synth test real).
**Assumptions**: Good generator conditioned on fraud attrs; domain knowledge in prompts.
**Limitations**: Regulatory skepticism (is synth "real" for audit?); combine w/ real + reweight.
**Complements**: Feed synth fraud to ensembles/SSL; use real + synth for RAG index or agent training. LLM for graph synth (e.g. gen edge text).

## 5. Recent SOTA 2024-2026 Trends (from Surveys + Papers)

- **Survey Synthesis (Chen 2025, Thivaios 2026, Hafez 2025)**: DL rise; hybrids (ens + DL + graph); multimodal (struct + unstruct); cost-sens + XAI required. Privacy (FL, synth). Shift from pure sup to self-sup/pretrain + few-shot. LLM-assisted emerging (not dominant).
- **Graph + LLM Boom (safe-graph 2025-26)**: FLAG (LLM-enh GNN fraud KDD25), DGP (graph LLMs prompting AAAI26), Can LLMs Find Fraudsters (multi-level), GuARD (text-rich graph LM), Transaction foundation models (TransactionGPT KDD26, TREASURE KDD26 self-sup txn seq), PANTHER (generative pretrain behavior NeurIPS25). Text-attributed graphs (logs + graph).
- **Self-sup/SSL in Hybrids**: Hyphatia (tabular SSL beats XGB), SEFraud (graph self-explain), T-JEPA (tabular pretext), pretrain then fine (few labels).
- **Agentic & RAG**: Agentic RAG (2026 survey); real-time RAG fraud; LLM as algorithmist or reviewer.
- **Foundation Models**: Pretrain self-sup on massive txn logs/graphs (no labels) -> embed or adapt for fraud (zero/few shot GAD like AnomalyGFM).
- **Defense vs AI Fraud**: GenAI fraud rising (deepfakes, fake docs); layered + agentic response.
- **Overall Trend**: Not "LLM replaces"; "classical + graph + LLM ensemble/layer". Integration architectures: early fusion (multi-modal embeds), mid (GNN on graph+text feats), late (score + LLM reason).

**Integration Architecture for Full Pipeline (Structured + Unstructured)**:

**Data Layers**:
- **Structured**: Txns (amount, time, type, loc), Users (KY C profile, history), Relationships (graph: payer-payee, device-share, session), KYE/KYA attrs (see below).
- **Unstructured**: Access/auth logs (timestamp, IP, UA, outcome, seq), Descriptions/notes (free text), OSINT (external feeds), Images/docs (for KYC but secondary).

**Representation**:
- **Tabular/Feat Eng**: Classic + stats (aggs over windows).
- **Graph**: Heterogeneous G (multi-node/edge types). Nodes: user, txn, merchant, device, agent (for KYA), employee (KYE). Edges: performed, linked_to, from_session. Attribs: numeric + text (embed text via LLM/SentenceTransformer; or joint).
- **Text/Logs**: Tokenized or embedded. For RAG: chunk logs + txn summaries + KYC text into index (w/ metadata for filter). GraphRAG: LLM extracts entities/rels from logs -> augment KG.
- **KYA/KYE Specific** (critical for hybrid):
  - **KYA (Know Your Agent)**: Emerging (2025-26). For AI agents, intermediaries, mule orchestrators. Structured: agent_id, authorized_by (human/entity), behavior profile (action rate, patterns), risk score. Graph: agent nodes connected to actions/users (detect hidden orchestrators via mule clusters). Unstruct: agent "conversations"/logs (LLM analyze intent), attestation docs. RAG: retrieve prior agent behaviors. Fraud ex: agentic commerce fraud, account takeover by delegated AI.
  - **KYE (Know Your Employee)**: Insider risk, AML. Structured: employee features (role, access level, hist), linked to txns/logs they touch. Graph: employee-user interactions. Logs: privileged access patterns (LLM flag anomalous phrasing or timing). Combine w/ user KYC.
  - **KY C/KYB/KYT**: Base; extend w/ above.
  - **Hybrid Rep**: Het graph + text attrs on nodes/edges. Multi-modal embedder (GNN for struct + LLM for text) or separate towers fused. For RAG: query "subgraph around agent X + recent logs".

**Pipeline Stages (Cascaded + Fused Hybrid - Recommended for Latency/Recall)**:
1. **Ingestion/Feat**: Real-time stream (Kafka etc.) -> structured feats + parse logs -> build/update dynamic graph (temporal edges) + embed text (light LLM or cached).
2. **Fast Gate (Classical Ensembles + Anomaly)**: IF or rules or cost-sens XGB/LGBM stack on tabular + basic aggs. High recall, <1ms. Pass ~95-99% benign. Output: score + uncertainty.
3. **Graph Layer (GNN + SSL)**: On flagged or sampled: run temporal/het GNN (or precomputed embeds + light update). Incorporate KYA/KYE relations. Use SEFraud-style self-explain masks or contrastive. SSL pretrain (GraphGuard, T-JEPA on tabular slice) for robust reps w/ few labels. Semi-sup: leverage gray (unlabeled suspicious) samples.
4. **Selective LLM/Hybrid Review**: For high-score/uncertain/borderline (or sampled): 
   - Retrieve RAG: similar subgraphs (graph search), log chunks, OSINT, KYC/agent profiles.
   - Agentic: Multi-agent system reasons (tools: fetch more, run GNN explainer, simulate). Output: fraud prob, explain (cited evidence), recommended action, confidence.
   - Fusion: Combine classical/GNN probs w/ LLM reasoned score (weighted, or LLM as meta).
5. **Decision/Action**: Threshold (cost-sens or calibrated). Human review queue w/ full explain + retrieved cases. Feedback loop (labels -> retrain).
6. **Monitoring/Adapt**: Drift detect (stat + performance); SSL foundation update periodically; RAG index refresh (new cases, OSINT); cost matrix review.

**Alternative Architectures**:
- **Early Fusion**: Joint multi-modal model (GNN+LLM cross-attn on graph+text tokens) - powerful but heavy, less real-time.
- **Late Ensemble**: Independent towers (tabular ensemble, GNN, LLM-log branch) -> meta stack or vote. Easier to maintain/interpret components.
- **Foundation + Adapt**: Pretrain large self-sup txn/graph model (like TREASURE/TransactionGPT) on unlabeled data -> fine-tune or prompt for fraud (few labels). RAG over its knowledge.
- **Synthetic Aug**: Gen rare fraud (text logs + graph structures) -> mix into train for all stages.

**KYE/KYA + Logs Representation Details**:
- **Structured KYE/KYA**: As node features (categorical risk tiers, numeric behavior stats) or edge types ( "agent_of", "employee_reviewed"). Include in GNN message passing.
- **Unstructured Logs for KYE/KYA**: Access logs of agents/employees as time-series text or event seq. Embed (or LLM process) for "intent" signals. RAG retrieve "agent X performed Y on Z date" chunks.
- **Graph Augment w/ Text**: Text-attributed graphs (logs attached to edges). Methods: LLM encode text -> node init feats; or separate text GNN.
- **Privacy/Reg**: Anonymize before LLM/RAG; differential privacy or synth; on-prem small LLMs for sensitive logs. Explain includes which KYA features/logs drove decision (SEFraud-style masks + retrieved).
- **Few-Label**: Use SSL on full graph+text (contrast masked logs or subgraph views); semi-sup label prop or pseudo on gray KYE/KYA flagged; few-shot GNN prompt/ adapt.

**Pros of Full Hybrids**: Leverages strengths (speed+recall classical, structure graph, semantics/context LLM). Handles struct+unstruct. Better drift/zero-day (SSL + RAG fresh). Regulatory friendly w/ layered XAI.
**Cons**: System complexity (orchestration, data pipelines); latency budget (selective LLM only); eval (end-to-end metrics hard; component + joint); cost.
**Assumptions**: Multi-modal data access (logs, graphs buildable); compute for selective heavy stages; labels for some sup (aug w/ synth/semi).
**Limitations**: Integration bugs (data leakage across stages); over-reliance on LLM (always gate w/ classical); evolving regs on AI (EU AI Act high-risk for fraud?).

**Best Practices (See limitations file for full)**: Always gate w/ fast models. Use self-explain + retrieval for audit. Cost-sensitive at every fusion. Monitor per component + pipeline. Start simple (IF+XGB + basic RAG) -> add graph/agents. Validate on realistic imbalance + temporal splits.

**Code Architecture Sketch (High-Level Hybrid Pipeline)**:
```python
# Conceptual (not full deps)
# 1. Feats + embeds
tabular = extract_tabular(txn)
log_emb = llm_encoder(access_logs)  # or cached
graph_emb = gnn_encoder(user_subgraph)  # incl KYA nodes
kya_struct = get_kya_features(agent)
# 2. Gate
score_classic = if_xgb_ensemble(tabular, log_emb[:fast])
if score_classic < thresh: return allow
# 3. Graph + RAG
retrieved = rag.retrieve(subgraph=..., logs=..., kya=kya_struct)
gnn_score, masks = sefraud_gnn(graph)
# 4. Agentic LLM
prompt = f"Txn: {tabular}. Graph explain: {masks}. Retrieved: {retrieved}. KYA: {kya}. Decide fraud?"
agent_out = llm_agent.run(prompt, tools=[...])
final = fuse(score_classic, gnn_score, agent_out.prob)
# 5. Action + log explain
```
(Use orchestration: LangGraph or custom. Toy: sklearn + sentence-transf + networkx stub + open-source LLM API.)

**References**: Full list + links in papers_sources.md (esp. Singh RAG, safe-graph LLM papers, SEFraud for graph explain in hybrid, surveys for trends, KYA industry sources).

**To Roadmap**: Top combos in synthesis/roadmap_contrib. E.g., high-recall: IF cascade + selective agent; graph-heavy: SEFraud-style + RAG; log-heavy: LLM-log tower + classical gate.
