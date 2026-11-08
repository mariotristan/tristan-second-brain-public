#!/usr/bin/env bash
# Download the second-brain template into a new folder. No git or GitHub login needed.
# Usage: curl -fsSL https://github.com/mariotristan/tristan-second-brain-public/raw/main/install.sh | bash
#        (optional folder name: ... | bash -s -- my-brain)
set -euo pipefail
dest=${1:-second-brain}
[ ! -e "$dest" ] || [ -z "$(ls -A "$dest" 2>/dev/null)" ] || { echo "$dest already exists and is not empty" >&2; exit 1; }
command -v unzip >/dev/null 2>&1 || { echo "unzip is required" >&2; exit 1; }
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
curl -fsSL "https://github.com/mariotristan/tristan-second-brain-public/archive/refs/heads/main.zip" -o "$tmp/brain.zip"
unzip -q "$tmp/brain.zip" -d "$tmp"
mkdir -p "$dest"
cp -R "$tmp"/*/. "$dest/"
chmod +x "$dest"/scripts/*.sh
cat <<MSG

Template ready in ./$dest

Next:
  cd $dest
  scripts/gather.sh --dry-run     # preview what would be collected, nothing is copied
  scripts/gather.sh               # collect it (asks: private backup or public copy)

Keep the result in a PRIVATE repo. See GATHER.md for the full guide.
MSG
