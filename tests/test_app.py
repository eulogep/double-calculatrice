from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def click(page, selector):
    page.locator(selector).click()


def enter_operand(page, calculator_id, *keys):
    click(page, f"{calculator_id} .key[data-key='C']")
    for key in keys:
        click(page, f"{calculator_id} .key[data-key='{key}']")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, executable_path="/usr/bin/chromium")
    page = browser.new_page()
    console_errors = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    page.goto("http://127.0.0.1:4173/index.html", wait_until="networkidle")

    # Calcul standard : 15 x 7 = 105
    enter_operand(page, "#calc1", "1", "5")
    enter_operand(page, "#calc2", "7")
    click(page, "button[data-op='*']")
    click(page, "#equals")
    assert page.locator("#result").inner_text() == "105"

    # Division par zéro : message d’erreur sans inscription dans l’historique.
    history_before = page.locator(".history-item").count()
    enter_operand(page, "#calc1", "8")
    enter_operand(page, "#calc2", "0")
    click(page, "button[data-op='/']")
    click(page, "#equals")
    assert page.locator("#result").inner_text() == "Erreur"
    assert page.locator(".history-item").count() == history_before

    # Raccourci de changement de mode : Ctrl+2.
    page.keyboard.press("Control+2")
    assert page.locator("#scientific-mode").get_attribute("aria-hidden") == "false"
    assert page.locator(".mode-btn[data-mode='scientific']").get_attribute("aria-selected") == "true"

    # Calcul scientifique : sqrt(9) = 3 et bouton C fonctionnel.
    click(page, ".sci-btn[data-key='9']")
    click(page, ".sci-btn[data-func='sqrt']")
    assert page.locator(".sci-input").input_value() == "3"
    click(page, ".sci-btn[data-func='clear']")
    assert page.locator(".sci-input").input_value() == "0"

    # Conversion : 100 m = 0.1 km.
    click(page, ".mode-btn[data-mode='converter']")
    page.locator("#from-value").fill("100")
    page.locator("#from-value").dispatch_event("input")
    assert page.locator("#to-value").input_value() == "0.1"

    # Paramètres : désactivation réelle des animations et persistance.
    click(page, "#settings-btn")
    page.locator("#animations-enabled").uncheck()
    click(page, "#save-settings")
    assert page.locator("html").get_attribute("class") == "animations-disabled"
    assert page.evaluate("localStorage.getItem('calculator-animations')") == "false"

    # Les erreurs JavaScript inattendues doivent rester absentes.
    unexpected_errors = [error for error in console_errors if "favicon" not in error.lower()]
    assert not unexpected_errors, unexpected_errors
    browser.close()

print("OK - tests navigateur passés")
