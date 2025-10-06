import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../theme/colors';

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
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
    },
    copy: {
    textAlign: 'center',
    color: colors.subtitle,
    },
});

const ProfileScreen = () => {
const { colors } = useThemeColors();
const styles = React.useMemo(() => createStyles(colors), [colors]);

return (
    <View style={styles.container}>
    <Stack.Screen options={{ title: 'Perfil' }} />
    <Text style={styles.title}>Perfil de Usuario</Text>
    <Text style={styles.copy}>Gestiona tu información personal y preferencias.</Text>
    </View>
);
};

export default ProfileScreen;