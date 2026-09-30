// A complete 3D brick head modelled after the NFT (public/favicon.png), facing forward.
// Shapes are signed distance functions blended with smooth unions, sampled on a coarse
// grid for the chunky look. Only surface cells become bricks, except behind the lips,
// which is filled so opening the mouth never reveals a hollow head.

export interface Brick {
  pos: [number, number, number];
  color: string;
  chrome: boolean;
  glass: boolean;
  mouth: number; // vertical offset per unit of mouth opening (negative = drops)
  stretch: number; // extra height per unit of opening, so neighbouring rows never gap
  corner?: number; // how much the brick follows a mouth corner; sign says which side
  sway: number; // 0..1, hair-tip wobble
  long?: number; // stretches the brick sideways (1x2 Lego-style)
  eye?: 1 | 2; // 1 = eye white (blinks), 2 = pupil (blinks and looks around)
  scale?: number; // brick size relative to STEP (eyes use finer bricks)
}

export const STEP = 0.85;
const MOUTH_Y = -5.9; // parting line between the lips

type V = [number, number, number];

// --- SDF helpers -----------------------------------------------------------
const len = (x: number, y: number, z: number) => Math.hypot(x, y, z);
function ellipsoid(p: V, c: V, r: V) {
  const x = (p[0] - c[0]) / r[0], y = (p[1] - c[1]) / r[1], z = (p[2] - c[2]) / r[2];
  return (len(x, y, z) - 1) * Math.min(...r);
}
function smin(a: number, b: number, k: number) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
// Tapered cone along a segment; `flat` squashes it front-to-back.
function cone(p: V, a: V, b: V, ra: number, rb: number, flat = 1) {
  const ab: V = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const l2 = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1] + (p[2] - a[2]) * ab[2]) / l2));
  const q: V = [p[0] - a[0] - ab[0] * t, p[1] - a[1] - ab[1] * t, (p[2] - a[2] - ab[2] * t) / flat];
  return { d: len(...q) - (ra + (rb - ra) * t), t };
}

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

// --- Parts -------------------------------------------------------------------
// Hair: thick, curved clumps in layers, like the NFT's flame-shaped locks. Each is a
// quadratic curve [base, control, tip] with a tapering radius.
const CLUMPS: [V, V, V, number][] = [
  // crown, flaring up and outward, tips curling away from the face
  [[0, 15, 0], [1, 24, 1], [-2, 31, -2], 5.6],
  [[-4, 15, 1], [-8, 23, 2], [-15, 29, 0], 5.3],
  [[4, 15, 1], [8, 23, 2], [15, 29, -1], 5.3],
  [[-7, 13, 0], [-14, 19, 1], [-22, 22, -1], 5.1],
  [[7, 13, 0], [14, 19, 1], [22, 22, -2], 5.1],
  [[-9, 9, -1], [-17, 12, 0], [-24, 10, -2], 4.7],
  [[9, 9, -1], [17, 13, 0], [25, 12, -2], 4.7],
  // bangs over the forehead, curling forward
  [[-3, 16, 4], [-5, 22, 8], [-8, 22, 11], 3.6],
  [[3, 16, 4], [5, 23, 8], [7, 23, 11], 3.6],
  [[0, 17, 3], [0, 24, 7], [1, 25, 10], 3.8],
  // side locks framing the face, down to the jaw
  [[-10, 9, 1], [-13.5, 3, 2.5], [-12.5, -5, 1.5], 3.6],
  [[10, 9, 1], [13.5, 3, 2.5], [12.5, -5, 1.5], 3.6],
  // back layer
  [[0, 11, -8], [0, 19, -15], [0, 24, -19], 5],
  [[-7, 9, -7], [-13, 15, -13], [-19, 17, -17], 4.6],
  [[7, 9, -7], [13, 15, -13], [19, 17, -17], 4.6],
];
// Pre-sample each clump into spheres; the bounding box lets most cells skip the clump.
const CLUMP_SAMPLES = CLUMPS.map(([a, c, b, r0]) => {
  const pts: { p: V; r: number; t: number }[] = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20, u = 1 - t;
    const p = [0, 1, 2].map((k) => u * u * a[k] + 2 * u * t * c[k] + t * t * b[k]) as V;
    pts.push({ p, r: r0 * (1 - t) ** 0.85 + 0.4, t });
  }
  const lo = [0, 1, 2].map((k) => Math.min(...pts.map((q) => q.p[k] - q.r))) as V;
  const hi = [0, 1, 2].map((k) => Math.max(...pts.map((q) => q.p[k] + q.r))) as V;
  return { pts, lo, hi };
});
// Hair cap over the skull fills the gaps between clumps; the forehead stays clear.
const hairCap = (p: V) => ellipsoid(p, [0, 8.5, -1.5], [11.6, 11, 11.6]) <= 0 && !(p[2] > 3 && p[1] < 15) && p[1] > 3;

