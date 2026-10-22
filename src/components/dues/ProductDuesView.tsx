import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import type { ProductDue } from '../../types/index.ts';
import { ProductDueTile } from './ProductDueTile.tsx';
import { ProductDueFormSheet } from './ProductDueFormSheet.tsx';
import { SegmentedFilter } from '../common/SegmentedFilter.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { Package, Plus } from 'lucide-react';

export function ProductDuesView() {
  const {
    activeProductDues,
    historyProductDues,
    addProductDue,
    updateProductDue,
    toggleProductDueDelivered,
    updateProductDuePaymentStatus,
    deleteProductDue,
  } = useApp();

  const [filter, setFilter] = useState<'active' | 'history'>('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDue, setEditingDue] = useState<ProductDue | null>(null);
  const [deletingDueId, setDeletingDueId] = useState<string | null>(null);

  const displayedDues = filter === 'active' ? activeProductDues : historyProductDues;

  const handleEdit = (due: ProductDue) => {
    setEditingDue(due);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (
    data: Omit<ProductDue, 'id' | 'notifBase' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingDue) {
      updateProductDue({
        ...editingDue,
        ...data,
      });
      setEditingDue(null);
    } else {
      addProductDue(data);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between">
        <SegmentedFilter
          options={[
            { label: 'Active', value: 'active', count: activeProductDues.length },
            { label: 'History', value: 'history', count: historyProductDues.length },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <span className="text-xs text-zinc-400 font-mono">
          {displayedDues.length} item{displayedDues.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Product Dues List */}
      {displayedDues.length === 0 ? (
        <EmptyState
          icon={Package}
          title={filter === 'active' ? 'No pending product dues' : 'No delivered history'}
          description={
            filter === 'active'
              ? 'Record out-of-stock items promised to customers with target delivery dates.'
              : 'Delivered customer backorders will appear here.'
          }
          actionLabel={filter === 'active' ? '+ Log Product Due' : undefined}
          onAction={
            filter === 'active'
              ? () => {
                  setEditingDue(null);
                  setIsFormOpen(true);
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {displayedDues.map((due) => (
            <ProductDueTile
              key={due.id}
              due={due}
              onToggleDelivered={() => toggleProductDueDelivered(due.id)}
              onUpdatePaymentStatus={(status) => updateProductDuePaymentStatus(due.id, status)}
              onDelete={() => setDeletingDueId(due.id)}
              onEdit={() => handleEdit(due)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        aria-label="Add product due"
        onClick={() => {
          setEditingDue(null);
          setIsFormOpen(true);
        }}
        className="fixed bottom-20 sm:bottom-8 right-5 sm:right-8 z-30 w-13 h-13 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-zinc-400/40"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Form Sheet */}
      <ProductDueFormSheet
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDue(null);
        }}
        onSubmit={handleFormSubmit}
        initialDue={editingDue}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingDueId}
        title="Delete Backorder Record?"
        message="Are you sure you want to delete this product commitment record?"
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (deletingDueId) {
            deleteProductDue(deletingDueId);
            setDeletingDueId(null);
          }
        }}
        onCancel={() => setDeletingDueId(null)}
      />
    </div>
  );
}
