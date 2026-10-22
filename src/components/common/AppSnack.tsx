import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { X } from 'lucide-react';

export function AppSnack() {
  const { toast, dismissToast } = useApp();

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md animate-in slide-in-from-bottom-5 fade-in duration-200"
    >
      <div className="bg-zinc-900/95 dark:bg-zinc-100/95 text-white dark:text-zinc-950 px-4 py-2.5 rounded-xl shadow-xl border border-zinc-800 dark:border-zinc-200 flex items-center justify-between gap-3 text-xs backdrop-blur-md">
        <span className="font-medium truncate">{toast.message}</span>
        <div className="flex items-center gap-2 shrink-0">
          {toast.undoAction && (
            <button
              type="button"
              onClick={() => {
                toast.undoAction?.();
                dismissToast();
              }}
              className="px-2.5 py-1 rounded-md font-semibold text-amber-400 dark:text-amber-600 hover:bg-white/10 dark:hover:bg-zinc-900/10 transition-colors uppercase tracking-wider text-[11px]"
            >
              {toast.undoLabel || 'Undo'}
            </button>
          )}
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={dismissToast}
            className="p-1 rounded-md hover:bg-white/10 dark:hover:bg-zinc-900/10 text-zinc-400 dark:text-zinc-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
