import React, { useState } from 'react';
import type { Order } from '../../types/index.ts';
import { StatusPill } from '../common/StatusPill.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';
import { ReceiptViewer } from '../common/ReceiptViewer.tsx';
import { formatDateLabel, isDateOverdue } from '../../utils/dates.ts';
import { X, Calendar, Edit3, Trash2, CheckCircle2, RotateCcw, Image as ImageIcon } from 'lucide-react';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (order: Order) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onEdit,
  onToggleComplete,
  onDelete,
}: OrderDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  if (!isOpen || !order) return null;

  const isOverdue = order.status === 'active' && isDateOverdue(order.deliveryTargetDate);
  const deliveryLabel = formatDateLabel(order.deliveryTargetDate);

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    onDelete(order.id);
    onClose();
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusPill
                label={order.status === 'active' ? (isOverdue ? 'Overdue' : 'Active') : 'Completed'}
                variant={order.status === 'completed' ? 'success' : isOverdue ? 'danger' : 'neutral'}
              />
              <span className="text-xs text-zinc-400 font-mono">#{order.id.slice(-6)}</span>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 overflow-y-auto">
            <div>
              <h2 id="order-detail-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {order.customerName}
              </h2>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2 leading-relaxed whitespace-pre-wrap">
                {order.description}
              </p>
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs">
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 block mb-1">Order Date</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Calendar size={13} className="text-zinc-400" />
                  {order.orderDate}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 block mb-1">Target Delivery</span>
                <span
                  className={`font-semibold flex items-center gap-1.5 ${
                    isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <Calendar size={13} className="text-zinc-400" />
                  {order.deliveryTargetDate} ({deliveryLabel})
                </span>
              </div>
            </div>

            {/* Receipts Gallery */}
            {order.receiptFiles.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <ImageIcon size={14} /> Attached Receipts ({order.receiptFiles.length})
                  </span>
                  <span className="text-[11px] text-zinc-400">Tap to view</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {order.receiptFiles.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setViewerIndex(idx);
                        setViewerOpen(true);
                      }}
                      className="aspect-square rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:opacity-90 active:scale-95 transition-all bg-zinc-100 dark:bg-zinc-800"
                    >
                      <img src={img} alt={`Receipt ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              Delete
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(order);
                }}
                className="px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Edit3 size={14} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleComplete(order.id);
                  onClose();
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all text-white shadow-xs ${
                  order.status === 'active'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-200 dark:text-zinc-900'
                }`}
              >
                {order.status === 'active' ? (
                  <>
                    <CheckCircle2 size={14} /> Mark Completed
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} /> Restore to Active
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Order?"
        message="This order and all attached receipts will be permanently removed. This cannot be undone."
        confirmLabel="Delete Permanently"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ReceiptViewer
        isOpen={viewerOpen}
        images={order.receiptFiles}
        initialIndex={viewerIndex}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}