// The screw: a flat spindle through the head, point out the lower left, tip out the upper right.
const SCREW_A: V = [-27, -3, 3];
const SCREW_B: V = [24, 15, 0];

// Around the mouth, as in the NFT: a thick periwinkle moustache above (two lobes, so the nose
// tip can sit in the dip) and a full beard bumper below, with yellow lips between them.
const MOUSTACHE = (p: V) => Math.min(
  ellipsoid(p, [-2.8, -3.5, 9.9], [4.2, 1.9, 2.6]),
  ellipsoid(p, [2.8, -3.5, 9.9], [4.2, 1.9, 2.6]),
);
const CHIN_BEARD_C: V = [0, -9, 9.6];
const CHIN_BEARD_R: V = [6, 2.5, 2.8];
const CHIN_BEARD = (p: V) => ellipsoid(p, CHIN_BEARD_C, CHIN_BEARD_R);
// Yellow lips: rounded upper and lower lip meeting at MOUTH_Y.
const UPPER_LIP = (p: V) => ellipsoid(p, [0, -5.05, 9.5], [4.5, 1.05, 2.1]);
const LOWER_LIP_C: V = [0, -6.85, 9.4];
const LOWER_LIP_R: V = [4.3, 1.2, 2.1];
const LOWER_LIP = (p: V) => ellipsoid(p, LOWER_LIP_C, LOWER_LIP_R);

const neck = (p: V) => cone(p, [0, -8, -1.5], [0, -24, -1.5], 5.4, 6.4).d;

// Face outline seen from the front (right half; mirrored): wide cheekbones, a straight
// jawline, and a square chin. Built from half-planes so the edges stay hard.
const OUTLINE: [number, number][] = [[9.6, 13], [10.4, 3], [9, -7.2], [4.4, -12.4], [0, -12.4]];
function outline(x: number, y: number) {
  x = Math.abs(x);
  let d = -Infinity;
  for (let i = 0; i < OUTLINE.length - 1; i++) {
    const [x0, y0] = OUTLINE[i], [x1, y1] = OUTLINE[i + 1];
    const ex = x1 - x0, ey = y1 - y0, l = Math.hypot(ex, ey);
    d = Math.max(d, ((y - y0) * ex - (x - x0) * ey) / l); // distance along the outward normal (+x / -y)
  }
  return d;
}

// Triangular nose: a straight bridge that juts further out as it goes down, ending in a
// tip with rounded nostril wings either side.
const NOSE_BASE = -2.6;
function nose(p: V) {
  const [x, y, z] = p;
  const ridge = 8.6 + (4.5 - y) * 0.48;
  const bridge = Math.max(Math.abs(x) * 0.95 + (z - ridge), y - 4.5, NOSE_BASE - y, 6 - z);
  const wings = ellipsoid([Math.abs(x), y, z], [1.9, NOSE_BASE + 0.9, 9.8], [1.4, 1.1, 1.3]);
  return Math.min(bridge, wings);
}

// Eye geometry: centres, and a socket carved into the face so the eyes sit under the brow.
const EYE_X = 4.2;
const EYE_Y = 4.6; // set low so the mid-face between eyes and moustache stays short
const EYE_Z = 8.1; // the eye surface, a little behind the flat front of the face
const socket = (p: V) => Math.min(
  ellipsoid(p, [-EYE_X - 0.3, EYE_Y, 9.4], [4.4, 2.1, 1.9]),
  ellipsoid(p, [EYE_X + 0.3, EYE_Y, 9.4], [4.4, 2.1, 1.9]),
);

