import React, { useState } from 'react';
import { CustomerDuesView } from './CustomerDuesView.tsx';
import { ProductDuesView } from './ProductDuesView.tsx';
import { EmergencyStockOutView } from '../stock_out/EmergencyStockOutView.tsx';
import { useApp } from '../../context/AppContext.tsx';

export function DuesScreen() {
  const [activeTab, setActiveTab] = useState<'customer' | 'product' | 'emergency'>('customer');
  const { activeCustomerDues, activeProductDues, stockOutItems } = useApp();

  return (
    <div className="space-y-4">
      {/* Top TabBar: Customer Dues | Product Dues | Emergency Restock */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-none">
        <div className="flex gap-4 sm:gap-6 min-w-max pb-0.5">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'customer'}
            onClick={() => setActiveTab('customer')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'customer'
                ? 'text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <span>Customer Dues</span>
            {activeCustomerDues.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {activeCustomerDues.length}
              </span>
            )}
            {activeTab === 'customer' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'product'}
            onClick={() => setActiveTab('product')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'product'
                ? 'text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <span>Product Backorders</span>
            {activeProductDues.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {activeProductDues.length}
              </span>
            )}
            {activeTab === 'product' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'emergency'}
            onClick={() => setActiveTab('emergency')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'emergency'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <span>Emergency Restock</span>
            {stockOutItems.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                {stockOutItems.length}
              </span>
            )}
            {activeTab === 'emergency' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 dark:bg-rose-400 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Screen Body */}
      {activeTab === 'customer' && <CustomerDuesView />}
      {activeTab === 'product' && <ProductDuesView />}
      {activeTab === 'emergency' && <EmergencyStockOutView />}
    </div>
  );
}
