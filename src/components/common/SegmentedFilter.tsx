import React from 'react';

interface SegmentedFilterProps<T extends string> {
  options: { label: string; value: T; count?: number }[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
}

export function SegmentedFilter<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedFilterProps<T>) {
  return (
    <div
      role="tablist"
      className={`inline-flex p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-medium ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 focus:outline-none ${
              isSelected
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300'
                    : 'bg-zinc-200/70 dark:bg-zinc-700/60 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
