import { router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, MonthSwitcher } from '../../components/ui';
import { monthTxns } from '../../lib/calc';
import { dateLabel, money } from '../../lib/format';
import { useStore } from '../../lib/store';
import { useTheme } from '../../lib/theme';

export default function Transactions() {
  const t = useTheme();
  const { data, month, setMonth, deleteTxn } = useStore();
  const groups = useMemo(() => {
    const items = new Map(data.items.map((i) => [i.id, i]));
    const by = new Map<string, { id: string; name: string; income: boolean; amount: number; note: string }[]>();
    [...monthTxns(data, month)]
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach((x) => {
        const it = items.get(x.itemId);
        const list = by.get(x.date) ?? [];
        list.push({ id: x.id, name: it?.name ?? '(deleted)', income: it?.kind === 'income', amount: x.amount, note: x.note });
        by.set(x.date, list);
      });
    return [...by.entries()];
  }, [data, month]);

  const confirmDelete = (id: string, name: string) =>
    Alert.alert('Delete transaction?', name, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTxn(id) },
    ]);

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.pad}>
      <MonthSwitcher month={month} onChange={setMonth} />
      <Button title="+ Add transaction" onPress={() => router.push('/add-transaction')} />
      <View style={{ height: 16 }} />
      {groups.length === 0 && <Text style={{ color: t.muted, textAlign: 'center' }}>No transactions this month.</Text>}
      {groups.map(([date, list]) => (
        <View key={date}>
          <Text style={[s.date, { color: t.muted }]}>{dateLabel(date)}</Text>
          <Card>
            {list.map((x) => (
              <Pressable key={x.id} onLongPress={() => confirmDelete(x.id, x.name)} style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.text, fontSize: 15, fontWeight: '500' }}>{x.name}</Text>
                  {!!x.note && <Text style={{ color: t.muted, fontSize: 12 }}>{x.note}</Text>}
                </View>
                <Text style={{ color: x.income ? t.good : t.text, fontWeight: '700' }}>
                  {x.income ? '+' : '−'}{money(x.amount, data.currency)}
                </Text>
              </Pressable>
            ))}
          </Card>
        </View>
      ))}
      {groups.length > 0 && (
        <Text style={{ color: t.muted, fontSize: 12, textAlign: 'center' }}>Long-press a transaction to delete it</Text>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 40 },
  date: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
});
