import { h, screen, bruno, backButton, stickerCard, zoneArt } from "../ui.js";
import { animalsInZone } from "../data/animals.js";
import { icon } from "../icons.js";

export function render(root, ctx) {
  const earned = Object.keys(ctx.state.stickers).length;
  root.append(
    screen(
      h("div", { class: "topbar" },
        backButton(ctx, "map"),
        h("span", { class: "pill" }, ctx.t("stickerCount", { n: earned, total: ctx.data.ANIMALS.length }))),
      h("h1", { tabindex: "-1" }, icon("stickers"), ctx.t("stickerBook")),
      bruno(ctx, ctx.t("brunoStickers")),
      ctx.data.ZONES.map((zone) => [
        h("h2", {}, zoneArt(zone, "art title-art"), ctx.localized(zone.name)),
        h("div", { class: "grid" },
          animalsInZone(zone.id).map((a) => stickerCard(ctx, a, Boolean(ctx.state.stickers[a.id])))),
      ]),
    ),
  );
}
