/**
 * Normalizes a Date object to local YYYY-MM-DD string
 */
export function normalizeDate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDate(): string {
  return normalizeDate(new Date());
}

export function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return normalizeDate(d);
}

export function getYesterdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return normalizeDate(d);
}

/**
 * Checks if a date (YYYY-MM-DD) is strictly prior to today's date
 */
export function isDateOverdue(dateStr: string, referenceDateStr?: string): boolean {
  if (!dateStr) return false;
  const today = referenceDateStr || getTodayDate();
  return dateStr < today;
}

/**
 * Checks if an ISO date-time string is in the past
 */
export function isDateTimeOverdue(isoStr: string, referenceTimeMs?: number): boolean {
  if (!isoStr) return false;
  const target = new Date(isoStr).getTime();
  const now = referenceTimeMs !== undefined ? referenceTimeMs : Date.now();
  return target < now;
}

/**
 * Calculates how many days overdue a date is relative to today
 */
export function getDaysOverdue(dateStr: string, referenceDateStr?: string): number {
  const today = referenceDateStr || getTodayDate();
  const dTarget = new Date(`${dateStr}T00:00:00`);
  const dToday = new Date(`${today}T00:00:00`);
  const diffTime = dToday.getTime() - dTarget.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Formats a date label according to specs:
 * "Today", "Tomorrow", "Yesterday", "Overdue 2d", or formatted date "19 Oct 2026"
 */
export function formatDateLabel(
  dateStr: string,
  referenceDateStr?: string,
  allowOverdue = true
): string {
  if (!dateStr) return '';
  const today = referenceDateStr || getTodayDate();

  if (dateStr === today) return 'Today';

  const dToday = new Date(`${today}T00:00:00`);
  const dTomorrow = new Date(dToday);
  dTomorrow.setDate(dTomorrow.getDate() + 1);
  const tomorrowStr = normalizeDate(dTomorrow);
  if (dateStr === tomorrowStr) return 'Tomorrow';

  const dYesterday = new Date(dToday);
  dYesterday.setDate(dYesterday.getDate() - 1);
  const yesterdayStr = normalizeDate(dYesterday);
  if (dateStr === yesterdayStr) return 'Yesterday';

  if (dateStr < today) {
    if (allowOverdue) {
      const days = getDaysOverdue(dateStr, today);
      return `Overdue ${days}d`;
    }
    const target = new Date(`${dateStr}T00:00:00`);
    return target.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  // Future date formatted as "19 Oct 2026"
  const target = new Date(`${dateStr}T00:00:00`);
  return target.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats time from an ISO string or HH:mm into "2:00 PM"
 */
export function formatTimeLabel(timeOrIso: string): string {
  if (!timeOrIso) return '';
  if (timeOrIso.includes('T')) {
    const d = new Date(timeOrIso);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  const [hours, minutes] = timeOrIso.split(':').map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Resolves the next occurrence of a time (e.g. "14:00")
 * If still ahead today -> today's date with that time.
 * If already passed today -> tomorrow's date with that time.
 * Returns ISO string: YYYY-MM-DDTHH:mm:00
 */
export function resolveNextTimeOccurrence(timeStr: string, referenceDate = new Date()): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const candidate = new Date(referenceDate);
  candidate.setHours(hours, minutes, 0, 0);

  if (candidate.getTime() <= referenceDate.getTime()) {
    // Already passed today, push to tomorrow
    candidate.setDate(candidate.getDate() + 1);
  }

  const y = candidate.getFullYear();
  const m = String(candidate.getMonth() + 1).padStart(2, '0');
  const d = String(candidate.getDate()).padStart(2, '0');
  const h = String(candidate.getHours()).padStart(2, '0');
  const min = String(candidate.getMinutes()).padStart(2, '0');

  return `${y}-${m}-${d}T${h}:${min}:00`;
}