function headSdf(p: V, sockets = true) {
  const [x, y, z] = p;
  let d = ellipsoid(p, [0, 6, -1.5], [10, 11.5, 10]); // cranium, mostly under the hair
  // Face block: outline extruded, with a flat front that angles back past the cheekbones.
  const front = z - (8.4 - 0.45 * Math.max(0, Math.abs(x) - 4.5));
  const face = Math.max(outline(x, y), front, -8 - z, y - 12);
  d = smin(d, face, 1);
  d = smin(d, Math.max(Math.abs(x) - 7.8, Math.abs(y - 8.2) - 0.8, z - 9.2, 7 - z), 0.5); // brow ridge
  for (const sx of [-1, 1]) {
    // Cheekbones: small angular blocks under the eyes.
    d = smin(d, Math.max(Math.abs(x - sx * 6.6) - 2.2, Math.abs(y - 1.4) - 1, z - (8.3 - Math.abs(x) * 0.12), 4 - z), 0.6);
  }
  d = smin(d, nose(p), 0.5);
  d = smin(d, MOUSTACHE(p), 0.8);
  d = smin(d, CHIN_BEARD(p), 0.8);
  d = smin(d, UPPER_LIP(p), 0.4);
  d = smin(d, LOWER_LIP(p), 0.4);
  d = smin(d, Math.max(Math.abs(x) - 3.6, Math.abs(y + 11.3) - 1.4, z - 8.4, 2 - z), 0.6); // square chin
  d = smin(d, neck(p), 2);
  // At rest the lips meet (a closed, neutral mouth like the NFT's); only a hairline seam.
  const slot = ellipsoid(p, [0, MOUTH_Y, 8.4], [4.2, 0.15, 3.6]);
  d = Math.max(d, -slot);
  return sockets ? Math.max(d, -socket(p)) : d;
}

const upperTeeth = (p: V) => Math.abs(p[0]) < 3.4 && p[1] > -6.2 && p[1] < -5.2 && p[2] > 6 && p[2] < 8.2;
const lowerTeeth = (p: V) => Math.abs(p[0]) < 3 && p[1] > -6.8 && p[1] < -6 && p[2] > 6 && p[2] < 7.8;

function hairAt(p: V) {
  let t = -1;
  for (const c of CLUMP_SAMPLES) {
    if (p[0] < c.lo[0] || p[0] > c.hi[0] || p[1] < c.lo[1] || p[1] > c.hi[1] || p[2] < c.lo[2] || p[2] > c.hi[2]) continue;
    for (const q of c.pts) {
      if (len(p[0] - q.p[0], p[1] - q.p[1], (p[2] - q.p[2]) / 0.85) <= q.r) { t = Math.max(t, q.t); break; }
    }
  }
  return t;
}

function screwAt(p: V) {
  const c = cone(p, SCREW_A, SCREW_B, 0, 0, 0.5);
  // Spindle profile: widest inside the head, pointed at both ends.
  // Jagged: the radius varies in chunks, like the NFT's crumpled chrome.
  const r = 5.6 * Math.sin(Math.PI * c.t) ** 0.7 * (0.75 + 0.5 * clump([p[0] * 1.6, p[1] * 1.6, p[2]]));
  const ab: V = [SCREW_B[0] - SCREW_A[0], SCREW_B[1] - SCREW_A[1], SCREW_B[2] - SCREW_A[2]];
  const q: V = [p[0] - SCREW_A[0] - ab[0] * c.t, p[1] - SCREW_A[1] - ab[1] * c.t, (p[2] - SCREW_A[2] - ab[2] * c.t) / 0.5];
  return len(...q) - r;
}

// How far a brick moves when the mouth opens. The lower lip drops most at the centre and
// not at all at the corners (a lens-shaped opening); the chin follows partly; the upper
// lip lifts a little. Cheeks and the back of the head stay put.
const MOUTH_HALF_WIDTH = 6;
// Expressions: bricks near the mouth corners follow them up (smirk) or down (frown). The
// weight fades toward the centre of the mouth and away from it, so the lips bend, not slide.
function cornerWeight(p: V) {
  const [x, y, z] = p;
  const ax = Math.abs(x);
  const across = Math.min(1, Math.max(0, (ax - 1.2) / 3.4)) * (1 - Math.min(1, Math.max(0, (ax - 6.2) / 2)));
  const near = Math.exp(-(((y - MOUTH_Y) / 2.6) ** 2));
  const front = Math.min(1, Math.max(0, (z - 4) / 4));
  return Math.sign(x) * across * near * front;
}

