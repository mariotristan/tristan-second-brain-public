// Illustrated backgrounds for each zone, plus a sunny park for the other screens.
// Each scene is split into layers pinned to different edges of the screen (see css/style.css)
// so nothing important gets cropped on phones, iPads in portrait, or wide desktops.

export const PARTS = ["sky", "top", "ground", "left", "right", "floor"];

// How each layer scales inside its box: the sky and ground stretch, the rest keep their shape.
const FIT = {
  sky: "none",
  top: "xMidYMin meet",
  ground: "none",
  left: "xMinYMax meet",
  right: "xMaxYMax meet",
  floor: "xMidYMax slice",
};

const VIEWBOX = {
  sky: "0 0 100 100",
  top: "0 0 1000 300",
  ground: "0 0 1000 450",
  left: "0 0 400 500",
  right: "0 0 400 500",
  floor: "0 0 1000 120",
};

const svg = (part, body) => `<svg viewBox="${VIEWBOX[part]}">${body}</svg>`;

// A vertical gradient filling the whole sky layer. `stops` is a list of [offset, color].
const sky = (id, stops) =>
  svg(
    "sky",
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops
      .map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`)
      .join("")}</linearGradient></defs><rect width="100" height="100" fill="url(#${id})"/>`,
  );

const sun = (x, y) =>
  `<circle cx="${x}" cy="${y}" r="78" fill="#fff3b0" opacity=".7"/><circle cx="${x}" cy="${y}" r="58" fill="#ffd34d"/>`;

const cloud = (x, y, s = 1) =>
  `<g fill="#fff" opacity=".95" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="70" ry="22"/><ellipse cx="-22" cy="-16" rx="30" ry="24"/><ellipse cx="20" cy="-20" rx="36" ry="28"/></g>`;

const bird = (x, y, s = 1) =>
  `<path d="M${x} ${y} q${8 * s} ${-8 * s} ${16 * s} 0 q${8 * s} ${-8 * s} ${16 * s} 0" stroke="#6b4f35" stroke-width="3" fill="none" stroke-linecap="round"/>`;

const tuft = (x, y, color) =>
  `<path d="M${x - 8} ${y} l-8 -26 M${x} ${y} l0 -32 M${x + 8} ${y} l8 -26" stroke="${color}" stroke-width="5" stroke-linecap="round" fill="none"/>`;

const flower = (x, y, petal) =>
  `<g transform="translate(${x} ${y})"><path d="M0 0 v24" stroke="#3e8e41" stroke-width="4"/><circle cx="-7" cy="-4" r="7" fill="${petal}"/><circle cx="7" cy="-4" r="7" fill="${petal}"/><circle cx="0" cy="-11" r="7" fill="${petal}"/><circle cx="0" cy="3" r="7" fill="${petal}"/><circle cx="0" cy="-4" r="5" fill="#ffd34d"/></g>`;

const pine = (x, y, h, color) =>
  `<g fill="${color}"><path d="M${x} ${y - h} L${x - h * 0.32} ${y - h * 0.45} H${x + h * 0.32}Z"/><path d="M${x} ${y - h * 0.72} L${x - h * 0.42} ${y - h * 0.15} H${x + h * 0.42}Z"/><path d="M${x} ${y - h * 0.45} L${x - h * 0.5} ${y + h * 0.1} H${x + h * 0.5}Z"/></g><rect x="${x - h * 0.05}" y="${y + h * 0.1}" width="${h * 0.1}" height="${h * 0.14}" fill="#6b4a2b"/>`;

const hills = (back, front) =>
  svg(
    "ground",
    `<path d="M0 120 Q160 40 330 100 T680 80 T1000 90 V450 H0Z" fill="${back}"/><path d="M0 210 Q220 140 470 190 T1000 170 V450 H0Z" fill="${front}"/>`,
  );

