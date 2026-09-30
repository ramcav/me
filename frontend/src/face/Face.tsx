import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildHead, EYE_TOP, STEP, type Brick } from './buildHead';
import { voice } from './voice';

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

const uniforms = {
  uTime: { value: 0 },
  uBuild: { value: 0 }, // 0 = scattered, 1 = assembled
  uOpen: { value: 0 }, // mouth opening 0..1
  uLook: { value: new THREE.Vector2() }, // pupil offset, head units
  uBlink: { value: 0 }, // 0 open, 1 shut
  uCorners: { value: new THREE.Vector2() }, // mouth corners (x: one side, y: the other); + up, - down
  uLidY: { value: EYE_TOP },
};

// Per-brick motion runs in the vertex shader so thousands of bricks animate cheaply.
function patch(material: THREE.Material) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime; uniform float uBuild; uniform float uOpen; uniform vec2 uLook; uniform float uBlink; uniform vec2 uCorners; uniform float uLidY;
        attribute vec4 aHome; attribute vec4 aScatter; // aHome.w = brick scale, aScatter.w = brick length
        // Packed to stay under WebGL's 16 vertex attributes.
        attribute vec4 aAnim; // mouth, stretch, eye (1 white, 2 pupil), sway
        attribute vec4 aMisc; // phase, delay, tilt.xy
        attribute float aCorner; // signed: which mouth corner, and how much
        #define aMouth aAnim.x
        #define aStretch aAnim.y
        #define aEye aAnim.z
        #define aSway aAnim.w
        #define aPhase aMisc.x
        #define aDelay aMisc.y
        #define aTilt aMisc.zw`,
      )
      .replace(
        '#include <begin_vertex>',
        `vec3 p = aHome.xyz;
        p.y += aMouth * uOpen;
        p.y += aCorner > 0.0 ? aCorner * uCorners.x : -aCorner * uCorners.y;
        p.z -= abs(aMouth) * uOpen * 0.25; // lips roll back slightly as they part
        if (aEye > 1.5) p.xy += uLook;
        if (aEye > 0.5) p.y = mix(p.y, uLidY, uBlink); // the eye folds up under the lid
        // Loose bricks drift very slightly, each on its own rhythm.
        p += vec3(sin(uTime * 0.8 + aPhase * 40.0), cos(uTime * 0.7 + aPhase * 23.0), sin(uTime * 0.6 + aPhase * 31.0)) * (aHome.w < 1.0 ? 0.0 : 0.05);
        p += aSway * aSway * vec3(sin(uTime * 1.3 + aPhase * 6.28), cos(uTime * 1.1 + aPhase * 6.28), 0.0) * 0.5;
        // Build-in: each brick drops from just above its spot and settles with a small bounce.
        float t = clamp((uBuild - aDelay) / 0.28, 0.0, 1.0);
        float drop = 1.0 + 2.2 * pow(t - 1.0, 3.0) + 1.2 * pow(t - 1.0, 2.0); // ease-out-back
        p = mix(aScatter.xyz, p, drop);
        float grow = smoothstep(0.0, 0.5, t);
        vec3 size = vec3(${(STEP * 0.8).toFixed(3)}) * (aHome.w < 1.0 ? aHome.w * 1.15 : 1.0); // fine bricks sit edge to edge
        size.x *= aScatter.w;
        size.y += aStretch * uOpen;
        if (aEye > 0.5) size.y *= 1.0 - uBlink;
        vec3 lp = position * size * grow;
        lp.xy = mat2(cos(aTilt.x), sin(aTilt.x), -sin(aTilt.x), cos(aTilt.x)) * lp.xy; // small random tilt
        lp.xz = mat2(cos(aTilt.y), sin(aTilt.y), -sin(aTilt.y), cos(aTilt.y)) * lp.xz;
        vec3 transformed = lp + p;`,
      );
  };
  return material;
}

type Kind = 'brick' | 'chrome' | 'glass';
const kindOf = (b: Brick): Kind => (b.glass ? 'glass' : b.chrome ? 'chrome' : 'brick');

