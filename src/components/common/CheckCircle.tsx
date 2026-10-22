import React from 'react';
import { Check } from 'lucide-react';

interface CheckCircleProps {
  checked: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  className?: string;
}

export function CheckCircle({
  checked,
  onToggle,
  size = 'md',
  ariaLabel = 'Toggle completion',
  className = '',
}: CheckCircleProps) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const iconSize = {
    sm: 11,
    md: 13,
    lg: 16,
  }[size];

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`shrink-0 rounded-full border flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 ${
        checked
          ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900'
          : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-500 bg-transparent'
      } ${sizeClass} ${className}`}
    >
      {checked && <Check size={iconSize} strokeWidth={3} />}
    </button>
  );
}
