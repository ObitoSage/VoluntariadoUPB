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
    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción',
      [
        {
          text: 'Tomar foto',
          onPress: () => handlePickImage('camera'),
        },
        {
          text: 'Elegir de galería',
          onPress: () => handlePickImage('library'),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.imageContainer, { borderColor: colors.border }]}
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

        {/* Camera icon button */}
        <View style={[styles.cameraButton, { backgroundColor: colors.primary }]}>
          <Ionicons name="camera" size={20} color="#fff" />
        </View>
      </TouchableOpacity>

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
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    overflow: 'hidden',
    position: 'relative',
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
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
