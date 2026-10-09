import React from 'react';

interface StatusDotProps {
  status: 'ACTIVE' | 'READY' | 'INDEXING' | 'ERROR';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const getDotStyle = () => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-signal-red animate-pulse-red';
      case 'READY':
        return 'bg-ready-green';
      case 'INDEXING':
        return 'bg-yellow-400 animate-pulse';
      case 'ERROR':
        return 'bg-signal-red';
      default:
        return 'bg-dim';
    }
  };

  return (
    <span className={`inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-label select-none ${className}`}>
      <span className={`rounded-full shrink-0 ${sizeMap[size]} ${getDotStyle()}`} />
      {label && <span className="text-dim text-[11px]">{label}</span>}
    </span>
  );
};
