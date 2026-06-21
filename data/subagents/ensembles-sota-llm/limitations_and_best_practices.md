# Limitations and Best Practices: Ensembles, SSL/Semi-Supervised, LLM/Hybrid Fraud Detection

**Scope**: Honest assessment of limitations (from papers, surveys, industry reports). Actionable best practices. Fraud-specific (imbalance 0.1%, real-time, XAI/reg, drift, struct+unstruct). Grounded in sources (Chen 2025 survey, Thivaios 2026, SEFraud deploy, Hyphatia, RAG/agent papers, safe-graph, Feedzai/Sardine reports, KYA sources).

## Cross-Cutting Limitations

1. **Extreme Class Imbalance & Evaluation**:
   - Accuracy useless; even AUC can mislead. Papers use PR-AUC, F1, Recall@K, cost-sensitive metrics.
   - Limitation: Many studies report optimistic numbers (no temporal split, data leakage, synthetic balance in eval). Real 0.01% harder.
   - Surveys note 48/57 DL papers struggled w/ imbalance.

2. **Concept Drift & Adversarial**:
   - Fraud evolves rapidly (camouflage in graphs, AI deepfakes >50% per 2025 Feedzai). Static models degrade fast.
   - SSL helps generalization but not immune; RAG freshness limited by index lag.

3. **Interpretability & Regulatory**:
   - Black-box DL/GNN/LLM risky for compliance (GDPR, explain decisions, audit).
   - Post-hoc (GNNExplainer, SHAP) slow/approximate/not faithful. SEFraud addresses w/ built-in but still limited to graph.
   - LLM explanations can hallucinate justifications.

4. **Latency, Scale & Compute**:
   - Full GNN/LLM/agent per txn impossible at scale. Hybrids rely on selective application.
   - Graph construction (dynamic txns) and RAG indexing costly.
   - Real prod: 28k tx/s, <100ms cited in some hybrid claims.

5. **Data Availability & Quality**:
   - Labeled fraud expensive/rare (privacy). Unstructured logs noisy, incomplete, PII-heavy.
   - Public datasets (IEEE-CIS, European CC) limited (no full graph+logs+KYA).
   - Graph fraud: camouflage (fraudsters mimic legit); heterophily.
   - KYA emerging: standards/data for "agents" immature.

6. **Privacy, Security & Ethics**:
   - Logs/OSINT/graphs contain sensitive data. LLM/RAG risk leakage or attacks (prompt injection, agent harm benchmarks).
   - Synth data: fidelity issues, regulatory acceptance unclear.
   - Federated/ privacy-pres methods mentioned in surveys but complex.

7. **Integration & System Complexity**:
   - Layered pipelines (ensemble -> graph -> LLM): hard to debug, monitor, version. Cascading errors.
   - Eval end-to-end rare; component metrics don't predict joint.
   - Maintenance: multiple models drift at diff rates.
   - Cost: LLM calls expensive at volume even if selective.

8. **LLM/Hybrid Specific**:
   - Hallucination, inconsistency, jailbreaks (noted in agentic surveys).
   - Latency: multi-agent > single pass.
   - Over-reliance: industry consensus (Sardine, IBM) "AI won't replace rules or ML".
   - Foundation txn models (2025-26): promising but early (few public fraud evals).
   - Agentic: coordination failures, eval benchmarks immature.

9. **Research Gaps (from surveys)**:
   - Few multimodal (struct+graph+text+logs) public benchmarks.
   - Limited long-term drift studies or prod A/B.
   - KYA/agentic fraud nascent.
   - Cost of FP vs FN rarely quantified precisely in academic.
   - XAI fidelity vs human expert alignment under-studied outside SEFraud deploy.

10. **General SOTA Limits**: Hybrids win but papers often compare within paradigm. Compute barriers limit reproducibility of large foundation/LLM work.

## Best Practices (Actionable, Fraud-Specific)

**Data & Preprocessing**:
- Use temporal splits + time-aware validation (stratified by timestamp per Chen survey). Simulate drift.
- For imbalance: cost-sensitive losses/thresholds primary (better than oversample alone). Combine w/ synth for rare subtypes. Validate synth (TSTR: train synth, test real).
- Feature eng: domain (aggs, velocity, graph degrees) + learned (SSL embeds, LLM text embeds).
- Graph: het multi-rel (include KYE/KYA explicitly). Handle temporal (edge timestamps, dynamic GNN).
- Logs/unstruct: parse to events + free-text; embed or chunk for RAG. Anonymize/PII scrub before LLM.
- KYE/KYA: Collect as structured (risk attrs, links) + logs (agent/employee actions). Build relations in graph. RAG index agent profiles + behaviors.
- Augment scarce labels: semi (gray samples, consistency), SSL pretrain on all unlabeled, few-shot techniques.

