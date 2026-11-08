#!/usr/bin/env bash
# Gather your agent setup into this repo (the capture step; restore is in RESTORE-OTHER-AGENTS.md).
# Usage: scripts/gather.sh [code-dir]     code-dir defaults to $HOME/code
# Copies skills, memory, settings and per-repo instruction files. Never copies credentials,
# transcripts or caches. Review `git diff` and run scripts/check-denylist.sh before every push.
set -euo pipefail
repo=$(cd "$(dirname "$0")/.." && pwd)
claude=${CLAUDE_HOME:-$HOME/.claude}
code=${1:-$HOME/code}
user=$(basename "$HOME")

mkdir -p "$repo/claude/skills" "$repo/claude/memory" "$repo/project-instructions"

# Skills: dereference symlinks, skip hidden files.
if [ -d "$claude/skills" ]; then
  for s in "$claude"/skills/*/; do
    [ -d "$s" ] || continue
    rsync -aL --exclude '.*' "$s" "$repo/claude/skills/$(basename "$s")/"
  done
fi

# Memory: one folder per project. The folder name encodes your home path, so swap the username out.
for d in "$claude"/projects/*/memory; do
  [ -d "$d" ] || continue
  name=$(basename "$(dirname "$d")" | sed "s/^-Users-$user-/-HOME-/; s/^-home-$user-/-HOME-/")
  mkdir -p "$repo/claude/memory/$name"
  cp "$d"/*.md "$repo/claude/memory/$name/" 2>/dev/null || true
done

# Settings: copied as a starting point only. Strip absolute paths and URLs by hand before committing.
[ -f "$claude/settings.json" ] && cp "$claude/settings.json" "$repo/claude/settings.json"
[ -f "$claude/plugins/installed_plugins.json" ] && { mkdir -p "$repo/claude/plugins"; cp "$claude/plugins/installed_plugins.json" "$repo/claude/plugins/"; }

# Per-repo instructions, same relative paths under your code dir.
if [ -d "$code" ]; then
  (cd "$code" && find . -maxdepth 4 \( -name node_modules -o -name .git \) -prune -o \
     -type f \( -name CLAUDE.md -o -name AGENTS.md -o -name GEMINI.md \) -print) |
  while IFS= read -r f; do
    mkdir -p "$repo/project-instructions/$(dirname "$f")"
    cp "$code/$f" "$repo/project-instructions/$f"
  done
fi

sed -i.bak "s#$HOME#\$HOME#g" "$repo/claude/settings.json" 2>/dev/null && rm -f "$repo/claude/settings.json.bak" || true
echo "gathered into $repo. Next: review the diff, trim what should not be shared, then run scripts/check-denylist.sh"
