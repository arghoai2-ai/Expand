import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import type { CustomerDue } from '../../types/index.ts';
import { CustomerDueTile } from './CustomerDueTile.tsx';
import { CustomerDueFormSheet } from './CustomerDueFormSheet.tsx';
import { SegmentedFilter } from '../common/SegmentedFilter.tsx';
import { AmountText } from '../common/AmountText.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { formatMinor } from '../../utils/money.ts';
import { HandCoins, Plus } from 'lucide-react';

export function CustomerDuesView() {
  const {
    activeCustomerDues,
    historyCustomerDues,
    outstandingCustomerDueTotal,
    addCustomerDue,
    updateCustomerDue,
    settleCustomerDue,
    revertCustomerDue,
    deleteCustomerDue,
    settings,
  } = useApp();

  const [filter, setFilter] = useState<'active' | 'history'>('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDue, setEditingDue] = useState<CustomerDue | null>(null);

  // Settlement Confirm State
  const [settlingDue, setSettlingDue] = useState<CustomerDue | null>(null);
  // Revert Confirm State
  const [revertingDue, setRevertingDue] = useState<CustomerDue | null>(null);
  // Delete Confirm State
  const [deletingDueId, setDeletingDueId] = useState<string | null>(null);

  const displayedDues = filter === 'active' ? activeCustomerDues : historyCustomerDues;

  const handleEdit = (due: CustomerDue) => {
    setEditingDue(due);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (
    data: Omit<CustomerDue, 'id' | 'notifBase' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingDue) {
      updateCustomerDue({
        ...editingDue,
        ...data,
      });
      setEditingDue(null);
    } else {
      addCustomerDue(data);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Total Outstanding Credit */}
      <div className="p-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-700/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
            Total Outstanding Credit
          </span>
          <div className="mt-0.5">
            <AmountText
              minorUnits={outstandingCustomerDueTotal}
              size="2xl"
              weight="bold"
              className="text-white"
            />
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-zinc-400">
            {activeCustomerDues.length} pending {activeCustomerDues.length !== 1 ? 'parties' : 'party'}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <SegmentedFilter
          options={[
            { label: 'Active', value: 'active', count: activeCustomerDues.length },
            { label: 'History', value: 'history', count: historyCustomerDues.length },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <span className="text-xs text-zinc-400 font-mono">
          {displayedDues.length} record{displayedDues.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Dues List */}
      {displayedDues.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title={filter === 'active' ? 'No outstanding dues' : 'No settled credit history'}
          description={
            filter === 'active'
              ? 'All accounts are clear. Record credit given to customers or buyers here.'
              : 'Settled dues will appear here once marked as paid.'
          }
          actionLabel={filter === 'active' ? '+ Record Customer Due' : undefined}
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
            <CustomerDueTile
              key={due.id}
              due={due}
              onMarkAsPaid={() => setSettlingDue(due)}
              onRevertToUnpaid={() => setRevertingDue(due)}
              onDelete={() => setDeletingDueId(due.id)}
              onEdit={() => handleEdit(due)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        aria-label="Add customer due"
        onClick={() => {
          setEditingDue(null);
          setIsFormOpen(true);
        }}
        className="fixed bottom-20 sm:bottom-8 right-5 sm:right-8 z-30 w-13 h-13 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-zinc-400/40"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Form Sheet */}
      <CustomerDueFormSheet
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDue(null);
        }}
        onSubmit={handleFormSubmit}
        initialDue={editingDue}
      />

      {/* Settlement Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!settlingDue}
        title="Mark Customer Due as Paid?"
        message={
          settlingDue
            ? `Mark ${formatMinor(
                settlingDue.amountMinor,
                settings.currencySymbol,
                settings.numberGrouping
              )} from ${settlingDue.customerName} as paid? It will be logged as Business Income.`
            : ''
        }
        confirmLabel="Confirm & Log Income"
        onConfirm={() => {
          if (settlingDue) {
            settleCustomerDue(settlingDue.id);
            setSettlingDue(null);
          }
        }}
        onCancel={() => setSettlingDue(null)}
      />

      {/* Revert Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!revertingDue}
        title="Revert to Unpaid?"
        message={
          revertingDue
            ? `Revert ${revertingDue.customerName}'s payment? The auto-logged Business Income entry will be removed.`
            : ''
        }
        confirmLabel="Revert to Unpaid"
        isDestructive={true}
        onConfirm={() => {
          if (revertingDue) {
            revertCustomerDue(revertingDue.id);
            setRevertingDue(null);
          }
        }}
        onCancel={() => setRevertingDue(null)}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingDueId}
        title="Delete Due Record?"
        message="Are you sure you want to delete this customer due record?"
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (deletingDueId) {
            deleteCustomerDue(deletingDueId);
            setDeletingDueId(null);
          }
        }}
        onCancel={() => setDeletingDueId(null)}
      />
    </div>
  );
}
