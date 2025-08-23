import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { formatEuro } from '../utils/schedule';
import { router } from 'expo-router';

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
  chipBg: '#f7f1ec',
};

export default function RecapScreen() {
  const { cart, cartTotal, setQty, removeFromCart, city, slot, clearCart, placeOrder } = useApp();

  const canConfirm = cart.length > 0 && !!city && !!slot;

  const onConfirm = () => {
    const id = placeOrder();
    if (id) router.replace({ pathname: '/confirm', params: { orderId: id } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Récapitulatif</Text>

        <View style={styles.infoCard}>
          <View style={styles.row}><Text style={styles.label}>Ville</Text><Text style={styles.value}>{city || '—'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Créneau</Text><Text style={styles.value}>{slot ? new Date(slot).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'}</Text></View>
          <View style={styles.rowGap} />
          <View style={styles.rowBetween}>
            <Pressable onPress={() => router.push('/city')} style={styles.linkBtn}><Text style={styles.linkText}>Changer de ville</Text></Pressable>
            <Pressable onPress={() => router.push('/slot')} style={styles.linkBtn}><Text style={styles.linkText}>Changer l'heure</Text></Pressable>
          </View>
        </View>

        <View style={styles.card}>
          {cart.length === 0 ? (
            <View style={{ padding: 6 }}>
              <Text style={styles.muted}>Votre panier est vide.</Text>
              <Pressable onPress={() => router.push('/(tabs)/menu')} style={[styles.cta, { marginTop: 12 }]}>
                <Text style={styles.ctaText}>Ajouter des produits</Text>
              </Pressable>
            </View>
          ) : (
            cart.map((i) => (
              <View key={i.product.id} style={styles.itemRow}>
                <Text style={styles.itemTitle}>{i.product.title}</Text>
                <View style={styles.itemRight}>
                  <View style={styles.qtyBox}>
                    <Pressable onPress={() => setQty(i.product.id, Math.max(0, i.qty - 1))} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>−</Text></Pressable>
                    <Text style={styles.qtyText}>{i.qty}</Text>
                    <Pressable onPress={() => setQty(i.product.id, i.qty + 1)} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>＋</Text></Pressable>
                  </View>
                  <Text style={styles.itemPrice}>{formatEuro(i.qty * i.product.price)}</Text>
                  <Pressable onPress={() => removeFromCart(i.product.id)} style={styles.removeBtn}><Text style={styles.removeText}>Supprimer</Text></Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.stickyFooter}>
        <Pressable onPress={() => { clearCart(); }} style={[styles.secondaryBtn]}>
          <Text style={styles.secondaryText}>Vider</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatEuro(cartTotal)}</Text>
        </View>
        <Pressable style={[styles.payBtn, !canConfirm && { opacity: 0.5 }]} onPress={onConfirm} disabled={!canConfirm}>
          <Text style={styles.payBtnText}>Confirmer la commande</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 120 },
  header: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginBottom: 12 },
  infoCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 14, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rowGap: { height: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: COLORS.muted },
  value: { color: COLORS.text, fontWeight: '700' },
  linkBtn: { backgroundColor: COLORS.chipBg, borderColor: COLORS.border, borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  linkText: { color: COLORS.text, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 14 },
  muted: { color: COLORS.muted },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  itemTitle: { color: COLORS.text, fontWeight: '700' },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  qtyBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.chipBg, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 6, marginRight: 8 },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: COLORS.text, fontWeight: '900', fontSize: 16 },
  qtyText: { width: 28, textAlign: 'center', color: COLORS.text, fontWeight: '700' },
  itemPrice: { width: 90, textAlign: 'right', color: COLORS.text, fontWeight: '800' },
  removeBtn: { marginLeft: 10 },
  removeText: { color: '#b00020' },
  cta: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  ctaText: { color: COLORS.bg, fontWeight: '800' },
  stickyFooter: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: 'row', alignItems: 'center' },
  secondaryBtn: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14 },
  secondaryText: { color: COLORS.text, fontWeight: '800' },
  totalLabel: { color: COLORS.muted, fontSize: 12, marginLeft: 12 },
  totalValue: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginLeft: 12 },
  payBtn: { marginLeft: 12, backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 16 },
  payBtnText: { color: COLORS.bg, fontWeight: '800' },
});
