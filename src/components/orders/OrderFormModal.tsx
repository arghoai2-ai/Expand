import React, { useState, useEffect } from 'react';
import type { Order } from '../../types/index.ts';
import { FormSheet } from '../common/FormSheet.tsx';
import { ReceiptAttachmentField } from '../common/ReceiptAttachmentField.tsx';
import { getTodayDate, getTomorrowDate } from '../../utils/dates.ts';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: Omit<Order, 'id' | 'notifBase' | 'createdAt' | 'updatedAt'>) => void;
  initialOrder?: Order | null;
}

export function OrderFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialOrder,
}: OrderFormModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [description, setDescription] = useState('');
  const [orderDate, setOrderDate] = useState(getTodayDate());
  const [deliveryTargetDate, setDeliveryTargetDate] = useState(getTomorrowDate());
  const [receiptFiles, setReceiptFiles] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialOrder) {
      setCustomerName(initialOrder.customerName);
      setDescription(initialOrder.description);
      setOrderDate(initialOrder.orderDate);
      setDeliveryTargetDate(initialOrder.deliveryTargetDate);
      setReceiptFiles(initialOrder.receiptFiles);
    } else {
      setCustomerName('');
      setDescription('');
      setOrderDate(getTodayDate());
      setDeliveryTargetDate(getTomorrowDate());
      setReceiptFiles([]);
    }
    setErrors({});
  }, [initialOrder, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Order description is required';
    }
    if (deliveryTargetDate < orderDate) {
      newErrors.deliveryTargetDate = 'Delivery date cannot be before order date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      customerName: customerName.trim(),
      description: description.trim(),
      orderDate,
      deliveryTargetDate,
      receiptFiles,
      status: initialOrder ? initialOrder.status : 'active',
      completedAt: initialOrder ? initialOrder.completedAt : null,
    });
    onClose();
  };

  return (
    <FormSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialOrder ? 'Edit Order' : 'New Commercial Order'}
      subtitle="Track customer order specifications and delivery target"
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
            {initialOrder ? 'Save Changes' : 'Create Order'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Customer Name */}
        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Customer Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder="e.g. Apex Outfits / Rahim Khan"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: '' }));
            }}
            className={`w-full px-3 py-2 rounded-lg border bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all ${
              errors.customerName ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-700'
            }`}
          />
          {errors.customerName && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.customerName}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Description & Specs <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Details, quantities, materials, custom notes..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            className={`w-full px-3 py-2 rounded-lg border bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all resize-none ${
              errors.description ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-700'
            }`}
          />
          {errors.description && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Date Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Order Date
            </label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Delivery Target Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={deliveryTargetDate}
              min={orderDate}
              onChange={(e) => {
                setDeliveryTargetDate(e.target.value);
                if (errors.deliveryTargetDate) setErrors((prev) => ({ ...prev, deliveryTargetDate: '' }));
              }}
              className={`w-full px-3 py-2 rounded-lg border bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 ${
                errors.deliveryTargetDate ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-700'
              }`}
            />
            {errors.deliveryTargetDate && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.deliveryTargetDate}</p>
            )}
          </div>
        </div>

        {/* Receipt Attachments */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <ReceiptAttachmentField receipts={receiptFiles} onChange={setReceiptFiles} />
        </div>
      </form>
    </FormSheet>
  );
}
