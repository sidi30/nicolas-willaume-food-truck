import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform, ScrollView } from 'react-native';
import { Slot, usePathname, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  muted: '#9a6c4c',
  primary: '#ee7c2b',
  border: '#f3ece7',
  chipBg: '#f7f1ec',
};

const NAV_ITEMS = [
  { href: '/admin', label: 'Tableau de bord', icon: 'grid-outline' as const },
  { href: '/admin/orders', label: 'Commandes', icon: 'receipt-outline' as const },
  { href: '/admin/menu', label: 'Menu & Burgers', icon: 'fast-food-outline' as const },
  { href: '/admin/schedule', label: 'Calendrier', icon: 'time-outline' as const },
  { href: '/admin/notifications', label: 'Notifications', icon: 'notifications-outline' as const },
  { href: '/admin/users', label: 'Utilisateurs', icon: 'people-outline' as const },
  { href: '/admin/trucks', label: 'Food Trucks', icon: 'bus-outline' as const },
];

export default function AdminLayout() {
  const pathname = usePathname();

  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.fill, { alignItems: 'center', justifyContent: 'center' }]}> 
        <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700', textAlign: 'center', padding: 16 }}>
          L'interface d'administration est disponible sur le web.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <View style={styles.brandBox}>
          <Image source={require('../../utils/logo.jpg')} style={styles.brandLogo} resizeMode="contain" />
          <Text style={styles.brandText}>Admin</Text>
        </View>
        <ScrollView>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Pressable
                key={item.href}
                style={[styles.navItem, active && styles.navItemActive]}
                onPress={() => router.push(item.href as any)}
              >
                <Ionicons name={item.icon} size={18} color={active ? COLORS.bg : COLORS.muted} />
                <Text style={[styles.navText, active && styles.navTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.content}> 
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.bg },
  sidebar: { width: 260, borderRightColor: COLORS.border, borderRightWidth: 1, padding: 16, backgroundColor: '#fff' },
  brandBox: { marginBottom: 16 },
  brandLogo: { width: 160, height: 40 },
  brandText: { marginTop: 6, color: COLORS.muted, fontWeight: '700' },
  navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12, marginBottom: 6 },
  navItemActive: { backgroundColor: COLORS.text },
  navText: { marginLeft: 8, color: COLORS.muted, fontWeight: '700' },
  navTextActive: { color: COLORS.bg },
  content: { flex: 1, padding: 20 },
});
