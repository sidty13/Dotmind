'use client';

import React from 'react';
import { Panel } from '@/components/ui/panel';
import {
  FileText,
  Layers,
  Zap,
  Cpu,
  Clock,
  ExternalLink,
} from 'lucide-react';

const FEATURES = [
  {
    icon: FileText,
    label: '01 // CITATIONS',
    title: 'Line-accurate citations',
    desc: 'Every factual assertion is grounded in source files with precise line-number ranges (L142–L190).',
  },
  {
    icon: Layers,
    label: '02 // MULTI-REPO',
    title: 'Multi-repo workspace',
    desc: 'Index multiple public or private repositories. Switch active contexts in milliseconds with zero re-indexing.',
  },
  {
    icon: Zap,
    label: '03 // STREAMING',
    title: 'Streaming answers',
    desc: 'Server-Sent Events stream answers token-by-token directly to your terminal prompt with zero delay.',
  },
  {
    icon: Cpu,
    label: '04 // RETRIEVAL',
    title: 'Cosine-similarity retrieval',
    desc: 'FAISS FlatIP vector indexes run in-memory, performing sub-millisecond nearest-neighbour math on 1536-D vectors.',
  },
  {
    icon: Clock,
    label: '05 // BACKGROUND JOBS',
    title: 'Background ingestion with live progress',
    desc: 'Non-blocking async workers handle repository cloning and embedding with live stage-by-stage telemetry.',
  },
  {
    icon: ExternalLink,
    label: '06 // INTEGRATION',
    title: 'Open on GitHub in one click',
    desc: 'Click on any citation pill to jump straight to the exact commit and line of code on GitHub.',
  },
];

export const LandingFeaturesGrid: React.FC = () => {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 border-t border-border/80">
      <div className="mb-14">
        <div className="text-[12px] font-mono uppercase tracking-label text-signal-red mb-2">
          // CAPABILITIES
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight text-text">
          Engineered for developers.
        </h2>
        <p className="font-ui text-dim text-sm sm:text-base mt-2 max-w-xl">
          Zero fluff. Strictly structured code retrieval designed for engineers exploring unfamiliar systems.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Panel key={idx} label={item.label} className="h-full flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-[4px] border border-border bg-raised flex items-center justify-center mb-4 text-text">
                  <Icon size={18} className="text-signal-red" />
                </div>
                <h3 className="font-mono text-base font-bold text-text mb-2">
                  {item.title}
                </h3>
                <p className="font-ui text-[14px] text-dim leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </Panel>
          );
        })}
      </div>
    </section>
  );
};
