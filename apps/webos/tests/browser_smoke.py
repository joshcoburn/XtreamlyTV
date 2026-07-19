"""Desktop smoke test for XtreamlyTV's demo and virtualized catalogs.

Run from the repository root:
  python -m pip install -r apps/webos/tests/requirements.txt
  python -m playwright install chromium
  python apps/webos/tests/browser_smoke.py
"""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1] / "app"


def inline_app() -> str:
    css = (ROOT / "css" / "tokens.css").read_text(encoding="utf-8") + "\n" + (ROOT / "css" / "app.css").read_text(encoding="utf-8")
    script_files = [
        "core.js",
        "store.js",
        "api.js",
        "mock-data.js",
        "navigation.js",
        "virtual-grid.js",
        "category-rail.js",
        "app.js",
    ]
    scripts = []
    for filename in script_files:
        content = (ROOT / "js" / filename).read_text(encoding="utf-8")
        scripts.append(f"<script>{content.replace('</script>', '<\\/script>')}</script>")
    return (
        "<!doctype html><html><head><meta charset='utf-8'>"
        f"<style>{css}</style></head><body>"
        "<div id='app'></div><div id='playerHost' aria-hidden='true'></div><div id='toast' class='toast'></div>"
        + "".join(scripts)
        + "</body></html>"
    )