export const SCENES = {
  savanna: {
    sky: sky("sc-savanna-sky", [[0, "#ffc966"], [0.6, "#ffe6a6"], [1, "#fff3cf"]]),
    top: svg("top", `${sun(820, 120)}${bird(330, 110)}${bird(380, 80, 0.8)}${bird(430, 120, 0.7)}`),
    ground: hills("#e8bb63", "#d9a246"),
    left: svg(
      "left",
      `<rect x="110" y="250" width="16" height="250" fill="#6b4a2b"/><path d="M118 300 L70 240 M118 280 L170 230" stroke="#6b4a2b" stroke-width="10" stroke-linecap="round"/><ellipse cx="120" cy="230" rx="130" ry="34" fill="#5f7d2e"/><ellipse cx="80" cy="210" rx="80" ry="24" fill="#6f8f36"/><ellipse cx="170" cy="216" rx="60" ry="20" fill="#7a9c3c"/>`,
    ),
    right: svg(
      "right",
      `<rect x="296" y="330" width="10" height="170" fill="#6b4a2b"/><ellipse cx="300" cy="320" rx="86" ry="22" fill="#5f7d2e"/><ellipse cx="320" cy="306" rx="50" ry="15" fill="#6f8f36"/><ellipse cx="120" cy="470" rx="70" ry="34" fill="#b98a4a"/><ellipse cx="104" cy="458" rx="34" ry="16" fill="#c99a58"/>`,
    ),
    floor: svg("floor", [60, 230, 420, 610, 790, 950].map((x) => tuft(x, 110, "#a8732a")).join("")),
  },

  jungle: {
    sky: sky("sc-jungle-sky", [[0, "#8fd49c"], [1, "#e2f6dc"]]),
    top: svg(
      "top",
      `<g fill="#2e7d32"><ellipse cx="80" cy="0" rx="160" ry="60"/><ellipse cx="500" cy="-10" rx="200" ry="50"/><ellipse cx="930" cy="0" rx="170" ry="64"/></g><g fill="none" stroke="#2f7a35" stroke-width="7" stroke-linecap="round"><path d="M150 30 Q170 120 140 190 Q125 240 150 280"/><path d="M380 30 Q360 100 385 160"/><path d="M700 30 Q720 110 695 200"/><path d="M860 40 Q840 120 865 230"/></g><g fill="#4caf50"><ellipse cx="150" cy="282" rx="16" ry="9"/><ellipse cx="385" cy="162" rx="14" ry="8"/><ellipse cx="695" cy="202" rx="16" ry="9"/><ellipse cx="865" cy="232" rx="16" ry="9"/><ellipse cx="160" cy="150" rx="12" ry="7"/><ellipse cx="710" cy="110" rx="12" ry="7"/></g>`,
    ),
    ground: hills("#6cbf6a", "#3e8e41"),
    left: svg(
      "left",
      `<g fill="#2e7d32"><path d="M0 500 Q20 300 180 260 Q120 360 0 420Z"/><path d="M0 480 Q120 380 260 400 Q150 450 30 500Z"/></g><g fill="#43a047"><path d="M10 500 Q60 360 210 330 Q130 420 60 500Z"/></g><path d="M40 470 Q120 400 200 345" stroke="#1b5e20" stroke-width="5" fill="none"/>`,
    ),
    right: svg(
      "right",
      `<path d="M300 500 Q290 360 320 220" stroke="#7a5230" stroke-width="22" fill="none" stroke-linecap="round"/><g fill="#2e7d32"><path d="M320 220 Q240 170 160 210 Q240 200 320 230Z"/><path d="M320 220 Q380 150 420 170 Q370 180 322 232Z"/><path d="M320 220 Q300 130 230 110 Q290 160 316 230Z"/><path d="M320 220 Q360 140 420 120 Q370 170 324 232Z"/><path d="M320 222 Q250 250 200 300 Q260 255 322 232Z"/></g><circle cx="312" cy="232" r="10" fill="#8d6e3f"/><circle cx="328" cy="236" r="10" fill="#8d6e3f"/>`,
    ),
    floor: svg(
      "floor",
      `${flower(120, 90, "#ff6f91")}${flower(380, 96, "#ffb74d")}${flower(640, 92, "#ff6f91")}${flower(880, 94, "#ba68c8")}${tuft(250, 116, "#2e7d32")}${tuft(760, 116, "#2e7d32")}`,
    ),
  },

  ocean: {
    sky: sky("sc-ocean-sky", [[0, "#8fd3ff"], [0.5, "#4ea8de"], [1, "#1f6fae"]]),
    top: svg(
      "top",
      `<path d="M0 18 Q60 0 120 18 T240 18 T360 18 T480 18 T600 18 T720 18 T840 18 T960 18 T1080 18 V0 H0Z" fill="#d6f2ff" opacity=".7"/><g fill="#fff" opacity=".16"><path d="M140 0 L230 0 L170 300 L90 300Z"/><path d="M480 0 L540 0 L510 300 L450 300Z"/><path d="M760 0 L850 0 L800 300 L730 300Z"/></g><g fill="none" stroke="#fff" stroke-width="3" opacity=".8"><circle cx="300" cy="200" r="10"/><circle cx="318" cy="150" r="7"/><circle cx="306" cy="110" r="5"/><circle cx="690" cy="230" r="9"/><circle cx="702" cy="180" r="6"/></g>`,
    ),
    ground: svg(
      "ground",
      `<path d="M0 300 Q200 260 420 290 T1000 280 V450 H0Z" fill="#e9c98b"/><path d="M0 350 Q260 320 520 345 T1000 335 V450 H0Z" fill="#f2d49b"/>`,
    ),
    left: svg(
      "left",
      `<g fill="none" stroke="#2e8b57" stroke-width="12" stroke-linecap="round"><path d="M60 500 Q30 420 70 350 Q100 290 60 220 Q40 180 70 140"/><path d="M110 500 Q140 440 105 380 Q80 330 115 280"/></g><g fill="none" stroke="#3aa76d" stroke-width="9" stroke-linecap="round"><path d="M170 500 Q150 450 175 400"/></g><ellipse cx="230" cy="480" rx="90" ry="40" fill="#7d8b99"/><ellipse cx="210" cy="466" rx="40" ry="16" fill="#93a1ae"/>`,
    ),
    right: svg(
      "right",
      `<g fill="none" stroke="#ff7f6e" stroke-width="16" stroke-linecap="round"><path d="M300 500 V380 M300 420 L250 360 M300 400 L350 340 M250 360 V320 M350 340 V300"/></g><g fill="none" stroke="#ffb3c1" stroke-width="12" stroke-linecap="round"><path d="M180 500 V430 M180 450 L150 410 M180 440 L210 400"/></g><g fill="none" stroke="#2e8b57" stroke-width="11" stroke-linecap="round"><path d="M380 500 Q400 430 370 370 Q350 320 378 270"/></g>`,
    ),
    floor: svg(
      "floor",
      `<path d="M300 100 l9 -18 l9 18 l20 2 l-15 13 l5 20 l-19 -10 l-19 10 l5 -20 l-15 -13z" fill="#ff8c42"/><path d="M700 104 q20 -30 40 0 z" fill="#fff1e0"/><path d="M706 104 l14 -22 M720 104 l0 -26 M734 104 l-14 -22" stroke="#e8cdb0" stroke-width="2"/><g fill="#c9b18a"><ellipse cx="160" cy="108" rx="12" ry="6"/><ellipse cx="520" cy="110" rx="9" ry="5"/><ellipse cx="880" cy="106" rx="14" ry="7"/></g>`,
    ),
  },

  polar: {
    sky: sky("sc-polar-sky", [[0, "#3b5b92"], [0.5, "#9dc1e6"], [1, "#eaf6ff"]]),
    top: svg(
      "top",
      `<path d="M0 90 Q250 20 500 90 T1000 70" stroke="#7dffb0" stroke-width="34" fill="none" opacity=".45" stroke-linecap="round"/><path d="M0 140 Q260 80 520 140 T1000 120" stroke="#c38bff" stroke-width="22" fill="none" opacity=".35" stroke-linecap="round"/><g fill="#fff"><circle cx="90" cy="40" r="3"/><circle cx="260" cy="190" r="4"/><circle cx="420" cy="230" r="3"/><circle cx="610" cy="200" r="4"/><circle cx="780" cy="240" r="3"/><circle cx="930" cy="190" r="4"/><circle cx="700" cy="30" r="3"/></g>`,
    ),
    ground: svg(
      "ground",
      `<path d="M0 140 L120 60 L220 120 L330 40 L460 130 V450 H0Z" fill="#dcecf8"/><path d="M560 130 L690 50 L790 110 L900 60 L1000 110 V450 H560Z" fill="#dcecf8"/><path d="M0 200 Q200 150 420 190 T1000 180 V450 H0Z" fill="#ffffff"/><path d="M0 290 Q260 250 520 280 T1000 270 V450 H0Z" fill="#eef7fd"/>`,
    ),
    left: svg(
      "left",
      `<path d="M20 500 L60 330 L130 380 L170 300 L250 500Z" fill="#cfe9f7"/><path d="M60 330 L90 500 M170 300 L150 500" stroke="#b5dbf0" stroke-width="5"/><path d="M0 500 Q120 440 260 470 Q160 480 0 500Z" fill="#fff"/>`,
    ),
    right: svg(
      "right",
      `<path d="M190 500 L230 380 L290 410 L330 340 L400 500Z" fill="#cfe9f7"/><path d="M230 380 L250 500 M330 340 L320 500" stroke="#b5dbf0" stroke-width="5"/><path d="M60 470 L180 470 L160 494 L80 494Z" fill="#d7eefa"/>`,
    ),
    floor: svg(
      "floor",
      `<g fill="#ffffff" stroke="#d6e9f5" stroke-width="2"><ellipse cx="160" cy="108" rx="60" ry="14"/><ellipse cx="560" cy="110" rx="80" ry="12"/><ellipse cx="880" cy="106" rx="56" ry="14"/></g>`,
    ),
  },

  farm: {
    sky: sky("sc-farm-sky", [[0, "#7cc8ff"], [1, "#d9f0ff"]]),
    top: svg("top", `${sun(150, 120)}${cloud(470, 110)}${cloud(780, 80, 0.8)}`),
    ground: svg(
      "ground",
      `<path d="M0 120 Q250 70 500 110 T1000 100 V450 H0Z" fill="#a6dc7d"/><path d="M0 200 Q260 160 520 190 T1000 180 V450 H0Z" fill="#8bcf62"/><g stroke="#7cbf54" stroke-width="6" fill="none" opacity=".8"><path d="M0 260 Q500 230 1000 250"/><path d="M0 310 Q500 285 1000 300"/><path d="M0 360 Q500 340 1000 352"/></g>`,
    ),
    left: svg(
      "left",
      `<g stroke="#fff" stroke-width="12" stroke-linecap="round"><path d="M0 400 H260 M0 440 H260"/><path d="M30 380 V470 M110 380 V470 M190 380 V470 M250 380 V470"/></g><ellipse cx="120" cy="486" rx="62" ry="34" fill="#e9c46a"/><path d="M68 478 H172 M72 494 H168" stroke="#c9a227" stroke-width="4"/>`,
    ),
    right: svg(
      "right",
      `<rect x="200" y="300" width="170" height="160" fill="#c0392b"/><path d="M186 304 L285 220 L384 304Z" fill="#922b21"/><rect x="255" y="370" width="60" height="90" fill="#fff"/><path d="M255 370 L315 460 M315 370 L255 460" stroke="#c0392b" stroke-width="7"/><rect x="262" y="320" width="46" height="30" fill="#fff"/><rect x="380" y="260" width="20" height="200" fill="#b0bec5"/><ellipse cx="390" cy="260" rx="10" ry="8" fill="#90a4ae"/>`,
    ),
    floor: svg(
      "floor",
      `${flower(90, 92, "#ff6f91")}${flower(520, 96, "#fff")}${flower(940, 92, "#ffb74d")}${tuft(300, 116, "#5fae45")}${tuft(720, 116, "#5fae45")}`,
    ),
  },

  forest: {
    sky: sky("sc-forest-sky", [[0, "#bfe3c7"], [1, "#eef8ef"]]),
    top: svg(
      "top",
      `${bird(560, 120)}${bird(610, 95, 0.8)}<g fill="#3f7a4a"><ellipse cx="20" cy="10" rx="150" ry="70"/><ellipse cx="990" cy="0" rx="150" ry="70"/></g><g fill="#4f8f5a"><ellipse cx="120" cy="20" rx="90" ry="40"/><ellipse cx="880" cy="25" rx="90" ry="40"/></g>`,
    ),
    ground: svg(
      "ground",
      `${[80, 200, 330, 460, 600, 730, 860, 960].map((x, i) => pine(x, 150, 120 + (i % 3) * 25, "#8fbf99")).join("")}<path d="M0 170 Q250 130 500 160 T1000 150 V450 H0Z" fill="#6b9c58"/><path d="M0 260 Q260 220 520 250 T1000 240 V450 H0Z" fill="#4f7a3a"/>`,
    ),
    left: svg("left", `${pine(90, 400, 360, "#2f5d3a")}${pine(230, 440, 240, "#3c6e46")}`),
    right: svg(
      "right",
      `${pine(310, 400, 360, "#2f5d3a")}${pine(170, 450, 220, "#3c6e46")}<rect x="40" y="470" width="150" height="26" rx="13" fill="#8b5a2b"/><circle cx="40" cy="483" r="13" fill="#c49a6c"/><circle cx="40" cy="483" r="6" fill="#a87b4f"/>`,
    ),
    floor: svg(
      "floor",
      `<g transform="translate(300 70)"><rect x="-5" y="12" width="10" height="26" fill="#f5e6d3"/><ellipse cx="0" cy="12" rx="22" ry="14" fill="#e63946"/><circle cx="-8" cy="8" r="3" fill="#fff"/><circle cx="7" cy="11" r="3" fill="#fff"/></g><g transform="translate(700 76)"><rect x="-4" y="10" width="8" height="22" fill="#f5e6d3"/><ellipse cx="0" cy="10" rx="17" ry="11" fill="#e63946"/><circle cx="5" cy="7" r="2.5" fill="#fff"/></g>${tuft(140, 116, "#2f5d3a")}${tuft(520, 116, "#2f5d3a")}${tuft(880, 116, "#2f5d3a")}`,
    ),
  },

  park: {
    sky: sky("sc-park-sky", [[0, "#8fd6ff"], [1, "#e0f4ff"]]),
    top: svg("top", `${sun(850, 120)}${cloud(220, 110)}${cloud(520, 70, 0.75)}`),
    ground: hills("#a6dc7d", "#8bcf62"),
    left: svg(
      "left",
      `<rect x="100" y="330" width="22" height="170" fill="#7a5230"/><circle cx="110" cy="280" r="90" fill="#5aa64a"/><circle cx="60" cy="320" r="56" fill="#4f9a41"/><circle cx="165" cy="315" r="60" fill="#66b456"/><ellipse cx="270" cy="480" rx="80" ry="36" fill="#4f9a41"/>`,
    ),
    right: svg(
      "right",
      `<rect x="290" y="350" width="20" height="150" fill="#7a5230"/><circle cx="300" cy="300" r="80" fill="#5aa64a"/><circle cx="350" cy="340" r="50" fill="#66b456"/><ellipse cx="130" cy="484" rx="70" ry="30" fill="#4f9a41"/>`,
    ),
    floor: svg(
      "floor",
      `${flower(110, 92, "#ff6f91")}${flower(340, 96, "#ffb74d")}${flower(660, 92, "#ba68c8")}${flower(900, 96, "#ff6f91")}${tuft(500, 116, "#5fae45")}`,
    ),
  },
};

// HTML for the scenery layer: one hidden, non-interactive svg per part.
export function sceneryMarkup(sceneId) {
  const scene = SCENES[sceneId] ?? SCENES.park;
  return PARTS.map((part) =>
    scene[part].replace(
      "<svg ",
      `<svg class="sc-${part}" preserveAspectRatio="${FIT[part]}" aria-hidden="true" focusable="false" `,
    ),
  ).join("");
}
