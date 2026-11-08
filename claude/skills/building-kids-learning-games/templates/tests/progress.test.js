import { test } from "node:test";
import assert from "node:assert/strict";
import { ZONES, ANIMALS, animalsInZone } from "../js/data/animals.js";
import {
  VERSION, STORAGE_KEY, freshState, markVisited, recordQuizResult, newStickerIds,
  totalStars, isZoneUnlocked, newlyUnlockedZones, visitedCount, isQuizUnlocked,
  setLanguage, setSetting, resetProgress, load, save, memoryStorage,
} from "../js/progress.js";

const zone = (id) => ZONES.find((z) => z.id === id);

test("fresh state shape", () => {
  assert.deepEqual(freshState(), {
    version: VERSION, lang: "en", settings: { sfx: true, voice: true },
    visited: {}, bestStars: {}, stickers: {},
  });
});

test("markVisited returns new state and does not mutate", () => {
  const s0 = freshState();
  const s1 = markVisited(s0, "lion");
  assert.deepEqual(s1.visited, { lion: true });
  assert.deepEqual(s0.visited, {});
});

test("quiz unlocks only after all 6 zone animals are visited", () => {
  let s = freshState();
  const savanna = animalsInZone("savanna");
  for (const a of savanna.slice(0, 5)) s = markVisited(s, a.id);
  assert.equal(visitedCount(s, "savanna", ANIMALS), 5);
  assert.equal(isQuizUnlocked(s, "savanna", ANIMALS), false);
  s = markVisited(s, savanna[5].id);
  assert.equal(isQuizUnlocked(s, "savanna", ANIMALS), true);
  assert.equal(isQuizUnlocked(s, "jungle", ANIMALS), false);
});

test("recordQuizResult keeps the best star score and adds stickers", () => {
  let s = recordQuizResult(freshState(), "savanna", { stars: 2, stickerIds: ["lion", "zebra"] });
  s = recordQuizResult(s, "savanna", { stars: 1, stickerIds: ["hippo"] });
  assert.equal(s.bestStars.savanna, 2);
  assert.deepEqual(s.stickers, { lion: true, zebra: true, hippo: true });
  s = recordQuizResult(s, "savanna", { stars: 3, stickerIds: [] });
  assert.equal(s.bestStars.savanna, 3);
});

test("newStickerIds lists only stickers not already owned (replay)", () => {
  const s = recordQuizResult(freshState(), "savanna", { stars: 2, stickerIds: ["lion"] });
  assert.deepEqual(newStickerIds(s, ["lion", "zebra"]), ["zebra"]);
});

test("totalStars sums best scores; unlock thresholds follow the spec", () => {
  let s = freshState();
  assert.equal(isZoneUnlocked(s, zone("savanna")), true);
  assert.equal(isZoneUnlocked(s, zone("jungle")), false);
  s = recordQuizResult(s, "savanna", { stars: 2, stickerIds: [] });
  assert.equal(totalStars(s), 2);
  assert.equal(isZoneUnlocked(s, zone("jungle")), true);
  assert.equal(isZoneUnlocked(s, zone("ocean")), false);
});

test("2 stars in every quiz unlocks every zone", () => {
  let s = freshState();
  for (const z of ZONES) {
    assert.equal(isZoneUnlocked(s, z), true, z.id);
    s = recordQuizResult(s, z.id, { stars: 2, stickerIds: [] });
  }
  assert.equal(totalStars(s), 12);
});

test("newlyUnlockedZones reports zones that just opened", () => {
  const before = recordQuizResult(freshState(), "savanna", { stars: 1, stickerIds: [] });
  const after = recordQuizResult(before, "savanna", { stars: 3, stickerIds: [] });
  assert.deepEqual(newlyUnlockedZones(before, after, ZONES), ["jungle"]);
  assert.deepEqual(newlyUnlockedZones(after, after, ZONES), []);
});

test("setLanguage accepts en/es only; setSetting coerces booleans", () => {
  const s = freshState();
  assert.equal(setLanguage(s, "es").lang, "es");
  assert.equal(setLanguage(s, "fr"), s);
  assert.equal(setSetting(s, "voice", false).settings.voice, false);
  assert.equal(setSetting(s, "sfx", 0).settings.sfx, false);
});

test("resetProgress clears progress but keeps language and settings", () => {
  let s = setLanguage(freshState(), "es");
  s = setSetting(s, "sfx", false);
  s = recordQuizResult(markVisited(s, "lion"), "savanna", { stars: 3, stickerIds: ["lion"] });
  const r = resetProgress(s);
  assert.deepEqual(r, { ...freshState(), lang: "es", settings: { sfx: false, voice: true } });
});

test("save/load round-trip", () => {
  const storage = memoryStorage();
  const s = recordQuizResult(markVisited(setLanguage(freshState(), "es"), "lion"), "savanna", { stars: 2, stickerIds: ["lion"] });
  assert.equal(save(storage, s), true);
  assert.deepEqual(load(storage), s);
});

test("load with nothing saved gives fresh state", () => {
  assert.deepEqual(load(memoryStorage()), freshState());
});

test("corrupt or old data gives fresh state", (t) => {
  t.mock.method(console, "warn", () => {});
  for (const text of ["not json{", "null", "[]", "42",
    JSON.stringify({ ...freshState(), version: 0 }),
    JSON.stringify({ ...freshState(), lang: "fr" }),
    JSON.stringify({ ...freshState(), visited: [] })]) {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, text);
    assert.deepEqual(load(storage), freshState(), text);
  }
});

test("partly valid data is sanitized", () => {
  const storage = memoryStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify({
    version: VERSION, lang: "es", settings: { voice: false },
    visited: { lion: true, zebra: "yes" },
    bestStars: { savanna: 99, jungle: 2, ocean: 1.5, polar: -1 },
    stickers: { lion: true, hippo: 1 },
  }));
  assert.deepEqual(load(storage), {
    version: VERSION, lang: "es", settings: { sfx: true, voice: false },
    visited: { lion: true }, bestStars: { jungle: 2 }, stickers: { lion: true },
  });
});

test("storage that throws never crashes load or save", (t) => {
  t.mock.method(console, "warn", () => {});
  const broken = {
    getItem() { throw new Error("denied"); },
    setItem() { throw new Error("quota"); },
  };
  assert.deepEqual(load(broken), freshState());
  assert.equal(save(broken, freshState()), false);
});
