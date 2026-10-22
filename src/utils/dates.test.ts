import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDateLabel, isDateOverdue, getDaysOverdue, formatTimeLabel, normalizeDate } from './dates.ts';

test('formatDateLabel relative outputs', () => {
  const ref = '2026-10-19';
  assert.equal(formatDateLabel('2026-10-19', ref), 'Today');
  assert.equal(formatDateLabel('2026-10-20', ref), 'Tomorrow');
  assert.equal(formatDateLabel('2026-10-18', ref), 'Yesterday');
  assert.equal(formatDateLabel('2026-10-16', ref), 'Overdue 3d');
  assert.equal(formatDateLabel('2026-10-14', ref, false), '14 Oct 2026');
  assert.equal(formatDateLabel('2026-11-05', ref), '5 Nov 2026');
});

test('isDateOverdue checks date order', () => {
  const ref = '2026-10-19';
  assert.equal(isDateOverdue('2026-10-18', ref), true);
  assert.equal(isDateOverdue('2026-10-19', ref), false);
  assert.equal(isDateOverdue('2026-10-20', ref), false);
});

test('getDaysOverdue calculates difference correctly', () => {
  const ref = '2026-10-19';
  assert.equal(getDaysOverdue('2026-10-17', ref), 2);
  assert.equal(getDaysOverdue('2026-10-19', ref), 0);
  assert.equal(getDaysOverdue('2026-10-21', ref), 0);
});

test('formatTimeLabel formats 24h into 12h with AM/PM', () => {
  const formatted = formatTimeLabel('14:30');
  assert.match(formatted, /2:30\s*PM/i);
});

test('normalizeDate formats Date properly', () => {
  const d = new Date(2026, 9, 19); // Oct is month 9 (0-indexed)
  assert.equal(normalizeDate(d), '2026-10-19');
});
