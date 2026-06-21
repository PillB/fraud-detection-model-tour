# Mid-Level AI Researcher & Data Scientist Review: Rigorous Audit of Model Tour (Fraud Detection ML)

**Reviewer Persona**: Mid-Level AI/ML Data Scientist (3-5 years shipping real ML pipelines — tabular + graph/seq; built fraud/anomaly systems). Deep focus on: production realities (latency, drift, monitoring, FP costs, label delay, integration, scalability, human review queues), honest trade-offs, "how do I actually extend or deploy this", reproducibility in practice, and clear extension paths.

**Review Date**: 2026-06-20  
**Review Method**: Exhaustive filesystem inspection using list_dir, grep (multi-strategy broad + targeted), read_file (full + offset/limit on key files), cross-references. No assumptions; all claims traceable to exact content. Covered "live" surface (website/index.html + supporting) vs buried assets.

**Scope Reviewed** (absolute paths):
- Live website surface: `/Users/pabloillescas/Projects/Model Tour/website/index.html` (full HTML + embedded Tailwind/JS refs), `website/css/style.css`, `website/js/main.js`, `website/assets/` (empty).
- 6 model cards: `docs/model-cards/XGBoost_Supervised.md`, `VAE.md`, `MoE_Hybrid.md`, `LSTM_Sequence.md`, `TabTransformer.md`, `GraphSAGE.md`.
- Roadmap: `docs/roadmap/roadmap.md` (full), `docs/roadmap/dl_model_families_taxonomy.md`, `docs/roadmap/priority_models.md`, `docs/model-cards/` (cross).
- Pipeline script + comments: `scripts/full_pipeline.py` (entire).
- Experiments: `experiments/synthetic_fraud_data.py` (full), `compare_models_stub.py`, all `toy_*.py` (xgboost, vae, moe_hybrid, lstm_seq, tabtransformer, graphsage, isolation_forest), `experiments/iforest_toy_score_dist.png`.
- Subagent limitation docs (buried): `data/subagents/classical-anomaly-supervised/limitations_and_assumptions.md`, `data/subagents/deep-generative-models/limitations_and_fraud_fit.md`, `data/subagents/graph-temporal-gnn/limitations_and_fraud_fit.md`, `data/subagents/ensembles-sota-llm/limitations_and_best_practices.md`, `data/subagents/sequence-hybrid-dl/limitations.md` + supporting findings/roadmap_contrib/synthesis in subdirs (esp. classical, graph, ensembles).
- Tests/gate: `tests/test_synthetic_data.py`, `tests/test_isolation_forest_toy.py`, `tests/website-flow.spec.js`, `scripts/validate_regression_checklist.py`, `docs/REGRESSION_TEST_CHECKLIST.md`.
- Supporting: `README.md`, `docs/personas-and-review-checklist.md`, `AGENT_STATE.md` (context), `requirements.txt`, `package.json`, root-level docs/Fase* retros (for evolution).
- Cross: Grep across entire tree for "cascade|drift|FE|feature engineering|temporal|split|proxy|Recall|cost|latency|monitor|serv|deploy|educational|stub".

All paths below are absolute. This is a production-practitioner lens review: does the *surface* (vs sub-agents) prepare me to deploy, trade off, extend, or monitor?

---

## Executive Summary

**Surface (website/index.html + cards + roadmap summary + pipeline/expts)** is a polished, professional (BCG/McKinsey Tailwind aesthetic), educational reference: clean hero with "Layered Cascades" + PR-AUC emphasis, 6-card grid with rep PR-AUCs (IF 0.218, XGB 0.284, GraphSAGE proxy 0.319, VAE+IF 0.367, MoE 0.295, TabT 0.278, LSTM 0.261), conceptual SVG architecture, guided tour, "When to Choose What", documented pipeline, reproducible (seeds, generator) toys, regression gate. Strong on FE primacy, hybrids-as-standard, KYA/KYE/relational signals, PR-AUC over accuracy. All toys "gate-validated"; site claims "RESEARCH-BACKED • ALL TOYS GATE-VALIDATED".

