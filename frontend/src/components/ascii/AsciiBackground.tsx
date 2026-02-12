import { useEffect, useRef, useCallback } from 'react';

const CHARS = '01アイウエオカキクケコ{}[]<>|/\\=+-*#@$%&!?.,:;~^abcdef0123456789';
const CELL_SIZE = 18;
const FONT_SIZE = 13;

// Simple hash-based pseudo-noise (no dependency needed)
function noise2d(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number, t: number): number {
  const a = noise2d(Math.floor(x) + t * 0.3, Math.floor(y));
  const b = noise2d(Math.floor(x) + 1 + t * 0.3, Math.floor(y));
  const c = noise2d(Math.floor(x) + t * 0.3, Math.floor(y) + 1);
  const d = noise2d(Math.floor(x) + 1 + t * 0.3, Math.floor(y) + 1);
  const fx = x - Math.floor(x);
  const fy = y - Math.floor(y);
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  return a * (1 - sx) * (1 - sy) + b * sx * (1 - sy) + c * (1 - sx) * sy + d * sx * sy;
}

interface Props {
  /** 0 = fully transparent, 1 = full intensity */
  intensity?: number;
  /** Whether this is the hero (more reactive, denser) */
  isHero?: boolean;
}

export default function AsciiBackground({ intensity = 0.12, isHero = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const scrollRef = useRef(0);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef(Date.now());

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleScroll = useCallback(() => {
    scrollRef.current = window.scrollY;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      if (!canvas || !ctx) return;
      const { width, height } = canvas;
      const t = (Date.now() - startTimeRef.current) / 1000;
      const scroll = scrollRef.current;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / CELL_SIZE) + 1;
      const rows = Math.ceil(height / CELL_SIZE) + 1;

      // Hero section detection: first viewport height
      const heroBottom = window.innerHeight;
      const scrollInHero = scroll < heroBottom;
      const baseIntensity = isHero
        ? intensity
        : scrollInHero
          ? intensity * 0.5
          : intensity;

      ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * CELL_SIZE + CELL_SIZE / 2;
          const y = row * CELL_SIZE + CELL_SIZE / 2;

          // Noise-based character selection (shifts with time + scroll)
          const n = smoothNoise(col * 0.15, row * 0.15 + scroll * 0.001, t * 0.4);
          const charIdx = Math.floor(n * CHARS.length) % CHARS.length;
          const char = CHARS[Math.abs(charIdx)];

          // Distance from mouse
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const mouseRadius = isHero ? 200 : 150;
          const mouseInfluence = dist < mouseRadius ? 1 - dist / mouseRadius : 0;

          // Noise-based opacity variation
          const noiseOpacity = smoothNoise(col * 0.3, row * 0.3, t * 0.2) * 0.6 + 0.2;

          // Final opacity: base * noise + mouse boost
          let opacity = baseIntensity * noiseOpacity + mouseInfluence * 0.5;

          // Characters near mouse get extra brightness and shift faster
          if (mouseInfluence > 0) {
            opacity = Math.min(opacity + mouseInfluence * 0.4, 0.9);
          }

          // Color: blend cyan to orange based on horizontal position + noise
          const colorT = (col / cols + smoothNoise(row * 0.1, col * 0.1, t * 0.1) * 0.3) % 1;

          // Cyan: rgb(0, 229, 255) -> Orange: rgb(255, 107, 0)
          const r = Math.round(0 + (255 - 0) * colorT);
          const g = Math.round(229 + (107 - 229) * colorT);
          const b = Math.round(255 + (0 - 255) * colorT);

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;

          // Slight positional jitter from noise
          const jitterX = (smoothNoise(col * 0.5, row * 0.5, t * 0.8) - 0.5) * 3;
          const jitterY = (smoothNoise(col * 0.5 + 100, row * 0.5, t * 0.8) - 0.5) * 3;

          ctx.fillText(char, x + jitterX, y + jitterY);
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resize);
    };
  }, [intensity, isHero, handleMouseMove, handleScroll]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
