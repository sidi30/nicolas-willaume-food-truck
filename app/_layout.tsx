import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#fcfaf8' }}>
      <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'auto'} />
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
