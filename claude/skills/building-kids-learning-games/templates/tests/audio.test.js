import { test } from "node:test";
import assert from "node:assert/strict";
import { pickVoice, speakable, playSound, speak, configureAudio } from "../js/audio.js";

test("pickVoice prefers an exact language-region match", () => {
  const voices = [{ lang: "en-GB", name: "a" }, { lang: "es-MX", name: "b" }, { lang: "es", name: "c" }];
  assert.equal(pickVoice(voices, "es").name, "b");
  assert.equal(pickVoice(voices, "en").name, "a");
  assert.equal(pickVoice([{ lang: "ES", name: "d" }], "es").name, "d");
  assert.equal(pickVoice(voices, "fr"), null);
  assert.equal(pickVoice([], "en"), null);
});

test("speakable strips emoji and squeezes spaces", () => {
  assert.equal(speakable("Almost! Listen again 👂"), "Almost! Listen again");
  assert.equal(speakable("🐻‍❄️ Polar  bear ⭐"), "Polar bear");
});

test("playSound resolves false without crashing when audio is unavailable or off", async (t) => {
  t.mock.method(console, "warn", () => {});
  configureAudio({ sfx: true, voice: true });
  assert.equal(await playSound("sounds/lion.mp3", { maxMs: 50 }), false); // no Audio in Node
  assert.equal(await playSound(null), false);
  configureAudio({ sfx: false, voice: true });
  assert.equal(await playSound("sounds/lion.mp3"), false);
  configureAudio({ sfx: true, voice: true });
});

test("speak is a safe no-op without speech synthesis", async () => {
  await speak("Hello", "en");
});
