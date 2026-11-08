<p align="center">
  <img src="assets/logo.svg" alt="Second Brain logo" width="860">
</p>

# second-brain template

A template for backing up and restoring your AI-agent setup (skills, memory, settings), and for bootstrapping other agents from it.

## Second brain vs RAG

RAG retrieves passages from a large document set to answer a question. A second brain is a small, curated set of instructions, memory and skills that shapes how an agent behaves. It is plain markdown you own, loaded as context, and it works in any agent. They complement each other: keep conventions and decisions here, and use RAG for large reference material. A comparison table is on the project site.

## What is here

| Path | Purpose |
|---|---|
| `GATHER.md` | How to collect your setup in the first place, and what never to collect |
| `scripts/gather.sh` | Detects your agents and copies their skills, memory, settings and repo instructions (`--dry-run`, `--mode private|public`) |
| `RESTORE-OTHER-AGENTS.md` | Where each agent (Codex, Gemini CLI, Cursor, ...) reads global and per-repo instructions |
| `scripts/build-portable-context.py` | Flattens a `claude/memory/` folder into one agent-agnostic markdown file |
| `scripts/make-logo.py` | Generates the logo |
| `examples/settings.example.json` | Claude Code settings showing permission and hook patterns, with placeholders |
| `claude/skills/kb` | Example skill: write a KB article after a debugging session |
| `claude/skills/second-brain-gather` | Skill that walks an agent through gathering, trimming and checking |

## Use it

1. Fork or copy this repo into a **private** repo of your own.
2. Run `scripts/gather.sh --dry-run`, then `scripts/gather.sh` to copy your own skills, memory and settings into `claude/` (see `GATHER.md`).
3. Run `python3 scripts/build-portable-context.py` to produce a portable context file.
4. Follow `RESTORE-OTHER-AGENTS.md` for the agent you want to restore into.

Keep real memory, emails, paths, account IDs and secrets out of any public copy.

## License

MIT, see `LICENSE`.

## Guardrails

- `.github/workflows/guardrails.yml` runs `gitleaks` and `scripts/check-denylist.sh` on every push and PR.
- `.pre-commit-config.yaml` runs the same checks locally (`pre-commit install`).
- Put private terms (organization, client, project names) in the `EXTRA_DENYLIST` repository secret, one regex per line, so they are enforced without being written in the repo.
