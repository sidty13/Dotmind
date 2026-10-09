import React from 'react';

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export const Kbd: React.FC<KbdProps> = ({ children, className = '' }) => {
  return (
    <kbd
      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-mono tracking-wider text-dim bg-raised border border-border rounded-[3px] shadow-none select-none ${className}`}
    >
      {children}
    </kbd>
  );
};
