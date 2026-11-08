#!/usr/bin/env python3
"""Generate assets/logo.svg: a neural-network brain. Deterministic (seeded)."""
import math, random, pathlib

random.seed(7)
W, H = 1200, 420
cx, cy = 230, 210
# brain silhouette = union of circles (left lobe, right lobe, frontal, temporal, cerebellum)
blobs = [(-62, -20, 92), (62, -20, 92), (-20, -78, 70), (30, -80, 66),
         (-90, 40, 62), (90, 40, 62), (0, 62, 70), (45, 112, 40)]
def inside(x, y, shrink=0):
    return any((x-bx)**2 + (y-by)**2 <= (r-shrink)**2 for bx, by, r in blobs)

nodes = []
tries = 0
while len(nodes) < 70 and tries < 20000:
    tries += 1
    x, y = random.uniform(-170, 170), random.uniform(-170, 170)
    if inside(x, y, 6) and all((x-a)**2 + (y-b)**2 > 26**2 for a, b in nodes):
        nodes.append((x, y))
# midline fissure: nudge nodes away from x=0 so hemispheres read
nodes = [(x + (8 if x > 0 else -8), y) for x, y in nodes if abs(x) > 9]

edges = [(i, j) for i in range(len(nodes)) for j in range(i+1, len(nodes))
         if math.dist(nodes[i], nodes[j]) < 52
         and (nodes[i][0] * nodes[j][0] > 0 or abs(nodes[i][1] + nodes[j][1]) % 3 < 1.2)]

o = []
o.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="Tristan Second Brain logo">')
o.append('''<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="0.55" stop-color="#6366f1"/><stop offset="1" stop-color="#d946ef"/></linearGradient>
<radialGradient id="bg" cx="0.2" cy="0.5" r="0.9"><stop offset="0" stop-color="#14183a"/><stop offset="1" stop-color="#070914"/></radialGradient>
<radialGradient id="halo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#6366f1" stop-opacity="0.45"/><stop offset="1" stop-color="#6366f1" stop-opacity="0"/></radialGradient>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#818cf8" stroke-opacity="0.07"/></pattern>
</defs>''')
o.append(f'<rect width="{W}" height="{H}" rx="28" fill="url(#bg)"/>')
o.append(f'<rect width="{W}" height="{H}" rx="28" fill="url(#grid)"/>')
o.append(f'<rect x="1" y="1" width="{W-2}" height="{H-2}" rx="27" fill="none" stroke="url(#g)" stroke-opacity="0.55" stroke-width="2"/>')
o.append(f'<circle cx="{cx}" cy="{cy}" r="190" fill="url(#halo)"/>')
o.append(f'<g transform="translate({cx} {cy})" filter="url(#glow)">')
for i, j in edges:
    (x1, y1), (x2, y2) = nodes[i], nodes[j]
    o.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="url(#g)" stroke-opacity="0.55" stroke-width="1.4"/>')
for k, (x, y) in enumerate(nodes):
    r = 3 + (k % 4)
    fill = '#a5f3fc' if k % 5 == 0 else ('#e879f9' if k % 7 == 0 else '#818cf8')
    o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{fill}"/>')
o.append('</g>')
# wordmark
o.append('''<g font-family="'SF Pro Display','Inter','Segoe UI',Helvetica,Arial,sans-serif">
<text x="470" y="190" font-size="30" font-weight="500" letter-spacing="14" fill="#94a3b8">TRISTAN</text>
<text x="466" y="268" font-size="78" font-weight="800" letter-spacing="2" fill="url(#g)">SECOND BRAIN</text>
<rect x="470" y="296" width="120" height="4" rx="2" fill="url(#g)"/>
<text x="470" y="338" font-size="19" fill="#cbd5e1" letter-spacing="1">memory · skills · ways of working · portable across agents</text>
</g>''')
o.append('</svg>')
pathlib.Path(__file__).resolve().parent.parent.joinpath('assets/logo.svg').write_text('\n'.join(o))
print(len(nodes), 'nodes', len(edges), 'edges')
