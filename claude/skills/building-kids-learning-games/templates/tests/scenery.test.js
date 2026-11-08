import { test } from "node:test";
import assert from "node:assert/strict";
import { SCENES, PARTS, sceneryMarkup } from "../js/scenery.js";
import { ZONES } from "../js/data/animals.js";

test("every zone plus the park has a scene with all layers", () => {
  const ids = [...ZONES.map((z) => z.id), "park"].sort();
  assert.deepEqual(Object.keys(SCENES).sort(), ids);
  for (const [id, scene] of Object.entries(SCENES)) {
    assert.deepEqual(Object.keys(scene).sort(), [...PARTS].sort(), id);
    for (const part of PARTS) {
      assert.match(scene[part], /^<svg [^>]*viewBox="[\d.\s]+"/, `${id}.${part} starts with an svg + viewBox`);
      assert.match(scene[part], /<\/svg>$/, `${id}.${part} closes its svg`);
    }
  }
});

test("scenery loads nothing from outside the game", () => {
  for (const [id, scene] of Object.entries(SCENES)) {
    for (const part of PARTS) {
      assert.doesNotMatch(scene[part], /https?:|href=|<image|<script|on\w+=/i, `${id}.${part}`);
    }
  }
});

test("ids inside the drawings are unique across all scenes", () => {
  const ids = Object.values(SCENES)
    .flatMap((scene) => PARTS.map((part) => scene[part]))
    .flatMap((svg) => [...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  assert.equal(new Set(ids).size, ids.length);
});

test("sceneryMarkup builds one hidden layer per part and falls back to the park", () => {
  const html = sceneryMarkup("ocean");
  for (const part of PARTS) assert.ok(html.includes(`class="sc-${part}"`), part);
  assert.ok(html.includes(SCENES.ocean.ground.slice(-80)), "contains the ocean drawing");
  assert.equal(sceneryMarkup("nope"), sceneryMarkup("park"));
  assert.equal(sceneryMarkup(undefined), sceneryMarkup("park"));
});
