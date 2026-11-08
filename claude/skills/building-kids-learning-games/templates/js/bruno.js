// Zookeeper Bruno, drawn as an SVG. CSS animates the parts with classes:
// .bruno-wave (right arm) and .bruno-eyes (blink). See css/style.css.
export const BRUNO_SVG = `<svg viewBox="0 -12 120 162" aria-hidden="true" focusable="false">
<rect x="40" y="104" width="17" height="30" rx="6" fill="#6d7f3f"/>
<rect x="63" y="104" width="17" height="30" rx="6" fill="#6d7f3f"/>
<path d="M36 132 h24 v6 a4 4 0 0 1 -4 4 h-17 a5 5 0 0 1 -5 -5z" fill="#6b4a2b"/>
<path d="M60 132 h24 v5 a5 5 0 0 1 -5 5 h-17 a4 4 0 0 1 -4 -4z" fill="#6b4a2b"/>
<rect x="14" y="66" width="17" height="34" rx="8" fill="#d8b46a"/>
<circle cx="22" cy="104" r="7" fill="#e3a77a"/>
<g class="bruno-wave">
<rect x="89" y="40" width="17" height="38" rx="8" fill="#d8b46a"/>
<circle cx="97" cy="36" r="7.5" fill="#e3a77a"/>
</g>
<rect x="30" y="60" width="60" height="50" rx="14" fill="#e2c27d"/>
<path d="M60 60 v50" stroke="#c9a65c" stroke-width="2"/>
<rect x="36" y="70" width="16" height="12" rx="2" fill="#d4b062" stroke="#c9a65c"/>
<rect x="68" y="70" width="16" height="12" rx="2" fill="#d4b062" stroke="#c9a65c"/>
<path d="M44 60 Q60 80 76 60" stroke="#4a3b2a" stroke-width="2" fill="none"/>
<rect x="52" y="76" width="7" height="11" rx="2" fill="#333"/>
<rect x="61" y="76" width="7" height="11" rx="2" fill="#333"/>
<rect x="40" y="90" width="40" height="11" rx="3" fill="#2e7d32"/>
<text x="60" y="98.5" text-anchor="middle" font-size="8.5" font-weight="bold" font-family="Trebuchet MS, sans-serif" fill="#fff">BRUNO</text>
<rect x="30" y="102" width="60" height="6" fill="#6b4a2b"/>
<rect x="55" y="101" width="10" height="8" rx="2" fill="#ffd23f"/>
<rect x="53" y="52" width="14" height="10" fill="#e3a77a"/>
<circle cx="60" cy="36" r="22" fill="#e3a77a"/>
<circle cx="38" cy="38" r="5" fill="#e3a77a"/>
<circle cx="82" cy="38" r="5" fill="#e3a77a"/>
<g class="bruno-eyes"><circle cx="51" cy="36" r="3.2" fill="#2b2118"/><circle cx="69" cy="36" r="3.2" fill="#2b2118"/></g>
<circle cx="45" cy="44" r="4" fill="#f29b8a" opacity=".6"/>
<circle cx="75" cy="44" r="4" fill="#f29b8a" opacity=".6"/>
<path d="M51 45 q9 8 18 0" stroke="#7a3b2a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<ellipse cx="60" cy="20" rx="36" ry="7" fill="#c9a65c"/>
<path d="M38 20 Q40 -4 60 -5 Q80 -4 82 20Z" fill="#e2c27d"/>
<rect x="39" y="14" width="42" height="5" fill="#2e7d32"/>
</svg>`;