**But for a mid-level practitioner who has shipped fraud systems**: **Good orientation / model selection tool (A- for education). Weak-to-aspirational for production deployment, trade-offs, and extension (B- / C+)**. "Cascades", "FE primacy", "drift" are repeatedly asserted on surface as production truths but remain high-level prose or aspirational — not actionable in code or surfaced details. Experiments are reproducible but shallow (proxy-heavy, non-temporal splits in practice, PR-AUC-only, no variance/drift sims/cost/Recall@K, small N). Sub-agent limitations files contain the real depth (honest on label delay, FP costs, scalability, integration, monitoring); these are *buried* (data/subagents/, minimal site links). Gap between research synthesis and practitioner-visible artifacts is large.

**Key Finding**: You can run `python scripts/full_pipeline.py` + toys quickly and learn concepts. You cannot directly lift the code for a production cascade, wire velocity features from a real feature store, add drift monitoring, or quantify latency/FP cost trade-offs without heavy augmentation. Sub-agents rescue the project intellectually; surface does not prepare you for "how do I actually ship this".

**Overall Persona Grade**: Educational synthesis + onboarding: **strong**. Production starter kit + extension surface: **needs targeted hardening**. Recommendation: Use for orientation + prototype inspiration. Mine sub-agents first for reality. Always validate on real temporal data + add your own MLOps (feature store, PSI monitors, cascade serving, cost matrix).

---

## 1. How Well Does the Surface Content Prepare You for Production Deployment and Trade-offs?

**Surface strengths (what a mid-level sees immediately on site)**:
- Hero + overview: Explicit imbalance reality (0.01-2%), "PR-AUC primary", "Layered Cascades" (fast high-recall gate rules+IF → classifier → graph/generative → selective review), "Feature engineering frequently outperforms model complexity" (velocity + KYA/KYE + Behavior).
- Architecture SVG (index.html ~310-392): Shows RAW DATA → FE → FAST GATE (Rules + IForest) + parallel models (XGB, VAE, MoE, LSTM, GraphSAGE) → ENSEMBLE/GATE → RISK SCORE + Explanations + Review queue. Good visual for cascades.
- Roadmap tiers (index.html ~269-297 + linked md): Tiers 0-8 with "Layered cascades... production standard", "gate first", "cost-sensitive, explainable, drift-resilient".
- Cards: Each has "Fraud-Specific Fit" + limitations (e.g. VAE.md: "best as part of cascade"; XGBoost: "Use in cascades: rules/IF → XGBoost"; GraphSAGE: "Production: use PyG / DGL"; LSTM: notes real-time truncated windows/heavier compute).
- Pipeline section: "Foundation for production cascades", "Feature engineering routinely outperforms" (Bahnsen), 4-step with "Why/Problem solved/Contribution".
- Experiments table: PR-AUCs + "Hybrids... deliver the highest PR-AUC... All models pass the regression gate (PR-AUC > 0.15)".
- Guided tour + "When to Choose What": Practical sequencing (start XGB+IF → add VAE/seq/graph → hybrids).
- Footer/hero: "Regression gate enforced", synthetic + relational, GitHub source.

**Preparation for deployment/trade-offs: Partial and surface-level**:
- Good high-level framing of what matters (FE, cascades, PR-AUC, review queue, relational gaps).
- No concrete trade-off quantification on surface: no latency numbers (e.g. "<1ms IF vs VAE"), no scale (millions tx vs toy 2k-4k), no FP cost (review time, customer friction), no integration patterns (how velocity computed online without full scan? how scores feed rules engine?), no serving sketch, no monitoring hooks.
- "Production-style" and "Production pattern" language is aspirational. Pipeline is single hybrid score fusion (not staged cascade with early exit). No feature store, no streaming sim, no human review queue logic.
- Links are good (cards → full .md + toy .py; pipeline → source), but no "Production Extension" section or "From Toy to Prod" checklist. Subagent depth (e.g. ensembles: "28k tx/s, <100ms"; graph: "extreme scale (DGraph 3.7M nodes)", "memory for TGN") is not pulled to surface or linked prominently.
- Result: You know *why* cascades/FE matter conceptually. You do not know *how* to implement the gate logic, budget latency, handle label delay in training, or choose when classical is "enough" vs adding graph (no decision matrix on site).

**File refs**: website/index.html:224 (Layered Cascades box), :368 (GraphSAGE card "Production: use PyG/DGL"), :725 (pipeline "Foundation for production cascades"), docs/roadmap/roadmap.md:127-143 (Tier 6 cascades detail), scripts/full_pipeline.py:114 (mentions recall@K in comment but not computed).

