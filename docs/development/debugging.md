# Debugging and diagnostics

## Start with the smallest reproducible scope

Record:

- Platform and device model
- OS/webOS version
- XtreamlyTV version
- Content type: Live, Movie, Series, or Episode
- Category item count
- Stream container, when known
- Whether another app plays the same stream

Do not include provider passwords or complete authenticated stream URLs.

## webOS

```bash
ares-device --system-info --device tv1
ares-inspect --device tv1 --app com.github.xtreamlytv.webos --open
```

Common webOS failure classes:

- API blocked by CORS
- Unsupported video/audio codec
- HLS playlist feature unsupported by the TV generation
- Provider returns a non-array/object-keyed collection
- App attempts to render too many items
- Hardware video surface covered by transformed or opaque HTML

## Android TV

```bash
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release
adb logcat | grep -E "XtreamlyTV|ExoPlayer|MediaCodec"
```

Common Android failure classes:

- TV has not authorized the ADB host
- Provider uses cleartext HTTP blocked by policy
- MediaCodec decoder unavailable for the stream profile
- Emulator media stack differs from physical hardware
- Provider sends an incorrect container extension

## Browser smoke test

```bash
python3 -m pip install -r apps/webos/tests/requirements.txt
python3 -m playwright install chromium
python3 apps/webos/tests/browser_smoke.py
```

The smoke test covers login focus, Home navigation, menu favorites, VOD, Series, player takeover, category virtualization, and a synthetic 55,000-item catalog.

## Issue reports

Use the GitHub bug template. Redact:

- Passwords
- Usernames if personally identifying
- Provider hostnames when the provider prohibits disclosure
- Query parameters containing credentials
