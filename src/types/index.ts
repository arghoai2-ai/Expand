export type Ledger = 'business' | 'personal';
export type EntryType = 'income' | 'expense';
export type OrderStatus = 'active' | 'completed';
export type DueStatus = 'outstanding' | 'settled';
export type BackorderStatus = 'pendingStock' | 'delivered';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type TaskStatus = 'pending' | 'done' | 'cancelled';
export type TaskKind = 'task' | 'habit' | 'goal';
export type AppWindow = 'business' | 'personal';
export type AppThemeMode = 'system' | 'light' | 'dark';
export type NumberGrouping = 'lakhCrore' | 'standard';

export interface Order {
  id: string;
  customerName: string;
  description: string;
  orderDate: string; // YYYY-MM-DD
  deliveryTargetDate: string; // YYYY-MM-DD
  receiptFiles: string[]; // File names or Data URLs
  status: OrderStatus;
  completedAt?: string | null;
  notifBase: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDue {
  id: string;
  customerName: string;
  mobileNumber: string;
  address?: string;
  amountMinor: number;
  recordedDate: string; // YYYY-MM-DD
  expectedPaymentDate: string; // YYYY-MM-DD
  status: DueStatus;
  settledAt?: string | null;
  linkedEntryId?: string | null;
  notifBase: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDue {
  id: string;
  customerName: string;
  contactInfo: string;
  productName: string;
  quantity: number;
  commitmentAt: string; // ISO-8601 string YYYY-MM-DDTHH:mm
  paymentStatus: PaymentStatus;
  status: BackorderStatus;
  deliveredAt?: string | null;
  notifBase: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockOutItem {
  id: string;
  productName: string;
  note?: string;
  createdAt: string;
}

export interface SubTask {
  id: string;
  title: string;
  isDone: boolean;
  createdAt?: string;
}

export interface ShopTask {
  id: string;
  title: string;
  dueAt?: string | null; // ISO string
  status: TaskStatus;
  resolvedAt?: string | null;
  notifBase: number;
  subTasks?: SubTask[];
  createdAt: string;
  updatedAt: string;
}

export interface PersonalTask {
  id: string;
  title: string;
  kind: TaskKind;
  reminderAt?: string | null; // ISO string or HH:mm
  repeatDaily: boolean;
  completedAt?: string | null; // ISO string
  notifBase: number;
  subTasks?: SubTask[];
  createdAt: string;
  updatedAt: string;
}

export interface FinanceEntry {
  id: string;
  ledger: Ledger;
  type: EntryType;
  amountMinor: number;
  label: string;
  note?: string;
  date: string; // YYYY-MM-DD
  linkedDueId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceSummary {
  incomeMinor: number;
  expenseMinor: number;
  netMinor: number;
}

export interface AppSettings {
  themeMode: AppThemeMode;
  lastWindow: AppWindow;
  lastBusinessTab: number; // 0: Orders, 1: Dues, 2: Tasks, 3: Finance
  lastPersonalTab: number; // 0: Tasks, 1: Finance
  remindersEnabled: boolean;
  currencySymbol: string;
  numberGrouping: NumberGrouping;
}
