# Localization Editor Review: Model Tour Website (Latin America Expansion)

**Date:** 2026-06-20  
**Reviewer:** Expert Editor & Localization Specialist  
**Scope:** website/index.html (user-facing text elements), website/translations.json (all keys), website/js/main.js (toggle logic + data-i18n application + dynamic UI strings)  
**Goal:** Verify complete bilingual coverage (EN + LatAm Spanish `es-419`), identify leaks, awkward phrasing, missing attributes, cultural/technical fit, and assess toggle system against best practices.

**Methodology:** Full file reads + targeted greps for `data-i18n`, hardcoded English strings, JS-created elements, filter/sort/copy logic, and Spanish strings. Element-by-element audit of titles, headings, paragraphs, buttons, labels, table headers/cells, card text, tour steps, SVGs, footers, aria labels, and dynamic content. All visible text was inventoried.

---

## Executive Summary of Coverage

- **HTML data-i18n attributes found:** 31 (static HTML) + several dynamically injected via JS for filters.
- **Translation keys in JSON:** ~90+ top-level keys (full structure verified; 197 pattern matches reflected internal objects but actual unique translation units are extensive and complete for prepared content).
- **Keys with BOTH `en` + `es`:** 100% (no key lacks either language).
- **Coverage gaps:** Severe. Only ~25-30% of user-facing strings are wired via `data-i18n`. Many prepared JSON keys (e.g., `cards.*`, `roadmap.tier*`, `overview.p*`, `newto.p*`, `pipeline.step*`, `tour.*`, `arch.*`, `exp.*`) exist but are **unused** because corresponding elements lack `data-i18n` attributes. Large sections (model cards internals, tables, roadmap, pipeline, tour, glossary, metrics, production table, footer, architecture SVG, insights) are completely English-only at runtime.
- **English leaks in Spanish:** Present in several JSON `es` strings (e.g., "PATTERN", "inglés", "lift", "baselines", "gate").
- **Awkward LatAm Spanish / phrasing issues:** 4+ identified (detailed below).
- **Missing data-i18n attributes:** Dozens across nearly every major section after the hero.
- **Dynamic/JS issues:** Filter logic, copy buttons, table sort, print confirm, metric titles, and some aria labels are hardcoded English and/or not internationalized. Filter matching will break under Spanish because it regexes translated `textContent`.
- **Overall readiness for LatAm launch:** Not production-ready. Core nav/hero are localized; rest of site will show English in "ES" mode. Significant remediation required.
- **Toggle system assessment:** Follows many best practices (see dedicated section) but is undermined by incomplete attribute coverage and JS string handling.

**Recommendation priority:** High. Fix wiring first (add `data-i18n`), then polish translations, then harden JS dynamic content.

---

## Detailed Element-by-Element Audit

Status legend:  
**OK** = Has matching `data-i18n`, key exists with valid EN+ES, no phrasing issues.  
**MISSING** = Visible text with no `data-i18n` attribute (will never translate).  
**NEEDS-IMPROVEMENT** = Has attribute or key, but mismatch, unused key, leak inside ES, awkward phrasing, or logic bug.  
**N/A** = Brand name, code, acronym, or intentionally non-translated (notes provided).

### 1. Document Head & Accessibility Chrome
- `<title data-i18n="title">` (line 7): **OK** — Key present, good translation.
- `<meta name="description" ...>` (line 6): **MISSING** — No `data-i18n`. JSON has unused `"meta.description"`.  
  *Suggested fix:* Add `data-i18n="meta.description"` (requires small JS update to handle `<meta>` tags via `document.querySelector('meta[name="description"]').setAttribute('content', translated)`).
- Skip link (line 128): `<a ...>Skip to main content</a>`: **MISSING**. No key.  
  *Location:* Line 128. *Fix:* Add `data-i18n="a11y.skip"` + key.
- `<html lang="en" id="html-root">` (line 2): **OK** (JS correctly sets `es-419`).

