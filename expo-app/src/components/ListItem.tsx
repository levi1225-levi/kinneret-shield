import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../utils/theme';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  leftColor?: string;
  rightText?: string;
  rightColor?: string;
  onPress?: () => void;
  showChevron?: boolean;
  style?: ViewStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  leftColor = Colors.primary,
  rightText,
  rightColor = Colors.textSecondary,
  onPress,
  showChevron = true,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {leftIcon && (
        <View style={[styles.leftIconContainer, { backgroundColor: `${leftColor}15` }]}>
          <MaterialCommunityIcons
            name={leftIcon as any}
            size={24}
            color={leftColor}
          />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.right}>
        {rightText && (
          <Text style={[styles.rightText, { color: rightColor }]}>
            {rightText}
          </Text>
        )}
        {showChevron && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={Colors.textMuted}
            style={styles.chevron}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  leftIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rightText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: Spacing.sm,
  },
});
