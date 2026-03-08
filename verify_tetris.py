import asyncio
from playwright.async_api import async_playwright
import time

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 375, "height": 812}) # mobile viewport
        await page.goto("http://localhost:3001/tetris")

        # Wait a moment for the game to start and pieces to render
        time.sleep(1)

        # Take a screenshot
        await page.screenshot(path="tetris_mobile.png")

        # Set to desktop viewport and screenshot
        await page.set_viewport_size({"width": 1280, "height": 800})
        await page.screenshot(path="tetris_desktop.png")

        await browser.close()

asyncio.run(main())
