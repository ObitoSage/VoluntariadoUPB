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
import { useThemeColors } from '../../app/hooks/useThemeColors';
import { useFirebaseStorage } from '../hooks/useFirebaseStorage';
import { useAuthStore } from '../../app/store/useAuthStore';

interface ImagePickerProps {
  currentImageUri?: string;
  onImageSelected: (imageUrl: string) => void;
  folder: string; // 'avatars' o 'covers'
  aspectRatio?: [number, number];
  quality?: number;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  currentImageUri,
  onImageSelected,
  folder,
  aspectRatio = [1, 1],
  quality = 0.8,
}) => {
  const { colors } = useThemeColors();
  const { uploadImage, uploading } = useFirebaseStorage();
  const { user } = useAuthStore();
  const [localUri, setLocalUri] = useState<string | undefined>(currentImageUri);

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
            { text: 'Configuración', onPress: () => ImagePickerExpo.requestCameraPermissionsAsync() },
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
        setLocalUri(imageUri);
        
        // Subir a Firebase Storage
        const uploadResult = await uploadImage(imageUri, folder);
        
        if (uploadResult.success && uploadResult.url) {
          onImageSelected(uploadResult.url);
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
    const options: any[] = [
      {
        text: 'Tomar foto',
        onPress: () => handlePickImage('camera'),
      },
      {
        text: 'Elegir de galería',
        onPress: () => handlePickImage('library'),
      },
    ];

    // Agregar opción de usar foto de Google si está disponible
    if (user?.photoURL) {
      options.unshift({
        text: 'Usar foto de Google',
        onPress: handleUseGooglePhoto,
      });
    }

    options.push({
      text: 'Cancelar',
      style: 'cancel',
    });

    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción',
      options,
      { cancelable: true }
    );
  };

  const handleUseGooglePhoto = () => {
    if (user?.photoURL) {
      setLocalUri(user.photoURL);
      onImageSelected(user.photoURL);
      Alert.alert('¡Listo!', 'Foto de Google aplicada correctamente');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <TouchableOpacity
          style={[styles.imageContainer, { borderColor: colors.primary }]}
          onPress={showImageSourceOptions}
          disabled={uploading}
        >
          {localUri ? (
            <Image source={{ uri: localUri }} style={styles.image} />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="person" size={64} color={colors.primary} />
            </View>
          )}

          {/* Loading overlay */}
          {uploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </TouchableOpacity>

        {/* Camera icon button - FUERA del círculo */}
        <TouchableOpacity 
          style={[styles.cameraButton, { backgroundColor: colors.primary }]}
          onPress={showImageSourceOptions}
          disabled={uploading}
        >
          <Ionicons name="camera" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.hint, { color: colors.subtitle }]}>
        Toca para cambiar la imagen
      </Text>
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
    width: 120,
    height: 120,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
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
});
