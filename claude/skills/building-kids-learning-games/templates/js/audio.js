// All audio is fail-safe: errors are logged and the game keeps going.

let settings = { sfx: true, voice: true };
let currentClip = null;
let audioContext = null;
let currentUtterance = null;

export function configureAudio(next) {
  settings = { ...settings, ...next };
  if (!settings.sfx) stopSound();
  if (!settings.voice) cancelSpeech();
}

export function pickVoice(voices, lang) {
  const tagOf = (v) => (v.lang ?? "").toLowerCase().replace("_", "-");
  return (
    voices.find((v) => tagOf(v).startsWith(`${lang}-`)) ??
    voices.find((v) => tagOf(v) === lang) ??
    null
  );
}

export function speakable(text) {
  return text
    .replace(/\p{Extended_Pictographic}|‍|️/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stopSound() {
  if (!currentClip) return;
  try {
    currentClip.pause();
  } catch {
    // ignore
  }
  currentClip = null;
}

function cancelSpeech() {
  try {
    globalThis.speechSynthesis?.cancel();
  } catch {
    // ignore
  }
}

export function stopAll() {
  stopSound();
  cancelSpeech();
}

export function playSound(path, { maxMs = 6000 } = {}) {
  if (!settings.sfx || !path) return Promise.resolve(false);
  stopSound();
  return new Promise((resolve) => {
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(ok);
    };
    const timer = setTimeout(() => finish(true), maxMs);
    try {
      const clip = new Audio(path);
      currentClip = clip;
      clip.addEventListener("ended", () => finish(true));
      clip.addEventListener("pause", () => finish(true));
      clip.addEventListener("error", () => {
        console.warn("Sound failed to load:", path);
        finish(false);
      });
      clip.play()?.catch((err) => {
        if (err?.name !== "AbortError") console.warn("Sound could not play:", path, err);
        finish(false);
      });
    } catch (err) {
      console.warn("Sound unavailable:", path, err);
      finish(false);
    }
  });
}

export function speak(text, lang, { maxMs = 6000 } = {}) {
  const synth = globalThis.speechSynthesis;
  const words = speakable(text ?? "");
  if (!settings.voice || !synth || typeof SpeechSynthesisUtterance === "undefined" || !words) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let done = false;
    let utterance = null;
    const finish = () => {
      if (done) return;
      done = true;
      if (currentUtterance === utterance) currentUtterance = null;
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(finish, maxMs);
    try {
      synth.cancel();
      utterance = new SpeechSynthesisUtterance(words);
      utterance.lang = lang === "es" ? "es-ES" : "en-US";
      const voice = pickVoice(synth.getVoices(), lang);
      if (voice) utterance.voice = voice;
      utterance.rate = 0.9;
      utterance.onend = finish;
      utterance.onerror = finish;
      currentUtterance = utterance; // keep a reference so it is not garbage-collected before onend
      synth.speak(utterance);
    } catch (err) {
      console.warn("Speech failed:", err);
      finish();
    }
  });
}

export function chime(kind) {
  if (!settings.sfx) return;
  try {
    const AudioCtx = globalThis.AudioContext ?? globalThis.webkitAudioContext;
    if (!AudioCtx) return;
    audioContext ??= new AudioCtx();
    if (audioContext.state === "suspended") audioContext.resume()?.catch(() => {});
    const notes = kind === "correct" ? [523.25, 659.25, 783.99] : [392, 330];
    notes.forEach((freq, i) => {
      const start = audioContext.currentTime + i * 0.12;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
      osc.connect(gain).connect(audioContext.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  } catch (err) {
    console.warn("Chime failed:", err);
  }
}
