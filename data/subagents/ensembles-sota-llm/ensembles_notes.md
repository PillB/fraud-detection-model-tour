# Ensembles Notes: Strategies for Extreme Imbalance Fraud Detection

**Focus**: IsolationForest + XGBoost hybrids, stacking, cascade models, voting, cost-sensitive ensembles.  
**Fraud Context Emphasis**: 0.01-0.1% fraud rate typical (credit card/financial txn). Challenges: extreme imbalance (majority benign dominates), concept drift (adversarial evolution), real-time latency (<10-100ms inference), high FN cost (losses), high FP cost (customer friction/churn), regulatory need for interpretability (XAI/SHAP/auditable), privacy.  
**Structure per Technique**: Origin, Mechanism, When to Use in Fraud, Pros/Cons, Assumptions (data avail), Limitations, How it Complements Others (classical, graph, LLM/SSL). Trade-offs table where apt. Code architecture sketches (high-level, for toy extensibility in main project).

**Sources Grounding**: See papers_sources.md. Key: Chen 2025 survey (imbalance 48/57 DL papers), Monteiro 2025 (IF+XGB), Btoush/FinStack-Net 2025 (stacking), cost-sens refs, Thivaios 2026 survey (cost-sens, ensembles taxonomy).

## 1. Isolation Forest + XGBoost Hybrids

**Origin**: Isolation Forest (IF): Liu et al. 2008 (ICDM) "Isolation Forest". XGBoost: Chen & Guestrin 2016 (KDD). Hybrids popularized in fraud/anomaly prod systems and papers ~2018+; recent explicit: Monteiro 2025 (electricity NTL fraud), Shanaa 2025 hybrid framework, multiple Kaggle/prod pipelines, Devarakonda hybrid layers.

**Mechanism**:
- **IF (unsupervised)**: Builds ensemble of isolation trees (random feature+split). Anomalies isolated quicker (shorter avg path length in trees). Outputs anomaly score (0-1 or -1/+1). Efficient O(n log n) training, linear inference. No labels needed.
- **XGBoost (supervised)**: Gradient boosted trees (additive, regularized obj minimizing loss + complexity). Handles imbalance natively via `scale_pos_weight` or sampling. Feature importance, tree explain.
- **Hybrid Patterns**:
  1. **Cascade / Two-stage pipeline**: IF first (high-recall prefilter on all txns; flag "suspicious" subset e.g. top 1-5% anomaly). Then XGBoost (or other sup) only on flagged or with IF score as feature. Reduces compute on benign majority.
  2. **Parallel / Score fusion**: Run both; combine (weighted avg scores, OR rule for recall, stacking meta on [IF_score, XGB_prob]).
  3. **Feature augmentation**: Append IF anomaly score (or leaf indices) as input feat to XGBoost.
- Often + AE (autoencoder recon error) as extra unsup signal.

**When to Use in Fraud**:
- Extreme imbalance + mix of known patterns (sup) and novel/zero-day (unsup). Real-world: credit card CNP, insurance, utility theft. Prefilter saves cost; catches camouflaged or new fraud IF misses labels for.
- Real-time: IF fast prefilter + lightweight XGB on subset or batched.
- When labels scarce for some fraud subtypes.

**Pros**:
- Robust to imbalance (IF ignores labels/ratio; XGB tuned w/ weights).
- Complementary coverage: known (XGB) + unknown (IF).
- Interpretable components (tree paths, feat imp).
- Scalable; low false novel rate tunable.
- Easy to productionize (sklearn IF + xgboost).

**Cons**:
- IF: Assumes anomalies "few and different"; sensitive to contamination (if fraud >~5-10% training, degrades), high-dim curse, no temporal natively.
- XGB: Overfits drift if not retrained; needs labels (costly).
- Hybrid: Threshold tuning critical (too loose = FP explosion); fusion needs calibration.
- May miss subtle relational fraud (no graph).

**Assumptions (data availability)**:
- Sufficient volume txn data (millions) for stable trees.
- Some labeled fraud (for XGB; can be very few for fine-tune).
- Features: numeric + categorical txn (amount, time, merchant, user stats). Contamination low in train.
- For cascade: anomaly scores correlate w/ fraud (validate).

**Limitations**:
- Drift: Both need monitoring/retrain (adversarial fraud evolves fast).
- Regulatory: Base explain ok (SHAP on XGB, IF path), but combined decision needs careful audit.
- Extreme low fraud (0.01%): Still benefits but precision low without post-processing.
- Not multimodal (unstructured logs need separate).

