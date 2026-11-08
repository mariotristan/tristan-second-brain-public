// Pure quiz logic: no DOM, no storage. Pass `rng` for deterministic tests.

export function shuffle(list, rng) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Wrong choices: same zone first, other zones only if the zone runs out.
function pickDistractors(animal, animals, count, rng) {
  const sameZone = shuffle(animals.filter((a) => a.zone === animal.zone && a.id !== animal.id), rng);
  const otherZones = shuffle(animals.filter((a) => a.zone !== animal.zone), rng);
  return [...sameZone, ...otherZones].slice(0, count).map((a) => a.id);
}

function buildQuestion(animal, animals, rng, allowSound) {
  const types = allowSound && animal.sound ? ["sound", "name", "truefalse"] : ["name", "truefalse"];
  const type = types[Math.floor(rng() * types.length)];
  if (type === "truefalse") {
    const answer = rng() < 0.5;
    return { type, animalId: animal.id, statement: answer ? "fact" : "myth", choices: [true, false], answer };
  }
  const choices = shuffle([animal.id, ...pickDistractors(animal, animals, 2, rng)], rng);
  return { type, animalId: animal.id, choices, answer: animal.id };
}

export function buildQuiz(zoneId, animals, rng = Math.random, { allowSound = true } = {}) {
  const zoneAnimals = shuffle(animals.filter((a) => a.zone === zoneId), rng);
  return zoneAnimals.map((animal) => buildQuestion(animal, animals, rng, allowSound));
}

export function starsFor(correctFirstTry) {
  if (correctFirstTry >= 6) return 3;
  if (correctFirstTry >= 4) return 2;
  return 1;
}

export function scoreAttempt(results) {
  const firstTry = results.filter((r) => r.firstTry);
  return {
    correct: firstTry.length,
    stars: starsFor(firstTry.length),
    stickerIds: firstTry.map((r) => r.animalId),
  };
}

// Session reducer: tracks the attempt so the screen stays a thin view.
export function createSession(questions) {
  return { questions, index: 0, wrong: [], awaitingNext: false, results: [] };
}

export function currentQuestion(session) {
  return session.questions[session.index] ?? null;
}

export function answer(session, choice) {
  const q = currentQuestion(session);
  if (!q || session.awaitingNext || !q.choices.includes(choice) || session.wrong.includes(choice)) {
    return { session, outcome: "ignored" };
  }
  if (choice === q.answer) {
    const result = { animalId: q.animalId, firstTry: session.wrong.length === 0 };
    return { outcome: "correct", session: { ...session, awaitingNext: true, results: [...session.results, result] } };
  }
  return { outcome: "wrong", session: { ...session, wrong: [...session.wrong, choice] } };
}

export function advance(session) {
  if (!session.awaitingNext) return session;
  return { ...session, index: session.index + 1, wrong: [], awaitingNext: false };
}

export function isFinished(session) {
  return session.index >= session.questions.length;
}
