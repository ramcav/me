import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import SectionHeading from '../ui/SectionHeading';
import { useApi } from '../../hooks/useApi';
import { api } from '../../services/api';
import { MOCK_VIZ_DATA } from '../../data/mock';
import type { VizMethod, ContributionVizResponse, ContributionPoint } from '../../types';

const Plot = lazy(() => import('react-plotly.js'));

const METHODS: { key: VizMethod; label: string; description: string }[] = [
  {
    key: 'pca',
    label: 'PCA',
    description: 'Principal Component Analysis — linear projection onto directions of maximum variance.',
  },
  {
    key: 'umap',
    label: 'UMAP',
    description: 'Uniform Manifold Approximation — preserves local neighborhood structure.',
  },
  {
    key: 'tsne',
    label: 't-SNE',
    description: 't-Distributed Stochastic Neighbor Embedding — reveals clusters at multiple scales.',
  },
];

export default function ContributionsArt() {
  const [method, setMethod] = useState<VizMethod>('pca');

  const fallback = useMemo(
    () => ({ method, points: MOCK_VIZ_DATA[method] }),
    [method],
  );

  const fetcher = useCallback(
    () => api.getContributionViz(method),
    [method],
  );

  const { data } = useApi<ContributionVizResponse>(fetcher, fallback);

  const points = data?.points || MOCK_VIZ_DATA[method];

  // Group by repo for traces
  const traces = useMemo(() => {
    const groups: Record<string, ContributionPoint[]> = {};
    for (const p of points) {
      if (!groups[p.repo]) groups[p.repo] = [];
      groups[p.repo].push(p);
    }

    return Object.entries(groups).map(([repo, pts]) => ({
      x: pts.map(p => p.x),
      y: pts.map(p => p.y),
      mode: 'markers' as const,
      type: 'scatter' as const,
      name: repo,
      marker: {
        color: pts[0].color,
        size: pts.map(p => p.size || 6),
        opacity: 0.8,
        line: { width: 1, color: 'rgba(255,255,255,0.1)' },
      },
      text: pts.map(
        p =>
          `<b>${p.repo}</b><br>${p.message || p.label}<br>${p.date ? new Date(p.date).toLocaleDateString() : ''}`,
      ),
      hovertemplate: '%{text}<extra></extra>',
    }));
  }, [points]);

  const activeMethod = METHODS.find(m => m.key === method)!;

  return (
    <section id="contributions" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          label="// contributions"
          title="Git Contributions as Art"
          subtitle="Dimensionality reduction applied to git activity — each point is a commit, clustered by codebase similarity."
        />

        {/* Method tabs */}
        <div className="mb-6 flex justify-center gap-2">
          {METHODS.map(m => (
            <button
              key={m.key}
              onClick={() => setMethod(m.key)}
              className={`rounded-lg px-5 py-2 font-mono text-sm font-medium transition-all cursor-pointer ${
                method === m.key
                  ? 'bg-cyan/15 text-cyan border border-cyan/40 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                  : 'border border-border text-text-secondary hover:border-border-light hover:text-text'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <p className="mb-8 text-center font-mono text-xs text-text-dim">
          {activeMethod.description}
        </p>

        {/* Plot */}
        <div className="overflow-hidden rounded-xl border border-border bg-[#0a0a12]">
          <Suspense
            fallback={
              <div className="flex h-[500px] items-center justify-center">
                <span className="font-mono text-sm text-text-dim animate-pulse">
                  Loading visualization...
                </span>
              </div>
            }
          >
            <Plot
              data={traces}
              layout={{
                autosize: true,
                height: 500,
                paper_bgcolor: '#0a0a12',
                plot_bgcolor: '#0a0a12',
                margin: { l: 40, r: 40, t: 20, b: 40 },
                xaxis: {
                  showgrid: true,
                  gridcolor: '#1a1a2e',
                  zerolinecolor: '#1a1a2e',
                  tickfont: { color: '#52525b', family: 'JetBrains Mono', size: 10 },
                },
                yaxis: {
                  showgrid: true,
                  gridcolor: '#1a1a2e',
                  zerolinecolor: '#1a1a2e',
                  tickfont: { color: '#52525b', family: 'JetBrains Mono', size: 10 },
                },
                legend: {
                  font: { color: '#71717a', family: 'JetBrains Mono', size: 11 },
                  bgcolor: 'transparent',
                  x: 1,
                  xanchor: 'right',
                  y: 1,
                },
                hoverlabel: {
                  bgcolor: '#0f0f17',
                  bordercolor: '#1a1a2e',
                  font: { color: '#e4e4e7', family: 'JetBrains Mono', size: 12 },
                },
              }}
              config={{
                displayModeBar: false,
                responsive: true,
              }}
              useResizeHandler
              style={{ width: '100%' }}
            />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
