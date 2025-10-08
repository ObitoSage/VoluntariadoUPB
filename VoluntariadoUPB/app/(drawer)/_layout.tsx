import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';

export default function DrawerLayout() {
  const { colors } = useThemeColors();

  return (
    <Drawer
      screenOptions={{
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.subtitle,
        drawerStyle: {
          backgroundColor: colors.drawerBackground,
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
        name="settings"
        options={{
          drawerLabel: 'Configuración',
          title: 'Configuración',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen
        name="logout"
        options={{
          drawerLabel: 'Cerrar Sesión',
          title: 'Cerrar Sesión',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
