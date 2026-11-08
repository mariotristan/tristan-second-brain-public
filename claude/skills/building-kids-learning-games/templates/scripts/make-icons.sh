#!/usr/bin/env bash
# Regenerates the app icons in icons/: the Fluent 3D lion on a warm orange glow.
# macOS dev-only (Google Chrome + sips). Run from the repo root: bash scripts/make-icons.sh
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# The lion stays inside the central safe zone so iPad/Android masks never clip it.
cat > "$TMP/icon.html" <<HTML
<!doctype html><html><body style="margin:0">
<div style="width:1024px;height:1024px;display:grid;place-items:center;
            background:radial-gradient(circle at 30% 25%, #ffd27a, #ff8c42 70%)">
  <img src="file://$PWD/art/animals/lion.webp" style="width:50%;height:auto">
</div>
</body></html>
HTML

"$CHROME" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
  --window-size=1024,1024 --screenshot="$TMP/icon-1024.png" "file://$TMP/icon.html" >/dev/null 2>&1

for size in 512 192 180; do
  sips -z "$size" "$size" "$TMP/icon-1024.png" --out "icons/icon-$size.png" >/dev/null
done
echo "Wrote icons/icon-512.png, icons/icon-192.png, icons/icon-180.png"
