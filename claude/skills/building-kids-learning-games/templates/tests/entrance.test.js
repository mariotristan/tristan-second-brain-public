import { test } from "node:test";
import assert from "node:assert/strict";
import { BRUNO_SVG } from "../js/bruno.js";
import { GATE_SVG } from "../js/entrance.js";
import { STRINGS } from "../js/data/strings.js";

const external = /https?:|href=|<image|<script|on\w+=/i;

test("Bruno's drawing has the parts that animate and loads nothing external", () => {
  assert.match(BRUNO_SVG, /^<svg [^>]*viewBox="[-\d.\s]+"/);
  assert.match(BRUNO_SVG, /aria-hidden="true"/);
  assert.match(BRUNO_SVG, /class="bruno-wave"/, "waving arm");
  assert.match(BRUNO_SVG, /class="bruno-eyes"/, "blinking eyes");
  assert.match(BRUNO_SVG, />BRUNO</, "name patch");
  assert.doesNotMatch(BRUNO_SVG, external);
});

test("the zoo gate has two doors that can swing open and loads nothing external", () => {
  assert.match(GATE_SVG, /^<svg [^>]*viewBox="[\d.\s]+"/);
  assert.match(GATE_SVG, /aria-hidden="true"/);
  assert.match(GATE_SVG, /class="gate-door gate-door-left"/);
  assert.match(GATE_SVG, /class="gate-door gate-door-right"/);
  assert.doesNotMatch(GATE_SVG, external);
});

test("the Enter button is labelled in both languages", () => {
  assert.equal(STRINGS.enter.en, "Enter");
  assert.equal(STRINGS.enter.es, "Entrar");
});
