#!/usr/bin/env bash
# Regression test for gather.sh against a fake home folder. Run: scripts/test-gather.sh
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
t=$(mktemp -d); trap 'rm -rf "$t"' EXIT
U=$t/home; mkdir -p "$U/.claude/skills/clean" "$U/.claude/projects/-Users-u-code-app/memory" "$U/code/app" "$t/outside/leaky" "$U/.claude/skills/pack/inner" "$U/.agents/skills/shared"
echo s > "$U/.claude/skills/clean/SKILL.md"
echo s > "$U/.claude/skills/pack/inner/SKILL.md"
echo s > "$U/.agents/skills/shared/SKILL.md"
echo "contact: someone@example.com" > "$t/outside/leaky/SKILL.md"
ln -s "$t/outside/leaky" "$U/.claude/skills/leaky"          # symlinked skill must still be scanned
echo m > "$U/.claude/projects/-Users-u-code-app/memory/a.md"; echo i > "$U/code/app/AGENTS.md"
mkdir "$t/repo"; cp -R "$here" "$t/repo/scripts"
fail() { echo "FAIL: $1" >&2; exit 1; }
run() { (cd "$t/repo" && HOME=$U scripts/gather.sh "$@" 2>&1); }

out=$(run --dry-run --yes)
echo "$out" | grep -q 'leaky.*\[FLAGGED\]' || fail "symlinked skill with an email was not flagged"
echo "$out" | grep -q 'pack/inner' || fail "skill container was not expanded"
echo "$out" | grep -q 'shared' || fail "shared agents skills not detected"
[ ! -d "$t/repo/claude" ] || fail "dry run copied files"

run --mode public >/dev/null
[ -f "$t/repo/claude/skills/clean/SKILL.md" ] || fail "public mode dropped a clean skill"
[ ! -e "$t/repo/claude/skills/leaky" ] || fail "public mode copied a flagged skill"
grep -q leaky "$t/repo/REVIEW.md" || fail "REVIEW.md missing the flagged skill"
[ ! -e "$t/repo/claude/memory" ] || fail "public mode copied memory"

rm -rf "$t/repo/claude" "$t/repo/agents" "$t/repo/REVIEW.md" "$t/repo/manifest.tsv"
run --yes >/dev/null; [ -f "$t/repo/manifest.tsv" ] || fail "manifest not written"
echo changed > "$U/.claude/skills/clean/SKILL.md"; echo new > "$U/.claude/skills/clean/extra.md"
out=$(run --yes)
echo "$out" | grep -q '~ claude/skills/clean/SKILL.md' || fail "changed file not reported"
echo "$out" | grep -q '+ claude/skills/clean/extra.md' || fail "new file not reported"
echo "gather tests passed"
