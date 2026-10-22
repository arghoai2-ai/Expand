import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import type { Order } from '../../types/index.ts';
import { SegmentedFilter } from '../common/SegmentedFilter.tsx';
import { OrderTile } from './OrderTile.tsx';
import { OrderDetailModal } from './OrderDetailModal.tsx';
import { OrderFormModal } from './OrderFormModal.tsx';
import { EmptyState } from '../common/EmptyState.tsx';
import { ShoppingBag, Plus } from 'lucide-react';

export function OrdersView() {
  const {
    activeOrders,
    archivedOrders,
    addOrder,
    updateOrder,
    toggleOrderComplete,
    deleteOrder,
  } = useApp();

  const [filter, setFilter] = useState<'active' | 'archive'>('active');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const displayedOrders = filter === 'active' ? activeOrders : archivedOrders;

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Omit<Order, 'id' | 'notifBase' | 'createdAt' | 'updatedAt'>) => {
    if (editingOrder) {
      updateOrder({
        ...editingOrder,
        ...data,
      });
      setEditingOrder(null);
    } else {
      addOrder(data);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between">
        <SegmentedFilter
          options={[
            { label: 'Active', value: 'active', count: activeOrders.length },
            { label: 'Archive', value: 'archive', count: archivedOrders.length },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <span className="text-xs text-zinc-400 font-mono">
          {displayedOrders.length} order{displayedOrders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={filter === 'active' ? 'No active orders' : 'No archived orders'}
          description={
            filter === 'active'
              ? 'New commercial orders with delivery targets and receipts will appear here.'
              : 'Completed orders are preserved in your archive.'
          }
          actionLabel={filter === 'active' ? '+ Add Order' : undefined}
          onAction={
            filter === 'active'
              ? () => {
                  setEditingOrder(null);
                  setIsFormOpen(true);
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-2.5">
          {displayedOrders.map((order) => (
            <OrderTile
              key={order.id}
              order={order}
              onToggleComplete={() => toggleOrderComplete(order.id)}
              onOpenDetail={() => handleOpenDetail(order)}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        aria-label="Create new order"
        onClick={() => {
          setEditingOrder(null);
          setIsFormOpen(true);
        }}
        className="fixed bottom-20 sm:bottom-8 right-5 sm:right-8 z-30 w-13 h-13 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-zinc-400/40"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }}
        onEdit={handleEdit}
        onToggleComplete={toggleOrderComplete}
        onDelete={deleteOrder}
      />

      {/* Form Modal */}
      <OrderFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingOrder(null);
        }}
        onSubmit={handleFormSubmit}
        initialOrder={editingOrder}
      />
    </div>
  );
}
