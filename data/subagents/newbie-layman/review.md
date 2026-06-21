# Newbie Layman Persona Review: Fraud Detection Model Tour Site & Docs

**Persona:** Complete beginner with ZERO ML or data science background. Interested in "how banks catch fraud with computers" because of news stories about credit card scams, bank alerts on weird charges, or friends' experiences. Finds jargon (PR-AUC, KYA, embeddings, manifold, gating), acronyms, math symbols, long technical pages, and professional consulting-style documents intimidating or alienating. Wants welcoming, story-driven, visual, plain-English explanations with real-life examples (e.g. "Alice bought coffee at 8am vs suspicious $4800 at 3am from a new device and new links"). Values honesty but needs lots of hand-holding. Does NOT pretend expertise.

**Review Scope (executed thoroughly via tools on 2026-06-20 current state):**
- Used `list_dir` on `.`, `website/`, `docs/`, `docs/model-cards/`, `docs/roadmap/`, `experiments/` (and sub paths).
- Used `read_file` with appropriate offsets/limits on:
  - `website/index.html` (full — read in chunks: 1-100, 100-250, 250-400, 400-550, 550-700, 700-end).
  - `website/css/style.css` (top + key sections).
  - `website/js/main.js` (full).
  - `README.md` (full).
  - `docs/personas-and-review-checklist.md` (top sections + checklist).
  - All 6 model cards: `docs/model-cards/XGBoost_Supervised.md`, `VAE.md`, `MoE_Hybrid.md`, `LSTM_Sequence.md`, `TabTransformer.md`, `GraphSAGE.md` (key chunks + full structure).
  - Roadmap: `docs/roadmap/roadmap.md`, `priority_models.md`, `dl_model_families_taxonomy.md`.
  - `scripts/full_pipeline.py` (full + docstrings).
  - `experiments/synthetic_fraud_data.py` (multiple chunks including main + fraud injection logic + sample print).
  - Key toys: `experiments/toy_isolation_forest.py` (full intuition + metrics), `toy_xgboost.py` (header + main), `toy_vae.py` (snippets), others via grep.
  - `tests/test_synthetic_data.py`, `tests/test_isolation_forest_toy.py`.
  - `experiments/iforest_toy_score_dist.png` (read via image tool — histogram described).
- Used `grep` extensively (multiple calls, broad + targeted): patterns for "PR-AUC|pr-auc|PR AUC|roc|auc", "toy|Toy|TOY", "gate|KYA|KYC|threshold|embedding|latent|transformer|GNN|GraphSAGE", plus "sample|example|row|head|Alice|story|glossary|plain|beginner|intro|define", "regression gate|gate-validated", and specific terms across website/, docs/, experiments/, scripts/, tests/.
- Cross-checked subagent outputs and prior review for consistency (but performed fresh analysis on live files).
- Inspected for welcome/scare in hero/overview/cards; jargon density + first-use defs; plain stories/sample rows/simple intro/glossary; visuals (SVG, bars, histogram); Guided Tour for absolute beginner; model cards page vs MD accessibility; strengths + concrete improvements (exact sections/files).

**Date of Review:** 2026-06-20 (fresh inspection of current files).

**Overall Impression (Honest, in my words):** 
The website looks pretty and professional — clean colors, nice cards, an SVG diagram that flows from left to right, and bar charts. It claims to be for beginners ("Guided Tour for Beginners", "handholding" in planning and README). The mission in README says: "Beginners to rapidly understand concepts with handholding". The pipeline script has really nice comments like "Why: ... Problem solved: ... Contribution: ..." which feel like someone explaining patiently.

BUT from my exact perspective as a true non-technical curious person, **this site scares me off fast and does not feel "for me"**. The hero starts with "RESEARCH-BACKED • ALL TOYS GATE-VALIDATED • 2024–2026 SURVEYS" and ends the top badges with "Regression gate enforced • PR-AUC primary metric • Synthetic + relational data". I don't know what any of that means. It feels like a fancy report for bank tech people or professors, not someone who just wants to understand "how do they catch the bad charges on my card?"

