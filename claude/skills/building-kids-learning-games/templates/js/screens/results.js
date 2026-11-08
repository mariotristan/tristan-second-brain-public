import { h, screen, bruno, starsRow, stickerCard } from "../ui.js";
import { getAnimal } from "../data/animals.js";
import { icon } from "../icons.js";

export function render(root, ctx) {
  const { zoneId, stars, newStickers = [], unlocked = [] } = ctx.params;
  if (!zoneId || ![1, 2, 3].includes(stars)) return ctx.navigate("map");

  const zoneName = (id) => ctx.localized(ctx.data.ZONES.find((z) => z.id === id).name);

  root.append(
    screen(
      h("h1", { tabindex: "-1" }, icon("celebrate"), ctx.t("resultsTitle")),
      bruno(ctx, [
        ctx.t(`brunoResults${stars}`),
        newStickers.length ? ctx.t("newStickers") : null,
        ...unlocked.map((id) => ctx.t("zoneUnlocked", { zone: zoneName(id) })),
      ].filter(Boolean).join(" ")),
      h("div", { class: "stars", role: "img", "aria-label": ctx.t("bestStarsLabel", { n: stars }) }, starsRow(stars)),
      newStickers.length
        ? [h("h2", {}, ctx.t("newStickers")),
           h("div", { class: "grid" }, newStickers.map((id) => stickerCard(ctx, getAnimal(id), true)))]
        : null,
      unlocked.map((id) => h("p", { class: "bubble unlocked" }, icon("unlock"), ctx.t("zoneUnlocked", { zone: zoneName(id) }))),
      h("div", { class: "row" },
        h("button", { onclick: () => ctx.navigate("quiz", { zoneId }) }, icon("playAgain"), ctx.t("playAgain")),
        h("button", { class: "btn-primary", onclick: () => ctx.navigate("map") }, icon("map"), ctx.t("toMap"))),
    ),
  );
}
