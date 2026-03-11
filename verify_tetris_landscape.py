from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 812, "height": 375}) # mobile landscape
        page.goto("http://localhost:3001/tetris")

        # Wait a moment for the game to start and pieces to render
        page.wait_for_timeout(1000)

        # Take a screenshot
        page.screenshot(path="tetris_landscape.png")

        browser.close()

if __name__ == "__main__":
    main()
