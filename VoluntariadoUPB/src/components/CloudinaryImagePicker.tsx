import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePickerExpo from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';
import { useAuthStore } from '../store/useAuthStore';
import { CLOUDINARY_FOLDERS, getCloudinaryUrl } from '../../config/cloudinary';
import { ImagePickerModal } from './ImagePickerModal';

interface CloudinaryImagePickerProps {
  currentImageUri?: string;
  currentPublicId?: string;
  onImageSelected: (imageUrl: string, publicId: string) => void;
  folder?: keyof typeof CLOUDINARY_FOLDERS;
  aspectRatio?: [number, number];
  quality?: number;
  transformationType?: 'avatar' | 'avatarLarge' | 'cover' | 'background' | 'thumbnail';
  size?: number;
}

export const CloudinaryImagePicker: React.FC<CloudinaryImagePickerProps> = ({
  currentImageUri,
  currentPublicId,
  onImageSelected,
  folder = 'AVATARS',
  aspectRatio = [1, 1],
  quality = 0.8,
  transformationType = 'avatar',
  size = 120,
}) => {
  const { colors } = useThemeColors();
  const { uploadImage, uploading, progress } = useCloudinaryUpload();
  const { user } = useAuthStore();
  const [localUri, setLocalUri] = useState<string | undefined>(currentImageUri);
  const [showModal, setShowModal] = useState(false);

  const requestPermissions = async (type: 'camera' | 'library') => {
    try {
      let permission;
      
      if (type === 'camera') {
        permission = await ImagePickerExpo.requestCameraPermissionsAsync();
      } else {
        permission = await ImagePickerExpo.requestMediaLibraryPermissionsAsync();
      }

      if (!permission.granted) {
        Alert.alert(
          'Permisos requeridos',
          `Necesitamos acceso a tu ${type === 'camera' ? 'cámara' : 'galería'} para continuar.`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configuración', onPress: () => {} },
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const handlePickImage = async (source: 'camera' | 'library') => {
    const hasPermission = await requestPermissions(source);
    if (!hasPermission) return;

    try {
      let result;

      if (source === 'camera') {
        result = await ImagePickerExpo.launchCameraAsync({
          allowsEditing: true,
          aspect: aspectRatio,
          quality: quality,
        });
      } else {
        result = await ImagePickerExpo.launchImageLibraryAsync({
          mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: aspectRatio,
          quality: quality,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Mostrar preview inmediato
        setLocalUri(imageUri);
        
        // Subir a Cloudinary
        const uploadResult = await uploadImage(imageUri, folder);
        
        if (uploadResult.success && uploadResult.url && uploadResult.publicId) {
          // Usar URL con transformaciones
          const optimizedUrl = getCloudinaryUrl(uploadResult.publicId, transformationType);
          onImageSelected(optimizedUrl, uploadResult.publicId);
          setLocalUri(optimizedUrl);
          Alert.alert('¡Éxito!', 'Imagen actualizada correctamente');
        } else {
          Alert.alert('Error', uploadResult.error || 'No se pudo subir la imagen');
          setLocalUri(currentImageUri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Hubo un problema al seleccionar la imagen');
      setLocalUri(currentImageUri);
    }
  };

  const showImageSourceOptions = () => {
    setShowModal(true);
  };

  const handleModalGallery = () => {
    setShowModal(false);
    setTimeout(() => handlePickImage('library'), 300);
  };

  const handleModalCamera = () => {
    setShowModal(false);
    setTimeout(() => handlePickImage('camera'), 300);
  };

  const handleModalCancel = () => {
    setShowModal(false);
  };

  const handleUseGooglePhoto = async () => {
    if (user?.photoURL) {
      try {
        setLocalUri(user.photoURL);
        
        // Subir la foto de Google a Cloudinary
        const uploadResult = await uploadImage(user.photoURL, folder);
        
        if (uploadResult.success && uploadResult.url && uploadResult.publicId) {
          const optimizedUrl = getCloudinaryUrl(uploadResult.publicId, transformationType);
          onImageSelected(optimizedUrl, uploadResult.publicId);
          setLocalUri(optimizedUrl);
          Alert.alert('¡Listo!', 'Foto de Google aplicada correctamente');
        } else {
          // Si falla, usar la URL de Google directamente
          onImageSelected(user.photoURL, '');
          Alert.alert('¡Listo!', 'Foto de Google aplicada correctamente');
        }
      } catch (error) {
        console.error('Error using Google photo:', error);
        onImageSelected(user.photoURL, '');
      }
    }
  };


  const displayUri = localUri || (currentPublicId ? getCloudinaryUrl(currentPublicId, transformationType) : undefined);

  return (
    <View style={styles.container}>
      <View style={[styles.imageWrapper, { width: size, height: size }]}>
        <TouchableOpacity
          style={[
            styles.imageContainer,
            { 
              borderColor: colors.primary,
              width: size,
              height: size,
              borderRadius: size / 2,
            }
          ]}
          onPress={showImageSourceOptions}
          disabled={uploading}
        >
          {displayUri ? (
            <Image 
              source={{ uri: displayUri }} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="person" size={size * 0.5} color={colors.primary} />
            </View>
          )}

          {uploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              {progress > 0 && (
                <Text style={styles.progressText}>{progress}%</Text>
              )}
            </View>
          )}
        </TouchableOpacity>


        <TouchableOpacity 
          style={[
            styles.cameraButton,
            { 
              backgroundColor: colors.primary,
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
            }
          ]}
          onPress={showImageSourceOptions}
          disabled={uploading}
        >
          <Ionicons name="camera" size={size * 0.15} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.hint, { color: colors.subtitle }]}>
        Toca para cambiar la imagen
      </Text>
      
      {uploading && progress > 0 && (
        <View style={[styles.progressBar, { backgroundColor: colors.primary + '20' }]}>
          <View 
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: `${progress}%` }
            ]} 
          />
        </View>
      )}

      <ImagePickerModal
        visible={showModal}
        title={transformationType === 'background' ? 'Imagen de Fondo' : 'Foto de Perfil'}
        onSelectGallery={handleModalGallery}
        onSelectCamera={handleModalCamera}
        onCancel={handleModalCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  imageWrapper: {
    position: 'relative',
  },
  imageContainer: {
    borderWidth: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
  },
  progressBar: {
    width: 200,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
