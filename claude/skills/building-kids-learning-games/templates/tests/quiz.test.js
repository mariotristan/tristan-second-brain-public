import { test } from "node:test";
import assert from "node:assert/strict";
import { ANIMALS, ZONES, getAnimal } from "../js/data/animals.js";
import {
  shuffle, buildQuiz, starsFor, scoreAttempt,
  createSession, currentQuestion, answer, advance, isFinished,
} from "../js/quiz.js";
import { seededRng } from "./helpers.js";

const SEEDS = Array.from({ length: 50 }, (_, i) => i + 1);

test("shuffle keeps every item and does not mutate the input", () => {
  const input = [1, 2, 3, 4, 5];
  const out = shuffle(input, seededRng(1));
  assert.deepEqual([...out].sort(), [1, 2, 3, 4, 5]);
  assert.deepEqual(input, [1, 2, 3, 4, 5]);
});

test("each zone quiz has 6 questions, one per animal", () => {
  for (const zone of ZONES) {
    for (const seed of SEEDS) {
      const quiz = buildQuiz(zone.id, ANIMALS, seededRng(seed));
      assert.equal(quiz.length, 6);
      const ids = quiz.map((q) => q.animalId).sort();
      const expected = ANIMALS.filter((a) => a.zone === zone.id).map((a) => a.id).sort();
      assert.deepEqual(ids, expected);
    }
  }
});

test("answer is always among choices and choices are unique", () => {
  for (const zone of ZONES) {
    for (const seed of SEEDS) {
      for (const q of buildQuiz(zone.id, ANIMALS, seededRng(seed))) {
        assert.ok(q.choices.includes(q.answer), JSON.stringify(q));
        assert.equal(new Set(q.choices).size, q.choices.length);
        if (q.type === "truefalse") {
          assert.deepEqual(q.choices, [true, false]);
          assert.equal(q.answer, q.statement === "fact");
        } else {
          assert.equal(q.choices.length, 3);
          assert.equal(q.answer, q.animalId);
        }
      }
    }
  }
});

test("distractors come from the same zone (zones have enough animals)", () => {
  for (const seed of SEEDS) {
    for (const q of buildQuiz("savanna", ANIMALS, seededRng(seed))) {
      if (q.type === "truefalse") continue;
      for (const id of q.choices) assert.equal(getAnimal(id).zone, "savanna");
    }
  }
});

test("distractors fall back to other zones when the zone is too small", () => {
  const tiny = [ANIMALS.find((a) => a.id === "lion"), ...ANIMALS.filter((a) => a.zone === "farm")];
  for (const seed of SEEDS) {
    const [q] = buildQuiz("savanna", tiny, seededRng(seed));
    if (q.type === "truefalse") continue;
    assert.equal(q.choices.length, 3);
    assert.ok(q.choices.includes("lion"));
  }
});

test("sound questions never use quiet animals", () => {
  for (const zone of ZONES) {
    for (const seed of SEEDS) {
      for (const q of buildQuiz(zone.id, ANIMALS, seededRng(seed))) {
        if (q.type === "sound") assert.ok(getAnimal(q.animalId).sound, q.animalId);
      }
    }
  }
});

test("all three question types appear across seeds", () => {
  const types = new Set();
  for (const seed of SEEDS) for (const q of buildQuiz("farm", ANIMALS, seededRng(seed))) types.add(q.type);
  assert.deepEqual([...types].sort(), ["name", "sound", "truefalse"]);
});

test("allowSound: false produces no sound questions", () => {
  for (const zone of ZONES) {
    for (const seed of SEEDS) {
      const quiz = buildQuiz(zone.id, ANIMALS, seededRng(seed), { allowSound: false });
      assert.ok(quiz.every((q) => q.type !== "sound"));
    }
  }
});

test("buildQuiz is deterministic for the same seed", () => {
  assert.deepEqual(
    buildQuiz("jungle", ANIMALS, seededRng(42)),
    buildQuiz("jungle", ANIMALS, seededRng(42)),
  );
});

test("star boundaries: 6→3, 5→2, 4→2, 3→1, 0→1", () => {
  assert.equal(starsFor(6), 3);
  assert.equal(starsFor(5), 2);
  assert.equal(starsFor(4), 2);
  assert.equal(starsFor(3), 1);
  assert.equal(starsFor(0), 1);
});

test("scoreAttempt counts first-try answers and lists their stickers", () => {
  const results = [
    { animalId: "lion", firstTry: true },
    { animalId: "zebra", firstTry: false },
    { animalId: "hippo", firstTry: true },
    { animalId: "rhino", firstTry: true },
    { animalId: "giraffe", firstTry: true },
    { animalId: "elephant", firstTry: false },
  ];
  assert.deepEqual(scoreAttempt(results), {
    correct: 4, stars: 2, stickerIds: ["lion", "hippo", "rhino", "giraffe"],
  });
});

const twoQuestions = [
  { type: "name", animalId: "lion", choices: ["zebra", "lion", "hippo"], answer: "lion" },
  { type: "truefalse", animalId: "zebra", statement: "myth", choices: [true, false], answer: false },
];

test("session: correct on first try is recorded once, double tap ignored", () => {
  let s = createSession(twoQuestions);
  let r = answer(s, "lion");
  assert.equal(r.outcome, "correct");
  s = r.session;
  r = answer(s, "lion");
  assert.equal(r.outcome, "ignored");
  assert.deepEqual(r.session.results, [{ animalId: "lion", firstTry: true }]);
});

test("session: wrong then right is not first try; repeated wrong is ignored", () => {
  let s = createSession(twoQuestions);
  let r = answer(s, "zebra");
  assert.equal(r.outcome, "wrong");
  s = r.session;
  assert.equal(answer(s, "zebra").outcome, "ignored");
  r = answer(s, "lion");
  assert.deepEqual(r.session.results, [{ animalId: "lion", firstTry: false }]);
});

test("session: choices that are not offered are ignored", () => {
  const s = createSession(twoQuestions);
  assert.equal(answer(s, "penguin").outcome, "ignored");
});

test("session: advance only after a correct answer, finishes after last", () => {
  let s = createSession(twoQuestions);
  assert.equal(advance(s), s);
  s = advance(answer(s, "lion").session);
  assert.equal(currentQuestion(s).animalId, "zebra");
  assert.equal(isFinished(s), false);
  s = answer(s, true).session;
  assert.equal(isFinished(s), false);
  s = answer(s, false).session;
  s = advance(s);
  assert.equal(isFinished(s), true);
  assert.equal(currentQuestion(s), null);
  assert.deepEqual(s.results, [
    { animalId: "lion", firstTry: true },
    { animalId: "zebra", firstTry: false },
  ]);
});