Quotes that hit me hard (exact from files):
- Hero: "Classical baselines to state-of-the-art hybrids. A practitioner reference for structured financial data and relational fraud signals."
- Overview: "Production-grade systems must detect known patterns (velocity bursts, mule accounts) alongside novel attacks (zero-day schemes), operate under extreme class imbalance, accommodate concept drift..."
- SVG labels: "Txns • KYA/KYE", "FAST GATE Rules + IForest", "GraphSAGE", "SHAP • Recon • Attn", "Review queue".
- Cards: "Inductive graph neural network that learns node embeddings via neighbor sampling and aggregation." (GraphSAGE card on site)
- "VAE trained exclusively on legitimate transactions learns a probabilistic manifold of normal behavior. Per An & Cho (2015), reconstruction probability..." 
- "All toys validated • PR-AUC measured" badge.
- "All models pass the regression gate (PR-AUC > 0.15)."

No "Alice bought coffee..." story anywhere. No actual sample transaction row shown to me ("here's what one normal purchase looks like vs. a weird one"). No glossary. "Toy" is used like it's normal ("Run Toy", "toy PR-AUC", "synthetic toy data"). The Guided Tour jumps straight into "Engineer velocity + KYA features."

The gap between "we want to welcome beginners" (planning docs, README, "Guided Tour" label) and what a layperson actually sees is huge. It does not make me think "this is for me, I can start here." It makes me think "this is way over my head, maybe I'll just google 'how banks catch credit card fraud' instead."

Positive bones exist (clean design, some real numbers, the pipeline comments, one good histogram picture hidden away). But it needs heavy translation layers.

---

## 1. Does the Site Welcome a True Beginner or Scare Them Off in Hero/Overview/Cards?

**Hero (website/index.html lines ~160-200):** Big bold title "Fraud Detection ML Techniques". Subtitle assumes "practitioner reference". Badges at top and bottom use undefined terms immediately: "ALL TOYS GATE-VALIDATED", "Regression gate enforced", "PR-AUC primary metric". Buttons: "Explore the 6 Model Cards", "View Full Pipeline". No "Hi, new here? Here's the simple idea first."

**Overview + Challenge (lines ~204-253):** Starts strong with relatable fact ("Fraud incidence... 0.01% to 2%. A trivial “all legitimate” classifier attains >99% accuracy while detecting zero fraud events.") — this is the best part. Then insight boxes introduce "PR-AUC", "Layered Cascades", "Velocity + KYA/KYE + Behavior" with tiny explanations. "Synthetic Data Generator" box lists technical bullets ("200 users + 80 merchants + 30 workers (KYE)", "NetworkX graph: transaction edges + KYA / KYE links") + command `python experiments/synthetic_fraud_data.py` — never shows me what the data looks like.

**Roadmap summary (lines ~256-297):** Four tier boxes full of "XGBoost/LightGBM", "Isolation Forest and LOF", "VAE/AE for reconstruction-based novel fraud", "TabTransformer for contextual KYA categorical embeddings", "GraphSAGE for mule networks", "MoE hybrids routing across RNN, Transformer, and AE experts", "TGN/HTGNN", "SEFraud-style", "GraphRAG and agentic review". Ends with "Recommended path: Strong feature engineering + XGBoost + Isolation Forest gate → augment with VAE latents..."

**Model Cards grid (lines ~397-542):** 6 nice-looking cards with badges ("SUPERVISED BASELINE", "GENERATIVE ANOMALY", "ADVANCED HYBRID"). But descriptions are still dense paragraphs. Every one throws "PR-AUC: 0.284", "velocity, amount deviation, KYA aggregates", "probabilistic manifold", "node embeddings via neighbor sampling", "learned or heuristic gating", "self-attention applied to categorical features... contextual embeddings". Links "Full Card" (to raw .md) and "Run Toy".

**Intimidation score:** Very high right at the top. I would bounce or skim and feel dumb. "This is not for me."

---

## 2. Jargon Density and First-Use Definitions?

Extremely dense. "PR-AUC" appears dozens of times on the site alone (hero, boxes, every card, table, takeaways, footer). First "definition" (insight box line ~220): "Focuses on the rare positive class. ROC-AUC is misleading on imbalanced data." — introduces another acronym (ROC-AUC) without explaining any of it. No "random guessing would score about the fraud rate itself (~0.012). A 0.28 means it's way better than random at putting the bad ones near the top of the list."

"KYA/KYE" / "KYA / KYE links" / "KYA risk proxies" / "KYA aggregates" everywhere (SVG, synthetic box, cards, roadmap, table). Never spelled out on first (or early) use as something simple like "background info the bank already has about the customer or linked accounts/people."

