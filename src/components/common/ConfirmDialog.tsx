import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              isDestructive
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
            }`}
          >
            <AlertCircle size={20} />
          </div>
          <div className="space-y-1">
            <h3 id="confirm-dialog-title" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg text-white transition-all shadow-xs active:scale-95 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
