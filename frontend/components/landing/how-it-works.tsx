'use client';

import React from 'react';

const STEPS = [
  {
    num: '01',
    name: 'Clone',
    stat: 'git pull/clone',
    desc: 'Target branch is fetched into an isolated, secure filesystem workspace.',
  },
  {
    num: '02',
    name: 'Chunk',
    stat: '1,200 chars',
    desc: 'Code is split into overlapping windows while tracking exact line coordinates.',
  },
  {
    num: '03',
    name: 'Embed',
    stat: '1,536-D OpenAI',
    desc: 'Batched vectorization converts code snippets into dense semantic vectors.',
  },
  {
    num: '04',
    name: 'Index',
    stat: 'FAISS FlatIP',
    desc: 'Vectors are stored in a local, serverless cosine-similarity vector database.',
  },
  {
    num: '05',
    name: 'Chat',
    stat: 'SSE Streaming',
    desc: 'Queries retrieve top-k chunks with real-time streaming and GitHub links.',
  },
];

export const LandingHowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 border-t border-border/80">
      <div className="mb-14">
        <div className="text-[12px] font-mono uppercase tracking-label text-signal-red mb-2">
          // PIPELINE ARCHITECTURE
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight text-text">
          How it works.
        </h2>
        <p className="font-ui text-dim text-sm sm:text-base mt-2 max-w-xl">
          From a raw repository link to deep codebase comprehension in five automated steps.
        </p>
      </div>

      {/* Horizontal Steps with Metro-line connectors */}
      <div className="relative">
        {/* Horizontal Dotted Connecting Line (desktop) */}
        <div className="hidden lg:block absolute top-7 left-12 right-12 h-[2px] border-t-2 border-dotted border-border/80 z-0" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 relative z-10">
          {STEPS.map((step, idx) => (
            <div key={idx} className="flex flex-col items-start group">
              {/* Node Circle */}
              <div className="w-14 h-14 rounded-full border border-border bg-panel flex items-center justify-center mb-4 transition-all duration-300 group-hover:border-signal-red group-hover:shadow-[0_0_12px_rgba(215,25,33,0.3)]">
                <span className="font-mono text-sm font-bold text-text group-hover:text-signal-red">
                  {step.num}
                </span>
              </div>

              {/* Step info */}
              <h3 className="font-mono text-base font-bold text-text uppercase tracking-label mb-1">
                {step.name}
              </h3>
              <div className="text-[11px] font-mono text-signal-red uppercase tracking-wider mb-2">
                {step.stat}
              </div>
              <p className="font-ui text-[13px] text-dim leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
