// Mutable voice state read every frame by the face.
// `level` (0..1) drives the mouth. It comes from the audio actually playing: the intro's
// pre-generated clips (public/voice, made by `npm run voice`), or later a realtime model's
// stream via `attachAudio`.

export const voice = {
  level: 0,
  speaking: false,
};

export interface Line {
  text: string;
  highlight?: string; // id of the list item to light up while this line plays
}

type LineHandler = (line: Line | null) => void;

let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let rafId = 0;
let syllable = -1;
let syllableSize = 0.5;
let current: HTMLAudioElement | null = null;
let manifest: Promise<Record<string, string>> | null = null;

// Created on the first click (browsers only allow audio after a user gesture).
function audio() {
  if (!ctx) {
    ctx = new AudioContext();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.connect(ctx.destination);
  }
  void ctx.resume();
  return { ctx, analyser: analyser! };
}

function tick(t: number) {
  if (voice.speaking && current && analyser) {
    // Loudness of what's playing right now.
    const buf = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buf);
    let sum = 0;
    for (const v of buf) sum += ((v - 128) / 128) ** 2;
    voice.level = Math.min(1, Math.max(0, Math.sqrt(sum / buf.length) * 6 - 0.03));
  } else if (voice.speaking) {
    // No audio for this line: a syllable-like rhythm so the mouth still moves.
    const phase = (t / 1000) * 3.8;
    const k = Math.floor(phase);
    if (k !== syllable) { syllable = k; syllableSize = 0.25 + Math.random() * 0.75; }
    voice.level = 0.05 + Math.sin((phase - k) * Math.PI) ** 1.5 * syllableSize * 0.85;
  } else {
    voice.level = 0;
  }
  rafId = requestAnimationFrame(tick);
}

function ensureTicking() {
  if (!rafId) rafId = requestAnimationFrame(tick);
}

// For the realtime model later: pass the remote audio stream and the mouth follows it.
export function attachAudio(stream: MediaStream) {
  const a = audio();
  a.ctx.createMediaStreamSource(stream).connect(a.analyser);
  ensureTicking();
}

function loadManifest() {
  manifest ??= fetch('/voice/manifest.json')
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));
  return manifest;
}

let cancelled = false;

export function stop(onLine?: LineHandler) {
  cancelled = true;
  current?.pause();
  current = null;
  voice.speaking = false;
  onLine?.(null);
}

export async function say(lines: Line[], onLine: LineHandler) {
  const a = audio(); // must happen inside the click, before any await
  ensureTicking();
  cancelled = false;
  const files = await loadManifest();
  // Start fetching every clip up front so lines follow each other without gaps.
  const clips = lines.map((l) => {
    const url = files[l.text];
    if (!url) return null;
    const el = new Audio(url);
    el.preload = 'auto';
    return el;
  });

  for (const [i, line] of lines.entries()) {
    if (cancelled) return;
    onLine(line);
    voice.speaking = true;
    const clip = clips[i];
    await (clip ? play(clip, a) : mime(line.text));
    voice.speaking = false;
    if (cancelled) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  onLine(null);
}

function play(el: HTMLAudioElement, a: { ctx: AudioContext; analyser: AnalyserNode }) {
  return new Promise<void>((resolve) => {
    a.ctx.createMediaElementSource(el).connect(a.analyser);
    current = el;
    const done = () => { if (current === el) current = null; resolve(); };
    el.onended = done;
    el.onerror = done;
    el.play().catch(done);
  });
}

// No clip for this line: move the mouth for a plausible duration.
function mime(text: string) {
  return new Promise<void>((r) => setTimeout(r, text.length * 60));
}
