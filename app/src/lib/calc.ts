import type { AppData, Item, Kind, Txn } from './types';

export function isActive(item: Item, month: string): boolean {
  return item.startMonth <= month && (!item.endMonth || month <= item.endMonth);
}

export function budgetFor(data: AppData, item: Item, month: string): number {
  return data.overrides[month]?.[item.id] ?? item.budget;
}

export interface Row {
  item: Item;
  budget: number;
  actual: number;
  /** actual - budget, same convention as the spreadsheet's "Difference" column */
  diff: number;
}

export interface Totals {
  budget: number;
  actual: number;
}

export interface MonthSummary {
  month: string;
  rows: Record<Kind, Row[]>;
  income: Totals;
  expenses: Totals; // expenses + obligations
  net: Totals;
}

export function monthTxns(data: AppData, month: string): Txn[] {
  return data.txns.filter((t) => t.month === month);
}

const sum = (rows: Row[], k: 'budget' | 'actual') => rows.reduce((a, r) => a + r[k], 0);

export function summarize(data: AppData, month: string): MonthSummary {
  const actualById = new Map<string, number>();
  for (const t of monthTxns(data, month)) {
    actualById.set(t.itemId, (actualById.get(t.itemId) ?? 0) + t.amount);
  }
  const rows: Record<Kind, Row[]> = { income: [], expense: [], obligation: [] };
  for (const item of data.items) {
    // Keep a retired item visible in months where it still has transactions.
    const hasTxn = actualById.has(item.id);
    if (!isActive(item, month) && !hasTxn) continue;
    const budget = isActive(item, month) ? budgetFor(data, item, month) : 0;
    const actual = actualById.get(item.id) ?? 0;
    rows[item.kind].push({ item, budget, actual, diff: actual - budget });
  }
  const income = { budget: sum(rows.income, 'budget'), actual: sum(rows.income, 'actual') };
  const out = [...rows.expense, ...rows.obligation];
  const expenses = { budget: sum(out, 'budget'), actual: sum(out, 'actual') };
  return {
    month,
    rows,
    income,
    expenses,
    net: { budget: income.budget - expenses.budget, actual: income.actual - expenses.actual },
  };
}
