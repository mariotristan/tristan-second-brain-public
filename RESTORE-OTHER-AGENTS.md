# Restoring your setup with other agents and tools

Use this if you can't use Claude Code (outage, account or policy block, new machine without it).
Everything below starts from files in your own private backup of this template. Paths and file names for each tool were correct when written (2026-11): check the tool's docs if something doesn't load.

## 0. What is portable

| Asset | Where | Portable? |
|---|---|---|
| Ways of working, preferences, project facts | `portable/GLOBAL-CONTEXT.md` (generated) | Yes, plain markdown |
| Skills (`SKILL.md` + files) | `claude/skills/` | Mostly: `SKILL.md` with `name`/`description` frontmatter is read by several agents (see below) |
| Claude settings, hooks, permissions | `claude/settings.json` | No. Claude-only; re-create by hand per tool |
| Plugins | `claude/plugins/` | No. Claude-only; the underlying skills/prompts are what matter |

Regenerate the flat context any time (it flattens `claude/memory/`):
```sh
python3 scripts/build-portable-context.py   # writes portable/GLOBAL-CONTEXT.md
```
It is large (~130 KB). For tools with a small instruction budget, copy only the sections you need (working-style/feedback notes are the most valuable), not the whole file.

## 1. Quick start for any agent

1. Put `portable/GLOBAL-CONTEXT.md` in the tool's **global/user** instructions location (table below).
2. Copy `claude/skills/<skill>/` to the tool's skills folder if it supports skills; otherwise paste `SKILL.md` into a rules file or prompt on demand.


## 2. Tool by tool

| Tool | Global instructions | Per-repo instructions | Skills / commands | Notes |
|---|---|---|---|---|
| **OpenAI Codex CLI** | `~/.codex/AGENTS.md` | `AGENTS.md` | `~/.codex/skills/` (same `SKILL.md` format) | Config in `~/.codex/config.toml`. Approval/sandbox modes replace Claude permissions. |
| **Gemini CLI** | `~/.gemini/GEMINI.md` | `GEMINI.md` (or `AGENTS.md` if configured) | Custom commands in `~/.gemini/commands/*.toml`, extensions | Settings in `~/.gemini/settings.json`. Don't restore `oauth_creds.json`; log in again. |
| **GitHub Copilot (VS Code / CLI)** | VS Code user prompts / instructions files | `.github/copilot-instructions.md` and `AGENTS.md`; `.github/instructions/*.instructions.md` | Prompt files in `.github/prompts/*.prompt.md` | Copy `AGENTS.md` content into `copilot-instructions.md` if `AGENTS.md` isn't picked up. |
| **Cursor** | Settings > Rules > User Rules (paste) | `.cursor/rules/*.mdc` (frontmatter `description`, `globs`, `alwaysApply`); `AGENTS.md` also read | Custom commands in `.cursor/commands/` | Paste GLOBAL-CONTEXT sections into User Rules; keep each rule short. |
| **Windsurf** | `~/.codeium/windsurf/memories/global_rules.md` | `.windsurf/rules/*.md` | Workflows in `.windsurf/workflows/` | Rules have a size cap: split by topic. |
| **Cline / Roo Code** | Cline global rules folder, Roo `~/.roo/rules/` | `.clinerules` (file or folder), `.roo/rules/` | Custom modes | Extension settings live in VS Code, not in this repo. |
| **Aider** | `~/.aider.conf.yml` with `read: [~/CONVENTIONS.md]` | `CONVENTIONS.md` loaded via `--read` or config | n/a | Put the working-style part of GLOBAL-CONTEXT in `CONVENTIONS.md`. |
| **Kiro** | `~/.kiro/steering/*.md` | `.kiro/steering/*.md` | Specs in `.kiro/specs/` | Steering files are the equivalent of memory. |
| **Zed AI** | Rules Library | `.rules` (also reads `AGENTS.md`/`CLAUDE.md`) | n/a | |
| **opencode / Amp / other AGENTS.md tools** | `~/.config/opencode/AGENTS.md` (opencode), `~/.config/AGENTS.md` (Amp) | `AGENTS.md` | Tool-specific | `AGENTS.md` is the closest thing to a standard: when in doubt, use it. |
| **Claude on the web / Claude Desktop** | Settings > Profile preferences | Projects > project instructions | Settings > Skills (upload the `claude/skills/` folders as zips) | Works when only Claude Code is unavailable. |
| **ChatGPT / any chat UI** | Paste a trimmed `GLOBAL-CONTEXT.md` as custom instructions or start-of-chat message | n/a | Paste a `SKILL.md` into the chat when needed | No files persist: re-paste each time. |

## 3. Recreating Claude-only behaviours elsewhere

- **Hooks** (`claude/settings.json` > `hooks`): read the commands there and re-create them as git hooks, pre-commit, or the target tool's hook feature.
- **Permissions**: map `permissions.allow` to the tool's allowlist (Codex approval policy, Gemini `tools.allowed`, Cursor auto-run allowlist). Don't copy blindly: they are tuned to your old machine.
- **Plugins**: `superpowers` is just a set of skills (brainstorming, TDD, debugging, plans). Its text lives in the plugin repo (see `claude/plugins/known_marketplaces.json` for the source): copy those skills to the new tool's skills or rules folder.
- **Memory**: other tools have none or less of it. Treat the generated `portable/GLOBAL-CONTEXT.md` as the memory, and append new lessons to it by hand, then rerun the build script into this repo.

## 4. Fresh-machine checklist (no agent yet)

1. Install Homebrew, git, gh; `gh auth login`.
2. Restore your dotfiles and re-add API keys from your password manager.
3. Install the agent(s) you need and follow section 2.
