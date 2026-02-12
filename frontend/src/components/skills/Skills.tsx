import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeading from '../ui/SectionHeading';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { SKILLS } from '../../data/mock';
import type { SkillCategory } from '../../types';

const CATEGORIES: SkillCategory[] = [
  'Languages',
  'Frameworks',
  'Data & ML',
  'DevOps',
  'Tools',
];

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  Languages: '#00e5ff',
  Frameworks: '#ff6b00',
  'Data & ML': '#a78bfa',
  DevOps: '#34d399',
  Tools: '#fbbf24',
};

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState<SkillCategory | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const { ref, isInView } = useScrollReveal();

  const filteredSkills = useMemo(() => {
    if (!activeCategory) return SKILLS;
    return SKILLS.filter(s => s.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="skills" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          label="// skills"
          title="Tech Stack"
          subtitle="Technologies I work with, organized by domain."
        />

        {/* Category tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-4 py-1.5 font-mono text-xs transition-all cursor-pointer ${
              activeCategory === null
                ? 'bg-cyan/20 text-cyan border border-cyan/40'
                : 'border border-border text-text-secondary hover:border-border-light hover:text-text'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(cat === activeCategory ? null : cat)
              }
              className={`rounded-full px-4 py-1.5 font-mono text-xs transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'border'
                  : 'border border-border text-text-secondary hover:border-border-light hover:text-text'
              }`}
              style={
                activeCategory === cat
                  ? {
                      borderColor: CATEGORY_COLORS[cat],
                      color: CATEGORY_COLORS[cat],
                      backgroundColor: `${CATEGORY_COLORS[cat]}20`,
                    }
                  : undefined
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skill nodes */}
        <motion.div
          ref={ref}
          className="flex flex-wrap justify-center gap-3 md:gap-4"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map(skill => {
              const color = CATEGORY_COLORS[skill.category];
              const isHovered = hoveredSkill === skill.name;
              const size = 60 + skill.level * 40;

              return (
                <motion.div
                  key={skill.name}
                  layout
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                  className="group relative cursor-default"
                  onMouseEnter={() => setHoveredSkill(skill.name)}
                  onMouseLeave={() => setHoveredSkill(null)}
                >
                  <motion.div
                    className="flex items-center justify-center rounded-xl border transition-all duration-200"
                    style={{
                      width: size,
                      height: size,
                      borderColor: isHovered ? color : 'var(--color-border)',
                      backgroundColor: isHovered ? `${color}15` : 'var(--color-surface)',
                      boxShadow: isHovered
                        ? `0 0 20px ${color}33`
                        : 'none',
                    }}
                    whileHover={{ scale: 1.08, y: -4 }}
                  >
                    <span
                      className="font-mono text-xs font-medium text-center px-1 leading-tight"
                      style={{ color: isHovered ? color : 'var(--color-text-secondary)' }}
                    >
                      {skill.name}
                    </span>
                  </motion.div>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        className="absolute -top-10 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-xs"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                      >
                        <span style={{ color }}>{skill.category}</span>
                        <span className="text-text-dim">
                          {' '}
                          &middot; {Math.round(skill.level * 100)}%
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