### 2. Navigation & Header Brand
- Nav links (`nav.overview` to `nav.tour`, lines 145-150): **OK**.
- `<span data-i18n="nav.github">` and `nav.runExperiments` (lines 156, 163): **OK**.
- Brand (lines 138-141):
  - "Model Tour": **N/A** (product name; consider keeping or add `data-i18n="brand.name"`).
  - "Fraud Detection Knowledge System": **MISSING**. No key. *Fix:* Add key `"brand.subtitle"`.
  - "PILLB" pill: **N/A**.
- Language selector group (line 167): `aria-label="Language selector"`: **MISSING** (hardcoded). Buttons "EN"/"ES" static (no `data-i18n`).
- GitHub external icon + "Run Experiments" CTA: OK for labeled parts.

**Nav aria-label** (line 130): `aria-label="Main navigation"`: **MISSING**.

### 3. Hero Section (lines 177-217)
- Badge (line 181, `hero.badge`): **OK**.
- `<h1 data-i18n="hero.title">` (line 184): **OK** (includes `<br>`; JSON handles via `innerHTML`).
- Subtitle (line 187, `hero.subtitle`): **OK**.
- Buttons: `hero.exploreCards`, `hero.viewPipeline`, `hero.viewSource` (lines 194,198,202): **OK**.
- Badges (lines 210-213): `hero.badge1/2/3`: **OK**.

### 4. Overview + Challenge + Insight Boxes (lines 222-271)
- `overview.challenge` (line 225): **OK**.
- `overview.title` (line 226): **OK**.
- Two body paragraphs (lines 229-230): **MISSING** `data-i18n`. JSON keys `"overview.p1"`, `"overview.p2"` exist but unused.  
  *Exact:* Raw `<p>Fraud incidence...</p>` and `<p class="mt-3">Production-grade...</p>`.
- Insight box 1 (lines 235-237): `insight.metric.*`: **OK**.
- Insight box 2 (lines 240-243): **MISSING** entirely (PRODUCTION PATTERN, Layered Cascades, gate description). JSON has `"insight.cascades.*"` (unused + bad ES — see below).
- Insight box 3 (lines 245-248): **MISSING** (KEY SIGNALS etc.). JSON `"insight.signals.*"` unused.
- Synthetic Data Generator box (lines 254-268):
  - Title (`synthetic.title`): **OK**.
  - Intro `<p>` (line 257): **MISSING**. JSON has `"synthetic.desc"`.
  - 5 `<li>` items (lines 259-263): **MISSING**. JSON has `synthetic.li1`–`li5`.
  - Command line (line 266): **N/A** (code).

### 5. New-to-Fraud On-ramp (lines 274-283)
- `newto.badge`, `newto.title` (lines 275-276): **OK** (but `newto.title` ES phrasing issue).
- Three `<p>` (lines 278-280): **MISSING**. JSON `"newto.p1/p2/p3"`.
- Key terms line (line 282): **MISSING**. JSON `"newto.terms"`.

### 6. Roadmap Summary (lines 286-326)
- `roadmap.badge`, `roadmap.title` (lines 289-290): **OK**.
- "Full roadmap document →" link text (lines 292-295): **MISSING**. JSON `"roadmap.full"`.
- 4 tier cards (lines 299-322):
  - All tier labels ("TIERS 0–2" etc.), descriptions, details, notes: **MISSING** `data-i18n`.
  - JSON keys exist (`roadmap.tier0.title` etc. through `roadmap.tier7.*` + `roadmap.recommended`) but completely unused.
- Bottom recommendation sentence (line 325): **MISSING**. JSON `"roadmap.recommended"`.

### 7. Architecture Diagram (lines 329-423)
- Section title "Layered Fraud Detection Architecture" (line 332): **MISSING**. JSON `"arch.title"`.
- Subtitle (line 333): **MISSING**. JSON `"arch.subtitle"`.
- All 15+ `<text>` elements inside SVG (e.g., "RAW DATA", "FEATURE ENGINEERING", "XGBoost (Supervised)", "VAE (Generative AD)", "GraphSAGE", "RISK SCORE", arrows/captions): **MISSING** (inline SVG text nodes). JSON has some `arch.*` but inapplicable.
- Bottom caption (line 421): **MISSING**. JSON `"arch.caption"`.
- *Note:* SVG i18n requires post-load JS text replacement or `data-i18n` + custom handler.

