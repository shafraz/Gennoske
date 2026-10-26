import type { AppData } from './types';
import { KIND_LABEL } from './types';
import { summarize } from './calc';

const esc = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function transactionsCsv(data: AppData): string {
  const names = new Map(data.items.map((i) => [i.id, i]));
  const lines = ['Date,Type,Category,Amount,Note'];
  const sorted = [...data.txns].sort((a, b) => a.date.localeCompare(b.date));
  for (const t of sorted) {
    const item = names.get(t.itemId);
    lines.push(
      [t.date, item ? KIND_LABEL[item.kind] : '', item?.name ?? '(deleted)', t.amount, t.note]
        .map(esc)
        .join(','),
    );
  }
  return lines.join('\n') + '\n';
}

export function budgetCsv(data: AppData, month: string): string {
  const s = summarize(data, month);
  const lines = ['Section,Category,Budget,Actual,Difference'];
  for (const kind of ['income', 'expense', 'obligation'] as const) {
    for (const r of s.rows[kind]) {
      lines.push([KIND_LABEL[kind], r.item.name, r.budget, r.actual, r.diff].map(esc).join(','));
    }
  }
  lines.push(['Total', 'Income', s.income.budget, s.income.actual, ''].map(esc).join(','));
  lines.push(['Total', 'Expenses', s.expenses.budget, s.expenses.actual, ''].map(esc).join(','));
  lines.push(['Total', 'Net', s.net.budget, s.net.actual, ''].map(esc).join(','));
  return lines.join('\n') + '\n';
}