function mouthWeight(p: V) {
  const [x, y, z] = p;
  const lens = Math.max(0, 1 - (x / MOUTH_HALF_WIDTH) ** 2);
  const front = Math.min(1, Math.max(0, (z - 1) / 5));
  if (y < MOUTH_Y) {
    // The whole lower lip moves as one; below it the chin follows less and less.
    const below = MOUTH_Y - 4.6 - y;
    const fall = below <= 0 ? 1 : Math.exp(-below / 6);
    return -2.6 * lens ** 0.8 * fall * front;
  }
  return 0.7 * lens * Math.exp(-(y - MOUTH_Y) / 1.6) * front;
}

// --- Colour ------------------------------------------------------------------
const ORANGE = ['#ff5a1f', '#ff6a26', '#f24c16', '#ff7b35', '#ff5220', '#e8480f'];
const BLUE = ['#2e6de8', '#3b82f6', '#2358d4', '#2a62dc', '#1f4fc2'];
const WHITE = ['#eef2f7', '#dfe6ef', '#ffffff'];
const CHROME = ['#f2f4f7', '#e2e6eb', '#ffffff', '#cfd5dd'];
const RED = ['#ef3f1d', '#ff5a33', '#e2361a', '#ff6d3f'];
const NOSE_RIDGE = ['#ff8a45', '#ff9552', '#ff7f3a'];
const NOSE_SIDE = ['#d63d0e', '#c8360b', '#dd4412'];
const NOSTRIL = ['#5a1a08', '#4a1506'];
// Moustache and chin beard: periwinkle, glossy.
const STACHE = ['#6480ff', '#6f89ff', '#5a78f7', '#7088ff'];
const STACHE_HIGHLIGHT = ['#b3c1ff', '#a6b6ff', '#c2cdff'];
const STACHE_SHADOW = ['#3f55d4', '#384cc4', '#4459da'];
// Lips: warm yellow-orange.
const LIP = ['#ffbe4d', '#ffc561', '#ffb53f', '#ffca6b'];
const LIP_HIGHLIGHT = ['#ffe39f', '#ffda87'];
const LIP_SHADOW = ['#e38f24', '#d9841d'];
const BEARD = ['#1c47b8', '#2152cc', '#173fa6', '#2458d6'];
const TOOTH = ['#f4f0e6', '#ebe5d8', '#faf7f0'];
const GLASS = ['#ffb3bd', '#ffc2ca', '#ffa6b2'];
const GLASS_EDGE = ['#e0405e', '#d63656'];
const SCLERA = ['#dfe2e8', '#cfd4dc', '#e8eaee', '#d6dae1'];
const IRIS = ['#343945', '#2e333e', '#3a404d'];
const IRIS_SHADOW = ['#22262e', '#1e2128'];
const LID = ['#e0461a', '#d23f15', '#ea5020']; // socket floor: what shows when the eye shuts

