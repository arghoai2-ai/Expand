import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AlertCircle, Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { formatDateLabel } from '../../utils/dates.ts';

export function EmergencyStockOutView() {
  const { stockOutItems, addStockOutItem, removeStockOutItem } = useApp();
  const [productName, setProductName] = useState('');
  const [note, setNote] = useState('');
  const [showNoteField, setShowNoteField] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = productName.trim();
    if (!trimmed) return;

    addStockOutItem(trimmed, note);
    setProductName('');
    setNote('');
    setShowNoteField(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-rose-950 dark:text-rose-200 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <AlertCircle size={20} className="text-rose-600 dark:text-rose-400 shrink-0" />
          <div>
            <h3 className="text-xs sm:text-sm font-bold tracking-tight">
              Emergency Stock-Out / Restock Tracker
            </h3>
            <p className="text-[11px] text-rose-700 dark:text-rose-300">
              Immediate reorder items. One click to clear once ordered or restocked.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-200/80 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 shrink-0">
          {stockOutItems.length} needed
        </span>
      </div>

      {/* Fast-Entry Text Field Card */}
      <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
        <form onSubmit={handleAdd} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              autoFocus
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Type urgent out-of-stock product..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
            <button
              type="submit"
              disabled={!productName.trim()}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>Add</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            {!showNoteField ? (
              <button
                type="button"
                onClick={() => setShowNoteField(true)}
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:underline"
              >
                + Add optional quantity / supplier note
              </button>
            ) : (
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Need 10 rolls / Supplier: Rahim Packaging"
                className="w-full px-2.5 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none"
              />
            )}
            <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">Press Enter to save</span>
          </div>
        </form>
      </div>

      {/* Emergency Stock-Out List */}
      {stockOutItems.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-2">
          <CheckCircle2 size={32} className="mx-auto text-emerald-500 opacity-80" />
          <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            All critical stock replenished
          </h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            No emergency stock-outs recorded. Type any suddenly exhausted item above to instantly log it for reordering.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider px-1">
            <span>Critical Items ({stockOutItems.length})</span>
            <span className="text-[10px] font-normal lowercase">One click to clear when restocked</span>
          </div>

          {stockOutItems.map((item) => {
            const dateStr = item.createdAt.slice(0, 10);
            const label = formatDateLabel(dateStr, undefined, false);

            return (
              <div
                key={item.id}
                className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between gap-3 shadow-2xs group"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                    <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {item.productName}
                    </span>
                  </div>

                  {item.note && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-4">
                      {item.note}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 pl-4 text-[10px] text-zinc-400 font-mono">
                    <Clock size={11} />
                    <span>Logged {label || 'recently'}</span>
                  </div>
                </div>

                {/* One-click delete / clear button directly on row */}
                <button
                  type="button"
                  aria-label={`Clear ${item.productName} as restocked or removed`}
                  onClick={() => removeStockOutItem(item.id)}
                  title="Mark Restocked / Remove"
                  className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-all flex items-center gap-1.5 text-xs font-semibold shrink-0"
                >
                  <Trash2 size={13} className="text-rose-500" />
                  <span className="hidden sm:inline">Restocked</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