const MATERIALS: Record<Kind, () => THREE.Material> = {
  // Glossy plastic, like Lego.
  brick: () => new THREE.MeshPhysicalMaterial({ roughness: 0.38, clearcoat: 0.3, clearcoatRoughness: 0.25 }),
  chrome: () => new THREE.MeshStandardMaterial({ roughness: 0.16, metalness: 0.75 }),
  glass: () => new THREE.MeshPhysicalMaterial({
    roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.26, depthWrite: false,
    emissive: new THREE.Color('#ff3355'), emissiveIntensity: 0.08,
  }),
};

function Bricks({ bricks, kind }: { bricks: Brick[]; kind: Kind }) {
  const mesh = useMemo(() => {
    const n = bricks.length;
    const f = (k: number) => new Float32Array(n * k);
    const home = f(4), scatter = f(4), anim = f(4), misc = f(4), corner = f(1);
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const m = new THREE.InstancedMesh(geo, patch(MATERIALS[kind]()), n);
    const r = rng(kind.length * 7 + 1);
    const c = new THREE.Color();
    bricks.forEach((b, i) => {
      home.set([...b.pos, b.scale ?? 1], i * 4);
      // Start just above the brick's own spot, so the head builds in place.
      scatter.set([b.pos[0] + (r() - 0.5) * 1.2, b.pos[1] + 4 + r() * 3, b.pos[2] + (r() - 0.5) * 1.2, b.long ?? 1], i * 4);
      anim.set([b.mouth, b.stretch, b.eye ?? 0, b.sway], i * 4);
      corner[i] = b.corner ?? 0;
      const tilt = b.scale ? 0 : 0.28;
      // Layer by layer from the neck up to the hair tips.
      misc.set([r(), Math.max(0, (b.pos[1] + 18) / 50) * 0.7 + r() * 0.08, (r() - 0.5) * tilt, (r() - 0.5) * tilt], i * 4);
      m.setColorAt(i, c.set(b.color));
    });
    const attr = (a: Float32Array, k: number) => new THREE.InstancedBufferAttribute(a, k);
    geo.setAttribute('aHome', attr(home, 4));
    geo.setAttribute('aScatter', attr(scatter, 4));
    geo.setAttribute('aAnim', attr(anim, 4));
    geo.setAttribute('aMisc', attr(misc, 4));
    geo.setAttribute('aCorner', attr(corner, 1));
    m.frustumCulled = false; // real positions come from the shader
    if (kind === 'glass') m.renderOrder = 1;
    return m;
  }, [bricks, kind]);

  useEffect(() => () => { mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); }, [mesh]);
  return <primitive object={mesh} />;
}

// Natural eye behaviour: relaxed lids, random blinks (sometimes doubled), and glances
// that look away about half the time instead of staring. The eyes follow the cursor only
// while it moves; while talking they mostly look at the viewer.
const RELAXED_LID = 0.1; // lids rest slightly lowered; wide-open eyes read as a stare

// Small, passing expressions, like the blinking: every few seconds the mouth may frown a
// little, smirk to one side or turn pensive, hold it, then relax back to neutral. While
// talking it stays close to neutral.
// Extra lid lowering and mouth opening that expressions add on top of blinks and speech.
const expr = { squint: 0, open: 0 };

interface Expression { a: number; b: number; squint?: number; open?: number; weight: number }
// A balanced mix: no single look dominates, and big smiles are rare. a/b are the two mouth corners (+ up, - down).
const EXPRESSIONS: Record<string, Expression> = {
  smile: { a: 0.6, b: 0.6, squint: 0.18, weight: 1.2 },         // corners up, eyes crinkle
  grin: { a: 0.85, b: 0.85, squint: 0.28, open: 0.2, weight: 0.4 }, // teeth show a little; rare
  soft: { a: 0.25, b: 0.25, squint: 0.06, weight: 1.5 },         // relaxed, content
  smirkL: { a: 0.7, b: 0.1, squint: 0.08, weight: 1 },
  smirkR: { a: 0.1, b: 0.7, squint: 0.08, weight: 1 },
  hmm: { a: -0.35, b: 0.25, weight: 1.2 },                       // thinking, lopsided
  frown: { a: -0.5, b: -0.5, weight: 0.8 },                      // brief, slight
};

