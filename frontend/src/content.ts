import type { Line } from './face/voice';
import introLines from './intro.json';

// Everything on the page lives here. Items marked TODO are placeholders to confirm.

export const bio = {
  name: 'Ricardo Méndez Cavalieri',
  handle: 'ramcav',
  hook: 'I build AI agents, and the systems that keep them in check.',
};

// The intro paragraph: plain strings, and links (which light up when the face mentions them).
export type Segment = string | { id: string; text: string; href: string };
export const about: Segment[] = [
  "I'm a founding engineer at ",
  { id: 'supahost', text: 'Supahost', href: 'https://supahost.ai' },
  ", where I build the AI agents behind thousands of guest stays every month, including a voice agent I built from scratch. I'm also building ",
  { id: 'merkl', text: 'Merkl', href: 'https://merkl.ai' },
  ' so agents can move money safely. My team won the ',
  { id: 'vortex', text: 'voice-agent track at HackSpain 2026', href: 'https://github.com/jferreiros/vortex' },
  ", and I graduated Best Student of my class in CS & AI at IE University. Before that, I founded a startup: a nightlife social app that partnered with some of Madrid's top clubs, and a ticket marketplace that sold out a night at one of Colombia's biggest venues.",
];

export interface Item {
  id: string;
  title: string;
  description: string;
  href?: string;
  tag?: string;
}


export const work: Item[] = [
  { id: 'supahost', title: 'Supahost', description: 'Voice and text agents handling thousands of guest stays every month.', tag: 'Now' },
  { id: 'ie', title: 'IE University', description: 'CS & AI. Best Student of the 2026 class.', tag: '2026' },
  { id: 'wise', title: 'Wise', description: 'Backend intern in Tallinn. Remediated 3M verified ID records.', tag: '2025' },
  { id: 'thehouse', title: 'theHouse & Dash', description: 'Founder. A nightlife social app with 500+ downloads, then a ticket marketplace that sold out a night in Colombia.', tag: '2023–25' },
];

export const projects: Item[] = [
  { id: 'merkl', title: 'Merkl', description: 'Lets AI agents move money safely: a second signer checks every transaction against your rules.', href: 'https://merkl.ai' },
  { id: 'engram', title: 'ENGRAM', description: 'My thesis: long-term memory for LLM agents, evaluated on LoCoMo.', href: 'https://github.com/ramcav/engram' },
  { id: 'vortex', title: 'Vortex', description: 'Won the voice-agent track at HackSpain 2026. A clinic phone agent in five languages.', href: 'https://github.com/jferreiros/vortex' },
  { id: 'hoff', title: 'Hoff', description: 'YC hackathon. Browser agents that turn any SaaS into a guided onboarding tour.', href: 'https://github.com/hoff-onboard' },
  { id: 'napkin', title: 'napkin', description: 'A tiny macOS scratchpad for disposable notes.', href: 'https://github.com/ramcav/napkin' },
];

export const links: Item[] = [
  { id: 'github', title: 'GitHub', description: '', href: 'https://github.com/ramcav' },
  { id: 'x', title: 'X', description: '', href: 'https://x.com/rixonardo' },
  { id: 'linkedin', title: 'LinkedIn', description: '', href: 'https://www.linkedin.com/in/ricardomendezcavalieri/' },
  { id: 'email', title: 'Email', description: '', href: 'mailto:ramcavalieri@gmail.com' },
  { id: 'cv', title: 'CV', description: '', href: 'https://drive.google.com/file/d/1ctCzs00uKI4_uG9fhqxwPZtxdXmjqRCT/view' },
  { id: 'source', title: 'Source', description: '', href: 'https://github.com/ramcav/me' },
];

// The face is modelled on an NFT Ricardo owns.
export const nft = {
  name: 'Bricktopian #3899',
  collection: 'Bricktopians by Law Degree',
  href: 'https://opensea.io/item/ethereum/0x9eeeaf684e228c2d5c89435e010acc02c41dc86b/3899',
  fact: "Meet Bricktopian #3899, one of my worst investments so far! It's an NFT from the Bricktopians collection, which I purchased in 2021. I gave it a voice and now you can speak with it :)",
};

// What the face says when clicked. Lines live in intro.json so `npm run voice` can turn them into audio.
export const intro: Line[] = introLines;
