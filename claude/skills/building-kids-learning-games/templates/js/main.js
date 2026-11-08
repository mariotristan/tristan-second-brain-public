import { ZONES, ANIMALS } from "./data/animals.js";
import { t, localized, setLang, getLang } from "./i18n.js";
import { load, save, browserStorage } from "./progress.js";
import { configureAudio, playSound, speak, chime, stopAll } from "./audio.js";
import { sceneryMarkup } from "./scenery.js";
import * as welcome from "./screens/welcome.js";
import * as map from "./screens/map.js";
import * as zone from "./screens/zone.js";
import * as quiz from "./screens/quiz.js";
import * as results from "./screens/results.js";
import * as stickers from "./screens/stickers.js";
import * as settings from "./screens/settings.js";

const SCREENS = { welcome, map, zone, quiz, results, stickers, settings };

export function start() {
  const root = document.getElementById("app");
  const storage = browserStorage();
  let state = load(storage);
  let current = { name: "welcome", params: {} };

  const applyState = () => {
    setLang(state.lang);
    configureAudio(state.settings);
    document.documentElement.lang = state.lang;
    document.title = t("appTitle");
  };

  let quietRender = false;
  const sceneryLayer = document.getElementById("scenery");
  let sceneId = null;

  // Swap the background scene only when the zone changes.
  const showScenery = (zone) => {
    const next = zone?.id ?? "park";
    if (!sceneryLayer || next === sceneId) return;
    sceneId = next;
    sceneryLayer.innerHTML = sceneryMarkup(next);
  };

  const renderCurrent = ({ quiet = false } = {}) => {
    stopAll();
    const focusKey = document.activeElement?.dataset?.focus;
    const scenery = ZONES.find((z) => z.id === current.params.zoneId);
    document.body.style.setProperty("--sky", scenery?.sky ?? "");
    document.body.style.setProperty("--ground", scenery?.ground ?? "");
    showScenery(scenery);
    root.replaceChildren();
    quietRender = quiet;
    try {
      (SCREENS[current.name] ?? map).render(root, ctx);
    } finally {
      quietRender = false;
    }
    const target = focusKey && root.querySelector(`[data-focus="${focusKey}"]`);
    (target ?? root.querySelector("h1"))?.focus();
  };

  const ctx = {
    get state() { return state; },
    get params() { return current.params; },
    get lang() { return getLang(); },
    get quiet() { return quietRender; },
    data: { ZONES, ANIMALS },
    t,
    localized,
    audio: {
      playSound: (path) => playSound(path),
      speak: (text) => speak(text, getLang()),
      chime,
      stop: stopAll,
    },
    update(fn) {
      state = fn(state);
      save(storage, state);
      applyState();
    },
    navigate(name, params = {}) {
      current = { name, params };
      renderCurrent();
    },
    rerender: () => renderCurrent({ quiet: true }),
  };

  applyState();
  renderCurrent();
}

// Offline support for the installed app. If it fails, the game still works online.
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("sw.js").catch((err) => {
    console.warn("Offline support unavailable:", err);
  });
}

if (typeof document !== "undefined") {
  start();
  registerServiceWorker();
}