**Modeling**:
- **Layered Default**: Classical ensemble gate (IF + cost-sens XGB or stack; high-recall, fast) → graph/SSL (on flagged; self-explain preferred) → selective LLM/agent (RAG-grounded, evidence-based) w/ fusion.
- **Ensembles**: Start IF+XGB cascade/score aug for complementarity. Add stacking for perf. Always cost-sens + calibrated probs + cost-aware thresh (optimize expected cost, not just AUC).
- **SSL/Semi**: Pretrain tabular (T-JEPA/VIME/SubTab style) or graph (contrastive or SEFraud mask+loss) on large unlabeled. Fine-tune or use as features. For few labels: leverage gray + semi methods (e.g. CGNN).
- **Graph**: Prefer self-explainable (SEFraud) or add post XAI. Temporal/het for txns. Use w/ classical.
- **LLM/RAG/Agentic**: 
  - Selective only (uncertainty or high-score from gate).
  - Ground w/ RAG (graphs subgraphs + logs + OSINT + KYA). Use GraphRAG or hybrid search.
  - Agent: multi-agent w/ tools (retrieval, model calls, rules). Prompt engineering + few-shot examples of good fraud reviews.
  - Small/domain models or on-prem for logs/privacy. Cache embeds.
  - Explanations: cite retrievals + model masks + SHAP. Human review format.
- **Fusion**: Late score fusion (calibrated) or LLM-as-meta (w/ all scores + evidence in prompt). Avoid black-box early fusion unless latency allows.
- **Synthetic**: Use conditioned gen (fraud type, KYA context); mix real+synth; monitor distrib shift.
- **Foundation Models**: If available (txn pretrain), use for embeds or zero/few-shot base; fine or RAG on top.

**Training & Optimization**:
- Metrics: Primary PR-AUC or cost-weighted; secondary Recall@K (top-N review), FP rate at target recall, latency.
- Hyper: Bayesian opt (Optuna in FinStack-Net ex); per-stage.
- Cost matrix: Explicit from business (FN=avg fraud $, FP=review cost + churn prob). Revisit periodically.
- Imbalance in ensemble: scale_pos_weight, focal loss, undersample majority in cascades.
- SSL objectives: contrast (positive=views or temporal neighbors; neg=random), recon (masked feat/edge/adj), predictive pretext.
- Semi/few: pseudo-label careful (high conf only); consistency reg; graph label prop.

**Deployment & Operations**:
- **Real-time**: Gate w/ <1ms models. Heavy stages async or sampled. Target p99 latency.
- **Monitoring**: Per-component (drift stats, perf on recent window) + pipeline (joint metrics). Shadow mode new models. Alert on FP/FN cost spikes.
- **Retraining**: Triggered (drift or perf) + scheduled. SSL pretrain cheaper/frequent on unlabeled. Sup fine-tune on new labels.
- **Explain & Audit**: Every decision: primary model contrib + secondary evidence (RAG cites, masks, SHAP). Store for reg. Align w/ experts (as in ICBC SEFraud).
- **Human-in-Loop**: Agent outputs for review queue (w/ full context). Feedback labels back to train.
- **Privacy/Security**: On-prem/small LLMs for sensitive; synth for sharing; access controls (RAG). Red-team agents/prompts. Comply EU AI Act etc. for high-risk.
- **Layered Defense (Sardine/IBM consensus)**: Rules (simple, auditable) + ML ensembles + graph/SSL + LLM/agent + human. AI augments, doesn't replace.

**Evaluation & Experimentation**:
- Realistic: imbalance, temporal holdout, multiple fraud types (known/novel), graph structure, some log simulation.
- Ablations: w/ vs w/o SSL pretrain; gate vs full; RAG vs no-ground; KYA features on/off.
- Prod proxy: latency, throughput, human review burden, end-to-end cost (fraud prevented - review/churn).
- XAI: fidelity (does explain match model?), plausibility (expert agree?), simulatability.
- Compare fairly: same data splits, report full PR curves, contamination sensitivity for IF etc.

**Integration w/ KYE/KYA + Logs**:
- Graph primary: nodes for agents/employees + edges to actions/users.
- Logs: event seq (for temporal models) or text chunks (RAG/embed).
- In LLM prompts/agents: always include KYA/KYE context + relevant log excerpts.
- RAG: filterable by agent/user; retrieve "similar agent behaviors".
- Monitor separately: insider (KYE) vs external/agent (KYA) fraud patterns.

**When to Use What (High-Level)**:
- Budget/tight latency/low labels: Classical ensemble + basic SSL pretrain.
- Relational fraud dominant: Add graph (self-explain) + SSL.
- Rich logs/descriptions/OSINT: Add LLM/RAG selective.
- Agentic/AI threats: KYA focus + agentic defense.
- Max performance (tolerate complexity): Full layered hybrid + foundation + synth.

**Implementation Order (Practical)**:
1. Classical cost-sens ensemble baseline (IF+XGB or stack) + XAI + metrics.
2. Add SSL pretrain (tabular first, easy gain per Hyphatia).
3. Graph layer on relations (incl KYE/KYA).
4. RAG index (logs + cases + profiles).
5. Selective agentic LLM review + fusion.
6. Monitoring, synth, feedback loops.

**Risks to Avoid**:
- Applying LLM to every txn.
- Ignoring temporal/drift in splits.
- Over-optimistic metrics w/o real imbalance.
- Complex hybrid w/o strong gating/monitoring.
- Treating KYA as afterthought (agent fraud rising).

**References for Practices**: Chen/Thivaios surveys (preproc, challenges); SEFraud (deploy XAI); Sardine/IBM (layered); Hyphatia (SSL practical); RAG/agent papers (grounding); industry reports (GenAI dual).

**For Main Project**: These inform "honest" model cards (include limitations section), experiments (ablate layers), roadmap (recs w/ caveats). Prioritize runnable simple baselines extensible to hybrids.

*Iteratively refined. Prioritize accuracy and practicality.*