**Verdict**: Surface orients well for *selection*. Poor for *deployment decision-making or trade-off analysis*. Mid-level will bookmark sub-agents.

---

## 2. Are "Cascades", "FE Primacy", "Drift" Actionable or Aspirational?

**FE primacy**:
- Surface: Repeated (hero, roadmap tiers, pipeline docstring ~52-57: "Feature engineering frequently outperforms model choice (Bahnsen et al.)", cards, "Key takeaway", "When to Choose").
- Code: Synthetic generator injects velocity (user_tx_count_1h/24h) + kya_risk proxy + FE in every toy/pipeline (feature_engineering func). Good.
- **Actionable?** Moderately. You see the features and importance claims. No ablation experiment (e.g. "w/ velocity vs raw: ΔPR-AUC") despite claims. Sub-agents (classical) have deeper Bahnsen +13% savings context and history-dependency caveats. Surface good starting point; not quantified.

**Cascades / Layered systems**:
- Surface: Hero insight box, architecture SVG (FAST GATE parallel + fusion), roadmap Tier 6 ("Layered/cascaded systems dominate... Fast high-recall gate..."), pipeline ("Foundation for..."), MoE/VAE cards ("best as part of cascade", "gate first").
- Code: `full_pipeline.py` does late fusion (0.7*ens + 0.3*AD normalized) + top-5 ranking. No staged execution (e.g. IF filter → only score subset with heavy model), no threshold-based routing, no "review queue" output logic beyond print. compare_models_stub and toys are monolithic.
- **Actionable?** Aspirational on surface. Architecture diagram describes the ideal; implementation is a simple ensemble proxy. Sub-agents (ensembles-sota-llm/limitations_and_best_practices.md:71 "Layered Default", roadmap_contrib) have explicit staging + cost-sens at every layer. Site positions as "production standard" without the wiring code or gotchas (cascading errors, per-component monitoring).

**Drift**:
- Surface: Roadmap tiers mention "drift-resilient", LSTM card ("Essential for modeling drift"), VAE ("Drift: Requires periodic retraining"), overview ("accommodate concept drift"), experiments note "Temporal splits recommended in production".
- Code: `synthetic_fraud_data.py` has monotonic timestamps + velocity. `test_synthetic_data.py:63` asserts `is_monotonic_increasing`. **No drift injection** (e.g. post-train merchant shift or fraud pattern evolution), no detection (PSI/KS/ADWIN), no retrain trigger, no temporal validation in any experiment/pipeline (all use `slice(0, int(0.7*n))` after optional sort — see below). Pipeline comment ~40 notes "temporal" in generator but split is index-based.
- **Actionable?** Aspirational. Sub-agents are rich: graph-temporal-gnn/limitations (memory updates, sliding windows, adversarial), ensembles (drift monitoring per-component), classical (stationarity violation, label delay). No code sketches surfaced (no "Drift Handling Patterns" box with stub). Roadmap says "Continuous: Drift monitoring..." (roadmap.md:212) but no implementation path.

**Overall**: These are *core messages* on surface — repeated for emphasis — but implementation and extension details live in buried sub-agents or are absent. Honest practitioner sees "we know this is important" more than "here is how we handle it in practice / how you extend".

---

## 3. Experiments: Real Temporal Splits? Drift Sims? Multi-Metric (Recall@K, Cost)? Variance?

**Data generator (experiments/synthetic_fraud_data.py)**: Excellent for educational realism.
- 200 users + 80 merchants + 30 workers (KYE); timestamped txns; velocity proxies (cumcount hacks); 3 patterns at ~1.2%; NetworkX tx + KYA/KYE edges.
- Repro (np.random.seed), metadata, monotonic ts.
- Tests (`test_synthetic_data.py`): repro seed, fraud rate bounds (0.005-0.03), graph structure (>50 nodes/>1000 edges + types), required cols, imbalance (5-100 fraud), temporal_order (monotonic).
- **File ref**: synthetic_fraud_data.py:118-121 (velocity), 148-173 (graph), 123-144 (fraud injection).

**Splits (critical for fraud/temporal data)**:
- Every experiment + pipeline + compare: index `slice(0, int(0.7*n))` / range-based (after optional sort by ts or user).
  - full_pipeline.py:159-162
  - compare_models_stub.py:49-50
  - toy_xgboost.py:47-48, toy_graphsage.py:84-85, toy_tabtransformer.py:67-68, toy_lstm_seq.py:48-49, etc.
