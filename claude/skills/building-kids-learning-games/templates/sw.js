// Saves the game on the device so it keeps working offline once installed.
// Bump CACHE whenever a picture, sound, or icon file changes so installed copies download it again.
// Every game on <user>.github.io shares one Cache Storage: only ever touch our own caches.
const CACHE_PREFIX = "bruno-zoo-";
const CACHE = `${CACHE_PREFIX}v2`;

// Every file the game needs. tests/pwa.test.js keeps this list in sync with the repo.
const PRECACHE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "art/animals/arctic-fox.webp",
  "art/animals/arctic-wolf.webp",
  "art/animals/bear.webp",
  "art/animals/beaver.webp",
  "art/animals/bee.webp",
  "art/animals/chicken.webp",
  "art/animals/cow.webp",
  "art/animals/dolphin.webp",
  "art/animals/duck.webp",
  "art/animals/elephant.webp",
  "art/animals/frog.webp",
  "art/animals/giraffe.webp",
  "art/animals/gorilla.webp",
  "art/animals/hippo.webp",
  "art/animals/horse.webp",
  "art/animals/lion.webp",
  "art/animals/monkey.webp",
  "art/animals/octopus.webp",
  "art/animals/parrot.webp",
  "art/animals/penguin.webp",
  "art/animals/pig.webp",
  "art/animals/polar-bear.webp",
  "art/animals/raccoon.webp",
  "art/animals/reindeer.webp",
  "art/animals/rhino.webp",
  "art/animals/sea-lion.webp",
  "art/animals/sea-turtle.webp",
  "art/animals/shark.webp",
  "art/animals/sheep.webp",
  "art/animals/snake.webp",
  "art/animals/snowy-owl.webp",
  "art/animals/squirrel.webp",
  "art/animals/tiger.webp",
  "art/animals/whale.webp",
  "art/animals/wild-turkey.webp",
  "art/animals/zebra.webp",
  "art/zones/farm.webp",
  "art/zones/forest.webp",
  "art/zones/jungle.webp",
  "art/zones/ocean.webp",
  "art/zones/polar.webp",
  "art/zones/savanna.webp",
  "css/style.css",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "js/audio.js",
  "js/bruno.js",
  "js/data/animals.js",
  "js/data/credits.js",
  "js/data/strings.js",
  "js/entrance.js",
  "js/i18n.js",
  "js/icons-data.js",
  "js/icons.js",
  "js/main.js",
  "js/progress.js",
  "js/quiz.js",
  "js/scenery.js",
  "js/screens/map.js",
  "js/screens/quiz.js",
  "js/screens/results.js",
  "js/screens/settings.js",
  "js/screens/stickers.js",
  "js/screens/welcome.js",
  "js/screens/zone.js",
  "js/ui.js",
  "sounds/arctic-wolf.mp3",
  "sounds/bear.mp3",
  "sounds/bee.mp3",
  "sounds/chicken.mp3",
  "sounds/cow.mp3",
  "sounds/dolphin.mp3",
  "sounds/duck.mp3",
  "sounds/elephant.mp3",
  "sounds/frog.mp3",
  "sounds/gorilla.mp3",
  "sounds/hippo.mp3",
  "sounds/horse.mp3",
  "sounds/lion.mp3",
  "sounds/monkey.mp3",
  "sounds/parrot.mp3",
  "sounds/penguin.mp3",
  "sounds/pig.mp3",
  "sounds/polar-bear.mp3",
  "sounds/raccoon.mp3",
  "sounds/reindeer.mp3",
  "sounds/rhino.mp3",
  "sounds/sea-lion.mp3",
  "sounds/sheep.mp3",
  "sounds/snake.mp3",
  "sounds/snowy-owl.mp3",
  "sounds/squirrel.mp3",
  "sounds/tiger.mp3",
  "sounds/whale.mp3",
  "sounds/wild-turkey.mp3",
  "sounds/zebra.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith(isCacheFirst(url.pathname) ? cacheFirst(request) : networkFirst(request));
});

// Pictures, sounds, and icons never change within a CACHE version.
function isCacheFirst(pathname) {
  return /\.(mp3|png|webp)$/.test(pathname);
}

// Serve the saved copy of pictures, sounds, and icons.
async function cacheFirst(request) {
  const response = (await caches.match(request, { ignoreSearch: true })) ?? (await fetch(request));
  const header = request.headers.get("range");
  if (!header || response.status !== 200) return response;
  return partialResponse(response, header);
}

// Pages and code: newest version when online, saved copy when offline.
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === "navigate") return caches.match("index.html");
    throw err;
  }
}

// Safari asks for audio in byte ranges and won't play a full 200 response from a service worker.
async function partialResponse(response, header) {
  const body = await response.arrayBuffer();
  const size = body.byteLength;
  const range = parseRange(header, size);
  if (!range) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  return new Response(body.slice(range.start, range.end + 1), {
    status: 206,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/octet-stream",
      "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
      "Content-Length": String(range.end - range.start + 1),
      "Accept-Ranges": "bytes",
    },
  });
}

// "bytes=0-1", "bytes=5-", "bytes=-3" → { start, end } (inclusive), or null if unusable.
function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (match[1] === "" && match[2] === "")) return null;
  const [, first, last] = match;
  const start = first === "" ? Math.max(0, size - Number(last)) : Number(first);
  const end = first === "" || last === "" ? size - 1 : Math.min(Number(last), size - 1);
  return start <= end && start < size ? { start, end } : null;
}
