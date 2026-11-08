import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { ANIMALS, ZONES } from "../js/data/animals.js";

const MAX_BYTES = 30 * 1024;

function assertWebp(path) {
  assert.ok(existsSync(path), `missing ${path}`);
  const bytes = readFileSync(path);
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF", `${path} is not RIFF`);
  assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP", `${path} is not WebP`);
  assert.ok(statSync(path).size < MAX_BYTES, `${path} is over 30 KB`);
}

test("every animal has a WebP picture under 30 KB", () => {
  for (const animal of ANIMALS) assertWebp(`art/animals/${animal.id}.webp`);
});

test("every zone has a WebP picture under 30 KB", () => {
  for (const zone of ZONES) assertWebp(`art/zones/${zone.id}.webp`);
});

test("the Fluent Emoji MIT license is included", () => {
  const text = readFileSync("art/LICENSE-fluentui-emoji.txt", "utf8");
  assert.match(text, /MIT License/);
  assert.match(text, /Microsoft/);
});
