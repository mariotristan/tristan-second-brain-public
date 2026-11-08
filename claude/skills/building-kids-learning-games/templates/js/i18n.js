import { STRINGS } from "./data/strings.js";

const LANGS = ["en", "es"];
let current = "en";

export function setLang(lang) {
  if (LANGS.includes(lang)) current = lang;
}

export function getLang() {
  return current;
}

export function t(key, vars = {}) {
  if (!Object.hasOwn(STRINGS, key)) return key;
  const entry = STRINGS[key];
  const text = entry[current] ?? entry.en;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}

export function localized(field) {
  return field?.[current] ?? field?.en ?? "";
}
