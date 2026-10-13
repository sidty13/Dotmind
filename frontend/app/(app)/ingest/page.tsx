'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useRepo } from '@/context/repo-context';
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
  FolderTree,
  RotateCw,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

const DEFAULT_SKIPPED_DIRS = ['.git', 'node_modules', '__pycache__', '.venv', 'tests', 'docs', '.github'];
const DEFAULT_EXTENSIONS = ['.py', '.js', '.ts', '.jsx', '.tsx', '.cpp', '.c', '.h', '.java', '.go', '.md', '.json', '.yaml'];

export default function IngestPage() {
  const { getToken, isSignedIn } = useAuth();
  const { refreshRepos, switchRepo } = useRepo();

  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('');
  const [skippedDirs, setSkippedDirs] = useState<string[]>(DEFAULT_SKIPPED_DIRS);
  const [extensions, setExtensions] = useState<string[]>(DEFAULT_EXTENSIONS);

  // Ingestion State
  const [isIngesting, setIsIngesting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStage, setCurrentStage] = useState<'CLONE' | 'CHUNK' | 'EMBED' | 'INDEX' | 'READY'>('CLONE');
  const [embedPercent, setEmbedPercent] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [ingestResult, setIngestResult] = useState<any>(null);

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

  // Real Backend Ingestion Runner
  const handleStartIngest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!repoUrl.trim()) return;

    setIsIngesting(true);
    setIsDone(false);
    setHasError(false);
    setErrorMessage('');
    setEmbedPercent(5);
    setLogs([`[0.0s] Connecting to DotMind backend worker at ${API_BASE_URL}...`]);
    setCurrentStage('CLONE');

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (isSignedIn) {
        const token = await getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/ingest`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          url: repoUrl.trim(),
          branch: branch.trim() || undefined,
          force_rebuild: false,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Ingest request failed (HTTP ${res.status})`);
      }

      const data = await res.json();
      const jobId = data.job_id;
      setLogs((l) => [...l, `[0.5s] Job accepted (${jobId}). Polling pipeline progress...`]);

      // Poll progress every 1000ms
      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${API_BASE_URL}/ingest/status/${jobId}`);
          if (!statusRes.ok) return;

          const job = await statusRes.json();

          // Stage mapping
          if (job.stage === 'cloning') {
            setCurrentStage('CLONE');
          } else if (job.stage === 'parsing') {
            setCurrentStage('CHUNK');
          } else if (job.stage === 'embedding') {
            setCurrentStage('EMBED');
          } else if (job.stage === 'saving') {
            setCurrentStage('INDEX');
          }

          if (job.progress !== undefined) {
            setEmbedPercent(job.progress);
          }

          if (job.message) {
            setLogs((prev) => {
              const lastLog = prev[prev.length - 1];
              if (!lastLog?.includes(job.message)) {
                return [...prev, `[${job.stage?.toUpperCase() || 'INFO'}] ${job.message}`];
              }
              return prev;
            });
          }

          if (job.status === 'completed') {
            clearInterval(interval);
            setCurrentStage('READY');
            setEmbedPercent(100);
            setIsDone(true);
            setIsIngesting(false);
            setIngestResult(job.result);
            setLogs((l) => [...l, `[READY] Ingestion completed successfully! Repository is active.`]);

            // Refresh user's repos and switch to the newly ingested one
            await refreshRepos();
            if (job.result?.repo_id) {
              await switchRepo(job.result.repo_id);
            }
          } else if (job.status === 'failed') {
            clearInterval(interval);
            setIsIngesting(false);
            setHasError(true);
            setErrorMessage(job.error || job.message || 'Ingestion failed on backend');
            setLogs((l) => [...l, `[ERROR] ${job.error || job.message}`]);
          }
        } catch (pollErr: any) {
          console.error('Error polling status:', pollErr);
        }
      }, 1000);
    } catch (err: any) {
      setIsIngesting(false);
      setHasError(true);
      setErrorMessage(err.message || 'Could not connect to backend.');
      setLogs((l) => [...l, `[FATAL] ${err.message}`]);
    }
  };

  const steps = [
    { name: 'CLONE', label: '1. CLONE' },
    { name: 'CHUNK', label: '2. CHUNK' },
    { name: 'EMBED', label: '3. EMBED' },
    { name: 'INDEX', label: '4. INDEX' },
    { name: 'READY', label: '5. READY' },
  ];

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
                placeholder="https://github.com/owner/repository"
                className="w-full bg-transparent text-text placeholder:text-dim/60 focus:outline-none"
              />
              {!repoUrl && <span className="w-2 h-4 bg-signal-red animate-blink" />}
            </div>

            {/* Optional Branch Field */}
            <div className="sm:w-40 flex items-center bg-raised border border-border focus-within:border-signal-red rounded-[6px] px-3 py-2 transition-colors font-mono text-[13px]">
              <GitBranch size={13} className="text-dim mr-2 shrink-0" />
              <input
                type="text"
                value={branch}
                disabled={isIngesting}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full bg-transparent text-text placeholder:text-dim/60 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isIngesting || !repoUrl.trim()}
              className="gap-2 whitespace-nowrap"
            >
              {isIngesting ? (
                <>
                  <RotateCw size={14} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Start ingest</span>
                  <ArrowRight size={14} />
                </>
              )}
            </Button>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs text-dim pt-1">
            <span>Examples:</span>
            <button
              type="button"
              disabled={isIngesting}
              onClick={() => setRepoUrl('https://github.com/octocat/Hello-World')}
              className="hover:text-text underline transition-colors"
            >
              octocat/Hello-World
            </button>
            <span>·</span>
            <button
              type="button"
              disabled={isIngesting}
              onClick={() => setRepoUrl('https://github.com/pallets/click')}
              className="hover:text-text underline transition-colors"
            >
              pallets/click
            </button>
            <span>·</span>
            <button
              type="button"
              disabled={isIngesting}
              onClick={() => setRepoUrl('https://github.com/encode/starlette')}
              className="hover:text-text underline transition-colors"
            >
              encode/starlette
            </button>
          </div>
        </form>
      </Panel>

      {/* Progress & Live Telemetry Panel */}
      {(isIngesting || isDone || hasError) && (
        <Panel label="PIPELINE EXECUTION" raised={true}>
          <div className="space-y-6">
            {/* Horizontal 5-Step Stepper */}
            <div className="grid grid-cols-5 gap-2 font-mono text-[11px]">
              {steps.map((step, idx) => {
                const stepIdx = steps.findIndex((s) => s.name === currentStage);
                const isCurrent = step.name === currentStage;
                const isPast = idx < stepIdx || isDone;

                return (
                  <div key={step.name} className="flex flex-col items-center text-center">
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center mb-1 text-[10px] font-bold transition-all ${
                        isCurrent
                          ? 'border-signal-red bg-signal-red text-white shadow-[0_0_8px_rgba(215,25,33,0.6)]'
                          : isPast
                          ? 'border-ready-green bg-ready-green/20 text-ready-green'
                          : 'border-border text-dim/60'
                      }`}
                    >
                      {isPast ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`uppercase tracking-label text-[10px] sm:text-[11px] ${
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
                    ? `Generating OpenAI text-embedding-3-small vectors...`
                    : currentStage === 'READY'
                    ? `Repository indexed and active in vector memory`
                    : `Analyzing source files & building vector indices...`}
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
            <div className="p-3 bg-bg border border-border rounded-[4px] font-mono text-[12px] text-text/80 h-36 overflow-y-auto space-y-1">
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
        <Panel label="SUMMARY // INGESTION COMPLETE" className="border-ready-green">
          <div className="space-y-4 font-mono text-[13px]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 border-b border-border">
              <div>
                <span className="text-dim text-[11px] block uppercase">FILES PARSED</span>
                <span className="font-display text-2xl font-bold text-text">
                  {ingestResult?.files_count || 'Done'}
                </span>
              </div>
              <div>
                <span className="text-dim text-[11px] block uppercase">BRANCH</span>
                <span className="font-display text-2xl font-bold text-text">
                  {ingestResult?.branch || branch || 'main'}
                </span>
              </div>
              <div>
                <span className="text-dim text-[11px] block uppercase">TOTAL CHUNKS</span>
                <span className="font-display text-2xl font-bold text-signal-red">
                  {ingestResult?.chunks_count || 'Indexed'}
                </span>
              </div>
              <div>
                <span className="text-dim text-[11px] block uppercase">STATUS</span>
                <span className="font-display text-2xl font-bold text-ready-green">READY</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <Link href="/chat">
                <Button variant="primary" size="md" className="gap-2">
                  <Terminal size={14} />
                  <span>Start chatting with this repo</span>
                </Button>
              </Link>
              <Link href="/repos">
                <Button variant="secondary" size="md" className="gap-2">
                  <FolderTree size={14} />
                  <span>View in repositories</span>
                </Button>
              </Link>
            </div>
          </div>
        </Panel>
      )}

      {/* Error state */}
      {hasError && (
        <div className="p-4 bg-panel border border-signal-red rounded-[6px] text-left font-mono text-[13px] space-y-2">
          <div className="flex items-center gap-2 text-signal-red font-bold">
            <AlertCircle size={15} />
            <span>Ingestion failed</span>
          </div>
          <p className="text-dim text-[12px]">
            {errorMessage || 'Git returned an error. Check if the repository URL is valid and public.'}
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleStartIngest()}
            className="mt-2 gap-1.5"
          >
            <span>Retry ingestion</span>
          </Button>
        </div>
      )}
    </div>
  );
}
