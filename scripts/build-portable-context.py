#!/usr/bin/env python3
"""Flatten claude/memory/* into one agent-agnostic markdown file.

Output: portable/GLOBAL-CONTEXT.md. Paste or symlink it as the global
instructions file of any agent (see RESTORE-OTHER-AGENTS.md).
"""
import pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
out = ["# Global context (flattened from Claude memory)", "",
       "Facts, preferences and project notes collected over time. Per-project sections follow.", ""]
for d in sorted((root / "claude/memory").iterdir()):
    files = [f for f in sorted(d.glob("*.md")) if f.name != "MEMORY.md"]
    if not files:
        continue
    name = re.sub(r"^-Users-[^-]+(-code)?-?", "", d.name)
    out += [f"## Project: {name or 'global'}", ""]
    for f in files:
        body = f.read_text()
        body = re.sub(r"\A---\n.*?\n---\n", "", body, flags=re.S).strip()
        out += [f"### {f.stem}", "", body, ""]
(root / "portable").mkdir(exist_ok=True)
(root / "portable/GLOBAL-CONTEXT.md").write_text("\n".join(out))
print("wrote portable/GLOBAL-CONTEXT.md")
