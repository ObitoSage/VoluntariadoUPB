import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../theme/colors';
import { useUserProfile } from '../../../../src/hooks/useUserProfile';
import { useAuthStore } from '../../../store/useAuthStore';
import { ImagePicker } from '../../../../src/components/ImagePicker';
import { CAMPUS_OPTIONS } from '../../../../src/types';
import type { User } from '../../../../src/types';

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    header: {
      alignItems: 'center',
      paddingTop: 20,
      paddingBottom: 32,
      paddingHorizontal: 24,
      position: 'relative',
    },
    profileImageContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: colors.primary,
      marginBottom: 20,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    profilePlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary + '20',
    },
    name: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    studentId: {
      fontSize: 14,
      color: colors.subtitle,
      marginBottom: 4,
    },
    career: {
      fontSize: 14,
      color: colors.subtitle,
    },
    dashboardSection: {
      paddingHorizontal: 20,
      marginBottom: 28,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      letterSpacing: 0.3,
    },
    dashboardGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    dashboardCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    dashboardCardLarge: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    cardIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardValue: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 4,
    },
    cardLabel: {
      fontSize: 12,
      color: colors.subtitle,
    },
    cardLabelLarge: {
      fontSize: 14,
      color: colors.subtitle,
      marginBottom: 4,
    },
    impactSection: {
      paddingHorizontal: 20,
      marginBottom: 28,
    },
    impactGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    impactCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    impactIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    impactTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    impactSubtitle: {
      fontSize: 12,
      color: colors.subtitle,
      textAlign: 'center',
    },
    activitySection: {
      paddingHorizontal: 20,
    },
    activityList: {
      gap: 12,
    },
    activityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      gap: 16,
    },
    activityIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    activityDate: {
      fontSize: 13,
      color: colors.subtitle,
    },
    activityValue: {
      fontSize: 16,
      fontWeight: '700',
    },
    viewAllButton: {
      alignItems: 'center',
      paddingVertical: 12,
      marginTop: 12,
    },
    viewAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    editButton: {
      position: 'absolute',
      top: 12,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },
    editButtonText: {
      fontSize: 14,
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
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: 32,
      paddingVertical: 20,
    },
    formGroup: {
      marginBottom: 24,
    },
    formLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      minHeight: 48,
    },
    textArea: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      minHeight: 120,
      textAlignVertical: 'top',
    },
    textAreaFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    charCount: {
      fontSize: 12,
      fontWeight: '600',
    },
    errorText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FF6B6B',
      marginTop: 4,
    },
    campusGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    campusOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
      flex: 1,
      minWidth: '45%',
      maxWidth: '48%',
    },
    campusLabel: {
      fontSize: 14,
      fontWeight: '500',
    },
    interestInputContainer: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
      alignItems: 'center',
    },
    interestInput: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      minHeight: 48,
    },
    addInterestButton: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    interestsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 8,
    },
    interestChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 20,
      gap: 8,
      minHeight: 36,
    },
    interestChipText: {
      fontSize: 13,
      fontWeight: '600',
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
  });

