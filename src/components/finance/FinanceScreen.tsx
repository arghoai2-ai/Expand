import React, { useState, useMemo } from 'react';
import type { Ledger, FinanceEntry } from '../../types/index.ts';
import { useApp } from '../../context/AppContext.tsx';
import { FinanceSummaryHeader } from './FinanceSummaryHeader.tsx';
import { FinanceEntryTile } from './FinanceEntryTile.tsx';
import { FinanceEntryFormSheet } from './FinanceEntryFormSheet.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { formatDateLabel } from '../../utils/dates.ts';
import { Plus, Receipt } from 'lucide-react';

interface FinanceScreenProps {
  ledger: Ledger;
}

export function FinanceScreen({ ledger }: FinanceScreenProps) {
  const {
    financeEntries,
    businessFinanceSummary,
    personalFinanceSummary,
    addFinanceEntry,
    updateFinanceEntry,
    deleteFinanceEntry,
  } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null);

  const summary = ledger === 'business' ? businessFinanceSummary : personalFinanceSummary;

  // Filter entries for this ledger
  const entries = useMemo(() => {
    return financeEntries
      .filter((e) => e.ledger === ledger)
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [financeEntries, ledger]);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: { date: string; dateLabel: string; items: FinanceEntry[] }[] = [];
    const dateMap: Record<string, FinanceEntry[]> = {};

    entries.forEach((item) => {
      if (!dateMap[item.date]) {
        dateMap[item.date] = [];
      }
      dateMap[item.date].push(item);
    });

    Object.keys(dateMap)
      .sort((a, b) => b.localeCompare(a))
      .forEach((date) => {
        groups.push({
          date,
          dateLabel: formatDateLabel(date, undefined, false),
          items: dateMap[date],
        });
      });

    return groups;
  }, [entries]);

  const handleEdit = (entry: FinanceEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Omit<FinanceEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingEntry) {
      updateFinanceEntry({
        ...editingEntry,
        ...data,
      });
      setEditingEntry(null);
    } else {
      addFinanceEntry(data);
    }
  };

  return (
    <div className="space-y-5">
      {/* Pinned All-Time Summary Header */}
      <FinanceSummaryHeader ledger={ledger} summary={summary} />

      {/* Daily Grouped Entries */}
      {entries.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions logged"
          description={
            ledger === 'business'
              ? 'Record operational revenue, daily sales, material expenses, and shop overheads.'
              : 'Keep track of personal dividends, savings, household expenses, and daily wallet spends.'
          }
          actionLabel="+ Record Transaction"
          onAction={() => {
            setEditingEntry(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div className="space-y-4">
          {groupedEntries.map((group) => (
            <div key={group.date} className="space-y-2">
              <div className="px-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                <span>{group.dateLabel}</span>
                <span className="text-[11px] font-mono lowercase font-normal">{group.items.length} items</span>
              </div>

              <div className="space-y-2">
                {group.items.map((entry) => (
                  <FinanceEntryTile
                    key={entry.id}
                    entry={entry}
                    onEdit={() => handleEdit(entry)}
                    onDelete={() => deleteFinanceEntry(entry.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        aria-label="Add transaction"
        onClick={() => {
          setEditingEntry(null);
          setIsFormOpen(true);
        }}
        className="fixed bottom-20 sm:bottom-8 right-5 sm:right-8 z-30 w-13 h-13 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-zinc-400/40"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Entry Form Sheet */}
      <FinanceEntryFormSheet
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={handleFormSubmit}
        ledger={ledger}
        initialEntry={editingEntry}
      />
    </div>
  );
}
