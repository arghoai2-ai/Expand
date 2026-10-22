import React, { useState, useEffect } from 'react';
import type { CustomerDue } from '../../types/index.ts';
import { FormSheet } from '../common/FormSheet.tsx';
import { getTodayDate } from '../../utils/dates.ts';
import { majorToMinor, minorToMajor } from '../../utils/money.ts';
import { useApp } from '../../context/AppContext.tsx';
import { Calendar, X } from 'lucide-react';

interface CustomerDueFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CustomerDue, 'id' | 'notifBase' | 'createdAt' | 'updatedAt'>) => void;
  initialDue?: CustomerDue | null;
}

export function CustomerDueFormSheet({
  isOpen,
  onClose,
  onSubmit,
  initialDue,
}: CustomerDueFormSheetProps) {
  const { settings } = useApp();
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [recordedDate, setRecordedDate] = useState(getTodayDate());
  const [expectedPaymentDate, setExpectedPaymentDate] = useState('');

  useEffect(() => {
    if (initialDue) {
      setCustomerName(initialDue.customerName || '');
      setMobileNumber(initialDue.mobileNumber || '');
      setAddress(initialDue.address || '');
      setAmountStr(initialDue.amountMinor ? String(minorToMajor(initialDue.amountMinor)) : '');
      setRecordedDate(initialDue.recordedDate || getTodayDate());
      setExpectedPaymentDate(initialDue.expectedPaymentDate || '');
    } else {
      setCustomerName('');
      setMobileNumber('');
      setAddress('');
      setAmountStr('');
      setRecordedDate(getTodayDate());
      setExpectedPaymentDate('');
    }
  }, [initialDue, isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // All fields are optional - compute minor amount safely without blocking on zero or empty
    const trimmedAmount = amountStr.trim();
    const minor = trimmedAmount ? majorToMinor(trimmedAmount) : 0;

    onSubmit({
      customerName: customerName.trim(),
      mobileNumber: mobileNumber.trim(),
      address: address.trim() || undefined,
      amountMinor: minor,
      recordedDate: recordedDate || getTodayDate(),
      expectedPaymentDate: expectedPaymentDate.trim(),
      status: initialDue ? initialDue.status : 'outstanding',
      settledAt: initialDue ? initialDue.settledAt : null,
      linkedEntryId: initialDue ? initialDue.linkedEntryId : null,
    });
    onClose();
  };

  return (
    <FormSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialDue ? 'Edit Customer Due' : 'Record Customer Due (Credit)'}
      subtitle="Track money owed. All fields are optional—save with any details available."
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
            {initialDue ? 'Save Changes' : 'Record Due'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Optional notice hint */}
        <div className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-zinc-500 text-[11px] flex items-center justify-between">
          <span>All fields are optional. Leave any empty if not known.</span>
          <span className="font-mono text-[10px] text-zinc-400">Instant Save</span>
        </div>

        {/* Customer Name - Optional, No Asterisk, No Required */}
        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Customer / Store Name
          </label>
          <input
            type="text"
            autoFocus
            placeholder="e.g. Karim Traders / Tariqul Islam (Optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        {/* Mobile & Address - Both Optional, No Asterisks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              placeholder="+880 1711-... (Optional)"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Address / Location
            </label>
            <input
              type="text"
              placeholder="Shop #, Market, Area (Optional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
        </div>

        {/* Amount Due - Optional */}
        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Amount Due ({settings.currencySymbol})
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="0.00 (Optional)"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-mono text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
        </div>

        {/* Dates - Both Optional, No Asterisks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Date Given
            </label>
            <input
              type="date"
              value={recordedDate}
              onChange={(e) => setRecordedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-medium text-zinc-700 dark:text-zinc-300">
                Expected Payment Date
              </label>
              {expectedPaymentDate && (
                <button
                  type="button"
                  onClick={() => setExpectedPaymentDate('')}
                  className="text-[10px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-0.5"
                >
                  <X size={10} /> Clear
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="date"
                value={expectedPaymentDate}
                onChange={(e) => setExpectedPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
          </div>
        </div>
      </form>
    </FormSheet>
  );
}
