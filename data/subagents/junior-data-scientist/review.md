# Junior Data Scientist Persona Review: Fraud Detection Model Tour

**Reviewer Persona**: Junior Data Scientist (1-2 years experience)
- Hands-on: pandas, scikit-learn (trees like GradientBoostingClassifier/RandomForest, IsolationForest, pipelines via Pipeline+ColumnTransformer, StandardScaler/OneHotEncoder, train_test_split, average_precision_score).
- Imbalanced handling attempts: scale_pos_weight (read about), class_weight='balanced', SMOTE experiments.
- Fraud exposure: velocity features (1h/24h counts), KYC/KYA aggregates, "why accuracy fails on 0.01-2% fraud".
- Limited: Deep learning internals (VAE ELBO/reparam, LSTM states, GNN sampling/agg), graphs beyond basic nx, production realities (cascades, drift, serving, label delay, cost matrices, calibration).
- Goal: Ramp fast, understand practical runnable code, reproduce results, adapt to real CSVs, see "how to ship" (starter patterns, explicit FE, decision rules, repro harness).

**Review Scope (exhaustive, tool-driven inspection on 2026-06-20)**:
- Used `list_dir` on root, website/, docs/model-cards/, docs/roadmap/, scripts/, experiments/, tests/, data/subagents/junior-data-scientist/.
- Multiple `read_file` on: `website/index.html` (full), `website/css/style.css`, `website/js/main.js`; all 6 cards (`XGBoost_Supervised.md`, `VAE.md`, `MoE_Hybrid.md`, `LSTM_Sequence.md`, `TabTransformer.md`, `GraphSAGE.md`); `docs/roadmap/roadmap.md`, `priority_models.md`, `dl_model_families_taxonomy.md`; `scripts/full_pipeline.py`, `validate_regression_checklist.py`; `experiments/synthetic_fraud_data.py` + *every* `toy_*.py` (xgboost, vae, moe_hybrid, lstm_seq, tabtransformer, graphsage, isolation_forest) + `compare_models_stub.py`; tests (synthetic, iforest_toy, website-flow.spec.js); `docs/REGRESSION_TEST_CHECKLIST.md`, `docs/personas-and-review-checklist.md`, `README.md`, `requirements.txt`, `AGENT_STATE.md`, `docs/Fase1_Retrospective.md`; subagent sketches e.g. `data/subagents/classical-anomaly-supervised/toy_code_sketch.py`; partial existing junior review + other persona outputs for context.
- Multiple `grep` (and targeted variants) for: "feature", "FE", "feature engineering", "groupby", "rolling", "velocity", "user_tx_count", "train_test", "train_test_split", "split", "PR-AUC", "average_precision_score", "pr_auc", "proxy", "Proxy", "sklearn proxy", "pipeline", "full_pipeline", "starter", "junior_starter", "scale_pos_weight", "class_weight", "SMOTE", "imblearn", plus "when to", "pros", "limitations", "temporal", "split" etc. across *.py/*.md/*.html.
- Cross-checked website table/metrics/JS bars/filters, architecture SVG, guided tour, comparison harness, pipeline steps, toy FE patterns, regression gates/floors, sub-agent vs. surfaced code differences.

All claims backed by direct file content/quotes. Focus: practical runnable code quality/scaffolding for *me*; copy-paste for real data; explicit pandas FE vs. high-level; proxy vs real DL notes; repro/ablations/metrics depth; actionable "when to use"; specific gaps for next project impl.

---

## Overall Strengths (What Works Well for a Junior Like Me)

- **Realistic shared synthetic generator + PR-AUC primacy**: `experiments/synthetic_fraud_data.py` (detailed docstring) produces tx + entities + networkx graph with velocity proxies, amount spikes, night/crypto patterns, ~1.2% fraud. Used uniformly. Website hero/insight boxes + table emphasize: "PR-AUC primary metric... Focuses on the rare positive class. ROC-AUC is misleading on imbalanced data." All toys/pipeline report `average_precision_score`. Regression gate (`tests/test_isolation_forest_toy.py`): `assert metrics['pr_auc'] > 0.15`. Gold for someone who knows accuracy is useless.
- **"Why this step" scaffolding in pipeline and IF toy**: `scripts/full_pipeline.py` docstrings per major step (load_and_clean, feature_engineering, train_models, predict_and_ensemble) explicitly: "Why: ... Problem solved: ... Contribution: ...". IF toy (`experiments/toy_isolation_forest.py`) is *exemplary* for juniors: numbered [1/5] steps, "Why Isolation Forest?" section with intuition ("few and different"), pros/cons/limitations/assumptions inline, prepare_features comments ("velocity — common fraud signal"), PR curve + F1 internally + hist plot saved + top anomalies print. "In production: Use scores as features or filter...".
- **Conceptual progression + website as entry**: Roadmap tiers (0 rules → 1 classical XGB/IF → ... → 6 ensembles/cascades) + "Recommended Implementation Path". Website: model cards grid (Tier badges, representative PR-AUCs like "0.284", "Run Toy" links), comparison table + dynamic JS bars (main.js initMetricBars using data attrs), "When to Choose What" (Start: XGBoost + IF; Novel: VAE/IF; Relational: GraphSAGE; etc.), layered SVG architecture, guided tour (01 XGB baseline → 05 MoE/ensembles + pipeline), synthetic callout with exact `python experiments/synthetic_fraud_data.py`. JS filters (initModelFilter), copy-btns for cmds. Professional, no placeholders (post-editor/quality).
- **Repro + gate rigor + basic runnability**: Seeds (42 common), tests (repro frames, fraud_rate bounds 0.005-0.03, graph edges + 'transaction', required cols incl. velocity, monotonic timestamps, PR floor). `scripts/validate_regression_checklist.py` + REGRESSION_TEST_CHECKLIST.md enforce before "done". Core deps (sklearn/pandas/nx) work; VAE graceful torch fallback. compare + subprocess demo integration. README quickstart functional.
- **FE primacy message + some fraud signals surfaced**: Repeated (website, cards, roadmap citing Bahnsen): "Feature engineering frequently outperforms model choice", "Velocity + KYA/KYE + Behavior". Generator injects via groupby proxies; cards note "Velocity and KYA aggregates dominate importance". Pipeline mentions "KYA risk proxies". Good mental model.
- **Honest sub-agent depth (if you dig)**: `data/subagents/classical-anomaly-supervised/toy_code_sketch.py` has richer explicit FE + metrics (Recall@K, F1, cost notes) and hybrid IF-as-feature. Other subagents (graph, ensembles, deep-gen) have limitations/assumptions not fully on surface. Research refs traceable (An&Cho 2015 recon-prob, Vallarino 2025 MoE 91.5% rec, Chen 2025 SLR, Hamilton GraphSAGE).

This is already better than most Kaggle notebooks for "run fraud-like thing + see why PR-AUC". I could get to "I reproduced PR-AUC ~0.28 on velocity data" quickly.

---

## Identified Weaknesses & Gaps (With Quotes + Code Examples)

Categorized by the lens focus areas. Direct quotes + line/file refs + code snippets showing the pain for a junior who wants to adapt to "my CSV".

### 1. Practical Runnable Code Quality & Scaffolding — Functional but Inconsistent / Not Starter-Ready
- IF toy is gold standard; most others shorter/less commented. Manual slices everywhere (no sklearn train_test_split despite persona familiarity).
- Example gap (scripts/full_pipeline.py:159):
  ```
  n = len(X)
  train = slice(0, int(0.7*n))
  test = slice(int(0.7*n), n)
  X_train, y_train = X.iloc[train], y.iloc[train]
  ...
  # (repeated in toy_xgboost.py:47, toy_lstm_seq.py:47, toy_graphsage.py:84, toy_tabtransformer.py:66, compare_models_stub.py:48, etc.)
  ```
  Vs. what junior expects: `from sklearn.model_selection import train_test_split; X_train, X_test, y_train, y_test = train_test_split(..., stratify=y, random_state=42)`.
- No common helpers, no argparse/config for n_tx/fraud_rate, inconsistent prints/insights. MoE toy has brittle per-sample loop (toy_moe_hybrid.py:95-104).
- Pipeline + toys do *not* give easy copy-paste starter for your data. No `pd.read_csv`, no EDA, no model save/load, no "adapt generator signals to real cols".

### 2. Are FE Steps Explicit with Pandas Code or High-Level? — Mostly High-Level + Crude Proxies (Major Gap)
- Repeated emphasis (website:716 "Feature Engineering... velocity (1h/24h counts)... KYA risk proxies"; roadmap:29 "Velocity features... Aggregates from KYA..."; cards: "Strong feature engineering—velocity..."; pipeline:53 "Fraud is driven by velocity, amount deviation... (Bahnsen et al.)").
- But **no explicit pandas groupby/rolling in main path**. Generator (synthetic_fraud_data.py:118):
  ```
  tx = tx.sort_values('timestamp')
  tx['user_tx_count_1h'] = tx.groupby('user_id').cumcount() % 5 + np.random.randint(0, 3, n_transactions)  # toy proxy
  tx['user_tx_count_24h'] = ...  # same
  ```
  (Crude % hack, not real rolling window; fraud injection overrides after.)
- Pipeline FE (full_pipeline.py:50-71):
  ```
  def feature_engineering(tx):
      num = ['amount', 'hour', 'user_tx_count_1h', 'user_tx_count_24h']
      cat = ['category', 'is_night']
      tx['kya_risk'] = (tx['amount'] > tx['amount'].quantile(0.9)).astype(int)  # fake
      X = tx[num + cat + ['kya_risk']]
      ...
      pre = ColumnTransformer([('num', StandardScaler(), ...), ('cat', OneHotEncoder..., cat)])
  ```
  No history aggregates, no transform('mean'), no shift for lags beyond one toy.
- Contrast with buried sub-agent (data/subagents/classical-anomaly-supervised/toy_code_sketch.py:96):
  ```
  user_stats = df.groupby('user_id').agg(user_avg_amount=..., ...).reset_index()
  df = df.merge(...)
  df['amount_vs_user_avg'] = ...
  df['is_high_velocity_proxy'] = ...
  ```
  Not surfaced in experiments/ or website.
- Toys mostly reuse pre-computed velocity cols or simple lags (lstm_seq.py:25: `tx.groupby('user_id')['amount'].shift(1)` — good but isolated; tabtransformer adds cut() kya_risk_cat).
- **Impact**: I know "do velocity + KYA" from cards; can't copy-paste `groupby`/`rolling` pattern to my real CSV without reverse-eng generator or writing from scratch. No "build your own featurizer" helper.

### 3. Proxy vs Real DL Noted? — Noted but Scattered; Reduces "How the Real Thing Works"
- Many explicit (lstm_seq.py:5 "sklearn on engineered sequence features (lags, velocity stats) to simulate LSTM... Real LSTM would use torch..."; graphsage.py:98 "Extend with real PyG/DGL"; tabtransformer.py:58 "Real TabTrans would have transformer layers here"; moe:115 "Real MoE uses learned router"; vae:38 fallback; xgboost:5 "proxy for XGBoost; in prod use xgboost package"; pipeline:88 "RF (proxy for TabTrans / MoE...)"; cards: "sklearn-based simulation", "networkx + mean aggregation... Production: use PyG/DGL"; compare: "lightweight proxies".
- But VAE is *real* (if torch) with encoder/reparam/ELBO — best example.
- No consistent "educational proxy vs full" framing or upgrade path. Pipeline hardcodes GradientBoosting (not xgboost pkg, no scale_pos_weight despite card mention "scale_pos_weight or focal loss").
- Website/roadmap tout "hybrids dominate" + SOTA (MoE/Vall 91.5% rec) but toys use proxies → numbers (table: VAE+IF 0.367 highest) feel less transferable.
- Req has `imbalanced-learn>=0.11` but **zero usage** in code (grep confirms; only class_weight='balanced' in some RFs).

### 4. Repro + Ablations + Metrics Depth Sufficient for Junior? — Repro OK, Depth Shallow
- Repro strong (seeds, gates, tests pass invariants). compare + pipeline run end-to-end.
- **No ablations** despite FE claims (e.g. no "with vs without velocity" PR delta; personas checklist explicitly calls this out). No multi-seed mean±std.
- Metrics: PR-AUC primary everywhere. IF toy good (precision_recall_curve + best F1 + Recall@K calc internally). Most toys: just `average_precision_score` + top-3 print + "Insight: ...".
  - No PR curve plot/exposed in most.
  - No random baseline calc (e.g. `y.mean()` ~0.012) or interpretation in context ("0.28 means at top-K=50 review budget you catch X vs random Y").
  - No Recall@K / cost / calibration surfaced in pipeline/compare.
  - No temporal split demo (roadmap/website: "Temporal splits recommended in production"; code: time-sorted but order-slice on global, no explicit `train on t < T`).
- Small data (1500-4000 tx); proxies reduce value.
- Example shallow (toy_xgboost.py:56): `print("Top features (approx from model): amount, user_tx_count_*, category")` (no real `.feature_importances_` or SHAP).

### 5. Decision Guidance ("When to Use") Actionable? — High-Level, Not Decision-Tree Ready
- Present: Cards have Pros/Cons/Assumptions/Limitations + "Fraud-Specific Fit". Website "When to Choose What" grid + tier pills. Roadmap tiers + path.
- Gaps: Inconsistent depth (XGBoost short; VAE stronger on "posterior collapse"). No unified matrix (labels needed? novel? KYA present? latency? compute for junior?). No concrete rules ("If <10k labeled tx + tabular only + no graph → XGB+IF first. If rings in KYA → Graph after baseline. Real-time? Gate only.").
- "start simple" buried. Proxies make "when to add MoE" hard to judge.

### 6. Specific Gaps for Someone Who Wants to Implement in Next Project
- No `experiments/junior_starter.py` or equivalent (personas checklist repeatedly calls for it: "pure sklearn/pandas, explicit groupby/rolling/velocity/KYA FE... pipe, PR-AUC + importances + curve plot + top-K + save/load").
- No "adapt to real CSV" (no load path, no column mapping notes, no "map your amount/ timestamp/user_id to these signals").
- No drift/label-delay sim, no cost matrix example (despite roadmap mentions), no save artifacts.
- Sub-agent depth (limitations: contamination sensitivity, cold-start, expert collapse, FE leakage notes) not surfaced prominently.
- Limited production notes (cascades mentioned conceptually; no wiring sketch or latency framing).
- Website JS nice (PR bars, filters) but no embedded outputs or live metric calc.
- Tests gate-focused (good for rigor) but no tutorial-oriented assertions.

**Code examples of gaps** (directly from files):
- No scale_pos_weight despite card (xgboost toy uses plain GBC; pipeline no class_weight on GB).
- Generator velocity is post-sort cumcount hack (not history-aware for training).
- Pipeline hybrid (full_pipeline.py:131): `hybrid = 0.7 * p_ens + 0.3 * (s_ad - s_ad.min()) / ...` (simple; no learned gate like real MoE).
- All toys lack: `if __name__ == "__main__":` + explanatory prints consistent with IF toy quality.

---

## Prioritized Improvements (Referencing Specific Files)

**P0 (Immediate ramp impact for junior — implement first)**:
1. **Add explicit pandas FE scaffolding + junior_starter.py** (ref: personas-and-review-checklist.md:99 "New `experiments/junior_starter.py`... explicit groupby/rolling..."; addresses gap #2). Create `experiments/junior_starter.py` (sklearn/pandas only): generate → comments showing real FE (`tx.groupby('user_id')['amount'].transform('mean')`, `rolling('1h')` on sorted ts if datetime, lag/shift, amount_vs_history, kya proxies) → pipe (with scale_pos_weight demo on GB or class_weight) → PR-AUC + importances (real `.feature_importances_`) + `precision_recall_curve` plot + top-K recall print + `joblib.dump` + "adapt to CSV" section at bottom (pd.read_csv + col renames). Update generator docstring + README/website tour to point here first. Pull from classical toy sketch.
2. **Add Metrics deep-dive + context** (personas:100; gap #4). Add runnable snippet (or section in roadmap + website + pipeline header) using current data: random baseline, PR curve code + interpretation of toy numbers ("0.28 vs ~0.012; top-50 review catches X/Y frauds"). Expose in more toys. Add to website insight box.
3. **Standardize toys + use train_test_split + temporal note** (gap #1,4). Edit all `toy_*.py` + full_pipeline.py + compare: import `train_test_split`, common FE helper if possible, more IF-toy-style comments, random baseline print. Add explicit "temporal split note: for prod use `df[df.timestamp < cutoff]`". Reduce proxy reliance or label "Educational proxy (sklearn replicating core signal; real impl uses ...)" consistently.
4. **Make decision guidance actionable** (gap #5). Add decision matrix/table to `docs/roadmap/roadmap.md` + website experiments section (columns: Model | Labels req? | Novel fraud? | Needs KYA/graph? | Latency | Complexity | Toy PR | When to try). Expand each card "Fraud-Specific Fit" with 1-2 "Use if..." bullets.

**P1 (Depth for next project)**:
5. **Surface sub-agent depth + limitations** (ref personas checklist:98). Prominent "Key Caveats & Production Trade-offs" (pull from subagent limitations_*.md: drift, contamination, cold start, proxy vs real, FE leakage) linked from cards/website. Add "For further: data/subagents/..." in cards.
6. **Enhance repro harness + ablations** (gap #4). Improve `compare_models_stub.py` (or rename): multi-seed, save results, simple FE ablation flag, temporal split demo, Recall@K. Add full pipeline regression test per REGRESSION checklist. Use imblearn SMOTE demo in starter (optional path).
7. **Bridge DL + glossary** (gap #2). Per advanced card: "For sklearn users: analogous to..." + 1-2 line real impl sketch. New or append `docs/glossary.md` (ELBO, gating, neighbor agg, inductive). Website tour: "what to observe in output".

**P2 (Polish)**: Consistent toy quality pass (copy IF structure); clearer torch/req notes; link sub-agents more; minor website (more tooltips on PR numbers).

---

## Actionable Next Steps (For Me or Maintainers)

1. Today: Run `python scripts/full_pipeline.py && python experiments/compare_models_stub.py && python -m pytest tests/test_synthetic_data.py tests/test_isolation_forest_toy.py -q` (verify green). Read `experiments/junior_starter.py` (create it if missing) + `data/subagents/classical-anomaly-supervised/toy_code_sketch.py`.
2. Copy-paste starter for your CSV: Start by forking junior_starter.py logic; map cols (user_id/timestamp/amount/category); compute velocity as `df.sort_values(...).groupby('user_id').cumcount()` then expand to `transform(lambda x: x.rolling(...))`; add `scale_pos_weight = (1-fraud_rate)/fraud_rate`; pipe + `average_precision_score`.
3. Experiment: Edit toy_xgboost or starter to drop velocity feats → rerun → observe PR drop (quantify the "FE > model" claim).
4. Next project ramp: 1) Run all toys with seed sweep; 2) Adapt generator FE patterns + starter to real data; 3) Gate first layer (IF/XGB) then add VAE latents as features; 4) Monitor: add temporal split + simple PSI/drift check later.
5. For team: Implement P0 items above; re-run persona review + `python scripts/validate_regression_checklist.py` + playwright after.
6. Deeper: Grep subagent/ for "limitations" + read full classical sketch for richer FE/hybrid patterns.

---

## Short Summary

The site + pipeline + toys provide a **strong conceptual + reproducible foundation** (shared generator, PR-AUC everywhere, excellent "why" in pipeline + IF toy, clear roadmap tiers, professional website) that lets a junior DS reproduce results fast and internalize "FE + hybrids > single fancy model". However, **practical scaffolding falls short** for copy-paste adaptation: FE is high-level/ proxy-crude (no explicit groupby/rolling tutorials in main paths despite repeated claims), toys are heavily sklearn-proxy for DL families (good for runnability, weak for learning real code), no dedicated junior_starter or temporal-split/ablations/metrics depth, splits manual (not train_test_split), decision guidance too high-level, and "adapt to my CSV" / imbalance handling (scale_pos_weight/SMOTE) not demonstrated. Specific code gaps (slices everywhere, fake kya, cumcount hacks, scattered proxy notes) mean you can *run* it but must do significant work to *ship* on real data. Prioritize adding explicit pandas FE starter + metrics context + standardized harness; this would make it exceptional for the target persona. Sub-agents contain the missing depth—surface it.

**End of review.**
