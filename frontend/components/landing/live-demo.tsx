'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DotLoader } from '@/components/ui/dot-loader';
import { ExternalLink, Terminal, ShieldCheck } from 'lucide-react';

export const LandingLiveDemo: React.FC = () => {
  const [typedQuestion, setTypedQuestion] = useState('');
  const [streamedAnswer, setStreamedAnswer] = useState('');
  const [isTypingQuestion, setIsTypingQuestion] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);

  const fullQuestion = '> how does routing work in starlette?';
  const fullAnswer =
    'Starlette resolves HTTP and WebSocket requests using its Route and Router tables [1]. Route parses incoming URLs with path-converters [2], while Router.__call__ evaluates the ASGI scope [3].';

  useEffect(() => {
    let qIdx = 0;
    const qInterval = setInterval(() => {
      if (qIdx < fullQuestion.length) {
        setTypedQuestion(fullQuestion.slice(0, qIdx + 1));
        qIdx++;
      } else {
        clearInterval(qInterval);
        setIsTypingQuestion(false);
        setIsStreaming(true);

        let aIdx = 0;
        const aInterval = setInterval(() => {
          if (aIdx < fullAnswer.length) {
            setStreamedAnswer(fullAnswer.slice(0, aIdx + 1));
            aIdx += 2;
          } else {
            clearInterval(aInterval);
            setIsStreaming(false);
          }
        }, 35);
      }
    }, 55);

    return () => clearInterval(qInterval);
  }, []);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="relative border border-border bg-panel rounded-[6px] overflow-hidden">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-raised select-none text-[12px] font-mono text-dim">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-signal-red" />
            <span className="w-2.5 h-2.5 rounded-full bg-border" />
            <span className="w-2.5 h-2.5 rounded-full bg-border" />
            <span className="text-text font-medium ml-2">[ REPO: ENCODE/STARLETTE · 612 CHUNKS ]</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-label">
            <span className="text-ready-green">● SIMULATED SESSION</span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-6 font-mono text-[14px] sm:text-[15px] space-y-4 min-h-[220px]">
          {/* User query */}
          <div className="flex items-start gap-2 text-text font-semibold">
            <span>{typedQuestion}</span>
            {isTypingQuestion && (
              <span className="w-2 h-4 bg-signal-red inline-block animate-blink shrink-0" />
            )}
          </div>

          {/* Loader before streaming starts */}
          {!isTypingQuestion && streamedAnswer.length === 0 && (
            <div className="flex items-center gap-3 py-2 text-dim text-[13px]">
              <DotLoader size="sm" />
              <span>Querying FAISS vector index (top-5 nearest neighbours)...</span>
            </div>
          )}

          {/* Streamed Assistant Answer */}
          {streamedAnswer.length > 0 && (
            <div className="pt-2 text-text/90 leading-relaxed space-y-3">
              <div className="flex items-center gap-2 text-dim text-[12px] uppercase tracking-label">
                <span className="text-white">◉</span>
                <span>DOTMIND AI · RETRIEVAL CONFIDENCE: 0.88</span>
              </div>

              <p className="whitespace-pre-line">
                {streamedAnswer}
                {isStreaming && (
                  <span className="w-2 h-4 bg-signal-red inline-block animate-blink ml-1" />
                )}
              </p>

              {/* Clickable Citation Pills */}
              <div className="pt-2 flex items-center gap-2 flex-wrap text-[12px]">
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] border border-border bg-raised hover:border-signal-red hover:text-signal-red transition-colors text-dim font-mono"
                >
                  <span className="text-signal-red font-bold">[1]</span>
                  <span>routing.py:142-190</span>
                  <ExternalLink size={11} />
                </Link>

                <Link
                  href="/chat"
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] border border-border bg-raised hover:border-signal-red hover:text-signal-red transition-colors text-dim font-mono"
                >
                  <span className="text-signal-red font-bold">[2]</span>
                  <span>applications.py:45-82</span>
                  <ExternalLink size={11} />
                </Link>

                <Link
                  href="/chat"
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] border border-border bg-raised hover:border-signal-red hover:text-signal-red transition-colors text-dim font-mono"
                >
                  <span className="text-signal-red font-bold">[3]</span>
                  <span>routing.py:68-110</span>
                  <ExternalLink size={11} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
