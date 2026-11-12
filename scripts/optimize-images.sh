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

# Worksheet preview + social image, rendered from the real PDF (macOS Quick Look renders PDFs at high res).
pdf=downloads/paywindow-budget-worksheet.pdf
if [ -f "$pdf" ]; then
  tmp=$(mktemp -d)
  qlmanage -t -s 2000 -o "$tmp" "$pdf" >/dev/null 2>&1
  page="$tmp/$(basename "$pdf").png"
  mkdir -p assets/worksheet
  for w in 600 1000; do
    "${SHARP[@]}" -i "$page" -o "assets/worksheet/preview-${w}.webp" --format webp --quality 85 resize "$w" >/dev/null
    echo "assets/worksheet/preview-${w}.webp"
  done
  # 1200x630 Open Graph image: worksheet centred on the site's paper background
  "${SHARP[@]}" -i "$page" -o "$tmp/og-sheet.png" resize 440 570 --fit inside >/dev/null
  "${SHARP[@]}" -i assets/paper-texture.webp -o "$tmp/og-bg.png" --format png resize 1200 630 --fit cover >/dev/null
  "${SHARP[@]}" -i "$tmp/og-bg.png" -o assets/worksheet/og.jpg --format jpeg --quality 85 composite "$tmp/og-sheet.png" --gravity centre >/dev/null
  echo assets/worksheet/og.jpg
  rm -rf "$tmp"
fi

icon=assets/app-icon.png
"${SHARP[@]}" -i "$icon" -o assets/app-icon-64.png       --format png resize 64  >/dev/null && echo assets/app-icon-64.png
"${SHARP[@]}" -i "$icon" -o assets/favicon-32.png        --format png resize 32  >/dev/null && echo assets/favicon-32.png
"${SHARP[@]}" -i "$icon" -o assets/apple-touch-icon.png  --format png resize 180 >/dev/null && echo assets/apple-touch-icon.png
