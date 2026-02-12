import type { Project, ContributionPoint, Skill } from '../types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    name: 'one-minute',
    description:
      'Intelligent emergency-response system enabling offline, privacy-first AI assistance for victims and 911 operators. Built on a custom nagents framework and Ollama.',
    language: 'Python',
    stargazers_count: 3,
    html_url: 'https://github.com/one-minute-gemma/one-minute-agent',
    homepage: null,
    topics: ['agents', 'emergency', 'ollama', 'streamlit', 'react'],
    fork: false,
    archived: false,
    updated_at: '2025-11-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'napkin-repo',
    description:
      'An open-source, Swift-based macOS scratchpad for quick, disposable notes. Minimal, fast, and distraction-free.',
    language: 'Swift',
    stargazers_count: 13,
    html_url: 'https://github.com/ramcav/napkin-repo',
    homepage: null,
    topics: ['macos', 'swiftui', 'productivity', 'open-source'],
    fork: false,
    archived: false,
    updated_at: '2025-10-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'algo-visualizer',
    description:
      'C++ library implementing a generic sorting algorithm visualizer (including the STL sort) with an interface for visualizing existing algorithms. Built with CMake, documented with Doxygen.',
    language: 'C++',
    stargazers_count: 0,
    html_url: 'https://github.com/ramcav/algo-visualizer',
    homepage: null,
    topics: ['algorithms', 'visualization', 'cpp', 'cmake', 'doxygen'],
    fork: false,
    archived: false,
    updated_at: '2025-06-01T00:00:00Z',
  },
  {
    id: 4,
    name: 'planwise',
    description:
      'Recommendation system for organizing city plans and routes by user preferences. 5 approaches: autoencoder, SVD, transfer learning, embeddings, and ensemble recommender.',
    language: 'Python',
    stargazers_count: 0,
    html_url: 'https://github.com/ramcav/planwise',
    homepage: null,
    topics: ['recommendation-systems', 'machine-learning', 'embeddings', 'svd'],
    fork: false,
    archived: false,
    updated_at: '2025-09-01T00:00:00Z',
  },
  {
    id: 5,
    name: 'theHouse App',
    description:
      'iOS social platform for nightlife — connecting 300+ users and 30+ clubs in Madrid. Built with SwiftUI & Firebase. 500+ downloads.',
    language: 'Swift',
    stargazers_count: 0,
    html_url: 'https://apps.apple.com/us/app/thehouse-your-best-night/id6478066393',
    homepage: null,
    topics: ['ios', 'swiftui', 'firebase', 'startup', 'nightlife'],
    fork: false,
    archived: false,
    updated_at: '2025-08-01T00:00:00Z',
  },
  {
    id: 6,
    name: 'Dash',
    description:
      'Ticket Marketplace & CRM platform for nightlife venues. Full-stack: Django backend, React frontend, PostgreSQL, Docker, NGINX.',
    language: 'Python',
    stargazers_count: 0,
    html_url: 'https://www.instagram.com/dash_tickets/',
    homepage: null,
    topics: ['django', 'react', 'postgresql', 'docker', 'payments', 'crm'],
    fork: false,
    archived: false,
    updated_at: '2025-07-01T00:00:00Z',
  },
  {
    id: 7,
    name: 'C_Whale',
    description:
      'DSL for Dockerfile management, image and container deployment.',
    language: 'C',
    stargazers_count: 0,
    html_url: 'https://github.com/ramcav/C_whale',
    homepage: null,
    topics: ['C', 'dockerfile', 'container', 'image', 'deployment'],
    fork: false,
    archived: false,
    updated_at: '2025-07-01T00:00:00Z',
  },
  {
    id: 8,
    name: 'QuadRobotParallelSim',
    description:
      'Parallel quadruped robot simulator. Optimize trajectory planning, visualize in 3D, and benchmark performance.',
    language: 'Python',
    stargazers_count: 0,
    html_url: 'https://github.com/ramcav/QuadRobotParallelSim',
    homepage: null,
    topics: ['python', 'simulation', 'robotics', 'parallel', 'optimization'],
    fork: true,
    archived: false,
    updated_at: '2025-07-01T00:00:00Z',
  },
  
];

