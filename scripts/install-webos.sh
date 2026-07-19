#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
DEVICE=${1:-tv1}
IPK=${2:-$(find "$ROOT/dist/webos" -maxdepth 1 -name '*.ipk' -type f | sort | tail -1)}
test -n "$IPK" || { echo "No IPK found" >&2; exit 1; }
ares-launch --device "$DEVICE" --close com.github.xtreamlytv.webos || true
ares-install --device "$DEVICE" "$IPK"
ares-launch --device "$DEVICE" com.github.xtreamlytv.webos
