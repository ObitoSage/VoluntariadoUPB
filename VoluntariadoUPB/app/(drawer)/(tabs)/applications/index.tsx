import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { 
StyleSheet, 
Text, 
View, 
TouchableOpacity, 
ScrollView, 
FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../../hooks/useThemeColors';
import { useVoluntariadoStore, type Application } from '../../../store/voluntariadoStore';
import type { ThemeColors } from '../../../theme/colors';

const createStyles = (colors: ThemeColors) =>
StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: colors.background,
    },
    scrollContent: {
    paddingBottom: 120,
    paddingTop: 8,
    },
    headerSection: {
    padding: 24,
    paddingBottom: 16,
    },
    headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    },
    headerSubtitle: {
    fontSize: 16,
    color: colors.subtitle,
    lineHeight: 22,
    },
    filtersSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    },
    filtersContainer: {
    flexDirection: 'row',
    gap: 12,
    },
    filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    },
    filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    },
    filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    },
    filterTextActive: {
    color: '#ffffff',
    },
    applicationsSection: {
    flex: 1,
    paddingHorizontal: 24,
    },
    applicationsList: {
    flex: 1,
    paddingHorizontal: 24,
    },
    applicationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    },
    applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    },
    applicationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 12,
    },
    statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 85,
    alignItems: 'center',
    borderWidth: 1,
    },
    statusBadgePending: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFB300',
    },
    statusBadgeAccepted: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    },
    statusBadgeRejected: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    },
    statusBadgeInReview: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    },
    statusText: {
    fontSize: 12,
    fontWeight: '600',
    },
    statusTextPending: {
    color: '#E65100',
    fontWeight: '600',
    },
    statusTextAccepted: {
    color: '#2E7D32',
    fontWeight: '600',
    },
    statusTextRejected: {
    color: '#C62828',
    fontWeight: '600',
    },
    statusTextInReview: {
    color: '#1565C0',
    fontWeight: '600',
    },
    applicationDetails: {
    marginBottom: 16,
    },
    detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    },
    detailIcon: {
    marginRight: 8,
    width: 16,
    },
    detailText: {
    fontSize: 14,
    color: colors.subtitle,
    flex: 1,
    },
    applicationActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    },
    actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
    width: 0,
    height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    },
    primaryButton: {
    backgroundColor: colors.primary,
    },
    secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary + '40',
    },
    buttonText: {
    fontSize: 14,
    fontWeight: '600',
    },
    primaryButtonText: {
    color: '#ffffff',
    },
    secondaryButtonText: {
    color: colors.text,
    },
    emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    },
    emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    },
    emptyIcon: {
    marginBottom: 0,
    },
    emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    },
    emptyDescription: {
    fontSize: 16,
    color: colors.subtitle,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    },
    emptyActionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    },
    emptyActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    },
});

