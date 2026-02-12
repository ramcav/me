import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface Props {
  label: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ label, title, subtitle }: Props) {
  const { ref, isInView } = useScrollReveal();

  return (
    <motion.div
      ref={ref}
      className="mb-12 text-center md:mb-16"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <span className="mb-3 inline-block font-mono text-sm tracking-widest text-cyan uppercase">
        {label}
      </span>
      <h2 className="font-heading text-3xl font-bold text-text md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-base text-text-secondary md:text-lg">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
