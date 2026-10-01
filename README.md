# me

My portfolio: **[ramcav.dev](https://ramcav.dev)**

<p align="center"><img src="docs/face.gif" width="480" alt="A talking head made of bricks, modelled on Bricktopian #3899"></p>

The face is a 3D brick version of **Bricktopian #3899**, an NFT I bought in 2021 (one of my worst investments). Tap it and it introduces me, out loud, with the matching parts of the page lighting up as it talks.

## How the head works

- **No 3D model or texture.** The head is described in code as signed distance functions (skull, flat-planed face, nose, moustache, lips, hair clumps, the screw, the goggles) in [`buildHead.ts`](frontend/src/face/buildHead.ts). It's sampled on a coarse grid, and only surface cells become bricks: about 6,500 of them.
- **One draw call per material.** Bricks are instanced meshes ([`Face.tsx`](frontend/src/face/Face.tsx)). Everything that moves (the build-in on load, the mouth, blinks, glances, passing expressions, hair sway) happens in the vertex shader, driven by a few uniforms and per-brick attributes.
- **The mouth follows real audio.** While a clip plays, its loudness is read through the Web Audio API and opens a soft, lens-shaped mouth. The lower lip and beard drop, the tongue rides the jaw, and the corners bend for expressions.
- **The eyes** are hand-placed bricks (pixel-art style, no white above or below the iris, so it never stares). They blink at random, glance around, follow the cursor while it moves and squint a little when the face smiles.

## The voice

The intro lives in [`src/intro.json`](frontend/src/intro.json). `npm run voice` turns each sentence into an mp3 with [ElevenLabs](https://elevenlabs.io), saved in `public/voice/` with a manifest. Clips are named by a hash of voice, model and text, so only changed lines are regenerated. The site just plays static files: no API calls and no cost per visitor. Long sentences show shorter caption chunks timed to the audio.

## Run it

```bash
cd frontend
npm install
npm run dev
```

To regenerate the voice, put `ELEVENLABS_API_KEY=...` in `frontend/.env.local` and run `npm run voice`.

Stack: Vite, React, TypeScript, Tailwind, three.js with react-three-fiber. Deployed on Vercel.
