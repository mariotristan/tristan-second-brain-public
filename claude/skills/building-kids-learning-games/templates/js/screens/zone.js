import { h, screen, bruno, backButton, animalArt, zoneArt } from "../ui.js";
import { markVisited, isQuizUnlocked, isZoneUnlocked, visitedCount } from "../progress.js";
import { animalsInZone } from "../data/animals.js";
import { icon } from "../icons.js";

export function render(root, ctx) {
  const { zoneId, quiet = false } = ctx.params;
  const zone = ctx.data.ZONES.find((z) => z.id === zoneId);
  if (!zone || !isZoneUnlocked(ctx.state, zone)) return ctx.navigate("map");

  const animals = animalsInZone(zoneId);
  const quizReady = isQuizUnlocked(ctx.state, zoneId, ctx.data.ANIMALS);

  const openCard = (animal, opener) => {
    const wasReady = isQuizUnlocked(ctx.state, zoneId, ctx.data.ANIMALS);
    ctx.update((s) => markVisited(s, animal.id));
    const justUnlocked = !wasReady && isQuizUnlocked(ctx.state, zoneId, ctx.data.ANIMALS);

    const name = ctx.localized(animal.name);
    const fact = ctx.localized(animal.fact);
    const line = animal.sound ? fact : `${ctx.t("quietAnimal")} ${fact}`;
    const screenEl = root.querySelector(".screen");
    const openedAt = Date.now();
    let downOnBackdrop = false;
    const onEscape = (e) => {
      if (!overlay.isConnected) return document.removeEventListener("keydown", onEscape);
      if (e.key === "Escape") close();
    };
    const close = () => {
      document.removeEventListener("keydown", onEscape);
      screenEl?.removeAttribute("inert");
      opener?.focus();
      ctx.navigate("zone", { zoneId, quiet: !justUnlocked });
    };

    const closeBtn = h("button", { "aria-label": ctx.t("close"), onclick: close }, icon("close"));
    const overlay = h(
      "div",
      {
        class: "card-overlay",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": name,
        onpointerdown: (e) => { downOnBackdrop = e.target === overlay; },
        onclick: (e) => {
          if (downOnBackdrop && e.target === overlay && Date.now() - openedAt > 400) close();
          downOnBackdrop = false;
        },
      },
      h("div", { class: "card" },
        animalArt(animal, "art art-big"),
        h("p", { class: "name" }, name),
        bruno(ctx, line, { speakNow: false }),
        h("div", { class: "row" },
          animal.sound
            ? h("button", { "aria-label": ctx.t("playSound"), onclick: () => ctx.audio.playSound(animal.sound) }, icon("sound"))
            : null,
          h("button", { "aria-label": ctx.t("sayName"), onclick: () => ctx.audio.speak(name) }, icon("sayName")),
          closeBtn)),
    );
    root.append(overlay);
    screenEl?.setAttribute("inert", "");
    document.addEventListener("keydown", onEscape);
    closeBtn.focus();
    ctx.audio.playSound(animal.sound).then(() => {
      if (overlay.isConnected) ctx.audio.speak(`${name}. ${line}`);
    });
  };

  const tiles = animals.map((animal) => {
    const seen = Boolean(ctx.state.visited[animal.id]);
    const name = ctx.localized(animal.name);
    return h(
      "button",
      {
        class: "animal-btn",
        "data-focus": `animal-${animal.id}`,
        "aria-label": seen ? `${name}, ${ctx.t("visited")}` : name,
        onclick: (e) => openCard(animal, e.currentTarget),
      },
      animalArt(animal),
      seen ? h("span", { class: "check", "aria-hidden": "true" }, icon("check")) : null,
    );
  });

  const lockedLine = ctx.t("quizLocked", { n: visitedCount(ctx.state, zoneId, ctx.data.ANIMALS) });
  const quizButton = quizReady
    ? h("button", { class: "btn-primary", onclick: () => ctx.navigate("quiz", { zoneId }) }, icon("quiz"), ctx.t("quiz"))
    : h("button", { class: "btn-primary", "aria-disabled": "true", onclick: () => ctx.audio.speak(lockedLine) },
        icon("lock"), lockedLine);

  root.append(
    screen(
      h("div", { class: "topbar" }, backButton(ctx, "map")),
      h("h1", { tabindex: "-1" }, zoneArt(zone, "art title-art"), ctx.localized(zone.name)),
      bruno(ctx, ctx.t(quizReady ? "brunoQuizReady" : "brunoZone"), { speakNow: !quiet }),
      h("div", { class: "grid" }, tiles),
      h("div", { class: "row" }, quizButton),
    ),
  );
}
