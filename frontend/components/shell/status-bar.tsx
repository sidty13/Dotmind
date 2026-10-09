import React from 'react';

interface StatusBarProps {
  repoName?: string;
  vectorsCount?: number;
  kValue?: number;
  isOnline?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  repoName = 'starlette',
  vectorsCount = 612,
  kValue = 5,
  isOnline = true,
}) => {
  return (
    <footer className="h-7 border-t border-border bg-panel px-4 flex items-center justify-between font-mono text-[12px] text-dim select-none shrink-0 z-30">
      <div className="flex items-center gap-2 truncate">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isOnline ? 'bg-ready-green' : 'bg-signal-red animate-pulse'
          }`}
        />
        <span className="truncate">
          API {isOnline ? 'online' : 'unreachable'} · repo: {repoName} · {vectorsCount} vectors · k={kValue}
        </span>
      </div>

      <div className="hidden sm:flex items-center gap-4 text-[11px] uppercase tracking-label text-dim/70">
        <span>MODEL: TEXT-EMBEDDING-3-SMALL</span>
        <span>LATENCY: ~140MS</span>
      </div>
    </footer>
  );
};
