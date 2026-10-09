'use client';

import React from 'react';
import { Repository } from '@/lib/types';
import { StatusDot } from '@/components/ui/status-dot';
import { DotLoader } from '@/components/ui/dot-loader';
import { Button } from '@/components/ui/button';
import { RotateCw, Trash2, Check, ArrowRight, GitBranch } from 'lucide-react';

interface RepoCardProps {
  repo: Repository;
  isActive: boolean;
  onSwitch: (repo: Repository) => void;
  onResync: (repo: Repository) => void;
  onDelete: (repo: Repository) => void;
}

export const RepoCard: React.FC<RepoCardProps> = ({
  repo,
  isActive,
  onSwitch,
  onResync,
  onDelete,
}) => {
  return (
    <div
      className={`border rounded-[6px] bg-panel p-4 flex flex-col justify-between transition-all duration-200 ${
        isActive
          ? 'border-border border-l-4 border-l-signal-red shadow-[0_0_15px_rgba(215,25,33,0.1)]'
          : 'border-border hover:border-dim'
      }`}
    >
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2 font-mono">
          <div>
            <div className="flex items-center gap-2">
              <StatusDot status={repo.status} />
              <h3 className="text-base font-bold text-text truncate">
                {repo.owner}/{repo.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-dim mt-0.5 ml-4">
              <span className="flex items-center gap-1">
                <GitBranch size={11} />
                <span>{repo.branch}</span>
              </span>
              <span>·</span>
              <span>{repo.lastIndexed}</span>
            </div>
          </div>

          {isActive && (
            <span className="text-[10px] uppercase font-bold tracking-label text-signal-red border border-signal-red/30 px-1.5 py-0.5 rounded-[2px] bg-signal-red/10">
              ACTIVE
            </span>
          )}
        </div>

        {/* Indexing status state */}
        {repo.status === 'INDEXING' && (
          <div className="my-3 p-2.5 rounded-[4px] bg-raised border border-border flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <DotLoader size="sm" />
              <span className="text-dim">Vectorizing code files...</span>
            </div>
            <span className="text-signal-red font-bold">{repo.progressPercent}%</span>
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-2 my-3 py-2 border-y border-border/60 text-xs font-mono">
          <div>
            <span className="text-dim text-[11px] block uppercase tracking-label">FILES:</span>
            <span className="text-text font-bold">{repo.filesCount}</span>
          </div>
          <div>
            <span className="text-dim text-[11px] block uppercase tracking-label">CHUNKS:</span>
            <span className="text-text font-bold">{repo.chunksCount}</span>
          </div>
        </div>

        {/* Languages as tiny dot-bars */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center justify-between text-[11px] font-mono text-dim">
            <span>LANGUAGES</span>
            <span>{repo.languages.map((l) => `${l.name} ${l.percent}%`).join(' · ')}</span>
          </div>
          <div className="flex items-center gap-1 h-1.5">
            {repo.languages.map((l, i) => (
              <div
                key={i}
                className="h-full rounded-sm"
                style={{
                  width: `${l.percent}%`,
                  backgroundColor: i === 0 ? '#D71921' : '#8A8A8A',
                }}
                title={`${l.name}: ${l.percent}%`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <div>
          {isActive ? (
            <span className="text-[12px] font-mono text-ready-green flex items-center gap-1.5 font-medium">
              <Check size={13} />
              <span>Context Loaded</span>
            </span>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onSwitch(repo)}
              disabled={repo.status === 'INDEXING'}
              className="gap-1.5"
            >
              <span>Switch</span>
              <ArrowRight size={11} />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onResync(repo)}
            className="p-1.5 rounded-[4px] border border-border text-dim hover:text-text hover:border-dim transition-colors"
            title="Re-sync repository"
          >
            <RotateCw size={12} />
          </button>
          <button
            onClick={() => onDelete(repo)}
            className="p-1.5 rounded-[4px] border border-border text-dim hover:text-signal-red hover:border-signal-red transition-colors"
            title="Delete from storage"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
