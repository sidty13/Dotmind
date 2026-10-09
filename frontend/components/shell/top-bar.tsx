'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StatusDot } from '@/components/ui/status-dot';
import { Kbd } from '@/components/ui/kbd';
import { MOCK_REPOSITORIES } from '@/lib/mock-data';
import { Repository } from '@/lib/types';
import { ChevronDown, Moon, Sun, Search, GitBranch } from 'lucide-react';

interface TopBarProps {
  onOpenCommandPalette: () => void;
  activeRepo: Repository;
  onSelectRepo: (repo: Repository) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenCommandPalette,
  activeRepo,
  onSelectRepo,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    document.documentElement.classList.toggle('light');
  };

  return (
    <header className="h-14 border-b border-border bg-panel px-4 sm:px-6 flex items-center justify-between select-none shrink-0 z-30">
      {/* Left: Wordmark & Repo selector dropdown */}
      <div className="flex items-center gap-4">
        <Link href="/overview" className="hidden sm:flex items-center gap-2">
          <span className="font-display text-xl font-bold tracking-tight text-text">
            DotMind
          </span>
          <span className="text-[10px] font-mono text-signal-red border border-signal-red/40 px-1 py-0.2 rounded-[2px]">
            PROD
          </span>
        </Link>

        <span className="hidden sm:inline text-dim/40 font-mono">/</span>

        {/* Active Repo Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] border border-border bg-raised hover:border-dim text-[13px] font-mono text-text transition-colors"
          >
            <StatusDot status={activeRepo.status} />
            <span className="font-semibold truncate max-w-[150px] sm:max-w-[200px]">
              {activeRepo.owner}/{activeRepo.name}
            </span>
            <ChevronDown size={12} className="text-dim ml-1" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-64 rounded-[6px] border border-border bg-raised shadow-xl z-50 overflow-hidden font-mono text-[12px]">
              <div className="p-2 border-b border-border text-[11px] uppercase tracking-label text-dim">
                SELECT REPOSITORY
              </div>
              <div className="max-h-56 overflow-y-auto p-1">
                {MOCK_REPOSITORIES.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => {
                      onSelectRepo(repo);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-[3px] text-left hover:bg-panel transition-colors ${
                      repo.id === activeRepo.id ? 'bg-panel text-signal-red font-bold' : 'text-text'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <StatusDot status={repo.status} size="sm" />
                      <span className="truncate">{repo.owner}/{repo.name}</span>
                    </div>
                    <span className="text-[11px] text-dim">{repo.chunksCount} chk</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Command palette button + theme toggle */}
      <div className="flex items-center gap-3">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] border border-border bg-raised hover:border-dim text-[12px] font-mono text-dim hover:text-text transition-colors"
        >
          <Search size={13} />
          <span className="hidden md:inline">Command Palette</span>
          <Kbd>⌘K</Kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-[4px] border border-border bg-raised hover:border-dim flex items-center justify-center text-dim hover:text-text transition-colors"
          title="Toggle light/dark theme"
        >
          {isLightMode ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>
    </header>
  );
};