export function buildHead(): Brick[] {
  const r = rng(3);
  const pick = (xs: string[]) => xs[Math.floor(r() * xs.length)];
  const min: V = [-28, -18, -20];
  const max: V = [28, 32, 16];
  const n = [0, 1, 2].map((i) => Math.ceil((max[i] - min[i]) / STEP)) as V;
  const at = (i: number, j: number, k: number): V => [min[0] + i * STEP, min[1] + j * STEP, min[2] + k * STEP];
  const id = (i: number, j: number, k: number) => (i * n[1] + j) * n[2] + k;

  // 0 empty, 1 head, 2 hair, 3 screw, 4 teeth
  const kind = new Uint8Array(n[0] * n[1] * n[2]);
  const sway = new Float32Array(kind.length);
  for (let i = 0; i < n[0]; i++)
    for (let j = 0; j < n[1]; j++)
      for (let k = 0; k < n[2]; k++) {
        const p = at(i, j, k);
        const c = id(i, j, k);
        if (upperTeeth(p) || lowerTeeth(p)) kind[c] = 4;
        else if (headSdf(p) <= 0) kind[c] = 1;
        else if (screwAt(p) <= 0) kind[c] = 3;
        else {
          const t = hairAt(p);
          if (t >= 0) { kind[c] = 2; sway[c] = t; } else if (hairCap(p)) kind[c] = 2;
        }
      }

  const filled = (i: number, j: number, k: number) =>
    i >= 0 && j >= 0 && k >= 0 && i < n[0] && j < n[1] && k < n[2] && kind[id(i, j, k)] !== 0;

  const bricks: Brick[] = [];
  for (let i = 0; i < n[0]; i++)
    for (let j = 0; j < n[1]; j++)
      for (let k = 0; k < n[2]; k++) {
        const c = id(i, j, k);
        const kd = kind[c];
        if (!kd) continue;
        const p = at(i, j, k);
        const surface = !filled(i + 1, j, k) || !filled(i - 1, j, k) || !filled(i, j + 1, k) ||
          !filled(i, j - 1, k) || !filled(i, j, k + 1) || !filled(i, j, k - 1);
        // Keep a dark wall of interior bricks behind the lips; it shows when the mouth opens.
        const behindLips = p[1] > MOUTH_Y - 3.4 && p[1] < MOUTH_Y + 1.2 && Math.abs(p[0]) < MOUTH_HALF_WIDTH && p[2] > 2;
        if (!surface && !behindLips) continue;

        let color: string;
        let chrome = false;
        if (!surface) color = '#3a0d14'; // inside the mouth, seen when the jaw drops
        else if (kd === 4) color = pick(TOOTH);
        else if (kd === 3) { chrome = r() < 0.85; color = chrome ? pick(CHROME) : pick(WHITE); }
        else if (kd === 2) color = clump(p) < 0.2 || r() < 0.05 ? pick(WHITE) : pick(BLUE);
        else color = skinColor(p, r, pick);

        const lipBrick = kd === 1 && (LIP.includes(color) || STACHE.includes(color));
        // Ambient occlusion: bricks in crevices (many filled cells nearby) are darker.
        if (surface && kd !== 4) {
          let occ = 0;
          for (let di = -2; di <= 2; di++)
            for (let dj = -2; dj <= 2; dj++)
              for (let dk = -2; dk <= 2; dk++) if (filled(i + di, j + dj, k + dk)) occ++;
          // Skin gets a lighter touch so the face stays bright orange; hair and screw get the full depth.
          const strength = kd === 1 ? 0.3 : 0.6;
          color = shade(color, 1 - strength * Math.min(1, Math.max(0, (occ / 125 - 0.42) / 0.4)));
        }
        bricks.push({
          long: surface && (kd === 2 || lipBrick) && r() < 0.4 ? 1.8 : 1,
          // Loose placement: each brick is nudged a little off the grid.
          pos: surface ? [p[0] + (r() - 0.5) * 0.2, p[1] + (r() - 0.5) * 0.2, p[2] + (r() - 0.5) * 0.35] : p,
          color, chrome, glass: false,
          mouth: !surface ? 0 : kd === 4 ? (lowerTeeth(p) ? -2.4 : 0.3) : mouthWeight(p),
          stretch: !surface || kd === 4 ? 0 : Math.abs(mouthWeight([p[0], p[1] + STEP / 2, p[2]]) - mouthWeight([p[0], p[1] - STEP / 2, p[2]])),
          sway: kd === 2 ? sway[c] : 0,
          corner: surface && kd === 1 ? cornerWeight(p) : 0,
        });

      }

  // Glasses: a translucent band hugging the face, just proud of the skin.
  for (let i = 0; i < n[0]; i++)
    for (let j = 0; j < n[1]; j++)
      for (let k = 0; k < n[2]; k++) {
        const p = at(i, j, k);
        if (p[1] < 1.3 || p[1] > 7.5 || p[2] < -1.5) continue;
        const d = headSdf(p, false); // glasses sit over the sockets, not in them
        // Two bricks thick, standing well off the face like the NFT's goggles.
        if (d > 0.6 && d <= 0.6 + STEP * 2) {
          const edge = p[1] < 2.1 || p[1] > 6.7 || p[2] < 0.5;
          bricks.push({ pos: p, color: pick(edge ? GLASS_EDGE : GLASS), chrome: false, glass: true, mouth: 0, stretch: 0, sway: 0 });
        }
      }

  return bricks.concat(buildEyes(pick));
}

