#!/usr/bin/env bash
# Downloads the Fluent Emoji 3D artwork (MIT, Microsoft) and converts it to WebP.
# Dev-only: needs curl and cwebp (brew install webp). Run from the repo root:
#   bash scripts/fetch-art.sh
set -euo pipefail

BASE="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir -p art/animals art/zones

# kind|game id|Fluent asset name
MAP="
animals|lion|Lion
animals|elephant|Elephant
animals|zebra|Zebra
animals|hippo|Hippopotamus
animals|rhino|Rhinoceros
animals|giraffe|Giraffe
animals|monkey|Monkey
animals|gorilla|Gorilla
animals|parrot|Parrot
animals|tiger|Tiger
animals|snake|Snake
animals|frog|Frog
animals|dolphin|Dolphin
animals|whale|Spouting whale
animals|sea-lion|Seal
animals|shark|Shark
animals|octopus|Octopus
animals|sea-turtle|Turtle
animals|polar-bear|Polar bear
animals|penguin|Penguin
animals|arctic-wolf|Wolf
animals|arctic-fox|Fox
animals|reindeer|Deer
animals|snowy-owl|Owl
animals|cow|Cow
animals|pig|Pig
animals|sheep|Ewe
animals|horse|Horse
animals|chicken|Chicken
animals|duck|Duck
animals|bear|Bear
animals|raccoon|Raccoon
animals|squirrel|Chipmunk
animals|beaver|Beaver
animals|bee|Honeybee
animals|wild-turkey|Turkey
zones|savanna|Sheaf of rice
zones|jungle|Palm tree
zones|ocean|Water wave
zones|polar|Snowflake
zones|farm|Tractor
zones|forest|Evergreen tree
"

echo "$MAP" | while IFS='|' read -r kind id name; do
  [ -z "$kind" ] && continue
  folder=$(printf '%s' "$name" | sed 's/ /%20/g')
  file=$(printf '%s' "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '_')
  curl -sSfL --retry 3 -o "$TMP/$id.png" "$BASE/assets/$folder/3D/${file}_3d.png"
  cwebp -quiet -q 80 -resize 256 256 "$TMP/$id.png" -o "art/$kind/$id.webp"
  echo "art/$kind/$id.webp $(wc -c < "art/$kind/$id.webp" | tr -d ' ') bytes"
done

curl -sSfL --retry 3 -o art/LICENSE-fluentui-emoji.txt "$BASE/LICENSE"
echo "Wrote art/LICENSE-fluentui-emoji.txt"
