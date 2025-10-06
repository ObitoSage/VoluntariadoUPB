import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function MisPostulacionesScreen() {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Ionicons name="bookmark" size={80} color={colors.subtitle} />
      <Text style={[styles.title, { color: colors.text }]}>Mis Postulaciones</Text>
      <Text style={[styles.subtitle, { color: colors.subtitle }]}>
        Aquí verás todas tus postulaciones a voluntariados
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
