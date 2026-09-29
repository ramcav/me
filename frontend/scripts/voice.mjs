// Turns each intro line (src/intro.json) into an mp3 with ElevenLabs.
// Files are named by a hash of voice + model + text, so only changed lines are regenerated,
// and a manifest maps each line's text to its file. Run: npm run voice
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';

const VOICE_ID = 'wWWn96OtTHu1sn8SRGEr'; // "Hale", from the ElevenLabs voice library
const MODEL_ID = 'eleven_multilingual_v2';
const OUT = new URL('../public/voice/', import.meta.url);

const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error('ELEVENLABS_API_KEY is not set (put it in frontend/.env.local)');

const lines = JSON.parse(readFileSync(new URL('../src/intro.json', import.meta.url), 'utf8'));
const manifest = {};

for (const { text } of lines) {
  const file = createHash('sha1').update(`${VOICE_ID}|${MODEL_ID}|${text}`).digest('hex').slice(0, 12) + '.mp3';
  manifest[text] = `/voice/${file}`;
  if (existsSync(new URL(file, OUT))) continue;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: MODEL_ID }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  writeFileSync(new URL(file, OUT), Buffer.from(await res.arrayBuffer()));
  console.log(`generated ${file}  ${text}`);
}

// Drop audio for lines that no longer exist.
const keep = new Set(Object.values(manifest).map((p) => p.split('/').pop()));
for (const f of readdirSync(OUT)) if (f.endsWith('.mp3') && !keep.has(f)) unlinkSync(new URL(f, OUT));

writeFileSync(new URL('manifest.json', OUT), JSON.stringify(manifest, null, 2) + '\n');
console.log(`${lines.length} lines, manifest written`);