// ─── Contribution Viz Mock Data ────────────────────────────────────
function generateCluster(
  cx: number,
  cy: number,
  n: number,
  spread: number,
  repo: string,
  color: string,
): ContributionPoint[] {
  const msgs = [
    'feat: add recommendation engine',
    'fix: handle edge case in auth flow',
    'refactor: extract agent memory module',
    'docs: update API reference',
    'perf: optimize query pipeline',
    'feat: implement Firebase sync',
    'fix: resolve Docker networking issue',
    'feat: add sorting visualization',
    'chore: upgrade dependencies',
    'feat: integrate Kafka consumer',
  ];
  return Array.from({ length: n }, (_, i) => ({
    x: cx + (Math.random() - 0.5) * spread,
    y: cy + (Math.random() - 0.5) * spread,
    label: `commit ${i + 1}`,
    repo,
    color,
    date: new Date(
      2025,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1,
    ).toISOString(),
    message: msgs[i % msgs.length],
    size: Math.random() * 8 + 2,
  }));
}

export const MOCK_VIZ_DATA: Record<string, ContributionPoint[]> = {
  pca: [
    ...generateCluster(-3, 2, 30, 2, 'one-minute', '#00e5ff'),
    ...generateCluster(4, -1, 20, 2.5, 'planwise', '#ff6b00'),
    ...generateCluster(-1, -4, 25, 1.8, 'algo-visualizer', '#a78bfa'),
    ...generateCluster(3, 4, 22, 2, 'Dash', '#34d399'),
    ...generateCluster(-4, -2, 18, 1.5, 'napkin-repo', '#f472b6'),
    ...generateCluster(1, 1, 15, 3, 'theHouse App', '#fbbf24'),
  ],
  umap: [
    ...generateCluster(-5, 3, 30, 1.2, 'one-minute', '#00e5ff'),
    ...generateCluster(5, 5, 20, 1.0, 'planwise', '#ff6b00'),
    ...generateCluster(0, -5, 25, 1.3, 'algo-visualizer', '#a78bfa'),
    ...generateCluster(-4, -3, 22, 0.9, 'Dash', '#34d399'),
    ...generateCluster(4, -2, 18, 1.1, 'napkin-repo', '#f472b6'),
    ...generateCluster(-1, 1, 15, 1.5, 'theHouse App', '#fbbf24'),
  ],
  tsne: [
    ...generateCluster(-8, 5, 30, 2, 'one-minute', '#00e5ff'),
    ...generateCluster(7, 8, 20, 1.8, 'planwise', '#ff6b00'),
    ...generateCluster(2, -8, 25, 2.2, 'algo-visualizer', '#a78bfa'),
    ...generateCluster(-6, -5, 22, 1.6, 'Dash', '#34d399'),
    ...generateCluster(8, -3, 18, 1.9, 'napkin-repo', '#f472b6'),
    ...generateCluster(-2, 0, 15, 2.5, 'theHouse App', '#fbbf24'),
  ],
};

