import { h, screen, bruno, languageToggle, svgElement, animalArt } from "../ui.js";
import { GATE_SVG } from "../entrance.js";
import { getAnimal } from "../data/animals.js";
import { icon } from "../icons.js";

const GATE_OPEN_MS = 900;
const reduceMotion = () => globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// The zoo entrance: tap Enter, the gates swing open, and you walk in to the Zoo Map.
export function render(root, ctx) {
  let opening = false;
  const view = screen();
  view.classList.add("entrance");

  const enter = () => {
    if (opening) return;
    opening = true;
    if (reduceMotion()) return ctx.navigate("map");
    view.classList.add("opening");
    ctx.audio.chime("correct");
    setTimeout(() => {
      if (view.isConnected) ctx.navigate("map");
    }, GATE_OPEN_MS);
  };

  const gate = h("div", { class: "gate" },
    svgElement(GATE_SVG),
    animalArt(getAnimal("lion"), "gate-topper gate-topper-left"),
    animalArt(getAnimal("elephant"), "gate-topper gate-topper-right"),
    h("h1", { class: "gate-sign", tabindex: "-1" }, ctx.t("appTitle")),
    h("button", { class: "btn-primary gate-enter", onclick: enter }, icon("enter"), ctx.t("enter")),
  );

  view.append(
    h("div", { class: "entrance-layout" },
      bruno(ctx, ctx.t("brunoWelcome")),
      gate),
    languageToggle(ctx, { onChange: () => ctx.audio.speak(ctx.t("brunoWelcome")) }),
  );
  root.append(view);
}
