import React, { useState } from 'react';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors, useUserProfile } from '../../src/hooks';
import { LogoutModal } from '../../src/components';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function DrawerLayout() {
  const { colors } = useThemeColors();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout } = useAuthStore();
  const { user: userProfile } = useUserProfile();
  const router = useRouter();

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 100);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <Drawer
        screenOptions={{
          drawerActiveTintColor: colors.primary,
          drawerInactiveTintColor: colors.subtitle,
          drawerStyle: {
            backgroundColor: colors.drawerBackground,
            paddingTop: 20,
          },
          drawerLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      >
        {/* Sección Principal */}
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: 'Inicio',
            title: 'Voluntariado UPB',
            headerShown: true,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        
        <Drawer.Screen
          name="about"
          options={{
            drawerLabel: 'Acerca de',
            title: 'Acerca de',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="information-circle" size={size} color={color} />
            ),
          }}
        />
        
        <Drawer.Screen
          name="chat"
          options={{
            drawerLabel: 'Chat con Plantini',
            title: 'Chat',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),
          }}
        />
        
        {/* Sección Administración */}
        {userProfile?.role === 'admin' && (
          <Drawer.Screen
            name="(admin)/gestion-ubicaciones"
            options={{
              drawerLabel: 'Gestión de Ubicaciones',
              title: 'Gestión de Ubicaciones',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="map" size={size} color={color} />
              ),
              drawerItemStyle: {
                marginTop: 20,
              },
            }}
          />
        )}
        
        {/* Sección Configuración */}
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: 'Configuración',
            title: 'Configuración',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
            drawerItemStyle: {
              marginTop: 20,
            },
          }}
        />
        
        {/* Cerrar Sesión - Estilo Destructivo */}
        <Drawer.Screen
          name="logout"
          options={{
            drawerLabel: 'Cerrar Sesión',
            title: 'Cerrar Sesión',
            drawerActiveTintColor: '#EF4444',
            drawerInactiveTintColor: '#DC2626',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="log-out" size={size} color={color} />
            ),
            drawerItemStyle: {
              marginTop: 8,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 8,
              marginHorizontal: 10,
            },
            drawerLabelStyle: {
              fontSize: 16,
              fontWeight: '700',
            },
          }}
          listeners={{
            drawerItemPress: (e) => {
              e.preventDefault();
              handleLogoutPress();
            },
          }}
        />
      </Drawer>

      <LogoutModal
        visible={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </>
  );
}
