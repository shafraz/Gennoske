import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, MonthSwitcher, Progress, SectionTitle } from '../../components/ui';
import { summarize } from '../../lib/calc';
import type { Totals } from '../../lib/calc';
import { money } from '../../lib/format';
import { useStore } from '../../lib/store';
import { useTheme } from '../../lib/theme';

function Line({ label, v, bold }: { label: string; v: Totals; bold?: boolean }) {
  const t = useTheme();
  const w = bold ? '800' : '500';
  return (
    <View style={s.line}>
      <Text style={[s.label, { color: t.text, fontWeight: w }]}>{label}</Text>
      <Text style={[s.num, { color: t.muted }]}>{money(v.budget)}</Text>
      <Text style={[s.num, { color: v.actual < 0 && bold ? t.bad : t.text, fontWeight: w }]}>
        {money(v.actual)}
      </Text>
    </View>
  );
}

export default function Summary() {
  const t = useTheme();
  const { data, month, setMonth } = useStore();
  const sum = useMemo(() => summarize(data, month), [data, month]);
  const all = [...sum.rows.expense, ...sum.rows.obligation];
  const over = all.filter((r) => r.diff > 0).sort((a, b) => b.diff - a.diff).slice(0, 5);
  const spentPct = sum.expenses.budget > 0 ? sum.expenses.actual / sum.expenses.budget : 0;

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.pad}>
      <MonthSwitcher month={month} onChange={setMonth} />
      <Card>
        <View style={s.line}>
          <Text style={[s.label, { color: t.muted }]}>Budget summary ({data.currency})</Text>
          <Text style={[s.num, s.head, { color: t.muted }]}>Budget</Text>
          <Text style={[s.num, s.head, { color: t.muted }]}>Actual</Text>
        </View>
        <Line label="Total income" v={sum.income} />
        <Line label="Total expenses" v={sum.expenses} />
        <View style={[s.rule, { backgroundColor: t.border }]} />
        <Line label="Net" v={sum.net} bold />
      </Card>

      <Card>
        <Text style={{ color: t.muted, fontSize: 13 }}>Spent of expense budget</Text>
        <Text style={[s.big, { color: spentPct > 1 ? t.bad : t.text }]}>{Math.round(spentPct * 100)}%</Text>
        <Progress value={sum.expenses.actual} max={sum.expenses.budget} over={spentPct > 1} />
        <Text style={{ color: t.muted, marginTop: 8 }}>
          {money(sum.expenses.actual, data.currency)} of {money(sum.expenses.budget, data.currency)}
        </Text>
      </Card>

      <SectionTitle>Over budget</SectionTitle>
      <Card>
        {over.length === 0 ? (
          <Text style={{ color: t.muted }}>Nothing over budget this month.</Text>
        ) : (
          over.map((r) => (
            <View key={r.item.id} style={s.line}>
              <Text style={[s.label, { color: t.text }]}>{r.item.name}</Text>
              <Text style={{ color: t.bad, fontWeight: '700' }}>+{money(r.diff)}</Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 40 },
  line: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  label: { flex: 1, fontSize: 15 },
  num: { width: 90, textAlign: 'right', fontSize: 15 },
  head: { fontSize: 12, fontWeight: '600' },
  rule: { height: 1, marginVertical: 4 },
  big: { fontSize: 36, fontWeight: '800', marginVertical: 2 },
});
