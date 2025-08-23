import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getOpenHoursForCity, generateSlots } from '../utils/schedule';
import { useApp } from '../context/AppContext';

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
  chipBg: '#f7f1ec',
};

function formatDateInput(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`; // for web input[type=date] compatibility
}

export default function SlotScreen() {
  const { city, slot, setSlot } = useApp();
  const [dateStr, setDateStr] = useState(formatDateInput(new Date()));
  const date = useMemo(() => new Date(dateStr + 'T00:00:00'), [dateStr]);
  const hours = getOpenHoursForCity(city, date);
  const slots = useMemo(() => (hours ? generateSlots(date, hours, 15) : []), [date, hours]);

  const selectedHHmm = useMemo(() => {
    if (!slot) return null;
    try {
      const d = new Date(slot);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return null;
    }
  }, [slot]);

  const pickSlot = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    setSlot(d.toISOString());
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Date & heure</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>Retour</Text>
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Ville</Text>
          <View style={styles.inputLike}><Text style={styles.value}>{city || '—'}</Text></View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.inputLike}>
            {/* Simple date input for web; fallback text for native */}
            <TextInput value={dateStr} onChangeText={setDateStr} style={{ flex: 1, color: COLORS.text }} />
          </View>
          {hours ? (
            <Text style={styles.hours}>Ouvert: {hours.start}–{hours.end}</Text>
          ) : (
            <Text style={styles.closed}>Fermé ce jour</Text>
          )}
        </View>

        <View style={styles.slotGrid}>
          {slots.map((s) => {
            const active = selectedHHmm === s;
            return (
              <Pressable key={s} onPress={() => pickSlot(s)} style={[styles.slotBtn, active && styles.slotBtnActive]}>
                <Text style={[styles.slotText, active && styles.slotTextActive]}>{s}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => router.push('/(tabs)/menu')}
          disabled={!city || !slot}
          style={[styles.cta, (!city || !slot) && { opacity: 0.5 }]}
        >
          <Text style={styles.ctaText}>Choisir mes burgers</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  header: { color: COLORS.text, fontSize: 24, fontWeight: '800' },
  backBtn: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  backText: { color: COLORS.text, fontWeight: '700' },
  field: { marginBottom: 14 },
  label: { color: COLORS.text, fontWeight: '700', marginBottom: 6 },
  inputLike: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
  value: { color: COLORS.text },
  hours: { marginTop: 6, color: COLORS.muted },
  closed: { marginTop: 6, color: '#b00020' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  slotBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff', marginRight: 8, marginBottom: 8 },
  slotBtnActive: { borderColor: COLORS.primary },
  slotText: { color: COLORS.text, fontWeight: '700' },
  slotTextActive: { color: COLORS.primary },
  cta: { marginTop: 16, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  ctaText: { color: COLORS.bg, fontWeight: '800' },
});
