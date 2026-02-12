import { Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <p className="font-mono text-sm text-text-dim">
          <span className="text-cyan">&gt;</span> built with react, three.js &amp; curiosity
        </p>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/ramcav"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary transition-colors hover:text-cyan"
            aria-label="GitHub"
          >
            <Github size={20} />
          </a>
          <a
            href="https://www.linkedin.com/in/ricardomendezcavalieri/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary transition-colors hover:text-cyan"
            aria-label="LinkedIn"
          >
            <Linkedin size={20} />
          </a>
          <a
            href="mailto:ramcavalieri@gmail.com"
            className="text-text-secondary transition-colors hover:text-cyan"
            aria-label="Email"
          >
            <Mail size={20} />
          </a>
        </div>

        <p className="font-mono text-sm text-text-dim">
          &copy; {new Date().getFullYear()} ramcav
        </p>
      </div>
    </footer>
  );
}
