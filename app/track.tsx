import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useApp } from '../context/AppContext';
import { notify } from '../utils/notifier';

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
  chipBg: '#f7f1ec',
};

const STEPS: { key: 'En attente' | 'Acceptée' | 'Prête' | 'Terminée'; label: string }[] = [
  { key: 'En attente', label: 'Préparation' },
  { key: 'Acceptée', label: 'Cuisson' },
  { key: 'Prête', label: 'Prêt' },
  { key: 'Terminée', label: 'Terminée' },
];

export default function TrackScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { orders } = useApp();
  const order = useMemo(() => {
    if (orderId) return orders.find((o) => o.id === orderId);
    return orders[0];
  }, [orders, orderId]);

  const idx = Math.max(0, STEPS.findIndex((s) => s.key === (order?.status || 'En attente')));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Commande en cours</Text>
        <View style={styles.card}>
          <Text style={styles.muted}>Réf</Text>
          <Text style={styles.ref}>{order?.id || '—'}</Text>
          <View style={styles.stepRow}>
            {STEPS.map((s, i) => (
              <View key={s.key} style={[styles.stepPill, i <= idx && styles.stepActive]}>
                <Text style={[styles.stepText, i <= idx && styles.stepTextActive]}>{s.label}</Text>
              </View>
            ))}
          </View>
          <View style={{ height: 10 }} />
          <Text style={styles.statusMsg}>
            {order?.status === 'Prête' ? 'Votre commande est prête !' : 'Nous préparons votre burger...'}
          </Text>
        </View>

        <View style={styles.row}>
          <Pressable style={styles.secondaryBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.secondaryText}>Accueil</Text>
          </Pressable>
          <Pressable style={styles.primaryBtn} onPress={() => notify('Votre commande est prête !')}>
            <Text style={styles.primaryText}>Voir la notification</Text>
          </Pressable>
        </View>
      </View>

      {order?.status === 'Prête' && (
        <View style={styles.toast}><Text style={styles.toastText}>Votre commande est prête !</Text></View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16 },
  header: { fontSize: 24, color: COLORS.text, fontWeight: '800', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 14, marginBottom: 16 },
  muted: { color: COLORS.muted },
  ref: { color: COLORS.text, fontWeight: '800', marginTop: 2, marginBottom: 10 },
  stepRow: { flexDirection: 'row', flexWrap: 'wrap' },
  stepPill: { backgroundColor: COLORS.chipBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  stepActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  stepText: { color: COLORS.muted, fontWeight: '700' },
  stepTextActive: { color: COLORS.bg },
  statusMsg: { color: COLORS.muted },
  row: { flexDirection: 'row', alignItems: 'center' },
  primaryBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginLeft: 8 },
  primaryText: { color: COLORS.bg, fontWeight: '800' },
  secondaryBtn: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 14 },
  secondaryText: { color: COLORS.text, fontWeight: '800' },
  toast: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: '#1b130d', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  toastText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
});
