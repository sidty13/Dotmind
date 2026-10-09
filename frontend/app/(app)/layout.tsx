'use client';

import React, { useState } from 'react';
import { LeftRail } from '@/components/shell/left-rail';
import { TopBar } from '@/components/shell/top-bar';
import { StatusBar } from '@/components/shell/status-bar';
import { CommandPalette } from '@/components/shell/command-palette';
import { MOCK_REPOSITORIES } from '@/lib/mock-data';
import { Repository } from '@/lib/types';

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeRepo, setActiveRepo] = useState<Repository>(MOCK_REPOSITORIES[0]);
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
          onSelectRepo={setActiveRepo}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Content Area with Dotted Grid */}
        <main className="flex-1 overflow-y-auto dotted-grid p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto h-full">{children}</div>
        </main>

        {/* Bottom Status Bar (28px) */}
        <StatusBar
          repoName={activeRepo.name}
          vectorsCount={activeRepo.chunksCount}
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
