'use client';

import React, { useState } from 'react';
import { LeftRail } from '@/components/shell/left-rail';
import { TopBar } from '@/components/shell/top-bar';
import { StatusBar } from '@/components/shell/status-bar';
import { CommandPalette } from '@/components/shell/command-palette';
import { RepoProvider, useRepo } from '@/context/repo-context';

function ShellInner({ children }: { children: React.ReactNode }) {
  const { activeRepo, repos, switchRepo } = useRepo();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-bg text-text overflow-hidden selection:bg-signal-red selection:text-white">
      {/* 1. Left Rail (Metro map) */}
      <LeftRail />

      {/* 2. Main Work Area */}
      <div className="flex flex-col flex-1 h-full min-w-0">
        {/* Top Bar */}
        <TopBar
          activeRepo={activeRepo}
          repos={repos}
          onSelectRepo={(r) => switchRepo(r.id)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Content Area with Dotted Grid */}
        <main className="flex-1 overflow-y-auto dotted-grid p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto h-full">{children}</div>
        </main>

        {/* Bottom Status Bar (28px) */}
        <StatusBar
          repoName={activeRepo ? activeRepo.name : 'No Repo Connected'}
          vectorsCount={activeRepo ? activeRepo.chunksCount : 0}
          kValue={5}
          isOnline={true}
        />
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RepoProvider>
      <ShellInner>{children}</ShellInner>
    </RepoProvider>
  );
}