Other first-use problems (from greps + reads):
- "velocity" / "velocity features (1h/24h counts)" / "velocity bursts" — explained once in pipeline as "common fraud signal" but too late and buried.
- "toy" / "toys" / "toy PR-AUC" / "toy runs" / "synthetic toy" — used in badges, links, text. Sounds like playtime, not "small example program you can run on your computer."
- "gate" / "FAST GATE" / "regression gate" / "gate-validated" — in SVG, badges, text. Opaque.
- "ensemble", "hybrid", "meta-learner", "late score fusion", "reconstruction probability", "latent representations", "probabilistic manifold", "inductive", "neighbor sampling and aggregation", "self-attention", "contextual embeddings", "GNN", "GraphSAGE", "MoE", "LSTM Sequence", "TabTransformer", "SHAP", "Recon • Attn", "class imbalance", "concept drift", "zero-day", "mule accounts", "SOTA", "tabular", etc.

In model cards (e.g. VAE.md): "ELBO = E[log p(x|z)] - KL...", "reparameterization: z = μ + σ * ε", "posterior collapse", "Monte Carlo". Roadmap has "Score derived from 2^(-E(h(x))/c(n))".

**Honest:** Almost zero first-use definitions or expansions. Terms are used as if the reader already lives in this world. The pipeline docstrings are the *best* exception (good "Why" explanations), and the IF toy has a nice "Core intuition: Anomalies are 'few and different'" section.

---

## 3. Presence of Plain Stories, Sample Data Rows, Ultra-Simple Intro, Glossary?

- **Plain stories:** None. The fraud injection logic in synthetic_fraud_data.py (lines ~132-143) is perfect for stories: high-amount night txns, sudden velocity spike (user_tx_count_1h/24h), unusual category ('crypto'). But nowhere turned into "Imagine Alice normally buys $4 coffee at 8am on her way to work. One night at 3am her card is used for $4,800 at an electronics store she's never been to, from a device in another city, right after a new linked account was added..." This example appears in prior persona expectations but not in current content.
- **Sample data rows:** Synthetic generator has nice prints in `__main__` (lines 195-199): "First 3 tx rows:" + tx.head(3). Toy IF shows top anomalies with columns like txn_id, amount, is_night, user_tx_count_1h, is_fraud, anomaly_score (lines ~154). But the *website* and public docs never show a single concrete row or table snippet to the visitor. Synthetic box describes structure but no example.
- **Ultra-simple intro:** None at top. Overview has one good paragraph on why accuracy fails, but hero/overview/cards assume knowledge.
- **Glossary:** Zero on the site, in README, or cards. No "Key Terms" box, no tooltips, no appendix. Personas doc and subagent reviews repeatedly call this out as missing, and it still is.

---

## 4. Visuals (SVG, bars) Helpful or Still Too Abstract?

**Strengths that partially work:**
- The big "Layered Fraud Detection Architecture" SVG (index.html ~309-392) is the best visual: boxes for RAW DATA → FEATURE ENGINEERING → FAST GATE + parallel models (XGBoost, VAE, MoE, LSTM, GraphSAGE) → ENSEMBLE / GATE → RISK SCORE + Explanations (SHAP • Recon • Attn) + Review queue. Arrows. Feels like a flowchart. Caption helps a bit.
- PR-AUC Comparison SVG bar chart (lines ~629-685) + JS-enhanced table bars (main.js initMetricBars). Shows numbers visually (VAE highest at 0.37, etc.). Grid lines and labels are okay.
- Dynamic filters in JS (main.js ~66+): chips for Generative/AD, Hybrid/MoE, etc. Polished.
- The hidden `iforest_toy_score_dist.png` (read via tool): Clear histogram! Big blue hump for "Normal" scores on the left (less anomalous), tiny orange bars for "Fraud" sticking out to the right (higher anomalous). Title: "Isolation Forest Anomaly Scores on Synthetic Fraud Data". *This* is intuitive for a layman — "see, the bad ones tend to score different." But it's buried in experiments/, never promoted to the website.

