import { useState, useMemo } from 'react';
import { ExternalLink, Star, GitFork } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import GlowCard from '../ui/GlowCard';
import { useApi } from '../../hooks/useApi';
import { api } from '../../services/api';
import { MOCK_PROJECTS } from '../../data/mock';
import type { Project } from '../../types';

const LANGUAGE_COLORS: Record<string, string> = {
  Python: '#3572A5',
  TypeScript: '#3178C6',
  Go: '#00ADD8',
  Rust: '#DEA584',
  'C++': '#F34B7D',
  JavaScript: '#F1E05A',
};

export default function Projects() {
  const { data: projects } = useApi<Project[]>(
    () => api.getProjects(),
    MOCK_PROJECTS,
  );
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const languages = useMemo(() => {
    if (!projects) return [];
    const langs = new Set(projects.map(p => p.language).filter(Boolean));
    return Array.from(langs) as string[];
  }, [projects]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    if (!activeFilter) return projects;
    return projects.filter(p => p.language === activeFilter);
  }, [projects, activeFilter]);

  return (
    <section id="projects" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          label="// projects"
          title="What I've Built"
          subtitle="A selection of projects spanning systems, ML, graphics, and beyond."
        />

        {/* Language filter pills */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setActiveFilter(null)}
            className={`rounded-full px-4 py-1.5 font-mono text-xs transition-all cursor-pointer ${
              activeFilter === null
                ? 'bg-cyan/20 text-cyan border border-cyan/40'
                : 'border border-border text-text-secondary hover:border-border-light hover:text-text'
            }`}
          >
            All
          </button>
          {languages.map(lang => (
            <button
              key={lang}
              onClick={() => setActiveFilter(lang === activeFilter ? null : lang)}
              className={`rounded-full px-4 py-1.5 font-mono text-xs transition-all cursor-pointer ${
                activeFilter === lang
                  ? 'bg-cyan/20 text-cyan border border-cyan/40'
                  : 'border border-border text-text-secondary hover:border-border-light hover:text-text'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Project grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, i) => (
            <GlowCard key={project.id} delay={i * 0.1}>
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-heading text-lg font-semibold text-text">
                    {project.name}
                  </h3>
                  <a
                    href={project.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-dim transition-colors hover:text-cyan"
                    aria-label={`View ${project.name} on GitHub`}
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>

                {/* Description */}
                <p className="mb-4 flex-1 text-sm leading-relaxed text-text-secondary">
                  {project.description || 'No description available.'}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  {/* Language */}
                  {project.language && (
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            LANGUAGE_COLORS[project.language] || '#888',
                        }}
                      />
                      <span className="font-mono text-xs text-text-secondary">
                        {project.language}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {project.stargazers_count > 0 && (
                      <div className="flex items-center gap-1 text-text-dim">
                        <Star size={14} />
                        <span className="font-mono text-xs">
                          {project.stargazers_count}
                        </span>
                      </div>
                    )}
                    {project.fork && (
                      <GitFork size={14} className="text-text-dim" />
                    )}
                  </div>
                </div>

                {/* Topics */}
                {project.topics.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.topics.map(topic => (
                      <span
                        key={topic}
                        className="rounded-md bg-surface-light px-2 py-0.5 font-mono text-[10px] text-text-dim"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  );
}