const ProfileScreen = () => {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  
  const currentUser = useAuthStore((state) => state.user);
  const { user: profile, loading, updateProfile } = useUserProfile();

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [editForm, setEditForm] = useState<Partial<User>>({
    nombre: '',
    bio: '',
    campus: '',
    carrera: '',
    semestre: 0,
    telefono: '',
    avatar: '',
    intereses: [],
  });
  
  const [newInterest, setNewInterest] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos del perfil al abrir el modal
  useEffect(() => {
    if (modalVisible && profile) {
      setEditForm({
        nombre: profile.nombre || '',
        bio: profile.bio || '',
        campus: profile.campus || '',
        carrera: profile.carrera || '',
        semestre: profile.semestre || 0,
        telefono: profile.telefono || '',
        avatar: profile.avatar || '',
        intereses: profile.intereses || [],
      });
    }
  }, [modalVisible, profile]);

  // Mock data (siguiendo el patrón del proyecto)
  const userData = {
    name: profile?.nombre || 'Administrator',
    hoursLogged: 0,
    upcomingEvents: 3,
    badgesEarned: 12,
    certificates: 5,
    topVolunteer: 7,
  };

  const activities = [
    {
      id: '1',
      title: 'Cuidado de animales en refugio',
      date: 'Octubre 10, 2025',
      value: '10 horas becarias',
      icon: 'trending-up',
      iconBg: '#FFB4B4',
    },
    {
      id: '2',
      title: 'Educacion rural - apoyo escolar' ,
      date: 'Octubre 25, 2024',
      value: '2 horas becarias',
      icon: 'time',
      iconBg: '#B4FFB4',
    },
    {
      id: '3',
      title: 'Limpieza de parques y plazas',
      date: 'Noviembre 18, 2024',
      value: '6 horas becarias',
      icon: 'school',
      iconBg: '#B4D4FF',
    },
  ];

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!editForm.nombre?.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (editForm.bio && editForm.bio.length > 300) {
      newErrors.bio = 'La biografía no puede exceder 300 caracteres';
    }
    
    if (editForm.telefono && !/^\+?\d{8,15}$/.test(editForm.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleOpenEditModal = () => {
    setModalVisible(true);
  };

  const handleCancelEdit = () => {
    setModalVisible(false);
    setErrors({});
    setNewInterest('');
  };

  const handleSubmitEdit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateProfile(editForm);
      if (result.success) {
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelected = (url: string) => {
    setEditForm({ ...editForm, avatar: url });
  };

  const handleAddInterest = () => {
    const trimmedInterest = newInterest.trim();
    if (trimmedInterest && !editForm.intereses?.includes(trimmedInterest)) {
      setEditForm({
        ...editForm,
        intereses: [...(editForm.intereses || []), trimmedInterest],
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setEditForm({
      ...editForm,
      intereses: editForm.intereses?.filter((i) => i !== interest) || [],
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con foto de perfil */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleOpenEditModal}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
            <Text style={[styles.editButtonText, { color: colors.primary }]}>
              Editar Perfil
            </Text>
          </TouchableOpacity>
          
          <View style={styles.profileImageContainer}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons name="person" size={64} color={colors.primary} />
              </View>
            )}
          </View>
          
          <Text style={styles.name}>{userData.name}</Text>
          {profile?.email && (
            <Text style={styles.studentId}>{profile.email}</Text>
          )}
          {profile?.carrera && (
            <Text style={styles.career}>{profile.carrera}</Text>
          )}
        </View>

        {/* Dashboard Section */}
        <View style={styles.dashboardSection}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          
          <View style={styles.dashboardGrid}>
            <View style={[styles.dashboardCard, { backgroundColor: '#A8E6CF' }]}>
              <View style={[styles.cardIconContainer, { backgroundColor: '#ffffff40' }]}>
                <Ionicons name="heart" size={24} color="#2d5f4d" />
              </View>
              <Text style={[styles.cardValue, { color: '#2d5f4d' }]}>
                {userData.hoursLogged} hrs
              </Text>
              <Text style={[styles.cardLabel, { color: '#2d5f4d' }]}>
                Hours Logged
              </Text>
              <Text style={[styles.cardLabelLarge, { color: '#2d5f4d', fontSize: 11 }]}>
                This is incredible time
              </Text>
            </View>

            <View style={[styles.dashboardCardLarge, { backgroundColor: colors.surface }]}>
              <View style={[styles.cardIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="calendar" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.cardValue, { color: colors.text }]}>
                {userData.upcomingEvents}
              </Text>
              <Text style={[styles.cardLabel]}>Upcoming Events</Text>
              <Text style={[styles.cardLabelLarge, { fontSize: 11 }]}>
                Moonstone & Overnight
              </Text>
            </View>
          </View>
        </View>

        {/* Impact & Recognition Section */}
        <View style={styles.impactSection}>
          <Text style={styles.sectionTitle}>Impact & Recognition</Text>
          
          <View style={styles.impactGrid}>
            <View style={[styles.impactCard, { backgroundColor: '#D4EDDA' }]}>
              <View style={[styles.impactIconContainer, { backgroundColor: '#ffffff60' }]}>
                <Ionicons name="shield" size={32} color="#28a745" />
              </View>
              <Text style={[styles.impactTitle, { color: '#28a745' }]}>
                Badges Earned
              </Text>
              <Text style={[styles.impactSubtitle, { color: '#28a745' }]}>
                Bronze - {userData.badgesEarned}
              </Text>
            </View>

            <View style={[styles.impactCard, { backgroundColor: '#CCE5FF' }]}>
              <View style={[styles.impactIconContainer, { backgroundColor: '#ffffff60' }]}>
                <Ionicons name="ribbon" size={32} color="#0066cc" />
              </View>
              <Text style={[styles.impactTitle, { color: '#0066cc' }]}>
                Certificates
              </Text>
              <Text style={[styles.impactSubtitle, { color: '#0066cc' }]}>
                View {userData.certificates} Certificates
              </Text>
            </View>

            <View style={[styles.impactCard, { backgroundColor: '#FFD4B4' }]}>
              <View style={[styles.impactIconContainer, { backgroundColor: '#ffffff60' }]}>
                <Ionicons name="star" size={32} color="#ff6b35" />
              </View>
              <Text style={[styles.impactTitle, { color: '#ff6b35' }]}>
                Top Volunteer #{userData.topVolunteer}
              </Text>
              <Text style={[styles.impactSubtitle, { color: '#ff6b35' }]}>
                This Month
              </Text>
            </View>
          </View>
        </View>

        {/* Activity Feed Section */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Activity Feed</Text>
          
          <View style={styles.activityList}>
            {activities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={[styles.activityIconContainer, { backgroundColor: activity.iconBg }]}>
                  <Ionicons 
                    name={activity.icon as any} 
                    size={24} 
                    color="#fff" 
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDate}>{activity.date}</Text>
                </View>
                <Text style={[styles.activityValue, { color: colors.text }]}>
                  {activity.value}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Editar Perfil */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCancelEdit}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            {/* Header del Modal */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Editar Perfil</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Avatar con ImagePicker */}
              <View style={styles.avatarSection}>
                <ImagePicker
                  currentImageUri={editForm.avatar}
                  onImageSelected={handleImageSelected}
                  folder="avatars"
                  aspectRatio={[1, 1]}
                  quality={0.8}
                />
              </View>

              {/* Nombre */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  Nombre Completo *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.surface,
                      borderColor: errors.nombre ? '#FF6B6B' : colors.border,
                      color: colors.text 
                    }
                  ]}
                  placeholder="Tu nombre completo"
                  placeholderTextColor={colors.subtitle}
                  value={editForm.nombre}
                  onChangeText={(text) => {
                    setEditForm({ ...editForm, nombre: text });
                    if (errors.nombre) {
                      const newErrors = { ...errors };
                      delete newErrors.nombre;
                      setErrors(newErrors);
                    }
                  }}
                />
                {errors.nombre && (
                  <Text style={styles.errorText}>{errors.nombre}</Text>
                )}
              </View>

              {/* Biografía */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  Biografía
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    { 
                      backgroundColor: colors.surface,
                      borderColor: errors.bio ? '#FF6B6B' : colors.border,
                      color: colors.text 
                    }
                  ]}
                  placeholder="Cuéntanos sobre ti..."
                  placeholderTextColor={colors.subtitle}
                  multiline
                  numberOfLines={4}
                  value={editForm.bio}
                  onChangeText={(text) => {
                    setEditForm({ ...editForm, bio: text });
                    if (errors.bio) {
                      const newErrors = { ...errors };
                      delete newErrors.bio;
                      setErrors(newErrors);
                    }
                  }}
                  textAlignVertical="top"
                  maxLength={300}
                />
                <View style={styles.textAreaFooter}>
                  {errors.bio && (
                    <Text style={styles.errorText}>{errors.bio}</Text>
                  )}
                  <Text style={[styles.charCount, { color: colors.subtitle }]}>
                    {editForm.bio?.length || 0}/300
                  </Text>
                </View>
              </View>

              {/* Campus */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  Campus
                </Text>
                <View style={styles.campusGrid}>
                  {CAMPUS_OPTIONS.map((campus) => (
                    <TouchableOpacity
                      key={campus}
                      style={[
                        styles.campusOption,
                        {
                          backgroundColor: colors.surface,
                          borderColor: editForm.campus === campus ? colors.primary : colors.border,
                          borderWidth: editForm.campus === campus ? 2 : 1,
                        }
                      ]}
                      onPress={() => setEditForm({ ...editForm, campus: campus })}
                    >
                      <Ionicons 
                        name="location" 
                        size={20} 
                        color={editForm.campus === campus ? colors.primary : colors.subtitle} 
                      />
                      <Text style={[
                        styles.campusLabel,
                        { color: editForm.campus === campus ? colors.text : colors.subtitle }
                      ]}>
                        {campus}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Carrera */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  Carrera
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text 
                    }
                  ]}
                  placeholder="Ej: Ingeniería de Sistemas"
                  placeholderTextColor={colors.subtitle}
                  value={editForm.carrera}
                  onChangeText={(text) => setEditForm({ ...editForm, carrera: text })}
                />
              </View>

              {/* Semestre */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  Semestre
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text 
                    }
                  ]}
                  placeholder="Ej: 5"
                  placeholderTextColor={colors.subtitle}
                  keyboardType="numeric"
                  value={editForm.semestre?.toString() || ''}
                  onChangeText={(text) => setEditForm({ ...editForm, semestre: parseInt(text) || 0 })}
                />
              </View>

              {/* Teléfono */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  Teléfono
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
                  value={editForm.telefono}
                  onChangeText={(text) => {
                    setEditForm({ ...editForm, telefono: text });
                    if (errors.telefono) {
                      const newErrors = { ...errors };
                      delete newErrors.telefono;
                      setErrors(newErrors);
                    }
                  }}
                />
                {errors.telefono && (
                  <Text style={styles.errorText}>{errors.telefono}</Text>
                )}
              </View>

              {/* Intereses */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  Áreas de Interés
                </Text>
                <View style={styles.interestInputContainer}>
                  <TextInput
                    style={[
                      styles.interestInput,
                      { 
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text 
                      }
                    ]}
                    placeholder="Agregar interés"
                    placeholderTextColor={colors.subtitle}
                    value={newInterest}
                    onChangeText={setNewInterest}
                    onSubmitEditing={handleAddInterest}
                  />
                  <TouchableOpacity
                    style={[styles.addInterestButton, { backgroundColor: colors.primary }]}
                    onPress={handleAddInterest}
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.interestsContainer}>
                  {editForm.intereses?.map((interest, index) => (
                    <View 
                      key={index}
                      style={[styles.interestChip, { backgroundColor: colors.primary + '20' }]}
                    >
                      <Text style={[styles.interestChipText, { color: colors.primary }]}>
                        {interest}
                      </Text>
                      <TouchableOpacity onPress={() => handleRemoveInterest(interest)}>
                        <Ionicons name="close-circle" size={18} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>

            {/* Footer del Modal */}
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleCancelEdit}
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
                onPress={handleSubmitEdit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Text style={styles.submitButtonText}>Guardando...</Text>
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Guardar Cambios</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default ProfileScreen;