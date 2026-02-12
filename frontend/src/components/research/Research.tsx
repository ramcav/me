import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ExternalLink, Microscope, BookOpen } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import GlowCard from '../ui/GlowCard';
import { PUBLICATIONS, RESEARCH_INTERESTS } from '../../data/mock';

type Tab = 'publications' | 'interests';

export default function Research() {
  const [tab, setTab] = useState<Tab>('publications');

  return (
    <section id="research" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          label="// research"
          title="Research"
          subtitle="Published work and the questions I'm currently investigating."
        />

        {/* Tabs */}
        <div className="mb-10 flex justify-center gap-2">
          <button
            onClick={() => setTab('publications')}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 font-mono text-sm font-medium transition-all cursor-pointer ${
              tab === 'publications'
                ? 'bg-cyan/15 text-cyan border border-cyan/40 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                : 'border border-border text-text-secondary hover:border-border-light hover:text-text'
            }`}
          >
            <FileText size={14} />
            Publications
          </button>
          <button
            onClick={() => setTab('interests')}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 font-mono text-sm font-medium transition-all cursor-pointer ${
              tab === 'interests'
                ? 'bg-orange/15 text-orange border border-orange/40 shadow-[0_0_15px_rgba(255,107,0,0.1)]'
                : 'border border-border text-text-secondary hover:border-border-light hover:text-text'
            }`}
          >
            <Microscope size={14} />
            Interests
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'publications' ? (
            <motion.div
              key="publications"
              className="space-y-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {PUBLICATIONS.map((pub, i) => (
                <GlowCard key={pub.title} delay={i * 0.08} glowColor="cyan">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-1.5 flex items-center gap-2">
                        <BookOpen size={14} className="text-cyan" />
                        <span className="font-mono text-xs text-text-dim">
                          {pub.venue} &middot; {pub.year}
                        </span>
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-text">
                        {pub.title}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-text-secondary">
                        {pub.authors}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                        {pub.abstract}
                      </p>
                      {pub.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {pub.tags.map(tag => (
                            <span
                              key={tag}
                              className="rounded-md bg-surface-light px-2 py-0.5 font-mono text-[10px] text-text-dim"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {pub.url && (
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 whitespace-nowrap rounded-lg border border-border px-3 py-1.5 font-mono text-xs text-text-secondary transition-all hover:border-cyan/40 hover:text-cyan"
                      >
                        <ExternalLink size={12} />
                        Paper
                      </a>
                    )}
                  </div>
                </GlowCard>
              ))}

              {PUBLICATIONS.length === 0 && (
                <div className="py-16 text-center">
                  <FileText className="mx-auto mb-3 text-text-dim" size={32} />
                  <p className="font-mono text-sm text-text-secondary">
                    Publications coming soon.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="interests"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {RESEARCH_INTERESTS.map((interest, i) => (
                <GlowCard key={interest.title} delay={i * 0.08} glowColor="orange">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-2xl">{interest.icon}</span>
                    <div>
                      <h3 className="font-heading text-base font-semibold text-text">
                        {interest.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                        {interest.description}
                      </p>
                      {interest.keywords.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {interest.keywords.map(kw => (
                            <span
                              key={kw}
                              className="rounded-md bg-surface-light px-2 py-0.5 font-mono text-[10px] text-orange/70"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </GlowCard>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
