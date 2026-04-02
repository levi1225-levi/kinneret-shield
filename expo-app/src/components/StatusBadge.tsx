import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../utils/theme';

interface StatusBadgeProps {
  label: string;
  color: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  color,
  size = 'md',
}) => {
  const getBackgroundColor = (baseColor: string): string => {
    // Convert hex to RGB and apply 15% opacity
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, 0.15)`;
  };

  const sizeStyles = size === 'sm' ? styles.badgeSm : styles.badgeMd;

  return (
    <View
      style={[
        styles.container,
        sizeStyles,
        { backgroundColor: getBackgroundColor(color) },
      ]}
    >
      <Text style={[styles.label, { color }, sizeStyles === styles.badgeSm ? styles.labelSm : styles.labelMd]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  badgeMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  label: {
    fontWeight: '600',
  },
  labelSm: {
    fontSize: FontSizes.xs,
  },
  labelMd: {
    fontSize: FontSizes.sm,
  },
});
