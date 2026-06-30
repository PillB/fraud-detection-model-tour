import contextlib
import socket
import subprocess
import sys
import time
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]


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
        page.get_by_text("Explore Cards + Catalog").click()
        page.wait_for_function("location.hash === '#catalog'")
        assert page.locator("#catalog").is_visible()

        page.get_by_text("Open workbench view").click()
        page.wait_for_function("location.hash === '#workbench'")
        assert page.locator("#workbench").is_visible()
        assert page.get_by_text("Evidence-grounded summary").is_visible()

        page.locator('a[href="#cards"]').first.click()
        page.wait_for_function("location.hash === '#cards'")
        assert page.locator(".consulting-card").count() == 74
        assert page.locator("#cards [data-card-model-visible]").count() == 74
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
        assert page.locator("#lab-chart").get_by_text("PR-AUC").first.is_visible()
        assert page.locator("#lab-alerts").get_by_text("TXN").first.is_visible()
        page.locator("#lab-model-select").select_option("graph")
        assert page.locator("#lab-chart").get_by_text("Graph risk proxy").is_visible()

        page.get_by_role("button", name="ES").click()
        page.wait_for_function("document.documentElement.lang === 'es-419'")
        assert "es" in page.url
        assert page.get_by_role("button", name="Ejecutar inferencia").is_visible()
        assert page.locator(".consulting-card").count() == 74
        assert page.locator("#cards [data-card-model-visible]").count() == 74
        assert page.locator(".comparison-table tbody tr").count() == 74
        assert graph_card.is_visible()
        assert xgb_card.is_hidden()
        assert page.locator('#cards [data-generated-model-card="true"]').filter(has_text="Implementado").count() > 0
        assert page.locator(".comparison-table tbody tr").filter(has_text="Anomalías nuevas").count() > 0
        assert page.locator("#lab-status").get_by_text("Completadas").is_visible()

        mobile = browser.new_page(viewport={"width": 390, "height": 900}, is_mobile=True)
        mobile.goto(url, wait_until="networkidle")
        mobile.locator("#mobile-section-jump").select_option("#workbench")
        mobile.wait_for_function("location.hash === '#workbench'")
        assert mobile.locator("#workbench").is_visible()
        mobile.locator("#mobile-section-jump").select_option("#browser-lab")
        mobile.wait_for_function("location.hash === '#browser-lab'")
        assert mobile.get_by_role("button", name="Run inference").is_visible()

        browser.close()