// ─── Skills ────────────────────────────────────────────────────────
export const SKILLS: Skill[] = [
  // Languages
  { name: 'Python', category: 'Languages', level: 0.95 },
  { name: 'C++', category: 'Languages', level: 0.8 },
  { name: 'Swift', category: 'Languages', level: 0.8 },
  { name: 'Java', category: 'Languages', level: 0.75 },
  { name: 'SQL', category: 'Languages', level: 0.85 },
  { name: 'HTML/CSS', category: 'Languages', level: 0.8 },
  // Frameworks
  { name: 'Django', category: 'Frameworks', level: 0.85 },
  { name: 'FastAPI', category: 'Frameworks', level: 0.85 },
  { name: 'React', category: 'Frameworks', level: 0.8 },
  { name: 'Spring', category: 'Frameworks', level: 0.7 },
  { name: 'SwiftUI', category: 'Frameworks', level: 0.8 },
  { name: 'Streamlit', category: 'Frameworks', level: 0.75 },
  // Data & ML
  { name: 'TensorFlow', category: 'Data & ML', level: 0.8 },
  { name: 'Ollama', category: 'Data & ML', level: 0.8 },
  { name: 'Google ADK', category: 'Data & ML', level: 0.75 },
  { name: 'MLOps', category: 'Data & ML', level: 0.7 },
  { name: 'Agentic AI', category: 'Data & ML', level: 0.85 },
  // DevOps
  { name: 'Docker', category: 'DevOps', level: 0.85 },
  { name: 'GitHub CI/CD', category: 'DevOps', level: 0.8 },
  { name: 'AWS', category: 'DevOps', level: 0.7 },
  { name: 'Azure', category: 'DevOps', level: 0.65 },
  { name: 'Linux', category: 'DevOps', level: 0.8 },
  // Tools
  { name: 'Git', category: 'Tools', level: 0.95 },
  { name: 'PostgreSQL', category: 'Tools', level: 0.85 },
  { name: 'Firebase', category: 'Tools', level: 0.8 },
  { name: 'Kafka', category: 'Tools', level: 0.7 },
  { name: 'Grafana', category: 'Tools', level: 0.65 },
  { name: 'MongoDB', category: 'Tools', level: 0.7 },
  { name: 'Snowflake', category: 'Tools', level: 0.65 },
];

// ─── About ─────────────────────────────────────────────────────────
export const ABOUT_FACTS = [
  { label: 'location', value: 'Madrid, Spain' },
  { label: 'current position', value: 'AI Engineer at Supahost' },
  { label: 'university', value: 'IE University — CS & AI' },
  { label: 'gpa', value: '9.38/10 — ranked 1st' },
  { label: 'focus', value: 'backend eng & agentic AI' },
  { label: 'languages', value: 'Python, C++, Swift, Java, SQL' },
  { label: 'github', value: 'github.com/ramcav' },
];

// ─── Research ──────────────────────────────────────────────────────
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
    title: 'Systematic Review on the Extraction and Synthesis of Lunar Helium-3 for Nuclear Fusion',
    authors: 'R. Mendez Cavalieri',
    venue: 'Revista Incógnita ',
    year: 2025,
    abstract:
      'A systematic review on the extraction and synthesis of lunar helium-3 for nuclear fusion. This review provides a comprehensive overview of the current state of the art in the field, including the challenges and opportunities for future research.',
    url: 'https://revistaincognita.com.co/wp-content/uploads/2024/10/Revista-Vol-1-N%C2%B0-1.pdf#page=85/',
    tags: ['physics', 'nuclear-fusion', 'lunar-helium-3'],
  },
  {
    title: 'Actuality vs. Potentiality: The dispute between infinities from Cantor\'s set theory',
    authors: 'R. Mendez Cavalieri',
    venue: 'Revista Incognita',
    year: 2025,
    abstract:
      'Explores the distinct types of infinity established by Cantor\'s set theory and the historical disputes over their legitimacy. Uses mathematical proofs of cardinality, bijections, and null sets to demonstrate infinities of different sizes, alongside philosophical arguments around potential vs. actual infinity. Concludes that potential infinity is more intuitive and grounded in reality, yet actual infinity remains indispensable for a complete understanding of the infinite.',
    url: 'https://revistaincognita.com.co/wp-content/uploads/2024/10/VOL-0-N0.pdf#page=59',
    tags: ['set-theory', 'infinity', 'philosophy-of-mathematics'],
  },
];

export const RESEARCH_INTERESTS: ResearchInterest[] = [
  {
    title: 'Agentic Memory Systems',
    icon: '\u{1F9E0}',
    description:
      'Developing a thesis on agentic memory — how AI agents store, retrieve, and reason over accumulated experience. Designing memory architectures that enable long-horizon planning and adaptive behavior.',
    keywords: ['agent-memory', 'thesis', 'long-horizon', 'adk'],
  }
];
