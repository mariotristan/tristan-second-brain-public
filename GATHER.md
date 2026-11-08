# Gathering your brain

`RESTORE-OTHER-AGENTS.md` covers getting your setup back. This page covers the other half: collecting it in the first place.

## What to collect

| Asset | Where it lives (Claude Code) | Collected into | Share publicly? |
|---|---|---|---|
| Skills | `~/.claude/skills/*` (some may be symlinks) | `claude/skills/` | Only ones you wrote and reviewed |
| Memory | `~/.claude/projects/<project>/memory/*.md` | `claude/memory/<project>/` | Rarely: it holds project facts and personal data |
| Settings and hooks | `~/.claude/settings.json` | `claude/settings.json` | Only as an example with placeholders |
| Per-repo instructions | `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` in each repo | `project-instructions/` | Only for repos you own |
| Dotfiles | shell, git and editor config | `dotfiles/` | No (emails, keys, paths) |

Other agents keep the same kinds of things in their own folders: see the table in `RESTORE-OTHER-AGENTS.md` and copy from those locations.

## Never collect

Credentials and tokens, SSH and cloud-CLI config folders, `.env` files, conversation transcripts and caches. Re-authenticate on the new machine.

## The loop

1. **Gather**: `scripts/gather.sh [code-dir]` copies the assets above into this repo and swaps your username out of folder names and settings paths.
2. **Trim**: read `git diff`. Delete memory about organizations, clients and other people. Keep working-style notes and lessons learned.
3. **Check**: `scripts/check-denylist.sh` and `gitleaks detect` must pass. Put private terms in the `EXTRA_DENYLIST` secret.
4. **Flatten**: `python3 scripts/build-portable-context.py` produces the single file other agents can read.
5. **Commit** to a private repo. Gather again whenever your memory has grown.

Use two repos if you also want to publish a template: a private one with everything, and a public one fed from an explicit allowlist, never the reverse.

The `second-brain-gather` skill walks an agent through this loop for you.
