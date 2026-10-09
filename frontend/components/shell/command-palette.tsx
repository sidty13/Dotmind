'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Terminal, FolderGit2, FileText, Settings, X, CornerDownLeft } from 'lucide-react';
import { MOCK_REPOSITORIES } from '@/lib/mock-data';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  category: 'Pages' | 'Repos' | 'Commands';
  title: string;
  subtitle?: string;
  icon: any;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global keydown listener for Cmd/Ctrl+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const items: CommandItem[] = [
    // Pages
    {
      id: 'p-overview',
      category: 'Pages',
      title: 'Go to Overview',
      subtitle: '/overview',
      icon: Terminal,
      action: () => { router.push('/overview'); onClose(); },
    },
    {
      id: 'p-ingest',
      category: 'Pages',
      title: 'Go to Ingest',
      subtitle: '/ingest',
      icon: FolderGit2,
      action: () => { router.push('/ingest'); onClose(); },
    },
    {
      id: 'p-chat',
      category: 'Pages',
      title: 'Go to Terminal Chat',
      subtitle: '/chat',
      icon: Terminal,
      action: () => { router.push('/chat'); onClose(); },
    },
    {
      id: 'p-repos',
      category: 'Pages',
      title: 'Go to Repositories',
      subtitle: '/repos',
      icon: FolderGit2,
      action: () => { router.push('/repos'); onClose(); },
    },
    {
      id: 'p-sources',
      category: 'Pages',
      title: 'Go to Sources Code Viewer',
      subtitle: '/sources',
      icon: FileText,
      action: () => { router.push('/sources'); onClose(); },
    },
    {
      id: 'p-settings',
      category: 'Pages',
      title: 'Go to Settings',
      subtitle: '/settings',
      icon: Settings,
      action: () => { router.push('/settings'); onClose(); },
    },
    // Commands
    {
      id: 'c-ingest',
      category: 'Commands',
      title: '/ingest <url>',
      subtitle: 'Index a new GitHub repository',
      icon: Terminal,
      action: () => { router.push('/ingest'); onClose(); },
    },
    {
      id: 'c-switch',
      category: 'Commands',
      title: '/switch',
      subtitle: 'Change active codebase context',
      icon: Terminal,
      action: () => { router.push('/repos'); onClose(); },
    },
    {
      id: 'c-clear',
      category: 'Commands',
      title: '/clear',
      subtitle: 'Reset current chat session memory',
      icon: Terminal,
      action: () => { router.push('/chat'); onClose(); },
    },
    // Repos
    ...MOCK_REPOSITORIES.map((r) => ({
      id: `r-${r.id}`,
      category: 'Repos' as const,
      title: `${r.owner}/${r.name}`,
      subtitle: `${r.chunksCount} chunks · ${r.branch}`,
      icon: FolderGit2,
      action: () => { router.push(`/chat?repo=${r.id}`); onClose(); },
    })),
  ];

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
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
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-dim text-[13px]">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            ['Pages', 'Commands', 'Repos'].map((cat) => {
              const catItems = filtered.filter((i) => i.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="py-1">
                  <div className="px-2.5 py-1 text-[10px] uppercase tracking-label text-dim/60 font-bold">
                    {cat}
                  </div>
                  {catItems.map((item) => {
                    const globalIdx = filtered.indexOf(item);
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
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
                            <span className="text-[11px] text-dim/60 truncate">
                              {item.subtitle}
                            </span>
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
