"""Capture known non-submitting homepage interactions to supplement full-page snapshots."""
import argparse
import asyncio
import json
from pathlib import Path

from playwright.async_api import async_playwright
from capture_public_site import PROFILES, now, write_json


async def run(args):
    output = args.output / "interactions"
    output.mkdir(parents=True, exist_ok=True)
    prior = output / "index.json"
    results = [r for r in json.loads(prior.read_text(encoding="utf-8")).get("states", []) if r.get("profile") not in args.profiles] if prior.exists() else []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for profile in args.profiles:
            context = await browser.new_context(**PROFILES[profile], locale="en-US", timezone_id="Asia/Riyadh")
            page = await context.new_page()
            page.set_default_timeout(15000)
            try:
                await page.goto(args.origin, wait_until="domcontentloaded", timeout=45000)
                await page.mouse.move(15, 15)
                await page.wait_for_timeout(2500)
                async def save(state, action):
                    screenshot = f"{profile}--{state}.png"
                    html = f"{profile}--{state}.html"
                    await page.wait_for_timeout(1000)
                    (output / html).write_text(await page.content(), encoding="utf-8")
                    await page.screenshot(path=str(output / screenshot), animations="disabled")
                    results.append({"profile": profile, "state": state, "action": action, "captured_at": now(),
                                    "url": page.url, "html": html, "screenshot": screenshot, "complete": True})
                if profile == "desktop":
                    await page.locator('.elementor-widget-cmsmasters-nav-menu a[href="/blog/"]:visible').first.hover()
                    await save("blog-dropdown", "Hover public Blog navigation link")
                    await page.mouse.move(15, 200)
                    await page.locator('.elementor-widget-cmsmasters-search__popup-trigger-inner:visible').first.click()
                    await save("search-popup", "Open search popup without submitting a search")
                    await page.locator('.elementor-widget-cmsmasters-search__popup-close:visible').first.click()
                else:
                    await page.locator('a[href="#cmsmasters-popup-95"]:visible').first.click()
                    await save("navigation-open", "Open the existing mobile/tablet navigation popup")
                    await page.goto(args.origin, wait_until="domcontentloaded", timeout=45000)
                faq = page.locator('.elementor-widget-cmsmasters-toggles__title-text', has_text="What services does Nalk Solution offer?").first
                await faq.scroll_into_view_if_needed()
                await page.wait_for_timeout(800)
                await faq.click()
                await save("faq-open", "Expand the first homepage FAQ")
            except Exception as e:
                results.append({"profile": profile, "complete": False, "error": str(e)[:2000], "captured_at": now()})
            finally:
                await context.close()
        await browser.close()
    write_json(output / "index.json", {"source": args.origin, "states": results,
        "limitations": ["Representative states only; forms were not filled or submitted and no messages were sent.",
                        "Full-page baseline screenshots are in the parent screenshots directory."]})
    print({"captured_states": sum(bool(r.get("complete")) for r in results),
           "errors": [r for r in results if not r.get("complete")]})


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--origin", default="https://nalksolutions.com/")
    ap.add_argument("--output", type=Path, default=Path("nalk-public-archive"))
    ap.add_argument("--profiles", nargs="+", choices=PROFILES, default=list(PROFILES))
    asyncio.run(run(ap.parse_args()))
