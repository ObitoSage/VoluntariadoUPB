import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

interface LoadingSkeletonProps {
  type: 'card' | 'detail' | 'list';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type, count = 3 }) => {
  const { colors, theme } = useThemeColors();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const skeletonColor = theme === 'dark' ? '#2d3748' : '#e2e8f0';

  const SkeletonBox = ({ width, height, style }: any) => (
    <Animated.View
      style={[
        { width, height, backgroundColor: skeletonColor, borderRadius: 8, opacity: shimmerOpacity },
        style,
      ]}
    />
  );

  if (type === 'card') {
    return (
      <View style={styles.container}>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SkeletonBox width="100%" height={180} style={{ borderRadius: 0 }} />
            <View style={styles.cardContent}>
              <SkeletonBox width="40%" height={20} />
              <SkeletonBox width="90%" height={24} style={{ marginTop: 8 }} />
              <SkeletonBox width="70%" height={16} style={{ marginTop: 8 }} />
              <SkeletonBox width="100%" height={60} style={{ marginTop: 12 }} />
              <View style={styles.infoRow}>
                <SkeletonBox width="45%" height={16} />
                <SkeletonBox width="45%" height={16} />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (type === 'detail') {
    return (
      <View style={styles.container}>
        <SkeletonBox width="100%" height={250} />
        <View style={[styles.detailContent, { backgroundColor: colors.background }]}>
          <SkeletonBox width="80%" height={32} />
          <SkeletonBox width="60%" height={20} style={{ marginTop: 12 }} />
          <View style={[styles.infoRow, { marginTop: 16 }]}>
            <SkeletonBox width="30%" height={32} />
            <SkeletonBox width="30%" height={32} />
            <SkeletonBox width="30%" height={32} />
          </View>
          <SkeletonBox width="100%" height={120} style={{ marginTop: 24 }} />
          <SkeletonBox width="100%" height={80} style={{ marginTop: 16 }} />
        </View>
      </View>
    );
  }


  return (
    <View style={[styles.container, { padding: 16 }]}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[styles.listItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <SkeletonBox width={60} height={60} style={{ borderRadius: 30 }} />
          <View style={styles.listContent}>
            <SkeletonBox width="70%" height={18} />
            <SkeletonBox width="50%" height={14} style={{ marginTop: 8 }} />
            <SkeletonBox width="40%" height={14} style={{ marginTop: 6 }} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  detailContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 16,
  },
  listContent: {
    flex: 1,
    justifyContent: 'center',
  },
});
