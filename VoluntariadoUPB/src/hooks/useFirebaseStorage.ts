import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebase';

export const useFirebaseStorage = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (
    uri: string,
    folder: string,
    filename?: string
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      setUploading(true);
      setError(null);

      const response = await fetch(uri);
      const blob = await response.blob();

      let mimeType = blob.type;
      if (!mimeType || mimeType === 'application/octet-stream') {
        const extension = uri.split('.').pop()?.toLowerCase();
        mimeType = extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' :
                  extension === 'png' ? 'image/png' :
                  extension === 'gif' ? 'image/gif' :
                  extension === 'webp' ? 'image/webp' :
                  'image/jpeg';
      }

      const extension = mimeType.split('/')[1] || 'jpg';
      const name = filename || `${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
      const storageRef = ref(storage, `${folder}/${name}`);

      const metadata = {
        contentType: mimeType,
      };

      await uploadBytes(storageRef, blob, metadata);

      const downloadURL = await getDownloadURL(storageRef);

      setUploading(false);
      return { success: true, url: downloadURL };
    } catch (err: any) {
      console.error('Error uploading image:', err);
      const errorMessage = err.message || 'Error al subir la imagen';
      setError(errorMessage);
      setUploading(false);
      return { success: false, error: errorMessage };
    }
  };

  const deleteImage = async (imageUrl: string): Promise<{ success: boolean }> => {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting image:', err);
      setError('Error al eliminar la imagen');
      return { success: false };
    }
  };

  const getImageUrl = async (path: string): Promise<string | null> => {
    try {
      const imageRef = ref(storage, path);
      const url = await getDownloadURL(imageRef);
      return url;
    } catch (err) {
      console.error('Error getting image URL:', err);
      return null;
    }
  };

  return {
    uploadImage,
    deleteImage,
    getImageUrl,
    uploading,
    error,
  };
};
