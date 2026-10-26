import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, SectionTitle } from '../../components/ui';
import { budgetCsv, transactionsCsv } from '../../lib/csv';
import { monthLabel } from '../../lib/format';
import { useStore } from '../../lib/store';
import { useTheme } from '../../lib/theme';

export default function Settings() {
  const t = useTheme();
  const { data, month, setCurrency, resetAll } = useStore();
  const [cur, setCur] = useState(data.currency);

  const exportCsv = async (name: string, content: string) => {
    try {
      const file = new File(Paths.cache, name);
      if (file.exists) file.delete();
      file.create();
      file.write(content);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: name });
      } else {
        Alert.alert('Sharing is not available on this device');
      }
    } catch (e) {
      Alert.alert('Export failed', String(e));
    }
  };

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.pad}>
      <SectionTitle>Currency</SectionTitle>
      <Card>
        <TextInput
          value={cur}
          onChangeText={setCur}
          onBlur={() => setCurrency(cur.trim())}
          autoCapitalize="characters"
          placeholder="e.g. MVR"
          placeholderTextColor={t.muted}
          style={[s.input, { color: t.text, backgroundColor: t.input, borderColor: t.border }]}
        />
      </Card>

      <SectionTitle>Export</SectionTitle>
      <Card>
        <Button
          title={`Budget – ${monthLabel(month)} (CSV)`}
          onPress={() => exportCsv(`budget-${month}.csv`, budgetCsv(data, month))}
        />
        <View style={{ height: 8 }} />
        <Button title="All transactions (CSV)" kind="ghost" onPress={() => exportCsv('transactions.csv', transactionsCsv(data))} />
        <Text style={{ color: t.muted, fontSize: 12, marginTop: 8 }}>CSV files open directly in Excel or Google Sheets.</Text>
      </Card>

      <SectionTitle>Data</SectionTitle>
      <Card>
        <Text style={{ color: t.muted, marginBottom: 8 }}>
          Everything is stored on this device only. {data.txns.length} transactions, {data.items.length} budget lines.
        </Text>
        <Button
          title="Reset to starter budget"
          kind="danger"
          onPress={() =>
            Alert.alert('Reset all data?', 'This deletes every transaction and restores the starter budget.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', style: 'destructive', onPress: () => { resetAll(); setCur('MVR'); } },
            ])
          }
        />
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 40 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
});
