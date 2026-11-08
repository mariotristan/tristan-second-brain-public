// Pure progress state. Every function returns a new state; storage is injected.

export const VERSION = 1;
export const STORAGE_KEY = "bruno-zoo-progress";
const LANGS = ["en", "es"];

export function freshState() {
  return {
    version: VERSION,
    lang: "en",
    settings: { sfx: true, voice: true },
    visited: {},
    bestStars: {},
    stickers: {},
  };
}

export function markVisited(state, animalId) {
  if (state.visited[animalId]) return state;
  return { ...state, visited: { ...state.visited, [animalId]: true } };
}

export function recordQuizResult(state, zoneId, { stars, stickerIds }) {
  const stickers = { ...state.stickers };
  for (const id of stickerIds) stickers[id] = true;
  const best = Math.max(state.bestStars[zoneId] ?? 0, stars);
  return { ...state, bestStars: { ...state.bestStars, [zoneId]: best }, stickers };
}

export function newStickerIds(state, stickerIds) {
  return stickerIds.filter((id) => !state.stickers[id]);
}

export function totalStars(state) {
  return Object.values(state.bestStars).reduce((sum, n) => sum + n, 0);
}

export function isZoneUnlocked(state, zone) {
  return totalStars(state) >= zone.threshold;
}

export function newlyUnlockedZones(before, after, zones) {
  return zones.filter((z) => !isZoneUnlocked(before, z) && isZoneUnlocked(after, z)).map((z) => z.id);
}

export function visitedCount(state, zoneId, animals) {
  return animals.filter((a) => a.zone === zoneId && state.visited[a.id]).length;
}

export function isQuizUnlocked(state, zoneId, animals) {
  const total = animals.filter((a) => a.zone === zoneId).length;
  return total > 0 && visitedCount(state, zoneId, animals) === total;
}

export function setLanguage(state, lang) {
  if (!LANGS.includes(lang)) return state;
  return { ...state, lang };
}

export function setSetting(state, key, value) {
  return { ...state, settings: { ...state.settings, [key]: Boolean(value) } };
}

export function resetProgress(state) {
  return { ...freshState(), lang: state.lang, settings: { ...state.settings } };
}

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

function trueKeys(obj) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) if (value === true) out[key] = true;
  return out;
}

// Returns a clean state, or null if the shape or version is wrong.
export function validate(raw) {
  if (!isObject(raw) || raw.version !== VERSION || !LANGS.includes(raw.lang)) return null;
  if (![raw.settings, raw.visited, raw.bestStars, raw.stickers].every(isObject)) return null;
  const bestStars = {};
  for (const [zoneId, n] of Object.entries(raw.bestStars)) {
    if (Number.isInteger(n) && n >= 0 && n <= 3) bestStars[zoneId] = n;
  }
  return {
    version: VERSION,
    lang: raw.lang,
    settings: { sfx: raw.settings.sfx !== false, voice: raw.settings.voice !== false },
    visited: trueKeys(raw.visited),
    bestStars,
    stickers: trueKeys(raw.stickers),
  };
}

export function load(storage) {
  try {
    const text = storage.getItem(STORAGE_KEY);
    if (!text) return freshState();
    return validate(JSON.parse(text)) ?? freshState();
  } catch (err) {
    console.warn("Could not load progress; starting fresh.", err);
    return freshState();
  }
}

export function save(storage, state) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.warn("Could not save progress.", err);
    return false;
  }
}

export function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => void map.set(key, String(value)),
    removeItem: (key) => void map.delete(key),
  };
}

// localStorage if it works (it can throw in private mode), else in-memory.
export function browserStorage() {
  try {
    const storage = globalThis.localStorage;
    const probe = "__bruno_zoo_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return memoryStorage();
  }
}