**Problems — still too abstract/intimidating:**
- SVG labels are full of jargon ("KYA/KYE", "IForest", "GraphSAGE", "SHAP • Recon • Attn").
- Bars show "0.28", "0.37" with no plain translation ("this number means the computer is pretty good at ranking the 1% bad ones high").
- No story visuals: no timeline of one user's transactions with a spike, no simple circles-and-lines "graph with a ring of linked accounts", no before/after.
- Model cards promise "Conceptual Visualization" (feature importance bars, embedding space, graph communities) but deliver only text descriptions.
- No annotated code or "this part learns what normal looks like" callouts.
- CSS/JS polish (style.css cards, transitions; main.js bars/filters/copy) makes it feel premium, which is good, but doesn't fix the content abstraction.

Visuals are a *relative* strength but reward people who already get the ideas.

---

## 5. Guided Tour Usefulness for Absolute Beginner?

Section (index.html ~737-788): Labeled "Guided Tour for Beginners" + "A progressive curriculum. Run the toys locally to internalize concepts."

5 steps:
01. "Baseline supervised. Engineer velocity + KYA features. Train XGBoost..."
02. "Add unsupervised representation. Train VAE on normal transactions. Use reconstruction probability or latent vectors..."
03. "Incorporate behavior and context. Model sequences with LSTM-style features or TabTransformer..."
04. "Add relational signals. Construct the transaction + KYA/KYE graph. Use GraphSAGE embeddings..."
05. "Move to adaptive hybrids. Implement simple MoE routing... Gate with fast classical layer."

**For me:** The label is welcoming but the content assumes I know what "velocity + KYA features", "reconstruction probability", "latent vectors", "embeddings", "MoE routing", "gate" mean. No "what you'll see when you run it", no "start with just this one command and look at the numbers it prints", no "this first step is the one most real banks actually use every day."

It is better than nothing, but not useful for absolute beginners. Feels like a checklist for someone who already understands half of it.

---

## 6. Model Cards Page vs Full MD Accessibility?

- Site cards: Short (4-6 sentences + PR-AUC + links). Polished cards with badges. Still too much jargon.
- Full MDs (e.g. XGBoost_Supervised.md, GraphSAGE.md, VAE.md): Structured with Origin / How It Works (numbered technical steps) / Pros / Cons / Assumptions / Limitations / Fraud-Specific Fit / Toy Example (link) / Conceptual Visualization (text only) / References. Better organized than many papers, but language is expert (ELBO formulas, "inductive representation learning", "load balancing loss", "neighbor sampling"). No "TL;DR for non-tech" at top. Opening raw .md in browser or GitHub is still intimidating — no beginner callouts, no "you can skip the code for now".

The MDs are "more accessible" in structure than pure research papers, but not layman-friendly.

---

## 7. Strengths That Work for Me (Layman)

- Clean, modern, trustworthy design (not childish or salesy).
- One excellent plain paragraph in overview about why "99% accurate" is useless for rare fraud.
- Pipeline script's "Why / Problem solved / Contribution" docstrings (full_pipeline.py) — this is patient-teacher style I wish was everywhere.
- IF toy (toy_isolation_forest.py) has the best intro blocks: "Why Isolation Forest?", "Core intuition", "How it works (conceptual)", "Why chosen for fraud", and prints actual top rows at the end. Replicate this!
- Visual flow SVG and bar chart give something to look at besides walls of text.
- "When to Choose What" and "Core Insights" boxes at bottom have practical flavor.
- Real numbers from running code (not made-up hype) and "run it yourself" links feel honest.
- Reproducibility (seeds, tests, generator) is impressive even if I can't use it yet.
- The fraud patterns in synthetic data (high night amount, velocity spike, crypto) are realistic and story-ready.

These show the project has good intentions and strong technical foundation.

---

## 8. Very Specific Concrete Improvements (with Exact File/Section Citations)

Be brutally honest: without these, it stays expert-reference disguised as beginner tour.

