'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { StatusDot } from '@/components/ui/status-dot';
import {
  ArrowRight,
  GitBranch,
  Terminal,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FolderTree,
  RotateCw,
} from 'lucide-react';

const DEFAULT_SKIPPED_DIRS = ['.git', 'node_modules', '__pycache__', '.venv', 'tests', 'docs', '.github'];
const DEFAULT_EXTENSIONS = ['.py', '.js', '.ts', '.jsx', '.tsx', '.cpp', '.c', '.h', '.java', '.go', '.md', '.json', '.yaml'];

export default function IngestPage() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/tiangolo/fastapi');
  const [branch, setBranch] = useState('');
  const [skippedDirs, setSkippedDirs] = useState<string[]>(DEFAULT_SKIPPED_DIRS);
  const [extensions, setExtensions] = useState<string[]>(DEFAULT_EXTENSIONS);

  // Ingestion State
  const [isIngesting, setIsIngesting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentStage, setCurrentStage] = useState<'CLONE' | 'CHUNK' | 'EMBED' | 'INDEX' | 'READY'>('CLONE');
  const [embedPercent, setEmbedPercent] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [showSkippedDetails, setShowSkippedDetails] = useState(false);

  // Toggle helpers
  const toggleDir = (dir: string) => {
    setSkippedDirs((prev) =>
      prev.includes(dir) ? prev.filter((d) => d !== dir) : [...prev, dir]
    );
  };

  const toggleExt = (ext: string) => {
    setExtensions((prev) =>
      prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext]
    );
  };

  // Mock Progress Runner
  const handleStartIngest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!repoUrl) return;

    setIsIngesting(true);
    setIsDone(false);
    setHasError(false);
    setEmbedPercent(0);
    setLogs([`[0.0s] Initializing worker workspace for ${repoUrl}...`]);
    setCurrentStage('CLONE');

    // Simulate progress
    setTimeout(() => {
      setCurrentStage('CLONE');
      setLogs((l) => [...l, `[1.2s] Cloning branch: ${branch || 'default'} (280 code files detected)`]);
    }, 1000);

    setTimeout(() => {
      setCurrentStage('CHUNK');
      setLogs((l) => [...l, `[2.5s] Running 1200-char sliding window chunker... 1,420 chunks created`]);
    }, 2400);

    setTimeout(() => {
      setCurrentStage('EMBED');
      setLogs((l) => [...l, `[3.6s] Dispatching batches to OpenAI text-embedding-3-small (1536-D)...`]);

      let p = 0;
      const interval = setInterval(() => {
        p += 15;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          setCurrentStage('INDEX');
          setLogs((l) => [
            ...l,
            `[5.1s] Building FAISS IndexFlatIP cosine similarity matrix...`,
            `[5.8s] Persisting vectors.index & chunks.pkl to storage/tiangolo_fastapi/`,
          ]);

          setTimeout(() => {
            setCurrentStage('READY');
            setIsDone(true);
            setIsIngesting(false);
            setLogs((l) => [...l, `[6.4s] Ingestion completed successfully! Workspace is ready.`]);
          }, 1200);
        }
        setEmbedPercent(p);
        if (p === 60) {
          setLogs((l) => [...l, `[4.2s] batch 7/12 · 1,400 chunks · chunk 842 → src/routing.py:120-168`]);
        }
      }, 350);
    }, 3800);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="text-[12px] font-mono uppercase tracking-label text-signal-red mb-1">
          // INGESTION ENGINE
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-text">
          Ingest repository
        </h1>
        <p className="font-ui text-dim text-sm sm:text-base mt-1">
          Connect any public repository to build dedicated vector indices with live progress telemetry.
        </p>
      </div>

      {/* Main Form */}
      <Panel label="SOURCE SPECIFICATION">
        <form onSubmit={handleStartIngest} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            {/* Terminal Input */}
            <div className="flex-1 flex items-center bg-raised border border-border focus-within:border-signal-red rounded-[6px] px-3 py-2 transition-colors font-mono text-[14px]">
              <span className="text-signal-red font-bold mr-2">{'>'}</span>
              <input
                type="text"
                value={repoUrl}
                disabled={isIngesting}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="paste a github url"
                className="w-full bg-transparent text-text placeholder:text-dim/60 focus:outline-none"
              />
              {!repoUrl && <span className="w-2 h-4 bg-signal-red animate-blink" />}
            </div>

            {/* Optional Branch Field */}
            <div className="sm:w-44 flex items-center bg-raised border border-border focus-within:border-signal-red rounded-[6px] px-3 py-2 font-mono text-[13px]">
              <GitBranch size={14} className="text-dim mr-2 shrink-0" />
              <input
                type="text"
                value={branch}
                disabled={isIngesting}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="branch (opt)"
                className="w-full bg-transparent text-text placeholder:text-dim/60 focus:outline-none text-[13px]"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isIngesting || !repoUrl}
              className="gap-2 shrink-0"
            >
              {isIngesting ? (
                <>
                  <RotateCw size={13} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Index repo</span>
                  <ArrowRight size={14} />
                </>
              )}
            </Button>
          </div>
        </form>
      </Panel>

      {/* Filter Panel */}
      <Panel label="WORKSPACE FILTERS // EXCLUSIONS">
        <div className="space-y-4 text-xs font-mono">
          {/* Skip Dirs */}
          <div>
            <div className="text-dim uppercase tracking-label mb-2 flex items-center gap-1.5">
              <span>SKIPPED DIRECTORIES (TOGGLE):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_SKIPPED_DIRS.map((dir) => (
                <Chip
                  key={dir}
                  label={dir}
                  active={skippedDirs.includes(dir)}
                  onClick={() => toggleDir(dir)}
                />
              ))}
            </div>
          </div>

          {/* Included File Extensions */}
          <div className="pt-2 border-t border-border">
            <div className="text-dim uppercase tracking-label mb-2">
              SUPPORTED CODE EXTENSIONS:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_EXTENSIONS.map((ext) => (
                <Chip
                  key={ext}
                  label={ext}
                  active={extensions.includes(ext)}
                  onClick={() => toggleExt(ext)}
                />
              ))}
            </div>
          </div>
        </div>
      </Panel>

      {/* Pipeline Progress Panel (When active or done) */}
      {(isIngesting || isDone) && (
        <Panel label="PIPELINE PROGRESS // TELEMETRY" raised={true}>
          <div className="space-y-6">
            {/* Horizontal Stepper */}
            <div className="flex items-center justify-between font-mono text-[11px] sm:text-[12px] uppercase tracking-label">
              {[
                { id: 'CLONE', label: '1. CLONE' },
                { id: 'CHUNK', label: '2. CHUNK' },
                { id: 'EMBED', label: '3. EMBED' },
                { id: 'INDEX', label: '4. INDEX' },
                { id: 'READY', label: '5. READY' },
              ].map((step, idx) => {
                const isCurrent = currentStage === step.id;
                const isPast =
                  (step.id === 'CLONE' && currentStage !== 'CLONE') ||
                  (step.id === 'CHUNK' && !['CLONE', 'CHUNK'].includes(currentStage)) ||
                  (step.id === 'EMBED' && ['INDEX', 'READY'].includes(currentStage)) ||
                  (step.id === 'INDEX' && currentStage === 'READY');

                return (
                  <div key={idx} className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        isCurrent
                          ? 'bg-signal-red animate-pulse-red'
                          : isPast
                          ? 'bg-text'
                          : 'bg-border'
                      }`}
                    />
                    <span
                      className={`${
                        isCurrent
                          ? 'text-signal-red font-bold'
                          : isPast
                          ? 'text-text'
                          : 'text-dim'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Embedding Stage Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[12px] text-dim">
                <span>
                  {currentStage === 'EMBED'
                    ? `batch 7/12 · 1,400 chunks · text-embedding-3-small`
                    : currentStage === 'READY'
                    ? `All 1,420 chunks embedded successfully`
                    : `Analyzing files & preparing vectors...`}
                </span>
                <span className="text-text font-bold">{embedPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-signal-red transition-all duration-300"
                  style={{ width: `${embedPercent}%` }}
                />
              </div>
            </div>

            {/* Live Terminal Log Tail */}
            <div className="p-3 bg-bg border border-border rounded-[4px] font-mono text-[12px] text-text/80 h-32 overflow-y-auto space-y-1">
              {logs.map((log, lIdx) => (
                <div key={lIdx} className="leading-relaxed">
                  <span className="text-signal-red font-bold mr-1.5">{'>'}</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}

      {/* Result Summary Card when Done */}
      {isDone && (
        <Panel label="SUMMARY // INGESTION COMPLETE" className="border-signal-red">
          <div className="space-y-4 font-mono text-[13px]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 border-b border-border">
              <div>
                <span className="text-dim text-[11px] block uppercase">FILES KEPT</span>
                <span className="font-display text-2xl font-bold text-text">142</span>
              </div>
              <div>
                <span className="text-dim text-[11px] block uppercase">FILES SKIPPED</span>
                <span className="font-display text-2xl font-bold text-text">31</span>
              </div>
              <div>
                <span className="text-dim text-[11px] block uppercase">TOTAL CHUNKS</span>
                <span className="font-display text-2xl font-bold text-signal-red">612</span>
              </div>
              <div>
                <span className="text-dim text-[11px] block uppercase">DURATION</span>
                <span className="font-display text-2xl font-bold text-ready-green">6.4s</span>
              </div>
            </div>

            {/* Expandable Skipped Files List */}
            <div>
              <button
                type="button"
                onClick={() => setShowSkippedDetails(!showSkippedDetails)}
                className="flex items-center gap-1.5 text-dim hover:text-text text-[12px] uppercase tracking-label transition-colors"
              >
                <span>View 31 skipped files and reasons</span>
                {showSkippedDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              {showSkippedDetails && (
                <div className="mt-2 p-3 bg-raised border border-border rounded-[4px] text-[12px] space-y-1 max-h-36 overflow-y-auto text-dim">
                  <div>· tests/test_routing.py (matched &apos;tests/&apos; filter)</div>
                  <div>· docs/index.md (matched &apos;docs/&apos; filter)</div>
                  <div>· .github/workflows/ci.yml (matched &apos;.github/&apos; filter)</div>
                  <div>· CHANGES.md (matched changelog exclusion rules)</div>
                  <div>· package-lock.json (unsupported binary/lock format)</div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <Link href="/chat">
                <Button variant="primary" size="md" className="gap-2">
                  <Terminal size={14} />
                  <span>Start chatting</span>
                </Button>
              </Link>
              <Link href="/repos">
                <Button variant="secondary" size="md" className="gap-2">
                  <FolderTree size={14} />
                  <span>View repo card</span>
                </Button>
              </Link>
            </div>
          </div>
        </Panel>
      )}

      {/* Error state simulation toggle button */}
      <div className="text-center pt-4">
        <button
          onClick={() => setHasError(!hasError)}
          className="text-[11px] font-mono text-dim/60 hover:text-dim underline"
        >
          {hasError ? 'Hide simulated error state' : 'Test simulated error state'}
        </button>

        {hasError && (
          <div className="mt-3 p-4 bg-panel border border-signal-red rounded-[6px] text-left font-mono text-[13px] space-y-2">
            <div className="flex items-center gap-2 text-signal-red font-bold">
              <AlertCircle size={15} />
              <span>Couldn&apos;t clone this repo. Is it private?</span>
            </div>
            <p className="text-dim text-[12px]">
              Git returned exit code 128: Remote repository not found or authentication credentials required.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleStartIngest()}
              className="mt-2 gap-1.5"
            >
              <span>Retry clone</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
