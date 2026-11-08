#!/usr/bin/env bash
# Fail if any tracked file matches scripts/denylist.txt or the optional $EXTRA_DENYLIST
# (newline-separated regexes, kept in a CI secret so private terms never enter the repo).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
patterns=$( { grep -vE '^(#|$)' scripts/denylist.txt; printf '%s\n' "${EXTRA_DENYLIST:-}"; } | grep -v '^$')
if git ls-files -z | grep -zvE '^(scripts/denylist\.txt|scripts/check-denylist\.sh)$' \
   | xargs -0 grep -niE -I -f <(printf '%s\n' "$patterns"); then
  echo "denylist match found" >&2
  exit 1
fi
echo "denylist clean"
