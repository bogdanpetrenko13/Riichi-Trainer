#!/bin/bash
# Quick preview build without `npm install` (esbuild only), for environments
# where the npm registry is unreachable. React and jszip must be reachable via
# NODE_PATH.
#
#   NODE_PATH=/path/to/node_modules ESBUILD=/path/to/esbuild scripts/preview/build.sh [OUT]
#
# Then serve OUT (default .preview) and open index.html, or run the browser
# tests against it: E2E_DIST=.preview python -m pytest tests/e2e
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${1:-$ROOT/.preview}"
ES="${ESBUILD:-$(command -v esbuild || echo "$ROOT/node_modules/.bin/esbuild")}"
cd "$ROOT"
rm -rf "$OUT" && mkdir -p "$OUT"
"$ES" src/main.tsx --bundle --format=esm --outdir="$OUT" --entry-names=main --jsx=automatic \
  --loader:.js=jsx --loader:.module.css=local-css --loader:.png=file --loader:.svg=file \
  --asset-names=assets/[name]-[hash] --public-path=./ \
  --define:process.env.NODE_ENV='"production"' --define:__APP_VERSION__='"preview"' --log-level=warning
cp public/* "$OUT/"
sed -e 's#<script type="module" src="/src/main.tsx"></script>#<link rel="stylesheet" href="main.css"><script type="module" src="main.js"></script>#' index.html > "$OUT/index.html"
echo "preview built in $OUT"
