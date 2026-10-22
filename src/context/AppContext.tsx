import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Order,
  CustomerDue,
  ProductDue,
  ShopTask,
  PersonalTask,
  SubTask,
  FinanceEntry,
  StockOutItem,
  AppSettings,
  FinanceSummary,
  AppWindow,
  AppThemeMode,
  PaymentStatus,
} from '../types/index.ts';
import {
  getInitialSeedData,
  loadItem,
  saveItem,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  exportAllData,
  importAllData,
  clearAllData,
} from '../services/storage.ts';
import { settleCustomerDueLogic, revertCustomerDueLogic } from '../services/dueSettlement.ts';
import { isDateOverdue, isDateTimeOverdue, getTodayDate } from '../utils/dates.ts';

export interface ToastMessage {
  id: string;
  message: string;
  undoAction?: () => void;
  undoLabel?: string;
}

interface AppContextType {
  // State
  orders: Order[];
  customerDues: CustomerDue[];
  productDues: ProductDue[];
  shopTasks: ShopTask[];
  personalTasks: PersonalTask[];
  financeEntries: FinanceEntry[];
  stockOutItems: StockOutItem[];
  settings: AppSettings;
  toast: ToastMessage | null;
  activeWindow: AppWindow;
  setActiveWindow: (w: AppWindow) => void;

  // Derived Views
  activeOrders: Order[];
  archivedOrders: Order[];
  activeCustomerDues: CustomerDue[];
  historyCustomerDues: CustomerDue[];
  outstandingCustomerDueTotal: number;
  activeProductDues: ProductDue[];
  historyProductDues: ProductDue[];
  pendingShopTasks: ShopTask[];
  doneShopTasksToday: ShopTask[];
  pendingPersonalTasks: PersonalTask[];
  donePersonalTasksToday: PersonalTask[];
  businessFinanceSummary: FinanceSummary;
  personalFinanceSummary: FinanceSummary;

  // Emergency Stock-Out Actions
  addStockOutItem: (productName: string, note?: string) => void;
  removeStockOutItem: (id: string) => void;

