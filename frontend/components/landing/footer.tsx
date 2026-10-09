import React from 'react';
import Link from 'next/link';
import { Github } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-dotted border-border/80 bg-bg py-10 font-mono text-[13px] text-dim">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-display text-lg text-text font-bold">DotMind</span>
          <span className="text-dim/60">·</span>
          <span className="text-[12px] uppercase tracking-label">VERSION 1.0.0</span>
          <span className="text-dim/60">·</span>
          <span className="text-[12px] text-ready-green">SYSTEM NORMAL</span>
        </div>

        <div className="flex items-center gap-6 text-[12px] uppercase tracking-label">
          <Link href="/overview" className="hover:text-text transition-colors">App</Link>
          <a
            href="https://github.com/sidty13/github-rag-assistant"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition-colors flex items-center gap-1.5"
          >
            <Github size={13} />
            <span>Repository</span>
          </a>
          <span className="text-dim/50">© 2026 DOTMIND</span>
        </div>
      </div>
    </footer>
  );
};
