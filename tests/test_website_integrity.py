import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
WEBSITE = ROOT / "website"


class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag == "a" and "href" in attrs:
            self.hrefs.append(attrs["href"])


def test_translations_json_is_valid():
    with (WEBSITE / "translations.json").open(encoding="utf-8") as fh:
        data = json.load(fh)
    assert "title" in data
    assert data["title"]["es"]


def test_website_local_links_resolve_from_website_directory():
    parser = LinkParser()
    parser.feed((WEBSITE / "index.html").read_text(encoding="utf-8"))

    missing = []
    for href in parser.hrefs:
        parsed = urlparse(href)
        if parsed.scheme or parsed.netloc or href.startswith("mailto:"):
            continue
        if href.startswith("#"):
            if href[1:] not in parser.ids:
                missing.append(href)
            continue
        target = (WEBSITE / parsed.path).resolve()
        if not target.exists():
            missing.append(href)

    assert missing == []


def test_glossary_translates_leaf_nodes_only():
    html = (WEBSITE / "index.html").read_text(encoding="utf-8")
    assert 'data-i18n="glossary.content"' not in html
    assert 'data-i18n="glossary.pr-auc"' in html


def test_model_filter_categories_are_represented():
    html = (WEBSITE / "index.html").read_text(encoding="utf-8")
    js = (WEBSITE / "js" / "main.js").read_text(encoding="utf-8")
    assert 'data-category="supervised"' in html
    assert 'data-category="graph"' in html
    assert 'data-filter="supervised"' in js
    assert 'data-filter="graph"' in js

