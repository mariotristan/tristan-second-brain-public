---
name: kb
description: Use at the end of a debugging or troubleshooting session to generate, commit, and push a KB article to the KB/ folder of the current repository.
---

# KB — Knowledge Base Document Generator

Use this skill at the end of a debugging or troubleshooting session to automatically generate, commit, and push a KB article to the `KB/` folder of the current repository.

## When to use

Invoke `/kb` after resolving any of the following:
- Azure/GCP/AWS permission or RBAC errors
- Fabric, Databricks, or pipeline failures
- Infrastructure or configuration issues
- Any debugging session worth documenting for the team

## What this skill does

1. Summarizes the session: problem, root cause, fix, and pattern
2. Creates a markdown file in `KB/` with a descriptive slug filename
3. Commits and pushes to the current branch

## Instructions

When this skill is invoked, do the following — no clarifying questions, execute directly:

1. **Review the conversation** to identify:
   - The error or symptom the user started with
   - The root cause discovered
   - The fix applied
   - Any reusable pattern or command for future reference

2. **Generate the KB filename** using a descriptive kebab-case slug that identifies the problem (e.g., `fabric-keyvault-403-rbac-fix.md`, `gcp-dataproc-iam-permission-denied.md`). Never use generic names like `debug-session.md`.

3. **Write the KB document** to `KB/<slug>.md` in the current working directory. Use this structure:

```markdown
# Fix: <short description of the problem>

**Fecha:** <today's date YYYY-MM-DD>
**Solución:** <project or solution name if known>
**Componentes:** <list of services/tools involved>

---

## Síntoma

<Exact error message or behavior, including any relevant codes or identifiers>

## Causa raíz

<Clear explanation of why the error occurred>

## Diagnóstico

<Commands or steps used to identify the root cause, with actual output>

## Fix aplicado

<Exact commands or configuration changes applied, with code blocks>

## Patrón general

<When does this pattern apply? What's the general rule to avoid this in the future?>

### Comando reutilizable

<If applicable, a clean reusable command for future reference>

## Referencias

<Relevant docs links or related KB entries>
```

4. **Commit and push** with a message following the repo's style:
   ```
   docs: add KB entry for <short description>
   ```

5. **Confirm** with a one-line summary of what was created and committed.

## Rules

- Always write in the same language as the conversation (Spanish if session was in Spanish)
- Never skip the commit and push — a KB doc that's only local has no value
- If a `KB/` folder doesn't exist in the repo, create it
- If a KB doc for the exact same issue already exists, update it instead of creating a duplicate
