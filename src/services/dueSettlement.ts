import type { CustomerDue, FinanceEntry } from '../types/index.ts';
import { getTodayDate } from '../utils/dates.ts';

export interface SettleResult {
  updatedDue: CustomerDue;
  newEntry?: FinanceEntry;
  success: boolean;
  message?: string;
}

export interface RevertResult {
  updatedDue: CustomerDue;
  linkedEntryIdToDelete?: string;
  success: boolean;
  message?: string;
}

/**
 * Idempotently settles a CustomerDue by generating a linked business income entry
 */
export function settleCustomerDueLogic(
  due: CustomerDue,
  existingEntries: FinanceEntry[],
  nowIso = new Date().toISOString()
): SettleResult {
  // Idempotent check: if already settled or already has a linkedEntryId
  if (due.status === 'settled' && due.linkedEntryId) {
    return {
      updatedDue: due,
      success: true,
      message: 'Already settled',
    };
  }

  // Check if an entry already exists for this due
  const existingLinked = existingEntries.find((e) => e.linkedDueId === due.id);
  const entryId = existingLinked?.id || `entry_due_${due.id}_${Date.now()}`;

  const newEntry: FinanceEntry = existingLinked || {
    id: entryId,
    ledger: 'business',
    type: 'income',
    amountMinor: due.amountMinor,
    label: due.customerName ? `Due settled: ${due.customerName}` : 'Due settled: Unnamed Customer',
    note: `Auto-generated from settled credit${due.mobileNumber ? '. Mobile: ' + due.mobileNumber : ''}`,
    date: getTodayDate(),
    linkedDueId: due.id,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const updatedDue: CustomerDue = {
    ...due,
    status: 'settled',
    settledAt: nowIso,
    linkedEntryId: entryId,
    updatedAt: nowIso,
  };

  return {
    updatedDue,
    newEntry: existingLinked ? undefined : newEntry,
    success: true,
  };
}

/**
 * Reverts a settled CustomerDue back to outstanding and marks linked entry for deletion
 */
export function revertCustomerDueLogic(
  due: CustomerDue,
  nowIso = new Date().toISOString()
): RevertResult {
  const linkedEntryId = due.linkedEntryId;

  const updatedDue: CustomerDue = {
    ...due,
    status: 'outstanding',
    settledAt: null,
    linkedEntryId: null,
    updatedAt: nowIso,
  };

  return {
    updatedDue,
    linkedEntryIdToDelete: linkedEntryId || undefined,
    success: true,
  };
}
