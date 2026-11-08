import { h, screen, bruno, starsRow, zoneArt } from "../ui.js";
import { isZoneUnlocked, totalStars } from "../progress.js";
import { icon } from "../icons.js";

export function render(root, ctx) {
  const { state } = ctx;
  const brunoEl = bruno(ctx, ctx.t("brunoMap"));

  const tiles = ctx.data.ZONES.map((zone) => {
    const name = ctx.localized(zone.name);
    const unlocked = isZoneUnlocked(state, zone);
    const best = state.bestStars[zone.id] ?? 0;
    const lockedLine = ctx.t("lockedZone", { zone: name, n: zone.threshold });
    return h(
      "button",
      {
        class: unlocked ? "zone-tile" : "zone-tile locked",
        style: `--zone-color: ${zone.color}`,
        "aria-label": unlocked ? `${name}, ${ctx.t("bestStarsLabel", { n: best })}` : lockedLine,
        onclick: () => (unlocked ? ctx.navigate("zone", { zoneId: zone.id }) : brunoEl.say(lockedLine)),
      },
      unlocked ? zoneArt(zone) : icon("lock"),
      h("span", { "aria-hidden": "true" }, name),
      h("span", { class: "sub", "aria-hidden": "true" },
        unlocked ? starsRow(best) : [ctx.t("starsNeeded", { n: zone.threshold }), icon("star")]),
    );
  });

  root.append(
    screen(
      h("div", { class: "topbar" },
        h("button", { "aria-label": ctx.t("back"), onclick: () => ctx.navigate("welcome") }, icon("back")),
        h("span", { class: "pill" }, icon("star"), ctx.t("totalStars", { n: totalStars(state) })),
        h("div", { class: "row" },
          h("button", { "aria-label": ctx.t("stickerBook"), onclick: () => ctx.navigate("stickers") }, icon("stickers")),
          h("button", { "aria-label": ctx.t("settings"), onclick: () => ctx.navigate("settings") }, icon("settings")))),
      h("h1", { tabindex: "-1" }, ctx.t("mapTitle")),
      brunoEl,
      h("div", { class: "grid" }, tiles),
    ),
  );
}
