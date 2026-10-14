'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRepo } from '@/context/repo-context';
import { Button } from '@/components/ui/button';
import {
  FileCode,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  GitBranch,
} from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { API_BASE_URL } from '@/lib/api';

type Citation = {
  filePath: string;
  startLine: number;
  endLine: number;
  query: string;
  score: number;
  matchedReason?: string;
};

type HistoryItem = {
  id: number;
  question: string;
  answer: string;
  createdAt: string;
};

// The DB returns naive UTC timestamps; make sure JS reads them as UTC.
const formatWhen = (iso: string) => {
  const safe = /Z|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`;
  return new Date(safe).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function SourcesPage() {
  const { activeRepo } = useRepo();
  const { getToken, isSignedIn } = useAuth();

  const [citations, setCitations] = useState<Citation[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeCitationIdx, setActiveCitationIdx] = useState(0);
  const [code, setCode] = useState('');
  const [loadingCitations, setLoadingCitations] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingCode, setLoadingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [rightTab, setRightTab] = useState<'retrieved' | 'history'>('retrieved');
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

  // Used when jumping from a history item to a specific citation in another file
  const pendingIdxRef = useRef<number | null>(null);

  const rawBranch = activeRepo?.branch;
  const branch =
    rawBranch && rawBranch !== 'default' && rawBranch !== 'string' ? rawBranch : 'main';

  // 1. Load citations + history whenever the active repo changes
  useEffect(() => {
    setCitations([]);
    setHistory([]);
    setSelectedFile(null);
    setCode('');
    setError(null);
    setExpandedHistoryId(null);
    if (!activeRepo) return;

    const controller = new AbortController();
    setLoadingCitations(true);
    setLoadingHistory(true);

    (async () => {
      const headers: Record<string, string> = {};
      if (isSignedIn) {
        const token = await getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
      const base = `${API_BASE_URL}/repos/${encodeURIComponent(activeRepo.id)}`;

      // Citations
      try {
        const r = await fetch(`${base}/citations`, { headers, signal: controller.signal });
        if (!r.ok) throw new Error(`Failed to load citations (HTTP ${r.status})`);
        const data: Citation[] = await r.json();
        setCitations(data);
        if (data.length) setSelectedFile(data[0].filePath);
      } catch (e: any) {
        if (e.name !== 'AbortError') setError(e.message);
      } finally {
        if (!controller.signal.aborted) setLoadingCitations(false);
      }

      // History
      try {
        const r = await fetch(`${base}/history?limit=50`, { headers, signal: controller.signal });
        if (r.ok) setHistory(await r.json());
      } catch {
        // History is optional on this page; ignore failures
      } finally {
        if (!controller.signal.aborted) setLoadingHistory(false);
      }
    })();

    return () => controller.abort();
  }, [activeRepo?.id, isSignedIn]);

  // 2. Cited files list (unique, with hit counts)
  const citedFiles = useMemo(() => {
    const map = new Map<string, number>();
    citations.forEach((c) => map.set(c.filePath, (map.get(c.filePath) || 0) + 1));
    return Array.from(map, ([path, count]) => ({ path, count }));
  }, [citations]);

  // 3. Citations for the selected file
  const fileCitations = useMemo(
    () => citations.filter((c) => c.filePath === selectedFile),
    [citations, selectedFile]
  );
  const activeCitation = fileCitations[activeCitationIdx] ?? fileCitations[0];

  useEffect(() => {
    setActiveCitationIdx(pendingIdxRef.current ?? 0);
    pendingIdxRef.current = null;
  }, [selectedFile]);

  // 4. Load file contents for the selected file
  useEffect(() => {
    if (!activeRepo || !selectedFile) return;
    const controller = new AbortController();
    setLoadingCode(true);
    setCode('');

    // Works for public repos. For private repos, proxy this through your backend.
    const rawUrl = `https://raw.githubusercontent.com/${activeRepo.owner}/${activeRepo.name}/${branch}/${selectedFile}`;
    fetch(rawUrl, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Could not load file');
        return r.text();
      })
      .then(setCode)
      .catch((e) => {
        if (e.name !== 'AbortError') setCode(`// ${e.message}`);
      })
      .finally(() => setLoadingCode(false));

    return () => controller.abort();
  }, [activeRepo?.id, selectedFile, branch]);

  const codeLines = code ? code.replace(/\n$/, '').split('\n') : [];
  const inCitedRange = (n: number) =>
    fileCitations.some((c) => n >= c.startLine && n <= c.endLine);

  const githubUrl =
    activeRepo && selectedFile && activeCitation
      ? `https://github.com/${activeRepo.owner}/${activeRepo.name}/blob/${branch}/${selectedFile}#L${activeCitation.startLine}-L${activeCitation.endLine}`
      : null;

  const handleCopyLink = () => {
    if (!githubUrl) return;
    navigator.clipboard.writeText(githubUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Jump from a past question to the first code passage it retrieved
  const jumpToQuery = (question: string) => {
    const target = citations.find((c) => c.query === question);
    if (!target) return;

    const idxInFile = citations
      .filter((c) => c.filePath === target.filePath)
      .findIndex((c) => c === target);

    if (target.filePath === selectedFile) {
      setActiveCitationIdx(Math.max(idxInFile, 0));
    } else {
      pendingIdxRef.current = Math.max(idxInFile, 0);
      setSelectedFile(target.filePath);
    }
    setRightTab('retrieved');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] border border-border rounded-[6px] overflow-hidden bg-bg font-mono animate-fadeIn">
      {/* Header */}
      <div className="h-12 border-b border-border bg-panel px-4 flex items-center justify-between text-xs select-none shrink-0">
        <div className="flex items-center gap-2 text-dim truncate">
          <span className="text-text font-bold">
            {activeRepo ? `${activeRepo.owner}/${activeRepo.name}` : 'No repo selected'}
          </span>
          {activeRepo && (
            <>
              <ChevronRight size={12} className="text-dim/50" />
              <span className="flex items-center gap-1 text-dim">
                <GitBranch size={12} />
                <span>{branch}</span>
              </span>
            </>
          )}
          {selectedFile && (
            <>
              <ChevronRight size={12} className="text-dim/50" />
              <span className="text-signal-red font-semibold truncate">{selectedFile}</span>
            </>
          )}
          {activeCitation && (
            <span className="text-[11px] text-dim/60 ml-2">
              (Cited: L{activeCitation.startLine}–{activeCitation.endLine})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            disabled={!githubUrl}
            className="gap-1.5"
          >
            {copied ? <Check size={11} className="text-ready-green" /> : <Copy size={11} />}
            <span>{copied ? 'Copied Link' : 'Copy permalink'}</span>
          </Button>

          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="sm" className="gap-1.5">
                <ExternalLink size={11} />
                <span>Open on GitHub</span>
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex min-h-0 divide-x divide-border">
        {/* Left: cited files */}
        <div className="w-60 bg-panel flex flex-col shrink-0 select-none">
          <div className="p-3 border-b border-border text-[11px] font-bold uppercase tracking-label text-dim">
            FILESYSTEM // CITED FILES
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-[12px]">
            {loadingCitations && <p className="p-2 text-dim">Loading…</p>}
            {error && <p className="p-2 text-signal-red">{error}</p>}
            {!loadingCitations && !error && activeRepo && citedFiles.length === 0 && (
              <p className="p-2 text-dim">No cited files yet. Ask a question about this repo first.</p>
            )}
            {citedFiles.map(({ path, count }) => {
              const isSelected = selectedFile === path;
              return (
                <button
                  key={path}
                  onClick={() => setSelectedFile(path)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[3px] text-left transition-colors ${
                    isSelected
                      ? 'bg-raised text-signal-red font-bold'
                      : 'text-dim hover:text-text hover:bg-raised/50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode size={13} className="text-dim shrink-0" />
                    <span className="truncate">{path}</span>
                  </div>
                  <span className="text-[10px] text-signal-red shrink-0" title="Times cited">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: code viewer */}
        <div className="flex-1 bg-bg overflow-y-auto p-4 text-[13px] leading-relaxed text-text/90">
          {!activeRepo && <p className="text-dim">Select a repository to view its sources.</p>}
          {loadingCode && <p className="text-dim">Loading file…</p>}
          <pre className="m-0 font-mono">
            <code>
              {codeLines.map((line, idx) => {
                const lineNum = idx + 1;
                const isCited = inCitedRange(lineNum);
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

        {/* Right: retrieved because / history */}
        <div className="w-72 bg-panel flex flex-col shrink-0 select-none">
          <div className="flex border-b border-border text-[11px] font-bold uppercase tracking-label">
            <button
              onClick={() => setRightTab('retrieved')}
              className={`flex-1 p-3 transition-colors ${
                rightTab === 'retrieved' ? 'text-signal-red bg-raised' : 'text-dim hover:text-text'
              }`}
            >
              RETRIEVED
            </button>
            <button
              onClick={() => setRightTab('history')}
              className={`flex-1 p-3 transition-colors ${
                rightTab === 'history' ? 'text-signal-red bg-raised' : 'text-dim hover:text-text'
              }`}
            >
              HISTORY ({history.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-[12px]">
            {rightTab === 'retrieved' ? (
              fileCitations.length === 0 ? (
                <p className="text-dim text-[11px] leading-relaxed">
                  No queries retrieved this file yet.
                </p>
              ) : (
                <>
                  <p className="text-dim text-[11px] leading-relaxed">
                    This code passage was selected by vector similarity for the following questions:
                  </p>
                  {fileCitations.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveCitationIdx(i)}
                      className={`w-full text-left p-3 rounded-[4px] border bg-raised space-y-2 ${
                        i === activeCitationIdx ? 'border-signal-red' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-dim">
                        <span className="text-signal-red font-bold">QUERY #{i + 1}</span>
                        <span>SCORE: {c.score.toFixed(2)}</span>
                      </div>
                      <div className="text-text font-semibold">&quot;{c.query}&quot;</div>
                      <div className="text-[10px] text-dim">
                        L{c.startLine}–{c.endLine}
                        {c.matchedReason ? ` · ${c.matchedReason}` : ''}
                      </div>
                    </button>
                  ))}
                </>
              )
            ) : loadingHistory ? (
              <p className="text-dim text-[11px]">Loading…</p>
            ) : history.length === 0 ? (
              <p className="text-dim text-[11px] leading-relaxed">
                No questions asked on this repo yet.
              </p>
            ) : (
              history.map((h) => {
                const isOpen = expandedHistoryId === h.id;
                const hasSources = citations.some((c) => c.query === h.question);
                return (
                  <div
                    key={h.id}
                    className={`p-3 rounded-[4px] border bg-raised space-y-2 ${
                      isOpen ? 'border-signal-red' : 'border-border'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedHistoryId(isOpen ? null : h.id)}
                      className="w-full text-left space-y-1"
                    >
                      <div className="text-[10px] text-dim">{formatWhen(h.createdAt)}</div>
                      <div className="text-text font-semibold">&quot;{h.question}&quot;</div>
                    </button>

                    {isOpen && (
                      <div className="space-y-2">
                        {h.answer ? (
                          <p className="text-[11px] text-dim leading-relaxed whitespace-pre-wrap break-words max-h-48 overflow-y-auto select-text">
                            {h.answer}
                          </p>
                        ) : (
                          <p className="text-[11px] text-dim">No answer saved.</p>
                        )}
                        {hasSources && (
                          <button
                            onClick={() => jumpToQuery(h.question)}
                            className="text-[11px] text-signal-red hover:underline"
                          >
                            View retrieved code →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}