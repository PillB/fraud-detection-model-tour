import contextlib
import re
import socket
import subprocess
import sys
import time
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]


DIRECT_BROWSER_MODELS = {
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
    "PCA Reconstruction",
    "Robust Covariance",
    "kNN Outlier",
    "KMeans",
    "DBSCAN",
    "Deep Isolation Forest",
    "XGBoost",
    "LightGBM",
    "CatBoost",
    "Random Forest",
    "Logistic Regression",
    "Decision Trees",
    "ExtraTrees",
    "Gradient Boosting",
    "Cost-Sensitive Ensembles",
    "Balanced Random Forest",
    "EasyEnsemble",
    "RUSBoost",
    "Stacking",
    "Autoencoder",
    "VAE",
    "Centrality",
    "Community Detection",
    "Collusion Detection",
    "Louvain",
    "Leiden",
    "k-core",
    "Motif Counting",
    "Link Prediction",
    "GCN",
    "GraphSAGE",
    "GAT",
}


def wait_for_lab_result(page, model):
    page.wait_for_function(
        """(name) => {
            const done = document.querySelector('#lab-loading')?.classList.contains('hidden');
            const chart = document.querySelector('#lab-chart');
            const rows = [...document.querySelectorAll('#lab-chart [data-lab-result-name]')];
            return done && chart?.dataset.labSelected === name && rows.some((row) => row.dataset.labResultName === name);
        }""",
        arg=model,
    )


def lab_result(page, model):
    return page.locator(f'#lab-chart [data-lab-result-name="{model}"]').first


def find_free_port():
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


@contextlib.contextmanager
def local_server():
    port = find_free_port()
    proc = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        time.sleep(0.8)
        yield f"http://127.0.0.1:{port}/website/index.html"
    finally:
        proc.terminate()
        proc.wait(timeout=5)


