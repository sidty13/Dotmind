'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRepo } from '@/context/repo-context';
import { Repository } from '@/lib/types';
import { RepoCard } from '@/components/repos/repo-card';
import { DeleteModal } from '@/components/repos/delete-modal';
import { Button } from '@/components/ui/button';
import { DotLoader } from '@/components/ui/dot-loader';
import {
  Plus,
  LayoutGrid,
  List,
  Search,
  ArrowUpDown,
  FolderGit2,
} from 'lucide-react';

export default function ReposPage() {
  const { repos, activeRepo, isLoading, switchRepo, deleteRepo } = useRepo();
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
    switchRepo(repo.id);
  };

  const handleResync = (repo: Repository) => {
    alert(`Re-sync triggered for ${repo.owner}/${repo.name}. Fetching diff...`);
  };

  const handleDeleteConfirm = () => {
    if (!repoToDelete) return;
    deleteRepo(repoToDelete.id);
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

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <DotLoader />
          <span className="font-mono text-xs text-dim mt-4 uppercase tracking-label">
            Loading your repositories...
          </span>
        </div>
      ) : repos.length === 0 ? (
        /* Empty State */
        <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-[8px] bg-panel/40 p-8">
          <div className="w-14 h-14 rounded-full border border-border flex items-center justify-center text-dim mb-4">
            <FolderGit2 size={24} className="text-signal-red" />
          </div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-text mb-2">
            No Repositories Indexed
          </h2>
          <p className="font-mono text-xs text-dim max-w-md mb-6 leading-relaxed">
            Your personal workspace does not have any repositories yet. Paste a GitHub repository URL to index files, generate embeddings, and start chatting.
          </p>
          <Link href="/ingest">
            <Button variant="primary" size="md" className="gap-2">
              <Plus size={14} />
              <span>Ingest your first repo</span>
            </Button>
          </Link>
        </div>
      ) : (
        <>
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
                  <option value="name">Sort: Name (A-Z)</option>
                  <option value="size">Sort: Chunk Count</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center border border-border rounded-[4px] bg-panel p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-[2px] transition-colors ${
                    viewMode === 'grid' ? 'bg-raised text-signal-red' : 'text-dim hover:text-text'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-[2px] transition-colors ${
                    viewMode === 'list' ? 'bg-raised text-signal-red' : 'text-dim hover:text-text'
                  }`}
                  title="List view"
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Repo Grid / List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRepos.map((repo) => (
                <RepoCard
                  key={repo.id}
                  repo={repo}
                  isActive={activeRepo?.id === repo.id}
                  onSwitch={() => handleSwitch(repo)}
                  onResync={() => handleResync(repo)}
                  onDelete={() => setRepoToDelete(repo)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className={`flex items-center justify-between p-3 rounded-[4px] border bg-panel transition-colors ${
                    activeRepo?.id === repo.id ? 'border-signal-red' : 'border-border hover:border-dim'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-text text-sm">
                      {repo.owner}/{repo.name}
                    </span>
                    <span className="text-[11px] font-mono text-dim">
                      {repo.chunksCount} chunks
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={activeRepo?.id === repo.id ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleSwitch(repo)}
                    >
                      {activeRepo?.id === repo.id ? 'Active' : 'Switch'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-dim hover:text-signal-red"
                      onClick={() => setRepoToDelete(repo)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(repoToDelete)}
        repoName={repoToDelete?.name || ''}
        onClose={() => setRepoToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
