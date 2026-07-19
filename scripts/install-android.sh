#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
DEVICE=${1:-}
APK=${2:-$ROOT/apps/android-tv/app/build/outputs/apk/debug/app-debug.apk}
if [ -n "$DEVICE" ]; then adb connect "$DEVICE"; fi
adb install -r "$APK"
adb shell monkey -p com.github.xtreamlytv.androidtv 1
