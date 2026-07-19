# Contributing to XtreamlyTV

Thank you for helping improve an open-source television client.

## Before opening a change

- Search existing issues and pull requests.
- Use only provider accounts and media you are authorized to access.
- Never attach passwords or complete authenticated stream URLs.
- Keep platform-specific behavior behind the relevant app boundary.
- Update shared contracts or design tokens when behavior should remain aligned across platforms.

## Development setup

```bash
npm run prepare:apps
npm run check:webos
npm run test:core
```

Platform guides:

- [LG webOS](docs/development/webos.md)
- [Android TV / Google TV](docs/development/android-tv.md)
- [Debugging](docs/development/debugging.md)

## Generated files

Do not directly edit generated copies in the app directories. Change the canonical source under `packages/` and run:

```bash
npm run prepare:apps
```

## Pull requests

A useful pull request includes:

- Concise problem statement
- Platform(s) affected
- Screenshots or recordings for UI changes
- Test results
- Physical-TV validation when playback, focus, sizing, or codecs are involved
- Migration notes for stored settings or credentials

## Code style

### JavaScript

- ES5-compatible syntax in packaged webOS runtime files unless the supported TV baseline is deliberately raised.
- Avoid large framework runtimes in webOS.
- Handle malformed provider responses defensively.

### Kotlin

- Follow Kotlin official style.
- Prefer immutable UI state and coroutine-based I/O.
- Use Media3 rather than direct platform `MediaPlayer` APIs.
- Keep credentials and authenticated URLs out of logs.

## Legal and content policy

Contributions must not include channel lists, provider credentials, pirated media, bypasses for paid services, or branding/assets without redistribution rights.
