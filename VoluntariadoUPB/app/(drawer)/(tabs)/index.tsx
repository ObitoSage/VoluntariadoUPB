import React from 'react';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../theme/colors';

const createStyles = (colors: ThemeColors) =>
StyleSheet.create({
    container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 24,
    },
    title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
    },
    subtitle: {
    textAlign: 'center',
    color: colors.subtitle,
    marginBottom: 24,
    },
    link: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 12,
    },
});

export default function InicioScreen() {
const { colors } = useThemeColors();
const styles = React.useMemo(() => createStyles(colors), [colors]);

return (
    <View style={styles.container}>
    <Stack.Screen options={{ title: 'Inicio' }} />
    <Text style={styles.title}>Bienvenido a Voluntariado UPB</Text>
    <Text style={styles.subtitle}>Encuentra oportunidades de voluntariado en tu universidad.</Text>
    <Link href="/opportunities" style={styles.link}>
        Ver oportunidades →
    </Link>
    <Link href="/applications" style={styles.link}>
        Mis postulaciones →
    </Link>
    </View>
);
}
