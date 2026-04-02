import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../utils/theme';

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  isSelected,
  onPress,
  color = Colors.primary,
  style,
}) => {
  const getBackgroundColor = (baseColor: string, selected: boolean): string => {
    if (!selected) {
      return Colors.surfaceAlt;
    }
    // Convert hex to RGB and apply 15% opacity
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, 0.15)`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(color, isSelected),
          borderColor: isSelected ? color : Colors.border,
          borderWidth: isSelected ? 2 : 1,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.label,
          {
            color: isSelected ? color : Colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
