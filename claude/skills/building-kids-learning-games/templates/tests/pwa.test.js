import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

// Load sw.js in a sandbox so its top-level declarations can be inspected.
function loadServiceWorker() {
  const context = vm.createContext({
    self: { addEventListener() {}, location: { origin: "https://example.test" } },
  });
  vm.runInContext(readFileSync("sw.js", "utf8"), context);
  return (expr) => vm.runInContext(expr, context);
}

function filesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

test("manifest describes an installable, full-screen app with relative paths", () => {
  const manifest = JSON.parse(readFileSync("manifest.webmanifest", "utf8"));
  assert.equal(manifest.name, "Bruno's Zoo");
  assert.ok(manifest.short_name);
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.display, "standalone");
  assert.match(manifest.theme_color, /^#[0-9a-f]{6}$/i);
  assert.match(manifest.background_color, /^#[0-9a-f]{6}$/i);
  const sizes = manifest.icons.map((icon) => icon.sizes);
  assert.ok(sizes.includes("192x192") && sizes.includes("512x512"));
  assert.ok(manifest.icons.some((icon) => icon.purpose === "maskable"));
  for (const icon of manifest.icons) {
    assert.ok(!icon.src.startsWith("/"), `${icon.src} must be relative`);
    assert.ok(existsSync(icon.src), `missing ${icon.src}`);
  }
});

test("index.html links the manifest, iPad icon, and full-screen tags", () => {
  const html = readFileSync("index.html", "utf8");
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest"/);
  const touchIcon = /<link rel="apple-touch-icon" href="([^"]+)"/.exec(html);
  assert.ok(touchIcon, "apple-touch-icon link");
  assert.ok(existsSync(touchIcon[1]), `missing ${touchIcon[1]}`);
  assert.match(html, /<meta name="apple-mobile-web-app-capable" content="yes"/);
  assert.match(html, /<meta name="mobile-web-app-capable" content="yes"/);
  assert.match(html, /<meta name="apple-mobile-web-app-title" content="Bruno's Zoo"/);
  assert.match(html, /<meta name="theme-color" content="#[0-9a-f]{6}"/i);
});

test("service worker precaches exactly the game's files, all relative and present", () => {
  const run = loadServiceWorker();
  const precache = run("PRECACHE");
  for (const path of precache) {
    assert.ok(!path.startsWith("/"), `${path} must be relative`);
    if (path !== "./") assert.ok(existsSync(path), `missing ${path}`);
  }
  assert.equal(new Set(precache).size, precache.length, "no duplicates");
  const expected = [
    "./", "index.html", "manifest.webmanifest",
    ...["css", "js", "sounds", "icons", "art"].flatMap(filesUnder)
      .filter((f) => !f.endsWith(".svg") && !f.endsWith(".txt")),
  ].sort();
  assert.deepEqual([...precache].sort(), expected);
});

test("parseRange handles the byte ranges Safari asks for", () => {
  const run = loadServiceWorker();
  const range = (header, size) => JSON.parse(JSON.stringify(run(`parseRange(${JSON.stringify(header)}, ${size})`)));
  assert.deepEqual(range("bytes=0-1", 10), { start: 0, end: 1 });
  assert.deepEqual(range("bytes=5-", 10), { start: 5, end: 9 });
  assert.deepEqual(range("bytes=-3", 10), { start: 7, end: 9 });
  assert.deepEqual(range("bytes=0-100", 10), { start: 0, end: 9 });
  assert.equal(range("bytes=20-", 10), null, "unsatisfiable");
  assert.equal(range("items=0-1", 10), null, "not a byte range");
});

test("the favicon is the app icon, not an emoji", () => {
  const html = readFileSync("index.html", "utf8");
  assert.match(html, /<link rel="icon" href="icons\/icon-192\.png"/);
});

test("pictures, sounds, and icons are served from the saved copy first", () => {
  const run = loadServiceWorker();
  for (const path of ["/animals/art/animals/lion.webp", "/animals/sounds/lion.mp3", "/animals/icons/icon-192.png"]) {
    assert.equal(run(`isCacheFirst(${JSON.stringify(path)})`), true, path);
  }
  for (const path of ["/animals/", "/animals/index.html", "/animals/js/main.js", "/animals/css/style.css"]) {
    assert.equal(run(`isCacheFirst(${JSON.stringify(path)})`), false, path);
  }
});

test("activation only deletes this game's old caches (other games share the origin)", () => {
  const run = loadServiceWorker();
  assert.ok(run("CACHE").startsWith(run("CACHE_PREFIX")));
  assert.match(readFileSync("sw.js", "utf8"), /key\.startsWith\(CACHE_PREFIX\) && key !== CACHE/);
});
