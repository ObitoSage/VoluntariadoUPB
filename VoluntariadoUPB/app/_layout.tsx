import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { Stack, Slot } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';
import { useNotifications } from '../src/hooks/useNotifications';
import * as Notifications from 'expo-notifications';

// 🔔 Configurar el handler de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const { isLoading } = useAuthStore();
  
  // 🚀 INICIALIZAR SISTEMA DE NOTIFICACIONES
  useNotifications();
  
  useEffect(() => {
    console.log('🚀 App iniciada - Sistema de notificaciones activo');
  }, []);
  
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
