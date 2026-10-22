import React, { useState, useEffect } from 'react';
import type { FinanceEntry, Ledger, EntryType } from '../../types/index.ts';
import { FormSheet } from '../common/FormSheet.tsx';
import { getTodayDate } from '../../utils/dates.ts';
import { majorToMinor, minorToMajor } from '../../utils/money.ts';
import { useApp } from '../../context/AppContext.tsx';
import { BUSINESS_FINANCE_LABELS, PERSONAL_FINANCE_LABELS } from '../../core/constants.ts';

interface FinanceEntryFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<FinanceEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  ledger: Ledger;
  initialEntry?: FinanceEntry | null;
}

export function FinanceEntryFormSheet({
  isOpen,
  onClose,
  onSubmit,
  ledger,
  initialEntry,
}: FinanceEntryFormSheetProps) {
  const { settings, financeEntries } = useApp();
  const [type, setType] = useState<EntryType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [label, setLabel] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getTodayDate());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isBusiness = ledger === 'business';
  const labelConfig = isBusiness ? BUSINESS_FINANCE_LABELS : PERSONAL_FINANCE_LABELS;

  // Derive most frequently used labels for this ledger & type
  const suggestionChips = React.useMemo(() => {
    const defaultList = type === 'income' ? labelConfig.incomeSources : labelConfig.expenseCategories;

    const frequencyMap: Record<string, number> = {};
    financeEntries
      .filter((e) => e.ledger === ledger && e.type === type && !e.linkedDueId)
      .forEach((e) => {
        frequencyMap[e.label] = (frequencyMap[e.label] || 0) + 1;
      });

    const userTopLabels = Object.keys(frequencyMap).sort(
      (a, b) => frequencyMap[b] - frequencyMap[a]
    );

    // Merge default and user top labels (deduplicated)
    const combined = Array.from(new Set([...userTopLabels.slice(0, 4), ...defaultList]));
    return combined.slice(0, 8);
  }, [financeEntries, ledger, type, labelConfig]);

  useEffect(() => {
    if (initialEntry) {
      setType(initialEntry.type);
      setAmountStr(String(minorToMajor(initialEntry.amountMinor)));
      setLabel(initialEntry.label);
      setNote(initialEntry.note || '');
      setDate(initialEntry.date);
    } else {
      setType('expense');
      setAmountStr('');
      setLabel('');
      setNote('');
      setDate(getTodayDate());
    }
    setErrors({});
  }, [initialEntry, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    const minor = majorToMinor(amountStr);
    if (minor <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }
    if (!label.trim()) {
      newErrors.label = type === 'income' ? 'Income source is required' : 'Expense category is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ledger,
      type,
      amountMinor: minor,
      label: label.trim(),
      note: note.trim() || undefined,
      date,
      linkedDueId: initialEntry ? initialEntry.linkedDueId : null,
    });
    onClose();
  };

  return (
    <FormSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialEntry ? 'Edit Finance Record' : `New ${isBusiness ? 'Business' : 'Personal'} Entry`}
      subtitle={isBusiness ? 'Operating cashflow & shop ledger' : 'Personal wallet & life ledger'}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 active:scale-95 transition-all shadow-xs"
          >
            {initialEntry ? 'Save Record' : 'Record Transaction'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Income / Expense Switcher */}
        <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 rounded-lg font-semibold transition-all ${
              type === 'income'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            + Income
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 rounded-lg font-semibold transition-all ${
              type === 'expense'
                ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            - Expense
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Amount ({settings.currencySymbol}) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-base font-semibold">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              step="any"
              min="0"
              required
              autoFocus
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => {
                setAmountStr(e.target.value);
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
              }}
              className={`w-full pl-9 pr-3 py-2.5 rounded-lg border bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-mono text-base font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-400 ${
                errors.amount ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-700'
              }`}
            />
          </div>
          {errors.amount && <p className="text-[11px] text-rose-500 mt-1">{errors.amount}</p>}
        </div>

        {/* Label (Source or Category) */}
        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            {type === 'income' ? 'Income Source' : 'Expense Category'} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder={type === 'income' ? 'e.g. Retail Sales' : 'e.g. Raw Materials / Shop Rent'}
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              if (errors.label) setErrors((prev) => ({ ...prev, label: '' }));
            }}
            className={`w-full px-3 py-2 rounded-lg border bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 ${
              errors.label ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-700'
            }`}
          />
          {errors.label && <p className="text-[11px] text-rose-500 mt-1">{errors.label}</p>}

          {/* Suggestion Chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {suggestionChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setLabel(chip);
                  if (errors.label) setErrors((prev) => ({ ...prev, label: '' }));
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  label === chip
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Note & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="Voucher #, memo, details..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
        </div>
      </form>
    </FormSheet>
  );
}
