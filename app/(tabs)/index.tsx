import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>William Food Truck</Text>
        <Text style={styles.muted}>Street food gourmande</Text>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.heroTitle}>Bienvenue !</Text>
        <Text style={styles.heroSubtitle}>Choisissez votre ville, un créneau, et composez votre burger ✨</Text>
      </View>

      <View style={styles.tiles}>
        <Link href="/city" asChild>
          <Pressable style={styles.tile}>
            <Text style={styles.tileTitle}>Commander</Text>
            <Text style={styles.tileSubtitle}>En quelques étapes</Text>
          </Pressable>
        </Link>
        <Link href="/(tabs)/orders" asChild>
          <Pressable style={styles.tile}>
            <Text style={styles.tileTitle}>Mes commandes</Text>
            <Text style={styles.tileSubtitle}>Historique & suivi</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Nouveau</Text>
        <Text style={styles.infoText}>Retrait express avec notification quand c’est prêt. Pas d’attente au camion.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcfaf8',
    padding: 16,
  },
  header: {
    marginTop: 8,
    marginBottom: 16,
  },
  brand: {
    fontSize: 24,
    color: '#1b130d',
    fontWeight: '800',
  },
  muted: {
    fontSize: 14,
    color: '#9a6c4c',
    marginTop: 4,
  },
  welcomeCard: {
    backgroundColor: '#f7f1ec',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f3ece7',
    padding: 20,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    color: '#1b130d',
    fontWeight: '800',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#9a6c4c',
    marginTop: 6,
  },
  tiles: { flexDirection: 'row' },
  tile: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f3ece7',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
  },
  tileTitle: { color: '#1b130d', fontWeight: '800', fontSize: 16 },
  tileSubtitle: { color: '#9a6c4c', marginTop: 6 },
  infoCard: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f3ece7',
    borderRadius: 16,
    padding: 16,
  },
  infoTitle: { color: '#1b130d', fontWeight: '800', marginBottom: 6 },
  infoText: { color: '#9a6c4c' },
});

