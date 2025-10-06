import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVoluntariadoStore, Voluntariado } from '../../../store/voluntariadoStore';
import { useThemeColors } from '../../../hooks/useThemeColors';

export default function OportunidadesListScreen() {
  const router = useRouter();
  const { theme, colors } = useThemeColors();
  
  const voluntariados = useVoluntariadoStore((state) => state.voluntariados);
  const setVoluntariadoSeleccionado = useVoluntariadoStore(
    (state) => state.setVoluntariadoSeleccionado
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const screenColors = {
    searchBackground: theme === 'dark' ? '#3d3d3d' : '#f0f0f0',
    categoryActive: colors.primary,
    categoryInactive: theme === 'dark' ? '#3d3d3d' : '#e8e8e8',
    cardBackground: colors.surface,
  };

  const categories = [
    { key: null, label: 'Todos', icon: 'apps' },
    { key: 'animales', label: 'Animales', icon: 'paw' },
    { key: 'educacion', label: 'Educación', icon: 'school' },
    { key: 'medio-ambiente', label: 'Ambiente', icon: 'leaf' },
    { key: 'salud', label: 'Salud', icon: 'medical' },
    { key: 'comunidad', label: 'Comunidad', icon: 'people' },
  ];

  const filteredVoluntariados = voluntariados.filter((v) => {
    const matchesSearch =
      v.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.organizacion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.ubicacion.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || v.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleVoluntariadoPress = (voluntariado: Voluntariado) => {
    setVoluntariadoSeleccionado(voluntariado);
    router.push(`/opportunities/${voluntariado.id}`);
  };

  const getCategoryColor = (categoria: string) => {
    const categoryColors: Record<string, string> = {
      animales: '#FF6B6B',
      educacion: '#4ECDC4',
      'medio-ambiente': '#95E1D3',
      salud: '#F38181',
      comunidad: '#AA96DA',
    };
    return categoryColors[categoria] || colors.primary;
  };

  const renderVoluntariadoCard = ({ item }: { item: Voluntariado }) => {
    const disponibles = item.participantesMaximos - item.participantesActuales;
    const porcentajeOcupado = (item.participantesActuales / item.participantesMaximos) * 100;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: screenColors.cardBackground, borderColor: colors.border }]}
        onPress={() => handleVoluntariadoPress(item)}
        activeOpacity={0.7}
      >
        {/* Emoji/Imagen */}
        <View style={styles.cardHeader}>
          <View style={[styles.emojiContainer, { backgroundColor: getCategoryColor(item.categoria) + '20' }]}>
            <Text style={styles.emoji}>{item.imagen}</Text>
          </View>
          <View style={styles.headerInfo}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.categoria) }]}>
              <Text style={styles.categoryText}>{item.categoria.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Contenido */}
        <View style={styles.cardContent}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {item.titulo}
          </Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="business" size={14} color={colors.subtitle} />
            <Text style={[styles.infoText, { color: colors.subtitle }]} numberOfLines={1}>
              {item.organizacion}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location" size={14} color={colors.subtitle} />
            <Text style={[styles.infoText, { color: colors.subtitle }]} numberOfLines={1}>
              {item.ubicacion}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={14} color={colors.subtitle} />
            <Text style={[styles.infoText, { color: colors.subtitle }]}>
              {item.fecha} • {item.duracion}
            </Text>
          </View>

          {/* Disponibilidad */}
          <View style={styles.availabilityContainer}>
            <View style={styles.availabilityInfo}>
              <Ionicons 
                name="people" 
                size={16} 
                color={disponibles > 0 ? colors.primary : '#FF6B6B'} 
              />
              <Text style={[styles.availabilityText, { color: colors.text }]}>
                {disponibles > 0 
                  ? `${disponibles} lugares disponibles`
                  : 'Completo'}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${porcentajeOcupado}%`,
                    backgroundColor: porcentajeOcupado >= 100 ? '#FF6B6B' : colors.primary 
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.primary }]}>
            Ver detalles →
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background}
      />
      
      {/* Buscador */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: screenColors.searchBackground }]}>
          <Ionicons name="search" size={20} color={colors.subtitle} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar voluntariados..."
            placeholderTextColor={colors.subtitle}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.subtitle} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtros de categoría */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.key || 'all'}
          contentContainerStyle={styles.categoriesContainer}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item.key;
            return (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isActive ? screenColors.categoryActive : screenColors.categoryInactive,
                  },
                ]}
                onPress={() => setSelectedCategory(item.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon as any}
                  size={16}
                  color={isActive ? '#ffffff' : colors.subtitle}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: isActive ? '#ffffff' : colors.subtitle },
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Contador de resultados */}
      <View style={styles.resultsCounter}>
        <Text style={[styles.resultsText, { color: colors.subtitle }]}>
          {filteredVoluntariados.length} {filteredVoluntariados.length === 1 ? 'oportunidad' : 'oportunidades'} {selectedCategory ? `en ${categories.find(c => c.key === selectedCategory)?.label}` : 'disponibles'}
        </Text>
      </View>

      {/* Lista de voluntariados */}
      <FlatList
        data={filteredVoluntariados}
        keyExtractor={(item) => item.id}
        renderItem={renderVoluntariadoCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={64} color={colors.subtitle} />
            <Text style={[styles.emptyText, { color: colors.subtitle }]}>
              No se encontraron voluntariados
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.subtitle }]}>
              Intenta con otros términos de búsqueda
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesWrapper: {
    height: 56,
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 10,
    height: 40,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  resultsCounter: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 12,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  availabilityContainer: {
    marginTop: 8,
    gap: 6,
  },
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});
