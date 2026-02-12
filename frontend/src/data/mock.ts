import type { Project, ContributionPoint, Skill } from '../types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    name: 'neural-search-engine',
    description: 'A semantic search engine built with transformer embeddings and FAISS for ultra-fast vector similarity.',
    language: 'Python',
    stargazers_count: 42,
    html_url: 'https://github.com/ramcav/neural-search-engine',
    homepage: null,
    topics: ['machine-learning', 'search', 'embeddings'],
    fork: false,
    archived: false,
    updated_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'distributed-kv-store',
    description: 'A distributed key-value store implementing Raft consensus with gRPC transport layer.',
    language: 'Go',
    stargazers_count: 28,
    html_url: 'https://github.com/ramcav/distributed-kv-store',
    homepage: null,
    topics: ['distributed-systems', 'raft', 'grpc'],
    fork: false,
    archived: false,
    updated_at: '2025-11-15T00:00:00Z',
  },
  {
    id: 3,
    name: 'gpu-ray-tracer',
    description: 'Real-time GPU ray tracer using compute shaders with BVH acceleration structures.',
    language: 'Rust',
    stargazers_count: 65,
    html_url: 'https://github.com/ramcav/gpu-ray-tracer',
    homepage: null,
    topics: ['graphics', 'gpu', 'ray-tracing', 'rust'],
    fork: false,
    archived: false,
    updated_at: '2025-10-20T00:00:00Z',
  },
  {
    id: 4,
    name: 'llm-agent-framework',
    description: 'Lightweight framework for building tool-using LLM agents with structured output and memory.',
    language: 'Python',
    stargazers_count: 103,
    html_url: 'https://github.com/ramcav/llm-agent-framework',
    homepage: null,
    topics: ['llm', 'agents', 'ai'],
    fork: false,
    archived: false,
    updated_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 5,
    name: 'portfolio-frontend',
    description: 'This portfolio website — built with React, Three.js, and a dark futuristic aesthetic.',
    language: 'TypeScript',
    stargazers_count: 12,
    html_url: 'https://github.com/ramcav/portfolio-frontend',
    homepage: 'https://ramcav.dev',
    topics: ['portfolio', 'react', 'threejs'],
    fork: false,
    archived: false,
    updated_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 6,
    name: 'quantum-sim',
    description: 'Quantum circuit simulator supporting up to 20 qubits with gate-level noise models.',
    language: 'C++',
    stargazers_count: 37,
    html_url: 'https://github.com/ramcav/quantum-sim',
    homepage: null,
    topics: ['quantum-computing', 'simulation'],
    fork: false,
    archived: false,
    updated_at: '2025-09-05T00:00:00Z',
  },
];

// Generate mock contribution viz data
function generateCluster(cx: number, cy: number, n: number, spread: number, repo: string, color: string): ContributionPoint[] {
  return Array.from({ length: n }, (_, i) => ({
    x: cx + (Math.random() - 0.5) * spread,
    y: cy + (Math.random() - 0.5) * spread,
    label: `commit ${i + 1}`,
    repo,
    color,
    date: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    message: `feat: implement ${['parser', 'optimizer', 'scheduler', 'allocator', 'resolver'][i % 5]}`,
    size: Math.random() * 8 + 2,
  }));
}

export const MOCK_VIZ_DATA: Record<string, ContributionPoint[]> = {
  pca: [
    ...generateCluster(-3, 2, 25, 2, 'neural-search-engine', '#00e5ff'),
    ...generateCluster(4, -1, 20, 2.5, 'distributed-kv-store', '#ff6b00'),
    ...generateCluster(-1, -4, 30, 1.8, 'gpu-ray-tracer', '#a78bfa'),
    ...generateCluster(3, 4, 18, 2, 'llm-agent-framework', '#34d399'),
    ...generateCluster(-4, -2, 15, 1.5, 'quantum-sim', '#f472b6'),
    ...generateCluster(1, 1, 12, 3, 'portfolio-frontend', '#fbbf24'),
  ],
  umap: [
    ...generateCluster(-5, 3, 25, 1.2, 'neural-search-engine', '#00e5ff'),
    ...generateCluster(5, 5, 20, 1.0, 'distributed-kv-store', '#ff6b00'),
    ...generateCluster(0, -5, 30, 1.3, 'gpu-ray-tracer', '#a78bfa'),
    ...generateCluster(-4, -3, 18, 0.9, 'llm-agent-framework', '#34d399'),
    ...generateCluster(4, -2, 15, 1.1, 'quantum-sim', '#f472b6'),
    ...generateCluster(-1, 1, 12, 1.5, 'portfolio-frontend', '#fbbf24'),
  ],
  tsne: [
    ...generateCluster(-8, 5, 25, 2, 'neural-search-engine', '#00e5ff'),
    ...generateCluster(7, 8, 20, 1.8, 'distributed-kv-store', '#ff6b00'),
    ...generateCluster(2, -8, 30, 2.2, 'gpu-ray-tracer', '#a78bfa'),
    ...generateCluster(-6, -5, 18, 1.6, 'llm-agent-framework', '#34d399'),
    ...generateCluster(8, -3, 15, 1.9, 'quantum-sim', '#f472b6'),
    ...generateCluster(-2, 0, 12, 2.5, 'portfolio-frontend', '#fbbf24'),
  ],
};