**Website (website/index.html — highest priority):**
1. Add right after hero (before or as start of #overview, ~line 204) a **"New to this? 2-minute plain English intro"** box using the exact Alice-style story the persona wants. Example: "Imagine you buy coffee for $5 at 8am most days. Suddenly at 3am there's a $4,800 charge at a new store from a phone you've never used, right after someone added a new linked account. Banks use computers to spot patterns like that (or things that just 'feel off' even if never seen before) so humans only have to check the suspicious ones. This page explains the main computer tricks they use, from simple to fancy combinations."
2. Expand the PR-AUC insight box (~219-220) + every mention (table header, cards, takeaway ~692): Add "Random guessing scores roughly the fraud rate itself (~0.012 on this data). A score of 0.28-0.37 means the computer is much better at putting the real bad cases near the top of the 'check these first' list."
3. Spell out KYA/KYE on *first* uses in hero/overview/SVG area + cards. E.g. "Velocity + KYA/KYE (Know Your Customer / linked accounts info) + Behavior".
4. Change or footnote "toy" in visitor text: "Simple runnable example" or "Demo program you can run locally (called 'toy' in the code)".
5. Remove or explain "Regression gate enforced" badge (~193) and "ALL TOYS GATE-VALIDATED" (~164): "All examples tested to meet basic quality checks".
6. In Guided Tour (~740+), add a plain-English layer above each step + "What the output looks like" teaser + "Start with step 01 only".
7. Surface the iforest histogram on the experiments section (add `<img>` or describe it with caption explaining the blue vs orange spikes).
8. In synthetic box (~238-252), after the bullets, add a tiny 2-row table or "Example of what one row looks like:" using real columns from the generator (user_id, amount, hour, is_night, category, user_tx_count_1h, is_fraud).

**JS/CSS (website/js/main.js + css/style.css):**
- Add simple hover/click definitions or a Glossary button that shows plain defs (use the expansions above). Edit initTooltips or add a glossary section.
- Soften filter chip labels: "Spotting Weird New Stuff" instead of just "Generative / AD".

**Model Cards (docs/model-cards/*.md — all 6):**
- Add at very top of each: a **TL;DR box** or bold 1-2 plain sentences + analogy. E.g. for VAE: "Learns what normal transactions look like by trying to rebuild them from a compressed memory. Anything that rebuilds badly might be fraud — even brand new tricks." For GraphSAGE: "Looks at connections between accounts and merchants (like shared links or rings of people). Spots fraud that happens through relationships, not just one weird purchase."
- In "How It Works", put plain bullets first, then technical.
- Add a "Picture this with one example" section reusing the same 2-3 transaction stories (night high-amount, velocity spike, linked-ring) and say how *this* model would likely flag or miss it.
- Expand "Toy Example" with "You don't need to read the code yet. Just run the file and look at the printed numbers and top cases."

**Roadmap & supporting (docs/roadmap/roadmap.md, priority_models.md, dl_model_families_taxonomy.md):**
- Add a 1-paragraph "If you're completely new, start here" preface before Tier 0.
- First-use expansions for all acronyms and terms.
- Add "In plain words" takeaway under each tier group.

**Code & Experiments (scripts/full_pipeline.py, experiments/*.py):**
- Amplify the excellent pattern: add "Why / Simple intuition" headers to every toy (like IF toy already has).
- In synthetic_fraud_data.py `__main__` and docstring, keep the head(3) print and add a comment: "# This is an example of the kind of rows the models see."
- In pipeline output, print one or two example "before/after" style rows or top flagged with plain labels.

**Broader:**
- Add a small glossary section or box (can live in index.html or linked simple md).
- Make "Start here: XGBoost + IF..." more prominent and explain why.
- After changes, the test: non-technical friend reads hero + overview + first two cards + tour and can explain the main idea and what a 0.28 PR-AUC roughly means.

These are concrete, file-specific, and would move the needle dramatically toward "this is for me, I can start here" while keeping all the real rigor, numbers, and code.

---

**Summary of Key Findings (for this review):**
The site has professional visuals, honest reproducible experiments, and pockets of excellent explanatory comments (especially pipeline + IF toy), but the entry experience for a true layperson is still intimidating due to undefined jargon at the top (PR-AUC, KYA, "toys", "gate", "regression gate"), complete absence of story-driven examples or sample data rows, no glossary, and a Guided Tour that assumes prior knowledge. Model cards and roadmap deliver structure and depth but not layered accessibility. Strengths (SVG flow, bar visuals, insight boxes, "feature engineering often beats fancy models") are real and worth building on. The gap between stated beginner-friendly goals (README, planning) and delivered content is the core issue. Specific edits above would fix it without losing value for other audiences.

This is a fresh 2026-06-20 review after exhaustive tool-based inspection. The project has excellent technical foundation; it just needs welcoming translation layers for curious non-experts.

**End of review.**