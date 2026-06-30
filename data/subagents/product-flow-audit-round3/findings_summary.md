# Product Flow Audit

Status: research-only sub-agent completed; no files edited by the sub-agent.

## Core Diagnosis

The website had strong raw material but read like a dense reference deck rather than a guided model tour. The main product fix was to add audience routing and make the page work as a journey: choose a path, understand the problem, inspect roadmap/catalog, see architecture, investigate an alert, then compare models and run scripts.

## Key Findings

- No audience routing in the first viewport; beginner/practitioner/researcher flows were buried.
- Mobile navigation hid the main page flow.
- Model filtering omitted the supervised baseline and misclassified GraphSAGE under tabular.
- Spanish localization was fragile because nested `data-i18n` could flatten glossary content.
- "Run Experiments" felt more like a static benchmark link than a run flow.
- Benchmark claims needed more trust scaffolding.
- Metrics education arrived after results.
- Expanded catalog interrupted the flagship model journey.
- Low-wow visuals: mostly static cards and SVGs.
- Footer click-to-print was surprising.

## Actions Taken

- Added a role-based "Choose a Tour Path" section immediately after the hero.
- Added a mobile section jump selector.
- Added an "Analyst Workbench" section showing alert summary, evidence graph, and case memo.
- Fixed model filters for supervised and graph categories.
- Improved mobile stacking for overview cards.
- Removed surprise footer print behavior.
- Added Playwright coverage for the main user flow.

