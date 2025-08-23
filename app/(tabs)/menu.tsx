import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, useWindowDimensions } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp, Product } from '../../context/AppContext';
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

const CATEGORIES = ['Burgers', 'Wraps', 'Boissons', 'Desserts', 'Menus'];

const SAMPLE_ITEMS: (Product & { desc: string; category: string })[] = [
  // Burgers
  { id: '1', title: 'Burger Classique', desc: 'Bœuf, cheddar, salade, tomate, sauce maison', price: 9.5, category: 'Burgers' },
  { id: '2', title: 'Burger Signature', desc: 'Bœuf maturé, double cheddar, oignons confits', price: 12, category: 'Burgers' },
  // Wraps
  { id: '3', title: 'Wrap Poulet', desc: 'Poulet croustillant, salade, tomate, sauce yaourt', price: 8.5, category: 'Wraps' },
  // Menus (combos)
  { id: 'm1', title: 'Menu Classique', desc: 'Burger Classique + Frites + Boisson', price: 13.5, category: 'Menus' },
  { id: 'm2', title: 'Menu Signature', desc: 'Burger Signature + Frites + Boisson', price: 16, category: 'Menus' },
  { id: 'm3', title: 'Menu Wrap', desc: 'Wrap Poulet + Frites + Boisson', price: 12, category: 'Menus' },
  // Boissons
  { id: 'b1', title: 'Coca-Cola 33cl', desc: 'Canette fraîche', price: 2.5, category: 'Boissons' },
  { id: 'b2', title: 'Eau minérale 50cl', desc: 'Plate', price: 1.8, category: 'Boissons' },
  { id: 'b3', title: 'Limonade artisanale 33cl', desc: 'Citron bio', price: 3.2, category: 'Boissons' },
  // Desserts
  { id: 'd1', title: 'Cookie chocolat', desc: 'Moelleux, pépites de chocolat', price: 2.2, category: 'Desserts' },
  { id: 'd2', title: 'Tiramisu maison', desc: 'Classique italien', price: 4.0, category: 'Desserts' },
  { id: 'd3', title: 'Cheesecake', desc: 'Coulis fruits rouges', price: 3.8, category: 'Desserts' },
];

export default function MenuScreen() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(CATEGORIES[0]);
  const { addToCart, cartTotal, cartCount } = useApp();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const tabBarHeight = useBottomTabBarHeight();

  const items = useMemo(() => {
    return SAMPLE_ITEMS
      .filter((i) => (selected ? i.category === selected : true))
      .filter((i) => (i.title + ' ' + i.desc).toLowerCase().includes(query.toLowerCase()));
  }, [query, selected]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.header}>Menu</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={COLORS.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un produit"
          placeholderTextColor={COLORS.muted}
          style={styles.searchInput}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {CATEGORIES.map((cat) => {
          const active = selected === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setSelected(cat)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.list, isWide && styles.listWide]}>
        {items.map((item) => (
          <View key={item.id} style={[styles.card, isWide && styles.cardWide]}>
            <View style={styles.cardImage} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardPrice}>{formatEuro(item.price)}</Text>
                <Pressable style={styles.addBtn} onPress={() => addToCart(item, 1)}>
                  <Ionicons name="add" size={18} color={COLORS.bg} />
                  <Text style={styles.addBtnText}>Ajouter</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </View>
      </ScrollView>

      {cartCount > 0 && (
        <View style={[styles.stickyFooter, { bottom: tabBarHeight }] }>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatEuro(cartTotal)}</Text>
          </View>
          <Pressable style={styles.payBtn} onPress={() => router.push('/recap')}>
            <Ionicons name="cart-outline" size={18} color={COLORS.bg} />
            <Text style={styles.payBtnText}>Voir le panier</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.text,
  },
  chips: {
    marginTop: 12,
  },
  chip: {
    backgroundColor: COLORS.chipBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  chipText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.bg,
  },
  list: {
    marginTop: 16,
  },
  listWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWide: {
    width: '48%',
  },
  stickyFooter: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { color: COLORS.muted, fontSize: 12 },
  totalValue: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  payBtn: { backgroundColor: COLORS.primary, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  payBtnText: { color: COLORS.bg, fontWeight: '800', marginLeft: 8 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderColor: COLORS.border,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardImage: {
    width: 88,
    backgroundColor: COLORS.chipBg,
  },
  cardBody: {
    flex: 1,
    padding: 12,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cardDesc: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPrice: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBtnText: {
    color: COLORS.bg,
    fontWeight: '700',
    marginLeft: 6,
  },
});
