import { useRef } from 'react';
import { useInView } from 'framer-motion';
import type { RefObject } from 'react';

interface ScrollRevealResult {
  ref: RefObject<HTMLDivElement | null>;
  isInView: boolean;
}

export function useScrollReveal(margin = '-100px' as `${number}px`): ScrollRevealResult {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin });
  return { ref, isInView };
}
