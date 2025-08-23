import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { getCities, loadScheduleConfig, saveScheduleConfig, ScheduleConfig, ScheduleDayConfig } from '../../utils/schedule';

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
  chipBg: '#f7f1ec',
};

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function makeDefaultDays(): ScheduleDayConfig[] {
  return [
    { start: '11:00', end: '14:00', closed: true }, // Dimanche: fermé
    { start: '11:00', end: '14:00' },
    { start: '11:00', end: '14:00' },
    { start: '11:00', end: '14:00' },
    { start: '11:00', end: '14:00' },
    { start: '11:00', end: '14:00' },
    { start: '11:00', end: '14:00' },
  ];
}

export default function AdminSchedule() {
  const cities = getCities();
  const initialCfg: ScheduleConfig = useMemo(() => {
    return (
      loadScheduleConfig() || {
        default: makeDefaultDays(),
        stepMin: 15,
        cityOverrides: {},
      }
    );
  }, []);

  const [cfg, setCfg] = useState<ScheduleConfig>(initialCfg);
  const [selectedCity, setSelectedCity] = useState<string | null>(null); // null = défaut

  const currentDays = useMemo(() => {
    if (selectedCity) {
      const ov = cfg.cityOverrides?.[selectedCity];
      return ov && ov.length === 7 ? ov : cfg.default;
    }
    return cfg.default;
  }, [cfg, selectedCity]);

  const setDay = (idx: number, patch: Partial<ScheduleDayConfig>) => {
    setCfg((c) => {
      const base = selectedCity ? (c.cityOverrides?.[selectedCity] || [...c.default]) : [...c.default];
      const updated = base.map((d, i) => (i === idx ? { ...d, ...patch } : d));
      if (selectedCity) {
        return {
          ...c,
          cityOverrides: { ...(c.cityOverrides || {}), [selectedCity]: updated },
        };
      }
      return { ...c, default: updated };
    });
  };

  const setStep = (v: string) => {
    const n = parseInt(v, 10);
    if (isNaN(n)) return;
    setCfg((c) => ({ ...c, stepMin: Math.max(5, Math.min(60, n)) }));
  };

  const removeOverride = () => {
    if (!selectedCity) return;
    setCfg((c) => {
      const next = { ...(c.cityOverrides || {}) } as NonNullable<ScheduleConfig['cityOverrides']>;
      delete next[selectedCity!];
      return { ...c, cityOverrides: next };
    });
  };

  const save = () => saveScheduleConfig(cfg);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Calendrier</Text>

      <View style={styles.card}>
        <Text style={styles.section}>Pas de temps (minutes)</Text>
        <TextInput
          value={String(cfg.stepMin)}
          onChangeText={setStep}
          keyboardType="number-pad"
          style={[styles.input, { width: 120 }]}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Ville</Text>
        <View style={styles.chips}>
          <Pressable onPress={() => setSelectedCity(null)} style={[styles.chip, !selectedCity && styles.chipActive]}>
            <Text style={[styles.chipText, !selectedCity && styles.chipTextActive]}>Par défaut</Text>
          </Pressable>
          {cities.map((c) => (
            <Pressable key={c} onPress={() => setSelectedCity(c)} style={[styles.chip, selectedCity === c && styles.chipActive]}>
              <Text style={[styles.chipText, selectedCity === c && styles.chipTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </View>
        {!!selectedCity && (
          <Pressable onPress={removeOverride} style={[styles.secondaryBtn, { alignSelf: 'flex-start', marginTop: 8 }]}>
            <Text style={styles.secondaryText}>Supprimer l'override pour {selectedCity}</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Horaires ({selectedCity || 'Par défaut'})</Text>
        {currentDays.map((d, idx) => (
          <View key={idx} style={styles.row}>
            <Text style={[styles.dayLabel, d.closed && styles.closed]}>{DAYS[idx]}</Text>
            <TextInput
              value={d.start}
              onChangeText={(v) => setDay(idx, { start: v })}
              style={[styles.input, { width: 120, opacity: d.closed ? 0.5 : 1 }]}
              editable={!d.closed}
              placeholder="HH:MM"
              placeholderTextColor={COLORS.muted}
            />
            <Text style={{ marginHorizontal: 6, color: COLORS.muted }}>→</Text>
            <TextInput
              value={d.end}
              onChangeText={(v) => setDay(idx, { end: v })}
              style={[styles.input, { width: 120, opacity: d.closed ? 0.5 : 1 }]}
              editable={!d.closed}
              placeholder="HH:MM"
              placeholderTextColor={COLORS.muted}
            />
            <Pressable onPress={() => setDay(idx, { closed: !d.closed })} style={[styles.smallBtn, d.closed && styles.smallBtnAlt]}>
              <Text style={[styles.smallBtnText, d.closed && styles.smallBtnAltText]}>{d.closed ? 'Fermé' : 'Ouvert'}</Text>
            </Pressable>
          </View>
        ))}
        <Pressable onPress={save} style={[styles.primaryBtn, { alignSelf: 'flex-start', marginTop: 10 }]}>
          <Text style={styles.btnText}>Enregistrer</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800' },
  section: { color: COLORS.text, fontWeight: '800', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 12, marginTop: 12 },
  input: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, color: COLORS.text, marginRight: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { backgroundColor: COLORS.chipBg, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: COLORS.text },
  chipText: { color: COLORS.muted, fontWeight: '700' },
  chipTextActive: { color: COLORS.bg },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dayLabel: { width: 50, color: COLORS.text, fontWeight: '800' },
  closed: { color: COLORS.muted, textDecorationLine: 'line-through' },
  smallBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, marginLeft: 8 },
  smallBtnText: { color: COLORS.bg, fontWeight: '800' },
  smallBtnAlt: { backgroundColor: '#ddd' },
  smallBtnAltText: { color: COLORS.text },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  btnText: { color: COLORS.bg, fontWeight: '800' },
  secondaryBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  secondaryText: { color: COLORS.text, fontWeight: '800' },
});
