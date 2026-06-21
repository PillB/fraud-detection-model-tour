# Personas for Website Review + Improvement Checklist (Next Phase)

**Date:** 2026-06-21 (Fresh sub-agent re-reviews executed 2026-06-20/21 on current complete site)  
**Context:** 5 distinct reviewer personas created and freshly executed via sub-agents (newbie-layman, junior-data-scientist, junior-ai-researcher, mid-level-ai-researcher-data-scientist, senior-ai-researcher-data-translator). Each performed exhaustive tool-driven inspection (list_dir, read_file full/offset, grep) of website/index.html + css/js, all model cards, roadmap + taxonomy, full_pipeline.py, all experiments/toys/synthetic, tests, gate scripts, and sub-agent depth (limitations, papers). Reviews written directly to `data/subagents/<persona>/review.md`.

All personas reviewed from unique lens (layman accessibility through senior research+translation). Validations post-review: regression gate (9/9 passed), full_pipeline + compare harness, Playwright user-flow (PASSED: load + content), no user-facing placeholders/stubs (grep + editor prior + live confirmed).

The site remains strong (professional BCG/McKinsey Tailwind, interactive JS bars/filters, 6 cards with real toy PR-AUCs e.g. VAE+IF 0.367 / GraphSAGE proxy 0.319, SVG arch, documented pipeline with per-step "Why", guided tour, regression gate enforced, "100% complete — no placeholders" footer). Fresh persona reviews reconfirmed and refined the actionable gaps for next-phase elevation. Sub-agent research backbone (9/10) continues to exceed surface delivery (mid 5-6/10 on rigor/translation/SOTA fidelity).

---

## The 5 Personas (Defined + Key Feedback)

### 1. Newbie Layman
**Persona:** Zero ML background. Curious about fraud (e.g., credit card scams, account takeovers) but intimidated by jargon, math, and dense tech. Wants intuitive, story-like explanations and welcoming on-ramps. Prioritizes plain language, visuals, and "what does this mean for me?"

**Key Feedback (from review.md):**
- **Accessibility:** Overwhelming. No true zero-assumption entry. Hero/overview jumps to "PR-AUC", "structured financial data", "SOTA hybrids". "Toy" term confusing. Guided tour present but not layered for novices.
- **Jargon:** Dominant and undefined on first use (PR-AUC everywhere without "random ~ fraud rate"; KYA/KYE rarely spelled out early; velocity, latent, manifold, gating, etc.).
- **Handholding:** Aspirational ("handholding", "beginner-friendly") but execution is expert-reference dressed up. No glossary, running concrete story (e.g., "Alice's $5 coffee vs. $5000 3am spike"), or ultra-simple first layer.
- **Visuals/Examples:** Good SVGs (architecture flow, PR-AUC bars) and one strong histogram (`iforest_toy_score_dist.png`), but conceptual viz in cards are text-only. No story-driven timelines, basic graph "rings", or sample data rows.
- **UX:** Dense long scroll. Professional but creates "this is not for me" feeling. "Regression gate" badge and expert framing alienate.
- **Strengths noted:** Clean design, some hooks (imbalance reality explanation), reproducible elements, "When to Choose What".

**Example Quotes from Persona Review:**
- "A true layperson like me would feel intimidated or lost quickly."
- "The gap between stated goals and execution is real but fixable."

### 2. Junior Data Scientist
**Persona:** Basic ML experience (sklearn, pandas, trees/IF/pipelines on imbalanced data). Some fraud exposure via velocity/KYA signals. Limited DL/graphs/production. Wants practical code, reproducible experiments, bridging from basics, and "how do I ship this?"

**Key Feedback (from review.md):**
- **Practical Implementation:** Good conceptual base + shared realistic generator, but weak on explicit pandas FE code (groupby/rolling aggregates), reusable helpers, "adapt to my CSV" guidance. Toys often proxies (RF/GBDT for DL concepts); no junior_starter.py.
- **Bridging:** Theory good; practice limited. No "for sklearn users: this is like..." analogies, glossary, or progressive exercises. PR-AUC mentioned as "primary" but no worked example with plots/interpretation of the toy numbers (e.g., vs. random ~0.012, top-K value).
- **Pros/Cons + When to Use:** Present but inconsistent depth; no unified actionable matrix/decision tree (labels? novel? KYA? latency?).
- **Reproducibility/Experiments:** Strong seeds/gates/tests for core, but shallow (no FE ablations despite Bahnsen claims, no temporal splits in practice despite text, limited metrics beyond PR-AUC, proxies reduce value).
- **Hands-on Gaps:** No copy-paste runnable starter; limited EDA; no easy config. Sub-agent classical FE sketch richer than surfaced code.
- **Strengths:** Generator + gate rigor, pipeline "Why/Problem/Contribution" docstrings, IF toy as model of clarity, website as accessible front door.