**How it Complements Others**:
- **Classical/supervised**: Core building block; XGB often beats RF/LR alone.
- **SSL/Semi**: Pretrain reps w/ T-JEPA/SubTab → feed enhanced feats to XGB or IF (or use SSL anomaly scores).
- **Graph**: IF/XGB on flat feats; feed graph node embeds (GNN) as additional feats or run on graph-agg feats. Cascade: classical hybrid first, then GNN on flagged relational.
- **LLM/Hybrid**: IF/XGB as first filter (low latency). LLM agent reviews high-score or ambiguous cases (RAG logs + OSINT + graph summary). Ensemble output scores into LLM prompt or late fusion. Synthetic data from LLM augments rare fraud for XGB.
- Full pipeline ex: txn -> IF prefilter (score>thresh) or XGB -> GNN on user graph subgraph -> LLM review w/ access logs text + KYA features.

**Code Architecture Sketch** (runnable skeleton style for main project toy; sklearn+xgboost):
```python
from sklearn.ensemble import IsolationForest
import xgboost as xgb
import numpy as np
# Train
if_model = IsolationForest(contamination=0.001, random_state=42).fit(X_train)  # X: tabular feats
anomaly_scores = -if_model.decision_function(X)  # higher = more anomalous
# Option1 cascade: mask = anomaly_scores > thresh; Xgb on masked or all w/ score feat
X_aug = np.hstack([X, anomaly_scores.reshape(-1,1)])
xgb_model = xgb.XGBClassifier(scale_pos_weight=99, eval_metric='aucpr').fit(X_aug, y)  # y binary fraud
# Infer: scores_if, probs_xgb = ..., combine e.g. 0.4*norm(if) + 0.6*probs or meta
```
(Extend w/ calibration, threshold opt via PR curve or cost matrix.)

**Trade-off**: High recall first (loose IF) vs low-FP (tight + cost-sens XGB).

## 2. Stacking Ensembles

**Origin**: Stacked generalization (Wolpert 1992). Popularized in fraud via Kaggle (XGB/LGBM/CatBoost stacks), recent FinStack-Net (Cheng 2025), Btoush 2025 stacking for CCFD.

**Mechanism**:
- **Base learners** (level-0): Diverse (e.g. XGB, LGBM, CatBoost, RF, DNN w/ residuals/attn, sometimes LR/SVM). Train on full or folds.
- **Meta-learner** (level-1): LR, XGB, or small NN. Inputs: base predictions (probs or logits) or + orig feats (stacking w/ features).
- **Variants**: Simple voting (soft/hard avg); but true stacking learns how to combine.
- Advanced: Hierarchical (FinStack-Net: cross-feat module first -> bases -> meta). K-fold out-of-fold preds to avoid leakage.

**When to Use in Fraud**:
- When single model (even XGB) insufficient for complex patterns or multiple fraud types. Diverse bases capture different signals (trees for interactions, DNN nonlinear). Good for tabular txn data.
- Imbalance: Tune each base w/ weights/sampling; meta on calibrated probs.

**Pros**:
- Reduces bias/variance; often +1-5% PR-AUC over best base.
- Robust: diversity mitigates individual weaknesses.
- Can incorporate cost via weighted losses.
- Feature crossing + stacking (FinStack-Net) captures hidden interactions.

**Cons**:
- Complexity: more compute, harder maintenance, risk overfitting meta (use OOF).
- Inference latency higher (multiple models).
- Interpret harder (meta obscures); use SHAP on whole or per-base.
- Overkill if one strong model (XGB) suffices.

**Assumptions**:
- Diverse bases (tree vs linear vs NN) w/ uncorrelated errors.
- Enough data for stable OOF.
- Calibrated base outputs (Platt or isotonic).

**Limitations**:
- Drift: All bases + meta drift; harder to monitor.
- Real-time: Batch or distill stack to single model.
- Regulatory: Needs strong XAI wrapper.

**How it Complements**:
- **IF+XGB**: Bases can include IF scores or hybrid components.
- **Graph**: Bases = flat + GNN (node/graph level preds); meta fuses.
- **SSL**: Bases trained on SSL-pretrained embeddings.
- **LLM**: LLM logits/embed as extra "base" or meta input. Or stack classical w/ LLM-for-unstruct branch. Agentic LLM as meta "decider" on base outputs + context (logs/KYA text).
- Example: classical stack for speed/recall -> LLM RAG for precision on borderline.