### 8. Model Cards Section (lines 426-571)
- `cards.badge`, `cards.title`, `cards.desc` (lines 429-431): **OK**.
- Validation badge "All implementations validated • PR-AUC measured" (line 433): **MISSING**. JSON `"cards.badge2"`.
- Cards footer note (line 570): **MISSING**. JSON `"cards.footer"`.
- **All 6 individual cards (XGBoost through GraphSAGE):** Major gap.
  - Model titles (e.g. `<div>XGBoost</div>`, "VAE", "MoE Hybrid"... lines 442,464,...): **MISSING**.
  - Badges ("SUPERVISED BASELINE", "GENERATIVE ANOMALY"...) and tiers ("Tier 1", "Tier 3"...): **MISSING**.
  - Full descriptions `<p>`: **MISSING**.
  - PR-AUC notes, importance notes: **MISSING**.
  - Action links: "Full Card", "Run Script", "Run Script (PyTorch)": **MISSING** (JSON has `cards.*.full` / `cards.*.run` prepared but unused).
  - JSON provides rich `cards.xgboost.*`, `cards.vae.*` ... `cards.graph.*` — all orphaned.
- *Location example:* Lines 442-457 (XGBoost card); identical pattern repeats 460-568.

### 9. Experiments & Results (lines 574-723)
- Section headers "Comparative Experiments • Reproducible", "Comparative Results on Synthetic Data" (lines 576-577): **MISSING**. JSON `"exp.badge"`, `"exp.title"`.
- Table (lines 582-643):
  - "Model Performance (PR-AUC)" + "Higher is better..." (lines 584-585): **MISSING**.
  - `<th>` headers (lines 592-596): Model, Best For, Benchmark PR-AUC..., Complexity — **MISSING** (JSON has `exp.table.*`).
  - All `<td>` "Best For" cells and model names: **MISSING** (proper names like "Isolation Forest", "GraphSAGE" can stay EN; context strings need keys).
  - Long takeaway text (line 646): **MISSING**. JSON `"exp.takeaway"`.
  - Command + note (lines 648-651): **MISSING** for prose. JSON `"exp.cmd"`, `"exp.note"`.
- Bar chart (lines 655-717):
  - "PR-AUC Comparison (Reproducible Runs)" (line 656): **MISSING**. JSON `"exp.bar.title"`.
  - Bottom note + Y labels: **MISSING**.
- Key takeaway box (lines 720-722): **MISSING**. JSON `"exp.key"`, `"exp.key.text"`.

### 10. Production Considerations / Trade-offs Table (lines 726-798)
- "Production Considerations", "Model Family Trade-offs" (lines 728-729): **MISSING**. No JSON keys.
- Intro paragraph (line 732): **MISSING**.
- Table (lines 733-795):
  - All `<th>` (Family, Latency (est.), Coverage, Scalability, Integration, When in Cascade): **MISSING**.
  - All body rows (e.g. "<1ms", "High novel", "Always first gate", "Gate-flagged only", etc.): **MISSING**. No JSON keys prepared.
- Caveat text (line 796): **MISSING**.

### 11. Metrics that Matter (lines 801-809)
- "Metrics that matter", "PR-AUC + operational context", all 3 `<p>` paragraphs: **MISSING**. No JSON keys.

### 12. Key Terms Glossary (lines 812-822)
- "Key Terms Glossary" + all 6 definition blocks (PR-AUC, Velocity, KYA/KYE, Recall@K, Layered Cascades, Hybrid / MoE): **MISSING**. No JSON keys.

### 13. Documented Pipeline (lines 825-863)
- "Production-Style End-to-End", "Documented Pipeline" (lines 827-828): **MISSING**.
- "scripts/full_pipeline.py" + "View Source" link (lines 833-834): "View Source" **MISSING**. JSON `"pipeline.view"`.
- "Fully commented..." (line 835): **MISSING**. JSON `"pipeline.note"`.
- 4 steps (lines 839-854): Titles ("1. Load & Clean", "2. Feature Engineering"...) and descriptions **MISSING**. JSON has `pipeline.step1.title/desc` ... `pipeline.step4.*` (unused).
- "Run:" + long script description (lines 857-861): **MISSING**. JSON `"pipeline.run"`, `"pipeline.run.text"`.

