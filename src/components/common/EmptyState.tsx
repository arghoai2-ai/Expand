import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl my-6 bg-zinc-50/50 dark:bg-zinc-900/40 ${className}`}
    >
      {Icon && (
        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mb-3">
          <Icon size={20} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        {title}
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 active:scale-95 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
