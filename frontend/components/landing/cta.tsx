'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const LandingCTA: React.FC = () => {
  const router = useRouter();
  const [repoInput, setRepoInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = repoInput.trim() || 'https://github.com/encode/starlette';
    router.push(`/ingest?repo=${encodeURIComponent(target)}`);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
      <div className="border border-border bg-panel rounded-[6px] p-8 sm:p-12 relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 bg-panel border border-border text-[11px] font-mono uppercase tracking-label text-signal-red">
          // IMMEDIATE DISCOVERY
        </div>

        <h2 className="font-display text-3xl sm:text-5xl font-black text-text uppercase tracking-tight mb-4">
          Index your first repo.
        </h2>
        <p className="font-ui text-dim text-sm sm:text-base max-w-lg mx-auto mb-8">
          Clone, chunk, embed, and query any public GitHub repository within 60 seconds.
        </p>

        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto flex flex-col sm:flex-row items-stretch gap-2 bg-raised border border-border focus-within:border-signal-red p-2 rounded-[6px] transition-colors"
        >
          <div className="flex-1 flex items-center px-3 font-mono text-[14px]">
            <span className="text-signal-red font-bold mr-2">{'>'}</span>
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="https://github.com/owner/repository"
              className="w-full bg-transparent text-text placeholder:text-dim/60 focus:outline-none font-mono text-[14px]"
            />
          </div>
          <Button type="submit" variant="primary" size="md" className="gap-2 shrink-0">
            <span>Index now</span>
            <ArrowRight size={14} />
          </Button>
        </form>
      </div>
    </section>
  );
};
