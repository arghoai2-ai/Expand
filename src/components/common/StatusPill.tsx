import React from 'react';

interface StatusPillProps {
  label: string;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  onClick?: () => void;
  className?: string;
}

export function StatusPill({
  label,
  variant = 'neutral',
  size = 'sm',
  onClick,
  className = '',
}: StatusPillProps) {
  const variantStyles = {
    neutral: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
    warning: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/50',
    info: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800/50',
  }[variant];

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 tracking-wide font-medium',
    md: 'text-xs px-2.5 py-1 tracking-wide font-medium',
  }[size];

  const clickableStyles = onClick
    ? 'cursor-pointer hover:opacity-85 active:scale-95 transition-all select-none'
    : '';

  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`inline-flex items-center rounded-md border ${variantStyles} ${sizeStyles} ${clickableStyles} ${className}`}
    >
      {label}
    </span>
  );
}