- Generator sorts tx by timestamp before velocity calc, so slices are *roughly* chronological. But **not explicit temporal holdout** (no `cutoff = tx['timestamp'].quantile(0.7); train = tx[ts < cutoff]` with future-only test, no user-grouped, no leakage guards beyond basic).
- Sub-agents repeatedly demand "temporal splits + time-aware validation" (ensembles-sota-llm:62, classical:169, graph:59, personas doc).
- **Verdict**: Aspirational claim ("Temporal splits recommended in production" — index.html:617) vs actual code. Leakage risk real for mid-level (future info in train via global quantiles/means in FE).

**Drift sims**: None. No code injecting shift (e.g. new category distribution or velocity regime post-split) or monitoring. Sub-agents detail extensively (adversarial camouflage, memory for TGN).

**Metrics**:
- Primary: `average_precision_score` (PR-AUC) everywhere — correct choice.
- toy_isolation_forest.py: also precision_recall_curve + best_f1, hist of scores.
- Site + roadmap + cards mention Recall@K, cost-sensitive (Bahnsen), F1.
- **Actual code**: No Recall@K (sort + top-K precision/recall), no cost matrix (FN=amt lost, FP=review_cost), no expected cost savings. Pipeline comment mentions "recall@K" but computes only PRs.
- No calibration, no operating-point selection for review queue.
- **File refs**: toy_if:143-147 (F1), pipeline:133-134 (only PR), website/index.html:799 ("PR-AUC and Recall@K matter...").

**Variance / robustness / multi-run**:
- Single seed (mostly 42) or hardcoded. No loop over seeds + mean±std. No sensitivity (contamination, latent_dim, n_estimators).
- Representative values noted ("seeds and hyperparameters affect... execute locally" — index.html:687), but no actual variance in outputs or table.
- No ablation (FE impact quantified? hybrid delta? graph feats lift?).

**Depth / scale / integration**:
- N ~1.5k-4k tx (tiny). Graph toy: simple mean agg on NetworkX (no sampling, no PyG).
- Pipeline + compare: largely reinvents GBDT/IF/ensemble internally; limited calls to "real" card toys (subprocess for 2 in compare; VAE torch-optional; MoE/LSTM/TabT/Graph are sklearn proxies).
- Full DL not in main runs (VAE has HAS_TORCH fallback; "proxy" disclaimers in toy_lstm_seq.py:5, toy_tabtransformer.py, toy_graphsage.py:74, toy_moe_hybrid.py:5, compare "stub").
- Regression gate: Only synthetic + IF toy enforced (`validate_regression_checklist.py`, REGRESSION_TEST_CHECKLIST.md). No pipeline or multi-model regression test yet (comments show planned). Playwright test is load-only (minimal).

**Verdict (persona view)**: Reproducible and better than most toys (shared generator + gate + PR-AUC focus). Shallow for production insight: no temporal rigor, no operational metrics (Recall@K for queue sizing, cost for ROI), no variance, proxies hide real DL behaviors (gating dynamics, recon prob calibration, neighbor sampling variance), no drift. "Comparative Results" table on site overstates when most are proxies. Sub-agents cite real benchmarks (TGN 0.77 vs static 0.61 on DGraph); here not replicated.

---

## 4. Proxy Usage and "Educational" Disclaimers?

**Heavy and explicit in places, optimistic in others**:
- Toys: LSTM "sklearn on lagged/velocity features to simulate LSTM... Real LSTM would use torch..." (toy_lstm_seq.py:5,22). TabTransformer: "ColumnTransformer + RF as 'embedding sim'. Explicit note: 'Real TabTrans would have transformer layers'". GraphSAGE: "networkx + mean aggregation... Production: use PyG / DGL". MoE: "Sklearn experts (RF/GBT/IF) + heuristic... 'Real MoE uses learned router'". VAE: real PyTorch (ELBO, reparam, recon prob per An&Cho) *but* HAS_TORCH + fallback proxy.
- Pipeline: Uses GBDT (not xgboost pkg), RF as "TabProxy"/MoE meta, IF + simple weighted hybrid. Comments call out "proxy for TabTrans / MoE".
- compare_models_stub.py: "lightweight proxies + integrates real toy... Filename retains historical identifier" (note at end).
- Site: "Proxy uses lagged + velocity features" (LSTM card:488), "educational simulation using embeddings" (TabT:510), "Uses networkx... Production: use PyG" (Graph:532). "All six model families" framing + table presents as comparable.
- Cards/roadmap: Honest in limitations ("Proxy" language scattered).
- **"Educational" framing**: Present ("Designed to be educational and replicable", "toy", "representative"). Sub-agents + personas doc are more blunt about limits.
- **Issue for mid-level**: Proxies teach concepts and guarantee runnability (no heavy deps for all), but obscure production behaviors you care about (actual sequence state for drift, learned routing load-balance, inductive sampling variance, reconstruction prob calibration). "Run Toy" links lead to "this is not the real thing — go read papers/subagents". VAE is the strongest real DL example.

