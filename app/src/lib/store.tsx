import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { seedData } from './seed';
import { currentMonth } from './format';
import type { AppData, Item, Kind, Txn } from './types';

const KEY = 'expense-manager/v1';

interface Store {
  ready: boolean;
  data: AppData;
  month: string;
  setMonth: (m: string) => void;
  addTxn: (t: Omit<Txn, 'id' | 'month'>) => void;
  deleteTxn: (id: string) => void;
  addItem: (kind: Kind, name: string, budget: number, month: string) => void;
  /** Updates name + default budget for all months from `month` on, or just this month. */
  updateItem: (id: string, name: string, budget: number, month: string, onlyThisMonth: boolean) => void;
  /** Stops the item from `month` on; past months and transactions are kept. */
  retireItem: (id: string, month: string) => void;
  setCurrency: (c: string) => void;
  resetAll: () => void;
}

const Ctx = createContext<Store | null>(null);

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(seedData);
  const [ready, setReady] = useState(false);
  const [month, setMonth] = useState(currentMonth());
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setData(JSON.parse(raw) as AppData);
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data]);

  const addTxn = useCallback((t: Omit<Txn, 'id' | 'month'>) => {
    setData((d) => ({ ...d, txns: [...d.txns, { ...t, id: uid(), month: t.date.slice(0, 7) }] }));
  }, []);

  const deleteTxn = useCallback((id: string) => {
    setData((d) => ({ ...d, txns: d.txns.filter((t) => t.id !== id) }));
  }, []);

  const addItem = useCallback((kind: Kind, name: string, budget: number, m: string) => {
    setData((d) => ({ ...d, items: [...d.items, { id: uid(), kind, name, budget, startMonth: m }] }));
  }, []);

  const updateItem = useCallback(
    (id: string, name: string, budget: number, m: string, onlyThisMonth: boolean) => {
      setData((d) => {
        if (onlyThisMonth) {
          return {
            ...d,
            items: d.items.map((i) => (i.id === id ? { ...i, name } : i)),
            overrides: { ...d.overrides, [m]: { ...d.overrides[m], [id]: budget } },
          };
        }
        // Default budget changes; drop this month's override so the new value shows.
        const { [id]: _drop, ...rest } = d.overrides[m] ?? {};
        return {
          ...d,
          items: d.items.map((i) => (i.id === id ? { ...i, name, budget } : i)),
          overrides: { ...d.overrides, [m]: rest },
        };
      });
    },
    [],
  );

  const retireItem = useCallback((id: string, m: string) => {
    setData((d) => ({
      ...d,
      items: d.items.flatMap((i): Item[] => {
        if (i.id !== id) return [i];
        // Never active before `m` and no transactions: remove entirely.
        const used = d.txns.some((t) => t.itemId === id);
        if (i.startMonth >= m && !used) return [];
        const prev = new Date(Number(m.slice(0, 4)), Number(m.slice(5)) - 2, 1);
        const endMonth = currentMonth(prev);
        return [{ ...i, endMonth }];
      }),
    }));
  }, []);

  const setCurrency = useCallback((currency: string) => setData((d) => ({ ...d, currency })), []);
  const resetAll = useCallback(() => setData(seedData()), []);

  const value = useMemo(
    () => ({ ready, data, month, setMonth, addTxn, deleteTxn, addItem, updateItem, retireItem, setCurrency, resetAll }),
    [ready, data, month, addTxn, deleteTxn, addItem, updateItem, retireItem, setCurrency, resetAll],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
