---
name: building-kids-learning-games
description: Use when creating a new kids' educational browser game in the "Bruno" family (Bruno's Zoo, Planet Explorer) or a similar bilingual, offline, installable game for young children hosted on GitHub Pages—e.g. "make a game like the zoo one about dinosaurs/insects/countries", adding zones/quizzes/stickers, or porting the Zoo's PWA, audio, speech, art, or credits setup to another repo.
---

# Building kids' learning games (Bruno family)

## Overview

These are small static web games for kids aged ~6–10, guided by **Bruno**, a drawn SVG character
who talks to the player. The pattern has been proven twice: **Bruno's Zoo** (reference implementation; optional to read since `templates/` is enough,
`~/code/personal/animals`, https://github.com/<user>/animals) and **Planet Explorer**
(`~/code/personal/planets`). Start each new game from these templates. Don't redesign the stack or
rediscover the pitfalls listed below.

**REQUIRED SUB-SKILLS:** superpowers:brainstorming (spec), then superpowers:writing-plans. Save the spec
to `docs/superpowers/specs/` and the plan to `docs/superpowers/plans/`, as in the Zoo.
Keep brainstorming short (this overrides brainstorming's one-question-at-a-time pacing for the settled defaults). Present the defaults table below in one message, then ask only about what's
new for this topic (subjects, zones, art coverage, sounds). New projects live in `~/code/personal/<game>`,
and `<game>` doubles as the repo name and the URL path: one short lowercase word (`animals`, `planets`, `bugs`). Start with `CACHE = "<prefix>v1"`.

## Family defaults (confirm in brainstorming; don't ask open-ended)

| Topic | Default |
|---|---|
| Stack | Plain HTML/CSS/JS ES modules, **no build step, no runtime deps, no framework** |
| Tests | `node --test` only; `package.json` exists just for `npm test`. No Vitest/Jest/Playwright deps |
| Hosting | GitHub Pages from `main` branch, folder `/`, empty `.nojekyll`. No Actions workflow |
| Paths | All relative (game runs under `/<repo>/`) |
| Languages | English + Spanish, switchable, saved; every string in both |
| Loop | **Explore** (learn: tap, hear, see name, Bruno says a fact) → **Quiz** (sound / name / true-false) → stars, stickers, unlockable zones |
| Sizing | Zones × 6 items. Zone *n* unlocks at 2·n total stars (0, 2, 4, …), so 2★ everywhere opens everything. Quiz = one question per item; 6 first-try → 3★, 4–5 → 2★, else 1★; zone keeps its best |
| Stickers | One per item, earned permanently by a first-try correct answer. The Sticker Book shows silhouettes for unearned stickers |
| Kindness | Nobody fails: a wrong answer dims that option, Bruno encourages, the kid retries. Stars count only first-try answers |
| Bruno | SVG character (`bruno.js`), CSS float/wave/blink, speech bubble that "pops", tap to repeat. Speaks via `speechSynthesis` |
| Art | Fluent Emoji **3D** WebP (MIT) for subjects; **Phosphor** fill icons (MIT) for buttons; drawn SVG scenery; never device emoji in UI |
| Sounds | Real recordings: PD/CC0 > CC BY > CC BY-SA. Never NC/ND/unlicensed. Mono MP3 64 kbps, 2–5 s, <60 KB |
| Offline | Installable PWA (manifest + `sw.js` precache), iPad-first |
| Privacy | No accounts, ads, analytics, CDNs, or web fonts. Progress only in localStorage |
| Identity | Commit as `<user>`; publish with the `<user>` gh account (see Publishing) |
| A11y | Real `<button>`s, localized `aria-label`s, ≥64 px targets, works from 360 px up, `prefers-reduced-motion` stops all animation |
| License | MIT for code; `CREDITS.md` + in-game credits for every asset |

## Architecture (copy from `templates/`)

```
index.html  manifest.webmanifest  sw.js  .nojekyll  LICENSE  CREDITS.md  package.json
js/main.js          router + ctx {state, params, t, localized, audio, update(fn), navigate, rerender}
js/data/<items>.js  content records: { id, zone, emoji, sound|null, name:{en,es}, fact:{en,es}, myth:{en,es} }
js/data/strings.js  every UI string and Bruno line, { en, es }, `{placeholders}`
js/data/credits.js  one entry per sound → scripts/credits-md.js generates CREDITS.md
js/i18n.js  js/audio.js  js/progress.js (PURE + injected storage)  js/quiz.js (PURE, injected rng)
js/ui.js (h(), art() with emoji fallback, bruno(), starsRow)  js/icons.js + icons-data.js (generated)
js/bruno.js  js/scenery.js  js/screens/*.js (each exports render(root, ctx), no long-lived state)
art/<kind>/<id>.webp  sounds/<id>.mp3  icons/icon-{180,192,512}.png
scripts/ fetch-art.sh  build-icons.js  make-icons.sh  credits-md.js   (dev-only)
tests/  pwa, data integrity, sounds+credits, quiz, progress, emoji-guard, modules
```

`templates/` is a complete copy of the Zoo's game (data, screens, tests, scripts). Media files aren't included. Copy them, then rename every Zoo-specific
string (`grep -rn "Bruno's Zoo\|bruno-zoo\|animals\|ANIMALS\|zone" .`): `CACHE` in sw.js,
`STORAGE_KEY`, manifest/meta names, test expectations, data imports. Tests also hardcode the Zoo's **shape** (6 zone ids, thresholds, 36 items, max stars, the quiet list). Rewrite those numbers for the new game's zones.

## Pitfalls the templates already solve (keep these when adapting)

| Pitfall | Fix (where) |
|---|---|
| **All family games share the `<user>.github.io` origin**: Cache Storage and localStorage are shared. A SW that deletes "every other cache" wipes the sibling games' offline copies | `CACHE_PREFIX` per game; activate deletes only `startsWith(CACHE_PREFIX)` (template sw.js + pwa test). Unique `STORAGE_KEY` per game |
| iPad Safari won't play audio from a service worker's full 200 response | SW answers `Range` requests with **206** (`partialResponse`/`parseRange` in sw.js) |
| Installed iPads run stale code forever | Code/pages **network-first**; only mp3/png/webp cache-first. Bump `CACHE` when any media file changes |
| Precache list drifts from the repo, so the game breaks offline | `pwa.test.js` asserts PRECACHE == files on disk exactly |
| Speech stops mid-sentence (utterance garbage-collected) | Keep `currentUtterance` reference; cap with timeout (audio.js) |
| Bruno reads emoji aloud ("ear emoji") | `speakable()` strips pictographs before speaking |
| No voice for the language / no speechSynthesis | Text still shows; `speak` is a no-op. `pickVoice` prefers `es-*` / `en-*` |
| Kid double-taps the correct answer | Pure `answer()` ignores input while `awaitingNext` |
| Back pressed mid-quiz; a pending timer re-renders a dead screen | `if (!view.isConnected) return` in every timeout |
| Sounds off, but "Who makes this sound?" still asked | `buildQuiz(..., { allowSound: settings.sfx })`; quiet items never get sound questions |
| localStorage throws (private mode, quota) | `browserStorage()` probe → in-memory; `save` returns false |
| Saved data partly invalid (`bestStars = 99`, `"yes"`) | `validate()` sanitizes field by field; wrong version → fresh state |
| Replay announces old stickers / lowers score | `newStickerIds`, keep **best** stars |
| Emoji look different per device; flag emoji show as "US"/"ES" on Windows | Bundled art + Phosphor icons + drawn SVG flags; `emoji-guard.test.js` bans emoji in screens |
| Image fails to load → blank tile | `art()` swaps in the record's `emoji` on `error` |
| Autoplay blocked | All audio is started by a tap; every audio call is fail-safe (logs, never throws) |

## Content rules

- Facts: true, one short sentence, words a 7-year-old knows. Each item gets a matching false `myth` for true/false questions.
- Spanish: neutral Latin American, gender-neutral when addressing the child ("Te doy la bienvenida", not "Bienvenido").
- Items with no usable recording are "quiet": `sound: null`, and their fact explains how they communicate. Report every swap or quiet item to the user.
- Mixed topics (some items have recordings, some don't): Zoo rules. Keep `sounds.test.js`; the rest are quiet.
- Out-of-group members (spiders in a bugs game): ask the user. If included, Bruno says what they really are.
- Topics with no real recordings (dinosaurs, planets, countries): ask the user. The default is every item `sound: null`, so the quiz has only name and true/false questions. Optional flavor sounds are synthesized in `audio.js` like `chime()` (oscillator + gain envelope): no files, no credits, and Bruno says they're "imagined". Never quiz on a made-up sound. Replace `sounds.test.js` with a check that no item has a sound.
- Accuracy: avoid claims scientists still argue about, or phrase them as "scientists think". Say so when a grouping includes non-members (pterosaurs aren't dinosaurs, Pluto is a dwarf planet).
- Rename domain words everywhere: `ANIMALS` → `DINOSAURS`, `animalArt` → `<item>Art`, and the credits schema's `animal` key.

## Assets

**Check art coverage first.** Fluent Emoji covers common animals, foods and objects, but has only 2 dinosaurs, about a dozen bugs (ant, bee, beetle, ladybug, cricket, fly, mosquito, butterfly, spider, snail…), and no country maps. If it covers fewer than all items, offer: (a) hand-drawn SVGs in `scenery.js` style, built from a few body plans recolored per item; (b) PD/CC0 images from Commons (uneven style). Fluent can still supply the hero/app icon.

See `assets.md` for the exact sound-sourcing commands (Wikimedia Commons API + ffmpeg), the Fluent/Phosphor
fetch scripts, and the app-icon render. Every asset needs a credit row, and license texts go in `art/`.

## Build order

1. Data + strings + i18n, with tests (counts, unique ids, en/es everywhere).
2. Pure `quiz.js` + `progress.js`, with tests (seeded RNG from `tests/helpers.js`).
3. `audio.js`, `ui.js`, router, screens.
4. Sounds + credits. 5. Art, icons, scenery, entrance. 6. PWA (manifest, sw, icons, pwa test).
7. README (how to play, install on iPad, privacy, run locally, add an item, credits).

## Verification before claiming done

- `npm test` passes.
- `python3 -m http.server 8000`. Play every screen in **both languages** at iPad landscape, iPad
  portrait, and phone sizes (Playwright screenshots, not a dependency). No console errors. Break an image
  and confirm the emoji fallback.
- Offline: load once, stop the server, reload, and confirm it still plays.

## Publishing

Switch to the account that owns the repo, create or push the repo, then switch back:

```bash
gh auth switch --user <user>
gh repo create <user>/<game> --public --source . --push   # or push to the existing repo
gh api -X POST repos/<user>/<game>/pages -f "source[branch]=main" -f "source[path]=/"
gh api repos/<user>/<game>/pages/builds/latest --jq .status   # wait for "built"
curl -sI https://<user>.github.io/<game>/ | head -1             # 200
```

Ask before creating the repo or pushing. Use feature branches + PRs after the first publish.

## Common mistakes

- Adding a framework, bundler, test runner, or CI "for quality". The family is zero-dep on purpose.
- Over-building: e2e suites, backup codes, recorded voice-overs, parent gates. They're out of scope unless asked.
- Cache-first for JS/HTML, or forgetting to bump `CACHE`.
- Putting emoji in buttons or titles, or a string only in English.
- Absolute paths (`/js/main.js`), which break under `/<repo>/`.
