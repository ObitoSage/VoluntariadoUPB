import { cloudinaryConfig } from '../../config/cloudinary';

/**
 * Valida si una URL es de Cloudinary
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
};


export const getPublicIdFromUrl = (url: string): string | null => {
  if (!isCloudinaryUrl(url)) return null;
  
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    

    let afterUpload = parts[1];
    

    const segments = afterUpload.split('/');
    const lastSegment = segments[segments.length - 1];
    
 
    const withoutExtension = lastSegment.replace(/\.[^/.]+$/, '');
    
    return withoutExtension;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};


export const buildCloudinaryUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'limit' | 'thumb' | 'scale';
    gravity?: 'auto' | 'face' | 'faces' | 'center' | 'north' | 'south' | 'east' | 'west';
    quality?: 'auto' | number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
    radius?: number | 'max';
    effect?: string;
    overlay?: string;
    border?: string;
  } = {}
): string => {
  if (!publicId) return '';
  
  if (publicId.startsWith('http')) {
    const extracted = getPublicIdFromUrl(publicId);
    if (!extracted) return publicId;
    publicId = extracted;
  }

  const {
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto',
    format = 'auto',
    radius,
    effect,
    overlay,
    border,
  } = options;

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (radius) transformations.push(`r_${radius}`);
  if (effect) transformations.push(`e_${effect}`);
  if (overlay) transformations.push(`l_${overlay}`);
  if (border) transformations.push(`bo_${border}`);

  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;
  
  if (transformations.length > 0) {
    return `${baseUrl}/${transformations.join(',')}/${publicId}`;
  }
  
  return `${baseUrl}/${publicId}`;
};

export const getCircularAvatar = (
  publicId: string,
  size: number = 200,
  borderColor: string = 'white',
  borderWidth: number = 4
): string => {
  return buildCloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'face',
    radius: 'max',
    quality: 'auto',
    format: 'auto',
    border: `${borderWidth}px_solid_${borderColor}`,
  });
};
export const getResponsiveImageSet = (publicId: string) => {
  const sizes = [200, 400, 800, 1200];
  
  return sizes.map(size => ({
    size,
    url: buildCloudinaryUrl(publicId, {
      width: size,
      quality: 'auto',
      format: 'auto',
    }),
  }));
};


export const getBlurredBackground = (
  publicId: string,
  blurStrength: number = 2000
): string => {
  return buildCloudinaryUrl(publicId, {
    width: 1200,
    quality: 'auto',
    format: 'auto',
    effect: `blur:${blurStrength}`,
  });
};


export const getSmartThumbnail = (
  publicId: string,
  size: number = 150
): string => {
  return buildCloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: 'thumb',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
  });
};


export const getGrayscaleImage = (publicId: string): string => {
  return buildCloudinaryUrl(publicId, {
    effect: 'grayscale',
    quality: 'auto',
    format: 'auto',
  });
};


export const getEnhancedImage = (publicId: string): string => {
  return buildCloudinaryUrl(publicId, {
    effect: 'auto_contrast,auto_brightness,auto_color',
    quality: 'auto',
    format: 'auto',
  });
};


export const estimateImageSize = (
  width: number,
  height: number,
  quality: number = 80
): number => {

  const pixels = width * height;
  const bytesPerPixel = quality / 100 * 0.5; 
  return Math.round((pixels * bytesPerPixel) / 1024);
};

export const isCloudinaryConfigured = (): boolean => {
  return (
    cloudinaryConfig.cloudName !== 'TU_CLOUD_NAME' &&
    cloudinaryConfig.uploadPreset !== 'TU_UPLOAD_PRESET' &&
    cloudinaryConfig.cloudName.length > 0 &&
    cloudinaryConfig.uploadPreset.length > 0
  );
};


export const getCloudinaryUsage = async (): Promise<{
  storage: number;
  bandwidth: number;
  transformations: number;
} | null> => {
  console.warn('getCloudinaryUsage requires backend implementation');
  return null;
};

export const generateSignedUrl = async (
  publicId: string,
  transformation?: string
): Promise<string | null> => {
  console.warn('generateSignedUrl requires backend implementation');
  return null;
};


export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Cachea URLs de Cloudinary en memoria para mejorar rendimiento
 */
class CloudinaryCache {
  private cache: Map<string, string> = new Map();
  private maxSize: number = 100;

  set(key: string, url: string): void {
    if (this.cache.size >= this.maxSize) {
      // Eliminar el primer elemento (FIFO)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, url);
  }

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}

export const cloudinaryUrlCache = new CloudinaryCache();
