import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMinor, majorToMinor, minorToMajor, formatLakhCroreNumber, formatStandardNumber } from './money.ts';

test('formatLakhCroreNumber groups Indian/Bengali numbers correctly', () => {
  assert.equal(formatLakhCroreNumber(125000), '1,25,000');
  assert.equal(formatLakhCroreNumber(10000000), '1,00,00,000');
  assert.equal(formatLakhCroreNumber(500), '500');
  assert.equal(formatLakhCroreNumber(4500), '4,500');
  assert.equal(formatLakhCroreNumber(12345678), '1,23,45,678');
});

test('formatStandardNumber formats international groups', () => {
  assert.equal(formatStandardNumber(125000), '125,000');
  assert.equal(formatStandardNumber(10000000), '10,000,000');
});

test('formatMinor handles whole numbers and decimals with symbol', () => {
  // 125000 * 100 minor units = 12500000
  assert.equal(formatMinor(12500000, '৳', 'lakhCrore'), '৳1,25,000');
  assert.equal(formatMinor(125050, '৳', 'lakhCrore'), '৳1,250.50');
  assert.equal(formatMinor(0, '৳', 'lakhCrore'), '৳0');
  assert.equal(formatMinor(-50000, '৳', 'lakhCrore'), '-৳500');
});

test('majorToMinor and minorToMajor conversions', () => {
  assert.equal(majorToMinor(1250.5), 125050);
  assert.equal(majorToMinor('1,250.50'), 125050);
  assert.equal(majorToMinor('100'), 10000);
  assert.equal(minorToMajor(125050), 1250.5);
});
