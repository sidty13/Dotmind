import React from 'react';

const TECHS = [
  'FAISS CPU FLAT_IP',
  'OPENAI TEXT-EMBEDDING-3-SMALL',
  'FASTAPI ASYNC ENGINE',
  'NEXT.JS APP ROUTER',
  'SQLMODEL + SQLITE',
  'CLERK AUTHENTICATION',
];

export const LandingTechStrip: React.FC = () => {
  return (
    <div className="border-y border-border/80 bg-panel/50 py-4 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-[12px] font-mono tracking-label text-dim">
        <span className="text-signal-red uppercase font-bold">// STACK CORE:</span>
        {TECHS.map((tech, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-border" />
            <span className="hover:text-text transition-colors select-none">{tech}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
