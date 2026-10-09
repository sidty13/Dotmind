'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Github, Terminal } from 'lucide-react';

export const LandingNav: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-bg/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Dot-matrix wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded-full border border-signal-red flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-signal-red group-hover:scale-125 transition-transform" />
          </div>
          <span className="font-display text-2xl font-black tracking-wider text-text">
            DotMind
          </span>
          <span className="text-[10px] font-mono uppercase tracking-label text-dim border border-border px-1.5 py-0.5 rounded-[2px] ml-1">
            (0)
          </span>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-6 font-mono text-[13px] uppercase tracking-label text-dim">
          <a href="#features" className="hover:text-text transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-text transition-colors">How it works</a>
          <a href="#docs" className="hover:text-text transition-colors">Docs</a>
          <a
            href="https://github.com/sidty13/github-rag-assistant"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition-colors flex items-center gap-1.5"
          >
            <Github size={14} />
            <span>GitHub</span>
          </a>
        </nav>

        {/* Launch app button */}
        <div className="flex items-center gap-3">
          <Link href="/overview">
            <Button variant="primary" size="md" className="gap-2">
              <Terminal size={14} />
              <span>Launch app</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
