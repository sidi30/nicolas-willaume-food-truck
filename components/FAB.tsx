import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  label?: string;
  onPress: () => void;
  style?: ViewStyle;
};

const COLORS = {
  bg: '#fcfaf8',
  text: '#1b130d',
  primary: '#ee7c2b',
};

export default function FAB({ label = 'Commander', onPress, style }: Props) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.fab, style]}
      android_ripple={{ color: 'rgba(255,255,255,0.2)' }}>
      <Ionicons name="cart-outline" size={18} color={COLORS.bg} />
      <Text style={styles.fabText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    // Shadows
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  fabText: {
    color: COLORS.bg,
    fontWeight: '800',
    marginLeft: 8,
  },
});