**Code Sketch**:
```python
from sklearn.ensemble import StackingClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
# ...
estimators = [('xgb', XGBClassifier(...)), ('lgb', LGBMClassifier(...)), ('cat', CatBoostClassifier(...))]
stack = StackingClassifier(estimators=estimators, final_estimator=LogisticRegression(), cv=5)
stack.fit(X, y)
```

## 3. Cascade Models (incl. Sequential Filtering)

**Origin**: Cascade classifiers (Viola-Jones 2001 face det, adapted to fraud/anomaly). BalanceCascade/EasyEnsemble (Liu et al. ~2009 for imbalance). Modern: anomaly->sup cascades in fraud papers (Devarakonda 2023, Monteiro hybrids).

**Mechanism**:
- Sequential stages: Stage1 (cheap/fast/high-recall, e.g. rules or IF or simple tree) rejects most benign.
- Later stages (expensive/accurate, e.g. XGB or GNN or ensemble) on survivors.
- Or boosting-style: successive models focus on previous errors (AdaBoost-like or cascade undersample).
- In imbalance: EasyEnsemble (bag balanced subsets), BalanceCascade (iterative remove easy majority).

**When to Use**:
- High volume real-time (millions tx/day): early cheap reject 95%+ benign.
- Cost/latency sensitive. Novel fraud: early unsup stage.

**Pros/Cons**: High throughput + accuracy combo; tunable stages. Cons: error propagation (early miss = lost); complex tuning.

**Assumptions/Limits**: Stages independent-ish; validation per stage. Complements: perfect for layering classical -> graph -> LLM (cascaded review).

## 4. Voting Ensembles

**Origin**: Bagging (Breiman), simple majority/soft vote in sklearn etc.

**Mechanism**: Multiple models (diverse seeds or algos) vote (hard: majority; soft: avg prob). Bagging = bootstrap + vote.

**Fraud Use**: Simple baseline for robustness. Less powerful than stacking for imbalance but stable.

**Pros/Cons**: Easy, parallelizable. Lower perf gain than learned meta.

**Complements**: Base for larger ensembles/hybrids.

## 5. Cost-Sensitive Ensembles

**Origin**: Cost-sensitive learning (Elkan 2001 etc.); applied to ensembles (EasyEnsemble/BalanceCascade; modern papers combine w/ XGBoost/LGBM + cost matrix).

**Mechanism**:
- Modify loss: higher weight/penalty for FN (fraud miss) vs FP. E.g. XGB `scale_pos_weight = neg/pos`, or custom objective.
- Ensemble variants: train on cost-weighted or resampled (focus hard fraud).
- Threshold tuning post (move decision thresh for cost opt or high-recall).
- Hybrid w/ SMOTE + cost.

**When to Use**: Any fraud where FN >> FP cost (typical 10-100x). Regulatory/ business: explicit cost matrix from ops (avg fraud loss vs review cost + churn).

**Pros**: Directly optimizes business metric (not just AUC). Better recall w/o insane FP.
**Cons**: Cost matrix hard to estimate/ static; sensitive to mis-spec. May increase FP.

**Assumptions**: Reliable cost estimates. Complements all above (apply inside bases or meta).

**Limitations in Fraud**: Costs evolve (new fraud types); pair w/ online learning or bandit.

## Comparison Table (Fraud Context)

Technique | Imbalance Handling | Real-time | Interpret | Drift Robust | Best For Scenario
---|---|---|---|---|---
IF + XGB Hybrid | Excellent (unsup+weighted) | Excellent (prefilter) | Good (trees) | Med (retrain) | High-recall first + novel fraud
Stacking | Good (per base) | Med | Med (need XAI) | Low-Med | Complex patterns, max PR-AUC
Cascade | Excellent | Excellent | Good per stage | Med | High-volume low-latency
Cost-Sensitive | Best (direct) | Good | Good | Low | Business-cost aligned (low-FP tuned)
Voting | Med | Good | Good | Med | Robust baseline

**Overall Recommendations in Notes**:
- Start w/ IF+XGB cascade or cost-sens XGB for baseline.
- Escalate to stacking + graph feats for SOTA.
- Always + monitoring, XAI, cost matrix, periodic SSL pretrain.
- For full hybrid (see llm notes): classical ensemble as gate, LLM as reviewer.

**References**: See papers_sources.md (Monteiro, Btoush, Cheng, Chen survey, Thivaios, SEFraud for graph complements, etc.).

**Next**: Integration notes in synthesis and roadmap files.
