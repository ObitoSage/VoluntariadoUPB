import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function PerfilScreen() {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Ionicons name="person" size={80} color={colors.subtitle} />
      <Text style={[styles.title, { color: colors.text }]}>Perfil</Text>
      <Text style={[styles.subtitle, { color: colors.subtitle }]}>
        Gestiona tu información personal y preferencias
      </Text>
      <Text style={[styles.comingSoon, { color: colors.subtitle }]}>
        🚧 Próximamente
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  comingSoon: {
    fontSize: 14,
    marginTop: 8,
  },
});
