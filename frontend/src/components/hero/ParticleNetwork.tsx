import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 120;
const CONNECTION_DISTANCE = 2.5;
const MOUSE_INFLUENCE = 3;
const MOUSE_RADIUS = 5;

export default function ParticleNetwork() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const mousePos = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  // Generate initial particle positions
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8,
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.003,
      ),
      baseSize: Math.random() * 0.5 + 0.3,
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-allocate line geometry
  const maxLines = PARTICLE_COUNT * (PARTICLE_COUNT - 1) / 2;
  const linePositions = useMemo(
    () => new Float32Array(maxLines * 6),
    [maxLines],
  );
  const lineColors = useMemo(
    () => new Float32Array(maxLines * 6),
    [maxLines],
  );
  const lineGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    return geom;
  }, [linePositions, lineColors]);

  // Track mouse
  const handlePointerMove = (e: { clientX: number; clientY: number }) => {
    mousePos.current.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1,
    );
  };

  // Add listener
  useMemo(() => {
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    if (!meshRef.current || !linesRef.current) return;

    const mouseWorld = new THREE.Vector3(
      mousePos.current.x * viewport.width * 0.5,
      mousePos.current.y * viewport.height * 0.5,
      0,
    );

    // Update particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];

      // Drift
      p.position.add(p.velocity);

      // Bounce off boundaries
      if (Math.abs(p.position.x) > 8) p.velocity.x *= -1;
      if (Math.abs(p.position.y) > 5) p.velocity.y *= -1;
      if (Math.abs(p.position.z) > 4) p.velocity.z *= -1;

      // Mouse repulsion
      const dx = p.position.x - mouseWorld.x;
      const dy = p.position.y - mouseWorld.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0.1) {
        const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * MOUSE_INFLUENCE * 0.001;
        p.position.x += (dx / dist) * force;
        p.position.y += (dy / dist) * force;
      }

      // Set instance matrix
      dummy.position.copy(p.position);
      const scale = p.baseSize * (1 + (dist < MOUSE_RADIUS ? 0.3 : 0));
      dummy.scale.setScalar(scale * 0.08);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Update connections
    let lineIndex = 0;
    const cyanR = 0, cyanG = 0.898, cyanB = 1;
    const orangeR = 1, orangeG = 0.42, orangeB = 0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dist = particles[i].position.distanceTo(particles[j].position);
        if (dist < CONNECTION_DISTANCE) {
          const alpha = 1 - dist / CONNECTION_DISTANCE;
          const idx = lineIndex * 6;

          linePositions[idx] = particles[i].position.x;
          linePositions[idx + 1] = particles[i].position.y;
          linePositions[idx + 2] = particles[i].position.z;
          linePositions[idx + 3] = particles[j].position.x;
          linePositions[idx + 4] = particles[j].position.y;
          linePositions[idx + 5] = particles[j].position.z;

          // Gradient from cyan to orange based on position
          const t = (particles[i].position.x + 8) / 16;
          const r = cyanR + (orangeR - cyanR) * t;
          const g = cyanG + (orangeG - cyanG) * t;
          const b = cyanB + (orangeB - cyanB) * t;

          lineColors[idx] = r * alpha;
          lineColors[idx + 1] = g * alpha;
          lineColors[idx + 2] = b * alpha;
          lineColors[idx + 3] = r * alpha;
          lineColors[idx + 4] = g * alpha;
          lineColors[idx + 5] = b * alpha;

          lineIndex++;
        }
      }
    }

    lineGeom.setDrawRange(0, lineIndex * 2);
    lineGeom.attributes.position.needsUpdate = true;
    lineGeom.attributes.color.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.8} />
      </instancedMesh>
      <lineSegments ref={linesRef} geometry={lineGeom}>
        <lineBasicMaterial vertexColors transparent opacity={0.4} />
      </lineSegments>
    </>
  );
}
