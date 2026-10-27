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
import Image from 'next/image';

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
        <div className="h-14 flex items-center justify-between px-4 sm:px-5 border-b border-border">
          <Link href="/overview" className="flex items-center gap-2.5 overflow-hidden">
            <Image
              src="/DOTMIND.png"
              alt="DotMind"
              width={28}
              height={28}
              priority
              className="h-7 w-7 object-contain shrink-0"
            />
            {isExpanded && (
              <span className="font-display text-lg font-bold text-text truncate">
                DotMind
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-dim hover:text-text transition-colors p-1 rounded-[3px] border border-border shrink-0"
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

          <nav className="flex flex-col gap-3 relative z-10">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const isVisited = visitedRoutes.includes(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => handleNodeClick(item.href)}
                  className={`group relative flex items-center rounded-[6px] transition-all duration-200 ${
                    isExpanded ? 'gap-3.5 px-3 py-2' : 'justify-center p-2.5 mx-auto'
                  } ${
                    isActive
                      ? 'bg-raised text-signal-red font-semibold border border-signal-red/30 shadow-[0_0_12px_rgba(215,25,33,0.15)]'
                      : 'text-dim hover:text-text hover:bg-raised/60 border border-transparent'
                  }`}
                  title={!isExpanded ? item.label : undefined}
                >
                  {/* Icon & Active Indicator */}
                  <div className="relative flex items-center justify-center">
                    <Icon
                      size={18}
                      className={`transition-colors shrink-0 ${
                        isActive
                          ? 'text-signal-red'
                          : 'text-dim group-hover:text-text'
                      }`}
                    />
                    {/* Active badge dot on collapsed icon */}
                    {!isExpanded && isActive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-signal-red shadow-[0_0_6px_rgba(215,25,33,0.9)]" />
                    )}
                  </div>

                  {/* Expanded Label */}
                  {isExpanded && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span
                        className={`text-[13px] font-mono tracking-label uppercase truncate ${
                          isActive ? 'text-text font-bold' : 'text-dim group-hover:text-text'
                        }`}
                      >
                        {item.label}
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-signal-red shadow-[0_0_6px_rgba(215,25,33,0.8)]" />
                      )}
                    </div>
                  )}

                  {/* Floating Tooltip when collapsed */}
                  {!isExpanded && (
                    <div className="absolute left-[62px] hidden group-hover:flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-raised border border-border text-[12px] font-mono uppercase tracking-label text-text shadow-xl z-50 whitespace-nowrap pointer-events-none">
                      <Icon size={13} className={isActive ? 'text-signal-red' : 'text-dim'} />
                      <span>{item.label}</span>
                      {isActive && <span className="text-[10px] text-signal-red font-bold">● ACTIVE</span>}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Rail Metadata */}
    </aside>
  );
};

