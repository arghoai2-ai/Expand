import type { NumberGrouping } from '../types/index.ts';

/**
 * Formats a non-negative integer using South Asian (lakh/crore) grouping:
 * e.g., 125000 -> "1,25,000"
 * e.g., 10000000 -> "1,00,00,000"
 */
export function formatLakhCroreNumber(num: number | string): string {
  const str = Math.abs(Number(num)).toString();
  if (str.length <= 3) return str;

  const lastThree = str.slice(-3);
  const remaining = str.slice(0, -3);

  // Group by 2s from the right
  const parts: string[] = [];
  let i = remaining.length;
  while (i > 0) {
    const start = Math.max(0, i - 2);
    parts.unshift(remaining.slice(start, i));
    i -= 2;
  }

  return parts.join(',') + ',' + lastThree;
}

/**
 * Formats standard international grouping:
 * e.g., 125000 -> "125,000"
 */
export function formatStandardNumber(num: number | string): string {
  const str = Math.abs(Number(num)).toString();
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Formats minor units (cents / paisa) with currency symbol and grouping style.
 * E.g., 12500000 minor -> "৳1,25,000" (if no decimals) or "৳1,25,000.50"
 */
export function formatMinor(
  minorUnits: number,
  symbol = '৳',
  grouping: NumberGrouping = 'lakhCrore'
): string {
  const isNegative = minorUnits < 0;
  const absMinor = Math.abs(Math.round(minorUnits));
  const major = Math.floor(absMinor / 100);
  const minor = absMinor % 100;

  const formattedMajor = grouping === 'lakhCrore'
    ? formatLakhCroreNumber(major)
    : formatStandardNumber(major);

  const decimalPart = minor > 0 ? `.${minor.toString().padStart(2, '0')}` : '';
  const sign = isNegative ? '-' : '';

  return `${sign}${symbol}${formattedMajor}${decimalPart}`;
}

/**
 * Converts user decimal input string/number to integer minor units (e.g. "1250.50" -> 125050)
 */
export function majorToMinor(val: number | string): number {
  if (typeof val === 'number') {
    return Math.round(val * 100);
  }
  const clean = val.replace(/,/g, '').trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Converts integer minor units to standard major number (e.g. 125050 -> 1250.5)
 */
export function minorToMajor(minor: number): number {
  return minor / 100;
}
