from playwright.sync_api import sync_playwright

def verify_scheduler():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the scheduler page
        page.goto('http://localhost:3001/scratch/scheduler')
        page.wait_for_selector('h1:has-text("Scheduler")')

        # Step 1: Name Input
        # Wait for "What is your business name?"
        page.wait_for_selector('text=What is your business name')
        page.fill('input[placeholder="e.g. Joe\'s Diner"]', "Jules Cafe")
        page.click('button:has-text("Next")')

        # Step 2: Hours Input
        # Wait for "What are your operating hours?"
        page.wait_for_selector('text=What are your operating hours')
        page.click('button:has-text("Confirm Hours")')

        # Step 3: Shifts
        # Wait for "suggested shifts"
        page.wait_for_selector('text=suggested shifts')
        page.click('button:has-text("Done")')

        # Step 4: Roles
        # Wait for "what roles do you need"
        page.wait_for_selector('text=what roles do you need')
        page.click('button:has-text("Confirm Roles")')

        # Step 5: Staff Counts
        # Wait for "How many employees"
        page.wait_for_selector('text=How many employees')
        page.click('button:has-text("Next")')

        # Step 6: Coverage
        # Wait for "How many people do you need"
        page.wait_for_selector('text=How many people do you need')
        page.click('button:has-text("Generate Schedule")')

        # Step 7: Result
        # Wait for "Your Schedule"
        page.wait_for_selector('text=Your Schedule', timeout=5000)

        # Screenshot
        page.screenshot(path='verification/scheduler_result.png', full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_scheduler()
