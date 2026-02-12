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
          subtitle="CS & AI student, backend engineer, and startup founder based in Madrid."
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
              I'm a Computer Science &amp; AI student at{' '}
              <span className="text-cyan">IE University</span>, ranked 1st in
              my class with a 9.38/10 GPA. I build at the intersection of{' '}
              <span className="text-cyan">backend engineering</span> and{' '}
              <span className="text-orange">AI innovation</span> — from
              production agent systems to full-stack platforms.
            </p>
            <p>
              I've interned as a backend engineer at{' '}
              <span className="text-cyan">Wise</span> working on identity
              verification at scale with Java, Kafka, and distributed systems,
              and I'm currently building AI agents at{' '}
              <span className="text-orange">Supahost</span> with FastAPI and
              Google ADK.
            </p>
            <p>
              I also founded{' '}
              <span className="text-orange">theHouse</span>, a nightlife tech
              startup where I built an iOS app with 500+ downloads and a
              full-stack payment platform. Currently writing my thesis on
              agentic memory systems.
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
