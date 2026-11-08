import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync, readFileSync } from "node:fs";
import { ANIMALS } from "../js/data/animals.js";
import { CREDITS } from "../js/data/credits.js";

const ALLOWED = /^(Public domain|CC0( 1\.0)?|CC BY( \d\.\d)?|CC BY-SA( \d\.\d)?)$/;
const withSound = ANIMALS.filter((a) => a.sound);

test("every sound file exists and is under 60 KB", () => {
  for (const a of withSound) {
    assert.ok(existsSync(a.sound), `missing ${a.sound}`);
    assert.ok(statSync(a.sound).size < 60 * 1024, `${a.sound} too big`);
  }
});

test("every sound is at least ~2 s long (64 kbps mono: bytes * 8 / 64000)", () => {
  for (const a of withSound) {
    const seconds = (statSync(a.sound).size * 8) / 64000;
    assert.ok(seconds >= 1.8, `${a.sound} is only ~${seconds.toFixed(1)} s`);
  }
});

test("every sound has exactly one complete credit with an allowed license", () => {
  for (const a of withSound) {
    const matches = CREDITS.filter((c) => c.file === a.sound);
    assert.equal(matches.length, 1, a.sound);
    const c = matches[0];
    assert.equal(c.animal, a.id);
    for (const key of ["title", "author", "source", "license", "licenseUrl"]) assert.ok(c[key]?.trim(), `${a.id}.${key}`);
    assert.match(c.license, ALLOWED, `${a.id} license`);
    assert.match(c.source, /^https:\/\//);
  }
  assert.equal(CREDITS.length, withSound.length, "no extra credits");
});

test("CREDITS.md is generated from credits.js", () => {
  const md = readFileSync("CREDITS.md", "utf8");
  for (const c of CREDITS) {
    assert.ok(md.includes(c.file), `CREDITS.md missing ${c.file}`);
    assert.ok(md.includes(c.source), `CREDITS.md missing ${c.source}`);
  }
});

test("CREDITS.md credits the artwork projects", () => {
  const md = readFileSync("CREDITS.md", "utf8");
  assert.match(md, /Fluent Emoji/);
  assert.match(md, /Phosphor Icons/);
});
