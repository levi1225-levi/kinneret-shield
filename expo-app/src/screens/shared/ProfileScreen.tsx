import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
  getRoleColor,
} from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, ListItem, Card } from '../../components';
import { User } from '../../types';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout, refreshUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await refreshUser();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh user information');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshUser]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
              setIsLoggingOut(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  }, [logout]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={styles.headerCard}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            {user.avatar_url ? (
              <Text style={styles.avatarInitials}>{getInitials(user.name)}</Text>
            ) : (
              <Text style={styles.avatarInitials}>{getInitials(user.name)}</Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.roleBadgeContainer}>
          <StatusBadge
            label={user.role.replace('_', ' ').toUpperCase()}
            color={getRoleColor(user.role)}
            size="md"
          />
        </View>
      </View>

      {/* Account Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <Card>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>{formatDate(user.created_at)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status</Text>
              <View style={styles.statusIndicator}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: user.is_active ? Colors.success : Colors.danger },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: user.is_active ? Colors.success : Colors.danger },
                  ]}
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.listContainer}>
          <ListItem
            title="Notification Settings"
            subtitle="Manage your notification preferences"
            leftIcon="bell-outline"
            leftColor={Colors.primary}
            onPress={() => {
              Alert.alert('Info', 'Notification settings coming soon');
            }}
            showChevron={true}
          />
          <ListItem
            title="About"
            subtitle="Learn more about Kinneret Shield"
            leftIcon="information-outline"
            leftColor={Colors.info}
            onPress={() => {
              Alert.alert('Kinneret Shield', 'Version 1.0.0\n\nAdvanced school safety management system.');
            }}
            showChevron={true}
          />
          <ListItem
            title="Help & Support"
            subtitle="Get help with the app"
            leftIcon="help-circle-outline"
            leftColor={Colors.warning}
            onPress={() => {
              Alert.alert('Help', 'Support team can be reached at support@kinneret.io');
            }}
            showChevron={true}
          />
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.8}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="logout"
                size={20}
                color={Colors.white}
                style={styles.logoutIcon}
              />
              <Text style={styles.logoutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer Spacing */}
      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerCard: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  avatarInitials: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  roleBadgeContainer: {
    alignItems: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  listContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: Colors.danger,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    minHeight: 48,
  },
  logoutIcon: {
    marginRight: Spacing.sm,
  },
  logoutText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  footer: {
    height: Spacing.lg,
  },
});

export default ProfileScreen;
