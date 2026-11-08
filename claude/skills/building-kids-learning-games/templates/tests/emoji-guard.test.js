import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

// Emoji used to be placed directly in buttons, tiles, and titles. They're now icons or artwork.
// Text emoji inside Bruno's sentences live in js/data/strings.js and are allowed.
const FILES = ["js/ui.js", "js/entrance.js", ...readdirSync("js/screens").map((f) => `js/screens/${f}`)];
const EMOJI = /\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]|[⭐☆✓✖▶]/u;

test("screens and UI helpers contain no emoji glyphs", () => {
  for (const file of FILES) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      assert.doesNotMatch(line, EMOJI, `${file}:${i + 1} still has an emoji: ${line.trim()}`);
    });
  }
});