**Example Quotes:**
- "Theory gives you the map; practice lets you run *something* quickly but forces you to start over for real DL extensions."
- "Sub-agents deliver senior-level honesty on exactly the topics that keep fraud systems up at night. The website/cards/code do not surface this sufficiently."

### 3. Junior AI Researcher
**Persona:** Academic ML exposure (papers, theory); interested in fraud/anomaly. Newer to graphs/temporal/applied fraud/hybrids. Values rigor, math/intuition balance, SOTA context, limitations/assumptions, and inspiring further study/reproducibility.

**Key Feedback (from review.md):**
- **Research Depth/Citations/SOTA:** Strong sub-agent backbone (traceable papers_and_sources with extracts/DOIs: Chen 2025 SLR of 57 papers, Vallarino 2025 MoE 98.7%/91.5%, An & Cho 2015 recon-prob, Kim TGN ~0.77 AUC vs. static ~0.61-0.68, etc.). Roadmap/taxonomy exhaustive.
- **Theoretical Explanations:** Good intuition + fraud mapping (IF "few and different"; VAE manifold; GraphSAGE rings). VAE card strongest on math (ELBO, reparam).
- **Gaps:** Citations often summary-level (missing arXiv/DOIs/quotes in cards/site). SOTA aspirational (mentions TGN/SEFraud/DAGMM/Diffusion but no cards/toys/experiments for them; only 6 delivered). Assumptions/limitations excellent in sub-agents but abbreviated on surface (e.g., VAE "mostly clean normal" not quantified). Proxies (sklearn for LSTM/TabTrans/MoE/GraphSAGE) obscure real mechanisms.
- **Comparisons/Families:** Good core coverage + hybrids positioned as standard. Missing dedicated IF card (despite centrality), TGN toy, ablations, variance/CIs, temporal splits in expts.
- **Academic Rigor/Accessibility:** High overall (no hype, honest on synth/FE primacy, PR-AUC education, gate/tests). But reproducibility for *research* limited (proxies, no end-to-end DL, shallow depth). Needs "Open Research Questions for Juniors".
- **Strengths:** Sub-agents + generator + pipeline comments + editor/quality polish (no placeholders, BCG style).

**Example Quotes:**
- "Sub-agents senior+ (9/10). Delivered artifacts mid-level (6/10)."
- "The platform is already strong... Targeted deepening (per checklist) would make it exceptional for scientific quality and inspiring further study."

### 4. Mid-Level AI Researcher and Data Scientist
**Persona:** 3-5 years shipping ML pipelines (tabular + basic graphs, some DL). Focus: production fraud systems, trade-offs, scalability, integration, monitoring/drift, FP costs, label realities, real-time. Values honest caveats, "how do I extend/ship this?"

**Key Feedback (from review.md):**
- **Theory vs. Practice:** Theory (roadmap, cards, sub-agents) excellent (layered tiers, FE primacy, cascades, specific papers/metrics). Practice educational-first but limited (proxy toys, shallow expts, no concrete drift/scalability/integration code).
- **Implementation Challenges:** Sub-agents shine (classical limitations cover iid violations/label delay/drift/contamination/cold-start/KYA entity res; deep-gen on instability/synth fidelity; graph on heterophily/scale/memory; ensembles on latency/debugging/privacy). Surface/website/cards light on these (mentions but no prominent "Production Deployment Trade-offs" table, extension paths, or surfaced sub-agent depth).
- **Experiments/Reproducibility:** Generator + gate solid (repro, bounds, graph, imbalance; IF PR-AUC >0.15 floor). But proxy-heavy (reduces value), no FE ablations (despite claims), limited metrics (PR-AUC primary; sparse Recall@K/cost/variance), shallow depth (small data, non-temporal splits in practice).
- **Gaps for Apply/Extend:** No drift/monitoring/serving sketches, integration patterns (feature stores, cascades wiring), trade-off quantification (latency vs. lift), "when classical is enough".
- **Clarity on Caveats:** Deep truth in sub-agents; surface optimistic ("All toys validated") or brief. Key risks (camouflage, FP friction) mentioned but not prominent.
- **Strengths:** Research synthesis, production framing (cascades, XAI), editor/quality polish.

