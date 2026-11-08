#!/usr/bin/env bash
# Gather your agent setup into this repo (the capture step; restore is in RESTORE-OTHER-AGENTS.md).
#
# Usage: scripts/gather.sh [--dry-run] [--mode private|public] [--code DIR] [--yes]
#   --dry-run   print what would be copied and what is flagged; copy nothing
#   --mode      private: copy everything found (warn on flagged files)
#               public:  copy only skills, skip any item with a flagged line, write REVIEW.md
#   --code DIR  where your repos live (default $HOME/code)
#   --yes       never prompt (mode defaults to private)
# Detects Claude Code, Codex, Gemini CLI, Windsurf, Aider, Kiro, opencode and Amp, plus per-repo
# instruction files. Never copies credentials, transcripts or caches.
set -euo pipefail
repo=$(cd "$(dirname "$0")/.." && pwd)
dry=0; mode=""; code="$HOME/code"; yes=0
while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) dry=1 ;;
    --mode) mode=${2:?--mode needs private|public}; shift ;;
    --code) code=${2:?--code needs a directory}; shift ;;
    --yes) yes=1 ;;
    -h|--help) sed -n 2,13p "$0"; exit 0 ;;
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

# --- detect what exists -----------------------------------------------------------------------
agents_found=""
note() { agents_found="$agents_found $1"; }
if [ -d "$claude" ]; then
  note claude
  for s in "$claude"/skills/*/; do [ -d "$s" ] && add skill "${s%/}" "claude/skills/$(basename "$s")"; done
  for d in "$claude"/projects/*/memory; do
    [ -d "$d" ] || continue
    n=$(basename "$(dirname "$d")" | sed "s/^-Users-$home_user-/-HOME-/; s/^-home-$home_user-/-HOME-/")
    add memory "$d" "claude/memory/$n"
  done
  add settings "$claude/settings.json" "claude/settings.json"
  add settings "$claude/plugins/installed_plugins.json" "claude/plugins/installed_plugins.json"
fi
[ -d "$HOME/.codex" ]  && { note codex;  add global "$HOME/.codex/AGENTS.md" "agents/codex/AGENTS.md"
                            for s in "$HOME"/.codex/skills/*/; do [ -d "$s" ] && add skill "${s%/}" "agents/codex/skills/$(basename "$s")"; done; }
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
flagged() { [ -s "$pats" ] && grep -rIqiE -f "$pats" "$1" 2>/dev/null; }

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

# --- finish ---------------------------------------------------------------------------------------
if [ "$dry" = 0 ]; then
  [ -f "$repo/claude/settings.json" ] && sed -i.bak "s#$HOME#\$HOME#g" "$repo/claude/settings.json" && rm -f "$repo/claude/settings.json.bak"
  if [ -s "$repo/.gather-review.tmp" ]; then
    { echo "# Needs review"; echo; echo "Skipped because they contain flagged content. Clean the source, then run gather again."; echo; cat "$repo/.gather-review.tmp"; } > "$repo/REVIEW.md"
  else rm -f "$repo/REVIEW.md"; fi
fi
rm -f "$repo/.gather-review.tmp"
echo
echo "agents detected:${agents_found:- none}"
echo "mode: $mode$([ "$dry" = 1 ] && echo ' (dry run, nothing copied)')"
echo "would copy/copied: $copied, skipped: $skipped, flagged: $flags"
[ "$dry" = 1 ] || echo "Next: read the diff, then run scripts/check-denylist.sh before you commit."
