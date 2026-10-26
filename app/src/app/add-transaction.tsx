import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../components/ui';
import { isValidDate, parseAmount, today } from '../lib/format';
import { useStore } from '../lib/store';
import { useTheme } from '../lib/theme';
import { KIND_LABEL } from '../lib/types';

export default function AddTransaction() {
  const t = useTheme();
  const { itemId: preset } = useLocalSearchParams<{ itemId?: string }>();
  const { data, month, addTxn } = useStore();
  const [itemId, setItemId] = useState<string | undefined>(preset);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(month === today().slice(0, 7) ? today() : `${month}-01`);
  const [note, setNote] = useState('');

  const items = data.items.filter((i) => i.startMonth <= month && (!i.endMonth || month <= i.endMonth));
  const input = [s.input, { color: t.text, backgroundColor: t.input, borderColor: t.border }];

  const save = () => {
    const amt = parseAmount(amount);
    if (!itemId) return Alert.alert('Choose a category');
    if (amt === null || amt <= 0) return Alert.alert('Enter a valid amount');
    if (!isValidDate(date)) return Alert.alert('Date must look like YYYY-MM-DD');
    addTxn({ itemId, amount: amt, date, note: note.trim() });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
        <Text style={[s.label, { color: t.muted }]}>Amount ({data.currency})</Text>
        <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={t.muted} style={input} autoFocus />

        <Text style={[s.label, { color: t.muted }]}>Date</Text>
        <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={t.muted} style={input} />

        <Text style={[s.label, { color: t.muted }]}>Note (optional)</Text>
        <TextInput value={note} onChangeText={setNote} placeholder="e.g. weekly shopping" placeholderTextColor={t.muted} style={input} />

        <Text style={[s.label, { color: t.muted }]}>Category</Text>
        {(['expense', 'obligation', 'income'] as const).map((kind) => (
          <View key={kind}>
            <Text style={[s.group, { color: t.muted }]}>{KIND_LABEL[kind]}</Text>
            <View style={s.chips}>
              {items.filter((i) => i.kind === kind).map((i) => {
                const on = i.id === itemId;
                return (
                  <Pressable
                    key={i.id}
                    onPress={() => setItemId(i.id)}
                    style={[s.chip, { borderColor: on ? t.primary : t.border, backgroundColor: on ? t.primary : t.card }]}>
                    <Text style={{ color: on ? '#fff' : t.text }}>{i.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
        <View style={{ height: 20 }} />
        <Button title="Save" onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  group: { fontSize: 12, fontWeight: '700', marginTop: 10, marginBottom: 6, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 18, paddingVertical: 7, paddingHorizontal: 12 },
});
