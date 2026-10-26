import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { monthLabel, shiftMonth } from '../lib/format';
import { useTheme } from '../lib/theme';

export function Card({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>{children}</View>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={s.sectionRow}>
      <Text style={[s.sectionTitle, { color: t.muted }]}>{children}</Text>
      {right}
    </View>
  );
}

export function Button({
  title,
  onPress,
  kind = 'primary',
}: {
  title: string;
  onPress: () => void;
  kind?: 'primary' | 'ghost' | 'danger';
}) {
  const t = useTheme();
  const bg = kind === 'primary' ? t.primary : 'transparent';
  const color = kind === 'primary' ? '#fff' : kind === 'danger' ? t.bad : t.primary;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.btn, { backgroundColor: bg, opacity: pressed ? 0.7 : 1 }]}>
      <Text style={[s.btnText, { color }]}>{title}</Text>
    </Pressable>
  );
}

export function Progress({ value, max, over }: { value: number; max: number; over?: boolean }) {
  const t = useTheme();
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : value > 0 ? 1 : 0;
  return (
    <View style={[s.track, { backgroundColor: t.track }]}>
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: over ? t.bad : t.primary }} />
    </View>
  );
}

export function MonthSwitcher({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  const t = useTheme();
  return (
    <View style={s.monthRow}>
      <Pressable accessibilityLabel="Previous month" hitSlop={12} onPress={() => onChange(shiftMonth(month, -1))}>
        <Text style={[s.arrow, { color: t.primary }]}>‹</Text>
      </Pressable>
      <Text style={[s.monthText, { color: t.text }]}>{monthLabel(month)}</Text>
      <Pressable accessibilityLabel="Next month" hitSlop={12} onPress={() => onChange(shiftMonth(month, 1))}>
        <Text style={[s.arrow, { color: t.primary }]}>›</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '600' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 6 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, marginBottom: 8 },
  monthText: { fontSize: 20, fontWeight: '700' },
  arrow: { fontSize: 34, paddingHorizontal: 12, lineHeight: 36 },
});
