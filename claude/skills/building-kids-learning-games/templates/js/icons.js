// Button icons (Phosphor, MIT) and small drawn flags. Icons take the button's text color.
import { ICONS } from "./icons-data.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export const ICON_NAMES = [
  "back", "stickers", "settings", "sound", "sayName", "close", "enter", "playAgain", "map",
  "reset", "quiz", "lock", "unlock", "check", "star", "starEmpty", "thumbsUp", "thumbsDown",
  "celebrate",
];

// Simplified flags drawn for the language buttons (flag emoji show as letters on Windows).
export const FLAGS = {
  en: `<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#b22234"/><g fill="#fff"><rect y="2.86" width="30" height="2.86"/><rect y="8.57" width="30" height="2.86"/><rect y="14.29" width="30" height="2.86"/></g><rect width="13" height="11.43" fill="#3c3b6e"/><g fill="#fff"><circle cx="3" cy="3" r="1"/><circle cx="6.5" cy="3" r="1"/><circle cx="10" cy="3" r="1"/><circle cx="4.75" cy="5.7" r="1"/><circle cx="8.25" cy="5.7" r="1"/><circle cx="3" cy="8.4" r="1"/><circle cx="6.5" cy="8.4" r="1"/><circle cx="10" cy="8.4" r="1"/></g></svg>`,
  es: `<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#c60b1e"/><rect y="5" width="30" height="10" fill="#ffc400"/></svg>`,
};

function svgFrom(markup) {
  const template = document.createElement("template");
  template.innerHTML = markup.trim();
  return template.content.firstElementChild;
}

export function icon(name) {
  if (!Object.hasOwn(ICONS, name)) throw new Error(`Unknown icon: ${name}`);
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 256 256");
  svg.setAttribute("fill", "currentColor");
  svg.setAttribute("class", `icon icon-${name}`);
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.innerHTML = ICONS[name];
  return svg;
}

export function flag(lang) {
  const svg = svgFrom(FLAGS[lang]);
  svg.setAttribute("class", "flag");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  return svg;
}
