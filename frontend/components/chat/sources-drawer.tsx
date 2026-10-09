'use client';

import React, { useState } from 'react';
import { Citation } from '@/lib/types';
import { ExternalLink, Copy, Check, ChevronRight, FileCode, Layers } from 'lucide-react';

interface SourcesDrawerProps {
  citations: Citation[];
  isOpen: boolean;
  onToggle: () => void;
  highlightedCitationId?: number | null;
}

export const SourcesDrawer: React.FC<SourcesDrawerProps> = ({
  citations,
  isOpen,
  onToggle,
  highlightedCitationId,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  if (!isOpen) return null;

  return (
    <aside className="w-[360px] shrink-0 border-l border-border bg-panel flex flex-col h-full font-mono text-[13px] select-none">
      {/* Drawer Header */}
      <div className="h-12 border-b border-border bg-raised px-4 flex items-center justify-between text-dim">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-signal-red" />
          <span className="font-bold uppercase tracking-label text-text">
            SOURCES · {citations.length}
          </span>
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded-[3px] border border-border hover:border-dim text-dim hover:text-text transition-colors"
          title="Close drawer"
        >
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {citations.length === 0 ? (
          <div className="p-8 text-center text-dim text-[12px] space-y-2">
            <FileCode size={24} className="mx-auto text-dim/40 mb-2" />
            <p>Sources appear here after you ask a question.</p>
          </div>
        ) : (
          citations.map((c) => {
            const isHighlighted = highlightedCitationId === c.id;

            return (
              <div
                key={c.id}
                id={`source-${c.id}`}
                className={`border rounded-[4px] bg-raised p-3 space-y-2.5 transition-all duration-200 ${
                  isHighlighted
                    ? 'border-signal-red shadow-[0_0_12px_rgba(215,25,33,0.3)] bg-signal-red/5'
                    : 'border-border hover:border-dim'
                }`}
              >
                {/* Source card title & line range */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-signal-red font-bold text-[12px]">[{c.id}]</span>
                    <span className="text-text font-semibold text-[12px] truncate" title={c.filePath}>
                      {c.filePath}
                    </span>
                  </div>
                  <span className="text-dim text-[11px] shrink-0 font-medium">
                    L{c.startLine}–{c.endLine}
                  </span>
                </div>

                {/* Similarity as 5-dot score plus number */}
                <div className="flex items-center justify-between text-[11px] text-dim border-b border-border/60 pb-1.5">
                  <span>SIMILARITY:</span>
                  <div className="flex items-center gap-2">
                    {/* 5-dot meter */}
                    <div className="flex items-center gap-1" title={`Score: ${c.similarity}`}>
                      {[1, 2, 3, 4, 5].map((dot) => {
                        const filled = c.similarity >= dot * 0.18;
                        return (
                          <span
                            key={dot}
                            className={`w-1.5 h-1.5 rounded-full ${
                              filled ? 'bg-signal-red' : 'bg-border'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="font-bold text-text">{c.similarity.toFixed(2)}</span>
                  </div>
                </div>

                {/* 6-line code preview */}
                <div className="bg-bg p-2 rounded-[3px] border border-border text-[11px] font-mono text-dim/90 overflow-x-auto leading-relaxed">
                  <pre className="m-0">
                    <code>{c.preview}</code>
                  </pre>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <a
                    href={c.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-dim hover:text-signal-red transition-colors"
                  >
                    <ExternalLink size={11} />
                    <span>Open on GitHub</span>
                  </a>

                  <button
                    onClick={() => handleCopy(c.id, c.preview)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] border border-border hover:border-dim text-dim hover:text-text transition-colors"
                  >
                    {copiedId === c.id ? (
                      <>
                        <Check size={10} className="text-ready-green" />
                        <span className="text-ready-green">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy size={10} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