### 14. Guided Tour (lines 866-916)
- "Guided Tour for Beginners", description (lines 868-869): **MISSING**. JSON `"tour.title"`, `"tour.desc"`.
- 5 steps (lines 872-912):
  - Step numbers + titles ("Baseline supervised.", "Add unsupervised representation." ...): **MISSING**. JSON `tour.01.title` etc.
  - Descriptions + links ("Card", "Script", "Full Pipeline"): **MISSING**. Links need short keys or `data-i18n` on anchors.
- Bottom note (line 914): **MISSING**. JSON `"tour.note"`.

### 15. Final Insights (lines 919-942)
- "Core Insights from Research & Experiments" + 4 `<li>`: **MISSING**. JSON `"insights.core.*"`.
- "When to Choose What" + all "Start here:", "Need novel detection:", etc. + descriptions: **MISSING**. JSON `"insights.choose.*"`.

### 16. Footer (lines 945-957)
- Two main text blocks + "PillB • Educational & research use" + clone instruction + final disclaimer (lines 948-956): **MISSING**. JSON has `footer.text1`, `footer.pillb`, `footer.clone`, `footer.complete` (unused).

### 17. JavaScript Dynamic / Injected UI (main.js)
- Filter UI (created in `initModelFilter`, lines 77-96):
  - "Filter:" labels, options ("All", "Generative / AD", "Hybrid / MoE", "Sequence / Behavioral", "Tabular / Graph"), chips: Have `data-i18n="filter.*"` **but keys DO NOT EXIST in translations.json** → **NEEDS-IMPROVEMENT** (will stay English).
  - `aria-label="Filter model cards"` (line 88): Hardcoded English.
- Copy buttons (`initCopyButtons`, lines 167-171):
  - `btn.textContent = 'Copy'`, `title = 'Copy run command'`, `aria-label = 'Copy command to run this script'`: **MISSING** (no `data-i18n` on created elements; no JSON keys).
- Table sort (`initTableSort`, lines 262-263):
  - `header.title = 'Click to sort by PR-AUC'`: Hardcoded.
  - Dynamic `↑`/`↓` indicator update (line 280): English symbols but header text leaks.
- Print hint (line 238): `confirm('Print / save this page as PDF for client deliverable?')`: Hardcoded English.
- Metric bar titles (line 54): Template literal `title="PR-AUC ${value...} (synthetic benchmark)"`: Hardcoded.
- Filter matching logic (lines 109-112): Regexes on `card.textContent` (`/vae|generative|anomaly|recon/`, etc.). **Breaks in ES** because cards are translated to Spanish equivalents (e.g. "ANOMALÍA GENERATIVA"). **Critical bug.**
- Other: `initTooltips`, smooth anchors, etc. — minor or non-user strings.

### 18. Language Toggle System (main.js lines 298-401 + HTML 167-170)
- Buttons: Static "EN"/"ES" (no `data-i18n`).
- JSON keys `"lang.toggle.en/es"` exist but unused.

---

## Issues in translations.json (English Leaks / Awkward LatAm Spanish)

All keys have both languages. Problems inside `es` values:

1. **"insight.cascades.title"** (line ~108): `"es": "PATTERN DE PRODUCCIÓN"`  
   *Issue:* "PATTERN" is English.  
   *Fix:* `"PATRON DE PRODUCCIÓN"` (or "MODELO DE PRODUCCIÓN").

2. **"newto.title"** (line ~168): `"es": "La versión en inglés sencillo de 90 segundos"`  
   *Issue:* "inglés sencillo" literally means "plain English". Wrong for Spanish UI.  
   *Fix:* `"La explicación sencilla de 90 segundos"` or `"La versión en lenguaje claro de 90 segundos"`.

3. **Multiple "lift" leaks:**
   - `exp.key.text`: "agrega lift"
   - `tour.03.desc`: "Observa lift"
   *Fix:* Replace with `"agrega elevación"` / `"muestra elevación"` or `"proporciona mejora (lift)"`.

