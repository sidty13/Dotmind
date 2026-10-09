'use client';

import React, { useState } from 'react';
import { Check, Copy, FileCode } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filePath?: string;
  highlightLines?: number[];
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'python',
  filePath,
  highlightLines = [],
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const lines = code.trim().split('\n');

  return (
    <div className={`border border-border bg-panel rounded-[6px] overflow-hidden my-3 ${className}`}>
      {filePath && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-raised text-[12px] font-mono text-dim select-none">
          <div className="flex items-center gap-1.5 truncate">
            <FileCode size={13} className="text-signal-red" />
            <span className="text-text font-medium truncate">{filePath}</span>
            <span className="text-dim/60 ml-1 text-[11px]">({language})</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[3px] border border-border hover:border-dim text-[11px] hover:text-text transition-colors"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check size={11} className="text-ready-green" />
                <span className="text-ready-green">COPIED</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span>COPY</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="p-3 font-mono text-[13px] leading-relaxed overflow-x-auto text-text/90">
        <pre className="m-0">
          <code>
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const isHighlighted = highlightLines.includes(lineNum);
              return (
                <div
                  key={idx}
                  className={`flex ${
                    isHighlighted ? 'bg-signal-red/10 -mx-3 px-3 border-l-2 border-signal-red' : ''
                  }`}
                >
                  <span className="w-8 shrink-0 select-none text-dim/50 text-[11px] text-right pr-3 font-mono">
                    {lineNum}
                  </span>
                  <span className="whitespace-pre flex-1">{line}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
};
