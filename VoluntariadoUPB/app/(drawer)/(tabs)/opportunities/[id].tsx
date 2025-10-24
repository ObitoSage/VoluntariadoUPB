import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { useAuthStore } from '../../../store/useAuthStore';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { Oportunidad, COLLECTIONS } from '../../../../src/types';

type DisponibilidadType = 'fin_de_semana' | 'entre_semana' | 'flexible';

export default function OportunidadDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme, colors } = useThemeColors();
  const { user } = useAuthStore();

  const [voluntariado, setVoluntariado] = useState<Oportunidad | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para el modal de postulación
  const [modalVisible, setModalVisible] = useState(false);
  const [motivacion, setMotivacion] = useState('');
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadType>('flexible');
  const [telefono, setTelefono] = useState('');
  const [errors, setErrors] = useState<{ motivacion?: string; telefono?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar oportunidad desde Firebase
  useEffect(() => {
    const fetchOportunidad = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const oportunidadRef = doc(db, COLLECTIONS.OPORTUNIDADES, id as string);
        const oportunidadSnap = await getDoc(oportunidadRef);
        
        if (oportunidadSnap.exists()) {
          setVoluntariado({
            id: oportunidadSnap.id,
            ...oportunidadSnap.data(),
          } as Oportunidad);
        } else {
          setVoluntariado(null);
        }
      } catch (error) {
        console.error('Error fetching oportunidad:', error);
        setVoluntariado(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOportunidad();
  }, [id]);
  
  const screenColors = {
    cardBackground: colors.surface,
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#FF6B6B',
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Cargando oportunidad...
          </Text>
        </View>
      </View>
    );
  }

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
      social: '#FF6B6B',
      ambiental: '#95E1D3',
      educativo: '#4ECDC4',
      cultural: '#AA96DA',
    };
    return categoryColors[categoria] || colors.primary;
  };

  const disponibles = voluntariado.cuposDisponibles || 0;
  const porcentajeOcupado = ((voluntariado.cupos - disponibles) / voluntariado.cupos) * 100;
  const isCompleto = disponibles <= 0;

  // Formatear fecha si es un timestamp
  const formatDeadline = (deadline: any) => {
    if (!deadline) return 'Fecha no especificada';
    const date = deadline.toDate ? deadline.toDate() : new Date(deadline);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format ubicación para mostrar
  const ubicacionText = voluntariado.ubicacion
    ? `${voluntariado.ciudad}, ${voluntariado.campus}`
    : `${voluntariado.campus}, ${voluntariado.ciudad}`;

  const validateForm = (): boolean => {
    const newErrors: { motivacion?: string; telefono?: string } = {};
    
    // Validar motivación
    if (!motivacion.trim()) {
      newErrors.motivacion = 'La motivación es requerida';
    } else if (motivacion.trim().length < 50) {
      newErrors.motivacion = `Mínimo 50 caracteres (actual: ${motivacion.trim().length})`;
    }
    
    // Validar teléfono (opcional pero si se ingresa debe ser válido)
    if (telefono.trim() && !/^[+]?[0-9\s-]{7,15}$/.test(telefono.trim())) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAplicar = () => {
    if (isCompleto) {
      Alert.alert(
        'Voluntariado Completo',
        'Lo sentimos, este voluntariado ya alcanzó el número máximo de participantes.',
        [{ text: 'Entendido' }]
      );
    } else {
      // Abrir modal de postulación
      setModalVisible(true);
    }
  };

  const handleSubmitPostulacion = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.uid) {
      Alert.alert('Error', 'Debes iniciar sesión para postularte');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Crear postulación en Firebase
      const postulacionData = {
        estudianteId: user.uid,
        oportunidadId: id,
        titulo: voluntariado.titulo,
        organizacion: voluntariado.organizacion,
        descripcion: voluntariado.descripcion,
        location: `${voluntariado.campus}, ${voluntariado.ciudad}`,
        status: 'pending',
        motivacion,
        disponibilidad,
        telefono: telefono || '',
        applicationDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, COLLECTIONS.POSTULACIONES), postulacionData);
      
      setIsSubmitting(false);
      setModalVisible(false);
      
      // Limpiar formulario
      setMotivacion('');
      setTelefono('');
      setDisponibilidad('flexible');
      setErrors({});
      
      Alert.alert(
        '¡Postulación Exitosa!',
        'Tu postulación ha sido registrada. La organización se pondrá en contacto contigo.',
        [{ 
          text: 'Excelente',
          onPress: () => router.back()
        }]
      );
    } catch (error) {
      console.error('Error al crear postulación:', error);
      setIsSubmitting(false);
      Alert.alert(
        'Error',
        'No se pudo registrar tu postulación. Por favor intenta de nuevo.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancelPostulacion = () => {
    setModalVisible(false);
    setMotivacion('');
    setTelefono('');
    setDisponibilidad('flexible');
    setErrors({});
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
            <Ionicons name="heart" size={48} color={getCategoryColor(voluntariado.categoria)} />
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
              <Text style={[styles.infoLabel, { color: colors.subtitle }]}>Fecha límite</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{formatDeadline(voluntariado.deadline)}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="time" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.subtitle }]}>Horas por semana</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{voluntariado.horasSemana} horas</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="location" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.subtitle }]}>Ubicación</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{ubicacionText}</Text>
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
                  {disponibles} / {voluntariado.cupos}
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
              {voluntariado.cupos - disponibles} personas ya se han postulado
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

        {/* Habilidades requeridas */}
        {voluntariado.habilidades && voluntariado.habilidades.length > 0 && (
        <View style={[styles.section, { backgroundColor: screenColors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Habilidades Requeridas</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {voluntariado.habilidades.map((habilidad: string, index: number) => (
              <View 
                key={index} 
                style={{
                  backgroundColor: colors.primary + '20',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
              >
                <Text style={[styles.listItemText, { color: colors.primary }]}>{habilidad}</Text>
              </View>
            ))}
          </View>
        </View>
        )}

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

      {/* Modal de Postulación */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCancelPostulacion}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            {/* Header del Modal */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={handleCancelPostulacion}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Postular</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Título de la oportunidad */}
              <View style={[styles.modalOppInfo, { backgroundColor: colors.surface }]}>
                <Text style={[styles.modalOppTitle, { color: colors.text }]}>
                  {voluntariado.titulo}
                </Text>
                <Text style={[styles.modalOppOrg, { color: colors.subtitle }]}>
                  {voluntariado.organizacion}
                </Text>
              </View>

              {/* Campo de Motivación */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  ¿Por qué quieres ser voluntario? *
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    { 
                      backgroundColor: colors.surface,
                      borderColor: errors.motivacion ? '#FF6B6B' : colors.border,
                      color: colors.text 
                    }
                  ]}
                  placeholder="Cuéntanos tu motivación para participar en este voluntariado..."
                  placeholderTextColor={colors.subtitle}
                  multiline
                  numberOfLines={6}
                  value={motivacion}
                  onChangeText={(text) => {
                    setMotivacion(text);
                    if (errors.motivacion) {
                      setErrors({ ...errors, motivacion: undefined });
                    }
                  }}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <View style={styles.textAreaFooter}>
                  {errors.motivacion ? (
                    <Text style={styles.errorText}>{errors.motivacion}</Text>
                  ) : (
                    <Text style={[styles.hintText, { color: colors.subtitle }]}>
                      Mínimo 50 caracteres
                    </Text>
                  )}
                  <Text style={[styles.charCount, { color: colors.subtitle }]}>
                    {motivacion.length}/500
                  </Text>
                </View>
              </View>

              {/* Disponibilidad */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  ¿Cuándo estás disponible? *
                </Text>
                <View style={styles.radioGroup}>
                  {[
                    { key: 'fin_de_semana', label: 'Fines de semana', icon: 'calendar' },
                    { key: 'entre_semana', label: 'Entre semana', icon: 'briefcase' },
                    { key: 'flexible', label: 'Flexible', icon: 'time' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.radioOption,
                        {
                          backgroundColor: colors.surface,
                          borderColor: disponibilidad === option.key ? colors.primary : colors.border,
                          borderWidth: disponibilidad === option.key ? 2 : 1,
                        }
                      ]}
                      onPress={() => setDisponibilidad(option.key as DisponibilidadType)}
                    >
                      <View style={[
                        styles.radioCircle,
                        { borderColor: disponibilidad === option.key ? colors.primary : colors.border }
                      ]}>
                        {disponibilidad === option.key && (
                          <View style={[styles.radioCircleInner, { backgroundColor: colors.primary }]} />
                        )}
                      </View>
                      <Ionicons 
                        name={option.icon as any} 
                        size={20} 
                        color={disponibilidad === option.key ? colors.primary : colors.subtitle} 
                      />
                      <Text style={[
                        styles.radioLabel,
                        { color: disponibilidad === option.key ? colors.text : colors.subtitle }
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Teléfono */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  Teléfono de contacto (opcional)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.surface,
                      borderColor: errors.telefono ? '#FF6B6B' : colors.border,
                      color: colors.text 
                    }
                  ]}
                  placeholder="+591 70000000"
                  placeholderTextColor={colors.subtitle}
                  keyboardType="phone-pad"
                  value={telefono}
                  onChangeText={(text) => {
                    setTelefono(text);
                    if (errors.telefono) {
                      setErrors({ ...errors, telefono: undefined });
                    }
                  }}
                />
                {errors.telefono && (
                  <Text style={styles.errorText}>{errors.telefono}</Text>
                )}
              </View>

              {/* Info adicional */}
              <View style={[styles.infoBox, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Tu postulación será revisada por la organización. Te contactarán por correo o teléfono.
                </Text>
              </View>
            </ScrollView>

            {/* Footer del Modal */}
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleCancelPostulacion}
                disabled={isSubmitting}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                  isSubmitting && { opacity: 0.6 }
                ]}
                onPress={handleSubmitPostulacion}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Text style={styles.submitButtonText}>Enviando...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#fff" />
                    <Text style={styles.submitButtonText}>Enviar Postulación</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 4,
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
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalKeyboardView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalOppInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  modalOppTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalOppOrg: {
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 120,
  },
  textAreaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  hintText: {
    fontSize: 12,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
});