  // Order Actions
  addOrder: (order: Omit<Order, 'id' | 'notifBase' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (order: Order) => void;
  toggleOrderComplete: (id: string) => void;
  deleteOrder: (id: string) => void;

  // Customer Due Actions
  addCustomerDue: (due: Omit<CustomerDue, 'id' | 'notifBase' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomerDue: (due: CustomerDue) => void;
  settleCustomerDue: (id: string) => void;
  revertCustomerDue: (id: string) => void;
  deleteCustomerDue: (id: string) => void;

  // Product Due Actions
  addProductDue: (due: Omit<ProductDue, 'id' | 'notifBase' | 'createdAt' | 'updatedAt'>) => void;
  updateProductDue: (due: ProductDue) => void;
  toggleProductDueDelivered: (id: string) => void;
  updateProductDuePaymentStatus: (id: string, status: PaymentStatus) => void;
  deleteProductDue: (id: string) => void;

  // Shop Task Actions
  addShopTask: (task: { title: string; dueAt?: string | null; subTasks?: SubTask[] }) => void;
  updateShopTask: (task: ShopTask) => void;
  toggleShopTaskDone: (id: string) => void;
  cancelShopTask: (id: string) => void;
  deleteShopTask: (id: string) => void;

  // Personal Task Actions
  addPersonalTask: (task: Omit<PersonalTask, 'id' | 'notifBase' | 'createdAt' | 'updatedAt' | 'completedAt'>) => void;
  updatePersonalTask: (task: PersonalTask) => void;
  togglePersonalTaskDone: (id: string) => void;
  deletePersonalTask: (id: string) => void;

  // Finance Actions
  addFinanceEntry: (entry: Omit<FinanceEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFinanceEntry: (entry: FinanceEntry) => void;
  deleteFinanceEntry: (id: string) => boolean;

  // Settings & Utilities
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  showToast: (message: string, undoAction?: () => void, undoLabel?: string) => void;
  dismissToast: () => void;
  resetAllSeedData: () => void;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const seed = useMemo(() => getInitialSeedData(), []);

  const [orders, setOrders] = useState<Order[]>(() => loadItem(STORAGE_KEYS.ORDERS, seed.orders));
  const [customerDues, setCustomerDues] = useState<CustomerDue[]>(() =>
    loadItem(STORAGE_KEYS.CUSTOMER_DUES, seed.customerDues)
  );
  const [productDues, setProductDues] = useState<ProductDue[]>(() =>
    loadItem(STORAGE_KEYS.PRODUCT_DUES, seed.productDues)
  );
  const [shopTasks, setShopTasks] = useState<ShopTask[]>(() =>
    loadItem(STORAGE_KEYS.SHOP_TASKS, seed.shopTasks)
  );
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>(() =>
    loadItem(STORAGE_KEYS.PERSONAL_TASKS, seed.personalTasks)
  );
  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>(() =>
    loadItem(STORAGE_KEYS.FINANCE_ENTRIES, seed.financeEntries)
  );
  const [stockOutItems, setStockOutItems] = useState<StockOutItem[]>(() =>
    loadItem(STORAGE_KEYS.STOCK_OUT, seed.stockOutItems)
  );
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadItem(STORAGE_KEYS.SETTINGS, seed.settings)
  );
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync to localStorage
  useEffect(() => {
    saveItem(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    saveItem(STORAGE_KEYS.CUSTOMER_DUES, customerDues);
  }, [customerDues]);

  useEffect(() => {
    saveItem(STORAGE_KEYS.PRODUCT_DUES, productDues);
  }, [productDues]);

  useEffect(() => {
    saveItem(STORAGE_KEYS.SHOP_TASKS, shopTasks);
  }, [shopTasks]);

  useEffect(() => {
    saveItem(STORAGE_KEYS.PERSONAL_TASKS, personalTasks);
  }, [personalTasks]);

  useEffect(() => {
    saveItem(STORAGE_KEYS.FINANCE_ENTRIES, financeEntries);
  }, [financeEntries]);

  useEffect(() => {
    saveItem(STORAGE_KEYS.STOCK_OUT, stockOutItems);
  }, [stockOutItems]);

  useEffect(() => {
    saveItem(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  // Apply dark / light mode class to documentElement
  useEffect(() => {
    const isDark =
      settings.themeMode === 'dark' ||
      (settings.themeMode === 'system' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.themeMode]);

  const showToast = useCallback(
    (message: string, undoAction?: () => void, undoLabel = 'Undo') => {
      const id = String(Date.now());
      setToast({ id, message, undoAction, undoLabel });
    },
    []
  );

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Auto-dismiss toast after 4.5 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const activeWindow = settings.lastWindow;
  const setActiveWindow = useCallback((w: AppWindow) => {
    setSettings((prev) => ({ ...prev, lastWindow: w }));
  }, []);

  // Derived Views
  const activeOrders = useMemo(() => {
    return orders
      .filter((o) => o.status === 'active')
      .sort((a, b) => {
        const aOver = isDateOverdue(a.deliveryTargetDate);
        const bOver = isDateOverdue(b.deliveryTargetDate);
        if (aOver && !bOver) return -1;
        if (!aOver && bOver) return 1;
        return a.deliveryTargetDate.localeCompare(b.deliveryTargetDate);
      });
  }, [orders]);

  const archivedOrders = useMemo(() => {
    return orders
      .filter((o) => o.status === 'completed')
      .sort((a, b) => (b.completedAt || b.updatedAt).localeCompare(a.completedAt || a.updatedAt));
  }, [orders]);

  const activeCustomerDues = useMemo(() => {
    return customerDues
      .filter((d) => d.status === 'outstanding')
      .sort((a, b) => {
        const aOver = isDateOverdue(a.expectedPaymentDate);
        const bOver = isDateOverdue(b.expectedPaymentDate);
        if (aOver && !bOver) return -1;
        if (!aOver && bOver) return 1;
        return a.expectedPaymentDate.localeCompare(b.expectedPaymentDate);
      });
  }, [customerDues]);

  const historyCustomerDues = useMemo(() => {
    return customerDues
      .filter((d) => d.status === 'settled')
      .sort((a, b) => (b.settledAt || b.updatedAt).localeCompare(a.settledAt || a.updatedAt));
  }, [customerDues]);

  const outstandingCustomerDueTotal = useMemo(() => {
    return activeCustomerDues.reduce((acc, curr) => acc + curr.amountMinor, 0);
  }, [activeCustomerDues]);

  const activeProductDues = useMemo(() => {
    return productDues
      .filter((p) => p.status === 'pendingStock')
      .sort((a, b) => {
        const aOver = isDateTimeOverdue(a.commitmentAt);
        const bOver = isDateTimeOverdue(b.commitmentAt);
        if (aOver && !bOver) return -1;
        if (!aOver && bOver) return 1;
        return a.commitmentAt.localeCompare(b.commitmentAt);
      });
  }, [productDues]);

  const historyProductDues = useMemo(() => {
    return productDues
      .filter((p) => p.status === 'delivered')
      .sort((a, b) => (b.deliveredAt || b.updatedAt).localeCompare(a.deliveredAt || a.updatedAt));
  }, [productDues]);

  const pendingShopTasks = useMemo(() => {
    return shopTasks
      .filter((t) => t.status === 'pending')
      .sort((a, b) => {
        const aOver = a.dueAt ? isDateTimeOverdue(a.dueAt) : false;
        const bOver = b.dueAt ? isDateTimeOverdue(b.dueAt) : false;
        if (aOver && !bOver) return -1;
        if (!aOver && bOver) return 1;
        if (a.dueAt && !b.dueAt) return -1;
        if (!a.dueAt && b.dueAt) return 1;
        if (a.dueAt && b.dueAt) return a.dueAt.localeCompare(b.dueAt);
        return a.createdAt.localeCompare(b.createdAt);
      });
  }, [shopTasks]);

  const doneShopTasksToday = useMemo(() => {
    const today = getTodayDate();
    return shopTasks
      .filter((t) => (t.status === 'done' || t.status === 'cancelled') && (t.resolvedAt?.startsWith(today) || t.updatedAt?.startsWith(today)))
      .sort((a, b) => (b.resolvedAt || b.updatedAt).localeCompare(a.resolvedAt || a.updatedAt));
  }, [shopTasks]);

  const pendingPersonalTasks = useMemo(() => {
    const today = getTodayDate();
    return personalTasks
      .filter((t) => {
        if (t.repeatDaily) {
          // Reset daily habits: done if completed today, pending otherwise
          return !t.completedAt || !t.completedAt.startsWith(today);
        }
        return !t.completedAt;
      })
      .sort((a, b) => {
        if (a.reminderAt && !b.reminderAt) return -1;
        if (!a.reminderAt && b.reminderAt) return 1;
        if (a.reminderAt && b.reminderAt) return a.reminderAt.localeCompare(b.reminderAt);
        return a.createdAt.localeCompare(b.createdAt);
      });
  }, [personalTasks]);

  const donePersonalTasksToday = useMemo(() => {
    const today = getTodayDate();
    return personalTasks
      .filter((t) => t.completedAt && t.completedAt.startsWith(today))
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  }, [personalTasks]);

  // Finance Summaries
  const businessFinanceSummary = useMemo<FinanceSummary>(() => {
    let income = 0;
    let expense = 0;
    financeEntries
      .filter((e) => e.ledger === 'business')
      .forEach((e) => {
        if (e.type === 'income') income += e.amountMinor;
        else expense += e.amountMinor;
      });
    return {
      incomeMinor: income,
      expenseMinor: expense,
      netMinor: income - expense,
    };
  }, [financeEntries]);

  const personalFinanceSummary = useMemo<FinanceSummary>(() => {
    let income = 0;
    let expense = 0;
    financeEntries
      .filter((e) => e.ledger === 'personal')
      .forEach((e) => {
        if (e.type === 'income') income += e.amountMinor;
        else expense += e.amountMinor;
      });
    return {
      incomeMinor: income,
      expenseMinor: expense,
      netMinor: income - expense,
    };
  }, [financeEntries]);

  // Actions: Orders
  const addOrder = useCallback((data: Omit<Order, 'id' | 'notifBase' | 'createdAt' | 'updatedAt'>) => {
    const nowIso = new Date().toISOString();
    const newOrder: Order = {
      ...data,
      id: `ord_${Date.now()}`,
      notifBase: Math.floor(Math.random() * 8000) + 1000,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Order for ${newOrder.customerName} created`);
  }, [showToast]);

  const updateOrder = useCallback((updated: Order) => {
    const nowIso = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? { ...updated, updatedAt: nowIso } : o))
    );
    showToast(`Order updated`);
  }, [showToast]);

  const toggleOrderComplete = useCallback((id: string) => {
    const nowIso = new Date().toISOString();
    setOrders((prev) => {
      const order = prev.find((o) => o.id === id);
      if (!order) return prev;

      const isBecomingCompleted = order.status === 'active';
      const prevStatus = order.status;
      const prevCompletedAt = order.completedAt;

      const updated = prev.map((o) => {
        if (o.id !== id) return o;
        return {
          ...o,
          status: isBecomingCompleted ? ('completed' as const) : ('active' as const),
          completedAt: isBecomingCompleted ? nowIso : null,
          updatedAt: nowIso,
        };
      });

      showToast(
        isBecomingCompleted ? 'Order moved to Archive' : 'Order restored to Active',
        () => {
          setOrders((current) =>
            current.map((o) =>
              o.id === id ? { ...o, status: prevStatus, completedAt: prevCompletedAt } : o
            )
          );
        }
      );

      return updated;
    });
  }, [showToast]);

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => {
      const target = prev.find((o) => o.id === id);
      if (!target) return prev;
      return prev.filter((o) => o.id !== id);
    });
    showToast('Order permanently deleted');
  }, [showToast]);

  // Actions: Customer Dues
  const addCustomerDue = useCallback(
    (data: Omit<CustomerDue, 'id' | 'notifBase' | 'createdAt' | 'updatedAt'>) => {
      const nowIso = new Date().toISOString();
      const newDue: CustomerDue = {
        ...data,
        id: `cdue_${Date.now()}`,
        notifBase: Math.floor(Math.random() * 8000) + 1000,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setCustomerDues((prev) => [newDue, ...prev]);
      showToast(`Credit due recorded for ${newDue.customerName}`);
    },
    [showToast]
  );

  const updateCustomerDue = useCallback((updated: CustomerDue) => {
    const nowIso = new Date().toISOString();
    setCustomerDues((prev) =>
      prev.map((d) => (d.id === updated.id ? { ...updated, updatedAt: nowIso } : d))
    );
    showToast('Due updated');
  }, [showToast]);

  const settleCustomerDue = useCallback((id: string) => {
    setCustomerDues((prevDues) => {
      const targetDue = prevDues.find((d) => d.id === id);
      if (!targetDue) return prevDues;

      const { updatedDue, newEntry } = settleCustomerDueLogic(targetDue, financeEntries);

      if (newEntry) {
        setFinanceEntries((prevEntries) => [newEntry, ...prevEntries]);
      }

      showToast(
        `Marked as paid! Added to Business Income`,
        () => {
          // Undo settlement
          revertCustomerDue(id);
        }
      );

      return prevDues.map((d) => (d.id === id ? updatedDue : d));
    });
  }, [financeEntries, showToast]);

  const revertCustomerDue = useCallback((id: string) => {
    setCustomerDues((prevDues) => {
      const targetDue = prevDues.find((d) => d.id === id);
      if (!targetDue) return prevDues;

      const { updatedDue, linkedEntryIdToDelete } = revertCustomerDueLogic(targetDue);

      if (linkedEntryIdToDelete) {
        setFinanceEntries((prevEntries) =>
          prevEntries.filter((e) => e.id !== linkedEntryIdToDelete && e.linkedDueId !== id)
        );
      }

      showToast('Reverted to unpaid credit');
      return prevDues.map((d) => (d.id === id ? updatedDue : d));
    });
  }, [showToast]);

  const deleteCustomerDue = useCallback((id: string) => {
    setCustomerDues((prev) => {
      const target = prev.find((d) => d.id === id);
      if (!target) return prev;
      if (target.linkedEntryId) {
        setFinanceEntries((f) => f.filter((entry) => entry.id !== target.linkedEntryId && entry.linkedDueId !== id));
      }
      return prev.filter((d) => d.id !== id);
    });
    showToast('Customer due deleted');
  }, [showToast]);

  // Actions: Product Dues
  const addProductDue = useCallback(
    (data: Omit<ProductDue, 'id' | 'notifBase' | 'createdAt' | 'updatedAt'>) => {
      const nowIso = new Date().toISOString();
      const newDue: ProductDue = {
        ...data,
        id: `pdue_${Date.now()}`,
        notifBase: Math.floor(Math.random() * 8000) + 1000,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setProductDues((prev) => [newDue, ...prev]);
      showToast(`Product backorder logged for ${newDue.customerName}`);
    },
    [showToast]
  );

  const updateProductDue = useCallback((updated: ProductDue) => {
    const nowIso = new Date().toISOString();
    setProductDues((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...updated, updatedAt: nowIso } : p))
    );
    showToast('Product due updated');
  }, [showToast]);

  const toggleProductDueDelivered = useCallback((id: string) => {
    const nowIso = new Date().toISOString();
    setProductDues((prev) => {
      const item = prev.find((p) => p.id === id);
      if (!item) return prev;
      const isBecomingDelivered = item.status === 'pendingStock';
      const prevStatus = item.status;
      const prevDeliveredAt = item.deliveredAt;

      const updated = prev.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          status: isBecomingDelivered ? ('delivered' as const) : ('pendingStock' as const),
          deliveredAt: isBecomingDelivered ? nowIso : null,
          updatedAt: nowIso,
        };
      });

      showToast(
        isBecomingDelivered ? 'Item marked Delivered -> moved to History' : 'Restored to Pending Stock',
        () => {
          setProductDues((curr) =>
            curr.map((p) =>
              p.id === id ? { ...p, status: prevStatus, deliveredAt: prevDeliveredAt } : p
            )
          );
        }
      );

      return updated;
    });
  }, [showToast]);

  const updateProductDuePaymentStatus = useCallback((id: string, paymentStatus: PaymentStatus) => {
    const nowIso = new Date().toISOString();
    setProductDues((prev) =>
      prev.map((p) => (p.id === id ? { ...p, paymentStatus, updatedAt: nowIso } : p))
    );
    showToast(`Payment updated to ${paymentStatus.toUpperCase()}`);
  }, [showToast]);

  const deleteProductDue = useCallback((id: string) => {
    setProductDues((prev) => prev.filter((p) => p.id !== id));
    showToast('Product due removed');
  }, [showToast]);

  // Actions: Emergency Stock-Out
  const addStockOutItem = useCallback((productName: string, note?: string) => {
    const trimmed = productName.trim();
    if (!trimmed) return;
    const nowIso = new Date().toISOString();
    const newItem: StockOutItem = {
      id: `so_${Date.now()}`,
      productName: trimmed,
      note: note?.trim() || undefined,
      createdAt: nowIso,
    };
    setStockOutItems((prev) => [newItem, ...prev]);
    showToast(`Added to Emergency Stock-Out`);
  }, [showToast]);

  const removeStockOutItem = useCallback((id: string) => {
    setStockOutItems((prev) => {
      const removed = prev.find((item) => item.id === id);
      const updated = prev.filter((item) => item.id !== id);
      if (removed) {
        showToast(`Cleared "${removed.productName}"`, () => {
          setStockOutItems((curr) => [removed, ...curr]);
        });
      }
      return updated;
    });
  }, [showToast]);

  // Actions: Shop Tasks
  const addShopTask = useCallback(
    (data: { title: string; dueAt?: string | null; subTasks?: SubTask[] }) => {
      const nowIso = new Date().toISOString();
      const newTask: ShopTask = {
        id: `st_${Date.now()}`,
        title: data.title,
        dueAt: data.dueAt,
        status: 'pending',
        subTasks: data.subTasks && data.subTasks.length > 0 ? data.subTasks : undefined,
        notifBase: Math.floor(Math.random() * 8000) + 1000,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setShopTasks((prev) => [newTask, ...prev]);
      showToast(`Task added`);
    },
    [showToast]
  );

  const updateShopTask = useCallback((updatedTask: ShopTask) => {
    const nowIso = new Date().toISOString();
    setShopTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? { ...updatedTask, updatedAt: nowIso } : t))
    );
    showToast('Task updated');
  }, [showToast]);

  const toggleShopTaskDone = useCallback((id: string) => {
    const nowIso = new Date().toISOString();
    setShopTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (!task) return prev;
      const isFinishing = task.status === 'pending';
      const prevStatus = task.status;
      const prevResolvedAt = task.resolvedAt;

      const updated = prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          status: isFinishing ? ('done' as const) : ('pending' as const),
          resolvedAt: isFinishing ? nowIso : null,
          updatedAt: nowIso,
        };
      });

      showToast(
        isFinishing ? 'Task marked Done' : 'Task restored to Pending',
        () => {
          setShopTasks((curr) =>
            curr.map((t) =>
              t.id === id ? { ...t, status: prevStatus, resolvedAt: prevResolvedAt } : t
            )
          );
        }
      );

      return updated;
    });
  }, [showToast]);

  const cancelShopTask = useCallback((id: string) => {
    const nowIso = new Date().toISOString();
    setShopTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (!task) return prev;
      const prevStatus = task.status;
      const prevResolvedAt = task.resolvedAt;

      const updated = prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          status: 'cancelled' as const,
          resolvedAt: nowIso,
          updatedAt: nowIso,
        };
      });

      showToast('Task cancelled', () => {
        setShopTasks((curr) =>
          curr.map((t) =>
            t.id === id ? { ...t, status: prevStatus, resolvedAt: prevResolvedAt } : t
          )
        );
      });

      return updated;
    });
  }, [showToast]);

  const deleteShopTask = useCallback((id: string) => {
    setShopTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Task deleted');
  }, [showToast]);

  // Actions: Personal Tasks
  const addPersonalTask = useCallback(
    (data: Omit<PersonalTask, 'id' | 'notifBase' | 'createdAt' | 'updatedAt' | 'completedAt'>) => {
      const nowIso = new Date().toISOString();
      const newTask: PersonalTask = {
        ...data,
        id: `pt_${Date.now()}`,
        completedAt: null,
        notifBase: Math.floor(Math.random() * 8000) + 1000,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setPersonalTasks((prev) => [newTask, ...prev]);
      showToast(`${newTask.kind.toUpperCase()} added`);
    },
    [showToast]
  );

  const togglePersonalTaskDone = useCallback((id: string) => {
    const nowIso = new Date().toISOString();
    const today = getTodayDate();
    setPersonalTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (!task) return prev;

      const isCompleted = task.repeatDaily
        ? !!(task.completedAt && task.completedAt.startsWith(today))
        : !!task.completedAt;

      const prevCompletedAt = task.completedAt;

      const updated = prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          completedAt: isCompleted ? null : nowIso,
          updatedAt: nowIso,
        };
      });

      showToast(
        !isCompleted ? 'Completed!' : 'Restored to pending',
        () => {
          setPersonalTasks((curr) =>
            curr.map((t) => (t.id === id ? { ...t, completedAt: prevCompletedAt } : t))
          );
        }
      );

      return updated;
    });
  }, [showToast]);

  const deletePersonalTask = useCallback((id: string) => {
    setPersonalTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (!task) return prev;
      return prev.filter((t) => t.id !== id);
    });
    showToast('Task removed');
  }, [showToast]);

  const updatePersonalTask = useCallback((updatedTask: PersonalTask) => {
    const nowIso = new Date().toISOString();
    setPersonalTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? { ...updatedTask, updatedAt: nowIso } : t))
    );
    showToast('Task updated');
  }, [showToast]);

  // Actions: Finance
  const addFinanceEntry = useCallback((data: Omit<FinanceEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nowIso = new Date().toISOString();
    const newEntry: FinanceEntry = {
      ...data,
      id: `fe_${Date.now()}`,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setFinanceEntries((prev) => [newEntry, ...prev]);
    showToast(`${data.type === 'income' ? 'Income' : 'Expense'} recorded`);
  }, [showToast]);

  const updateFinanceEntry = useCallback((updated: FinanceEntry) => {
    const nowIso = new Date().toISOString();
    setFinanceEntries((prev) =>
      prev.map((e) => (e.id === updated.id ? { ...updated, updatedAt: nowIso } : e))
    );
    showToast('Finance entry updated');
  }, [showToast]);

  const deleteFinanceEntry = useCallback((id: string): boolean => {
    const entry = financeEntries.find((e) => e.id === id);
    if (!entry) return false;

    if (entry.linkedDueId) {
      showToast('Settlement entries must be reverted from the Dues tab');
      return false;
    }

    setFinanceEntries((prev) => {
      const target = prev.find((e) => e.id === id);
      if (!target) return prev;

      showToast('Entry deleted', () => {
        setFinanceEntries((curr) => [target, ...curr]);
      });

      return prev.filter((e) => e.id !== id);
    });

    return true;
  }, [financeEntries, showToast]);

  // Settings
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetAllSeedData = useCallback(() => {
    clearAllData();
    const fresh = getInitialSeedData();
    setOrders(fresh.orders);
    setCustomerDues(fresh.customerDues);
    setProductDues(fresh.productDues);
    setShopTasks(fresh.shopTasks);
    setPersonalTasks(fresh.personalTasks);
    setFinanceEntries(fresh.financeEntries);
    setStockOutItems(fresh.stockOutItems);
    setSettings(fresh.settings);
    showToast('Reset to default sample data');
  }, [showToast]);

  const exportData = useCallback(() => {
    return exportAllData();
  }, []);

  const importData = useCallback((jsonStr: string) => {
    const ok = importAllData(jsonStr);
    if (ok) {
      const seedData = getInitialSeedData();
      setOrders(loadItem(STORAGE_KEYS.ORDERS, seedData.orders));
      setCustomerDues(loadItem(STORAGE_KEYS.CUSTOMER_DUES, seedData.customerDues));
      setProductDues(loadItem(STORAGE_KEYS.PRODUCT_DUES, seedData.productDues));
      setShopTasks(loadItem(STORAGE_KEYS.SHOP_TASKS, seedData.shopTasks));
      setPersonalTasks(loadItem(STORAGE_KEYS.PERSONAL_TASKS, seedData.personalTasks));
      setFinanceEntries(loadItem(STORAGE_KEYS.FINANCE_ENTRIES, seedData.financeEntries));
      setStockOutItems(loadItem(STORAGE_KEYS.STOCK_OUT, seedData.stockOutItems));
      setSettings(loadItem(STORAGE_KEYS.SETTINGS, seedData.settings));
      showToast('Data restored successfully!');
      return true;
    }
    showToast('Invalid backup JSON file');
    return false;
  }, [showToast]);

  const value = useMemo(
    () => ({
      orders,
      customerDues,
      productDues,
      shopTasks,
      personalTasks,
      financeEntries,
      stockOutItems,
      settings,
      toast,
      activeWindow,
      setActiveWindow,
      activeOrders,
      archivedOrders,
      activeCustomerDues,
      historyCustomerDues,
      outstandingCustomerDueTotal,
      activeProductDues,
      historyProductDues,
      pendingShopTasks,
      doneShopTasksToday,
      pendingPersonalTasks,
      donePersonalTasksToday,
      businessFinanceSummary,
      personalFinanceSummary,
      addStockOutItem,
      removeStockOutItem,
      addOrder,
      updateOrder,
      toggleOrderComplete,
      deleteOrder,
      addCustomerDue,
      updateCustomerDue,
      settleCustomerDue,
      revertCustomerDue,
      deleteCustomerDue,
      addProductDue,
      updateProductDue,
      toggleProductDueDelivered,
      updateProductDuePaymentStatus,
      deleteProductDue,
      addShopTask,
      updateShopTask,
      toggleShopTaskDone,
      cancelShopTask,
      deleteShopTask,
      addPersonalTask,
      updatePersonalTask,
      togglePersonalTaskDone,
      deletePersonalTask,
      addFinanceEntry,
      updateFinanceEntry,
      deleteFinanceEntry,
      updateSettings,
      showToast,
      dismissToast,
      resetAllSeedData,
      exportData,
      importData,
    }),
    [
      orders,
      customerDues,
      productDues,
      shopTasks,
      personalTasks,
      financeEntries,
      stockOutItems,
      settings,
      toast,
      activeWindow,
      setActiveWindow,
      activeOrders,
      archivedOrders,
      activeCustomerDues,
      historyCustomerDues,
      outstandingCustomerDueTotal,
      activeProductDues,
      historyProductDues,
      pendingShopTasks,
      doneShopTasksToday,
      pendingPersonalTasks,
      donePersonalTasksToday,
      businessFinanceSummary,
      personalFinanceSummary,
      addStockOutItem,
      removeStockOutItem,
      addOrder,
      updateOrder,
      toggleOrderComplete,
      deleteOrder,
      addCustomerDue,
      updateCustomerDue,
      settleCustomerDue,
      revertCustomerDue,
      deleteCustomerDue,
      addProductDue,
      updateProductDue,
      toggleProductDueDelivered,
      updateProductDuePaymentStatus,
      deleteProductDue,
      addShopTask,
      updateShopTask,
      toggleShopTaskDone,
      cancelShopTask,
      deleteShopTask,
      addPersonalTask,
      updatePersonalTask,
      togglePersonalTaskDone,
      deletePersonalTask,
      addFinanceEntry,
      updateFinanceEntry,
      deleteFinanceEntry,
      updateSettings,
      showToast,
      dismissToast,
      resetAllSeedData,
      exportData,
      importData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
