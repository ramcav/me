import { motion } from 'framer-motion';
import SectionHeading from '../ui/SectionHeading';
import Terminal from '../ui/Terminal';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { ABOUT_FACTS } from '../../data/mock';

export default function About() {
  const { ref, isInView } = useScrollReveal();

  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          label="// about"
          title="Who I Am"
          subtitle="Engineer at the intersection of systems, data, and intelligence."
        />

        <div ref={ref} className="grid gap-12 md:grid-cols-2 md:items-center">
          {/* Narrative */}
          <motion.div
            className="space-y-5 text-base leading-relaxed text-text-secondary md:text-lg"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p>
              I build things that sit at the boundary of{' '}
              <span className="text-cyan">hard engineering</span> and{' '}
              <span className="text-orange">creative exploration</span> — from
              distributed systems and GPU-accelerated compute to LLM agents and
              generative art.
            </p>
            <p>
              I care about performance, clean abstractions, and writing software
              that earns trust. Whether it's crafting a Raft consensus
              implementation or wiring up a transformer pipeline, the work is
              always about understanding the system end to end.
            </p>
            <p>
              When I'm not coding, I'm reading papers, tinkering with hardware,
              or exploring the frontier of what's computationally possible.
            </p>
          </motion.div>

          {/* Terminal card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Terminal title="~/about.sh">
              <div className="space-y-2">
                <p className="text-cyan">$ cat profile.json</p>
                <div className="mt-3 space-y-1.5">
                  {ABOUT_FACTS.map(({ label, value }) => (
                    <div key={label}>
                      <span className="text-text-dim">&quot;{label}&quot;</span>
                      <span className="text-text-dim">: </span>
                      <span className="text-orange">&quot;{value}&quot;</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-text-dim">
                  <span className="animate-pulse text-cyan">▊</span>
                </p>
              </div>
            </Terminal>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
