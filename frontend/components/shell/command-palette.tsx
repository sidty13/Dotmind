'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Terminal, FolderGit2, FileText, Settings, X, CornerDownLeft } from 'lucide-react';
import { useRepo } from '@/context/repo-context';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  /** Open if closed, close if open. Needed so the shortcut can OPEN the palette. */
  onToggle?: () => void;
}

interface CommandItem {
  id: string;
  category: 'Pages' | 'Repos' | 'Commands';
  title: string;
  subtitle?: string;
  icon: any;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onToggle }) => {
  const router = useRouter();
  const { repos, switchRepo } = useRepo();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global shortcut: Windows/Super/Cmd + K  (Ctrl + K also works). Esc closes.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isK = e.code === 'KeyK' || e.key.toLowerCase() === 'k';
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        e.stopPropagation();
        if (onToggle) onToggle();
        else if (isOpen) onClose();
        return;
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    // capture = true so the browser/app doesn't swallow it first
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose, onToggle]);

  // Fresh state every time it opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const go = (path: string) => {
    router.push(path);
    onClose();
  };

  const items: CommandItem[] = [
    // Pages
    { id: 'p-overview', category: 'Pages', title: 'Go to Overview', subtitle: '/overview', icon: Terminal, action: () => go('/overview') },
    { id: 'p-ingest', category: 'Pages', title: 'Go to Ingest', subtitle: '/ingest', icon: FolderGit2, action: () => go('/ingest') },
    { id: 'p-chat', category: 'Pages', title: 'Go to Terminal Chat', subtitle: '/chat', icon: Terminal, action: () => go('/chat') },
    { id: 'p-repos', category: 'Pages', title: 'Go to Repositories', subtitle: '/repos', icon: FolderGit2, action: () => go('/repos') },
    { id: 'p-sources', category: 'Pages', title: 'Go to Sources Code Viewer', subtitle: '/sources', icon: FileText, action: () => go('/sources') },
    { id: 'p-settings', category: 'Pages', title: 'Go to Settings', subtitle: '/settings', icon: Settings, action: () => go('/settings') },
    // Commands
    { id: 'c-ingest', category: 'Commands', title: '/ingest <url>', subtitle: 'Index a new GitHub repository', icon: Terminal, action: () => go('/ingest') },
    { id: 'c-switch', category: 'Commands', title: '/switch', subtitle: 'Change active codebase context', icon: Terminal, action: () => go('/repos') },
    { id: 'c-clear', category: 'Commands', title: '/clear', subtitle: 'Open chat to clear the screen', icon: Terminal, action: () => go('/chat') },
    // Repos: actually switch the active repo, then open chat
    ...repos.map((r) => ({
      id: `r-${r.id}`,
      category: 'Repos' as const,
      title: `${r.owner}/${r.name}`,
      subtitle: `${r.chunksCount ?? 0} chunks · ${r.branch && r.branch !== 'default' ? r.branch : 'main'}`,
      icon: FolderGit2,
      action: () => {
        switchRepo(r.id);
        go('/chat');
      },
    })),
  ];

  const q = query.toLowerCase();
  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q))
  );

  // Visual order is grouped by category, so navigate in that same order
  const ordered = ['Pages', 'Commands', 'Repos'].flatMap((cat) =>
    filtered.filter((i) => i.category === cat)
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keep the highlighted row visible while using arrow keys
  useEffect(() => {
    const id = ordered[selectedIndex]?.id;
    if (id) document.getElementById(`cmd-${id}`)?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const n = ordered.length || 1;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % n);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + n) % n);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      ordered[selectedIndex]?.action();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl rounded-[8px] border border-border bg-panel shadow-2xl overflow-hidden font-mono"
        onKeyDown={handleKeyDown}
      >
        {/* Search header */}
        <div className="flex items-center px-4 border-b border-border bg-raised">
          <Search size={15} className="text-dim mr-2.5 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page, or repository..."
            className="w-full py-3.5 bg-transparent text-text text-[14px] placeholder:text-dim/60 focus:outline-none"
          />
          <button onClick={onClose} className="text-dim hover:text-text p-1">
            <X size={15} />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/40">
          {ordered.length === 0 ? (
            <div className="p-8 text-center text-dim text-[13px]">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            ['Pages', 'Commands', 'Repos'].map((cat) => {
              const catItems = ordered.filter((i) => i.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="py-1">
                  <div className="px-2.5 py-1 text-[10px] uppercase tracking-label text-dim/60 font-bold">
                    {cat}
                  </div>
                  {catItems.map((item) => {
                    const globalIdx = ordered.indexOf(item);
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        id={`cmd-${item.id}`}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[4px] text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-raised border border-border text-text'
                            : 'text-dim hover:text-text border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon size={14} className={isSelected ? 'text-signal-red' : 'text-dim'} />
                          <span className={`text-[13px] truncate ${isSelected ? 'text-text font-medium' : ''}`}>
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span className="text-[11px] text-dim/60 truncate">{item.subtitle}</span>
                          )}
                        </div>
                        {isSelected && (
                          <span className="text-dim flex items-center gap-1 text-[11px]">
                            <span>SELECT</span>
                            <CornerDownLeft size={10} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-3 py-2 border-t border-border bg-panel flex items-center justify-between text-[11px] text-dim">
          <span>Navigate with ↑ ↓ · Select with ⏎</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};