import test from 'node:test';
import assert from 'node:assert/strict';
import { settleCustomerDueLogic, revertCustomerDueLogic } from './dueSettlement.ts';
import type { CustomerDue, FinanceEntry } from '../types/index.ts';

test('settleCustomerDueLogic creates linked business income entry and marks settled', () => {
  const sampleDue: CustomerDue = {
    id: 'due_123',
    customerName: 'Rahim Khan',
    mobileNumber: '01711223344',
    address: 'Dhanmondi, Dhaka',
    amountMinor: 250000, // 2500.00
    recordedDate: '2026-10-15',
    expectedPaymentDate: '2026-10-18',
    status: 'outstanding',
    notifBase: 100,
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-15T10:00:00Z',
  };

  const entries: FinanceEntry[] = [];
  const result = settleCustomerDueLogic(sampleDue, entries, '2026-10-19T12:00:00Z');

  assert.equal(result.success, true);
  assert.equal(result.updatedDue.status, 'settled');
  assert.equal(result.updatedDue.settledAt, '2026-10-19T12:00:00Z');
  assert.ok(result.updatedDue.linkedEntryId);
  assert.ok(result.newEntry);
  assert.equal(result.newEntry?.type, 'income');
  assert.equal(result.newEntry?.ledger, 'business');
  assert.equal(result.newEntry?.amountMinor, 250000);
  assert.equal(result.newEntry?.linkedDueId, 'due_123');
  assert.equal(result.newEntry?.label, 'Due settled: Rahim Khan');
});

test('settleCustomerDueLogic is idempotent if already settled', () => {
  const settledDue: CustomerDue = {
    id: 'due_123',
    customerName: 'Rahim Khan',
    mobileNumber: '01711223344',
    amountMinor: 250000,
    recordedDate: '2026-10-15',
    expectedPaymentDate: '2026-10-18',
    status: 'settled',
    settledAt: '2026-10-19T10:00:00Z',
    linkedEntryId: 'entry_due_123',
    notifBase: 100,
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-19T10:00:00Z',
  };

  const result = settleCustomerDueLogic(settledDue, []);
  assert.equal(result.success, true);
  assert.equal(result.newEntry, undefined);
});

test('revertCustomerDueLogic reverts status and identifies linked entry to delete', () => {
  const settledDue: CustomerDue = {
    id: 'due_123',
    customerName: 'Rahim Khan',
    mobileNumber: '01711223344',
    amountMinor: 250000,
    recordedDate: '2026-10-15',
    expectedPaymentDate: '2026-10-18',
    status: 'settled',
    settledAt: '2026-10-19T10:00:00Z',
    linkedEntryId: 'entry_due_123',
    notifBase: 100,
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-19T10:00:00Z',
  };

  const result = revertCustomerDueLogic(settledDue, '2026-10-19T14:00:00Z');
  assert.equal(result.success, true);
  assert.equal(result.updatedDue.status, 'outstanding');
  assert.equal(result.updatedDue.settledAt, null);
  assert.equal(result.updatedDue.linkedEntryId, null);
  assert.equal(result.linkedEntryIdToDelete, 'entry_due_123');
});

test('settleCustomerDueLogic handles empty customerName and mobileNumber gracefully', () => {
  const blankDue: CustomerDue = {
    id: 'due_blank',
    customerName: '',
    mobileNumber: '',
    amountMinor: 50000,
    recordedDate: '2026-10-15',
    expectedPaymentDate: '',
    status: 'outstanding',
    notifBase: 101,
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-15T10:00:00Z',
  };

  const result = settleCustomerDueLogic(blankDue, [], '2026-10-21T12:00:00Z');
  assert.equal(result.success, true);
  assert.equal(result.newEntry?.label, 'Due settled: Unnamed Customer');
  assert.equal(result.newEntry?.note, 'Auto-generated from settled credit');
});

