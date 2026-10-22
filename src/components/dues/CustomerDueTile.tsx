import React from 'react';
import type { CustomerDue } from '../../types/index.ts';
import { AmountText } from '../common/AmountText.tsx';
import { formatDateLabel, isDateOverdue } from '../../utils/dates.ts';
import { Phone, MapPin, Check, RotateCcw, Trash2 } from 'lucide-react';

interface CustomerDueTileProps {
  due: CustomerDue;
  onMarkAsPaid: () => void;
  onRevertToUnpaid: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export function CustomerDueTile({
  due,
  onMarkAsPaid,
  onRevertToUnpaid,
  onDelete,
  onEdit,
}: CustomerDueTileProps) {
  const isSettled = due.status === 'settled';
  const isOverdue = !isSettled && isDateOverdue(due.expectedPaymentDate);
  const paymentDateLabel = formatDateLabel(due.expectedPaymentDate);
  const settledDateLabel = due.settledAt ? formatDateLabel(due.settledAt.slice(0, 10)) : '';

  return (
    <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-750 transition-all space-y-3 shadow-2xs">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {due.customerName || 'Unnamed Customer'}
            </h3>
            {isSettled ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Settled {settledDateLabel}
              </span>
            ) : paymentDateLabel ? (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  isOverdue
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-semibold'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                Due {paymentDateLabel}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
            {due.mobileNumber ? (
              <a
                href={`tel:${due.mobileNumber}`}
                className="flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                <Phone size={12} />
                <span>{due.mobileNumber}</span>
              </a>
            ) : (
              <span className="text-[11px] text-zinc-400 italic">No contact number</span>
            )}
            {due.address && (
              <span className="flex items-center gap-1 truncate max-w-[200px]">
                <MapPin size={12} />
                <span className="truncate">{due.address}</span>
              </span>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <AmountText
            minorUnits={due.amountMinor}
            size="lg"
            weight="bold"
            className={isSettled ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}
          />
          <span className="block text-[10px] text-zinc-400 mt-0.5">
            Recorded {due.recordedDate}
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-rose-600/80 hover:text-rose-700 dark:hover:text-rose-400 px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            Delete
          </button>
        </div>

        {!isSettled ? (
          <button
            type="button"
            onClick={onMarkAsPaid}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:opacity-90 active:scale-95 transition-all"
          >
            <Check size={14} strokeWidth={2.5} />
            <span>Mark as Paid</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onRevertToUnpaid}
            className="px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Revert to Unpaid</span>
          </button>
        )}
      </div>
    </div>
  );
}
