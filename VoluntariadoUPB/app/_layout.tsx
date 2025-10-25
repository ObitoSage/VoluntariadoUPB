import 'react-native-get-random-values';
import React from 'react';
import { Stack, Slot } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';

export default function RootLayout() {
  const { isLoading } = useAuthStore();

  if (isLoading) {
    return null;
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
