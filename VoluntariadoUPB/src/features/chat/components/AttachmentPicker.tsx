import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert } from 'react-native';

export async function pickImage(): Promise<{ uri: string; name: string; type?: string } | null> {
  try {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
  if ((res as any).cancelled || (res as any).canceled) return null;
  // Attempt to extract filename
  const uri = (res as any).assets?.[0]?.uri ?? (res as any).uri;
    const name = uri.split('/').pop() ?? 'image.jpg';
    // Basic type check by extension
    const lower = name.toLowerCase();
    if (!lower.endsWith('.jpg') && !lower.endsWith('.jpeg') && !lower.endsWith('.png')) {
      // allow but warn
      Alert.alert('Archivo no soportado', 'Se recomienda usar imágenes JPG o PNG');
    }
    // NOTE: We do not have file-size reliably here without expo-file-system; quality is reduced to help limit size.
    return { uri, name, type: 'image/jpeg' };
  } catch (err) {
    Alert.alert('Error', 'No se pudo seleccionar la imagen');
    return null;
  }
}
