import type {
  Order,
  CustomerDue,
  ProductDue,
  ShopTask,
  PersonalTask,
  FinanceEntry,
  StockOutItem,
  AppSettings,
} from '../types/index.ts';
import { getTodayDate, getTomorrowDate, getYesterdayDate } from '../utils/dates.ts';

const STORAGE_KEYS = {
  ORDERS: 'expand_orders_v1',
  CUSTOMER_DUES: 'expand_customer_dues_v1',
  PRODUCT_DUES: 'expand_product_dues_v1',
  SHOP_TASKS: 'expand_shop_tasks_v1',
  PERSONAL_TASKS: 'expand_personal_tasks_v1',
  FINANCE_ENTRIES: 'expand_finance_entries_v1',
  STOCK_OUT: 'expand_stock_out_v1',
  SETTINGS: 'expand_settings_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  lastWindow: 'business',
  lastBusinessTab: 0,
  lastPersonalTab: 0,
  remindersEnabled: true,
  currencySymbol: '৳',
  numberGrouping: 'lakhCrore',
};

export function getInitialSeedData(): {
  orders: Order[];
  customerDues: CustomerDue[];
  productDues: ProductDue[];
  shopTasks: ShopTask[];
  personalTasks: PersonalTask[];
  financeEntries: FinanceEntry[];
  stockOutItems: StockOutItem[];
  settings: AppSettings;
} {
  const today = getTodayDate();
  const tomorrow = getTomorrowDate();
  const yesterday = getYesterdayDate();
  const nowIso = new Date().toISOString();

  const orders: Order[] = [
    {
      id: 'ord_1',
      customerName: 'Rafiq Traders',
      description: '50 sets Cotton Canvas Tote Bags with custom screen printing',
      orderDate: yesterday,
      deliveryTargetDate: today,
      receiptFiles: [],
      status: 'active',
      notifBase: 1010,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'ord_2',
      customerName: 'Ayesha Rahman',
      description: 'Handcrafted Brass Table Lamp (Matte Gold finish)',
      orderDate: today,
      deliveryTargetDate: tomorrow,
      receiptFiles: [],
      status: 'active',
      notifBase: 1020,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'ord_3',
      customerName: 'Dhaka Tech Hub',
      description: '12 Ergo-Mesh Executive Chairs (Bulk order batch 1)',
      orderDate: '2026-10-14',
      deliveryTargetDate: '2026-10-17', // Overdue
      receiptFiles: [],
      status: 'active',
      notifBase: 1030,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'ord_4',
      customerName: 'Green Valley Cafe',
      description: '30 Personalized Ceramic Espresso Cups',
      orderDate: '2026-10-10',
      deliveryTargetDate: '2026-10-12',
      receiptFiles: [],
      status: 'completed',
      completedAt: '2026-10-12T16:40:00Z',
      notifBase: 1040,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  const customerDues: CustomerDue[] = [
    {
      id: 'cdue_1',
      customerName: 'Karim Ullah & Sons',
      mobileNumber: '+880 1711-892341',
      address: 'Shop 42, New Market, Dhaka',
      amountMinor: 12500000, // ৳1,25,000
      recordedDate: '2026-10-12',
      expectedPaymentDate: today,
      status: 'outstanding',
      notifBase: 2010,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'cdue_2',
      customerName: 'Nasreen Akhter',
      mobileNumber: '+880 1819-456789',
      address: 'Gulshan 2, Road 54',
      amountMinor: 4850000, // ৳48,500
      recordedDate: '2026-10-05',
      expectedPaymentDate: '2026-10-16', // Overdue
      status: 'outstanding',
      notifBase: 2020,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'cdue_3',
      customerName: 'Tanvir Hossain',
      mobileNumber: '+880 1912-349811',
      address: 'Mirpur DOHS',
      amountMinor: 1800000, // ৳18,000
      recordedDate: '2026-10-10',
      expectedPaymentDate: '2026-10-14',
      status: 'settled',
      settledAt: '2026-10-14T11:00:00Z',
      linkedEntryId: 'fe_settle_cdue_3',
      notifBase: 2030,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  const productDues: ProductDue[] = [
    {
      id: 'pdue_1',
      customerName: 'Mahmudul Hasan',
      contactInfo: '+880 1722-901844',
      productName: 'Heavy-Duty Industrial Fabric Shears (10-inch)',
      quantity: 4,
      commitmentAt: `${today}T17:00:00`,
      paymentStatus: 'partial',
      status: 'pendingStock',
      notifBase: 3010,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'pdue_2',
      customerName: 'Shahina Begum',
      contactInfo: '+880 1680-123456',
      productName: 'Raw Silk Jacquard Fabric Roll (Navy 25 yards)',
      quantity: 1,
      commitmentAt: `${tomorrow}T11:30:00`,
      paymentStatus: 'paid',
      status: 'pendingStock',
      notifBase: 3020,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  const shopTasks: ShopTask[] = [
    {
      id: 'st_1',
      title: 'Inspect arriving timber supply & verify invoice',
      dueAt: `${today}T11:00:00`,
      status: 'pending',
      notifBase: 4010,
      subTasks: [
        { id: 'sub_st1_1', title: 'Check plank moisture levels', isDone: true },
        { id: 'sub_st1_2', title: 'Verify count against supplier delivery slip', isDone: false },
        { id: 'sub_st1_3', title: 'Sign & stamp delivery receiving copy', isDone: false },
      ],
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'st_2',
      title: 'Dispatch courier parcels for Rafiq Traders order',
      dueAt: `${today}T15:00:00`,
      status: 'pending',
      notifBase: 4020,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'st_3',
      title: 'Reorder packing tapes & corrugated courier boxes',
      dueAt: null,
      status: 'pending',
      notifBase: 4030,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'st_4',
      title: 'Morning cash register reconciliation',
      dueAt: `${today}T09:30:00`,
      status: 'done',
      resolvedAt: `${today}T09:28:00`,
      notifBase: 4040,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  const personalTasks: PersonalTask[] = [
    {
      id: 'pt_1',
      title: 'Morning 20m posture mobility & cardio run',
      kind: 'habit',
      reminderAt: '06:30',
      repeatDaily: true,
      completedAt: `${today}T06:55:00Z`,
      notifBase: 5010,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'pt_2',
      title: 'Review family emergency savings & liquid fund',
      kind: 'goal',
      reminderAt: '19:00',
      repeatDaily: false,
      completedAt: null,
      notifBase: 5020,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'pt_3',
      title: 'Read 2 chapters of "Deep Work" by Cal Newport',
      kind: 'habit',
      reminderAt: '21:30',
      repeatDaily: true,
      completedAt: null,
      notifBase: 5030,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'pt_4',
      title: 'Bike Repair & Tune-up',
      kind: 'task',
      reminderAt: '17:30',
      repeatDaily: false,
      completedAt: null,
      notifBase: 5040,
      subTasks: [
        { id: 'sub_pt4_1', title: 'Check tire PSI (front & rear)', isDone: true },
        { id: 'sub_pt4_2', title: 'Degrease and lube drivetrain chain', isDone: false },
        { id: 'sub_pt4_3', title: 'Adjust front disc brake cable tension', isDone: false },
      ],
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  const financeEntries: FinanceEntry[] = [
    {
      id: 'fe_1',
      ledger: 'business',
      type: 'income',
      amountMinor: 3500000, // ৳35,000
      label: 'Wholesale Sales',
      note: 'Advance payment for garment accessories',
      date: today,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'fe_2',
      ledger: 'business',
      type: 'expense',
      amountMinor: 850000, // ৳8,500
      label: 'Raw Materials & Inventory',
      note: 'Brass screws, polishing wax & sanding belts',
      date: today,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'fe_settle_cdue_3',
      ledger: 'business',
      type: 'income',
      amountMinor: 1800000, // ৳18,000
      label: 'Due settled: Tanvir Hossain',
      note: 'Auto-generated from settled credit. Mobile: +880 1912-349811',
      date: '2026-10-14',
      linkedDueId: 'cdue_3',
      createdAt: '2026-10-14T11:00:00Z',
      updatedAt: '2026-10-14T11:00:00Z',
    },
    {
      id: 'fe_3',
      ledger: 'business',
      type: 'expense',
      amountMinor: 420000, // ৳4,200
      label: 'Utilities & Internet',
      note: 'High-speed broadband monthly commercial bill',
      date: yesterday,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    // Personal Finance
    {
      id: 'fe_p1',
      ledger: 'personal',
      type: 'income',
      amountMinor: 7500000, // ৳75,000
      label: 'Monthly Allowance / Dividend',
      note: 'Transferred to personal account',
      date: today,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: 'fe_p2',
      ledger: 'personal',
      type: 'expense',
      amountMinor: 320000, // ৳3,200
      label: 'Groceries & Household',
      note: 'Fresh produce & pantry staples',
      date: today,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  const stockOutItems: StockOutItem[] = [
    {
      id: 'so_1',
      productName: 'Heavy-Duty Packaging Tape 3-inch (Clear)',
      note: 'Critically low in packing area',
      createdAt: nowIso,
    },
    {
      id: 'so_2',
      productName: 'Thermal Barcode Shipping Labels 50x30mm',
      note: 'Need 10 rolls for dispatch',
      createdAt: nowIso,
    },
    {
      id: 'so_3',
      productName: 'Bubble Wrap 100m Industrial Roll',
      createdAt: nowIso,
    },
  ];

  return {
    orders,
    customerDues,
    productDues,
    shopTasks,
    personalTasks,
    financeEntries,
    stockOutItems,
    settings: DEFAULT_SETTINGS,
  };
}

export function loadItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to load key ${key} from storage:`, err);
    return defaultValue;
  }
}

export function saveItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save key ${key} to storage:`, err);
  }
}

export function exportAllData(): string {
  const seed = getInitialSeedData();
  const data = {
    orders: loadItem(STORAGE_KEYS.ORDERS, seed.orders),
    customerDues: loadItem(STORAGE_KEYS.CUSTOMER_DUES, seed.customerDues),
    productDues: loadItem(STORAGE_KEYS.PRODUCT_DUES, seed.productDues),
    shopTasks: loadItem(STORAGE_KEYS.SHOP_TASKS, seed.shopTasks),
    personalTasks: loadItem(STORAGE_KEYS.PERSONAL_TASKS, seed.personalTasks),
    financeEntries: loadItem(STORAGE_KEYS.FINANCE_ENTRIES, seed.financeEntries),
    stockOutItems: loadItem(STORAGE_KEYS.STOCK_OUT, seed.stockOutItems),
    settings: loadItem(STORAGE_KEYS.SETTINGS, seed.settings),
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.orders) saveItem(STORAGE_KEYS.ORDERS, data.orders);
    if (data.customerDues) saveItem(STORAGE_KEYS.CUSTOMER_DUES, data.customerDues);
    if (data.productDues) saveItem(STORAGE_KEYS.PRODUCT_DUES, data.productDues);
    if (data.shopTasks) saveItem(STORAGE_KEYS.SHOP_TASKS, data.shopTasks);
    if (data.personalTasks) saveItem(STORAGE_KEYS.PERSONAL_TASKS, data.personalTasks);
    if (data.financeEntries) saveItem(STORAGE_KEYS.FINANCE_ENTRIES, data.financeEntries);
    if (data.stockOutItems) saveItem(STORAGE_KEYS.STOCK_OUT, data.stockOutItems);
    if (data.settings) saveItem(STORAGE_KEYS.SETTINGS, data.settings);
    return true;
  } catch (err) {
    console.error('Failed to import data:', err);
    return false;
  }
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
}

export { STORAGE_KEYS };
