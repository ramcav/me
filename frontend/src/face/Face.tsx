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
        uniform float uTime; uniform float uBuild; uniform float uOpen; uniform vec2 uLook; uniform float uBlink; uniform float uLidY;
        attribute vec4 aHome; attribute vec3 aScatter; // aHome.w = brick scale
        // Packed to stay under WebGL's 16 vertex attributes.
        attribute vec4 aAnim; // mouth, stretch, eye (1 white, 2 pupil), sway
        attribute vec4 aMisc; // phase, delay, tilt.xy
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
        p.z -= abs(aMouth) * uOpen * 0.25; // lips roll back slightly as they part
        if (aEye > 1.5) p.xy += uLook;
        if (aEye > 0.5) p.y = mix(p.y, uLidY, uBlink); // the eye folds up under the lid
        // Loose bricks drift very slightly, each on its own rhythm.
        p += vec3(sin(uTime * 0.8 + aPhase * 40.0), cos(uTime * 0.7 + aPhase * 23.0), sin(uTime * 0.6 + aPhase * 31.0)) * (aHome.w < 1.0 ? 0.0 : 0.05);
        p += aSway * aSway * vec3(sin(uTime * 1.3 + aPhase * 6.28), cos(uTime * 1.1 + aPhase * 6.28), 0.0) * 0.5;
        float t = clamp((uBuild - aDelay) / 0.45, 0.0, 1.0);
        t = 1.0 - pow(1.0 - t, 3.0);
        p = mix(aScatter, p, t);
        vec3 size = vec3(${(STEP * 0.8).toFixed(3)}) * (aHome.w < 1.0 ? aHome.w * 1.15 : 1.0); // fine bricks sit edge to edge
        size.y += aStretch * uOpen;
        if (aEye > 0.5) size.y *= 1.0 - uBlink;
        vec3 lp = position * size * mix(0.3, 1.0, t);
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
  brick: () => new THREE.MeshStandardMaterial({ roughness: 0.4 }),
  chrome: () => new THREE.MeshStandardMaterial({ roughness: 0.18, metalness: 0.7 }),
  glass: () => new THREE.MeshStandardMaterial({
    roughness: 0.1, transparent: true, opacity: 0.3, depthWrite: false,
    emissive: new THREE.Color('#ff2a4a'), emissiveIntensity: 0.2,
  }),
};

function Bricks({ bricks, kind }: { bricks: Brick[]; kind: Kind }) {
  const mesh = useMemo(() => {
    const n = bricks.length;
    const f = (k: number) => new Float32Array(n * k);
    const home = f(4), scatter = f(3), anim = f(4), misc = f(4);
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const m = new THREE.InstancedMesh(geo, patch(MATERIALS[kind]()), n);
    const r = rng(kind.length * 7 + 1);
    const c = new THREE.Color();
    bricks.forEach((b, i) => {
      home.set([...b.pos, b.scale ?? 1], i * 4);
      const d = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(45 + r() * 30);
      scatter.set([d.x, d.y, d.z], i * 3);
      anim.set([b.mouth, b.stretch, b.eye ?? 0, b.sway], i * 4);
      const tilt = b.scale ? 0 : 0.28;
      misc.set([r(), ((b.pos[1] + 18) / 50) * 0.5 + r() * 0.1, (r() - 0.5) * tilt, (r() - 0.5) * tilt], i * 4);
      m.setColorAt(i, c.set(b.color));
    });
    const attr = (a: Float32Array, k: number) => new THREE.InstancedBufferAttribute(a, k);
    geo.setAttribute('aHome', attr(home, 4));
    geo.setAttribute('aScatter', attr(scatter, 3));
    geo.setAttribute('aAnim', attr(anim, 4));
    geo.setAttribute('aMisc', attr(misc, 4));
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
    const lid = RELAXED_LID + Math.max(0, -look.y) * 1.2;
    uniforms.uBlink.value = lid + (1 - lid) * blink;
  }
}

function Head() {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const start = useRef<number | null>(null);
  const open = useRef(0);
  const eyes = useRef(new Eyes());

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

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    start.current ??= t;
    uniforms.uTime.value = t;
    uniforms.uBuild.value = Math.min(1, (t - start.current) / 2.2);
    // Mouth opens fast and closes a bit slower, which reads as speech rather than flapping.
    const target = voice.level;
    open.current += (target - open.current) * Math.min(1, dt * (target > open.current ? 22 : 12));
    uniforms.uOpen.value = open.current;
    eyes.current.update(t, dt, pointer.current, voice.speaking);

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
  });

  return (
    <group ref={group} scale={0.095}>
      {groups.map(([k, bricks]) => <Bricks key={k} bricks={bricks} kind={k} />)}
    </group>
  );
}

export default function Face({ onClick, label }: { onClick?: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="block size-full cursor-pointer outline-none">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8.6], fov: 32 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping }}
        onCreated={({ gl, scene }) => {
          const pmrem = new THREE.PMREMGenerator(gl);
          scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
          scene.environmentIntensity = 0.5;
          pmrem.dispose();
        }}
      >
        <hemisphereLight args={['#ffffff', '#3a2f45', 0.7]} />
        <directionalLight position={[3, 5, 8]} intensity={1.6} />
        <directionalLight position={[-6, 2, -4]} intensity={1.2} color="#9ab8ff" />
        <Head />
      </Canvas>
    </button>
  );
}