4. **"baselines"** (in `exp.key.text`): "baselines supervisadas simples"  
   *Fix:* `"líneas base supervisadas simples"` (or keep "baselines" as tech term consistently).

5. **"racionalidades"** (in `pipeline.run.text`): "El script emite racionalidades documentadas"  
   *Fix:* `"razonamientos documentados por paso"` or `"explicaciones/racionales documentados por paso"`.

6. **Other minor:**
   - Mixed casing/acronym handling consistent (good).
   - "Gate", "ensemble", "pipeline", "StandardScaler", model names kept in ES — acceptable for technical LatAm audience.
   - "comerciantes", "trabajadores", "transacciones" — appropriate neutral LatAm Spanish.
   - "es-419" usage in JS is correct.

**Unused but prepared keys** (should be wired instead of deleted): `overview.p*`, `newto.p*`, `synthetic.*` (except title), all `roadmap.tier*`, `arch.*`, all detailed `cards.*`, `exp.table.*` and many `exp.*`, `pipeline.step*`, `tour.*`, `insights.*`, `footer.*`, `insight.cascades/signals` (partial), `cards.badge2/footer`.

**Missing keys needed (new):**
- `a11y.skip`, `brand.subtitle`, `filter.*` (5 keys), `copy.*` (Copy, title, aria), `table.sort`, `print.confirm`, `metrics.*` (several), `glossary.*` (6), production table keys (`prod.family`, `prod.latency`, `prod.coverage`, etc.), `arch.svg.*` (optional), `tour.link.card/script/pipeline`, `footer.*` already exist but unused.

---

## Toggle Logic Review (js/main.js) — Best Practices Assessment

**Strengths (follows best practices):**
- Key-based (not string-based) translations.
- Separate `translations.json` (maintainable, professional i18n pattern).
- No string concatenation for translatable content.
- Persistence: `localStorage.getItem('siteLang')` + `?lang=` URL param + browser `navigator.language`.
- Accessibility: `document.documentElement.lang = 'es-419'` (correct for Latin America), `aria-pressed` updates, `role="group"`.
- Fallback to English on load failure or missing keys.
- Applies to placeholders, titles, and innerHTML (for rich content with `<br>` / `<strong>`).
- Clean `applyTranslation` + `initLanguageToggle`.
- Exposed `window.setLanguage` for debugging.

**Weaknesses / Gaps:**
- Coverage incomplete: Only elements with `data-i18n` are touched. Everything else leaks English.
- Dynamic content created in `init()` (filters, copy buttons) before `initLanguageSystem()` runs, but filters luckily get `data-i18n` — still missing keys and not re-applied after filter changes.
- No i18n for JS strings created after initial apply (copy buttons, confirm, titles).
- Filter matching (`applyFilter`) relies on English regex against potentially-translated `textContent` → breakage in ES mode.
- Metric bar titles, table sort titles, print dialog, filter aria-labels hardcoded.
- Meta description, brand, SVGs, aria-labels on static elements not handled.
- No handling for numbers, dates, or plurals (not needed here but noted).
- No update of non-`data-i18n` attributes beyond title (e.g. no alt, no custom data).

**Overall:** The architecture is solid and matches "key-based, no hard-coded strings where possible, persistence, a11y". It is ready to scale once all strings are attributed and JS is hardened. Current state is best-practice *skeleton* with incomplete application.

---

## Specific Recommendations & Actionable Fixes

### Priority 1: Wire Existing + Add Missing data-i18n (HTML)
Add `data-i18n="..."` to every visible text container. Examples (use exact keys where they exist):

- Overview paragraphs: `<p data-i18n="overview.p1">...`
- All insight boxes 2/3, synthetic list items, newto paragraphs, roadmap cards, architecture titles/captions.
- Every model card internal: add to titles, badges, `<p>`, PR notes, "Full Card"/"Run Script" anchors.
- All experiment table `th`/`td` prose, takeaways.
- Pipeline steps, tour steps (add to step title spans and link text).
- Insights, glossary items, footer blocks, production table cells.
- Skip link, brand subtitle, meta (with JS support).

