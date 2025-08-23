import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { formatEuro } from '../../utils/schedule';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
  chipBg: '#f7f1ec',
};

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { orders, clearCart, addToCart, setCity, setSlot } = useApp();
  const order = useMemo(() => orders.find((o) => o.id === orderId), [orders, orderId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={require('../../utils/logo.jpg')} style={styles.brandLogo} resizeMode="contain" />
        <View style={styles.headerRow}>
          <Text style={styles.header}>Détails commande {order ? `#${order.id}` : ''}</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={18} color={COLORS.text} />
            <Text style={styles.backText}>Retour</Text>
          </Pressable>
        </View>

        {!order ? (
          <Text style={styles.muted}>Commande introuvable.</Text>
        ) : (
          <>
            <View style={styles.metaCard}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Statut</Text>
                <Text style={styles.metaValue}>{order.status}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>{new Date(order.date).toLocaleString('fr-FR')}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Ville</Text>
                <Text style={styles.metaValue}>{order.city || '—'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Créneau</Text>
                <Text style={styles.metaValue}>
                  {order.slot
                    ? new Date(order.slot).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Vos burgers</Text>
            {order.items.map((it) => (
              <View key={it.product.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{it.product.title}</Text>
                  {!!it.product.desc && <Text style={styles.itemDesc}>{it.product.desc}</Text>}
                  <Text style={styles.qtyPrice}>x{it.qty} · {formatEuro(it.product.price)} / unité</Text>
                </View>
                <Text style={styles.lineTotal}>{formatEuro(it.qty * it.product.price)}</Text>
              </View>
            ))}

            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatEuro(order.total)}</Text>
            </View>

            <View style={styles.actionsRow}>
              <Pressable style={styles.primaryBtn} onPress={() => router.push({ pathname: '/track', params: { orderId: order.id } })}>
                <Ionicons name="navigate-outline" size={18} color={COLORS.bg} />
                <Text style={styles.primaryText}>Suivre la préparation</Text>
              </Pressable>
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => {
                  if (!order) return;
                  // Reset and re-fill cart
                  clearCart();
                  setCity(order.city || null);
                  setSlot(order.slot || null);
                  order.items.forEach((it) => addToCart(it.product, it.qty));
                  router.replace('/recap');
                }}
              >
                <Text style={styles.secondaryText}>Commander à nouveau</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 24 },
  brandLogo: { width: 140, height: 34, marginBottom: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  header: { fontSize: 22, color: COLORS.text, fontWeight: '800' },
  backBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  backText: { color: COLORS.text, fontWeight: '700', marginLeft: 6 },
  muted: { color: COLORS.muted },

  metaCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 14, marginBottom: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metaLabel: { color: COLORS.muted },
  metaValue: { color: COLORS.text, fontWeight: '700' },

  sectionTitle: { marginTop: 6, marginBottom: 10, color: COLORS.text, fontWeight: '800' },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, marginBottom: 10 },
  itemTitle: { color: COLORS.text, fontWeight: '800' },
  itemDesc: { color: COLORS.muted, marginTop: 2 },
  qtyPrice: { color: COLORS.muted, marginTop: 6 },
  lineTotal: { color: COLORS.text, fontWeight: '800', marginLeft: 12 },

  totalCard: { marginTop: 4, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: COLORS.muted },
  totalValue: { color: COLORS.text, fontWeight: '800' },

  actionsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  primaryBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginRight: 8 },
  primaryText: { color: COLORS.bg, fontWeight: '800', marginLeft: 8 },
  secondaryBtn: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  secondaryText: { color: COLORS.text, fontWeight: '800' },
});
