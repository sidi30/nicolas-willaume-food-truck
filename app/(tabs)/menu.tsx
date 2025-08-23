import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, useWindowDimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const FALLBACK_CATEGORIES = ['Burgers', 'Wraps', 'Boissons', 'Desserts', 'Menus'];

// Items are sourced from AppContext.products; fallback constants kept for reference only

export default function MenuScreen() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string>('');
  const { addToCart, cartTotal, cartCount, products } = useApp();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const insets = useSafeAreaInsets();
  const tabBarSpace = 68 + 12 + insets.bottom; // tab height + margin + safe area

  const categories = useMemo(() => {
    const set = new Set<string>();
    (products || []).forEach((p) => set.add(p.category || 'Autres'));
    const list = Array.from(set);
    return list.length ? list : FALLBACK_CATEGORIES;
  }, [products]);

  useEffect(() => {
    if (!selected && categories.length) setSelected(categories[0]);
  }, [categories, selected]);

  const items = useMemo(() => {
    const source = (products as (Product & { desc?: string; category?: string })[]) || [];
    return source
      .filter((i) => (selected ? (i.category || 'Autres') === selected : true))
      .filter((i) => (i.title + ' ' + i.desc).toLowerCase().includes(query.toLowerCase()));
  }, [query, selected, products]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
      <Image source={require('../../utils/logo.jpg')} style={styles.brandLogo} resizeMode="contain" />
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
        {categories.map((cat) => {
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
        <View style={[styles.stickyFooter, { bottom: tabBarSpace }]}>
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
  brandLogo: {
    width: 140,
    height: 34,
    marginBottom: 8,
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