// Passing expressions, like the blinking: every few seconds the face drifts into one, holds it,
// then relaxes to neutral. Never the same one twice in a row. While talking it stays near neutral.
class Mood {
  private next = 4;
  private resting = true;
  private last = '';
  private target: Expression = { a: 0, b: 0, weight: 0 };

  private pick(): string {
    const names = Object.keys(EXPRESSIONS).filter((n) => n !== this.last);
    let r = Math.random() * names.reduce((s, n) => s + EXPRESSIONS[n].weight, 0);
    for (const n of names) if ((r -= EXPRESSIONS[n].weight) <= 0) return n;
    return names[0];
  }

  update(t: number, dt: number, speaking: boolean) {
    if (t > this.next) {
      if (this.resting) {
        const name = this.pick();
        this.last = name;
        const e = EXPRESSIONS[name];
        this.target = speaking ? { a: e.a * 0.25, b: e.b * 0.25, squint: (e.squint ?? 0) * 0.5, weight: 0 } : e;
        this.next = t + 1.4 + Math.random() * 1.6;
      } else {
        this.target = { a: 0, b: 0, weight: 0 };
        // Mostly neutral: long rests between expressions, so they read as moments, not a loop.
        this.next = t + 4 + Math.random() * 5;
      }
      this.resting = !this.resting;
    }
    // Ease in over about half a second: faces drift into expressions, they don't snap.
    const c = uniforms.uCorners.value;
    const k = Math.min(1, dt * 3);
    c.x += (this.target.a - c.x) * k;
    c.y += (this.target.b - c.y) * k;
    expr.squint += ((this.target.squint ?? 0) - expr.squint) * k;
    expr.open += ((this.target.open ?? 0) - expr.open) * k;
  }
}

class Eyes {
  lastMove = -10;
  private nextBlink = 1.5;
  private blinkStart = -1;
  private glance = { x: 0, y: 0 };
  private nextGlance = 0;

  update(t: number, dt: number, pointer: { x: number; y: number }, speaking: boolean) {
    let blink = 0;
    if (t > this.nextBlink && this.blinkStart < 0) this.blinkStart = t;
    if (this.blinkStart >= 0) {
      const k = (t - this.blinkStart) / 0.2; // close fast, open a bit slower
      blink = k < 0.4 ? k / 0.4 : Math.max(0, 1 - (k - 0.4) / 0.6);
      if (k >= 1) {
        this.blinkStart = -1;
        this.nextBlink = t + (Math.random() < 0.2 ? 0.15 : 2 + Math.random() * 4);
      }
    }

    if (t > this.nextGlance) {
      const away = Math.random() < (speaking ? 0.35 : 0.55);
      this.glance = away
        ? { x: (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.3), y: (Math.random() - 0.6) * 0.3 }
        : { x: (Math.random() - 0.5) * 0.15, y: (Math.random() - 0.5) * 0.08 };
      this.nextGlance = t + 1 + Math.random() * 2;
      // People often blink as their eyes change target.
      if (Math.random() < 0.3 && this.blinkStart < 0) this.nextBlink = t;
    }
    const following = performance.now() / 1000 - this.lastMove < 0.8;
    // The iris only has one brick of room each side, so keep its travel small.
    const tx = Math.max(-0.7, Math.min(0.7, following ? pointer.x * 0.6 : this.glance.x));
    const ty = Math.max(-0.25, Math.min(0.2, following ? -pointer.y * 0.2 : this.glance.y));
    // Saccade: eyes jump quickly rather than drifting.
    const look = uniforms.uLook.value;
    look.x += (tx - look.x) * Math.min(1, dt * 18);
    look.y += (ty - look.y) * Math.min(1, dt * 18);
    // The upper lid follows the eye: looking down lowers it.
    const lid = Math.min(0.6, RELAXED_LID + Math.max(0, -look.y) * 1.2 + expr.squint);
    uniforms.uBlink.value = lid + (1 - lid) * blink;
  }
}