const ApplicationsScreen = () => {
const { colors } = useThemeColors();
const styles = React.useMemo(() => createStyles(colors), [colors]);
const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'inReview'>('all');

const applications = useVoluntariadoStore((state) => state.applications);

const filters = [
    { key: 'all', title: 'Todas', count: applications.length },
    { key: 'pending', title: 'Pendientes', count: applications.filter(a => a.status === 'pending').length },
    { key: 'accepted', title: 'Aceptadas', count: applications.filter(a => a.status === 'accepted').length },
    { key: 'inReview', title: 'En Revisión', count: applications.filter(a => a.status === 'inReview').length },
    { key: 'rejected', title: 'Rechazadas', count: applications.filter(a => a.status === 'rejected').length },
];

const filteredApplications = activeFilter === 'all' 
    ? applications 
    : applications.filter(app => app.status === activeFilter);

const getStatusBadgeStyle = (status: string) => {
    switch (status) {
    case 'pending': return styles.statusBadgePending;
    case 'accepted': return styles.statusBadgeAccepted;
    case 'rejected': return styles.statusBadgeRejected;
    case 'inReview': return styles.statusBadgeInReview;
    default: return styles.statusBadgePending;
    }
};

const getStatusTextStyle = (status: string) => {
    switch (status) {
    case 'pending': return styles.statusTextPending;
    case 'accepted': return styles.statusTextAccepted;
    case 'rejected': return styles.statusTextRejected;
    case 'inReview': return styles.statusTextInReview;
    default: return styles.statusTextPending;
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
    case 'pending': return 'Pendiente';
    case 'accepted': return 'Aceptada';
    case 'rejected': return 'Rechazada';
    case 'inReview': return 'En Revisión';
    default: return 'Pendiente';
    }
};

const renderApplicationCard = ({ item }: { item: Application }) => (
    <View style={styles.applicationCard}>
    <View style={styles.applicationHeader}>
        <Text style={styles.applicationTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
        <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>
            {getStatusLabel(item.status)}
        </Text>
        </View>
    </View>

    <View style={styles.applicationDetails}>
        <View style={styles.detailRow}>
        <Ionicons name="business-outline" size={16} color={colors.subtitle} style={styles.detailIcon} />
        <Text style={styles.detailText}>{item.organization}</Text>
        </View>
        <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={16} color={colors.subtitle} style={styles.detailIcon} />
        <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={16} color={colors.subtitle} style={styles.detailIcon} />
        <Text style={styles.detailText}>Aplicado el {item.applicationDate}</Text>
        </View>
        <View style={styles.detailRow}>
        <Ionicons name="document-text-outline" size={16} color={colors.subtitle} style={styles.detailIcon} />
        <Text style={styles.detailText}>{item.description}</Text>
        </View>
    </View>

    <View style={styles.applicationActions}>
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
        <Ionicons name="eye-outline" size={16} color={colors.text} />
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Ver Detalles</Text>
        </TouchableOpacity>
        {item.status === 'accepted' && (
        <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
            <Ionicons name="checkmark-outline" size={16} color="#ffffff" />
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Confirmar</Text>
        </TouchableOpacity>
        )}
        {item.status === 'pending' && (
        <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
            <Ionicons name="create-outline" size={16} color="#ffffff" />
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Editar</Text>
        </TouchableOpacity>
        )}
    </View>
    </View>
);

const renderEmptyState = () => (
    <View style={styles.emptyState}>
    <View style={styles.emptyIconContainer}>
        <Ionicons name="document-text-outline" size={48} color={colors.primary} style={styles.emptyIcon} />
    </View>
    <Text style={styles.emptyTitle}>No hay postulaciones</Text>
    <Text style={styles.emptyDescription}>
        Aún no has aplicado a ningún voluntariado.{'\n'}
        Explora las oportunidades disponibles y comienza a hacer la diferencia.
    </Text>
    <TouchableOpacity style={styles.emptyActionButton}>
        <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
        <Text style={styles.emptyActionText}>Explorar Oportunidades</Text>
    </TouchableOpacity>
    </View>
);

return (
    <View style={styles.container}>
    <Stack.Screen options={{ title: 'Mis Postulaciones' }} />
    
      {/* Header Section */}
    <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Mis Postulaciones</Text>
        <Text style={styles.headerSubtitle}>
        Mantén un seguimiento de todas tus aplicaciones a voluntariados y su estado actual.
        </Text>
    </View>

      {/* Filters Section */}
    <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
        {filters.map((filter) => (
            <TouchableOpacity
            key={filter.key}
            style={[
                styles.filterChip,
                activeFilter === filter.key && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter.key as any)}
            >
            <Text style={[
                styles.filterText,
                activeFilter === filter.key && styles.filterTextActive,
            ]}>
                {filter.title} ({filter.count})
            </Text>
            </TouchableOpacity>
        ))}
        </ScrollView>
    </View>

      {/* Applications List */}
    {filteredApplications.length > 0 ? (
        <FlatList
        data={filteredApplications}
        renderItem={renderApplicationCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.applicationsList}
        />
    ) : (
        <View style={styles.applicationsSection}>
        {renderEmptyState()}
        </View>
    )}
    </View>
);
};

export default ApplicationsScreen;