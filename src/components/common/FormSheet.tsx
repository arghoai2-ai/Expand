import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface FormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function FormSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-lg',
}: FormSheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl border-t sm:border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar on mobile */}
        <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 overscroll-contain flex-1">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-100 dark:border-zinc-800/80 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
