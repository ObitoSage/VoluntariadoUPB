import { Region } from 'react-native-maps';
import { Platform } from 'react-native';

import { CategoriaType } from '../types';

interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Calcula la región óptima para mostrar un conjunto de coordenadas
 * @param points Array de coordenadas
 * @returns Región con centro y deltas apropiados
 */
export function getRegionForCoordinates(points: Coordinate[]): Region {
  // Región predeterminada centrada en La Paz
  const defaultRegion: Region = {
    latitude: -16.5,
    longitude: -68.15,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  if (points.length === 0) {
    return defaultRegion;
  }

  // Calcular límites
  let minLat = points[0].latitude;
  let maxLat = points[0].latitude;
  let minLng = points[0].longitude;
  let maxLng = points[0].longitude;

  points.forEach((point) => {
    minLat = Math.min(minLat, point.latitude);
    maxLat = Math.max(maxLat, point.latitude);
    minLng = Math.min(minLng, point.longitude);
    maxLng = Math.max(maxLng, point.longitude);
  });

  // Calcular centro
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Calcular deltas con padding del 50%
  const latDelta = Math.max((maxLat - minLat) * 1.5, 0.01);
  const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.01);

  return {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

/**
 * Obtiene el color hexadecimal para una categoría
 * @param categoria Tipo de categoría
 * @returns Color hexadecimal
 */
export function getCategoryColor(categoria: CategoriaType): string {
  const colors: Record<CategoriaType, string> = {
    social: '#FF6B6B',
    ambiental: '#51CF66',
    educativo: '#4ECDC4',
    cultural: '#AA96DA',
    salud: '#F38181',
  };

  return colors[categoria] || '#8E8E93';
}

/**
 * Genera un deeplink a la aplicación de mapas del sistema
 * @param latitude Latitud del destino
 * @param longitude Longitud del destino
 * @param label Etiqueta del destino
 * @param provider 'google' o 'apple'
 * @returns URL del deeplink
 */
export function generateMapDeeplink(
  latitude: number,
  longitude: number,
  label: string,
  provider: 'google' | 'apple' = Platform.OS === 'ios' ? 'apple' : 'google'
): string {
  const encodedLabel = encodeURIComponent(label);

  if (provider === 'apple') {
    return `http://maps.apple.com/?daddr=${latitude},${longitude}&q=${encodedLabel}`;
  }

  // Google Maps
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodedLabel}`;
}

/**
 * Coordenadas predeterminadas de campus universitarios en Bolivia
 */
export const CAMPUS_COORDINATES: Record<string, Coordinate> = {
  'UMSA': { latitude: -16.5350, longitude: -68.0747 },
  'UCB': { latitude: -16.5061, longitude: -68.1192 },
  'EMI': { latitude: -16.5233, longitude: -68.0586 },
  'UPB': { latitude: -16.5400, longitude: -68.0500 },
  'UPSA': { latitude: -17.7964, longitude: -63.1853 },
};

/**
 * Coordenadas de La Paz (fallback)
 */
export const LA_PAZ_COORDINATES: Coordinate = {
  latitude: -16.5,
  longitude: -68.15,
};
