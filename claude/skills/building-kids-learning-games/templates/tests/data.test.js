import { test } from "node:test";
import assert from "node:assert/strict";
import { ZONES, ANIMALS, animalsInZone, getAnimal } from "../js/data/animals.js";

const QUIET = ["giraffe", "shark", "octopus", "sea-turtle", "arctic-fox", "beaver"];
const isText = (v) => typeof v === "string" && v.trim().length > 0;

test("zones are in unlock order with the spec thresholds", () => {
  assert.deepEqual(
    ZONES.map((z) => [z.id, z.threshold]),
    [["savanna", 0], ["jungle", 2], ["ocean", 4], ["polar", 6], ["farm", 8], ["forest", 10]],
  );
});

test("every zone has an emoji, colors, and a name in both languages", () => {
  for (const z of ZONES) {
    assert.ok(isText(z.emoji), z.id);
    for (const key of ["color", "sky", "ground"]) assert.match(z[key], /^#[0-9a-f]{6}$/i, `${z.id}.${key}`);
    assert.ok(isText(z.name.en) && isText(z.name.es), z.id);
  }
});

test("36 animals, 6 per zone, unique ids", () => {
  assert.equal(ANIMALS.length, 36);
  assert.equal(new Set(ANIMALS.map((a) => a.id)).size, 36);
  for (const z of ZONES) assert.equal(animalsInZone(z.id).length, 6, z.id);
  for (const a of ANIMALS) assert.ok(ZONES.some((z) => z.id === a.zone), `${a.id} zone`);
});

test("every animal has an emoji and en/es name, fact, and myth", () => {
  for (const a of ANIMALS) {
    assert.ok(isText(a.emoji), a.id);
    for (const field of ["name", "fact", "myth"]) {
      assert.ok(isText(a[field]?.en), `${a.id}.${field}.en`);
      assert.ok(isText(a[field]?.es), `${a.id}.${field}.es`);
    }
    assert.notEqual(a.fact.en, a.myth.en, `${a.id} fact vs myth`);
  }
});

test("quiet animals have no sound; all others use sounds/<id>.mp3", () => {
  for (const a of ANIMALS) {
    if (QUIET.includes(a.id)) assert.equal(a.sound, null, a.id);
    else assert.equal(a.sound, `sounds/${a.id}.mp3`, a.id);
  }
});

test("getAnimal finds by id", () => {
  assert.equal(getAnimal("lion").emoji, "🦁");
  assert.equal(getAnimal("nope"), undefined);
});