// White comes in patches, like the NFT, rather than single speckles.
function shade(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.round(Math.min(255, v * f)).toString(16).padStart(2, '0');
  return `#${ch(n >> 16)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}

function clump(p: V) {
  const h = Math.sin(Math.floor(p[0] / 2.6) * 127.1 + Math.floor(p[1] / 2.6) * 311.7 + Math.floor(p[2] / 2.6) * 74.7) * 43758.5453;
  return h - Math.floor(h);
}

// Eyes, kept as simple as the NFT's and built like low-res pixel-art eyes: a dark iris that
// fills the eye's full height, with white only at the sides. White above or below the iris
// ("sanpaku") is what makes eyes read as a stare, so there is none.
// W = white, I = iris, P = pupil, G = glint, S = iris under the lid's shadow.
// Rows run top to bottom; columns run inner corner (nose side) to outer corner.
const EYE_MASK = [
  '.WSSSWW.',
  'WWIPGWWW',
  '.WIIIWW.',
];
export const EYE_TOP = EYE_Y + STEP * 1.5; // where the upper lid closes to

function buildEyes(pick: (xs: string[]) => string): Brick[] {
  const out: Brick[] = [];
  const add = (x: number, y: number, z: number, color: string, eye: 1 | 2) =>
    out.push({ pos: [x, y, z], color, chrome: false, glass: false, mouth: 0, stretch: 0, sway: 0, eye, scale: 0.94 });
  const IRIS_COLORS: Record<string, string[]> = { I: IRIS, P: ['#121418'], G: ['#8e95a4'], S: IRIS_SHADOW };
  for (const sx of [-1, 1]) {
    EYE_MASK.forEach((row, ri) => {
      [...row].forEach((ch, ci) => {
        if (ch === '.') return;
        const x = sx * (EYE_X + 0.3 + (ci - 3.5) * STEP), y = EYE_Y + (1 - ri) * STEP;
        add(x, y, EYE_Z, pick(SCLERA), 1); // white behind everything, so the iris can move
        if (ch !== 'W') add(x, y, EYE_Z + 0.3, pick(IRIS_COLORS[ch]), 2);
      });
    });
  }
  return out;
}

function skinColor(p: V, r: () => number, pick: (xs: string[]) => string) {
  const [x, y, z] = p;
  // Nose: lighter ridge, darker sides, dark nostrils underneath, so it reads from the front.
  if (nose(p) <= 0.6 && y < 5) {
    if (y < NOSE_BASE + 0.6 && Math.abs(x) > 0.5 && Math.abs(x) < 2.2 && z > 8.6) return pick(NOSTRIL);
    return Math.abs(x) < 0.7 ? pick(NOSE_RIDGE) : pick(NOSE_SIDE);
  }
  // Lips: yellow, rounded; the top of the lower lip catches the light, corners fall into shadow.
  if (z > 8 && Math.abs(x) < 4.8) {
    if (LOWER_LIP(p) <= 0.2) {
      if (Math.abs(x) > 3.6) return pick(LIP_SHADOW);
      return (y - LOWER_LIP_C[1]) / LOWER_LIP_R[1] > 0.1 && z > 10.4 ? pick(LIP_HIGHLIGHT) : pick(LIP);
    }
    if (UPPER_LIP(p) <= 0.2) return Math.abs(x) > 3.8 || y < -5.5 ? pick(LIP_SHADOW) : pick(LIP);
  }
  // Moustache and chin beard: glossy periwinkle bumpers around the mouth.
  if (z > 8 && Math.abs(x) < 6.6) {
    if (MOUSTACHE(p) <= 0.2) {
      if (Math.abs(x) > 5.4 || y < -4.6) return pick(STACHE_SHADOW);
      return y > -3 && z > 10.4 ? pick(STACHE_HIGHLIGHT) : pick(STACHE);
    }
    if (CHIN_BEARD(p) <= 0.2) {
      const ny = (y - CHIN_BEARD_C[1]) / CHIN_BEARD_R[1];
      if (Math.abs(x) > 5 || ny < -0.55) return pick(STACHE_SHADOW);
      return ny > 0.15 && z > 10.4 ? pick(STACHE_HIGHLIGHT) : pick(STACHE);
    }
  }
  if (y < -8 && neck(p) <= 0.6) return pick(RED);
  // Socket floor is eyelid skin, so a blink reads as a closed lid.
  if (z > 5 && socket(p) <= 0.9) return pick(LID);
  // Orange mask on the front of the face, with a ragged edge; blue beard below and around.
  const edge = (r() - 0.5) * 1.6;
  const front = z > 1.5 + edge;
  const aboveBeard = y > -3.3 + x * x * 0.035 + edge; // soft U along the upper lip, not a V
  const noseBridge = Math.abs(x) < 3 && y > -3.4 && z > 7.6; // nose runs down into the upper lip
  if (front && (aboveBeard || noseBridge) && Math.abs(x) < 9.2 + edge) return pick(ORANGE);
  return r() < 0.08 ? pick(WHITE) : pick(z > 3 && y < 0 ? BEARD : BLUE);
}
