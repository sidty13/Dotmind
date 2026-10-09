'use client';

import React from 'react';
import { Terminal, FolderGit2, RefreshCw, Trash2, Activity, X } from 'lucide-react';

interface SlashMenuProps {
  onSelect: (command: string) => void;
  onClose: () => void;
}

const COMMANDS = [
  { cmd: '/ingest', desc: 'Index a new GitHub repository URL', icon: FolderGit2 },
  { cmd: '/repos', desc: 'Browse and manage repository storage', icon: FolderGit2 },
  { cmd: '/switch', desc: 'Switch active repository context', icon: RefreshCw },
  { cmd: '/health', desc: 'Check vector database and API health', icon: Activity },
  { cmd: '/clear', desc: 'Clear chat memory for active session', icon: Trash2 },
];

export const SlashMenu: React.FC<SlashMenuProps> = ({ onSelect, onClose }) => {
  return (
    <div className="absolute bottom-16 left-3 w-80 rounded-[6px] border border-border bg-raised shadow-2xl overflow-hidden font-mono text-[12px] z-50 animate-fadeIn">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-panel text-[10px] uppercase tracking-label text-dim">
        <span>COMMAND PALETTE (SLASH)</span>
        <button onClick={onClose} className="hover:text-text">
          <X size={12} />
        </button>
      </div>

      <div className="p-1 space-y-0.5">
        {COMMANDS.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.cmd}
              onClick={() => onSelect(c.cmd)}
              className="w-full flex items-center justify-between p-2 rounded-[3px] text-left hover:bg-panel text-text hover:text-signal-red transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon size={13} className="text-dim" />
                <span className="font-bold">{c.cmd}</span>
              </div>
              <span className="text-[11px] text-dim/70 truncate">{c.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
