import React, { useState } from 'react';
import { Link, Stack } from 'expo-router';
import { 
StyleSheet, 
Text, 
View, 
TouchableOpacity, 
ScrollView, 
Image, 
Dimensions,
FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../hooks/useThemeColors';
import { useVoluntariadoStore } from '../../store/voluntariadoStore';
import type { ThemeColors } from '../../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

const createStyles = (colors: ThemeColors) =>
StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: colors.background,
    },
    scrollContent: {
    paddingBottom: 24,
    },
    welcomeSection: {
    padding: 24,
    marginBottom: 16,
    },
    title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    },
    subtitle: {
    fontSize: 16,
    color: colors.subtitle,
    lineHeight: 22,
    },
    statsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
    },
    sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    },
    statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    },
    statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    },
    statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
    },
    statLabel: {
    fontSize: 14,
    color: colors.subtitle,
    textAlign: 'center',
    },
    calendarSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
    },
    monthHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
    },
    weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    },
    dayCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    position: 'relative',
    },
    dayCardWithEvent: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
    },
    dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    },
    dayNumberWithEvent: {
    color: colors.primary,
    },
    eventEmoji: {
    fontSize: 12,
    marginTop: 2,
    },
    carouselSection: {
    marginBottom: 32,
    },
    carouselHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
    },
    carouselTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    },
    carouselDescription: {
    fontSize: 15,
    color: colors.subtitle,
    lineHeight: 22,
    textAlign: 'center',
    },
    carouselContainer: {
    height: 280,
    },
    carouselItem: {
    width: screenWidth - 48,
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#00b5ad',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    },
    carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    },
    carouselPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
    },
    paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.muted,
    },
    paginationDotActive: {
    backgroundColor: colors.primary,
    },
    coordinatorSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    },
    coordinatorCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    },
    coordinatorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: colors.muted,
    },
    coordinatorName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
    },
    coordinatorTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
    },
    coordinatorContactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    },
    coordinatorContactText: {
    fontSize: 14,
    color: colors.subtitle,
    marginLeft: 8,
    },
});

const InicioScreen = () => {
const { colors } = useThemeColors();
const styles = React.useMemo(() => createStyles(colors), [colors]);
const [currentImageIndex, setCurrentImageIndex] = useState(0);

const voluntariados = useVoluntariadoStore((state) => state.voluntariados);

const totalOportunidades = voluntariados.length;
const oportunidadesDisponibles = voluntariados.filter(
    v => v.participantesActuales < v.participantesMaximos
).length;

const carouselImages = [
    require('../../../assets/Mensaje/Mensaje1.jpeg'),
    require('../../../assets/Mensaje/Mensaje2.jpeg'),
    require('../../../assets/Mensaje/Mensaje3.jpeg'),
    require('../../../assets/Mensaje/Mensaje4.jpeg'),
    require('../../../assets/Mensaje/Mensaje5.jpeg'),
    require('../../../assets/Mensaje/Mensaje6.jpeg'),
    require('../../../assets/Mensaje/Mensaje7.jpeg'),
    require('../../../assets/Mensaje/Mensaje8.jpeg'),
    require('../../../assets/Mensaje/Mensaje9.jpeg'),
];

const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);

    const weekDays = [];

    for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    
    const dayNumber = day.getDate();
    const hasEvent = dayNumber === 10 || dayNumber === 8 || dayNumber === 12;

    weekDays.push({
        number: dayNumber,
        hasEvent,
        isToday: day.toDateString() === today.toDateString(),
        eventType: dayNumber === 10 ? 'pets' : 'general',
    });
    }
    return weekDays;
};

const weekDays = getWeekDays();

const renderCarouselItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.carouselItem}>
    <Image source={item} style={styles.carouselImage} />
    </View>
);

const onCarouselScroll = (event: any) => {
    const slideSize = screenWidth - 48;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
};

return (
    <View style={styles.container}>
    <Stack.Screen options={{ title: 'Inicio' }} />
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
        <Text style={styles.title}>¡Hola!</Text>
        <Text style={styles.subtitle}>
            Bienvenido a Voluntariado UPB. Encuentra oportunidades para contribuir 
            a tu comunidad universitaria y desarrollar nuevas habilidades.
        </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        <View style={styles.statsContainer}>
            <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalOportunidades}</Text>
            <Text style={styles.statLabel}>Total{'\n'}Oportunidades</Text>
            </View>
            <View style={styles.statCard}>
            <Text style={styles.statNumber}>{oportunidadesDisponibles}</Text>
            <Text style={styles.statLabel}>Disponibles{'\n'}Ahora</Text>
            </View>
        </View>
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarSection}>
        <Text style={styles.sectionTitle}>Octubre 2025</Text>
        <View style={styles.weekContainer}>
            {weekDays.map((day, index) => (
            <View
                key={index}
                style={[
                styles.dayCard,
                day.hasEvent && styles.dayCardWithEvent,
                ]}
            >
                <Text style={[
                styles.dayNumber,
                day.hasEvent && styles.dayNumberWithEvent,
                ]}>{day.number}</Text>
                {day.hasEvent && day.eventType === 'pets' && (
                <Text style={styles.eventEmoji}>🐾</Text>
                )}
            </View>
            ))}
        </View>
        </View>

        {/* Carousel Section */}
        <View style={styles.carouselSection}>
        <View style={styles.carouselHeader}>
            <Text style={styles.carouselTitle}>PARTICIPAR EN VOLUNTARIADOS ES...</Text>
            <Text style={styles.carouselDescription}>
            Una experiencia sumamente enriquecedora que va mucho más allá de simplemente ayudar a otros. 
            Te aporta una serie de beneficios en múltiples aspectos de tu vida.
            </Text>
        </View>
        
        <FlatList
            data={carouselImages}
            renderItem={renderCarouselItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onCarouselScroll}
            style={styles.carouselContainer}
        />
        
        <View style={styles.carouselPagination}>
            {carouselImages.map((_, index) => (
            <View
                key={index}
                style={[
                styles.paginationDot,
                index === currentImageIndex && styles.paginationDotActive,
                ]}
            />
            ))}
        </View>
        </View>

        {/* Coordinator Section */}
        <View style={styles.coordinatorSection}>
        <Text style={styles.sectionTitle}>Coordinadora</Text>
        <View style={styles.coordinatorCard}>
            <Image 
            source={require('../../../assets/Coordinadoraa.png')} 
            style={styles.coordinatorImage}
            />
            <Text style={styles.coordinatorName}>Paola López</Text>
            <Text style={styles.coordinatorTitle}>
            Coordinadora de Voluntariados{'\n'}y Responsabilidad Social
            </Text>
            
            <View style={styles.coordinatorContactContainer}>
            <Ionicons name="mail-outline" size={16} color={colors.primary} />
            <Text style={styles.coordinatorContactText}>paolalopez@upb.edu</Text>
            </View>
            
            <View style={styles.coordinatorContactContainer}>
            <Ionicons name="call-outline" size={16} color={colors.primary} />
            <Text style={styles.coordinatorContactText}>77520037</Text>
            </View>
        </View>
        </View>
    </ScrollView>
    </View>
);
};

export default InicioScreen;
