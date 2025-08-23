import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getCities } from '../utils/schedule';
import { useApp } from '../context/AppContext';
import { router } from 'expo-router';

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
  chipBg: '#f7f1ec',
};

export default function CityScreen() {
  const { city, setCity } = useApp();
  const [query, setQuery] = useState('');
  const all = useMemo(() => getCities(), []);
  const list = useMemo(() => all.filter(c => c.toLowerCase().includes(query.toLowerCase())), [all, query]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Sélection de la ville</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>Retour</Text>
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher une ville..."
            placeholderTextColor={COLORS.muted}
            style={styles.searchInput}
          />
        </View>

        <View style={{ marginTop: 12 }} />
        <View style={styles.grid}>
          {list.map((c) => {
            const active = city === c;
            return (
              <Pressable key={c} onPress={() => setCity(c)} style={[styles.cityBtn, active && styles.cityBtnActive]}>
                <Text style={[styles.cityText, active && styles.cityTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => router.push('/slot')}
          disabled={!city}
          style={[styles.cta, !city && { opacity: 0.5 }]}
        >
          <Text style={styles.ctaText}>Choisir la date & l'heure</Text>
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
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, color: COLORS.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  cityBtn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff', marginRight: 8, marginBottom: 8 },
  cityBtnActive: { borderColor: COLORS.primary, backgroundColor: '#fff' },
  cityText: { color: COLORS.text, fontWeight: '700' },
  cityTextActive: { color: COLORS.primary },
  cta: { marginTop: 16, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  ctaText: { color: COLORS.bg, fontWeight: '800' },
});
