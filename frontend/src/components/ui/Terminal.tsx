import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Terminal({ title = 'terminal', children, className = '' }: Props) {
  return (
    <div
      className={`scanlines relative overflow-hidden rounded-xl border border-border bg-[#0a0a12] ${className}`}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <span className="h-3 w-3 rounded-full bg-green-500/70" />
        </div>
        <span className="ml-2 font-mono text-xs text-text-dim">{title}</span>
      </div>
      {/* Content */}
      <motion.div
        className="p-4 font-mono text-sm leading-relaxed"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