def main() -> None:
    errors: list[str] = []
    with sync_playwright() as playwright:
        launch_options = {"headless": True}
        if os.environ.get("CHROMIUM_PATH"):
            launch_options["executable_path"] = os.environ["CHROMIUM_PATH"]
        browser = playwright.chromium.launch(**launch_options)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on(
            "console",
            lambda message: errors.append(message.text)
            if message.type == "error"
            else None,
        )
        page.set_content(inline_app(), wait_until="domcontentloaded")

        # Enter should advance through provider fields instead of submitting early.
        page.locator('#loginServer').fill('http://provider.test')
        page.locator('#loginServer').focus()
        page.keyboard.press('Enter')
        assert page.evaluate("document.activeElement.id") == 'loginUsername'
        assert page.locator('.form-error').count() == 0
        page.locator('#loginUsername').fill('demo-user')
        page.keyboard.press('Enter')
        assert page.evaluate("document.activeElement.id") == 'loginPassword'
        assert page.locator('.form-error').count() == 0

        # Re-rendering the login screen after a saved-provider failure must not focus a text field.
        page.evaluate("XtreamlyTVApp.renderLogin('Provider rejected the connection.')")
        assert page.evaluate("document.activeElement.id") == 'loginConnect'

        page.evaluate("XtreamlyTVApp.startDemo()")
        page.wait_for_selector('.hero .focusable')
        assert page.locator('.shortcut-card b').count() == 0
        assert page.locator('[data-shortcut="live"] .shortcut-svg').count() == 1
        assert page.locator('[data-shortcut="live"] .shortcut-copy').count() == 1
        assert page.locator('.hero p').inner_text() == 'Jump back into recently watched content or browse Live TV.'

        # Recently watched rows come from actual watch history, not merely loaded catalogs.
        page.evaluate("""() => {
            XtreamlyTVStore.addRecent(XtreamlyTVMock.liveStreams[0], 'live');
            XtreamlyTVStore.addRecent(XtreamlyTVMock.vodStreams[0], 'movie');
            XtreamlyTVStore.addRecent(XtreamlyTVMock.series[0], 'series');
            XtreamlyTVApp.state = XtreamlyTVStore.getState();
            XtreamlyTVApp.renderHome();
        }""")
        home_text = page.locator('.scroll-view').inner_text()
        assert 'Recently watched channels' in home_text
        assert 'Recently watched movies' in home_text
        assert 'Recently watched series' in home_text

        # Home vertical navigation must be able to travel down and return to the hero.
        page.locator('.hero .focusable').first.focus()
        for _ in range(4):
            page.keyboard.press('ArrowDown')
        assert int(page.evaluate("Number(document.activeElement.dataset.homeRow || 0)")) > 0
        for _ in range(6):
            page.keyboard.press('ArrowUp')
        assert page.evaluate("document.activeElement.dataset.homeRow") == "0"
        assert page.evaluate("document.querySelector('.scroll-view').scrollTop") < 40

        # Favorites are grouped explicitly by media type.
        page.evaluate("""() => {
            XtreamlyTVStore.toggleFavorite(XtreamlyTVMock.liveStreams[0], 'live');
            XtreamlyTVStore.toggleFavorite(XtreamlyTVMock.vodStreams[0], 'movie');
            XtreamlyTVStore.toggleFavorite(XtreamlyTVMock.series[0], 'series');
            XtreamlyTVApp.state = XtreamlyTVStore.getState();
            XtreamlyTVApp.renderShell('favorites');
        }""")
        favorite_headings = page.locator('.favorites-group .section-head h2').all_inner_texts()
        assert favorite_headings == ['Live TV', 'Movies', 'Series']
        page.evaluate("""() => {
            XtreamlyTVStore.toggleFavorite(XtreamlyTVMock.liveStreams[0], 'live');
            XtreamlyTVStore.toggleFavorite(XtreamlyTVMock.vodStreams[0], 'movie');
            XtreamlyTVStore.toggleFavorite(XtreamlyTVMock.series[0], 'series');
            XtreamlyTVApp.state = XtreamlyTVStore.getState();
            XtreamlyTVApp.renderShell('live');
        }""")
        assert page.locator('[data-catalog-category="all"]').count() == 0
        assert 'All channels' not in page.locator('#categoryList').inner_text()
        page.click('[data-catalog-category="2"]')
        page.wait_for_selector("#catalogGrid .channel-tile")
        assert page.evaluate("XtreamlyTVApp.virtualGrid.columns") == 4
        assert page.evaluate("XtreamlyTVApp.virtualGrid.visibleRows") == 4
        switch_info = page.evaluate("""() => {
            const first = XtreamlyTVApp.currentFilteredItems.live[0];
            const list = XtreamlyTVApp.buildChannelSwitchList(first, [first]);
            return {length:list.length, first:String(first.stream_id), second:list[1] && String(list[1].stream_id)};
        }""")
        assert switch_info['length'] > 1
        assert switch_info['first'] != switch_info['second']

        # The red remote button toggles favorites directly from a catalog card.
        first_tile = page.locator('#catalogGrid .channel-tile').first
        first_tile.focus()
        first_id = first_tile.get_attribute('data-content-id')
        page.evaluate("document.dispatchEvent(new KeyboardEvent('keydown', {keyCode:403, bubbles:true}))")
        assert page.evaluate("id => XtreamlyTVStore.isFavorite('live', id)", first_id)
        assert page.locator('#menuHint.visible').count() == 1
        page.evaluate("document.dispatchEvent(new KeyboardEvent('keydown', {keyCode:403, bubbles:true}))")
        assert not page.evaluate("id => XtreamlyTVStore.isFavorite('live', id)", first_id)

        result = page.evaluate(
            """() => {
                const items = [];
                for (let index = 0; index < 55000; index += 1) {
                    items.push({
                        stream_id: 900000 + index,
                        name: 'Channel ' + index,
                        num: index + 1,
                        category_id: '1',
                        content_type: 'live',
                        _search: 'channel ' + index
                    });
                }
                XtreamlyTVApp.currentItems.live = items;
                XtreamlyTVApp.searchText.live = '';
                XtreamlyTVApp.updateCatalogGrid('live');
                return {
                    resultCount: document.querySelector('.result-count').textContent,
                    renderedTiles: document.querySelectorAll('#catalogGrid .channel-tile').length
                };
            }"""
        )
        assert result["resultCount"] == "55,000 channels"
        assert result["renderedTiles"] < 100

        page.fill("#catalogSearch", "Channel 54999")
        page.wait_for_timeout(350)
        assert page.locator(".result-count").inner_text() == "1 channels"

        page.click('[data-view="movies"]')
        assert page.locator('[data-catalog-category="all"]').count() == 0
        assert 'All movies' not in page.locator('#categoryList').inner_text()
        page.click('[data-catalog-category="102"]')
        page.wait_for_selector("#catalogGrid .poster-card")
        assert page.evaluate("XtreamlyTVApp.virtualGrid.columns") == 5
        assert page.evaluate("XtreamlyTVApp.virtualGrid.visibleRows") == 2
        page.locator("#catalogGrid .poster-card").first.click()
        page.wait_for_selector("#playMovie")

        page.click("#closeDetail")
        page.click('[data-view="series"]')
        assert page.locator('[data-catalog-category="all"]').count() == 0
        assert 'All series' not in page.locator('#categoryList').inner_text()
        page.click('[data-catalog-category="202"]')
        page.wait_for_selector("#catalogGrid .poster-card")
        page.locator("#catalogGrid .poster-card").first.click()
        page.wait_for_selector(".episode-card")

        page.click("#closeSeries")
        page.click('[data-view="settings"]')
        assert page.locator('#providerPassword').get_attribute('type') == 'password'
        assert page.locator('.about-list').inner_text().find('0.4.0') >= 0
        page.click('[data-view="live"]')
        page.click('[data-catalog-category="2"]')
        page.wait_for_selector("#catalogGrid .channel-tile")
        page.locator("#catalogGrid .channel-tile").first.click()
        page.wait_for_selector("#player")
        assert page.evaluate(
            "getComputedStyle(document.querySelector('.shell')).visibility"
        ) == "hidden"

        browser.close()

    if errors:
        raise RuntimeError("Browser errors:\n" + "\n".join(errors))
    print(
        "PASS: demo navigation, VOD, Series, player takeover, and "
        f"55,000-item virtualization ({result['renderedTiles']} rendered tiles)."
    )


if __name__ == "__main__":
    main()
