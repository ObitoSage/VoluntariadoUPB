import React from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function LogoutScreen() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const navigation = useNavigation();

  React.useEffect(() => {
    let isMounted = true;

    const showLogoutConfirmation = () => {
      if (!isMounted) return;

      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro que deseas cerrar sesión?',
        [
          {
            text: 'Cancelar',
            onPress: () => {
              if (isMounted) {
                navigation.goBack();
              }
            },
            style: 'cancel',
          },
          {
            text: 'Cerrar Sesión',
            onPress: async () => {
              if (!isMounted) return;

              try {
                await logout();
                if (isMounted) {
                  setTimeout(() => {
                    router.replace('/(auth)');
                  }, 0);
                }
              } catch (error) {
                console.error('Error during logout:', error);
                if (isMounted) {
                  Alert.alert('Error', 'No se pudo cerrar sesión');
                  navigation.goBack();
                }
              }
            },
            style: 'destructive',
          },
        ],
        { cancelable: false }
      );
    };

    showLogoutConfirmation();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