**Verdict**: Disclaimers are honest where present (better than hidden stubs). But surface marketing ("6 Research-Backed Models", performance table, "hybrids dominate") can mislead without digging. Proxy choice prioritizes accessibility over fidelity — acceptable for tour, frustrating for "extend this".

---

## 5. Practical Code to Extend (e.g. Serve Models, Monitor)?

**Current extension surface**:
- Toys + pipeline: Runnable, documented "Why" comments, import generator, report PR-AUC + top scores + (sometimes) importances.
- Generator extensible (params for n/fraud_rate/seed; returns tx/ents/G/meta).
- No model serialization (joblib/pickle implied), no ONNX/TorchScript.
- No serving: No FastAPI/Flask endpoint example that recomputes velocity aggregates on arrival.
- No monitoring: No PSI/KS on features/scores, no drift detector stub, no performance on recent window.
- No feature store pattern (how do you maintain `user_tx_count_1h` at inference without rescanning history?).
- No cascade wiring (gate logic that skips expensive models on clear legit).
- No cost/Recall@K helpers.
- Sub-agents have sketches (graph implementation_ideas.md has PyG HeteroData; ensembles have layered pseudocode), but not in main experiments/ or linked from cards/site.

**Practical gaps for mid-level**:
- Label delay: Code assumes labels present for eval. Sub-agents stress delayed chargebacks.
- Integration: "how scores feed existing rules engine", shadow deploy, A/B.
- Scalability: No batch timing, neighbor sampling demo, memory notes exercised.
- Human review: Top-N print only; no queue simulation or precision@K.

**Extension paths that *are* clear**: Modify generator → rerun toys. Add features in FE funcs. Swap models in pipeline (comments encourage).

**Verdict**: Good for quick local iteration and learning. Zero practical hooks for production concerns (serve/monitor/integrate). You will write your own adapters.

---

## 6. Gaps Between Research Synthesis (Sub-Agents) and What a Mid-Level Practitioner Sees on Site

**Sub-agents (buried in data/subagents/)**: Senior-level rigor.
- classical: 100+ lines on iid violation (temporal), label delay/noise, contamination, FE history dependency/cold-start/privacy, metrics traps, "few and different" mimicry failure, entity resolution for KYA. Per-model limits + cost model details.
- deep-gen: training instability, FP on rare legit, drift monitoring/retrain, synth fidelity, scalability (gate expensive models), black-box.
- graph-temporal: heterophily/camouflage, DGraph scale (3.7M), TGN memory/latency, temporal splits/negative sampling, "Focus on ROI (reduce FPs by 1% = $millions)", integration with stores.
- ensembles: latency/scale (28k tx/s <100ms), layered complexity/debugging, LLM cost/hallucination, maintenance of multiple models, "cost of FP vs FN rarely quantified", best practices (temporal splits, layered default, selective LLM, monitoring).
- Strong on prod realities: FP customer friction, regulatory, real-time, integration, monitoring stack.

**What practitioner sees on site/cards/pipeline**:
- High-level echoes ("concept drift", "Layered Cascades", "FE primacy", "best as part of cascade", "Production: use PyG").
- No dedicated "Production Considerations / Trade-offs / Deployment" section (personas doc explicitly calls for one).
- No excerpts or prominent links to `data/subagents/*/limitations*.md` (roadmap mentions sub-agents in a few places; site does not).
- Caveats are footnotes or brief lists. Optimistic framing ("All toys validated", "client delivery").
- Experiments/pipeline do not exercise the hard parts (no drift, no scale, no cost, non-temporal splits).
- Result: Research synthesis is excellent (traceable papers 2024-2026: Chen, Vallarino, An&Cho, Kim TGN, Thivaios, Bahnsen, safe-graph). Practitioner-visible view is "inspirational overview" that under-delivers on the exact pain points (drift, FP cost, integration, monitoring, label realities) the persona cares about.

