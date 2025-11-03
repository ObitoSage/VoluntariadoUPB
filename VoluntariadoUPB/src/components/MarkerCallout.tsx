import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

import { Oportunidad } from '../types';
import { CategoriaBadge } from './CategoriaBadge';
import { getCategoryColor } from '../utils/mapHelpers';

interface MarkerCalloutProps {
  oportunidad: Oportunidad;
  distanciaFormateada?: string;
  onPress: () => void;
}

export function MarkerCallout({ oportunidad, distanciaFormateada, onPress }: MarkerCalloutProps) {
  const categoryColor = getCategoryColor(oportunidad.categoria);

  if (!oportunidad.ubicacion?.lat || !oportunidad.ubicacion?.lng) {
    return null;
  }

  return (
    <Marker
      coordinate={{
        latitude: oportunidad.ubicacion.lat,
        longitude: oportunidad.ubicacion.lng,
      }}
      tracksViewChanges={false}
    >
      <Callout tooltip onPress={onPress}>
        <View style={styles.container}>
          {/* Imagen de portada */}
          {oportunidad.cover && (
            <Image
              source={{ uri: oportunidad.cover }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          )}

          {/* Contenido */}
          <View style={styles.content}>
            {/* Badge de categoría */}
            <CategoriaBadge categoria={oportunidad.categoria} size="small" />

            {/* Título */}
            <Text style={styles.title} numberOfLines={2}>
              {oportunidad.titulo}
            </Text>

            {/* Organización */}
            <View style={styles.row}>
              <Ionicons name="business" size={14} color="#8E8E93" />
              <Text style={styles.organizacion} numberOfLines={1}>
                {oportunidad.organizacion}
              </Text>
            </View>

            {/* Distancia */}
            {distanciaFormateada && (
              <View style={styles.row}>
                <Ionicons name="navigate" size={14} color="#007AFF" />
                <Text style={styles.distancia}>{distanciaFormateada}</Text>
              </View>
            )}

            {/* Cupos disponibles */}
            <View style={styles.row}>
              <Ionicons name="people" size={14} color="#34C759" />
              <Text style={styles.cupos}>
                {oportunidad.cuposDisponibles} cupos disponibles
              </Text>
            </View>

            {/* Botón */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: categoryColor }]}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Ver Detalle</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  coverImage: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  organizacion: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  distancia: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  cupos: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
