import React from 'react';
import type { Order } from '../../types/index.ts';
import { CheckCircle } from '../common/CheckCircle.tsx';
import { formatDateLabel, isDateOverdue } from '../../utils/dates.ts';
import { Image as ImageIcon } from 'lucide-react';

interface OrderTileProps {
  order: Order;
  onToggleComplete: () => void;
  onOpenDetail: () => void;
}

export function OrderTile({ order, onToggleComplete, onOpenDetail }: OrderTileProps) {
  const isOverdue = order.status === 'active' && isDateOverdue(order.deliveryTargetDate);
  const deliveryLabel = formatDateLabel(order.deliveryTargetDate);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpenDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetail();
        }
      }}
      className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-750 transition-all flex items-start gap-3 text-left group shadow-2xs"
    >
      <div className="pt-0.5">
        <CheckCircle
          checked={order.status === 'completed'}
          onToggle={onToggleComplete}
          ariaLabel={`Mark order for ${order.customerName} as ${order.status === 'completed' ? 'active' : 'completed'}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate ${
              order.status === 'completed' ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
            }`}
          >
            {order.customerName}
          </h3>

          <span
            className={`text-xs font-medium shrink-0 px-2 py-0.5 rounded-md ${
              isOverdue
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-semibold'
                : 'text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800'
            }`}
          >
            {deliveryLabel}
          </span>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-1 leading-snug">
          {order.description}
        </p>

        {order.receiptFiles.length > 0 && (
          <div className="flex items-center gap-1 mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            <ImageIcon size={13} className="shrink-0" />
            <span>
              {order.receiptFiles.length} photo{order.receiptFiles.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