**Example Quotes:**
- "Sub-agents are the real strength for a practitioner. Website/cards/pipeline are client-ready for *orientation* but require augmentation... before production."
- "The gaps are precisely the practical ones the persona cares about."

### 5. Senior AI Researcher, Data Scientist, and Data Translator
**Persona:** 10+ years; deep expertise in ML/DL research + production (graphs, temporal, anomaly, fraud). Strong on business translation, stakeholders, ethics, strategy. Critically assesses rigor, SOTA, limitations, open problems, comparisons, viz, and real impact/ethics/deployment.

**Key Feedback (from review.md):**
- **Scientific Rigor/Depth/Accuracy:** Sub-agents excellent (9/10; traceable, multi-perspective, honest limitations). Delivered site/cards mid (6/10; proxies, aspirational SOTA, abbreviated caveats).
- **SOTA/Limitations/Open Problems/Comparisons:** Research coverage strong (TGN/HTGNN/SEFraud/DAGMM/Diffusion/MoE/GraphConsis/etc. with benchmarks in roadmap/sub-agents). User-facing lags: only 6 cards (proxies); limitations high-level; no TGN/HTGNN/Diffusion/GAN/SSL cards/toys despite "frontier"; comparisons table/SVG good but no ablations/cross-benchmarks.
- **Visuals/Explanations/Handholding (Advanced):** Solid mid (SVG flows, JS bars/filters). Weak for expert: mostly conceptual (no latent PCA, gating heatmaps, attention, temporal memory, recon histograms, graph rings, PR curves); math light (ELBO present but thin; no full formulas in prominent places); advanced handholding missing (researcher pitfalls like neighbor sampling on imbalanced graphs, temporal splits, homophily failure).
- **Translation (Business/Ethics/Deployment/KYA/KYE Impact):** Biggest gap (3-4/10). Good framing (PR-AUC, cascades, FE, KYA/KYE, "regulatory", XAI). But superficial: no cost/ROI sims, quantified business lifts (Bahnsen-style), vague risks (drift noted but no matrix), ethics/privacy/fairness almost absent (sub-agents mention GDPR/PII/bias; no disparate impact/surveillance/LLM hallucination/KYA profiling bias), deployment high-level only (no MLOps/monitoring/PSI/serving <100ms/feature stores/human-in-loop/calibration), KYA/KYE technically modeled but weak real-impact translation (no investigator workflow/reg mapping).
- **Gaps:** Impl vs. claims (TGN etc. mentioned but not delivered); no temporal splits/drift in expts; limited tests (no full pipeline regression); shallow unstructured/logs; no advanced evals (cost/Recall@K/calibration/adversarial); sub-agent depth under-surfaced.
- **Code/Tests/Pipeline:** Functional + gated baseline good. Not production-grade (proxies, simple splits, limited artifacts). Editor/quality addressed prior stubs (assets wired, no user-facing "Fase"/"stub").
- **Overall Excellence:** 7.2/10. Research + structure near-excellent; impl/translation/viz lag for "professional-grade" + "SOTA" + senior impact claims.

**Example Quotes:**
- "Biggest gap (3-4/10)" on translation.
- "Post-editor/quality site is client-ready for scoped 6 models + basics."

---

## Detailed Checklist of Improvements for Next Phase

Synthesized from all 5 persona reviews (prioritized by impact/frequency across personas; actionable with file references). Focus on **layering for accessibility**, **practical scaffolding**, **deeper rigor + translation**, **production readiness**, and **research inspiration**. Leverage existing strengths (generator, sub-agent depth, gate, pipeline "why", website structure, 6 cards, PR-AUC emphasis).

