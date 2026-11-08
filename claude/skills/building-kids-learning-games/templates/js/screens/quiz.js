import { h, screen, bruno, backButton, animalArt, zoneArt } from "../ui.js";
import { buildQuiz, scoreAttempt, createSession, currentQuestion, answer, advance, isFinished } from "../quiz.js";
import { isQuizUnlocked, recordQuizResult, newStickerIds, newlyUnlockedZones } from "../progress.js";
import { getAnimal } from "../data/animals.js";
import { icon } from "../icons.js";

const NEXT_DELAY_MS = 1400;
const pick = (keys) => keys[Math.floor(Math.random() * keys.length)];

export function render(root, ctx) {
  const { zoneId } = ctx.params;
  const zone = ctx.data.ZONES.find((z) => z.id === zoneId);
  if (!zone || !isQuizUnlocked(ctx.state, zoneId, ctx.data.ANIMALS)) return ctx.navigate("map");

  let session = createSession(
    buildQuiz(zoneId, ctx.data.ANIMALS, Math.random, { allowSound: ctx.state.settings.sfx }),
  );
  const view = screen();
  root.append(view);

  const choiceButton = (q, choice) => {
    if (q.type === "truefalse") {
      return h("button", { class: "choice" }, icon(choice ? "thumbsUp" : "thumbsDown"), ctx.t(choice ? "true" : "false"));
    }
    const animal = getAnimal(choice);
    const name = ctx.localized(animal.name);
    return h("button", { class: "choice", "aria-label": name },
      animalArt(animal),
      q.type === "sound" ? h("span", { "aria-hidden": "true" }, name) : null);
  };

  const finish = () => {
    const score = scoreAttempt(session.results);
    const before = ctx.state;
    const newStickers = newStickerIds(before, score.stickerIds);
    ctx.update((s) => recordQuizResult(s, zoneId, score));
    const unlocked = newlyUnlockedZones(before, ctx.state, ctx.data.ZONES);
    ctx.navigate("results", { zoneId, stars: score.stars, correct: score.correct, newStickers, unlocked });
  };

  const showQuestion = () => {
    const q = currentQuestion(session);
    const animal = getAnimal(q.animalId);
    const prompt =
      q.type === "sound" ? ctx.t("qSound")
      : q.type === "name" ? ctx.t("qName", { name: ctx.localized(animal.name) })
      : `${ctx.t("qTrueFalse")} ${ctx.localized(animal[q.statement])}`;
    const brunoEl = bruno(ctx, prompt, { speakNow: q.type !== "sound" });

    const visual =
      q.type === "sound"
        ? h("div", { class: "row" },
            h("button", { class: "replay", "aria-label": ctx.t("playSound"), onclick: () => ctx.audio.playSound(animal.sound) }, icon("sound")))
        : q.type === "truefalse"
          ? h("div", { class: "question-visual", "aria-hidden": "true" }, animalArt(animal))
          : null;

    const buttons = q.choices.map((choice) => {
      const btn = choiceButton(q, choice);
      btn.addEventListener("click", () => {
        const result = answer(session, choice);
        session = result.session;
        if (result.outcome === "wrong") {
          btn.disabled = true;
          ctx.audio.chime("wrong");
          brunoEl.say(ctx.t(q.type === "sound" ? "encourageSound" : pick(["encourage1", "encourage2"])));
        } else if (result.outcome === "correct") {
          btn.classList.add("correct");
          ctx.audio.chime("correct");
          brunoEl.say(ctx.t(pick(["cheer1", "cheer2", "cheer3"])));
          setTimeout(() => {
            if (!view.isConnected) return; // player left the quiz
            session = advance(session);
            if (isFinished(session)) finish();
            else showQuestion();
          }, NEXT_DELAY_MS);
        }
      });
      return btn;
    });

    view.replaceChildren(...[
      h("div", { class: "topbar" },
        backButton(ctx, "zone", { zoneId, quiet: true }),
        h("span", { class: "pill progress-text" },
          ctx.t("questionOf", { n: session.index + 1, total: session.questions.length }))),
      h("h1", { tabindex: "-1" }, zoneArt(zone, "art title-art"), ctx.t("quiz")),
      brunoEl,
      visual,
      h("div", { class: "choices" }, buttons),
    ].filter(Boolean)); // visual is null for name questions
    view.querySelector("h1").focus();

    if (q.type === "sound") {
      ctx.audio.speak(prompt).then(() => {
        if (view.isConnected && !session.awaitingNext && currentQuestion(session) === q) ctx.audio.playSound(animal.sound);
      });
    }
  };

  showQuestion();
}
