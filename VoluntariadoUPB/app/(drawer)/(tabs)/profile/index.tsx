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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useThemeColors } from '../../../../src/hooks/useThemeColors';
import type { ThemeColors } from '../../../theme/colors';
import { useUserProfile } from '../../../../src/hooks/useUserProfile';
import { usePostulaciones } from '../../../../src/hooks/usePostulaciones';
import { useFavoriteOportunidades } from '../../../../src/hooks/useFavoriteOportunidades';
import { useAuthStore } from '../../../../src/store/useAuthStore';
import { ImagePicker } from '../../../../src/components/ImagePicker';
import { CAMPUS_OPTIONS, CATEGORIAS } from '../../../../src/types';
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
    achievementsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      paddingVertical: 8,
    },
    achievementBadge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    achievementIconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    achievementBadgeCount: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: '#FF6B6B',
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
      borderWidth: 2,
      borderColor: '#fff',
    },
    achievementBadgeCountText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
    },
    activitySection: {
      paddingHorizontal: 20,
    },
    activityScrollContent: {
      paddingRight: 20,
      gap: 12,
    },
    emptyActivity: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      gap: 12,
    },
    emptyActivityText: {
      fontSize: 15,
      fontWeight: '500',
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
    activityCardHorizontal: {
      width: 260,
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
    activityIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
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
      marginBottom: 8,
    },
    activityValue: {
      fontSize: 16,
      fontWeight: '700',
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    statusBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
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
    // Favorites Section
    favoritesSection: {
      paddingHorizontal: 20,
      marginBottom: 28,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    countBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      minWidth: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    countBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
    },
    emptyFavorites: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      gap: 8,
    },
    emptyFavoritesText: {
      fontSize: 15,
      fontWeight: '500',
      marginTop: 8,
    },
    emptyFavoritesSubtext: {
      fontSize: 13,
    },
    favoritesScrollContent: {
      paddingRight: 20,
      gap: 12,
    },
    favoriteCard: {
      width: 240,
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
    favoriteCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    favoriteCategoryBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    favoriteTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 6,
      minHeight: 40,
    },
    favoriteOrganization: {
      fontSize: 13,
      marginBottom: 12,
    },
    favoriteFooter: {
      gap: 6,
      marginBottom: 12,
    },
    favoriteInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    favoriteInfoText: {
      fontSize: 12,
    },
    favoriteStatusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    favoriteStatusText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '600',
    },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 24,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      marginTop: 16,
    },
    editButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    // Achievement Modal styles
    achievementModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    achievementModalContent: {
      width: '100%',
      maxWidth: 400,
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    achievementModalClose: {
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 1,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    achievementModalBadge: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      position: 'relative',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    achievementModalTitle: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 12,
      textAlign: 'center',
    },
    achievementModalDescription: {
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
      marginBottom: 24,
    },
    achievementModalButton: {
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 24,
      minWidth: 120,
    },
    achievementModalButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
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
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    submitButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
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
  const router = useRouter();
  
  const currentUser = useAuthStore((state) => state.user);
  const { user: profile, loading, updateProfile, toggleFavorito } = useUserProfile();
  const { postulaciones, loading: postulacionesLoading } = usePostulaciones();
  const { favoriteOportunidades, loading: favoritesLoading, count: favoritesCount } = useFavoriteOportunidades();

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<{
    title: string;
    description: string;
    icon: string;
    color: string;
    iconColor: string;
  } | null>(null);
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

  // Calcular horas totales de postulaciones aceptadas
  const horasTotales = postulaciones
    .filter(p => p.status === 'accepted')
    .length * 2; // Asumiendo 2 horas por postulación aceptada

  // Contar postulaciones pendientes como "upcoming events"
  const eventosProximos = postulaciones.filter(p => p.status === 'pending').length;

  // Achievements data
  const achievements = [
    {
      id: 1,
      title: 'First Volunteer',
      description: '¡Completaste tu primera actividad de voluntariado! Este es el comienzo de un gran impacto en la comunidad.',
      icon: 'heart-circle',
      color: '#FFB4C5',
      iconColor: '#FF6B9D',
    },
    {
      id: 2,
      title: 'Winter Helper',
      description: 'Participaste en 2 actividades durante la temporada de invierno. Tu dedicación ayuda a quienes más lo necesitan.',
      icon: 'snow',
      color: '#B4D4FF',
      iconColor: '#4A90E2',
      count: 2,
    },
    {
      id: 3,
      title: 'Community Champion',
      description: 'Tu entusiasmo y dedicación inspiran a otros. Sigue siendo un ejemplo para la comunidad UPB.',
      icon: 'happy',
      color: '#FFE4B4',
      iconColor: '#FFA500',
    },
  ];

  const handleAchievementPress = (achievement: typeof achievements[0]) => {
    setSelectedAchievement(achievement);
    setAchievementModalVisible(true);
  };

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
          <View style={styles.profileImageContainer}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons name="person" size={64} color={colors.primary} />
              </View>
            )}
          </View>
          
          <Text style={styles.name}>{profile?.nombre || 'Usuario'}</Text>
          {profile?.email && (
            <Text style={styles.studentId}>{profile.email}</Text>
          )}
          {profile?.carrera && (
            <Text style={styles.career}>{profile.carrera}</Text>
          )}
          
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
                {horasTotales} hrs
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
                {eventosProximos}
              </Text>
              <Text style={[styles.cardLabel]}>Upcoming Events</Text>
              <Text style={[styles.cardLabelLarge, { fontSize: 11 }]}>
                {eventosProximos > 0 ? 'Postulaciones pendientes' : 'Sin eventos'}
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.impactSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          
          <View style={styles.achievementsContainer}>
            {achievements.map((achievement) => (
              <TouchableOpacity
                key={achievement.id}
                onPress={() => handleAchievementPress(achievement)}
                activeOpacity={0.7}
              >
                <View style={[styles.achievementBadge, { backgroundColor: achievement.color }]}>
                  <View style={styles.achievementIconContainer}>
                    <Ionicons name={achievement.icon as any} size={48} color={achievement.iconColor} />
                  </View>
                  {achievement.count && (
                    <View style={styles.achievementBadgeCount}>
                      <Text style={styles.achievementBadgeCountText}>x{achievement.count}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Feed Section */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Activity Feed</Text>
          
          {postulacionesLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
          ) : postulaciones.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Ionicons name="calendar-outline" size={48} color={colors.subtitle} />
              <Text style={[styles.emptyActivityText, { color: colors.subtitle }]}>
                No tienes postulaciones aún
              </Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activityScrollContent}
            >
              {postulaciones.slice(0, 5).map((postulacion) => {
                const iconBg = 
                  postulacion.status === 'accepted' ? '#B4FFB4' :
                  postulacion.status === 'rejected' ? '#FFB4B4' :
                  '#FFE4B4';
                
                const icon = 
                  postulacion.status === 'accepted' ? 'checkmark-circle' :
                  postulacion.status === 'rejected' ? 'close-circle' :
                  'time';
                
                return (
                  <View key={postulacion.id} style={styles.activityCardHorizontal}>
                    <View style={[styles.activityIconContainer, { backgroundColor: iconBg }]}>
                      <Ionicons 
                        name={icon as any} 
                        size={24} 
                        color="#fff" 
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle} numberOfLines={2}>
                        {postulacion.titulo}
                      </Text>
                      <Text style={styles.activityDate}>
                        {postulacion.applicationDate.toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, {
                      backgroundColor: 
                        postulacion.status === 'accepted' ? '#4CAF50' :
                        postulacion.status === 'rejected' ? '#FF6B6B' :
                        '#FFA726'
                    }]}>
                      <Text style={styles.statusBadgeText}>
                        {postulacion.status === 'accepted' ? 'Aceptado' :
                         postulacion.status === 'rejected' ? 'Rechazado' :
                         'Pendiente'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {postulaciones.length > 0 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Favorites Section */}
        <View style={styles.favoritesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Favorites</Text>
            {favoritesCount > 0 && (
              <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.countBadgeText}>{favoritesCount}</Text>
              </View>
            )}
          </View>
          
          {favoritesLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
          ) : favoriteOportunidades.length === 0 ? (
            <View style={styles.emptyFavorites}>
              <Ionicons name="heart-outline" size={48} color={colors.subtitle} />
              <Text style={[styles.emptyFavoritesText, { color: colors.subtitle }]}>
                No favorites yet
              </Text>
              <Text style={[styles.emptyFavoritesSubtext, { color: colors.muted }]}>
                Mark opportunities with ❤️ to see them here
              </Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favoritesScrollContent}
            >
              {favoriteOportunidades.map((oportunidad) => {
                const categoria = CATEGORIAS.find(c => c.key === oportunidad.categoria);
                
                return (
                  <TouchableOpacity
                    key={oportunidad.id}
                    style={[styles.favoriteCard, { backgroundColor: colors.surface }]}
                    onPress={() => router.push(`/opportunities/${oportunidad.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.favoriteCardHeader}>
                      <View style={[
                        styles.favoriteCategoryBadge, 
                        { backgroundColor: categoria?.color || colors.primary }
                      ]}>
                        <Ionicons 
                          name={categoria?.icon as any || 'heart'} 
                          size={20} 
                          color="#fff" 
                        />
                      </View>
                      <TouchableOpacity
                        onPress={async (e) => {
                          // Prevenir que se active el TouchableOpacity del card
                          if (e && typeof e.stopPropagation === 'function') {
                            e.stopPropagation();
                          }
                          await toggleFavorito(oportunidad.id);
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="heart" size={24} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.favoriteTitle, { color: colors.text }]} numberOfLines={2}>
                      {oportunidad.titulo}
                    </Text>
                    
                    <Text style={[styles.favoriteOrganization, { color: colors.subtitle }]} numberOfLines={1}>
                      {oportunidad.organizacion}
                    </Text>

                    <View style={styles.favoriteFooter}>
                      <View style={styles.favoriteInfo}>
                        <Ionicons name="time-outline" size={14} color={colors.subtitle} />
                        <Text style={[styles.favoriteInfoText, { color: colors.subtitle }]}>
                          {oportunidad.horasSemana}h/semana
                        </Text>
                      </View>
                      <View style={styles.favoriteInfo}>
                        <Ionicons name="location-outline" size={14} color={colors.subtitle} />
                        <Text style={[styles.favoriteInfoText, { color: colors.subtitle }]}>
                          {oportunidad.campus}
                        </Text>
                      </View>
                    </View>

                    <View style={[
                      styles.favoriteStatusBadge,
                      { 
                        backgroundColor: oportunidad.status === 'open' ? '#4CAF50' :
                                        oportunidad.status === 'waitlist' ? '#FF9800' :
                                        oportunidad.status === 'closed' ? '#FF6B6B' : '#9E9E9E'
                      }
                    ]}>
                      <Text style={styles.favoriteStatusText}>
                        {oportunidad.status === 'open' ? 'Abierto' :
                         oportunidad.status === 'waitlist' ? 'Lista de espera' :
                         oportunidad.status === 'closed' ? 'Cerrado' : 'Finalizado'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {favoriteOportunidades.length > 5 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/opportunities')}
            >
              <Text style={styles.viewAllText}>Favorites</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Modal de Achievement */}
      <Modal
        visible={achievementModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setAchievementModalVisible(false)}
      >
        <View style={styles.achievementModalOverlay}>
          <View style={[styles.achievementModalContent, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={styles.achievementModalClose}
              onPress={() => setAchievementModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>

            {selectedAchievement && (
              <>
                <View style={[
                  styles.achievementModalBadge,
                  { backgroundColor: selectedAchievement.color }
                ]}>
                  <Ionicons 
                    name={selectedAchievement.icon as any} 
                    size={64} 
                    color={selectedAchievement.iconColor} 
                  />
                  {achievements.find(a => a.id === achievements.findIndex(ach => ach.icon === selectedAchievement.icon) + 1)?.count && (
                    <View style={[styles.achievementBadgeCount, { top: -8, right: -8 }]}>
                      <Text style={styles.achievementBadgeCountText}>
                        x{achievements.find(a => a.icon === selectedAchievement.icon)?.count}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.achievementModalTitle, { color: colors.text }]}>
                  {selectedAchievement.title}
                </Text>
                
                <Text style={[styles.achievementModalDescription, { color: colors.subtitle }]}>
                  {selectedAchievement.description}
                </Text>

                <TouchableOpacity
                  style={[styles.achievementModalButton, { backgroundColor: colors.primary }]}
                  onPress={() => setAchievementModalVisible(false)}
                >
                  <Text style={styles.achievementModalButtonText}>¡Genial!</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

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
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default ProfileScreen;