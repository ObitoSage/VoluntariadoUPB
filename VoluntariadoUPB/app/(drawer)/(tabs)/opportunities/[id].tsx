import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVoluntariadoStore } from '../../../store/voluntariadoStore';
import { useThemeColors } from '../../../hooks/useThemeColors';

export default function OportunidadDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme, colors } = useThemeColors();

  const getVoluntariadoById = useVoluntariadoStore((state) => state.getVoluntariadoById);
  const voluntariado = getVoluntariadoById(id as string);
  
  const screenColors = {
    cardBackground: colors.surface,
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#FF6B6B',
  };

  if (!voluntariado) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.subtitle} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Voluntariado no encontrado
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getCategoryColor = (categoria: string) => {
    const categoryColors: Record<string, string> = {
      animales: '#FF6B6B',
      educacion: '#4ECDC4',
      'medio-ambiente': '#95E1D3',
      salud: '#F38181',
      comunidad: '#AA96DA',
    };
    return categoryColors[categoria] || colors.primary;
  };

  const disponibles = voluntariado.participantesMaximos - voluntariado.participantesActuales;
  const porcentajeOcupado = (voluntariado.participantesActuales / voluntariado.participantesMaximos) * 100;
  const isCompleto = disponibles <= 0;

  const handleAplicar = () => {
    if (isCompleto) {
      Alert.alert(
        'Voluntariado Completo',
        'Lo sentimos, este voluntariado ya alcanzó el número máximo de participantes.',
        [{ text: 'Entendido' }]
      );
    } else {
      Alert.alert(
        'Confirmar Postulación',
        `¿Deseas postularte al voluntariado "${voluntariado.titulo}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Postular',
            onPress: () => {
              Alert.alert(
                '¡Postulación Exitosa!',
                'Tu postulación ha sido registrada. La organización se pondrá en contacto contigo.',
                [{ text: 'Excelente' }]
              );
            },
          },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header con emoji y categoría */}
        <View style={[styles.header, { backgroundColor: screenColors.cardBackground }]}>
          <View style={[styles.emojiContainer, { backgroundColor: getCategoryColor(voluntariado.categoria) + '20' }]}>
            <Text style={styles.emoji}>{voluntariado.imagen}</Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(voluntariado.categoria) }]}>
            <Text style={styles.categoryText}>{voluntariado.categoria.toUpperCase()}</Text>
          </View>
        </View>

        {/* Título y Organización */}
        <View style={[styles.section, { backgroundColor: screenColors.cardBackground }]}>
          <Text style={[styles.title, { color: colors.text }]}>{voluntariado.titulo}</Text>
          <View style={styles.organizationRow}>
            <Ionicons name="business" size={18} color={colors.primary} />
            <Text style={[styles.organizationText, { color: colors.primary }]}>
              {voluntariado.organizacion}
            </Text>
          </View>
        </View>

        {/* Información clave */}
        <View style={[styles.section, { backgroundColor: screenColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Información General</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.subtitle }]}>Fecha</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{voluntariado.fecha}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="time" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.subtitle }]}>Duración</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{voluntariado.duracion}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="location" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.subtitle }]}>Ubicación</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{voluntariado.ubicacion}</Text>
            </View>
          </View>
        </View>

        {/* Disponibilidad */}
        <View style={[styles.section, { backgroundColor: screenColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Disponibilidad</Text>
          
          <View style={styles.availabilityCard}>
            <View style={styles.availabilityHeader}>
              <Ionicons 
                name="people" 
                size={24} 
                color={isCompleto ? screenColors.danger : screenColors.success} 
              />
              <View style={styles.availabilityTextContainer}>
                <Text style={[styles.availabilityNumber, { color: colors.text }]}>
                  {disponibles} / {voluntariado.participantesMaximos}
                </Text>
                <Text style={[styles.availabilityLabel, { color: colors.subtitle }]}>
                  lugares disponibles
                </Text>
              </View>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${porcentajeOcupado}%`,
                    backgroundColor: isCompleto ? screenColors.danger : screenColors.success
                  }
                ]} 
              />
            </View>
            
            <Text style={[styles.participantesInfo, { color: colors.subtitle }]}>
              {voluntariado.participantesActuales} personas ya se han postulado
            </Text>
          </View>
        </View>

        {/* Descripción */}
        <View style={[styles.section, { backgroundColor: screenColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Descripción</Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {voluntariado.descripcion}
          </Text>
        </View>

        {/* Requisitos */}
        <View style={[styles.section, { backgroundColor: screenColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Requisitos</Text>
          {voluntariado.requisitos.map((requisito, index) => (
            <View key={index} style={styles.listItem}>
              <View style={[styles.bulletPoint, { backgroundColor: colors.primary }]} />
              <Text style={[styles.listItemText, { color: colors.text }]}>{requisito}</Text>
            </View>
          ))}
        </View>

        {/* Beneficios */}
        <View style={[styles.section, { backgroundColor: screenColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Beneficios</Text>
          {voluntariado.beneficios.map((beneficio, index) => (
            <View key={index} style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={20} color={screenColors.success} />
              <Text style={[styles.listItemText, { color: colors.text }]}>{beneficio}</Text>
            </View>
          ))}
        </View>

        {/* Espaciado para el botón fijo */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón de postulación fijo */}
      <View style={[styles.footer, { backgroundColor: screenColors.cardBackground, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.applyButton,
            {
              backgroundColor: isCompleto ? colors.muted : colors.primary,
            },
          ]}
          onPress={handleAplicar}
          activeOpacity={0.8}
        >
          <Ionicons name={isCompleto ? 'close-circle' : 'send'} size={20} color="#ffffff" />
          <Text style={styles.applyButtonText}>
            {isCompleto ? 'Voluntariado Completo' : 'Postular a este Voluntariado'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  emojiContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 50,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 12,
  },
  organizationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  organizationText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E220',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  availabilityCard: {
    gap: 12,
  },
  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  availabilityTextContainer: {
    flex: 1,
  },
  availabilityNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  availabilityLabel: {
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  participantesInfo: {
    fontSize: 13,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
