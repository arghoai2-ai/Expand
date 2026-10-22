import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import type { AppWindow, Order, CustomerDue, ProductDue, ShopTask, PersonalTask, FinanceEntry, StockOutItem } from '../../types/index.ts';
import { AmountText } from '../common/AmountText.tsx';
import { formatDateLabel } from '../../utils/dates.ts';
import { Search, X, ShoppingBag, HandCoins, Package, CheckSquare, Sparkles, Receipt, AlertCircle } from 'lucide-react';

interface SearchScreenProps {
  isOpen: boolean;
  onClose: () => void;
  windowMode: AppWindow;
  onSelectOrder?: (order: Order) => void;
}

type SearchResults =
  | {
      mode: 'business';
      orders: Order[];
      customerDues: CustomerDue[];
      productDues: ProductDue[];
      shopTasks: ShopTask[];
      stockOutItems: StockOutItem[];
      finance: FinanceEntry[];
      total: number;
    }
  | {
      mode: 'personal';
      personalTasks: PersonalTask[];
      finance: FinanceEntry[];
      total: number;
    };

export function SearchScreen({ isOpen, onClose, windowMode, onSelectOrder }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const {
    orders,
    customerDues,
    productDues,
    shopTasks,
    personalTasks,
    financeEntries,
    stockOutItems,
  } = useApp();

  const q = query.trim().toLowerCase();

  const searchResults = useMemo<SearchResults | null>(() => {
    if (!q) return null;

    if (windowMode === 'business') {
      const matchedOrders = orders.filter(
        (o) => o.customerName.toLowerCase().includes(q) || o.description.toLowerCase().includes(q)
      );

      const matchedCustomerDues = customerDues.filter(
        (d) =>
          (d.customerName || '').toLowerCase().includes(q) ||
          (d.mobileNumber || '').toLowerCase().includes(q) ||
          (d.address && d.address.toLowerCase().includes(q))
      );

      const matchedProductDues = productDues.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.contactInfo.toLowerCase().includes(q)
      );

      const matchedShopTasks = shopTasks.filter((t) => t.title.toLowerCase().includes(q));

      const matchedStockOut = stockOutItems.filter(
        (s) => s.productName.toLowerCase().includes(q) || (s.note && s.note.toLowerCase().includes(q))
      );

      const matchedFinance = financeEntries.filter(
        (f) =>
          f.ledger === 'business' &&
          (f.label.toLowerCase().includes(q) || (f.note && f.note.toLowerCase().includes(q)))
      );

      return {
        mode: 'business',
        orders: matchedOrders,
        customerDues: matchedCustomerDues,
        productDues: matchedProductDues,
        shopTasks: matchedShopTasks,
        stockOutItems: matchedStockOut,
        finance: matchedFinance,
        total:
          matchedOrders.length +
          matchedCustomerDues.length +
          matchedProductDues.length +
          matchedShopTasks.length +
          matchedStockOut.length +
          matchedFinance.length,
      };
    } else {
      const matchedPersonalTasks = personalTasks.filter((t) =>
        t.title.toLowerCase().includes(q)
      );

      const matchedFinance = financeEntries.filter(
        (f) =>
          f.ledger === 'personal' &&
          (f.label.toLowerCase().includes(q) || (f.note && f.note.toLowerCase().includes(q)))
      );

      return {
        mode: 'personal',
        personalTasks: matchedPersonalTasks,
        finance: matchedFinance,
        total: matchedPersonalTasks.length + matchedFinance.length,
      };
    }
  }, [q, windowMode, orders, customerDues, productDues, shopTasks, personalTasks, financeEntries]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 flex flex-col animate-in fade-in duration-150"
    >
      {/* Top Search Input Bar */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
        <Search size={18} className="text-zinc-400 shrink-0" />
        <input
          type="search"
          autoFocus
          placeholder={`Search ${windowMode === 'business' ? 'orders, dues, tasks, finances...' : 'routines, habits, finances...'}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>

      {/* Results Container */}
      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full space-y-6">
        {!q ? (
          <div className="text-center py-12 text-zinc-400 space-y-1">
            <Search size={28} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-zinc-500">
              Type to search across {windowMode === 'business' ? 'Business Window' : 'Personal Window'}
            </p>
            <p className="text-xs text-zinc-400">
              Searches names, phone numbers, labels, items, notes, and tasks
            </p>
          </div>
        ) : searchResults && searchResults.total === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <p className="text-sm font-medium text-zinc-500">No matching records found for "{query}"</p>
          </div>
        ) : (
          searchResults && (
            <div className="space-y-6">
              {/* Business Results */}
              {searchResults.mode === 'business' && (
                <>
                  {searchResults.orders.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <ShoppingBag size={13} />
                        <span>Orders ({searchResults.orders.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {searchResults.orders.map((o) => (
                          <div
                            key={o.id}
                            onClick={() => {
                              onSelectOrder?.(o);
                              onClose();
                            }}
                            className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs hover:border-zinc-400 cursor-pointer"
                          >
                            <div className="flex justify-between font-semibold text-zinc-900 dark:text-zinc-100">
                              <span>{o.customerName}</span>
                              <span className="text-zinc-400 font-normal">
                                Due {formatDateLabel(o.deliveryTargetDate)}
                              </span>
                            </div>
                            <p className="text-zinc-500 truncate mt-0.5">{o.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.customerDues.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <HandCoins size={13} />
                        <span>Customer Dues ({searchResults.customerDues.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {searchResults.customerDues.map((d) => (
                          <div
                            key={d.id}
                            className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs flex justify-between items-center"
                          >
                            <div>
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                                {d.customerName || 'Unnamed Customer'}
                              </span>
                              <span className="text-zinc-400 text-[11px]">
                                {d.mobileNumber || 'No contact number'}
                              </span>
                            </div>
                            <AmountText minorUnits={d.amountMinor} weight="bold" size="sm" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.productDues.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <Package size={13} />
                        <span>Product Backorders ({searchResults.productDues.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {searchResults.productDues.map((p) => (
                          <div
                            key={p.id}
                            className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs flex justify-between items-center"
                          >
                            <div>
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {p.productName} (x{p.quantity})
                              </span>
                              <span className="text-zinc-400 text-[11px] block">
                                For {p.customerName}
                              </span>
                            </div>
                            <span className="text-[11px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                              {p.paymentStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.shopTasks.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <CheckSquare size={13} />
                        <span>Shop Tasks ({searchResults.shopTasks.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {searchResults.shopTasks.map((t) => (
                          <div
                            key={t.id}
                            className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200"
                          >
                            {t.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.stockOutItems.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500 uppercase tracking-wider">
                        <AlertCircle size={13} />
                        <span>Emergency Restock ({searchResults.stockOutItems.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {searchResults.stockOutItems.map((s) => (
                          <div
                            key={s.id}
                            className="p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs flex justify-between items-center"
                          >
                            <div>
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                                {s.productName}
                              </span>
                              {s.note && (
                                <span className="text-zinc-500 text-[11px] block">{s.note}</span>
                              )}
                            </div>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold">
                              Restock
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.finance.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <Receipt size={13} />
                        <span>Business Ledger ({searchResults.finance.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {searchResults.finance.map((f) => (
                          <div
                            key={f.id}
                            className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs flex justify-between items-center"
                          >
                            <div>
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                                {f.label}
                              </span>
                              <span className="text-zinc-400 text-[11px]">{f.date}</span>
                            </div>
                            <AmountText
                              minorUnits={f.amountMinor}
                              type={f.type}
                              showSign={true}
                              size="sm"
                              weight="bold"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Personal Results */}
              {searchResults.mode === 'personal' && (
                <>
                  {searchResults.personalTasks.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <Sparkles size={13} />
                        <span>Routines & Goals ({searchResults.personalTasks.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {searchResults.personalTasks.map((t) => (
                          <div
                            key={t.id}
                            className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs flex justify-between items-center"
                          >
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {t.title}
                            </span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                              {t.kind}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.finance.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <Receipt size={13} />
                        <span>Personal Ledger ({searchResults.finance.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {searchResults.finance.map((f) => (
                          <div
                            key={f.id}
                            className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs flex justify-between items-center"
                          >
                            <div>
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                                {f.label}
                              </span>
                              <span className="text-zinc-400 text-[11px]">{f.date}</span>
                            </div>
                            <AmountText
                              minorUnits={f.amountMinor}
                              type={f.type}
                              showSign={true}
                              size="sm"
                              weight="bold"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
