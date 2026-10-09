import React from 'react';

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  active = false,
  onClick,
  className = '',
  icon,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-mono tracking-label rounded-[4px] border transition-colors cursor-pointer select-none ${
        active
          ? 'border-signal-red bg-signal-red/10 text-signal-red font-semibold'
          : 'border-border bg-panel text-dim hover:border-dim hover:text-text'
      } ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
