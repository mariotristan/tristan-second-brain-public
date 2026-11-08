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

`gather.sh` also detects Codex, Gemini CLI, Windsurf, Aider, Kiro, opencode and Amp, and collects their global instructions into `agents/<tool>/`. It finds per-repo files for every agent (`AGENTS.md`, `GEMINI.md`, `CONVENTIONS.md`, `.cursor/rules`, `.windsurf/rules`, `.kiro/steering`, Copilot instructions) and keeps their relative paths under `project-instructions/`.

## Never collect

Credentials and tokens, SSH and cloud-CLI config folders, `.env` files, conversation transcripts and caches. Re-authenticate on the new machine.

## The loop

1. **Preview**: `scripts/gather.sh --dry-run` lists every file it would copy, which agents it detected, and which files are flagged (emails, IPs, home paths, your private terms). Nothing is copied.
2. **Gather**: run `scripts/gather.sh`. It asks whether this is a *private* backup or a *public* copy. Private copies everything it finds. Public keeps only skills, skips any flagged one, and lists them in `REVIEW.md`. Your username is swapped out of folder names and settings paths.
3. **Trim**: read `git diff`. Delete memory about organizations, clients and other people. Keep working-style notes and lessons learned.
4. **Check**: `scripts/check-denylist.sh` and `gitleaks detect` must pass. Put private terms in the `EXTRA_DENYLIST` secret.
5. **Flatten**: `python3 scripts/build-portable-context.py` produces the single file other agents can read.
6. **Commit** to a private repo. Gather again whenever your memory has grown.

Use two repos if you also want to publish a template: a private one with everything, and a public one fed from an explicit allowlist, never the reverse.

The `second-brain-gather` skill walks an agent through this loop for you.
