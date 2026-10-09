import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-mono text-[13px] uppercase tracking-label transition-colors duration-150 rounded-[4px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none focus-visible:outline-none';

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-[12px] h-7',
    md: 'px-3.5 py-1.5 text-[13px] h-9',
    lg: 'px-5 py-2.5 text-[14px] h-11',
  };

  const variants = {
    primary:
      'border border-signal-red text-signal-red hover:bg-signal-red hover:text-white active:bg-signal-red/90',
    secondary:
      'border border-border text-text hover:border-dim hover:bg-raised active:bg-panel',
    ghost:
      'border border-transparent text-dim hover:text-text hover:bg-raised',
    danger:
      'border border-signal-red bg-signal-red/10 text-signal-red hover:bg-signal-red hover:text-white',
  };

  return (
    <button
      className={`${base} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