**Gap impact**: Mid-level reads site, feels "this is the right direction", then opens sub-agents and realizes "the hard stuff is documented but I have to do the work to surface/ implement it". Classic research-to-prod translation failure.

---

## Specific Recommendations (Prioritized for Mid-Level)

**High-Priority (Production Pain Points)**:
1. Add prominent "Production Deployment Trade-offs" section to website/index.html (after experiments or new nav). Pull from sub-agents.
2. Harden experiments: Implement real temporal split helper; add multi-seed variance + Recall@K(K=50) + simple Bahnsen cost (mock review_cost=10, fraud_amt=avg); optional full-toy integration flags; ablate FE (velocity/KYA).
3. Surface sub-agent depth: Add "Key Production Caveats (from research)" excerpts or direct links in cards + roadmap + footer. "Read data/subagents/.../limitations*.md for drift, scale, FP realities."
4. Add minimal extension artifacts: `experiments/production_stubs.py` or section with (a) temporal_split func, (b) simple PSI/KS drift monitor stub, (c) FastAPI scoring sketch (on-the-fly aggregates + ensemble).
5. Update pipeline + compare: Document gaps explicitly in top docstring; optionally call more real toys; add regression test for pipeline outputs.
6. Add 1-2 "production table" examples (see below).

**Medium**:
- Model cards: Add "Integration Snippet" (10 lines: cascade gate) + "Scaling / Latency Notes" + "Assumptions Violated in Prod" box.
- Experiments: Pin optional deps; generate more viz (recon distrib, gating); variance in reported numbers.
- Website: Stronger "Educational proxy — full impl notes in card + sub-agents" disclaimers next to table numbers. "From Toy to Prod" checklist.

**Code Examples for Recs** (add to new stubs or pipeline):

```python
# Recommended: temporal split (replace all index slices)
def temporal_train_test_split(tx, time_col='timestamp', test_frac=0.3):
    tx = tx.sort_values(time_col)
    cutoff = tx[time_col].quantile(1 - test_frac)
    train_mask = tx[time_col] < cutoff
    return tx[train_mask], tx[~train_mask]

# Simple drift monitor stub (KS on score distrib or feature)
from scipy.stats import ks_2samp
def detect_drift(ref_scores, new_scores, alpha=0.05):
    stat, p = ks_2samp(ref_scores, new_scores)
    return p < alpha, stat, p
```

**Suggested New "Production Tables" (example content to add; currently missing)**:

**Table 1: Model Family Production Trade-offs (Latency / Coverage / Integration / When)**

| Family          | Est. Inf. Latency (toy scale) | Coverage (Novel / Known / Relational) | Scalability Notes                  | Integration Effort | FP Risk / Cost Notes                  | When to Gate/Use in Cascade |
|-----------------|-------------------------------|---------------------------------------|------------------------------------|--------------------|---------------------------------------|-----------------------------|
| Rules + IF     | <1ms                         | High novel / Low known / Low         | Excellent (subsample)             | Low (feature store easy) | High on rare legit (review queue cost) | Always first gate          |
| XGBoost        | <1-5ms                       | Med / High known / Low (flat)        | High                              | Low (tabular)     | Tunable w/ cost-sens; still needs FE | After gate; primary known  |
| VAE (hybrid)   | 5-20ms (PyTorch)             | High novel / Med / Low               | Med (batch/CPU); heavier          | Med (latents as feats) | Flags rare legit; calibrate recon    | On gate-flagged only       |
| GraphSAGE      | 10-50ms+ (sampling)          | Low / Med / High relational          | High (PyG + sampling fanout 10-25; DGraph scale hard) | High (graph store, entity res) | Camouflage/heterophily; cold-start   | Relational subset only     |
| MoE / Hybrids  | 10-100ms (routing)           | High across archetypes               | Med-High (multiple experts)       | High (debug fusion, versioning) | Complex monitoring; expert collapse  | Selective / high-uncertainty |
| LSTM/Seq       | 5-30ms (truncated)           | Med-high behavioral / drift          | Med (window state)                | Med-High (history mgmt) | State poisoning; window choice       | Behavioral after gate      |

