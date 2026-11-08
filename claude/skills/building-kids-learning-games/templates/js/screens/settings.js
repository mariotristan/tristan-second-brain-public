import { h, screen, bruno, backButton, languageToggle, animalArt } from "../ui.js";
import { setSetting, resetProgress } from "../progress.js";
import { CREDITS } from "../data/credits.js";
import { getAnimal } from "../data/animals.js";
import { icon } from "../icons.js";

export function render(root, ctx) {
  const toggle = (key, label) =>
    h("div", { class: "setting-row" },
      h("span", {}, label),
      h(
        "button",
        {
          "aria-label": label,
          "data-focus": `setting-${key}`,
          "aria-pressed": String(ctx.state.settings[key]),
          onclick: () => {
            ctx.update((s) => setSetting(s, key, !s.settings[key]));
            ctx.rerender();
          },
        },
        ctx.state.settings[key] ? ctx.t("on") : ctx.t("off"),
      ));

  const resetArea = h("div", { class: "setting-row" });
  const showReset = () => {
    const reset = h("button", { onclick: showConfirm }, icon("reset"), ctx.t("resetProgress"));
    resetArea.replaceChildren(h("span", {}, ctx.t("resetProgress")), reset);
    return reset;
  };
  const showConfirm = () => {
    const no = h("button", { onclick: () => showReset().focus() }, ctx.t("no"));
    resetArea.replaceChildren(
      h("span", {}, ctx.t("resetConfirm")),
      h("div", { class: "row" },
        h("button", { class: "btn-danger", onclick: () => { ctx.update(resetProgress); ctx.navigate("map"); } }, ctx.t("yes")),
        no),
    );
    no.focus();
  };
  showReset();

  const credits = CREDITS.length
    ? h("ul", {}, CREDITS.map((c) => {
        const animal = getAnimal(c.animal);
        return h("li", {},
          animalArt(animal, "art credit-art"), `${ctx.localized(animal.name)}: “${c.title}” — ${c.author}. `,
          h("a", { href: c.source, target: "_blank", rel: "noopener" }, ctx.t("sourceLink")),
          " · ",
          h("a", { href: c.licenseUrl, target: "_blank", rel: "noopener" }, c.license));
      }))
    : h("p", {}, ctx.t("noCredits"));

  root.append(
    screen(
      h("div", { class: "topbar" }, backButton(ctx, "map")),
      h("h1", { tabindex: "-1" }, icon("settings"), ctx.t("settings")),
      bruno(ctx, ctx.t("brunoSettings")),
      h("div", { class: "setting-row" }, h("span", {}, ctx.t("language")), languageToggle(ctx)),
      toggle("sfx", ctx.t("soundEffects")),
      toggle("voice", ctx.t("brunoVoice")),
      resetArea,
      h("div", { class: "credits" },
        h("h2", {}, ctx.t("artwork")),
        h("ul", {},
          h("li", {}, `${ctx.t("artworkAnimals")}: `,
            h("a", { href: "https://github.com/microsoft/fluentui-emoji", target: "_blank", rel: "noopener" }, "Microsoft Fluent Emoji"),
            " · MIT"),
          h("li", {}, `${ctx.t("artworkIcons")}: `,
            h("a", { href: "https://phosphoricons.com/", target: "_blank", rel: "noopener" }, "Phosphor Icons"),
            " · MIT")),
        h("h2", {}, ctx.t("credits")),
        credits),
    ),
  );
}
