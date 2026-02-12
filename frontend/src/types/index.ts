export interface Project {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  homepage: string | null;
  topics: string[];
  fork: boolean;
  archived: boolean;
  updated_at: string;
}

export interface ContributionPoint {
  x: number;
  y: number;
  label: string;
  repo: string;
  color: string;
  date?: string;
  message?: string;
  size?: number;
}

export interface ContributionVizResponse {
  method: 'pca' | 'umap' | 'tsne';
  points: ContributionPoint[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export interface Skill {
  name: string;
  category: SkillCategory;
  level: number; // 0-1
}

export type SkillCategory =
  | 'Languages'
  | 'Frameworks'
  | 'Data & ML'
  | 'DevOps'
  | 'Tools';

export type VizMethod = 'pca' | 'umap' | 'tsne';
