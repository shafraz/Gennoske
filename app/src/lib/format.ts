const pad = (n: number) => String(n).padStart(2, '0');

export function currentMonth(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function today(d = new Date()): string {
  return `${currentMonth(d)}-${pad(d.getDate())}`;
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return currentMonth(d);
}

export function monthLabel(month: string, short = false): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: short ? 'short' : 'long',
    year: short ? undefined : 'numeric',
  });
}

export function dateLabel(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

export function money(n: number, currency = ''): string {
  const v = n.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${v}` : v;
}

/** Parses user input like "1,250.50"; returns null when invalid. */
export function parseAmount(s: string): number | null {
  const t = s.replace(/,/g, '').trim();
  if (t === '' || !/^\d*\.?\d+$/.test(t)) return null;
  return Number(t);
}
