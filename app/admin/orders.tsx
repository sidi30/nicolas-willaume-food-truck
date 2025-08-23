import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useApp, OrderStatus } from '../../context/AppContext';
import { formatEuro } from '../../utils/schedule';

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
};

const STATUSES: OrderStatus[] = ['En attente', 'Acceptée', 'Prête', 'Terminée'];

export default function AdminOrders() {
  const { orders, updateOrderStatus, removeOrder } = useApp();
  const [filter, setFilter] = useState<OrderStatus | 'Toutes'>('Toutes');

  const list = useMemo(() => {
    const sorted = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (filter === 'Toutes') return sorted;
    return sorted.filter((o) => o.status === filter);
  }, [orders, filter]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Commandes</Text>
        <View style={{ flexDirection: 'row' }}>
          {(['Toutes', ...STATUSES] as (OrderStatus | 'Toutes')[]).map((s) => {
            const active = filter === s;
            return (
              <Pressable key={s} onPress={() => setFilter(s)} style={[styles.filterBtn, active && styles.filterBtnActive]}>
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{s}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {list.length === 0 ? (
        <Text style={styles.empty}>Aucune commande.</Text>
      ) : (
        list.map((o) => (
          <View key={o.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>#{o.id} · {o.city || '—'} {o.slot ? `· ${new Date(o.slot).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}</Text>
              <Text style={styles.cardMeta}>{new Date(o.date).toLocaleString('fr-FR')} · {o.items.map(i => `${i.product.title} x${i.qty}`).join(', ')}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amount}>{formatEuro(o.total)}</Text>
              <Text style={[styles.status, o.status === 'Prête' && styles.ready]}>{o.status}</Text>
            </View>
            <View style={styles.actions}>
              {STATUSES.map((s) => (
                <Pressable key={s} style={styles.smallBtn} onPress={() => updateOrderStatus(o.id, s)}>
                  <Text style={styles.smallBtnText}>{s}</Text>
                </Pressable>
              ))}
              <Pressable style={styles.smallBtn} onPress={() => router.push({ pathname: '/order/[orderId]', params: { orderId: o.id } })}>
                <Text style={styles.smallBtnText}>Détails</Text>
              </Pressable>
              <Pressable style={[styles.smallBtn, { backgroundColor: '#b00020' }]} onPress={() => removeOrder(o.id)}>
                <Text style={[styles.smallBtnText, { color: '#fff' }]}>Supprimer</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800' },
  filterBtn: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, marginLeft: 8 },
  filterBtnActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  filterText: { color: COLORS.muted, fontWeight: '700' },
  filterTextActive: { color: COLORS.bg },
  empty: { color: COLORS.muted, marginTop: 16 },
  card: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 12, marginTop: 12 },
  cardTitle: { color: COLORS.text, fontWeight: '800' },
  cardMeta: { color: COLORS.muted, marginTop: 4 },
  amount: { color: COLORS.text, fontWeight: '800' },
  status: { color: COLORS.muted, marginTop: 4, fontWeight: '700' },
  ready: { color: '#0a7', },
  actions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  smallBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, marginRight: 8, marginTop: 6 },
  smallBtnText: { color: COLORS.bg, fontWeight: '800' },
});