export const SKILLS: Skill[] = [
  // Languages
  { name: 'Python', category: 'Languages', level: 0.95 },
  { name: 'TypeScript', category: 'Languages', level: 0.9 },
  { name: 'Go', category: 'Languages', level: 0.8 },
  { name: 'Rust', category: 'Languages', level: 0.75 },
  { name: 'C++', category: 'Languages', level: 0.7 },
  { name: 'SQL', category: 'Languages', level: 0.85 },
  // Frameworks
  { name: 'React', category: 'Frameworks', level: 0.9 },
  { name: 'FastAPI', category: 'Frameworks', level: 0.85 },
  { name: 'Next.js', category: 'Frameworks', level: 0.8 },
  { name: 'Three.js', category: 'Frameworks', level: 0.7 },
  { name: 'Gin', category: 'Frameworks', level: 0.75 },
  // Data & ML
  { name: 'PyTorch', category: 'Data & ML', level: 0.85 },
  { name: 'scikit-learn', category: 'Data & ML', level: 0.9 },
  { name: 'Transformers', category: 'Data & ML', level: 0.8 },
  { name: 'FAISS', category: 'Data & ML', level: 0.75 },
  { name: 'Pandas', category: 'Data & ML', level: 0.9 },
  // DevOps
  { name: 'Docker', category: 'DevOps', level: 0.85 },
  { name: 'Kubernetes', category: 'DevOps', level: 0.7 },
  { name: 'AWS', category: 'DevOps', level: 0.75 },
  { name: 'CI/CD', category: 'DevOps', level: 0.8 },
  { name: 'Terraform', category: 'DevOps', level: 0.65 },
  // Tools
  { name: 'Git', category: 'Tools', level: 0.95 },
  { name: 'Linux', category: 'Tools', level: 0.85 },
  { name: 'Neovim', category: 'Tools', level: 0.8 },
  { name: 'PostgreSQL', category: 'Tools', level: 0.85 },
  { name: 'Redis', category: 'Tools', level: 0.75 },
];

export const ABOUT_FACTS = [
  { label: 'location', value: '// your location here' },
  { label: 'focus', value: 'systems & ML engineering' },
  { label: 'languages', value: 'Python, Go, Rust, TS, C++' },
  { label: 'interests', value: 'distributed systems, AI agents' },
  { label: 'github', value: 'github.com/ramcav' },
];

export interface Publication {
  title: string;
  authors: string;
  venue: string;
  year: number;
  abstract: string;
  url?: string;
  tags: string[];
}

export interface ResearchInterest {
  title: string;
  icon: string;
  description: string;
  keywords: string[];
}

export const PUBLICATIONS: Publication[] = [
  {
    title: 'Efficient Consensus in Heterogeneous Edge Networks',
    authors: 'R. Mendez, et al.',
    venue: 'arXiv preprint',
    year: 2025,
    abstract:
      'We propose an adaptive Raft variant that adjusts heartbeat and election timeouts based on network latency profiles, reducing leader election overhead by 40% in geo-distributed edge deployments.',
    url: '#',
    tags: ['distributed-systems', 'consensus', 'edge-computing'],
  },
  {
    title: 'Retrieval-Augmented Generation with Hierarchical Memory',
    authors: 'R. Mendez, et al.',
    venue: 'Workshop on LLM Agents',
    year: 2025,
    abstract:
      'A memory architecture for LLM agents that maintains short-term, episodic, and semantic memory layers, enabling more coherent multi-turn reasoning over large codebases.',
    url: '#',
    tags: ['llm', 'rag', 'memory', 'agents'],
  },
];

export const RESEARCH_INTERESTS: ResearchInterest[] = [
  {
    title: 'Emergent Behavior in Multi-Agent Systems',
    icon: '\u{1F9E0}',
    description:
      'How do simple agent rules produce complex collective intelligence? Exploring coordination protocols, swarm dynamics, and emergent problem-solving in LLM agent ensembles.',
    keywords: ['multi-agent', 'emergence', 'swarm-intelligence'],
  },
  {
    title: 'Learned Index Structures',
    icon: '\u{1F50D}',
    description:
      'Replacing traditional B-trees and hash maps with neural networks that learn the data distribution. Investigating trade-offs between model complexity and query latency.',
    keywords: ['learned-indexes', 'database', 'neural-networks'],
  },
  {
    title: 'Program Synthesis via LLMs',
    icon: '\u{1F4BB}',
    description:
      'Can language models reliably generate correct, efficient, and safe code from natural language specs? Studying formal verification techniques for LLM-generated programs.',
    keywords: ['program-synthesis', 'formal-verification', 'llm'],
  },
  {
    title: 'GPU-Accelerated Scientific Computing',
    icon: '\u{26A1}',
    description:
      'Pushing compute shaders and CUDA kernels for real-time simulation — from fluid dynamics to molecular modeling. Exploring WebGPU as a portable compute target.',
    keywords: ['gpu', 'compute-shaders', 'simulation', 'webgpu'],
  },
  {
    title: 'Dimensionality Reduction as Art',
    icon: '\u{1F3A8}',
    description:
      'Using PCA, UMAP, and t-SNE not just for analysis but as a generative medium — turning high-dimensional data like git histories into visual art.',
    keywords: ['dimensionality-reduction', 'generative-art', 'visualization'],
  },
  {
    title: 'Secure Distributed Computation',
    icon: '\u{1F512}',
    description:
      'Exploring MPC (multi-party computation) and homomorphic encryption for privacy-preserving ML inference on untrusted infrastructure.',
    keywords: ['mpc', 'homomorphic-encryption', 'privacy', 'security'],
  },
];