For links like "Full Card": `<a data-i18n="cards.xgboost.full">Full Card</a>`.

### Priority 2: Fix & Extend translations.json
1. Correct the 5+ phrasing issues listed above.
2. Add new keys for glossary, metrics, production table, a11y, filters, copy, etc.
3. Example additions (append to JSON):

```json
"filter.label": { "en": "Filter:", "es": "Filtrar:" },
"filter.all": { "en": "All", "es": "Todos" },
"filter.generative": { "en": "Generative / AD", "es": "Generativo / AD" },
"filter.hybrid": { "en": "Hybrid / MoE", "es": "Híbrido / MoE" },
"filter.sequence": { "en": "Sequence / Behavioral", "es": "Secuencia / Conductual" },
"filter.tabular": { "en": "Tabular / Graph", "es": "Tabular / Gráfico" },
"copy.button": { "en": "Copy", "es": "Copiar" },
"copy.title": { "en": "Copy run command", "es": "Copiar comando de ejecución" },
"copy.aria": { "en": "Copy command to run this script", "es": "Copiar comando para ejecutar este script" },
"a11y.skip": { "en": "Skip to main content", "es": "Saltar al contenido principal" },
"table.sort": { "en": "Click to sort by PR-AUC", "es": "Clic para ordenar por PR-AUC" },
"print.confirm": { "en": "Print / save this page as PDF for client deliverable?", "es": "¿Imprimir o guardar esta página como PDF para entrega al cliente?" },
```

(Full glossary/metrics/production keys would follow the same pattern using descriptive keys.)

### Priority 3: Harden JS (main.js)
- Make `applyFilter` use stable data attributes or classes instead of (or in addition to) textContent regex. E.g., add `data-category="generative"` to cards in HTML.
- Create copy buttons with `data-i18n` attributes and let `applyTranslation` handle them (call apply after creation or observe).
- Translate remaining strings via the translations object: `const t = (k) => translations[k]?.[currentLang] || ...`
- Update `initTableSort`, metric titles, confirm, and aria-labels.
- Add meta description handling in `applyTranslation`.
- Optionally translate SVG text nodes by ID or additional pass.
- Ensure `applyTranslation` runs or re-runs after any heavy DOM mutation.
- Add keys for "EN"/"ES" or keep toggle labels non-translated (common pattern).

### Priority 4: Other
- Decide policy for product name "Model Tour" / "PillB" / model names (recommend keep English).
- For SVG diagram labels, consider keeping technical English or implement JS swap (low priority).
- Test full flow: load → toggle EN/ES → refresh → ?lang=es → localStorage → browser es-*.
- Add regression test (or manual) for no English leaks in ES mode.
- Consider adding `lang` attribute updates to more containers if needed.
- Update any external docs/links if they reference English-only strings.

### JSON Update Summary
- Fix 5 specific `es` strings (detailed above).
- Add ~25-40 new keys for missing sections + JS.
- No deletions needed — just wiring.

---

## Confirmation on Toggle System

The system **largely follows best practices**:
- Key-based with clean JSON separation ✓
- No hard-coded user strings inside translated paths (where attributes present) ✓
- Persistence (localStorage + URL + browser) ✓
- Accessibility (es-419, aria-pressed, lang attr) ✓
- Fallbacks and clean application logic ✓

**Gaps preventing "production" label:** Incomplete attribute coverage across the page and lack of i18n for JS-generated strings + filter logic fragility. Once the HTML is fully attributed and the ~10 JS strings/keys added, the toggle will be best-in-class for a static site.

---

## Next Steps (Suggested Order)

1. Add all missing `data-i18n` attributes to index.html (use existing keys first).
2. Patch the 5 awkward `es` strings + add filter/copy/a11y keys to translations.json.
3. Refactor JS dynamic creation + filter matching + hardcoded strings.
4. Add meta + SVG + aria handling.
5. Full manual + automated toggle regression.
6. Re-audit with this report as checklist.

This review is exhaustive for the requested scope. Implementing the wiring + fixes will make the Latin America expansion fully bilingual and professional.

**End of Report**