def test_primary_website_flows_with_playwright():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        pytest.skip("playwright is not installed")

    with local_server() as url, sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 1100})
        page.goto(url, wait_until="networkidle")

        assert page.locator("h1").first.text_content()
        page.get_by_text("Start with the challenge").click()
        page.wait_for_function("location.hash === '#overview'")
        assert page.locator("#overview").is_visible()

        page.get_by_text("Go to guided tour").click()
        page.wait_for_function("location.hash === '#tour'")
        assert page.locator("#tour").is_visible()

        page.locator('a[href="#cards"]').first.click()
        page.wait_for_function("location.hash === '#cards'")
        assert page.locator(".consulting-card").count() == 74
        assert page.locator("#cards [data-card-model-visible]").count() == 74
        assert page.locator("#cards .consulting-card").filter(has_text="Runnable example").count() == 74
        assert page.locator("#cards .runner-status-badge").count() == 74
        assert page.locator("#cards .runner-status-badge").filter(has_text="Model-specific educational runner").count() > 0
        assert page.locator("#cards .runner-status-badge").filter(has_text="Exact lightweight JS runner").count() > 0
        page.locator('[data-model-name="Isolation Forest"] a').filter(has_text="Inspect").first.click()
        page.wait_for_function("location.hash === '#model-workspace'")
        assert page.locator("#workspace-model-name").text_content() == "Isolation Forest"
        assert page.locator("#workspace-inputs").text_content()

        page.locator('[data-model-name="Isolation Forest"] a').filter(has_text="Run").first.click()
        page.wait_for_function("location.hash === '#browser-lab'")
        assert page.locator("#lab-model-select").input_value() == "Isolation Forest"
        wait_for_lab_result(page, "Isolation Forest")
        assert page.locator("#lab-chart [data-lab-result-name]").count() == 1
        assert page.locator("#lab-model-select option").count() == 75
        assert page.locator('#lab-model-select option[value="all"]').text_content() == "All models"
        assert lab_result(page, "Isolation Forest").is_visible()
        assert page.locator("#lab-explain").get_by_text("isolation-style feature attribution").is_visible()
        assert page.locator("#lab-representation svg").is_visible()
        assert page.locator("#lab-representation").get_by_text("Green: correctly prioritized fraud").is_visible()
        assert page.locator("#lab-representation svg polygon").count() >= 1
        assert page.locator("#lab-timeline").get_by_text("Temporal CV").is_visible()
        assert page.locator("#lab-validation").get_by_text("CV mean PR-AUC").is_visible()
        assert not page.url.endswith(".py")
        assert not page.url.endswith(".md")
        first_alert_id = page.locator("#lab-alerts .font-mono").first.text_content()
        page.locator("#lab-alerts .open-workbench").first.click()
        page.wait_for_function("location.hash === '#workbench'")
        assert page.locator("#workbench-txn-id").text_content() == first_alert_id
        assert page.locator("#workbench-explainability").get_by_text("Linked from the lab").is_visible()

        page.locator('a[href="#cards"]').first.click()
        page.wait_for_function("location.hash === '#cards'")
        page.get_by_role("button", name="Graph / Network").click()
        graph_card = page.locator("#cards .model-card").filter(has_text="GraphSAGE")
        xgb_card = page.locator("#cards .model-card").filter(has_text="XGBoost")
        assert graph_card.is_visible()
        assert xgb_card.is_hidden()

        page.locator('a[href="#experiments"]').first.click()
        page.wait_for_function("location.hash === '#experiments'")
        assert page.locator(".comparison-table tbody tr").count() == 74
        pr_header = page.locator(".comparison-table th").nth(2)
        pr_header.focus()
        page.keyboard.press("Enter")
        assert pr_header.get_attribute("aria-sort") in {"ascending", "descending"}

        page.locator('a[href="#browser-lab"]').first.click()
        page.wait_for_function("location.hash === '#browser-lab'")
        page.get_by_role("button", name="Run inference").click()
        page.wait_for_function("document.querySelector('#lab-loading')?.classList.contains('hidden')")
        assert page.locator("#lab-chart").get_by_text("PR-AUC").first.is_visible()
        assert page.locator("#lab-alerts").get_by_text("TXN").first.is_visible()
        page.locator("#lab-model-select").select_option("GraphSAGE")
        wait_for_lab_result(page, "GraphSAGE")
        assert page.locator("#lab-chart [data-lab-result-name]").count() == 1
        assert lab_result(page, "GraphSAGE").is_visible()
        assert page.locator("#lab-explain").get_by_text("graph-neighborhood evidence").is_visible()
        assert page.locator("#lab-validation").get_by_text("Browser validation for GraphSAGE").is_visible()
        assert page.locator("#lab-validation").get_by_text("Direct in-browser implementation: GraphSAGE").is_visible()
        assert page.locator("#lab-timeline").get_by_text("Actual browser training trace").is_visible()
        assert page.locator("#lab-timeline svg").count() >= 1
        for direct_model in sorted(DIRECT_BROWSER_MODELS):
            page.locator("#lab-model-select").select_option(direct_model)
            wait_for_lab_result(page, direct_model)
            assert page.locator("#lab-chart [data-lab-result-name]").count() == 1
            assert lab_result(page, direct_model).is_visible()
            assert page.locator("#lab-validation").get_by_text(f"Direct in-browser implementation: {direct_model}").is_visible()
            assert page.locator("#lab-timeline").get_by_text("Actual browser training trace").is_visible()
        page.locator("#lab-model-select").select_option("R-GCN")
        wait_for_lab_result(page, "R-GCN")
        assert page.locator("#lab-chart [data-lab-result-name]").count() == 1
        assert page.locator("#lab-validation").get_by_text("Model-specific educational approximation: R-GCN").is_visible()
        page.locator("#lab-model-select").select_option("LOF")
        assert page.locator("#lab-loading").is_visible()
        wait_for_lab_result(page, "LOF")
        assert page.locator("#lab-chart [data-lab-result-name]").count() == 1
        assert page.locator("#lab-validation").get_by_text("Direct in-browser implementation: LOF").is_visible()

        page.get_by_role("button", name="ES").click()
        page.wait_for_function("document.documentElement.lang === 'es-419'")
        assert "es" in page.url
        assert page.locator("#lang-es").get_attribute("aria-pressed") == "true"
        assert page.locator("#lang-en").get_attribute("aria-pressed") == "false"
        assert "bg-slate-900" in page.locator("#lang-es").get_attribute("class")
        assert "bg-slate-900" not in page.locator("#lang-en").get_attribute("class")
        assert "text-white" in page.locator("#lang-es").get_attribute("class")
        assert "text-white" not in page.locator("#lang-en").get_attribute("class")
        assert page.get_by_role("button", name="Ejecutar inferencia").is_visible()
        assert page.get_by_text("Compensaciones entre familias de modelos").is_visible()
        assert page.locator(".consulting-card").count() == 74
        assert page.locator("#cards [data-card-model-visible]").count() == 74
        assert page.locator("#cards .consulting-card").filter(has_text="Ejemplo ejecutable").count() == 74
        assert page.locator("#cards .runner-status-badge").count() == 74
        assert page.locator("#cards .runner-status-badge").filter(has_text="Ejecutor educativo específico").count() > 0
        assert page.locator("#cards .runner-status-badge").filter(has_text="Ejecutor JS ligero exacto").count() > 0
        assert page.locator(".comparison-table tbody tr").count() == 74
        assert page.locator('#lab-model-select option[value="all"]').text_content() == "Todos los modelos"
        assert graph_card.is_visible()
        assert xgb_card.is_hidden()
        assert page.locator('#cards [data-generated-model-card="true"]').filter(has_text="Ejemplo ejecutable").count() > 0
        assert page.locator(".comparison-table tbody tr").filter(has_text="Anomalías nuevas").count() > 0
        assert page.locator("#lab-status").get_by_text("Completadas").is_visible()
        page.locator("#lab-model-select").select_option("GraphSAGE")
        wait_for_lab_result(page, "GraphSAGE")
        assert page.locator("#lab-chart [data-lab-result-name]").count() == 1
        assert lab_result(page, "GraphSAGE").is_visible()
        assert page.locator("#lab-explain").get_by_text("evidencia de vecindario de grafo").is_visible()
        assert page.locator("#lab-timeline").get_by_text("CV temporal").is_visible()
        assert page.locator("#lab-validation").get_by_text("Validación de navegador para GraphSAGE").is_visible()

        english_page = browser.new_page(viewport={"width": 1200, "height": 900})
        english_page.goto(f"{url}?lang=en#cards", wait_until="networkidle")
        assert english_page.locator("html").get_attribute("lang") == "en"
        assert english_page.locator("#cards .consulting-card").filter(has_text="Runnable example").count() == 74

        mobile = browser.new_page(viewport={"width": 390, "height": 900}, is_mobile=True)
        mobile.goto(url, wait_until="networkidle")
        mobile.locator("#mobile-section-jump").select_option("#workbench")
        mobile.wait_for_function("location.hash === '#workbench'")
        assert mobile.locator("#workbench").is_visible()
        mobile.locator("#mobile-section-jump").select_option("#browser-lab")
        mobile.wait_for_function("location.hash === '#browser-lab'")
        assert mobile.get_by_role("button", name="Run inference").is_visible()

        browser.close()


