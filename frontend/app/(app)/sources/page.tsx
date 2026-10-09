'use client';

import React, { useState } from 'react';
import { MOCK_FILE_TREE, MOCK_FULL_CODE, MOCK_CITATIONS } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import {
  FileCode,
  Folder,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  GitBranch,
} from 'lucide-react';

export default function SourcesPage() {
  const [selectedFile, setSelectedFile] = useState('starlette/routing.py');
  const [copied, setCopied] = useState(false);

  // Active citation chunk on line 18-35
  const citedRange = { start: 18, end: 38 };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `https://github.com/encode/starlette/blob/master/${selectedFile}#L${citedRange.start}-L${citedRange.end}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const codeLines = MOCK_FULL_CODE.trim().split('\n');

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] border border-border rounded-[6px] overflow-hidden bg-bg font-mono animate-fadeIn">
      {/* Top Header Bar */}
      <div className="h-12 border-b border-border bg-panel px-4 flex items-center justify-between text-xs select-none shrink-0">
        <div className="flex items-center gap-2 text-dim truncate">
          <span className="text-text font-bold">encode/starlette</span>
          <ChevronRight size={12} className="text-dim/50" />
          <span className="flex items-center gap-1 text-dim">
            <GitBranch size={12} />
            <span>master</span>
          </span>
          <ChevronRight size={12} className="text-dim/50" />
          <span className="text-signal-red font-semibold">{selectedFile}</span>
          <span className="text-[11px] text-dim/60 ml-2">
            (Cited: L{citedRange.start}–{citedRange.end})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleCopyLink} className="gap-1.5">
            {copied ? <Check size={11} className="text-ready-green" /> : <Copy size={11} />}
            <span>{copied ? 'Copied Link' : 'Copy permalink'}</span>
          </Button>

          <a
            href={`https://github.com/encode/starlette/blob/master/${selectedFile}#L${citedRange.start}-L${citedRange.end}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="primary" size="sm" className="gap-1.5">
              <ExternalLink size={11} />
              <span>Open on GitHub</span>
            </Button>
          </a>
        </div>
      </div>

      {/* 3-Column Body */}
      <div className="flex-1 flex min-h-0 divide-x divide-border">
        {/* Left: File Tree (240px) */}
        <div className="w-60 bg-panel flex flex-col shrink-0 select-none">
          <div className="p-3 border-b border-border text-[11px] font-bold uppercase tracking-label text-dim">
            FILESYSTEM // CITED FILES
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-[12px]">
            {MOCK_FILE_TREE.map((item, idx) => {
              const isSelected = selectedFile === item.path;

              return (
                <button
                  key={idx}
                  onClick={() => !item.isDir && setSelectedFile(item.path)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[3px] text-left transition-colors ${
                    isSelected
                      ? 'bg-raised text-signal-red font-bold'
                      : 'text-dim hover:text-text hover:bg-raised/50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {item.isDir ? (
                      <Folder size={13} className="text-dim/70 shrink-0" />
                    ) : (
                      <FileCode size={13} className="text-dim shrink-0" />
                    )}
                    <span className="truncate">{item.path}</span>
                  </div>

                  {/* Red dot indicator for cited files */}
                  {item.cited && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-signal-red shrink-0"
                      title="Cited in query answers"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Code Viewer with Line Numbers (flex-1) */}
        <div className="flex-1 bg-bg overflow-y-auto p-4 text-[13px] leading-relaxed text-text/90">
          <pre className="m-0 font-mono">
            <code>
              {codeLines.map((line, idx) => {
                const lineNum = idx + 1;
                const isCited = lineNum >= citedRange.start && lineNum <= citedRange.end;

                return (
                  <div
                    key={idx}
                    className={`flex items-start ${
                      isCited
                        ? 'bg-signal-red/10 -mx-4 px-4 border-l-2 border-signal-red text-text font-medium'
                        : ''
                    }`}
                  >
                    <span
                      className={`w-10 select-none text-[11px] text-right pr-4 font-mono shrink-0 ${
                        isCited ? 'text-signal-red font-bold' : 'text-dim/40'
                      }`}
                    >
                      {lineNum}
                    </span>
                    <span className="whitespace-pre overflow-x-auto">{line}</span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>

        {/* Right: "Retrieved because" Panel (280px) */}
        <div className="w-72 bg-panel flex flex-col shrink-0 select-none">
          <div className="p-3 border-b border-border text-[11px] font-bold uppercase tracking-label text-dim">
            RETRIEVED BECAUSE // QUERIES
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-[12px]">
            <p className="text-dim text-[11px] leading-relaxed">
              This code passage was selected by vector cosine-similarity for the following user questions:
            </p>

            <div className="p-3 rounded-[4px] border border-border bg-raised space-y-2">
              <div className="flex items-center justify-between text-[11px] text-dim">
                <span className="text-signal-red font-bold">QUERY #1</span>
                <span>SCORE: 0.88</span>
              </div>
              <div className="text-text font-semibold">
                &quot;how does routing work in starlette?&quot;
              </div>
              <div className="text-[10px] text-dim">Matched: Route class definition</div>
            </div>

            <div className="p-3 rounded-[4px] border border-border bg-raised space-y-2">
              <div className="flex items-center justify-between text-[11px] text-dim">
                <span className="text-signal-red font-bold">QUERY #2</span>
                <span>SCORE: 0.81</span>
              </div>
              <div className="text-text font-semibold">
                &quot;Where is path compile regex implemented?&quot;
              </div>
              <div className="text-[10px] text-dim">Matched: compile_path invocation</div>
            </div>

            <div className="p-3 rounded-[4px] border border-border bg-raised space-y-2">
              <div className="flex items-center justify-between text-[11px] text-dim">
                <span className="text-signal-red font-bold">QUERY #3</span>
                <span>SCORE: 0.74</span>
              </div>
              <div className="text-text font-semibold">
                &quot;Explain HTTP method dispatching&quot;
              </div>
              <div className="text-[10px] text-dim">Matched: self.methods check in Route</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