(Sources: sub-agents + industry cites like 28k tx/s; add measured on your hardware.)

**Table 2: Example Operational Cost Matrix + Metrics (add to pipeline / experiments)**

| Metric                  | Random Baseline (~1.2%) | Current Toy Ensemble | Target (Ops) | Business Translation |
|-------------------------|-------------------------|----------------------|--------------|----------------------|
| PR-AUC                 | ~0.012                 | 0.29-0.36           | >0.40       | -                   |
| Recall@K (K=50)        | ~0.05                  | TBD (add)           | 0.30+       | Catch 30% fraud in top 50 alerts |
| Est. Savings (Bahnsen) | -                      | TBD                 | +$X / mo    | FN cost = avg fraud amt; FP = $15 review |
| FP rate at 50% recall  | High                   | TBD                 | <0.1%       | Review queue volume |

Implement via:
```python
def recall_at_k(y_true, scores, k=50):
    idx = np.argsort(-scores)[:k]
    return y_true.iloc[idx].sum() / y_true.sum() if y_true.sum() > 0 else 0
```

**Other concrete recs**:
- Add to `REGRESSION_TEST_CHECKLIST.md` + validate: require temporal split test + pipeline regression.
- Link sub-agents limitations from website footer + each card.
- In generator or new script: drift injection mode (e.g. shift category probs after N tx).

---

## Summary Assessment Table

| Dimension                    | Surface (Site/Cards/Pipeline/Expts)          | Buried (Sub-Agents)                  | Persona Impact (Prod Reality)          | Priority to Fix |
|------------------------------|----------------------------------------------|--------------------------------------|----------------------------------------|-----------------|
| FE Primacy                   | Asserted + implemented in toys               | Deep (history dep, lift quantified) | Actionable starting point             | Med            |
| Cascades / Layered           | Visual + prose ("production standard")       | Explicit patterns + gotchas         | Aspirational (no staged code)         | High           |
| Drift / Monitoring           | Mentioned ("recommended", "requires")        | Excellent (sim, memory, PSI, etc.)  | Not actionable (zero code)            | High           |
| Experiments (splits/metrics) | Repro, PR-AUC primary, single-seed, proxies  | Call for temporal/Recall@K/cost     | Shallow insight; leakage risk         | High           |
| Extension / Serving / Monitor| Runnable toys; "extend with PyG" notes       | Sketches + best practices           | No practical hooks                    | High           |
| Trade-off Quantification     | High-level (PR-AUC table)                    | Latency/scale/FP cost/ROI           | Missing for decisions                 | High           |
| Caveats / Assumptions Clarity| Footnotes + card lists                       | Rigorous 100+ line files            | Risk of over-optimism                 | High           |
| Reproducibility / Gate       | Good seeds + 2 tests                         | N/A                                 | Solid core; expand coverage           | Med            |
| Overall for Mid-Level        | Strong orientation                           | Senior research depth               | Use site for map; sub-agents for reality | -            |

---

## Short Summary at Close

The Model Tour delivers a beautiful, research-backed educational experience with correct priorities (PR-AUC, FE, cascades, relational signals, hybrids). The 6 cards, roadmap, pipeline comments, and generator are high-quality for onboarding and conceptual understanding. Regression gate and reproducibility basics are enforced.

For a mid-level practitioner who has actually shipped fraud/anomaly pipelines, the surface content falls short exactly where it matters most: **actionable production trade-offs, real temporal evaluation, operational metrics (Recall@K + cost), drift/monitoring code, serving/integration patterns, and honest extension paths beyond "use PyG"**. "Cascades", "FE primacy", and "drift" are well-advertised but aspirational in implementation. The deep, honest synthesis lives in `data/subagents/*/limitations*.md` — largely invisible from the live site.

**Gaps are fixable and high-ROI**: surface the sub-agent depth, harden splits/metrics/variance, add 2-3 production stubs (temporal split, monitor, cascade/serving sketch), and insert the suggested trade-off/cost tables. With those, this becomes an outstanding practical reference + starter kit rather than "great tour, now go build the hard parts yourself."

This review is grounded exclusively in the inspected files. Use it to guide targeted improvements.

**File written to**: `/Users/pabloillescas/Projects/Model Tour/data/subagents/mid-level-ai-researcher-data-scientist/review.md` (per task).

*All specific quotes, line numbers, and content references above derive directly from tool-assisted reads/greps performed in this session.*