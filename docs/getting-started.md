# Getting started

## Clone and prepare

```bash
git clone https://github.com/YOUR_ACCOUNT/XtreamlyTV.git
cd XtreamlyTV
npm run prepare:apps
npm run check:webos
npm run test:core
```

`prepare:apps` performs two generated-source steps:

1. Copies the canonical browser/webOS core from `packages/core-web/src` into the packaged webOS app.
2. Generates webOS CSS variables and Android Compose colors from `packages/design-tokens/tokens.json`.

Do not edit these generated files directly:

```text
apps/webos/app/js/core.js
apps/webos/app/js/api.js
apps/webos/app/js/store.js
apps/webos/app/css/tokens.css
apps/android-tv/app/src/main/java/com/xtreamlytv/androidtv/ui/theme/BrandTokens.kt
```

Edit the canonical package source and rerun `npm run prepare:apps`.

## Recommended tools

- Visual Studio Code for webOS and repository work
- Android Studio for Android TV
- Chrome/Chromium for webOS browser smoke testing
- GitHub CLI for publishing releases

## Run the webOS demo locally

```bash
cd apps/webos/app
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080/?demo=1
```

The browser demo validates layout and navigation but does not reproduce every webOS codec, hardware video-plane, or remote-control behavior.

## Run all repository checks

```bash
npm run prepare:apps
npm run check:webos
npm run test:core
CHROMIUM_PATH=/usr/bin/chromium python3 apps/webos/tests/browser_smoke.py
```

On Windows, omit `CHROMIUM_PATH` after installing Playwright's Chromium browser.
