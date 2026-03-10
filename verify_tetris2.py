from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 896, "height": 380}) # smaller height to check overlap
        page.goto("http://localhost:3001/tetris")

        page.wait_for_timeout(2000)

        page.screenshot(path="tetris_mobile_landscape_small.png")
        browser.close()

main()
