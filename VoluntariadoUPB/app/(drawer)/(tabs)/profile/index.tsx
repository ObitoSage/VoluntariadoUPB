import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../../../hooks/useThemeColors';
import type { ThemeColors } from '../../../theme/colors';

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    header: {
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 24,
      paddingHorizontal: 24,
    },
    profileImageContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: colors.primary,
      marginBottom: 16,
      overflow: 'hidden',
      backgroundColor: colors.surface,
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    profilePlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary + '20',
    },
    name: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    studentId: {
      fontSize: 14,
      color: colors.subtitle,
      marginBottom: 4,
    },
    career: {
      fontSize: 14,
      color: colors.subtitle,
    },
    dashboardSection: {
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    dashboardGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    dashboardCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    dashboardCardLarge: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    cardIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardValue: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 4,
    },
    cardLabel: {
      fontSize: 12,
      color: colors.subtitle,
    },
    cardLabelLarge: {
      fontSize: 14,
      color: colors.subtitle,
      marginBottom: 4,
    },
    impactSection: {
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    impactGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    impactCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    impactIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    impactTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    impactSubtitle: {
      fontSize: 12,
      color: colors.subtitle,
      textAlign: 'center',
    },
    activitySection: {
      paddingHorizontal: 24,
    },
    activityList: {
      gap: 12,
    },
    activityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      gap: 16,
    },
    activityIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    activityDate: {
      fontSize: 13,
      color: colors.subtitle,
    },
    activityValue: {
      fontSize: 16,
      fontWeight: '700',
    },
    viewAllButton: {
      alignItems: 'center',
      paddingVertical: 12,
      marginTop: 12,
    },
    viewAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
  });

const ProfileScreen = () => {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Mock data (siguiendo el patrón del proyecto)
  const userData = {
    name: 'Administrator',
    hoursLogged: 150,
    upcomingEvents: 3,
    badgesEarned: 12,
    certificates: 5,
    topVolunteer: 7,
  };

  const activities = [
    {
      id: '1',
      title: 'Cuidado de animales en refugio',
      date: 'Octubre 10, 2025',
      value: '10 horas becarias',
      icon: 'trending-up',
      iconBg: '#FFB4B4',
    },
    {
      id: '2',
      title: 'Educacion rural - apoyo escolar' ,
      date: 'Octubre 25, 2024',
      value: '2 horas becarias',
      icon: 'time',
      iconBg: '#B4FFB4',
    },
    {
      id: '3',
      title: 'Limpieza de parques y plazas',
      date: 'Noviembre 18, 2024',
      value: '6 horas becarias',
      icon: 'school',
      iconBg: '#B4D4FF',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con foto de perfil */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profilePlaceholder}>
              <Ionicons name="person" size={64} color={colors.primary} />
            </View>
          </View>
          <Text style={styles.name}>{userData.name}</Text>
        </View>

        {/* Dashboard Section */}
        <View style={styles.dashboardSection}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          
          <View style={styles.dashboardGrid}>
            <View style={[styles.dashboardCard, { backgroundColor: '#A8E6CF' }]}>
              <View style={[styles.cardIconContainer, { backgroundColor: '#ffffff40' }]}>
                <Ionicons name="heart" size={24} color="#2d5f4d" />
              </View>
              <Text style={[styles.cardValue, { color: '#2d5f4d' }]}>
                {userData.hoursLogged} hrs
              </Text>
              <Text style={[styles.cardLabel, { color: '#2d5f4d' }]}>
                Hours Logged
              </Text>
              <Text style={[styles.cardLabelLarge, { color: '#2d5f4d', fontSize: 11 }]}>
                This is incredible time
              </Text>
            </View>

            <View style={[styles.dashboardCardLarge, { backgroundColor: colors.surface }]}>
              <View style={[styles.cardIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="calendar" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.cardValue, { color: colors.text }]}>
                {userData.upcomingEvents}
              </Text>
              <Text style={[styles.cardLabel]}>Upcoming Events</Text>
              <Text style={[styles.cardLabelLarge, { fontSize: 11 }]}>
                Moonstone & Overnight
              </Text>
            </View>
          </View>
        </View>

        {/* Impact & Recognition Section */}
        <View style={styles.impactSection}>
          <Text style={styles.sectionTitle}>Impact & Recognition</Text>
          
          <View style={styles.impactGrid}>
            <View style={[styles.impactCard, { backgroundColor: '#D4EDDA' }]}>
              <View style={[styles.impactIconContainer, { backgroundColor: '#ffffff60' }]}>
                <Ionicons name="shield" size={32} color="#28a745" />
              </View>
              <Text style={[styles.impactTitle, { color: '#28a745' }]}>
                Badges Earned
              </Text>
              <Text style={[styles.impactSubtitle, { color: '#28a745' }]}>
                Bronze - {userData.badgesEarned}
              </Text>
            </View>

            <View style={[styles.impactCard, { backgroundColor: '#CCE5FF' }]}>
              <View style={[styles.impactIconContainer, { backgroundColor: '#ffffff60' }]}>
                <Ionicons name="ribbon" size={32} color="#0066cc" />
              </View>
              <Text style={[styles.impactTitle, { color: '#0066cc' }]}>
                Certificates
              </Text>
              <Text style={[styles.impactSubtitle, { color: '#0066cc' }]}>
                View {userData.certificates} Certificates
              </Text>
            </View>

            <View style={[styles.impactCard, { backgroundColor: '#FFD4B4' }]}>
              <View style={[styles.impactIconContainer, { backgroundColor: '#ffffff60' }]}>
                <Ionicons name="star" size={32} color="#ff6b35" />
              </View>
              <Text style={[styles.impactTitle, { color: '#ff6b35' }]}>
                Top Volunteer #{userData.topVolunteer}
              </Text>
              <Text style={[styles.impactSubtitle, { color: '#ff6b35' }]}>
                This Month
              </Text>
            </View>
          </View>
        </View>

        {/* Activity Feed Section */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Activity Feed</Text>
          
          <View style={styles.activityList}>
            {activities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={[styles.activityIconContainer, { backgroundColor: activity.iconBg }]}>
                  <Ionicons 
                    name={activity.icon as any} 
                    size={24} 
                    color="#fff" 
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDate}>{activity.date}</Text>
                </View>
                <Text style={[styles.activityValue, { color: colors.text }]}>
                  {activity.value}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;