import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../utils/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = Colors.primary,
  trend,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <MaterialCommunityIcons
            name={icon as any}
            size={24}
            color={color}
          />
        </View>
        {trend && (
          <View
            style={[
              styles.trendContainer,
              { backgroundColor: trend.isPositive ? '#ECFDF5' : '#FEF2F2' },
            ]}
          >
            <MaterialCommunityIcons
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color={trend.isPositive ? Colors.success : Colors.danger}
            />
            <Text
              style={[
                styles.trendText,
                { color: trend.isPositive ? Colors.success : Colors.danger },
              ]}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  trendText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  title: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
});
