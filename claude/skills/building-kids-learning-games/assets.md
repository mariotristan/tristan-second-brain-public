# Asset pipelines (dev-only tools: curl, python3, ffmpeg, cwebp, Chrome, sips)

`brew install ffmpeg webp`. None of these tools ship with the game.

## Sounds (real recordings)

1. **Search Wikimedia Commons** (file namespace, audio only):
```bash
curl -s "https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srlimit=20&srsearch=lion%20roar%20filetype:audio" \
  | python3 -c 'import json,sys; [print(r["title"]) for r in json.load(sys.stdin)["query"]["search"]]'
```
2. **Check license, author, and URLs** of a candidate:
```bash
curl -s "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&titles=File:EXAMPLE.ogg" \
  | python3 -c 'import json,sys; p=list(json.load(sys.stdin)["query"]["pages"].values())[0]; i=p["imageinfo"][0]; m=i["extmetadata"]; print(i["url"]); print(i["descriptionurl"]); [print(k, "=", m.get(k,{}).get("value")) for k in ("LicenseShortName","LicenseUrl","Artist","ObjectName")]'
```
   - Accept only Public domain / CC0 / CC BY x / CC BY-SA x. Prefer them in that order. Strip HTML from `Artist`.
   - Other sources: freesound.org CC0 clips (download needs a login), and US government recordings (NPS/USFWS, public domain).
   - You can't listen to clips, so prefer titles that name the species and the call ("Cow mooing.ogg").
3. **Download, trim, normalize** (2–5 s, mono, 64 kbps, <60 KB):
```bash
curl -sL -A "<game>/1.0 (<your-email>)" -o /tmp/raw/lion.src "UPLOAD_URL"
ffmpeg -i /tmp/raw/lion.src -af silencedetect=n=-35dB:d=0.3 -f null - 2>&1 | grep silence_end  # find the loud part
ffmpeg -y -v error -i /tmp/raw/lion.src -ss START -t 4 -ac 1 -ar 44100 \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.05,areverse,afade=t=in:d=0.4,areverse" \
  -b:a 64k sounds/lion.mp3
```
4. **Credit it** in `js/data/credits.js`: `{ file, <item>, title, author, source, license, licenseUrl }`. Then run
   `node scripts/credits-md.js`. `tests/sounds.test.js` enforces size, length, one credit per clip, and allowed licenses.

## Subject art: Fluent Emoji 3D

- Source path: `microsoft/fluentui-emoji/main/assets/<Name>/3D/<name>_3d.png` (256 px).
- `templates/scripts/fetch-art.sh` holds a `kind|id|Fluent Name` map. It converts each file to WebP
  (`cwebp -q 80 -resize 256 256`, each under 30 KB) and saves the license to `art/LICENSE-fluentui-emoji.txt`.
- Not every emoji exists. Pick the closest asset (whale → "Spouting whale", squirrel → "Chipmunk") and note the swap in the PR.
- Images are decorative (`alt=""`); the button around each image carries the localized `aria-label`.

## Button icons: Phosphor

- `templates/scripts/build-icons.js` maps game icon name → `[weight, file]`. It fetches the icons from jsDelivr
  (`@phosphor-icons/core`, version pinned) and writes `js/icons-data.js` plus `art/LICENSE-phosphor-icons.txt`.
- `icon(name)` renders inline SVG with `currentColor`, so the icon takes the button's text color.
- Use the fill weight. 3D emoji on small buttons look muddy.

## App icon

`templates/scripts/make-icons.sh` uses headless Chrome to screenshot a 1024 px HTML square (the radial
gradient plus the hero WebP at ~50% width, inside the maskable safe zone). `sips` then outputs 512, 192 and 180 px.
The manifest lists 192, 512 and 512-maskable. `index.html` uses the 180 px icon as `apple-touch-icon` and the 192 px as the favicon.

## Bruno and scenery

- Copy `templates/js/bruno.js` and change the costume to fit the theme (zookeeper → astronaut → paleontologist).
  Keep the `.bruno-wave` / `.bruno-eyes` classes so the CSS animations still work.
- Scenery: one SVG per zone in `js/scenery.js`. Put the detail at the screen edges (layers pinned to each edge)
  so the middle stays calm behind the buttons. No animation.
