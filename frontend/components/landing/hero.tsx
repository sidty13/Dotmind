'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';

export const LandingHero: React.FC = () => {
  const router = useRouter();
  const [repoInput, setRepoInput] = useState('');

  const handleIndex = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = repoInput.trim() || 'https://github.com/encode/starlette';
    router.push(`/ingest?repo=${encodeURIComponent(target)}`);
  };

  const handleChipClick = (repoSlug: string) => {
    setRepoInput(`https://github.com/${repoSlug}`);
  };

  return (
    <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 max-w-5xl mx-auto px-4 sm:px-6 text-center">
      {/* Top telemetry indicator */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] border border-border bg-panel text-[12px] font-mono uppercase tracking-label text-dim mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-ready-green" />
        <span>RAG ENGINE ONLINE · OPENAI 1536-D · FAISS ACCELERATED</span>
      </div>

      {/* Huge dot-matrix heading */}
      <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-text tracking-tight uppercase leading-[1.05] mb-6">
        Talk to your <br />
        <span className="text-signal-red">codebase.</span>
      </h1>

      {/* Subtext in 16px ui font */}
      <p className="font-ui text-base sm:text-lg text-dim max-w-2xl mx-auto mb-10 leading-relaxed">
        Paste a GitHub repo. Ask anything. Get answers with exact file and line citations.
      </p>

      {/* Terminal-style input */}
      <form
        onSubmit={handleIndex}
        className="max-w-2xl mx-auto bg-panel border border-border focus-within:border-signal-red rounded-[6px] p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition-colors mb-4"
      >
        <div className="flex-1 flex items-center px-3 font-mono text-[15px] gap-2">
          <span className="text-signal-red font-bold">{'>'}</span>
          <input
            type="text"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            placeholder="paste a github url"
            className="w-full bg-transparent text-text placeholder:text-dim/60 focus:outline-none font-mono text-[14px] sm:text-[15px]"
          />
          {/* Blinking red cursor */}
          {!repoInput && (
            <span className="w-2.5 h-5 bg-signal-red inline-block animate-blink -ml-2" />
          )}
        </div>

        <Button type="submit" variant="primary" size="md" className="gap-2 sm:self-center shrink-0">
          <span>Index repo</span>
          <ArrowRight size={14} />
        </Button>
      </form>

      {/* Three suggestion chips */}
      <div className="flex items-center justify-center gap-2 flex-wrap text-dim text-[12px] font-mono">
        <span className="uppercase tracking-label text-dim/70">Try demo:</span>
        <Chip
          label="encode/starlette"
          onClick={() => handleChipClick('encode/starlette')}
        />
        <Chip
          label="tiangolo/fastapi"
          onClick={() => handleChipClick('tiangolo/fastapi')}
        />
        <Chip
          label="vercel/next.js"
          onClick={() => handleChipClick('vercel/next.js')}
        />
      </div>
    </section>
  );
};
