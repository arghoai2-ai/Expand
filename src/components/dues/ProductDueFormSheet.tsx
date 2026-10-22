import React, { useState, useEffect } from 'react';
import type { ProductDue, PaymentStatus } from '../../types/index.ts';
import { FormSheet } from '../common/FormSheet.tsx';
import { getTodayDate } from '../../utils/dates.ts';

interface ProductDueFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ProductDue, 'id' | 'notifBase' | 'createdAt' | 'updatedAt'>) => void;
  initialDue?: ProductDue | null;
}

export function ProductDueFormSheet({
  isOpen,
  onClose,
  onSubmit,
  initialDue,
}: ProductDueFormSheetProps) {
  const [customerName, setCustomerName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [commitmentDate, setCommitmentDate] = useState(getTodayDate());
  const [commitmentTime, setCommitmentTime] = useState('17:00');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialDue) {
      setCustomerName(initialDue.customerName);
      setContactInfo(initialDue.contactInfo);
      setProductName(initialDue.productName);
      setQuantity(initialDue.quantity);
      if (initialDue.commitmentAt.includes('T')) {
        const [d, t] = initialDue.commitmentAt.split('T');
        setCommitmentDate(d);
        setCommitmentTime(t.slice(0, 5));
      }
      setPaymentStatus(initialDue.paymentStatus);
    } else {
      setCustomerName('');
      setContactInfo('');
      setProductName('');
      setQuantity(1);
      setCommitmentDate(getTodayDate());
      setCommitmentTime('17:00');
      setPaymentStatus('unpaid');
    }
    setErrors({});
  }, [initialDue, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!contactInfo.trim()) {
      newErrors.contactInfo = 'Contact info is required';
    }
    if (!productName.trim()) {
      newErrors.productName = 'Product name is required';
    }
    if (quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }
    if (!commitmentDate) {
      newErrors.commitmentDate = 'Commitment date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const commitmentAt = `${commitmentDate}T${commitmentTime}:00`;

    onSubmit({
      customerName: customerName.trim(),
      contactInfo: contactInfo.trim(),
      productName: productName.trim(),
      quantity,
      commitmentAt,
      paymentStatus,
      status: initialDue ? initialDue.status : 'pendingStock',
      deliveredAt: initialDue ? initialDue.deliveredAt : null,
    });
    onClose();
  };

  return (
    <FormSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialDue ? 'Edit Product Due' : 'Log Product Due / Backorder'}
      subtitle="Track out-of-stock items promised to customers"
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
            {initialDue ? 'Save Changes' : 'Record Backorder'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Product Name & Quantity */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Leather Bag / Shears 10-inch"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                if (errors.productName) setErrors((prev) => ({ ...prev, productName: '' }));
              }}
              className={`w-full px-3 py-2 rounded-lg border bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 ${
                errors.productName ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-700'
              }`}
            />
            {errors.productName && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.productName}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Quantity <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => {
                setQuantity(Math.max(1, parseInt(e.target.value) || 1));
                if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }));
              }}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-mono text-center focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
        </div>

        {/* Customer & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Customer Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: '' }));
              }}
              className={`w-full px-3 py-2 rounded-lg border bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 ${
                errors.customerName ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-700'
              }`}
            />
            {errors.customerName && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Contact Info <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Mobile / WhatsApp / Notes"
              value={contactInfo}
              onChange={(e) => {
                setContactInfo(e.target.value);
                if (errors.contactInfo) setErrors((prev) => ({ ...prev, contactInfo: '' }));
              }}
              className={`w-full px-3 py-2 rounded-lg border bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 ${
                errors.contactInfo ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-700'
              }`}
            />
            {errors.contactInfo && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.contactInfo}</p>
            )}
          </div>
        </div>

        {/* Commitment Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Commitment Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={commitmentDate}
              onChange={(e) => setCommitmentDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Commitment Time
            </label>
            <input
              type="time"
              value={commitmentTime}
              onChange={(e) => setCommitmentTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Payment Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['unpaid', 'partial', 'paid'] as PaymentStatus[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setPaymentStatus(status)}
                className={`py-2 rounded-lg border text-xs font-semibold uppercase transition-all ${
                  paymentStatus === status
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </form>
    </FormSheet>
  );
}
