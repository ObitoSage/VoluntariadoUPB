import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LA_PAZ_COORDINATES } from '../utils/mapHelpers';

const LOCATION_STORAGE_KEY = '@voluntariado_last_location';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface UseUserLocationReturn {
  location: LocationCoords | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<void>;
  watchLocation: () => Promise<void>;
  recenterToUser: () => Promise<void>;
}

export function useUserLocation(): UseUserLocationReturn {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Cargar última ubicación guardada
  const loadLastLocation = useCallback(async () => {
    try {
      const lastLocation = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      if (lastLocation) {
        const parsed = JSON.parse(lastLocation);
        setLocation(parsed);
        return true;
      }
    } catch (err) {
      console.error('Error loading last location:', err);
    }
    return false;
  }, []);

  // Guardar ubicación en AsyncStorage
  const saveLocation = useCallback(async (coords: LocationCoords) => {
    try {
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(coords));
    } catch (err) {
      console.error('Error saving location:', err);
    }
  }, []);

  // Solicitar permisos y obtener ubicación actual
  const requestPermission = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setHasPermission(false);
        setError('Permisos de ubicación denegados');
        
        // Intentar cargar última ubicación conocida
        const hasLastLocation = await loadLastLocation();
        
        if (!hasLastLocation) {
          // Usar coordenadas de La Paz como fallback
          setLocation(LA_PAZ_COORDINATES);
        }
        
        setLoading(false);
        return;
      }

      setHasPermission(true);

      // Obtener ubicación actual
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(coords);
      await saveLocation(coords);
      setLoading(false);
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setError('Error al obtener ubicación');
      
      // Fallback a última ubicación o La Paz
      const hasLastLocation = await loadLastLocation();
      if (!hasLastLocation) {
        setLocation(LA_PAZ_COORDINATES);
      }
      
      setLoading(false);
    }
  }, [loadLastLocation, saveLocation]);

  // Watch location en tiempo real
  const watchLocation = useCallback(async () => {
    if (!hasPermission) {
      console.warn('No hay permisos para watch location');
      return;
    }

    try {
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // 10 segundos
          distanceInterval: 100, // 100 metros
        },
        (newLocation) => {
          const coords = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          setLocation(coords);
          saveLocation(coords);
        }
      );
    } catch (err) {
      console.error('Error watching location:', err);
    }
  }, [hasPermission, saveLocation]);

  // Recentrar a la ubicación del usuario
  const recenterToUser = useCallback(async () => {
    await requestPermission();
  }, [requestPermission]);

  // Solicitar permisos al montar el componente
  useEffect(() => {
    requestPermission();
  }, []);

  return {
    location,
    loading,
    error,
    hasPermission,
    requestPermission,
    watchLocation,
    recenterToUser,
  };
}
