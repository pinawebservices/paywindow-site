#!/usr/bin/env bash
# Generates the web-ready images the landing page serves.
#
#   Screenshots: assets/screenshots/src/<name>.png (1284x2778, iPhone 14 Plus)
#             -> assets/screenshots/<name>-<VERSION>-{540,800}.webp
#   App icon:    assets/app-icon.png (1024x1024)
#             -> assets/app-icon-64.png, assets/favicon-32.png, assets/apple-touch-icon.png
#
# When you replace screenshots, bump VERSION so browsers and the CDN fetch the
# new files instead of a cached copy, then update the -vN names in index.html.
#
# Usage: ./scripts/optimize-images.sh   (run from the website/ folder)
set -euo pipefail

VERSION="v2"
WIDTHS=(540 800)
QUALITY=82

cd "$(dirname "$0")/.."
SHARP=(npx --yes sharp-cli@6.1.0)

shopt -s nullglob
srcs=(assets/screenshots/src/*.png)
if [ ${#srcs[@]} -eq 0 ]; then
  echo "No screenshots found in assets/screenshots/src/" >&2
  exit 1
fi

for src in "${srcs[@]}"; do
  name=$(basename "$src" .png)
  for w in "${WIDTHS[@]}"; do
    out="assets/screenshots/${name}-${VERSION}-${w}.webp"
    "${SHARP[@]}" -i "$src" -o "$out" --format webp --quality "$QUALITY" resize "$w" >/dev/null
    echo "$out"
  done
done

icon=assets/app-icon.png
"${SHARP[@]}" -i "$icon" -o assets/app-icon-64.png       --format png resize 64  >/dev/null && echo assets/app-icon-64.png
"${SHARP[@]}" -i "$icon" -o assets/favicon-32.png        --format png resize 32  >/dev/null && echo assets/favicon-32.png
"${SHARP[@]}" -i "$icon" -o assets/apple-touch-icon.png  --format png resize 180 >/dev/null && echo assets/apple-touch-icon.png
