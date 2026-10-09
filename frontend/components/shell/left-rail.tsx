'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GitPullRequest,
  FolderGit2,
  Terminal,
  Code2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/ingest', label: 'Ingest', icon: GitPullRequest },
  { href: '/repos', label: 'Repos', icon: FolderGit2 },
  { href: '/chat', label: 'Chat', icon: Terminal },
  { href: '/sources', label: 'Sources', icon: Code2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export const LeftRail: React.FC = () => {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [visitedRoutes, setVisitedRoutes] = useState<string[]>(['/overview']);

  const handleNodeClick = (href: string) => {
    if (!visitedRoutes.includes(href)) {
      setVisitedRoutes((prev) => [...prev, href]);
    }
  };

  return (
    <aside
      className={`relative z-40 flex flex-col justify-between border-r border-border bg-panel transition-all duration-300 select-none ${
        isExpanded ? 'w-[240px]' : 'w-[72px]'
      }`}
    >
      {/* Top Section / Brand Icon */}
      <div>
        <div className="h-14 flex items-center justify-between px-5 border-b border-border">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-6 h-6 rounded-full border border-signal-red flex items-center justify-center shrink-0">
              <span className="w-2 h-2 rounded-full bg-signal-red animate-pulse" />
            </div>
            {isExpanded && (
              <span className="font-display text-lg font-bold text-text truncate">
                DotMind
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-dim hover:text-text transition-colors p-1 rounded-[3px] border border-border"
            title={isExpanded ? 'Collapse rail' : 'Expand rail'}
          >
            {isExpanded ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
          </button>
        </div>

        {/* Metro-Map Vertical Navigation */}
        <div className="py-6 px-3 relative">
          {/* Vertical Dotted Metro Line */}
          <div
            className={`absolute top-10 bottom-10 ${
              isExpanded ? 'left-8' : 'left-[35px]'
            } w-[2px] border-l-2 border-dotted border-border/70 z-0 transition-all duration-300`}
          />

          <nav className="flex flex-col gap-6 relative z-10">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const isVisited = visitedRoutes.includes(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => handleNodeClick(item.href)}
                  className={`group flex items-center gap-3.5 py-1 px-2 rounded-[4px] transition-colors ${
                    isActive ? 'text-text font-semibold' : 'text-dim hover:text-text'
                  }`}
                >
                  {/* Metro Node Circle */}
                  <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                    <span
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-200 border ${
                        isActive
                          ? 'bg-signal-red border-signal-red shadow-[0_0_8px_rgba(215,25,33,0.9)] animate-pulse-red'
                          : isVisited
                          ? 'bg-text border-text'
                          : 'bg-panel border-dim/50 group-hover:border-text'
                      }`}
                    />
                  </div>

                  {/* Icon & Label */}
                  {isExpanded ? (
                    <div className="flex items-center gap-2 truncate">
                      <Icon size={14} className={isActive ? 'text-signal-red' : 'text-dim'} />
                      <span className="font-mono text-[13px] uppercase tracking-label truncate">
                        {item.label}
                      </span>
                    </div>
                  ) : (
                    /* Floating Tooltip when collapsed */
                    <div className="absolute left-[74px] hidden group-hover:flex items-center px-2.5 py-1 rounded-[3px] bg-raised border border-border text-[12px] font-mono uppercase tracking-label text-text shadow-lg z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Rail Metadata */}
      <div className="p-3 border-t border-border font-mono text-[11px] text-dim/70 truncate">
        {isExpanded ? (
          <div className="flex items-center justify-between">
            <span>RAG_V1 // ONLINE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-ready-green" />
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-ready-green" />
          </div>
        )}
      </div>
    </aside>
  );
};
