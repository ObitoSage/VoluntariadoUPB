import React from 'react';
import { StyleSheet, Switch, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../src/hooks/useThemeColors';
import { useThemeStore } from '../../src/store/useThemeStore';
import type { ThemeColors } from '../theme/colors';

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.subtitle,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    preferenceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    preferenceLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 16,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    preferenceTextContainer: {
      flex: 1,
    },
    preferenceLabel: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '600',
      marginBottom: 4,
    },
    preferenceDescription: {
      fontSize: 13,
      color: colors.subtitle,
      lineHeight: 18,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    infoText: {
      fontSize: 14,
      color: colors.subtitle,
      lineHeight: 20,
    },
  });

const SettingsScreen = () => {
  const { theme, colors } = useThemeColors();
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apariencia</Text>
          <View style={styles.card}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons 
                    name={theme === 'dark' ? 'moon' : 'sunny'} 
                    size={22} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.preferenceTextContainer}>
                  <Text style={styles.preferenceLabel}>Modo Oscuro</Text>
                  <Text style={styles.preferenceDescription}>
                    {theme === 'dark' 
                      ? 'Tema oscuro activado' 
                      : 'Tema claro activado'}
                  </Text>
                </View>
              </View>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ 
                  false: colors.switchTrackOff, 
                  true: colors.switchTrackOn 
                }}
                thumbColor={colors.switchThumb}
                ios_backgroundColor={colors.switchTrackOff}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                💡 El modo oscuro reduce el brillo de la pantalla y ayuda a descansar 
                la vista, especialmente en ambientes con poca luz.
              </Text>
            </View>
          </View>
        </View>

        {/* Notificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          <View style={styles.card}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#10b98120' }]}>
                  <Ionicons name="notifications" size={22} color="#10b981" />
                </View>
                <View style={styles.preferenceTextContainer}>
                  <Text style={styles.preferenceLabel}>Notificaciones Push</Text>
                  <Text style={styles.preferenceDescription}>
                    Próximamente disponible
                  </Text>
                </View>
              </View>
              <Switch
                value={false}
                disabled
                trackColor={{ false: colors.muted, true: colors.primary }}
                thumbColor={colors.switchThumb}
              />
            </View>
          </View>
        </View>

        {/* Privacidad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidad y Seguridad</Text>
          <View style={styles.card}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#f5901720' }]}>
                  <Ionicons name="shield-checkmark" size={22} color="#f59e0b" />
                </View>
                <View style={styles.preferenceTextContainer}>
                  <Text style={styles.preferenceLabel}>Datos de Perfil</Text>
                  <Text style={styles.preferenceDescription}>
                    Gestiona tu información personal
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.subtitle} />
            </View>
          </View>
        </View>

        {/* Información de la App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca de</Text>
          <View style={styles.card}>
            <View style={[styles.preferenceRow, { paddingVertical: 8 }]}>
              <Text style={styles.preferenceDescription}>Versión</Text>
              <Text style={[styles.preferenceLabel, { fontSize: 14 }]}>1.0.1</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={[styles.preferenceRow, { paddingVertical: 8 }]}>
              <Text style={styles.preferenceDescription}>Desarrollado por</Text>
              <Text style={[styles.preferenceLabel, { fontSize: 14 }]}>Camilo - Edwin - Fabian</Text>
            </View>
          </View>
        </View>

        {/* Espacio adicional al final */}
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;
