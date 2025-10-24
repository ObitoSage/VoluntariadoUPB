export const cloudinaryConfig = {
  cloudName: 'dww3c55wo', 
  uploadPreset: 'voluntariado_uploads', 
  apiKey: '858683655214169',
};

export const CLOUDINARY_FOLDERS = {
  AVATARS: 'voluntariado/avatars',
  COVERS: 'voluntariado/covers',
  OPORTUNIDADES: 'voluntariado/oportunidades',
} as const;

export const CLOUDINARY_TRANSFORMATIONS = {
  avatar: 'w_200,h_200,c_fill,g_face,q_auto,f_auto',
  avatarLarge: 'w_400,h_400,c_fill,g_face,q_auto,f_auto',
  cover: 'w_800,h_300,c_fill,q_auto,f_auto',
  thumbnail: 'w_100,h_100,c_thumb,g_face,q_auto,f_auto',
  oportunidad: 'w_600,h_400,c_fill,q_auto,f_auto',
} as const;

/**
 * Construye una URL de Cloudinary con transformaciones
 * @param publicId - El public_id de la imagen en Cloudinary
 * @param transformation - Tipo de transformación a aplicar
 * @returns URL completa de la imagen transformada
 */
export const getCloudinaryUrl = (
  publicId: string,
  transformation?: keyof typeof CLOUDINARY_TRANSFORMATIONS
): string => {
  if (!publicId) return '';
  
  // Si ya es una URL completa, retornarla
  if (publicId.startsWith('http')) {
    return publicId;
  }

  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;
  
  if (transformation && CLOUDINARY_TRANSFORMATIONS[transformation]) {
    return `${baseUrl}/${CLOUDINARY_TRANSFORMATIONS[transformation]}/${publicId}`;
  }
  
  return `${baseUrl}/${publicId}`;
};

/**
 * Extrae el public_id de una URL de Cloudinary
 * @param url - URL completa de Cloudinary
 * @returns public_id extraído
 */
export const extractPublicId = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  const parts = url.split('/upload/');
  if (parts.length < 2) return url;
  

  const withoutTransformations = parts[1].split('/').filter(part => 
    !part.includes('_') || part.includes('/')
  ).join('/');
  

  return withoutTransformations.replace(/\.[^/.]+$/, '');
};
