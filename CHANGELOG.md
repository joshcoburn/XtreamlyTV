# Changelog

All notable changes are documented here. XtreamlyTV follows semantic versioning.

## 0.4.1 - 2026-07-19

### Favorites overhaul

- Rebuilt Favorites as a personalized landing page with **All**, **Live TV**, **Movies**, and **Series** filter chips.
- Added built-in media groups plus user-created collections for categories such as Sports, Kids, News, or Weekend Movies.
- Added a dedicated group browser with a left-side group rail and normal four-column Live TV / five-column poster grids.
- Added virtualized mixed-content grids so large favorite collections remain responsive.
- Added an Add/Edit Group screen with custom names, icons, colors, media filters, item selection, and two-step deletion.
- Added automatic cleanup of custom-group membership when an item is removed from Favorites.
- Added Recently Watched Favorites sourced from actual watch history.

### UI polish

- Increased primary typography sizes throughout the TV interface for better viewing distance readability.
- Increased spacing between sidebar icons and navigation labels.
- Colored the player **RED** favorite key hint red to match the physical remote button.
- Added reliable spacing between the red key badge and Favorites menu tooltip text on legacy webOS Chromium.
- Added browser smoke coverage for favorite groups, filters, persistence cleanup, virtualized group layouts, and UI styling.

## 0.4.0 - 2026-07-19

### Repository and tooling

- Refactored the project into a multi-platform monorepo.
- Moved the production webOS target to `apps/webos`.
- Added shared browser/webOS core primitives under `packages/core-web`.
- Added platform-neutral JSON contracts and fixtures.
- Added generated cross-platform design tokens and canonical brand assets.
- Added one-command webOS and Android build/install scripts for PowerShell and shell environments.
- Added GitHub Actions for webOS, Android TV, CodeQL, and tag-based releases.
- Added issue templates, pull-request checks, Dependabot, Code of Conduct, and release documentation.

### Android TV / Google TV developer preview

- Added a native Kotlin/Compose Android TV application target.
- Added Xtream authentication and category-scoped Live TV, Movie, and Series browsing.
- Added Series episode discovery.
- Added AndroidX Media3 ExoPlayer playback with live HLS/MPEG-TS candidates.
- Added Android TV launcher metadata, banner artwork, encrypted provider preferences, and cleartext-provider compatibility for development.
- Added build, ADB, TCL, Sony, emulator, wireless debugging, and logcat documentation.

### webOS

- Preserved the tested v0.3.7 interface and playback behavior.
- Moved provider normalization, URL construction, and storage primitives to generated shared source.
- Added generated design-token CSS.
- Updated app version to 0.4.0.

### Known limitations

- Android TV is a developer preview and is not yet at complete feature parity with webOS.
- The Android debug APK is intended for sideloaded development testing, not store distribution.
- Production Android release signing is intentionally not included in the repository.

## 0.3.7 - 2026-07-18

- Added menu-level favorites, grouped Favorites, reliable live channel switching, nonintrusive reconnect focus, and Recently Watched Home rows.

## 0.3.0 - 0.3.6

- Added category-scoped catalog loading, virtualized grids, VOD and Series, playback fixes, player controls, themes, settings, and large-provider optimizations.

## 0.1.0 - 0.2.1

- Initial webOS Xtream login, Live TV, Movies, Series, favorites, history, branding, and optional CORS bridge.
