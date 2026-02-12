import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import ParticleNetwork from './ParticleNetwork';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex h-screen w-full items-center justify-center overflow-hidden"
    >
      {/* Three.js Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <ParticleNetwork />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-transparent to-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#06060b_70%)]" />

      {/* Content overlay */}
      <div className="relative z-10 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="font-heading text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
            <span className="text-text">Ricardo</span>
            <br />
            <span className="bg-gradient-to-r from-cyan to-orange bg-clip-text text-transparent">
              Mendez
            </span>
          </h1>
        </motion.div>

        <motion.p
          className="mx-auto mt-6 max-w-xl font-mono text-base text-text-secondary md:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <span className="text-cyan">&gt;</span> software engineer &middot;
          systems thinker &middot; builder
        </motion.p>

        <motion.div
          className="mt-8 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <a
            href="#projects"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan px-6 py-3 text-sm font-medium text-bg transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg border border-orange/50 px-6 py-3 text-sm font-medium text-orange transition-all hover:border-orange hover:bg-orange/10 hover:shadow-[0_0_20px_rgba(255,107,0,0.15)]"
          >
            Get in Touch
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="text-text-dim" size={28} />
      </motion.div>
    </section>
  );
}
