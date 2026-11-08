---
name: second-brain-gather
description: Use when the user wants to back up, update or audit their AI-agent setup (skills, memory, settings, per-repo instructions) into their second-brain repo, or asks what to include or redact before sharing it.
---

# Gather the second brain

Collect the user's agent setup into their second-brain repo safely. Never publish or change repo visibility without an explicit instruction.

## Steps

1. Confirm the current repo has `scripts/gather.sh`. If not, tell the user to start from the template.
2. Ask whether the repo is a private backup or a public copy. Run `scripts/gather.sh --dry-run --mode <mode>` first (add `--code DIR` if their repos are not in `~/code`) and show the user the plan and flagged files. Run it for real once they agree.
3. If `REVIEW.md` exists, those items were skipped as flagged: help the user clean the source, then gather again. Read `git diff --stat`, then read every new or changed memory, settings and instruction file. Flag, do not silently keep:
   - Organization, client or colleague names and project state
   - Emails, IP addresses, account or tenant IDs, absolute home paths, internal URLs
   - Personal notes (interviews, finances, health, family)
4. For a **private backup** keep everything except credentials. For a **public copy** keep only generic working-style and feedback notes and skills the user wrote; propose deletions and let the user confirm.
5. Run `scripts/check-denylist.sh` and `gitleaks detect --no-git`. Fix hits at the source; never weaken the denylist to pass.
6. Run `python3 scripts/build-portable-context.py` and report file counts and anything left out and why.
7. Commit with a plain message. Push only to a private repo unless the user says otherwise.

## Rules

- Credentials, SSH and cloud-CLI folders, `.env` files and transcripts are never collected.
- Memory is the highest-risk asset: treat it as private unless the user has reviewed that file.
- If unsure whether something is safe to share, leave it out and ask.
