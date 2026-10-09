import React from 'react';

interface PanelProps {
  label?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  raised?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  label,
  badge,
  children,
  className = '',
  raised = false,
}) => {
  return (
    <div
      className={`relative border border-border rounded-[6px] transition-colors ${
        raised ? 'bg-raised' : 'bg-panel'
      } ${className}`}
    >
      {(label || badge) && (
        <div className="absolute -top-2.5 left-3 flex items-center gap-2 px-1.5 bg-panel text-[11px] font-mono uppercase tracking-label text-dim select-none">
          {label && <span>[ {label} ]</span>}
          {badge}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};
