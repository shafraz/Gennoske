import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, MonthSwitcher, Progress, SectionTitle } from '../../components/ui';
import { summarize } from '../../lib/calc';
import type { Row } from '../../lib/calc';
import { money } from '../../lib/format';
import { useStore } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { KIND_LABEL } from '../../lib/types';
import type { Kind } from '../../lib/types';

const KINDS: Kind[] = ['income', 'expense', 'obligation'];

function RowView({ r, kind }: { r: Row; kind: Kind }) {
  const t = useTheme();
  const { month } = useStore();
  // For income, getting more than budget is good; for spending it is bad.
  const bad = kind === 'income' ? false : r.diff > 0;
  const good = kind === 'income' ? r.diff >= 0 && r.budget > 0 : false;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/edit-item', params: { id: r.item.id, month } })}
      onLongPress={() => router.push({ pathname: '/add-transaction', params: { itemId: r.item.id } })}
      style={s.row}>
      <View style={s.rowTop}>
        <Text style={[s.name, { color: t.text }]} numberOfLines={1}>{r.item.name}</Text>
        <Text style={{ color: t.muted }}>
          {money(r.actual)} / {money(r.budget)}
        </Text>
        <Text style={[s.diff, { color: bad ? t.bad : good ? t.good : t.muted }]}>
          {r.diff > 0 ? '+' : ''}{money(r.diff)}
        </Text>
      </View>
      <Progress value={r.actual} max={r.budget} over={bad && r.actual > r.budget} />
    </Pressable>
  );
}

export default function Budget() {
  const t = useTheme();
  const { data, month, setMonth } = useStore();
  const sum = useMemo(() => summarize(data, month), [data, month]);

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.pad}>
      <MonthSwitcher month={month} onChange={setMonth} />
      <Text style={{ color: t.muted, fontSize: 12, marginBottom: 4 }}>
        Tap a line to edit its budget · long-press to add a transaction
      </Text>
      {KINDS.map((kind) => (
        <View key={kind}>
          <SectionTitle
            right={
              <Pressable onPress={() => router.push({ pathname: '/edit-item', params: { kind, month } })} hitSlop={10}>
                <Text style={{ color: t.primary, fontWeight: '700' }}>+ Add</Text>
              </Pressable>
            }>
            {KIND_LABEL[kind]}
          </SectionTitle>
          <Card>
            {sum.rows[kind].length === 0 && <Text style={{ color: t.muted }}>No items yet.</Text>}
            {sum.rows[kind].map((r) => (
              <RowView key={r.item.id} r={r} kind={kind} />
            ))}
          </Card>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 40 },
  row: { paddingVertical: 8 },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  name: { flex: 1, fontSize: 15, fontWeight: '500', marginRight: 8 },
  diff: { width: 72, textAlign: 'right', fontWeight: '700', fontSize: 13 },
});
