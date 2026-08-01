"""
Screenshot capture script for OnlineBank project report.
Captures all UI pages for admin and regular user.
"""
import time
import os
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"
IMG_DIR = os.path.join(os.path.dirname(__file__), "documents", "images")
os.makedirs(IMG_DIR, exist_ok=True)

def shot(page, filename, wait_ms=1500):
    time.sleep(wait_ms / 1000)
    path = os.path.join(IMG_DIR, filename)
    page.screenshot(path=path, full_page=True)
    size = os.path.getsize(path)
    print(f"  [OK] {filename}  ({size:,} bytes)")

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()

        # ── PUBLIC PAGES ──────────────────────────────────────────
        print("\n[PUBLIC PAGES]")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state("networkidle")
        shot(page, "01-login.png")

        page.goto(f"{BASE_URL}/register")
        page.wait_for_load_state("networkidle")
        shot(page, "02-register.png")

        page.goto(f"{BASE_URL}/forgot-password")
        page.wait_for_load_state("networkidle")
        shot(page, "03-forgot-password.png")

        # ── USER PAGES (john_doe) ─────────────────────────────────
        print("\n[USER PAGES – john_doe]")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state("networkidle")
        page.fill("input[type='text'], input[name='username'], input[placeholder*='sername']", "john_doe")
        page.fill("input[type='password']", "password123")
        page.click("button[type='submit']")
        page.wait_for_url(f"{BASE_URL}/dashboard", timeout=8000)
        page.wait_for_load_state("networkidle")
        shot(page, "04-dashboard.png")

        page.goto(f"{BASE_URL}/deposit")
        page.wait_for_load_state("networkidle")
        shot(page, "05-deposit.png")

        page.goto(f"{BASE_URL}/withdraw")
        page.wait_for_load_state("networkidle")
        shot(page, "06-withdraw.png")

        page.goto(f"{BASE_URL}/transfer")
        page.wait_for_load_state("networkidle")
        shot(page, "07-transfer.png")

        page.goto(f"{BASE_URL}/transactions")
        page.wait_for_load_state("networkidle")
        shot(page, "08-transactions.png")

        page.goto(f"{BASE_URL}/mini-statement")
        page.wait_for_load_state("networkidle")
        shot(page, "09-mini-statement.png")

        page.goto(f"{BASE_URL}/notifications")
        page.wait_for_load_state("networkidle")
        shot(page, "10-notifications.png")

        page.goto(f"{BASE_URL}/profile")
        page.wait_for_load_state("networkidle")
        shot(page, "11-profile.png")

        page.goto(f"{BASE_URL}/settings")
        page.wait_for_load_state("networkidle")
        shot(page, "12-settings.png")

        # ── ADMIN PAGES ───────────────────────────────────────────
        print("\n[ADMIN PAGES – admin]")
        # Clear storage and log in as admin
        ctx.clear_cookies()
        page2 = ctx.new_page()
        page2.goto(f"{BASE_URL}/login")
        page2.wait_for_load_state("networkidle")
        # Clear localStorage
        page2.evaluate("window.localStorage.clear()")
        page2.reload()
        page2.wait_for_load_state("networkidle")

        # Fill login form
        page2.fill("input[type='text'], input[name='username'], input[placeholder*='sername']", "admin")
        page2.fill("input[type='password']", "admin123")
        page2.click("button[type='submit']")
        page2.wait_for_url(f"{BASE_URL}/dashboard", timeout=8000)
        page2.wait_for_load_state("networkidle")

        page2.goto(f"{BASE_URL}/admin")
        page2.wait_for_load_state("networkidle")
        time.sleep(1.5)
        shot(page2, "13-admin-dashboard.png")

        # Click "Users" tab if present
        try:
            tab = page2.locator("button:has-text('Users'), [role=tab]:has-text('Users'), button:has-text('User Management')")
            if tab.count() > 0:
                tab.first.click()
                time.sleep(1)
        except Exception:
            pass
        shot(page2, "14-admin-users.png")

        # Click "Transactions" tab if present
        try:
            tab = page2.locator("button:has-text('Transactions'), [role=tab]:has-text('Transactions')")
            if tab.count() > 0:
                tab.first.click()
                time.sleep(1)
        except Exception:
            pass
        shot(page2, "15-admin-transactions.png")

        browser.close()
        print(f"\nAll screenshots saved to: {IMG_DIR}")

if __name__ == "__main__":
    run()
