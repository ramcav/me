import type { Line } from './face/voice';

// Everything on the page lives here. Items marked TODO are placeholders to confirm.

export const bio = {
  name: 'Ricardo Méndez Cavalieri',
  handle: 'ramcav',
  // TODO: confirm wording
  line: 'AI engineer based in Madrid. I build agents, and the tools that keep them honest.',
};

export interface Item {
  id: string;
  title: string;
  description: string;
  href?: string;
  tag?: string;
}

// TODO: confirm roles and order
export const work: Item[] = [
  { id: 'merkl', title: 'Merkl', description: 'Verifiable receipts for what AI agents do.', href: 'https://github.com/ramcav/merkl-sdk', tag: 'Now' },
  { id: 'supahost', title: 'Supahost', description: 'AI engineer.', tag: 'Before' },
];

// TODO: pick from the list of candidates
export const projects: Item[] = [
  { id: 'swagbench', title: 'SwagBench', description: 'A benchmark for how well agents integrate real APIs.' },
  { id: 'engram', title: 'ENGRAM', description: 'Episodic graph memory for agents. My thesis.', href: 'https://github.com/ramcav/engram' },
  { id: 'napkin', title: 'napkin', description: 'A tiny macOS scratchpad for disposable notes.', href: 'https://github.com/ramcav/napkin' },
  { id: 'thehouse', title: 'theHouse', description: 'iOS nightlife app. 500+ downloads, 30+ clubs in Madrid.', href: 'https://apps.apple.com/us/app/thehouse-your-best-night/id6478066393' },
];

export const links: Item[] = [
  { id: 'github', title: 'GitHub', description: '', href: 'https://github.com/ramcav' },
  { id: 'linkedin', title: 'LinkedIn', description: '', href: 'https://www.linkedin.com/in/ricardomendezcavalieri/' },
  { id: 'email', title: 'Email', description: '', href: 'mailto:ramcavalieri@gmail.com' },
  { id: 'cv', title: 'CV', description: '', href: '/cv.pdf' },
];

// What the face says when clicked, until a real model is wired in.
export const intro: Line[] = [
  { text: "Hey. I'm Ricardo. Well, a brick version of him." },
  { text: 'I build AI agents, and the infrastructure that keeps them honest.' },
  { text: "Right now that's Merkl: signed, verifiable receipts for everything an agent does.", highlight: 'merkl' },
  { text: 'Before that, SwagBench, a benchmark for how well agents handle real APIs.', highlight: 'swagbench' },
  { text: 'Scroll down for the rest. Soon, you will be able to just ask me.' },
];
