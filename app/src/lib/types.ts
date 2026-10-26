export type Kind = 'income' | 'expense' | 'obligation';

export const KIND_LABEL: Record<Kind, string> = {
  income: 'Income',
  expense: 'Monthly Expenses',
  obligation: 'Obligations',
};

/** A budget line (e.g. "Rent"). Active from `startMonth` until `endMonth` (inclusive). */
export interface Item {
  id: string;
  kind: Kind;
  name: string;
  /** Default monthly budget; can be overridden per month. */
  budget: number;
  startMonth: string; // YYYY-MM
  endMonth?: string; // YYYY-MM
}

export interface Txn {
  id: string;
  itemId: string;
  month: string; // YYYY-MM
  date: string; // YYYY-MM-DD
  amount: number;
  note: string;
}

export interface AppData {
  version: 1;
  currency: string;
  items: Item[];
  /** month -> itemId -> budget for that month only */
  overrides: Record<string, Record<string, number>>;
  txns: Txn[];
}
