'use client';

import React from 'react';
import Link from 'next/link';
import { useRepo } from '@/context/repo-context';
import { useUser } from '@clerk/nextjs';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { StatusDot } from '@/components/ui/status-dot';
import {
  Plus,
  Terminal,
  FolderGit2,
  ArrowUpRight,
  BookOpen,
  FileCode,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function OverviewPage() {
  const { repos, activeRepo, isLoading } = useRepo();
  const { user } = useUser();

  const totalChunks = repos.reduce((acc, r) => acc + (r.chunksCount || 0), 0);
  const totalFiles = repos.reduce((acc, r) => acc + (r.filesCount || 0), 0);

  return (
    <div className="space-y-12 animate-fadeIn max-w-5xl mx-auto py-4 sm:py-8">
      {/* 1. Spacious Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="text-[12px] font-mono uppercase tracking-label text-signal-red mb-2">
            // TELEMETRY WORKSPACE
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-text">
            {user?.firstName ? `Welcome, ${user.firstName}` : 'Overview'}
          </h1>
          <p className="font-mono text-xs text-dim mt-2">
            Multi-repository RAG assistant powered by OpenAI & FAISS vector search.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
          <Link href="/ingest">
            <Button variant="primary" size="md" className="gap-2">
              <Plus size={14} />
              <span>Ingest repository</span>
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="secondary" size="md" className="gap-2">
              <BookOpen size={14} />
              <span>Docs</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Active Repository Hero Banner (Airy & Spacious) */}
      {activeRepo ? (
        <Panel label="ACTIVE CODEBASE CONTEXT" raised={true} className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <StatusDot status={activeRepo.status} size="md" />
                <span className="font-display text-2xl sm:text-3xl font-black text-text tracking-tight">
                  {activeRepo.owner}/{activeRepo.name}
                </span>
                <span className="font-mono text-[11px] text-dim border border-border px-2 py-0.5 rounded-[2px]">
                  {activeRepo.branch || 'main'}
                </span>
              </div>

              <p className="font-mono text-xs text-dim max-w-xl leading-relaxed">
                Repository is ready for semantic question-answering. All chunks are vectorized and indexed in local cosine similarity memory.
              </p>

              <div className="flex items-center gap-6 pt-2 font-mono text-xs text-dim">
                <div>
                  <span className="text-text font-bold">{activeRepo.chunksCount}</span> Chunks
                </div>
                <div>
                  <span className="text-text font-bold">{activeRepo.filesCount}</span> Files
                </div>
                <div>
                  Status: <span className="text-ready-green font-bold">READY</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap lg:flex-col gap-3 shrink-0">
              <Link href="/chat">
                <Button variant="primary" size="md" className="w-full gap-2">
                  <Terminal size={14} />
                  <span>Start Chat</span>
                </Button>
              </Link>
              <Link href="/sources">
                <Button variant="secondary" size="md" className="w-full gap-2">
                  <FileCode size={14} />
                  <span>View Sources</span>
                </Button>
              </Link>
              {activeRepo.url && (
                <a
                  href={activeRepo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[12px] text-dim hover:text-text flex items-center justify-center gap-1.5 py-1 transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Open on GitHub</span>
                </a>
              )}
            </div>
          </div>
        </Panel>
      ) : (
        /* Empty State Hero Banner */
        <div className="border border-dashed border-border rounded-[8px] bg-panel/30 p-10 sm:p-12 text-center">
          <div className="w-14 h-14 rounded-full border border-border flex items-center justify-center text-signal-red mx-auto mb-5 bg-panel">
            <FolderGit2 size={24} />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-text mb-3">
            No Repository Connected
          </h2>
          <p className="font-mono text-xs text-dim max-w-lg mx-auto mb-8 leading-relaxed">
            Your workspace has no indexed repositories yet. Connect any GitHub repository to parse code files, generate 1536-dimensional embeddings, and chat with line-level citations.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/ingest">
              <Button variant="primary" size="lg" className="gap-2">
                <Plus size={15} />
                <span>Ingest First Repository</span>
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="secondary" size="lg" className="gap-2">
                <BookOpen size={15} />
                <span>Read Documentation</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Spacious Telemetry Metrics (3 across with generous padding) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel label="METRIC // 01" className="p-6">
          <div className="flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between text-dim text-xs font-mono uppercase tracking-label">
              <span>Repositories</span>
              <FolderGit2 size={15} className="text-dim/60" />
            </div>
            <div>
              <div className="font-display text-4xl sm:text-5xl font-black text-text tracking-tight">
                {String(repos.length).padStart(2, '0')}
              </div>
              <p className="font-mono text-[11px] text-dim mt-2">
                Connected to your personal account
              </p>
            </div>
            <Link href="/repos" className="font-mono text-[11px] text-signal-red hover:underline flex items-center gap-1 pt-2 border-t border-border">
              <span>Manage repositories</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </Panel>

        <Panel label="METRIC // 02" className="p-6">
          <div className="flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between text-dim text-xs font-mono uppercase tracking-label">
              <span>Vector Chunks</span>
              <Layers size={15} className="text-dim/60" />
            </div>
            <div>
              <div className="font-display text-4xl sm:text-5xl font-black text-text tracking-tight">
                {totalChunks.toLocaleString()}
              </div>
              <p className="font-mono text-[11px] text-dim mt-2">
                {totalFiles} source files parsed
              </p>
            </div>
            <Link href="/sources" className="font-mono text-[11px] text-signal-red hover:underline flex items-center gap-1 pt-2 border-t border-border">
              <span>Browse code chunks</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </Panel>

        <Panel label="METRIC // 03" className="p-6">
          <div className="flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between text-dim text-xs font-mono uppercase tracking-label">
              <span>Vector Engine</span>
              <Sparkles size={15} className="text-dim/60" />
            </div>
            <div>
              <div className="font-display text-4xl sm:text-5xl font-black text-text tracking-tight">
                FAISS
              </div>
              <p className="font-mono text-[11px] text-dim mt-2">
                1536-dim text-embedding-3-small
              </p>
            </div>
            <Link href="/settings" className="font-mono text-[11px] text-signal-red hover:underline flex items-center gap-1 pt-2 border-t border-border">
              <span>View hyperparameters</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </Panel>
      </div>

      {/* 4. Spacious Quick Launch Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <Link href="/chat" className="group">
          <Panel className="p-6 h-full group-hover:border-signal-red transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-[4px] border border-border bg-panel flex items-center justify-center text-text group-hover:border-signal-red group-hover:text-signal-red transition-colors">
                <Terminal size={18} />
              </div>
              <ArrowUpRight size={16} className="text-dim group-hover:text-signal-red transition-colors" />
            </div>
            <h3 className="font-display text-lg font-bold uppercase tracking-tight text-text mb-1">
              Ask Codebase
            </h3>
            <p className="font-mono text-xs text-dim leading-relaxed">
              Query code structure, architectural patterns, and get line-accurate GitHub permalinks.
            </p>
          </Panel>
        </Link>

        <Link href="/ingest" className="group">
          <Panel className="p-6 h-full group-hover:border-signal-red transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-[4px] border border-border bg-panel flex items-center justify-center text-text group-hover:border-signal-red group-hover:text-signal-red transition-colors">
                <Plus size={18} />
              </div>
              <ArrowUpRight size={16} className="text-dim group-hover:text-signal-red transition-colors" />
            </div>
            <h3 className="font-display text-lg font-bold uppercase tracking-tight text-text mb-1">
              Ingest Repository
            </h3>
            <p className="font-mono text-xs text-dim leading-relaxed">
              Connect a new repository by GitHub URL to clone, chunk, and generate vector indices.
            </p>
          </Panel>
        </Link>

        <Link href="/docs" className="group">
          <Panel className="p-6 h-full group-hover:border-signal-red transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-[4px] border border-border bg-panel flex items-center justify-center text-text group-hover:border-signal-red group-hover:text-signal-red transition-colors">
                <BookOpen size={18} />
              </div>
              <ArrowUpRight size={16} className="text-dim group-hover:text-signal-red transition-colors" />
            </div>
            <h3 className="font-display text-lg font-bold uppercase tracking-tight text-text mb-1">
              System Documentation
            </h3>
            <p className="font-mono text-xs text-dim leading-relaxed">
              Learn how AST chunking, RAG retrieval, Clerk authentication, and Render deployment operate.
            </p>
          </Panel>
        </Link>
      </div>
    </div>
  );
}
