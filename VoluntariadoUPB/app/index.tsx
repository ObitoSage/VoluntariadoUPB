import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/store/useAuthStore';
import { SplashScreen } from '../src/components';

export default function HomeRedirect() {
  const { user, isLoading } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Dar tiempo para que el listener de auth se inicialice
    const timer = setTimeout(() => {
      setChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Mostrar splash screen primero
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Mostrar un indicador de carga mientras se verifica el estado de autenticación
  if (isLoading || checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Si hay usuario autenticado, redirigir a la app principal
  if (user) {
    return <Redirect href="/(drawer)/(tabs)" />;
  }

  // Si no hay usuario, redirigir al login
  return <Redirect href="/(auth)/login" />;
}