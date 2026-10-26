import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, SectionTitle } from '../../components/ui';
import { summarize } from '../../lib/calc';
import { monthLabel, money, shiftMonth } from '../../lib/format';
import { useStore } from '../../lib/store';
import { useTheme } from '../../lib/theme';

const MONTHS = 6;

export default function History() {
  const t = useTheme();
  const { data, month } = useStore();
  const months = useMemo(
    () => Array.from({ length: MONTHS }, (_, i) => shiftMonth(month, i - (MONTHS - 1))),
    [month],
  );
  const sums = useMemo(() => months.map((m) => summarize(data, m)), [data, months]);
  const max = Math.max(1, ...sums.flatMap((x) => [x.income.actual, x.expenses.actual]));

  const cur = sums[sums.length - 1];
  const cats = [...cur.rows.expense, ...cur.rows.obligation]
    .filter((r) => r.actual > 0)
    .sort((a, b) => b.actual - a.actual);
  const catMax = Math.max(1, ...cats.map((c) => c.actual));

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.pad}>
      <SectionTitle>Income vs expenses · last {MONTHS} months</SectionTitle>
      <Card>
        <View style={s.chart}>
          {sums.map((x) => (
            <View key={x.month} style={s.col}>
              <View style={s.bars}>
                <View style={[s.bar, { height: `${(x.income.actual / max) * 100}%`, backgroundColor: t.good }]} />
                <View style={[s.bar, { height: `${(x.expenses.actual / max) * 100}%`, backgroundColor: t.bad }]} />
              </View>
              <Text style={{ color: t.muted, fontSize: 11, marginTop: 4 }}>{monthLabel(x.month, true)}</Text>
            </View>
          ))}
        </View>
        <View style={s.legend}>
          <Text style={{ color: t.good }}>■ Income</Text>
          <Text style={{ color: t.bad }}>■ Expenses</Text>
        </View>
      </Card>

      <SectionTitle>Net by month</SectionTitle>
      <Card>
        {[...sums].reverse().map((x) => (
          <View key={x.month} style={s.line}>
            <Text style={{ flex: 1, color: t.text }}>{monthLabel(x.month)}</Text>
            <Text style={{ color: x.net.actual < 0 ? t.bad : t.good, fontWeight: '700' }}>
              {money(x.net.actual, data.currency)}
            </Text>
          </View>
        ))}
      </Card>

      <SectionTitle>Where {monthLabel(month)} went</SectionTitle>
      <Card>
        {cats.length === 0 && <Text style={{ color: t.muted }}>No spending recorded.</Text>}
        {cats.map((c) => (
          <View key={c.item.id} style={{ marginBottom: 10 }}>
            <View style={s.line}>
              <Text style={{ flex: 1, color: t.text }}>{c.item.name}</Text>
              <Text style={{ color: t.muted }}>{money(c.actual)}</Text>
            </View>
            <View style={[s.track, { backgroundColor: t.track }]}>
              <View style={{ width: `${(c.actual / catMax) * 100}%`, height: '100%', backgroundColor: t.primary }} />
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 40 },
  chart: { flexDirection: 'row', height: 160 },
  col: { flex: 1, alignItems: 'center' },
  bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 3, width: '70%' },
  bar: { flex: 1, borderTopLeftRadius: 3, borderTopRightRadius: 3, minHeight: 1 },
  legend: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginTop: 10 },
  line: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
});
