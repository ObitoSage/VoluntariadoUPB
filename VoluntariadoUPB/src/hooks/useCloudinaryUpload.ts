import { useState } from 'react';
import { cloudinaryConfig, CLOUDINARY_FOLDERS } from '../../config/cloudinary';
import { useAuthStore } from '../store/useAuthStore';

interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const uploadImage = async (
    uri: string,
    folder: keyof typeof CLOUDINARY_FOLDERS = 'AVATARS',
    filename?: string
  ): Promise<UploadResult> => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);


      if (!cloudinaryConfig.cloudName || cloudinaryConfig.cloudName === 'TU_CLOUD_NAME') {
        throw new Error('Cloudinary no está configurado correctamente');
      }

      if (!cloudinaryConfig.uploadPreset || cloudinaryConfig.uploadPreset === 'TU_UPLOAD_PRESET') {
        throw new Error('Upload preset no está configurado');
      }


      const response = await fetch(uri);
      const blob = await response.blob();


      const formData = new FormData();

      let mimeType = blob.type;
      let extension = 'jpg';
      
      if (!mimeType || mimeType === 'application/octet-stream') {
        const uriExtension = uri.split('.').pop()?.toLowerCase();
        extension = uriExtension || 'jpg';
        mimeType = `image/${extension}`;
      } else {
        extension = mimeType.split('/')[1] || 'jpg';
      }


      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const userId = user?.uid || 'anonymous';
      const finalFilename = filename || `${userId}_${timestamp}_${randomString}`;

      const fileObject: any = {
        uri: uri,
        type: mimeType,
        name: `${finalFilename}.${extension}`,
      };

      formData.append('file', fileObject);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);

      formData.append('tags', `user_${userId},${folder.toLowerCase()}`);


      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;

      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise<CloudinaryResponse>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText);
              console.log(' Upload exitoso:', result.secure_url);
              resolve(result);
            } catch (err) {
              console.error('Error parseando respuesta:', err);
              reject(new Error('Error parsing response'));
            }
          } else {
            console.error(' Upload falló:');
            console.error('Status:', xhr.status);
            console.error('Response:', xhr.responseText);

            let errorMsg = `Upload failed with status ${xhr.status}`;
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              console.error('Error de Cloudinary:', errorResponse);
              if (errorResponse.error && errorResponse.error.message) {
                errorMsg = errorResponse.error.message;
              }
            } catch (e) {
            }

            if (xhr.status === 400) {

              if (xhr.responseText.includes('Invalid upload preset')) {
                errorMsg = ' El Upload Preset "' + cloudinaryConfig.uploadPreset + '" no existe o no es válido.\n\n' +
                          ' Solución:\n' +
                          '1. Verifica el nombre del preset en Cloudinary\n' +
                          '2. Asegúrate que sea "Unsigned"\n' +
                          '3. Puede que necesites esperar unos minutos después de crear el preset';
              } else {
                errorMsg = ' Error en la solicitud (400).\n' +
                          'Respuesta: ' + xhr.responseText.substring(0, 200);
              }
            } else if (xhr.status === 401) {
              errorMsg = ' Cloud Name incorrecto: "' + cloudinaryConfig.cloudName + '"';
            } else if (xhr.status === 403) {
              errorMsg = ' Acceso denegado. Verifica tu configuración de Cloudinary.';
            }

            reject(new Error(errorMsg));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });

        xhr.open('POST', cloudinaryUrl);
        xhr.send(formData as any);
      });

      const result = await uploadPromise;

      setUploading(false);
      setProgress(100);

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (err: any) {
      console.error('Error uploading to Cloudinary:', err);
      const errorMessage = err.message || 'Error al subir la imagen';
      setError(errorMessage);
      setUploading(false);
      setProgress(0);
      return { success: false, error: errorMessage };
    }
  };

  const deleteImage = async (publicId: string): Promise<{ success: boolean }> => {
    try {
      console.warn('Delete from Cloudinary requires backend implementation');

      return { success: true };
    } catch (err: any) {
      console.error('Error deleting from Cloudinary:', err);
      setError('Error al eliminar la imagen');
      return { success: false };
    }
  };
  const clearError = () => {
    setError(null);
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    progress,
    error,
    clearError,
  };
};
