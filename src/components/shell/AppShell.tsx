import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import type { AppWindow, Order } from '../../types/index.ts';
import { OrdersView } from '../orders/OrdersView.tsx';
import { DuesScreen } from '../dues/DuesScreen.tsx';
import { ShopTasksScreen } from '../shop_tasks/ShopTasksScreen.tsx';
import { FinanceScreen } from '../finance/FinanceScreen.tsx';
import { PersonalTasksScreen } from '../personal_tasks/PersonalTasksScreen.tsx';
import { SearchScreen } from '../search/SearchScreen.tsx';
import { SettingsSheet } from './SettingsSheet.tsx';
import { FlutterCodeModal } from './FlutterCodeModal.tsx';
import { OrderDetailModal } from '../orders/OrderDetailModal.tsx';
import { AppSnack } from '../common/AppSnack.tsx';
import {
  ShoppingBag,
  HandCoins,
  CheckSquare,
  Receipt,
  Sparkles,
  Search,
  MoreVertical,
  Building2,
  User,
} from 'lucide-react';

export function AppShell() {
  const {
    activeWindow,
    setActiveWindow,
    settings,
    updateSettings,
    activeOrders,
    activeCustomerDues,
    activeProductDues,
    stockOutItems,
    pendingShopTasks,
    pendingPersonalTasks,
    toggleOrderComplete,
    deleteOrder,
    updateOrder,
  } = useApp();

  const businessTab = settings.lastBusinessTab;
  const personalTab = settings.lastPersonalTab;

  const setBusinessTab = (tabIndex: number) => {
    updateSettings({ lastBusinessTab: tabIndex });
  };

  const setPersonalTab = (tabIndex: number) => {
    updateSettings({ lastPersonalTab: tabIndex });
  };

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFlutterExportOpen, setIsFlutterExportOpen] = useState(false);
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);

  const duesBadgeCount = activeCustomerDues.length + activeProductDues.length + stockOutItems.length;

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col justify-between text-zinc-900 dark:text-zinc-100 selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-900">
      {/* Outer Max-Width Responsive Container */}
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col bg-white dark:bg-zinc-950 sm:border-x border-zinc-200/80 dark:border-zinc-800 shadow-xl relative min-h-screen">
        {/* Top App Bar with Dual-Window Switcher */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 py-3 flex items-center justify-between gap-3">
          {/* Brand mark */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-extrabold tracking-tighter text-sm uppercase text-zinc-900 dark:text-zinc-100">
              Expand
            </span>
          </div>

          {/* Compact Dual-Window Switcher: Business | Personal */}
          <div
            role="tablist"
            aria-label="Window Switcher"
            className="flex p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-semibold"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeWindow === 'business'}
              onClick={() => setActiveWindow('business')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeWindow === 'business'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
              }`}
            >
              <Building2 size={13} />
              <span>Business</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeWindow === 'personal'}
              onClick={() => setActiveWindow('personal')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeWindow === 'personal'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
              }`}
            >
              <User size={13} />
              <span>Personal</span>
            </button>
          </div>

          {/* Right Header Actions: Search & Settings */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              aria-label={`Search ${activeWindow} window`}
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              aria-label="Settings and preferences"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <MoreVertical size={18} />
            </button>
          </div>
        </header>

        {/* Main Tab Body Content */}
        <main className="flex-1 p-4 pb-28">
          {activeWindow === 'business' ? (
            <div>
              {businessTab === 0 && <OrdersView />}
              {businessTab === 1 && <DuesScreen />}
              {businessTab === 2 && <ShopTasksScreen />}
              {businessTab === 3 && <FinanceScreen ledger="business" />}
            </div>
          ) : (
            <div>
              {personalTab === 0 && <PersonalTasksScreen />}
              {personalTab === 1 && <FinanceScreen ledger="personal" />}
            </div>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <nav
          role="navigation"
          aria-label="Main Navigation"
          className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-zinc-800"
        >
          <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-around">
            {activeWindow === 'business' ? (
              <>
                {/* 1. Orders */}
                <button
                  type="button"
                  onClick={() => setBusinessTab(0)}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all relative ${
                    businessTab === 0
                      ? 'text-zinc-950 dark:text-zinc-50 font-bold'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-medium'
                  }`}
                >
                  <ShoppingBag size={20} strokeWidth={businessTab === 0 ? 2.5 : 2} />
                  <span className="text-[11px]">Orders</span>
                  {activeOrders.length > 0 && (
                    <span className="absolute top-0.5 right-1.5 w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                  )}
                </button>

                {/* 2. Dues */}
                <button
                  type="button"
                  onClick={() => setBusinessTab(1)}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all relative ${
                    businessTab === 1
                      ? 'text-zinc-950 dark:text-zinc-50 font-bold'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-medium'
                  }`}
                >
                  <HandCoins size={20} strokeWidth={businessTab === 1 ? 2.5 : 2} />
                  <span className="text-[11px]">Dues</span>
                  {duesBadgeCount > 0 && (
                    <span className="absolute top-0.5 right-1 text-[9px] px-1 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-mono">
                      {duesBadgeCount}
                    </span>
                  )}
                </button>

                {/* 3. Shop Tasks */}
                <button
                  type="button"
                  onClick={() => setBusinessTab(2)}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all relative ${
                    businessTab === 2
                      ? 'text-zinc-950 dark:text-zinc-50 font-bold'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-medium'
                  }`}
                >
                  <CheckSquare size={20} strokeWidth={businessTab === 2 ? 2.5 : 2} />
                  <span className="text-[11px]">Tasks</span>
                  {pendingShopTasks.length > 0 && (
                    <span className="absolute top-0.5 right-1.5 w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                  )}
                </button>

                {/* 4. Business Finance */}
                <button
                  type="button"
                  onClick={() => setBusinessTab(3)}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
                    businessTab === 3
                      ? 'text-zinc-950 dark:text-zinc-50 font-bold'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-medium'
                  }`}
                >
                  <Receipt size={20} strokeWidth={businessTab === 3 ? 2.5 : 2} />
                  <span className="text-[11px]">Finance</span>
                </button>
              </>
            ) : (
              <>
                {/* Personal Window: Tasks | Finance */}
                {/* 1. Life / Routine Tasks */}
                <button
                  type="button"
                  onClick={() => setPersonalTab(0)}
                  className={`flex flex-col items-center gap-1 py-1 px-8 rounded-lg transition-all relative ${
                    personalTab === 0
                      ? 'text-zinc-950 dark:text-zinc-50 font-bold'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-medium'
                  }`}
                >
                  <Sparkles size={20} strokeWidth={personalTab === 0 ? 2.5 : 2} />
                  <span className="text-[11px]">Routines & Goals</span>
                  {pendingPersonalTasks.length > 0 && (
                    <span className="absolute top-0.5 right-6 w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                  )}
                </button>

                {/* 2. Personal Finance */}
                <button
                  type="button"
                  onClick={() => setPersonalTab(1)}
                  className={`flex flex-col items-center gap-1 py-1 px-8 rounded-lg transition-all ${
                    personalTab === 1
                      ? 'text-zinc-950 dark:text-zinc-50 font-bold'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-medium'
                  }`}
                >
                  <Receipt size={20} strokeWidth={personalTab === 1 ? 2.5 : 2} />
                  <span className="text-[11px]">Personal Finance</span>
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Floating Snack with Undo */}
      <AppSnack />

      {/* Search Modal */}
      <SearchScreen
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        windowMode={activeWindow}
        onSelectOrder={(order) => {
          setInspectedOrder(order);
        }}
      />

      {/* Settings Sheet */}
      <SettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenFlutterExport={() => setIsFlutterExportOpen(true)}
      />

      {/* Flutter Dart Code Export Modal */}
      <FlutterCodeModal
        isOpen={isFlutterExportOpen}
        onClose={() => setIsFlutterExportOpen(false)}
      />

      {/* Order Detail Modal when chosen from search */}
      {inspectedOrder && (
        <OrderDetailModal
          order={inspectedOrder}
          isOpen={!!inspectedOrder}
          onClose={() => setInspectedOrder(null)}
          onEdit={(order) => {
            updateOrder(order);
          }}
          onToggleComplete={toggleOrderComplete}
          onDelete={deleteOrder}
        />
      )}
    </div>
  );
}
