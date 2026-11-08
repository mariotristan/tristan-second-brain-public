import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ICONS } from "../js/icons-data.js";
import { ICON_NAMES, FLAGS } from "../js/icons.js";

const external = /https?:|href=|<image|<script|on\w+=/i;

test("every icon the game uses exists as SVG path markup", () => {
  assert.deepEqual(Object.keys(ICONS).sort(), [...ICON_NAMES].sort());
  for (const name of ICON_NAMES) {
    assert.match(ICONS[name], /^<path /, `${name} starts with a path`);
    assert.doesNotMatch(ICONS[name], external, name);
  }
});

test("flags are self-contained SVGs for both languages", () => {
  for (const lang of ["en", "es"]) {
    assert.match(FLAGS[lang], /^<svg [^>]*viewBox="0 0 30 20"/, lang);
    assert.doesNotMatch(FLAGS[lang], external, lang);
  }
});

test("the Phosphor Icons MIT license is included", () => {
  const text = readFileSync("art/LICENSE-phosphor-icons.txt", "utf8");
  assert.match(text, /MIT License/);
  assert.match(text, /Phosphor Icons/);
});
