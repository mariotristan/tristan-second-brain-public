#!/usr/bin/env bash
# Gather your agent setup into this repo (the capture step; restore is in RESTORE-OTHER-AGENTS.md).
#
# Usage: scripts/gather.sh [--dry-run] [--mode private|public] [--code DIR] [--yes]
#   --dry-run   print what would be copied and what is flagged; copy nothing
#   --mode      private: copy everything found (warn on flagged files)
#               public:  copy only skills, skip any item with a flagged line, write REVIEW.md
#   --code DIR  where your repos live (default $HOME/code)
#   --yes       never prompt (mode defaults to private)
# Detects Claude Code, Codex, Gemini CLI, Cursor, Copilot, Windsurf, Aider, Kiro, opencode, Amp and
# the shared ~/.agents skills folder, plus per-repo
# instruction files. Copilot's folder holds chat databases, so only its instruction file is taken.
# Never copies credentials, transcripts or caches.
set -euo pipefail
repo=$(cd "$(dirname "$0")/.." && pwd)
dry=0; mode=""; code="$HOME/code"; yes=0
while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) dry=1 ;;
    --mode) mode=${2:?--mode needs private|public}; shift ;;
    --code) code=${2:?--code needs a directory}; shift ;;
    --yes) yes=1 ;;
    -h|--help) sed -n 2,16p "$0"; exit 0 ;;
    *) code=$1 ;;  # backwards compatible: a bare argument is the code dir
  esac
  shift
done
if [ -z "$mode" ]; then
  if [ "$yes" = 1 ] || [ ! -t 0 ]; then mode=private
  else
    printf 'Is this repo a private backup or a public copy? [private/public] (private): '
    read -r mode; mode=${mode:-private}
  fi
fi
case "$mode" in private|public) ;; *) echo "mode must be private or public" >&2; exit 1 ;; esac

home_user=$(basename "$HOME")
claude=${CLAUDE_HOME:-$HOME/.claude}
plan=$(mktemp); trap 'rm -f "$plan"' EXIT
# plan lines: kind|source|destination (relative to the repo)
add() { [ -e "$2" ] && printf '%s|%s|%s\n' "$1" "$2" "$3" >> "$plan" || true; }

# Add every skill under a folder. A child without SKILL.md that holds skill folders is a container: expand it.
add_skills() {
  local base=$1 destbase=$2 s c
  for s in "$base"/*/; do
    [ -d "$s" ] || continue; s=${s%/}
    if [ -f "$s/SKILL.md" ]; then add skill "$s" "$destbase/$(basename "$s")"
    else for c in "$s"/*/; do if [ -f "${c%/}/SKILL.md" ]; then add skill "${c%/}" "$destbase/$(basename "$s")/$(basename "$c")"; fi; done; fi
  done
  return 0
}

