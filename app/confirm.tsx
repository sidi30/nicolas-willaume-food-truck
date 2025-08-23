import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useApp } from '../context/AppContext';

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
  chipBg: '#f7f1ec',
};

export default function ConfirmScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { orders } = useApp();
  const order = useMemo(() => orders.find((o) => o.id === orderId), [orders, orderId]);

  const status = order?.status ?? 'En attente';
  const city = order?.city ?? '—';
  const t = order?.slot ? new Date(order.slot).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Commande {order?.id || ''}</Text>
        <View style={styles.card}>
          <Text style={styles.accepted}>{status === 'Acceptée' ? 'Acceptée' : status}</Text>
          <Text style={styles.muted}>Retrait à {city} à {t}</Text>
        </View>

        <View style={styles.row}>
          <Pressable style={styles.primaryBtn} onPress={() => router.push({ pathname: '/track', params: { orderId: order?.id } })}>
            <Text style={styles.primaryText}>Suivre la préparation</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.secondaryText}>Accueil</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16 },
  header: { fontSize: 24, color: COLORS.text, fontWeight: '800', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 14, marginBottom: 16 },
  accepted: { color: COLORS.text, fontWeight: '800', marginBottom: 6 },
  muted: { color: COLORS.muted },
  row: { flexDirection: 'row', alignItems: 'center' },
  primaryBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginRight: 8 },
  primaryText: { color: COLORS.bg, fontWeight: '800' },
  secondaryBtn: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 14 },
  secondaryText: { color: COLORS.text, fontWeight: '800' },
});