def test_every_model_selection_runs_browser_outputs():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        pytest.skip("playwright is not installed")

    with local_server() as url, sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        page.goto(f"{url}#browser-lab", wait_until="networkidle")
        page.wait_for_function("document.querySelectorAll('#lab-model-select option').length === 75")

        options = page.locator("#lab-model-select option").evaluate_all(
            "(options) => options.map((option) => option.value).filter((value) => value !== 'all')"
        )
        assert len(options) == 74

        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        for model in options:
            page.locator("#lab-model-select").select_option(model)
            wait_for_lab_result(page, model)
            assert page.locator("#lab-chart [data-lab-result-name]").count() == 1
            assert lab_result(page, model).is_visible()
            assert page.locator("#lab-chart").get_by_text("PR-AUC").first.is_visible()
            assert page.locator("#lab-alerts").get_by_text("TXN").first.is_visible()
            assert page.locator("#lab-explain > div").count() >= 6
            assert page.locator("#lab-representation svg circle").count() > 0
            assert page.locator("#lab-timeline").text_content()
            assert page.locator("#lab-validation").get_by_text("Fold 1").is_visible()
            assert page.locator("#lab-validation").get_by_text("CV mean PR-AUC").is_visible()
        assert errors == []
        browser.close()


def test_every_model_card_runnable_example_button_runs_exact_model():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        pytest.skip("playwright is not installed")

    with local_server() as url, sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1366, "height": 950})
        page.goto(f"{url}#cards", wait_until="networkidle")
        page.wait_for_function("document.querySelectorAll('#cards .model-card[data-model-name]').length === 74")

        models = page.locator("#cards .model-card[data-model-name]").evaluate_all(
            "(cards) => cards.map((card) => card.dataset.modelName)"
        )
        assert len(models) == 74

        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        for model in models:
            page.locator('a[href="#cards"]').first.click()
            page.wait_for_function("location.hash === '#cards'")
            card = page.locator(f'#cards .model-card[data-model-name="{model}"]').first
            assert card.is_visible()
            card.locator("a").filter(has_text=re.compile("run", re.I)).first.click()
            page.wait_for_function(
                "(name) => location.hash === '#browser-lab' && document.querySelector('#lab-model-select')?.value === name",
                arg=model,
            )
            wait_for_lab_result(page, model)
            assert page.locator("#lab-chart [data-lab-result-name]").count() == 1
            assert lab_result(page, model).is_visible()
            assert page.locator("#lab-chart").get_by_text("PR-AUC").first.is_visible()
            assert page.locator("#lab-alerts").get_by_text("TXN").first.is_visible()
            assert page.locator("#lab-explain > div").count() >= 6
            assert page.locator("#lab-representation svg circle").count() > 0
            assert page.locator("#lab-timeline svg").count() >= 1
            assert page.locator("#lab-validation").get_by_text("Fold 1").is_visible()
            assert page.locator("#lab-validation").get_by_text("CV mean PR-AUC").is_visible()
            validation_text = page.locator("#lab-validation").text_content()
            if model in DIRECT_BROWSER_MODELS:
                assert f"Direct in-browser implementation: {model}" in validation_text
            else:
                assert f"Model-specific educational approximation: {model}" in validation_text
        assert errors == []
        browser.close()
