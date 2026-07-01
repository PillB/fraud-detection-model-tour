import json
import re
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


class I18nParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.keys = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "data-i18n" in attrs:
            self.keys.add(attrs["data-i18n"])


def test_translations_json_is_valid():
    with (WEBSITE / "translations.json").open(encoding="utf-8") as fh:
        data = json.load(fh)
    assert "title" in data
    assert data["title"]["es"]


def test_all_i18n_keys_have_english_and_spanish_entries():
    parser = I18nParser()
    parser.feed((WEBSITE / "index.html").read_text(encoding="utf-8"))
    js = (WEBSITE / "js" / "main.js").read_text(encoding="utf-8")
    keys = parser.keys | set(re.findall(r'data-i18n="([^"]+)"', js))

    translations = json.loads((WEBSITE / "translations.json").read_text(encoding="utf-8"))
    missing = sorted(keys - set(translations))
    incomplete = sorted(
        key
        for key in keys
        if key in translations and not {"en", "es"}.issubset(translations[key])
    )

    assert missing == []
    assert incomplete == []


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


def test_expanded_model_library_cards_exist():
    required_cards = [
        "Isolation_Forest.md",
        "Logistic_RandomForest_Baselines.md",
        "LOF_OCSVM_PCA.md",
        "Density_Outlier_PyOD.md",
        "RGCN_Heterogeneous_GNN.md",
        "GAT_Attention_GNN.md",
        "Graph_Link_Prediction.md",
        "Entity_Resolution_KG.md",
        "Federated_Privacy_Preserving_Fraud.md",
    ]
    html = (WEBSITE / "index.html").read_text(encoding="utf-8")
    for card in required_cards:
        assert card in html
        assert (ROOT / "docs" / "model-cards" / card).exists()


def test_required_user_model_inventory_is_visible_on_website():
    required_models = {
        "Z-Score",
        "IQR",
        "MAD",
        "Modified Z-Score",
        "HBOS",
        "ECOD",
        "COPOD",
        "Isolation Forest",
        "LOF",
        "One-Class SVM",
        "XGBoost",
        "LightGBM",
        "CatBoost",
        "Random Forest",
        "Logistic Regression",
        "Autoencoder",
        "VAE",
        "TabTransformer",
        "FT-Transformer",
        "SAINT",
        "LSTM",
        "GRU",
        "Transformer Sequences",
        "Centrality",
        "Community Detection",
        "Collusion Detection",
        "Louvain",
        "Leiden",
        "k-core",
        "Motif Counting",
        "Link Prediction",
        "GraphSAGE",
        "GAT",
        "R-GCN",
        "HGT",
        "TGN",
        "TGAT",
        "JODIE",
        "DyRep",
        "EvolveGCN",
        "CrimeGNN",
        "MoE",
        "Cascades",
        "Stacking",
        "Self-Supervised Pretraining",
        "GraphRAG",
        "Decision Trees",
        "ExtraTrees",
        "Gradient Boosting",
        "Cost-Sensitive Ensembles",
        "Balanced Random Forest",
        "EasyEnsemble",
        "RUSBoost",
        "TabNet",
        "Deep Isolation Forest",
        "PCA Reconstruction",
        "Robust Covariance",
        "kNN Outlier",
        "KMeans",
        "DBSCAN",
        "Deep SVDD",
        "DAGMM",
        "CTGAN",
        "Diffusion / TabDDPM",
        "Interleaved RNN",
        "BERT4ETH",
        "GCN",
        "Heterogeneous GNN",
        "BRIGHT",
        "Federated Learning",
        "Entity Resolution",
        "Knowledge Graph",
        "Graph Attention Evidence",
        "Temporal Graph Validation",
    }
    html = (WEBSITE / "index.html").read_text(encoding="utf-8")
    covered = set(re.findall(r'data-model-covered="([^"]+)"', html))

    assert len(required_models) == 74
    assert len(covered) >= len(required_models)
    assert sorted(required_models - covered) == []


def test_browser_lab_exposes_model_specific_runner_contract():
    html = (WEBSITE / "index.html").read_text(encoding="utf-8")
    js = (WEBSITE / "js" / "main.js").read_text(encoding="utf-8")
    translations = (WEBSITE / "translations.json").read_text(encoding="utf-8")
    covered = set(re.findall(r'data-model-covered="([^"]+)"', html))

    assert "lab-explain" in html
    assert "lab-representation" in html
    assert "lab-timeline" in html
    assert "lab-validation" in html
    assert "workbench-explainability" in html
    assert "runner-status-badge" in js
    assert "runnerSpec(name)" in js
    assert "scoreModel(name, rows, baseScores)" in js
    assert "new Option(name, name)" in js
    assert "select.value = name" in js
    assert "explanationFor(spec, alert)" in js
    assert "renderRepresentation(topModel.spec, rows, topModel.scores)" in js
    assert "foldDiagnostics(labels, modelScores)" in js
    assert "hydrateWorkbench(topModel.spec, alert)" in js
    assert "74 model-specific JavaScript runners" not in translations
    assert "74 tarjetas de modelo conectadas" in translations
    for model in covered:
        assert model in js or model in html


def test_core_sections_follow_guided_narrative_order():
    html = (WEBSITE / "index.html").read_text(encoding="utf-8")
    ordered_ids = [
        "overview",
        "tour",
        "roadmap",
        "architecture",
        "tradeoffs",
        "decision-matrix",
        "cards",
        "model-workspace",
        "metrics",
        "experiments",
        "browser-lab",
        "workbench",
        "pipeline",
        "catalog",
    ]
    positions = [html.index(f'id="{section_id}"') for section_id in ordered_ids]
    assert positions == sorted(positions)


def test_claims_and_internal_reviewer_language_are_scoped():
    html = (WEBSITE / "index.html").read_text(encoding="utf-8")
    translations = (WEBSITE / "translations.json").read_text(encoding="utf-8")
    combined = f"{html}\n{translations}".lower()

    assert "sub-agent" not in combined
    assert "subagents" not in combined
    assert "production-ready" not in combined
    assert "all implementations validated" not in combined
    assert "roc-auc is misleading" not in combined
    assert "validated examples" in combined
    assert "74 visible model and technique entries" in combined