# --- detect what exists -----------------------------------------------------------------------
agents_found=""
note() { agents_found="$agents_found $1"; }
if [ -d "$claude" ]; then
  note claude
  add_skills "$claude/skills" "claude/skills"
  for d in "$claude"/projects/*/memory; do
    [ -d "$d" ] || continue
    n=$(basename "$(dirname "$d")" | sed "s/^-Users-$home_user-/-HOME-/; s/^-home-$home_user-/-HOME-/")
    add memory "$d" "claude/memory/$n"
  done
  add settings "$claude/settings.json" "claude/settings.json"
  add settings "$claude/plugins/installed_plugins.json" "claude/plugins/installed_plugins.json"
fi
[ -d "$HOME/.codex" ]  && { note codex;  add global "$HOME/.codex/AGENTS.md" "agents/codex/AGENTS.md"
                            add_skills "$HOME/.codex/skills" "agents/codex/skills"; }
[ -d "$HOME/.agents/skills" ] && { note shared-agents; add_skills "$HOME/.agents/skills" "agents/shared/skills"; }
[ -d "$HOME/.cursor" ] && { note cursor; add global "$HOME/.cursor/rules" "agents/cursor/rules"; add global "$HOME/.cursor/commands" "agents/cursor/commands"; }
[ -f "$HOME/.copilot/copilot-instructions.md" ] && { note copilot; add global "$HOME/.copilot/copilot-instructions.md" "agents/copilot/copilot-instructions.md"; }
[ -d "$HOME/.gemini" ] && { note gemini; add global "$HOME/.gemini/GEMINI.md" "agents/gemini/GEMINI.md"
                            add global "$HOME/.gemini/commands" "agents/gemini/commands"; }
[ -d "$HOME/.codeium/windsurf" ] && { note windsurf; add global "$HOME/.codeium/windsurf/memories/global_rules.md" "agents/windsurf/global_rules.md"; }
[ -f "$HOME/.aider.conf.yml" ] && { note aider; add global "$HOME/.aider.conf.yml" "agents/aider/aider.conf.yml"; add global "$HOME/CONVENTIONS.md" "agents/aider/CONVENTIONS.md"; }
[ -d "$HOME/.kiro" ]   && { note kiro;   add global "$HOME/.kiro/steering" "agents/kiro/steering"; }
[ -f "$HOME/.config/opencode/AGENTS.md" ] && { note opencode; add global "$HOME/.config/opencode/AGENTS.md" "agents/opencode/AGENTS.md"; }
[ -f "$HOME/.config/AGENTS.md" ] && { note amp; add global "$HOME/.config/AGENTS.md" "agents/amp/AGENTS.md"; }

# Per-repo instruction files for every agent, under the code dir.
if [ -d "$code" ]; then
  while IFS= read -r f; do
    f=${f#./}; add repo "$code/$f" "project-instructions/$f"
  done < <(cd "$code" && find . -maxdepth 5 \( -name node_modules -o -name .git \) -prune -o -type f \
      \( -name CLAUDE.md -o -name AGENTS.md -o -name GEMINI.md -o -name CONVENTIONS.md -o -name .clinerules \
         -o -name .rules -o -name copilot-instructions.md -o -path '*/.cursor/rules/*.mdc' \
         -o -path '*/.windsurf/rules/*.md' -o -path '*/.kiro/steering/*.md' \) -print)
fi

# --- scan for risky content (patterns come from scripts/denylist.txt and $EXTRA_DENYLIST) -----
pats=$(mktemp); trap 'rm -f "$plan" "$pats"' EXIT
{ grep -vE '^(#|$)' "$repo/scripts/denylist.txt"; printf '%s\n' "${EXTRA_DENYLIST:-}"; } | grep -v '^$' > "$pats" || true
# BSD grep needs -S to follow symlinks (many skills are symlinks); GNU grep follows them with -R alone.
if echo x | grep -S x >/dev/null 2>&1; then gflags=-RSIliE; else gflags=-RIliE; fi
flagged() { [ -s "$pats" ] && [ -n "$(grep $gflags -f "$pats" "$1" 2>/dev/null | head -n 1)" ]; }

copied=0; skipped=0; flags=0
: > "$repo/.gather-review.tmp"
while IFS='|' read -r kind src dest; do
  flag=""; flagged "$src" && { flag=" [FLAGGED]"; flags=$((flags+1)); }
  action=copy
  if [ "$mode" = public ]; then
    case "$kind" in skill) ;; *) action="skip (public mode keeps skills only)" ;; esac
    [ -n "$flag" ] && [ "$kind" = skill ] && action="skip (flagged, needs your review)"
  fi
  printf '%-9s %-40s %s%s\n' "$kind" "$(echo "$src" | sed "s#$HOME#~#")" "$action" "$flag"
  case "$action" in
    copy)
      copied=$((copied+1))
      if [ "$dry" = 0 ]; then
        mkdir -p "$repo/$(dirname "$dest")"
        if [ -d "$src" ]; then mkdir -p "$repo/$dest"; rsync -aL --exclude '.*' "$src/" "$repo/$dest/"
        else cp "$src" "$repo/$dest"; fi
      fi ;;
    *) skipped=$((skipped+1)); [ -n "$flag" ] && echo "- $(echo "$src" | sed "s#$HOME#~#") ($kind)" >> "$repo/.gather-review.tmp" ;;
  esac
done < "$plan"

# --- manifest: what changed since the last gather ---------------------------------------------
sha() { if command -v shasum >/dev/null 2>&1; then shasum -a 256 "$1" | cut -d' ' -f1; else sha256sum "$1" | cut -d' ' -f1; fi; }
write_manifest() {  # $1 = output file
  (cd "$repo" && for d in claude agents project-instructions; do if [ -d "$d" ]; then find "$d" -type f ! -name '.*' -print; fi; done | LC_ALL=C sort |
    while IFS= read -r f; do printf '%s\t%s\n' "$f" "$(sha "$f")"; done) > "$1"
}
report_changes() {  # $1 = previous manifest, $2 = new manifest
  local n=0
  echo "changes since last gather:"
  LC_ALL=C join -t "$(printf '\t')" -a1 -a2 -e MISSING -o 0,1.2,2.2 "$1" "$2" | while IFS="$(printf '\t')" read -r f old new; do
    if [ "$old" = MISSING ]; then echo "  + $f"; elif [ "$new" = MISSING ]; then echo "  - $f"; elif [ "$old" != "$new" ]; then echo "  ~ $f"; fi
  done | tee "$repo/.gather-changes.tmp" | head -n 40
  n=$(wc -l < "$repo/.gather-changes.tmp"); rm -f "$repo/.gather-changes.tmp"
  [ "$n" -gt 0 ] || echo "  none"
  [ "$n" -le 40 ] || echo "  ... and $((n-40)) more"
}
prev=$(mktemp); trap 'rm -f "$plan" "$pats" "$prev"' EXIT
[ -f "$repo/manifest.tsv" ] && cp "$repo/manifest.tsv" "$prev" || : > "$prev"

# --- finish ---------------------------------------------------------------------------------------
if [ "$dry" = 0 ]; then
  [ -f "$repo/claude/settings.json" ] && sed -i.bak "s#$HOME#\$HOME#g" "$repo/claude/settings.json" && rm -f "$repo/claude/settings.json.bak"
  if [ -s "$repo/.gather-review.tmp" ]; then
    { echo "# Needs review"; echo; echo "Skipped because they contain flagged content. Clean the source, then run gather again."; echo; cat "$repo/.gather-review.tmp"; } > "$repo/REVIEW.md"
  else rm -f "$repo/REVIEW.md"; fi
fi
rm -f "$repo/.gather-review.tmp"
if [ "$dry" = 0 ]; then
  new=$(mktemp); write_manifest "$new"
  [ -s "$prev" ] && report_changes "$prev" "$new" || echo "first gather: manifest.tsv created"
  mv "$new" "$repo/manifest.tsv"
fi
echo
echo "agents detected:${agents_found:- none}"
echo "mode: $mode$([ "$dry" = 1 ] && echo ' (dry run, nothing copied)')"
echo "would copy/copied: $copied, skipped: $skipped, flagged: $flags"
[ "$dry" = 1 ] || echo "Next: read the diff, then run scripts/check-denylist.sh before you commit."
