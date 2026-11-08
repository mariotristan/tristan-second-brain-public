#!/usr/bin/env python3
"""Read assets/logo.svg and write docs/brain-data.js: the logo's nodes and connections for the page animation."""
import json, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
svg = (root / "assets/logo.svg").read_text()
group = svg[svg.index('<g transform="translate(230 210)"'):svg.index("</g>", svg.index('<g transform="translate(230 210)"'))]
nodes, index = [], {}
for m in re.finditer(r'<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"', group):
    key = (m.group(1), m.group(2))
    index[key] = len(nodes)
    nodes.append([float(m.group(1)), float(m.group(2)), float(m.group(3))])
edges = []
for m in re.finditer(r'<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"', group):
    a, b = index.get((m.group(1), m.group(2))), index.get((m.group(3), m.group(4)))
    if a is not None and b is not None:
        edges.append([a, b])
(root / "docs/brain-data.js").write_text("window.BRAIN=" + json.dumps({"nodes": nodes, "edges": edges}, separators=(",", ":")) + ";\n")
print(f"wrote docs/brain-data.js: {len(nodes)} nodes, {len(edges)} edges")
