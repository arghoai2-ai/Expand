import React from 'react';
import type { FinanceEntry } from '../../types/index.ts';
import { AmountText } from '../common/AmountText.tsx';
import { Lock, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface FinanceEntryTileProps {
  entry: FinanceEntry;
  onEdit: () => void;
  onDelete: () => void;
}

export function FinanceEntryTile({ entry, onEdit, onDelete }: FinanceEntryTileProps) {
  const isIncome = entry.type === 'income';
  const isSettlement = !!entry.linkedDueId;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!isSettlement) onEdit();
      }}
      onKeyDown={(e) => {
        if (!isSettlement && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onEdit();
        }
      }}
      className={`p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-750 transition-all flex items-center justify-between gap-3 shadow-2xs group ${
        isSettlement ? 'cursor-default' : 'cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Type Icon */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isIncome
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
          }`}
        >
          {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
        </div>

        {/* Labels & Notes */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {entry.label}
            </span>
            {isSettlement && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono flex items-center gap-0.5">
                <Lock size={10} /> Due settlement
              </span>
            )}
          </div>

          {entry.note && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              {entry.note}
            </p>
          )}
        </div>
      </div>

      {/* Amount & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <AmountText
          minorUnits={entry.amountMinor}
          type={isIncome ? 'income' : 'expense'}
          showSign={true}
          size="md"
          weight="bold"
        />

        {!isSettlement && (
          <button
            type="button"
            aria-label="Delete finance entry"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-md text-zinc-400 hover:text-rose-600 transition-opacity"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
