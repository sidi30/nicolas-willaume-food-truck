import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { formatEuro } from '../../utils/schedule';

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
  chipBg: '#f7f1ec',
};

export default function AdminHome() {
  const { orders, products } = useApp();

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'En attente' || o.status === 'Acceptée');
    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const last = orders.slice(0, 5);
    return { pendingCount: pending.length, revenue, productCount: products.length, last };
  }, [orders, products]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tableau de bord</Text>

      <View style={styles.kpis}>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Commandes en cours</Text>
          <Text style={styles.kpiValue}>{stats.pendingCount}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Produits</Text>
          <Text style={styles.kpiValue}>{stats.productCount}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Chiffre d'affaires (total démo)</Text>
          <Text style={styles.kpiValue}>{formatEuro(stats.revenue)}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.actionBtn} onPress={() => router.push('/admin/orders' as any)}>
          <Text style={styles.actionText}>Gérer les commandes</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => router.push('/admin/menu' as any)}>
          <Text style={styles.actionText}>Gérer le menu</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => router.push('/admin/schedule' as any)}>
          <Text style={styles.actionText}>Configurer le calendrier</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={styles.sectionTitle}>Dernières commandes</Text>
        {stats.last.length === 0 ? (
          <Text style={styles.empty}>Aucune commande pour le moment.</Text>
        ) : (
          stats.last.map((o) => (
            <View key={o.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>#{o.id} · {o.city || '—'} {o.slot ? `· ${new Date(o.slot).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}</Text>
                <Text style={styles.cardMeta}>{new Date(o.date).toLocaleString('fr-FR')} · {o.status}</Text>
              </View>
              <Text style={styles.cardAmount}>{formatEuro(o.total)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800' },
  kpis: { flexDirection: 'row', marginTop: 16 },
  kpi: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 16, marginRight: 12 },
  kpiLabel: { color: COLORS.muted, fontWeight: '700' },
  kpiValue: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginTop: 6 },
  row: { flexDirection: 'row', marginTop: 16 },
  actionBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, marginRight: 10 },
  actionText: { color: COLORS.bg, fontWeight: '800' },
  sectionTitle: { color: COLORS.text, fontWeight: '800', fontSize: 18, marginBottom: 8 },
  empty: { color: COLORS.muted },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 8 },
  cardTitle: { color: COLORS.text, fontWeight: '800' },
  cardMeta: { color: COLORS.muted, marginTop: 4 },
  cardAmount: { color: COLORS.text, fontWeight: '800' },
});
