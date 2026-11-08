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

## Three ways to gather

1. **Ask your agent (recommended).** Copy `claude/skills/second-brain-gather` into `~/.claude/skills/` (other agents: copy its `SKILL.md` into their skills or rules folder), then say: "Back up my agent setup into my second-brain repo. It's a private backup." The skill asks private or public, shows a dry run, reads what it collected, runs the checks and commits.
2. **Run the script.** `curl -fsSL https://github.com/mariotristan/tristan-second-brain-public/raw/main/install.sh | bash`, then `scripts/gather.sh --dry-run`, then `scripts/gather.sh`. Read `install.sh` first if you prefer; it is about twenty lines.
3. **Copy by hand.** Use the table at the top of this page.

## Options

| Option | What it does | Default |
|---|---|---|
| `--dry-run` | Print the plan and flagged files; copy nothing | off |
| `--mode private\|public` | `private` copies everything found; `public` keeps only clean skills and lists the rest in `REVIEW.md` | asks |
| `--code DIR` | Folder searched for per-repo instruction files | `~/code` |
| `--yes` | Never prompt | off |

## Files it writes

- `manifest.tsv`: every collected file with its hash. The next gather prints what is new (`+`), changed (`~`) or gone (`-`).
- `REVIEW.md`: in public mode, items skipped because they were flagged.

## Questions

- **It flagged a file.** Remove the private data at the source and gather again. In a private backup you may keep flagged files; in a public copy they are skipped. Add your own sensitive words to the `EXTRA_DENYLIST` secret.
- **It found nothing for my tool.** Some tools keep settings in an app database. Copy those rules by hand into `agents/<tool>/`. If your repos are not in `~/code`, pass `--code`.
- **Windows.** Use WSL or Git Bash.
- **Where do I keep the result?** In a private repo.
- **Tests.** `scripts/test-gather.sh` checks the script against a fake home folder and runs in CI.
