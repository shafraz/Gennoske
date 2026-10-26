import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Button } from '../components/ui';
import { budgetFor } from '../lib/calc';
import { monthLabel, money, parseAmount } from '../lib/format';
import { useStore } from '../lib/store';
import { useTheme } from '../lib/theme';
import { KIND_LABEL } from '../lib/types';
import type { Kind } from '../lib/types';

export default function EditItem() {
  const t = useTheme();
  const { id, kind, month } = useLocalSearchParams<{ id?: string; kind?: Kind; month: string }>();
  const { data, addItem, updateItem, retireItem } = useStore();
  const item = id ? data.items.find((i) => i.id === id) : undefined;

  const [name, setName] = useState(item?.name ?? '');
  const [budget, setBudget] = useState(item ? String(budgetFor(data, item, month)) : '');
  const [onlyThis, setOnlyThis] = useState(false);
  const input = [s.input, { color: t.text, backgroundColor: t.input, borderColor: t.border }];

  const save = () => {
    const b = budget.trim() === '' ? 0 : parseAmount(budget);
    if (!name.trim()) return Alert.alert('Enter a name');
    if (b === null) return Alert.alert('Enter a valid budget amount');
    if (item) updateItem(item.id, name.trim(), b, month, onlyThis);
    else if (kind) addItem(kind, name.trim(), b, month);
    router.back();
  };

  const remove = () =>
    Alert.alert(
      `Remove "${item?.name}"?`,
      `It will no longer appear from ${monthLabel(month)} onward. Earlier months and past transactions are kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => { retireItem(item!.id, month); router.back(); } },
      ],
    );

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
      <Text style={[s.label, { color: t.muted }]}>{KIND_LABEL[item?.kind ?? kind ?? 'expense']}</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Name (e.g. Rent)" placeholderTextColor={t.muted} style={input} autoFocus={!item} />

      <Text style={[s.label, { color: t.muted }]}>Budget for {monthLabel(month)} ({data.currency})</Text>
      <TextInput value={budget} onChangeText={setBudget} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={t.muted} style={input} />

      {item && (
        <View style={s.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: t.text }}>Only this month</Text>
            <Text style={{ color: t.muted, fontSize: 12 }}>
              Off: new default budget ({money(item.budget)} now) for all months.
            </Text>
          </View>
          <Switch value={onlyThis} onValueChange={setOnlyThis} />
        </View>
      )}

      <View style={{ height: 16 }} />
      <Button title="Save" onPress={save} />
      {item && <Button title="Remove from budget" kind="danger" onPress={remove} />}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 12 },
});
