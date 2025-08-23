import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OrdersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes commandes</Text>
      <Text style={styles.subtitle}>Aucune commande pour le moment</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fcfaf8',
    padding: 24,
  },
  title: {
    fontSize: 22,
    color: '#1b130d',
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9a6c4c',
  },
});
