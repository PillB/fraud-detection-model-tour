# Frontend and Website Code Review

Status: research-only sub-agent completed; no files edited by the sub-agent.

## Key Findings

- `website/translations.json` was invalid JSON, breaking Spanish localization fallback.
- Links from `website/index.html` to `docs/`, `experiments/`, and `scripts/` resolved incorrectly when serving the `website/` directory directly.
- Table sorting was mouse-only and lacked `aria-sort`/keyboard support.
- XGBoost used `data-category="supervised"` but no supervised filter existed.
- GraphSAGE was grouped under tabular rather than graph.
- Clipboard fallback could throw before fallback on browsers without `navigator.clipboard`.
- Mobile navigation had no replacement for hidden desktop nav.
- `data-i18n="glossary.content"` on the glossary parent could flatten child content.
- Footer click triggered an unexpected print confirm.
- Regression gate did not include website integrity tests.

## Actions Taken

- Fixed `translations.json` syntax and updated stale hero CTA translation.
- Rewrote local links to use `../docs`, `../experiments`, and `../scripts`.
- Added `tests/test_website_integrity.py` for JSON validity, local link resolution, glossary i18n safety, and filter category coverage.
- Added `tests/test_website_playwright_flow.py` for desktop/mobile browser flows.
- Added supervised and graph filters; corrected TabTransformer/GraphSAGE categories.
- Added clipboard feature detection and fallback.
- Removed the footer print handler.
- Added keyboard and ARIA support for PR-AUC table sorting.
- Expanded `scripts/validate_regression_checklist.py` to include website integrity and expansion tests.

