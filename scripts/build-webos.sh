#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT"
npm run prepare:apps
npm run check:webos
mkdir -p dist/webos
ares-package --no-minify -o dist/webos apps/webos/app