**P0 (Critical - Do First for Broad Impact + Readiness):**
1. **Website Accessibility Polish (Newbie + All):** Add short "New to this? 2-minute plain English intro" (after hero or in overview) using consistent fictional transaction story (e.g., Alice normal coffee vs. suspicious spike + new links). Add Glossary/Key Terms (JS tooltips or box) with first-use expansions (PR-AUC with random ~0.012 context; KYA/KYE spelled out; velocity; etc.). Layer every model card summary: "In plain words (one sentence)" + short analogy *before* technical text. Enhance Guided Tour with ultra-simple first layer + "What you'll see" previews. (Files: `website/index.html`, cards, roadmap.md)
2. **Surface Sub-Agent Depth (Mid + Senior + Junior Researcher):** Add prominent "Production Deployment Trade-offs" section/table (latency/coverage/scale/integration effort/FP costs, pulling from sub-agent limitations_*.md). Prominently link/surface sub-agent limitations (e.g., "Key Caveats" excerpts or dedicated section in cards/roadmap/website). Add "Limitations of This Tour + Research Gaps" + "Open Research Questions for Juniors" per card (specific/actionable, e.g., "cVAE on KYE vs. graph conditioning"; "actual MoE gating + load-balance vs heuristic"). (Files: website/index.html, all cards, roadmap.md, data/subagents/* /limitations*.md)

   **Concrete examples from mid-level persona review** (data/subagents/mid-level-ai-researcher-data-scientist/review.md):
   - Model Family Production Trade-offs table (Latency | Coverage | Scalability | Integration Effort | FP Risk | Cascade Use).
   - Operational Cost Matrix (PR-AUC / Recall@K / Bahnsen savings / FP rate at operating point).
   - Ready stubs: `temporal_train_test_split` (quantile cutoff on timestamp), `detect_drift` (ks_2samp on scores/features), `recall_at_k`.
3. **Practical Implementation Scaffolding (Junior DS + Mid):** New `experiments/junior_starter.py` (pure sklearn/pandas, explicit groupby/rolling/velocity/KYA FE with comments, pipe, PR-AUC + importances + curve plot + top-K + save/load + explanatory prints). Standardize toys (common helpers, `train_test_split` or explicit temporal note, more IF-toy-style comments). Add FE ablations + stats to experiments/compare/pipeline (despite repeated claims). (Files: new starter, toys, experiments/, scripts/full_pipeline.py)
4. **Metrics Deep-Dive + Context (All Personas):** Add dedicated "Metrics for Fraud in Practice" (PR-AUC deep dive + runnable snippet using *existing* synthetic + precision_recall_curve + plot + interpretation of toy numbers vs. random + top-K value + baseline comparison + production framing: review queue, Recall@K, calibration, FN>>FP costs). Contextualize all reported PR-AUCs everywhere (website table/cards/takeaways, roadmap, experiments). (Files: website/index.html, roadmap, experiments/, cards)
5. **Experiments/ Reproducibility Hardening (Mid + Junior Researcher + All):** Add temporal/user splits + drift simulation + multi-seed (mean±std PR-AUC) + Recall@K + Bahnsen-style cost to experiments/pipeline/tests. Reduce proxy reliance (or label clearly as "educational proxy; full in PyG/DGL"). Full pipeline + comparison regression tests. (Files: experiments/, tests/, scripts/full_pipeline.py, REGRESSION_TEST_CHECKLIST.md)

**P1 (High - Rigor, Translation, Inspiration):**
6. **Math/Pseudocode + Assumptions (Junior Researcher + Senior):** Add 1-2 short formula/pseudocode boxes per card (e.g., GraphSAGE h'_N(v) = AGG(...); IF s(x)=2^(-E(h)/c(n)); MoE gating; TGN time encoding/memory; VAE ELBO/reparam). Make "Key Assumptions" + "Key Limitations" explicit/quantified in cards (surface sub-agent depth). Add "For Further Study / Junior Research Ideas" bullets (e.g., "take synth generator + add real TGN and measure lift on relational + temporal fraud").
7. **Business Translation / Impact / Ethics (Senior + All):** Add cost/ROI simulation (Bahnsen-style savings, review costs vs. prevented losses). Ethics/fairness module (bias toy, privacy/GDPR/PII, disparate impact on KYA profiling, LLM hallucination risks, surveillance). Deployment strategy (MLOps notes, monitoring/PSI/KS, serving <100ms, feature stores, human-in-loop, calibration). KYA/KYE real-impact examples (investigator workflow, reg mapping).
8. **SOTA/Comparisons/Families Coverage (Junior Researcher + Senior):** Deliver (or clearly scope + stub) missing high-priority families from roadmap (TGN/HTGNN toy/card with direct vs. GraphSAGE comparison; minimal Diffusion/GAN/SSL examples). Expand comparisons (ablations, variance, cross-benchmarks, deltas vs. cited SOTA like TGN/SEFraud lifts). Dedicated IF card (use existing excellent toy + classical sub-agent).
9. **Visuals + Handholding Elevation (All, esp. Newbie + Senior):** Realize conceptual viz in cards (commit plots: latent PCA, gating heatmaps, attention, recon histograms, temporal memory, graph rings). Enhance existing SVGs (numbered plain-English callouts, accessibility). Add PR curves, score dists, etc. Progressive disclosure (simple view → full math/details). Stronger variance disclaimers + exact paper-to-toy deltas.
10. **Website/UX/Structure Polish (Newbie + Mid + All):** Add unified decision matrix/flowchart ("if labeled? novel dominant? relational? latency? interpret? → start with..."). Friendlier filter labels + tooltips in JS. Consolidated "Practitioner Extension Path" after beginner tour. Surface pipeline more prominently. Minor: de-stub filename or note; stronger "when classical is enough".

**P2/P3 (Medium/Lower - Polish & Extensions):**
- Optional torch notes + Kaggle/IEEE-CIS/DGraph loader stubs + public data adaptation.
- Richer sub-agent cross-links/appendix in site (e.g., "Deeper dive: see data/subagents/.../limitations").
- Multiple seeds/CIs in expts; blackbox regression floors; KANs/capsules/EBMs notes.
- Enhanced viz (interactive PR curves, exportable metrics).
- Full end-to-end DL in pipeline (call real VAE/MoE/Graph components).
- Ethics/privacy as first-class (disparate impact toy, etc.).
- "Limitations of This Study" box (scale, proxies, no real drift validation).

**Implementation Recommendations:**
- Prioritize P0 for broadest impact + junior/newbie accessibility.
- Leverage existing (generator, IF toy as template, pipeline "why", sub-agent limitations, website structure post-editor/quality).
- Add "For Practitioners" / "For Researchers" / "For Beginners" layered views or toggles.
- Run full validation post-changes: `python scripts/validate_regression_checklist.py && python scripts/full_pipeline.py && python experiments/compare_models.py && npx playwright test tests/website-flow.spec.js`.
- Target: Elevate from "strong foundation + educational for orientation" to "production-grade reference + research launchpad + fully accessible for all personas".
- Measure: Persona re-reviews, user testing (newbie to senior), metrics lift in experiments.

**Persona-Specific Prioritization Examples:**
- **Newbie:** Focus 1,4,6 (plain intro, context, visuals/layering).
- **Junior DS:** Focus 2,3,5 (practical code, starter, metrics + repro).
- **Junior Researcher:** Focus 6,8,9 (math, SOTA, viz/rigor).
- **Mid-Level:** Focus 5,7,10 (production trade-offs, translation, website flow).
- **Senior:** Focus 7,8,11 (business/ethics, SOTA, limitations/open problems).

Full per-persona details + evidence + expanded checklists in the individual `data/subagents/<persona>/review.md` files (e.g., newbie has story examples + UX pain points; mid has production table template + cost matrix; senior has 5.8/10 overall with 3.0/10 on business translation/ethics + explicit P0 for TGN scoping + temporal + expanded gate).

**Fresh Senior AI/DS + Translator Review Highlights (2026-06-21)**:
- Overall: 5.8/10 (research backbone 8.5–9/10; SOTA delivery 5.0/10; business/ethics/ops/KYA translation 3.0/10 — biggest gap; educational polish 8/10; client/prod readiness 3.5/10).
- Key thesis: "High-quality educational tour" with aspirational SOTA + professional claims. Strong sub-agents (Chen, Kim TGN DGraph deltas, Vallarino, Bahnsen, heterophily/camouflage, GDPR/LLM risks, etc.). Delivered: proxies, no real TGN despite Tier 5/roadmap claims, limitations abbreviated, near-zero quantified ROI/cost/ethics/investigator workflows/MLOps.
- Top P0 from senior: (1) Scope TGN/HTGNN properly or mark as not delivered; (2) Temporal splits + drift sim; (3) Expand regression gate to full pipeline + more models; (4) Surface quantified limitations from sub-agents; (5) Ablations + variance + cost metrics.
- Top P1: Bahnsen cost/ROI toy, ethics/fairness/GDPR + KYA investigator/reg mapping, deployment/MLOps guide, rich viz + math boxes.

This checklist is evidence-based, prioritized for impact, and directly actionable from the 5 persona audits (all freshly executed via sub-agents on current site). The project has excellent bones (sub-agent rigor, runnable core, professional site); these changes will make it exceptional across all user levels.

**Next Phase Recommendation:** Implement P0 items first (website layers + sub-agent surfacing + experiments hardening + TGN scoping + temporal/gate), then P1 (translation/ethics/ROI + viz). Re-run persona sub-agents + gate + playwright + live validation after. Target "perfection" for client/PillB handoff.
