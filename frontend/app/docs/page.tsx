'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import {
  BookOpen,
  Terminal,
  Layers,
  Database,
  Cpu,
  Shield,
  Cloud,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Code,
  CheckCircle2,
} from 'lucide-react';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'System Overview', icon: BookOpen },
    { id: 'architecture', title: 'Architecture', icon: Layers },
    { id: 'ingestion', title: 'Ingestion & Chunking', icon: Cpu },
    { id: 'retrieval', title: 'Vector Search & Citations', icon: Database },
    { id: 'streaming', title: 'SSE Streaming Chat', icon: Terminal },
    { id: 'auth', title: 'Clerk Authentication', icon: Shield },
    { id: 'deployment', title: 'Deployment (Render & Vercel)', icon: Cloud },
    { id: 'api', title: 'API Reference', icon: Code },
  ];

  return (
    <div className="min-h-screen bg-bg text-text dotted-grid selection:bg-signal-red selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-panel/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-5 h-5 rounded-full border border-signal-red flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-red" />
              </div>
              <span className="font-display text-xl font-bold text-text">
                DotMind
              </span>
            </Link>
            <span className="text-dim/50 font-mono text-sm">/</span>
            <span className="font-mono text-xs uppercase tracking-label text-signal-red font-semibold">
              DOCS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/overview">
              <Button variant="primary" size="sm" className="gap-2 font-mono text-xs">
                <Terminal size={13} />
                <span>Open Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Documentation Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col lg:flex-row gap-10">
        {/* Left Sidebar Table of Contents */}
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-24 space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-label text-dim px-3 py-2">
              DOCUMENTATION INDEX
            </div>
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id);
                    document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[4px] font-mono text-xs text-left transition-colors ${
                    isActive
                      ? 'bg-raised text-signal-red border border-border font-bold'
                      : 'text-dim hover:text-text hover:bg-panel'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-signal-red' : 'text-dim'} />
                  <span>{sec.title}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 max-w-4xl space-y-16 pb-24">
          {/* 1. System Overview */}
          <section id="overview" className="space-y-4">
            <div className="text-[12px] font-mono uppercase tracking-label text-signal-red">
              // SECTION 01
            </div>
            <h1 className="font-display text-4xl font-black uppercase tracking-tight text-text">
              System Overview
            </h1>
            <p className="font-mono text-xs sm:text-sm text-dim leading-relaxed">
              DotMind is an asynchronous developer intelligence engine and RAG (Retrieval-Augmented Generation) assistant.
              It allows developers to index any GitHub repository into isolated FAISS vector stores, semantically query the codebase,
              and receive real-time streaming answers complete with line-accurate GitHub source citations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <Panel label="CORE VALUE // 01" className="p-4">
                <h4 className="font-display text-sm font-bold uppercase tracking-tight text-text mb-1">
                  Line-Level Citations
                </h4>
                <p className="font-mono text-[11px] text-dim">
                  Every response includes clickable permalinks with exact start and end line ranges on GitHub.
                </p>
              </Panel>
              <Panel label="CORE VALUE // 02" className="p-4">
                <h4 className="font-display text-sm font-bold uppercase tracking-tight text-text mb-1">
                  Multi-User Isolation
                </h4>
                <p className="font-mono text-[11px] text-dim">
                  Authenticated via Clerk. Each user maintains their own repository registry and indexed data.
                </p>
              </Panel>
              <Panel label="CORE VALUE // 03" className="p-4">
                <h4 className="font-display text-sm font-bold uppercase tracking-tight text-text mb-1">
                  Token Streaming
                </h4>
                <p className="font-mono text-[11px] text-dim">
                  Real-time Server-Sent Events (SSE) deliver sub-second generation directly to the terminal UI.
                </p>
              </Panel>
            </div>
          </section>

          {/* 2. Architecture */}
          <section id="architecture" className="space-y-4">
            <div className="text-[12px] font-mono uppercase tracking-label text-signal-red">
              // SECTION 02
            </div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-text">
              Architecture & Data Flow
            </h2>
            <p className="font-mono text-xs text-dim leading-relaxed">
              The architecture is decoupled into a high-performance Next.js frontend and a FastAPI ASGI backend with SQLModel persistence:
            </p>

            <Panel className="p-6">
              <div className="font-mono text-xs space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-signal-red text-white flex items-center justify-center shrink-0 text-[10px] font-bold">1</span>
                  <div>
                    <strong className="text-text">Frontend (Next.js 14 App Router):</strong>
                    <p className="text-dim mt-0.5">Renders the dot-matrix aesthetic, manages Clerk user sessions, streams SSE responses, and navigates file citations.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-raised border border-border text-text flex items-center justify-center shrink-0 text-[10px] font-bold">2</span>
                  <div>
                    <strong className="text-text">Backend (FastAPI + Uvicorn):</strong>
                    <p className="text-dim mt-0.5">Exposes async REST and streaming SSE endpoints, validates Clerk RS256 JWKS tokens, and coordinates ingestion tasks.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-raised border border-border text-text flex items-center justify-center shrink-0 text-[10px] font-bold">3</span>
                  <div>
                    <strong className="text-text">Vector Store (FAISS IndexFlatIP):</strong>
                    <p className="text-dim mt-0.5">L2-normalized cosine similarity vector database. Stores 1536-dimensional embeddings per repository in isolated files.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-raised border border-border text-text flex items-center justify-center shrink-0 text-[10px] font-bold">4</span>
                  <div>
                    <strong className="text-text">Database (SQLModel & SQLite):</strong>
                    <p className="text-dim mt-0.5">Stores user profiles and links repositories to user accounts, ensuring private and segregated workspaces.</p>
                  </div>
                </div>
              </div>
            </Panel>
          </section>

          {/* 3. Ingestion & Chunking */}
          <section id="ingestion" className="space-y-4">
            <div className="text-[12px] font-mono uppercase tracking-label text-signal-red">
              // SECTION 03
            </div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-text">
              Ingestion & Sliding-Window Chunking
            </h2>
            <p className="font-mono text-xs text-dim leading-relaxed">
              When a user submits a GitHub repository URL, the backend triggers an asynchronous pipeline:
            </p>

            <ul className="space-y-2 font-mono text-xs text-dim list-disc pl-5">
              <li><strong className="text-text">Git Cloning:</strong> Clones the target branch into an isolated temporary scratchpad.</li>
              <li><strong className="text-text">File Filtering:</strong> Parses valid source code while discarding binaries, lockfiles, node_modules, and virtual environments.</li>
              <li><strong className="text-text">Line-Aware Chunking:</strong> Divides code into 1,200-character windows with 150-character overlaps, preserving exact start and end line coordinates.</li>
              <li><strong className="text-text">Embedding Generation:</strong> Generates embeddings via OpenAI text-embedding-3-small in batches of 200 chunks.</li>
            </ul>

            <CodeBlock
              filePath="chunker.py"
              code={`# 1200-character window with 150-character sliding overlap
CHUNK_SIZE = 1200
CHUNK_OVERLAP = 150

def chunk_file(path: str, content: str) -> list[dict]:
    # Tracks start_line and end_line for exact GitHub citation links
    ...`}
            />
          </section>

          {/* 4. Retrieval & Citations */}
          <section id="retrieval" className="space-y-4">
            <div className="text-[12px] font-mono uppercase tracking-label text-signal-red">
              // SECTION 04
            </div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-text">
              Vector Search & Line Citations
            </h2>
            <p className="font-mono text-xs text-dim leading-relaxed">
              Queries are vectorized and matched against the FAISS index using cosine similarity. The top $k$ chunks are retrieved and injected into the LLM system prompt.
            </p>

            <CodeBlock
              filePath="GitHub Permalink Generation"
              code={`def build_github_url(repo_url, branch, path, start_line, end_line):
    # Formats clickable direct code citation
    return f"{repo_url}/blob/{branch}/{path}#L{start_line}-L{end_line}"`}
            />
          </section>

          {/* 5. Clerk Auth */}
          <section id="auth" className="space-y-4">
            <div className="text-[12px] font-mono uppercase tracking-label text-signal-red">
              // SECTION 05
            </div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-text">
              Clerk Authentication & User Isolation
            </h2>
            <p className="font-mono text-xs text-dim leading-relaxed">
              DotMind supports Google, GitHub, and email authentication via Clerk. Sessions are verified cryptographically via RS256 JWKS:
            </p>

            <Panel className="p-5 font-mono text-xs space-y-3">
              <div className="flex items-center gap-2 text-ready-green font-semibold">
                <CheckCircle2 size={15} />
                <span>Zero Password Storage on Server</span>
              </div>
              <p className="text-dim">
                Tokens are validated using Clerk's public JSON Web Key Set (JWKS). The user's Clerk ID is used as the tenant identifier for repository records in the SQLModel database.
              </p>
            </Panel>
          </section>

          {/* 6. Deployment */}
          <section id="deployment" className="space-y-4">
            <div className="text-[12px] font-mono uppercase tracking-label text-signal-red">
              // SECTION 06
            </div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-text">
              Deployment Guide (Render & Vercel)
            </h2>
            <p className="font-mono text-xs text-dim leading-relaxed">
              DotMind is engineered for cloud deployment with zero complex infrastructure:
            </p>

            <div className="space-y-4">
              <Panel label="BACKEND // RENDER WEB SERVICE" className="p-5">
                <p className="font-mono text-xs text-dim mb-3">
                  Deploy as a Python Web Service on Render using the provided Blueprint <code className="text-text">render.yaml</code>:
                </p>
                <CodeBlock
                  filePath="Render Service Settings"
                  code={`Runtime: Python
Build Command: pip install -r backend/requirements.txt
Start Command: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
Health Check: /health
Environment Variables:
  - OPENAI_API_KEY
  - CLERK_SECRET_KEY
  - CLERK_PUBLISHABLE_KEY`}
                />
              </Panel>

              <Panel label="FRONTEND // VERCEL DEPLOYMENT" className="p-5">
                <p className="font-mono text-xs text-dim mb-3">
                  Deploy to Vercel directly from the GitHub repository:
                </p>
                <CodeBlock
                  filePath="Vercel Project Settings"
                  code={`Root Directory: frontend
Framework Preset: Next.js
Environment Variables:
  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  - CLERK_SECRET_KEY
  - NEXT_PUBLIC_API_URL (URL of your Render backend)`}
                />
              </Panel>
            </div>
          </section>

          {/* 7. API Reference */}
          <section id="api" className="space-y-4">
            <div className="text-[12px] font-mono uppercase tracking-label text-signal-red">
              // SECTION 07
            </div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-text">
              API Reference
            </h2>
            <div className="border border-border rounded-[4px] overflow-hidden">
              <table className="w-full font-mono text-xs text-left">
                <thead className="bg-raised border-b border-border text-dim uppercase">
                  <tr>
                    <th className="p-3">Method</th>
                    <th className="p-3">Endpoint</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3 text-ready-green font-bold">GET</td>
                    <td className="p-3 text-text">/health</td>
                    <td className="p-3 text-dim">Server health and active repository status</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-signal-red font-bold">POST</td>
                    <td className="p-3 text-text">/ingest</td>
                    <td className="p-3 text-dim">Queue asynchronous ingestion for a GitHub repo</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-ready-green font-bold">GET</td>
                    <td className="p-3 text-text">/ingest/status/:id</td>
                    <td className="p-3 text-dim">Poll progress (cloning, parsing, embedding)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-ready-green font-bold">GET</td>
                    <td className="p-3 text-text">/repos</td>
                    <td className="p-3 text-dim">List indexed repos for the authenticated user</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-signal-red font-bold">POST</td>
                    <td className="p-3 text-text">/repos/switch</td>
                    <td className="p-3 text-dim">Hot-swap active repository context</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-signal-red font-bold">POST</td>
                    <td className="p-3 text-text">/chat/stream</td>
                    <td className="p-3 text-dim">SSE token stream with code citation metadata</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
