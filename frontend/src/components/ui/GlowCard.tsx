import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'orange';
  delay?: number;
}

export default function GlowCard({
  children,
  className = '',
  glowColor = 'cyan',
  delay = 0,
}: Props) {
  const glowClass =
    glowColor === 'cyan'
      ? 'hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:border-cyan/40'
      : 'hover:shadow-[0_0_30px_rgba(255,107,0,0.15)] hover:border-orange/40';

  return (
    <motion.div
      className={`rounded-xl border border-border bg-surface p-6 transition-all duration-300 ${glowClass} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
    >
      {children}
    </motion.div>
  );
}
