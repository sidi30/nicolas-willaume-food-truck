import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { formatEuro } from '../../utils/schedule';
import { router } from 'expo-router';

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
  chipBg: '#f7f1ec',
};

export default function OrdersScreen() {
  const { orders } = useApp();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={require('../../utils/logo.jpg')} style={styles.brandLogo} resizeMode="contain" />
        <Text style={styles.header}>Mes commandes</Text>

        <View style={styles.list}>
          {orders.length === 0 ? (
            <Text style={styles.empty}>Aucune commande pour le moment.</Text>
          ) : (
            orders.map((o) => (
              <View key={o.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>Commande #{o.id}</Text>
                  <View style={[styles.statusPill, o.status === 'Prête' && styles.statusReady]}>
                    <Ionicons name="time-outline" size={14} color={o.status === 'Prête' ? COLORS.bg : COLORS.muted} />
                    <Text style={[styles.statusText, o.status === 'Prête' && styles.statusTextReady]}>{o.status}</Text>
                  </View>
                </View>
                <Text style={styles.items}>{o.items.map(i => `${i.product.title} x${i.qty}`).join(', ')}</Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.date}>{new Date(o.date).toLocaleString('fr-FR')}</Text>
                  <Text style={styles.total}>{formatEuro(o.total)}</Text>
                </View>
                <Pressable style={styles.detailBtn} onPress={() => router.push({ pathname: '/order/[orderId]', params: { orderId: o.id } })}>
                  <Text style={styles.detailBtnText}>Voir le détail</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.bg} style={{ marginLeft: 6 }} />
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 24 },
  brandLogo: { width: 140, height: 34, marginBottom: 8 },
  header: { fontSize: 24, color: COLORS.text, fontWeight: '800', marginBottom: 12 },
  list: {},
  empty: { color: COLORS.muted },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: COLORS.text, fontWeight: '700', fontSize: 16 },
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.chipBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 },
  statusReady: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  statusText: { color: COLORS.muted, fontWeight: '700', fontSize: 12, marginLeft: 6 },
  statusTextReady: { color: COLORS.bg },
  items: { color: COLORS.muted, marginTop: 8 },
  cardBottom: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { color: COLORS.muted, fontSize: 12 },
  total: { color: COLORS.text, fontWeight: '800' },
  detailBtn: { marginTop: 12, alignSelf: 'flex-start', backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  detailBtnText: { color: COLORS.bg, fontWeight: '800' },
});
