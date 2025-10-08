import React, { useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

export default function LogoutScreen() {
  const { logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro que deseas cerrar sesión?',
        [
          {
            text: 'Cancelar',
            onPress: () => router.back(),
            style: 'cancel',
          },
          {
            text: 'Cerrar Sesión',
            onPress: async () => {
              try {
                await logout();
                router.replace('/(auth)/login');
              } catch (error) {
                Alert.alert('Error', 'No se pudo cerrar sesión');
                router.back();
              }
            },
            style: 'destructive',
          },
        ]
      );
    };

    handleLogout();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
