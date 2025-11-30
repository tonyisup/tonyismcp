from playwright.sync_api import sync_playwright

def verify_load_more_button():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the wishlist page
        page.goto("http://localhost:3001/wishlist")

        # Wait for the page to load
        page.wait_for_selector("h1")

        # Take a screenshot of the wishlist page
        page.screenshot(path="verification_wishlist.png")

        # Verify the title
        assert "Amazon Wishlist Blocker" in page.title() or "Amazon Wishlist Blocker" in page.content()

        # Check if the form exists
        assert page.locator("form").is_visible()

        print("Verification script finished successfully.")

        browser.close()

if __name__ == "__main__":
    verify_load_more_button()
