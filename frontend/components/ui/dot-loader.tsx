'use client';

import React, { useEffect, useState } from 'react';

interface DotLoaderProps {
  size?: 'sm' | 'md';
  className?: string;
}

export const DotLoader: React.FC<DotLoaderProps> = ({ size = 'md', className = '' }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // 3x3 sequence order (clockwise spiral or wave)
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 9);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const dotSize = size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5';
  const gap = size === 'sm' ? 'gap-0.5' : 'gap-1';

  return (
    <div
      className={`inline-grid grid-cols-3 ${gap} p-1 rounded-sm bg-panel border border-border/60 ${className}`}
      aria-label="Loading..."
    >
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
        const isActive = activeStep === index;
        const isTrailing = (activeStep + 8) % 9 === index;

        return (
          <div
            key={index}
            className={`${dotSize} rounded-full transition-colors duration-100 ${
              isActive
                ? 'bg-signal-red scale-110 shadow-[0_0_6px_rgba(215,25,33,0.8)]'
                : isTrailing
                ? 'bg-white/40'
                : 'bg-white/10'
            }`}
          />
        );
      })}
    </div>
  );
};
