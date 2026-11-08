// The zoo gate on the Welcome screen. The sign text, animal toppers and Enter button are
// HTML laid over this drawing (positions in css/style.css match the viewBox below).
// The two .gate-door groups swing open when the player taps Enter.
export const GATE_SVG = `<svg viewBox="0 0 420 340" aria-hidden="true" focusable="false">
<path d="M150 340 L178 300 H242 L270 340Z" fill="#e8d3a6"/>
<g fill="#4f9a41"><circle cx="18" cy="306" r="34"/><circle cx="52" cy="318" r="24"/><circle cx="402" cy="310" r="30"/></g>
<g class="gate-door gate-door-left">
<rect x="100" y="118" width="110" height="182" fill="none"/>
<g stroke="#3e3e3e" stroke-width="5" stroke-linecap="round"><path d="M108 132 V300 M128 124 V300 M148 118 V300 M168 114 V300 M188 112 V300 M206 110 V300"/><path d="M100 170 H210 M100 250 H210"/></g>
<g fill="#ffd23f"><circle cx="108" cy="130" r="4"/><circle cx="128" cy="122" r="4"/><circle cx="148" cy="116" r="4"/><circle cx="168" cy="112" r="4"/><circle cx="188" cy="110" r="4"/><circle cx="206" cy="108" r="4"/></g>
</g>
<g class="gate-door gate-door-right">
<rect x="210" y="118" width="110" height="182" fill="none"/>
<g stroke="#3e3e3e" stroke-width="5" stroke-linecap="round"><path d="M214 110 V300 M232 112 V300 M252 114 V300 M272 118 V300 M292 124 V300 M312 132 V300"/><path d="M210 170 H320 M210 250 H320"/></g>
<g fill="#ffd23f"><circle cx="214" cy="108" r="4"/><circle cx="232" cy="110" r="4"/><circle cx="252" cy="112" r="4"/><circle cx="272" cy="116" r="4"/><circle cx="292" cy="122" r="4"/><circle cx="312" cy="130" r="4"/></g>
</g>
<rect x="50" y="96" width="50" height="206" rx="4" fill="#b5651d"/>
<rect x="320" y="96" width="50" height="206" rx="4" fill="#b5651d"/>
<g fill="#9a5418"><rect x="56" y="120" width="38" height="7" rx="2"/><rect x="56" y="180" width="38" height="7" rx="2"/><rect x="56" y="240" width="38" height="7" rx="2"/><rect x="326" y="120" width="38" height="7" rx="2"/><rect x="326" y="180" width="38" height="7" rx="2"/><rect x="326" y="240" width="38" height="7" rx="2"/></g>
<rect x="44" y="90" width="62" height="12" rx="3" fill="#8b4a12"/>
<rect x="314" y="90" width="62" height="12" rx="3" fill="#8b4a12"/>
<rect x="44" y="294" width="62" height="14" rx="3" fill="#8b4a12"/>
<rect x="314" y="294" width="62" height="14" rx="3" fill="#8b4a12"/>
<path d="M60 96 Q210 20 360 96 L360 72 Q210 -4 60 72Z" fill="#2e7d32" stroke="#1b5e20" stroke-width="3"/>
<g fill="#66bb6a"><circle cx="80" cy="74" r="7"/><circle cx="120" cy="52" r="6"/><circle cx="300" cy="52" r="6"/><circle cx="340" cy="74" r="7"/></g>
<g fill="#ff6f91"><circle cx="100" cy="62" r="5"/><circle cx="320" cy="62" r="5"/></g>
<g fill="#ffd34d"><circle cx="100" cy="62" r="2"/><circle cx="320" cy="62" r="2"/></g>
<path d="M130 40 V66 M290 40 V66" stroke="#5d3a1a" stroke-width="3"/>
<rect x="96" y="10" width="228" height="54" rx="12" fill="#8b5a2b" stroke="#5d3a1a" stroke-width="4"/>
<rect x="104" y="17" width="212" height="40" rx="8" fill="none" stroke="#a8743f" stroke-width="2"/>
<rect x="372" y="236" width="46" height="66" fill="#ffd166" stroke="#e0a800" stroke-width="3"/>
<path d="M368 240 L395 214 L422 240Z" fill="#e63946"/>
<rect x="380" y="250" width="30" height="20" rx="3" fill="#bfe6ff"/>
</svg>`;