const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HEAD_SCALE = 0.095;
const HEAD_HALF_WIDTH = 2.6; // world units at HEAD_SCALE, hair tips included

function Head({ aside }: { aside: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const start = useRef<number | null>(null);
  const open = useRef(0);
  const eyes = useRef(new Eyes());
  const mood = useRef(new Mood());

  const groups = useMemo(() => {
    const all = buildHead();
    return (['brick', 'chrome', 'glass'] as Kind[]).map((k) => [k, all.filter((b) => kindOf(b) === k)] as const);
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      eyes.current.lastMove = performance.now() / 1000;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  const shift = useRef({ x: 0, s: 1 });

  useFrame(({ clock, viewport }, dt) => {
    const t = clock.elapsedTime;
    start.current ??= t;
    uniforms.uTime.value = t;
    // Visitors who ask for reduced motion get the finished head straight away.
    uniforms.uBuild.value = REDUCED_MOTION ? 1.1 : Math.min(1.1, (t - start.current) / 1.6);
    // Mouth opens fast and closes a bit slower, which reads as speech rather than flapping.
    const target = Math.max(voice.level, expr.open);
    open.current += (target - open.current) * Math.min(1, dt * (target > open.current ? 22 : 12));
    uniforms.uOpen.value = open.current;
    eyes.current.update(t, dt, pointer.current, voice.speaking);
    mood.current.update(t, dt, voice.speaking);

    const g = group.current;
    if (!g) return;
    const p = pointer.current;
    const nod = voice.speaking ? Math.sin(t * 5.3) * 0.02 + open.current * 0.04 : 0;
    const ry = p.x * 0.5 + Math.sin(t * 0.4) * 0.06;
    const rx = p.y * 0.2 + Math.sin(t * 0.55) * 0.03 - nod;
    g.rotation.y += (ry - g.rotation.y) * Math.min(1, dt * 3);
    g.rotation.x += (rx - g.rotation.x) * Math.min(1, dt * 3);
    g.rotation.z = Math.sin(t * 0.3) * 0.02;
    g.position.y = -0.4 + Math.sin(t * 1.2) * 0.03; // breathing
    // Aside: shrink the head into the left half of the canvas so a bubble can use the right half.
    const place = aside
      ? { s: Math.min(1, (viewport.width / 2 - 0.1) / (HEAD_HALF_WIDTH * 2)), x: -viewport.width / 4 }
      : { s: 1, x: 0 };
    const k = Math.min(1, dt * 6);
    shift.current.s += (place.s - shift.current.s) * k;
    shift.current.x += (place.x - shift.current.x) * k;
    g.scale.setScalar(HEAD_SCALE * shift.current.s);
    g.position.x = shift.current.x;
  });

  return (
    <group ref={group} scale={HEAD_SCALE}>
      {groups.map(([k, bricks]) => <Bricks key={k} bricks={bricks} kind={k} />)}
    </group>
  );
}

export default function Face({ onClick, label, aside = false }: { onClick?: () => void; label?: string; aside?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="block size-full cursor-pointer outline-none">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 9.4], fov: 32 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping }}
        onCreated={({ gl, scene }) => {
          const pmrem = new THREE.PMREMGenerator(gl);
          scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
          scene.environmentIntensity = 0.5;
          pmrem.dispose();
        }}
      >
        <hemisphereLight args={['#ffffff', '#3a2f45', 0.45]} />
        <directionalLight position={[3, 5, 8]} intensity={1.7} />
        <directionalLight position={[-6, 2, -4]} intensity={1.1} color="#9ab8ff" />
        {/* Rim light from above and behind separates the hair from the background. */}
        <directionalLight position={[0, 8, -6]} intensity={0.9} />
        <Head aside={aside} />
      </Canvas>
    </button>
  );
}
