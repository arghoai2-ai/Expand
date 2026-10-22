import React, { useState } from 'react';
import type { ProductDue, PaymentStatus } from '../../types/index.ts';
import { StatusPill } from '../common/StatusPill.tsx';
import { formatDateLabel, formatTimeLabel, isDateTimeOverdue } from '../../utils/dates.ts';
import { Phone, CheckCircle2, RotateCcw, ChevronDown, PackageCheck } from 'lucide-react';

interface ProductDueTileProps {
  due: ProductDue;
  onToggleDelivered: () => void;
  onUpdatePaymentStatus: (status: PaymentStatus) => void;
  onDelete: () => void;
  onEdit: () => void;
}

export function ProductDueTile({
  due,
  onToggleDelivered,
  onUpdatePaymentStatus,
  onDelete,
  onEdit,
}: ProductDueTileProps) {
  const [showPaymentMenu, setShowPaymentMenu] = useState(false);
  const isDelivered = due.status === 'delivered';
  const isOverdue = !isDelivered && isDateTimeOverdue(due.commitmentAt);

  const commitmentDate = due.commitmentAt.slice(0, 10);
  const dateLabel = formatDateLabel(commitmentDate);
  const timeLabel = formatTimeLabel(due.commitmentAt);

  const paymentVariantMap: Record<PaymentStatus, 'danger' | 'warning' | 'success'> = {
    unpaid: 'danger',
    partial: 'warning',
    paid: 'success',
  };

  return (
    <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-750 transition-all space-y-3 shadow-2xs">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {due.productName}
            </h3>
            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              x{due.quantity}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {due.customerName}
            </span>
            <span className="flex items-center gap-1">
              <Phone size={11} />
              {due.contactInfo}
            </span>
          </div>

          <div className="pt-1 flex items-center gap-2">
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                isOverdue
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800'
              }`}
            >
              Commitment: {dateLabel} at {timeLabel}
            </span>
          </div>
        </div>

        {/* Tappable Payment Status Pill with dropdown menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowPaymentMenu(!showPaymentMenu)}
            className="flex items-center gap-1 focus:outline-none"
            aria-label="Change payment status"
          >
            <StatusPill
              label={due.paymentStatus.toUpperCase()}
              variant={paymentVariantMap[due.paymentStatus]}
              size="sm"
            />
            <ChevronDown size={12} className="text-zinc-400" />
          </button>

          {showPaymentMenu && (
            <div className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-20 py-1 text-xs">
              {(['unpaid', 'partial', 'paid'] as PaymentStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    onUpdatePaymentStatus(status);
                    setShowPaymentMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors uppercase font-medium ${
                    due.paymentStatus === status ? 'text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-500'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
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

        {!isDelivered ? (
          <button
            type="button"
            onClick={onToggleDelivered}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:opacity-90 active:scale-95 transition-all"
          >
            <PackageCheck size={14} strokeWidth={2.5} />
            <span>Mark Delivered</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleDelivered}
            className="px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Restore to Stock Pending</span>
          </button>
        )}
      </div>
    </div>
  );
}
