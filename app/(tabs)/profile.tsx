import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Image source={require('../../utils/logo.jpg')} style={styles.brandLogo} resizeMode="contain" />
      <Text style={styles.title}>Mon profil</Text>
      <Text style={styles.subtitle}>Paramètres à venir</Text>
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
  brandLogo: {
    width: 160,
    height: 40,
    marginBottom: 12,
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
