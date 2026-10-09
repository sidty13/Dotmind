'use client';

import React from 'react';
import Link from 'next/link';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { MOCK_ACTIVITY } from '@/lib/mock-data';
import {
  Plus,
  Terminal,
  FolderGit2,
  ArrowUpRight,
  Sparkles,
  Layers,
  Database,
  Search,
} from 'lucide-react';

export default function OverviewPage() {
  const pipelineNodes = [
    { label: 'Clone', stat: '142 files kept', active: false },
    { label: 'Chunk', stat: '612 chunks', active: false },
    { label: 'Embed', stat: '612 vectors', active: false },
    { label: 'Index', stat: '2.4 MB size', active: false },
    { label: 'Chat', stat: '18 answers today', active: true },
  ];

  const statCards = [
    {
      title: 'Repos indexed',
      value: '04',
      unit: 'ACTIVE: 1',
      sparkline: [2, 3, 3, 4, 4, 4, 4],
      href: '/repos',
    },
    {
      title: 'Total chunks',
      value: '2.8K',
      unit: '+479 TODAY',
      sparkline: [1, 2, 2, 3, 4, 4, 5],
      href: '/sources',
    },
    {
      title: 'Avg retrieval score',
      value: '0.84',
      unit: 'COSINE SIMILARITY',
      sparkline: [3, 4, 4, 4, 5, 4, 5],
      href: '/settings',
    },
    {
      title: 'Questions asked',
      value: '142',
      unit: 'AVG 18/DAY',
      sparkline: [2, 3, 2, 4, 3, 5, 4],
      href: '/chat',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[12px] font-mono uppercase tracking-label text-signal-red mb-1">
            // TELEMETRY DASHBOARD
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-text">
            Overview
          </h1>
        </div>

        {/* Quick Actions Row */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/ingest">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Plus size={13} />
              <span>Ingest repo</span>
            </Button>
          </Link>
          <Link href="/chat">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <Terminal size={13} />
              <span>Open chat</span>
            </Button>
          </Link>
          <Link href="/repos">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <FolderGit2 size={13} />
              <span>Switch repo</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Pipeline Map Hero Panel */}
      <Panel label="PIPELINE STATUS // ACTIVE ENGINE" raised={true}>
        <div className="relative py-4">
          {/* Horizontal dotted connector */}
          <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[2px] border-t-2 border-dotted border-border/80 z-0" />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 relative z-10">
            {pipelineNodes.map((node, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div
                  className={`w-12 h-12 rounded-full border flex items-center justify-center mb-3 transition-transform ${
                    node.active
                      ? 'border-signal-red bg-signal-red/20 text-signal-red shadow-[0_0_12px_rgba(215,25,33,0.5)] animate-pulse-red'
                      : 'border-border bg-panel text-text group-hover:border-dim'
                  }`}
                >
                  <span className="font-mono text-xs font-bold">{node.label}</span>
                </div>
                <span className="font-mono text-[13px] font-semibold text-text uppercase tracking-label">
                  {node.label}
                </span>
                <span className="font-mono text-[11px] text-dim mt-0.5">
                  {node.stat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Stat Cards (4 across) with Dotted Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <Link key={idx} href={stat.href} className="group">
            <Panel label={`STAT // 0${idx + 1}`} className="h-full group-hover:border-dim transition-colors">
              <div className="flex flex-col justify-between h-full pt-1">
                <div>
                  <div className="flex items-center justify-between text-dim text-[12px] font-mono uppercase tracking-label mb-2">
                    <span>{stat.title}</span>
                    <ArrowUpRight size={13} className="text-dim/50 group-hover:text-signal-red transition-colors" />
                  </div>
                  <div className="font-display text-4xl sm:text-5xl font-black text-text mb-1 tracking-tight">
                    {stat.value}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-end justify-between">
                  <span className="font-mono text-[11px] text-signal-red uppercase tracking-label">
                    {stat.unit}
                  </span>

                  {/* 7-day dotted sparkline */}
                  <div className="flex items-end gap-1 h-5 select-none" title="7-day activity">
                    {stat.sparkline.map((val, dIdx) => (
                      <div key={dIdx} className="flex flex-col gap-0.5 items-center">
                        {[5, 4, 3, 2, 1].map((dotLevel) => (
                          <span
                            key={dotLevel}
                            className={`w-1 h-1 rounded-full ${
                              val >= dotLevel ? 'bg-signal-red' : 'bg-border/60'
                            }`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>
          </Link>
        ))}
      </div>

      {/* Bottom Section: Recent Activity & Context Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity List in mono */}
        <div className="lg:col-span-2">
          <Panel label="SYSTEM LOG // RECENT ACTIVITY">
            <div className="divide-y divide-border/60 font-mono text-[13px]">
              {MOCK_ACTIVITY.map((act) => (
                <div key={act.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-dim/60 text-[11px] shrink-0">{act.time}</span>
                    <span className="text-signal-red font-bold">{'>'}</span>
                    <span className="text-text/90 truncate">{act.text}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-label px-1.5 py-0.5 rounded-[2px] border border-border text-dim shrink-0">
                    {act.type}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Active Context Card */}
        <div>
          <Panel label="ACTIVE WORKSPACE">
            <div className="space-y-4 font-mono text-[13px]">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-dim">REPOSITORY:</span>
                <span className="text-text font-bold">encode/starlette</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-dim">BRANCH:</span>
                <span className="text-text">master</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-dim">VECTOR INDEX:</span>
                <span className="text-ready-green">FAISS FLAT_IP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dim">DIMENSION:</span>
                <span className="text-text">1536-D</span>
              </div>

              <Link href="/chat" className="block pt-2">
                <Button variant="primary" size="md" className="w-full gap-2">
                  <Terminal size={14} />
                  <span>Start query session</span>
                </Button>
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
