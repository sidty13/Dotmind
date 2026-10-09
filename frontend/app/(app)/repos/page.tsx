'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_REPOSITORIES } from '@/lib/mock-data';
import { Repository } from '@/lib/types';
import { RepoCard } from '@/components/repos/repo-card';
import { DeleteModal } from '@/components/repos/delete-modal';
import { Button } from '@/components/ui/button';
import {
  Plus,
  LayoutGrid,
  List,
  Search,
  ArrowUpDown,
  FolderGit2,
} from 'lucide-react';

export default function ReposPage() {
  const [repos, setRepos] = useState<Repository[]>(MOCK_REPOSITORIES);
  const [activeRepoId, setActiveRepoId] = useState<string>('encode_starlette');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'size'>('recent');
  const [repoToDelete, setRepoToDelete] = useState<Repository | null>(null);

  // Filter & Sort
  const filteredRepos = repos
    .filter((r) =>
      `${r.owner}/${r.name}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return b.chunksCount - a.chunksCount;
      return 0; // recent
    });

  const handleSwitch = (repo: Repository) => {
    setActiveRepoId(repo.id);
  };

  const handleResync = (repo: Repository) => {
    alert(`Re-sync triggered for ${repo.owner}/${repo.name}. Fetching git pull diff...`);
  };

  const handleDeleteConfirm = () => {
    if (!repoToDelete) return;
    setRepos((prev) => prev.filter((r) => r.id !== repoToDelete.id));
    if (activeRepoId === repoToDelete.id) {
      const remaining = repos.filter((r) => r.id !== repoToDelete.id);
      if (remaining.length > 0) setActiveRepoId(remaining[0].id);
    }
    setRepoToDelete(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[12px] font-mono uppercase tracking-label text-signal-red mb-1">
            // STORAGE REPOSITORY REGISTRY
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-text">
            Repositories
          </h1>
        </div>

        <Link href="/ingest">
          <Button variant="primary" size="md" className="gap-2">
            <Plus size={14} />
            <span>Ingest new repo</span>
          </Button>
        </Link>
      </div>

      {/* Control Bar: Search, Sort, View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-[13px]">
        {/* Search Input */}
        <div className="flex-1 flex items-center bg-panel border border-border focus-within:border-signal-red rounded-[4px] px-3 py-1.5 transition-colors">
          <Search size={14} className="text-dim mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search indexed repositories..."
            className="w-full bg-transparent text-text placeholder:text-dim/60 focus:outline-none text-[13px]"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-border bg-panel text-dim text-[12px]">
            <ArrowUpDown size={13} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-text focus:outline-none cursor-pointer"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="name">Sort: Alphabetical</option>
              <option value="size">Sort: Chunk Count</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center rounded-[4px] border border-border bg-panel p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-[2px] transition-colors ${
                viewMode === 'grid' ? 'bg-raised text-text' : 'text-dim hover:text-text'
              }`}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-[2px] transition-colors ${
                viewMode === 'list' ? 'bg-raised text-text' : 'text-dim hover:text-text'
              }`}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Repositories Container */}
      {filteredRepos.length === 0 ? (
        /* Empty State */
        <div className="border border-border bg-panel rounded-[6px] p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mx-auto text-dim">
            <FolderGit2 size={20} />
          </div>
          <div className="font-display text-3xl font-black uppercase text-text tracking-tight">
            No repos yet
          </div>
          <p className="font-ui text-dim text-sm max-w-sm mx-auto">
            Your vector index storage is completely empty. Ingest a GitHub repository to get started.
          </p>
          <div className="pt-2">
            <Link href="/ingest">
              <Button variant="primary" size="md">
                Ingest your first repository
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'flex flex-col gap-3'
          }
        >
          {filteredRepos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              isActive={repo.id === activeRepoId}
              onSwitch={handleSwitch}
              onResync={handleResync}
              onDelete={(r) => setRepoToDelete(r)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {repoToDelete && (
        <DeleteModal
          repoName={`${repoToDelete.owner}/${repoToDelete.name}`}
          isOpen={!!repoToDelete}
          onClose={() => setRepoToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
