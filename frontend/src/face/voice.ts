// Mutable voice state read every frame by the face.
// `level` (0..1) drives the jaw. Today it is synthesized from browser speech;
// later a realtime model's audio can feed it via `attachAudio` instead.

export const voice = {
  level: 0,
  speaking: false,
};

export interface Line {
  text: string;
  highlight?: string; // id of the list item to light up while this line plays
}

type LineHandler = (line: Line | null) => void;

let wordKick = 0;
let syllable = -1;
let syllableSize = 0.5;
let rafId = 0;
let analyser: AnalyserNode | null = null;

// Syllable-like envelope while speechSynthesis talks (it exposes no audio to analyse).
function tick(t: number) {
  if (analyser) {
    const buf = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buf);
    let sum = 0;
    for (const v of buf) sum += ((v - 128) / 128) ** 2;
    voice.level = Math.min(1, Math.sqrt(sum / buf.length) * 5);
  } else if (voice.speaking) {
    // Each syllable gets its own size, so the mouth doesn't flap like a metronome.
    const phase = (t / 1000) * 3.8;
    const k = Math.floor(phase);
    if (k !== syllable) { syllable = k; syllableSize = 0.25 + Math.random() * 0.75; }
    const shape = Math.sin((phase - k) * Math.PI) ** 1.5;
    wordKick *= 0.9;
    voice.level = Math.min(1, 0.05 + shape * syllableSize * 0.85 + wordKick * 0.5);
  } else {
    voice.level = 0;
  }
  rafId = requestAnimationFrame(tick);
}

function ensureTicking() {
  if (!rafId) rafId = requestAnimationFrame(tick);
}

// For the realtime model later: pass the remote audio stream and the jaw follows it.
export function attachAudio(stream: MediaStream) {
  const ctx = new AudioContext();
  analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  ctx.createMediaStreamSource(stream).connect(analyser);
  ensureTicking();
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
  const preferred = ['Daniel', 'Google UK English Male', 'Alex', 'Aaron', 'Arthur'];
  for (const name of preferred) {
    const v = voices.find((x) => x.name.includes(name));
    if (v) return v;
  }
  return voices[0];
}

let cancelled = false;

export function stop(onLine?: LineHandler) {
  cancelled = true;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  voice.speaking = false;
  onLine?.(null);
}

export async function say(lines: Line[], onLine: LineHandler) {
  ensureTicking();
  cancelled = false;
  const hasTTS = 'speechSynthesis' in window;
  for (const line of lines) {
    if (cancelled) return;
    onLine(line);
    voice.speaking = true;
    await (hasTTS ? speak(line.text) : mime(line.text));
    voice.speaking = false;
    if (cancelled) return;
    await new Promise((r) => setTimeout(r, 280));
  }
  onLine(null);
}

function speak(text: string) {
  return new Promise<void>((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = 1.02;
    u.pitch = 0.95;
    u.onboundary = () => { wordKick = 0.35; };
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
    // Safety net: some browsers never fire onend.
    setTimeout(resolve, 1500 + text.length * 110);
  });
}

// No TTS available: just move the mouth for a plausible duration.
function mime(text: string) {
  return new Promise<void>((r) => setTimeout(r, text.length * 60));
}
