import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { STRINGS } from "../js/data/strings.js";
import { t, localized, setLang, getLang } from "../js/i18n.js";

const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

beforeEach(() => setLang("en"));

test("every string has non-empty en and es with the same placeholders", () => {
  for (const [key, value] of Object.entries(STRINGS)) {
    assert.ok(value.en?.trim(), `${key}.en`);
    assert.ok(value.es?.trim(), `${key}.es`);
    assert.deepEqual(placeholders(value.en), placeholders(value.es), `${key} placeholders`);
  }
});

test("t returns the current language", () => {
  assert.equal(t("enter"), "Enter");
  setLang("es");
  assert.equal(getLang(), "es");
  assert.equal(t("enter"), "Entrar");
});

test("t interpolates variables and leaves unknown placeholders", () => {
  assert.equal(t("totalStars", { n: 5 }), "Stars: 5");
  assert.equal(t("totalStars"), "Stars: {n}");
});

test("t returns the key for unknown keys", () => {
  assert.equal(t("doesNotExist"), "doesNotExist");
  assert.equal(t("constructor"), "constructor");
});

test("setLang ignores unsupported languages", () => {
  setLang("fr");
  assert.equal(getLang(), "en");
});

test("localized picks the language and falls back to en", () => {
  setLang("es");
  assert.equal(localized({ en: "Lion", es: "León" }), "León");
  assert.equal(localized({ en: "Lion" }), "Lion");
});
