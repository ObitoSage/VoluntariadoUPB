import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { Stack, Slot } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';

export default function RootLayout() {
  const { isLoading } = useAuthStore();
  
  if (isLoading) {
    // Retornar el Stack vacío para que la navegación funcione
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(drawer)" />
        <Slot />
      </Stack>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(drawer)" />
        <Slot />
      </Stack>
    </>
  );
}
