import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  FlatList,
  Text,
  TouchableOpacity,
  Alert,
  SectionList,
  SectionListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../utils/theme';
import {
  ListItem,
  SearchBar,
  EmptyState,
  LoadingScreen,
  ErrorScreen,
  Card,
} from '../../components';
import { usersAPI, invitesAPI } from '../../api';
import { mockAPI, MOCK_INVITES } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { User, InviteCode, UserRole } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TabType = 'users' | 'invites' | 'settings';

interface SettingsItem {
  id: string;
  label: string;
  value: string;
}

export const AdminPanel: React.FC = () => {
  const { isDemoMode } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Users tab state
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Invites tab state
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [filteredInvites, setFilteredInvites] = useState<InviteCode[]>([]);
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [creatingInvite, setCreatingInvite] = useState(false);

  // Settings data
  const settingsData: SettingsItem[] = [
    { id: '1', label: 'Server URL', value: 'https://api.kinneret-shield.camp' },
    { id: '2', label: 'Auto-Checkout Time', value: '8 hours' },
    { id: '3', label: 'Emergency Contacts', value: '3 configured' },
    { id: '4', label: 'About Kinneret Shield', value: 'v1.0' },
  ];

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      if (activeTab === 'users') {
        if (isDemoMode) {
          const usersData = await mockAPI.getUsers(1, 100);
          setUsers(usersData.items);
          setFilteredUsers(usersData.items);
        } else {
          const usersData = await usersAPI.getUsers({ page: 1, limit: 100 });
          setUsers(usersData.items);
          setFilteredUsers(usersData.items);
        }
      } else if (activeTab === 'invites') {
        if (isDemoMode) {
          const invitesData = await mockAPI.getInvites(1, 100);
          setInvites(invitesData.items);
          setFilteredInvites(invitesData.items);
        } else {
          const invitesData = await invitesAPI.getInvites({ page: 1, limit: 100 });
          setInvites(invitesData.items);
          setFilteredInvites(invitesData.items);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, isDemoMode]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [activeTab, fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Users tab handlers
  useEffect(() => {
    const filtered = users.filter((user) => {
      const query = userSearchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });
    setFilteredUsers(filtered);
  }, [userSearchQuery, users]);

  const handleToggleUserStatus = useCallback(
    async (user: User) => {
      try {
        const newStatus = !user.is_active;
        const action = newStatus ? 'activate' : 'deactivate';
        Alert.alert(
          `${action.charAt(0).toUpperCase()}${action.slice(1)} User`,
          `Are you sure you want to ${action} ${user.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Confirm',
              onPress: async () => {
                if (isDemoMode) {
                  const updatedUser = { ...user, is_active: newStatus };
                  setUsers(
                    users.map((u) => (u.id === user.id ? updatedUser : u))
                  );
                  Alert.alert('Success', `Demo mode - User ${action}d successfully`);
                } else {
                  const updatedUser = newStatus
                    ? await usersAPI.activateUser(user.id)
                    : await usersAPI.deactivateUser(user.id);

                  setUsers(
                    users.map((u) => (u.id === user.id ? updatedUser : u))
                  );
                  Alert.alert('Success', `User ${action}d successfully`);
                }
              },
              style: 'destructive',
            },
          ]
        );
      } catch (err) {
        Alert.alert('Error', 'Failed to update user status');
      }
    },
    [users, isDemoMode]
  );

  // Invites tab handlers
  useEffect(() => {
    const filtered = invites.filter((invite) => {
      const query = inviteSearchQuery.toLowerCase();
      return invite.code.toLowerCase().includes(query) || invite.role.includes(query);
    });
    setFilteredInvites(filtered);
  }, [inviteSearchQuery, invites]);

  const handleCreateInvite = useCallback(() => {
    const roles: UserRole[] = ['management'];

    Alert.alert('Create Invite', 'Select a role for the new invite code:', [
      ...roles.map((role) => ({
        text: role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' '),
        onPress: async () => {
          try {
            setCreatingInvite(true);
            if (isDemoMode) {
              const mockCode = `DEMO-${role.toUpperCase()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
              const newInvite: InviteCode = {
                id: `mock-${Date.now()}`,
                code: mockCode,
                role,
                is_used: false,
                is_expired: false,
                created_at: new Date().toISOString(),
                created_by: 'admin',
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                used_by: undefined,
                used_at: undefined,
              };
              setInvites([newInvite, ...invites]);
              Alert.alert(
                'Success',
                `Demo mode - Invite code created: ${newInvite.code}\n\nCopy and share this code with the user.`
              );
            } else {
              const newInvite = await invitesAPI.createInvite(role);
              setInvites([newInvite, ...invites]);
              Alert.alert(
                'Success',
                `Invite code created: ${newInvite.code}\n\nCopy and share this code with the user.`
              );
            }
          } catch (err) {
            Alert.alert('Error', 'Failed to create invite code');
          } finally {
            setCreatingInvite(false);
          }
        },
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [invites, isDemoMode]);

  const renderUsersTab = () => {
    if (error) {
      return <ErrorScreen message={error} onRetry={fetchData} />;
    }

    return (
      <>
        <SearchBar
          value={userSearchQuery}
          onChangeText={setUserSearchQuery}
          placeholder="Search by name or email..."
        />
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <EmptyState
              icon="account-off"
              title="No users found"
              subtitle={
                userSearchQuery
                  ? 'Try adjusting your search'
                  : 'No users in the system'
              }
            />
          }
          renderItem={({ item }) => (
            <ListItem
              title={item.name}
              subtitle={item.email}
              leftIcon="account"
              leftColor={getRoleColor(item.role)}
              rightText={item.is_active ? 'Active' : 'Inactive'}
              rightColor={item.is_active ? Colors.success : Colors.textMuted}
              onPress={() => handleToggleUserStatus(item)}
              showChevron={false}
            />
          )}
          scrollEnabled={true}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </>
    );
  };

  const renderInvitesTab = () => {
    if (error) {
      return <ErrorScreen message={error} onRetry={fetchData} />;
    }

    return (
      <>
        <View style={styles.inviteHeader}>
          <SearchBar
            value={inviteSearchQuery}
            onChangeText={setInviteSearchQuery}
            placeholder="Search invite codes..."
          />
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateInvite}
            disabled={creatingInvite}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={Colors.white}
              style={styles.createButtonIcon}
            />
            <Text style={styles.createButtonText}>Create Invite</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredInvites}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <EmptyState
              icon="ticket"
              title="No invite codes"
              subtitle="Create a new invite code to add users"
              actionLabel="Create Invite"
              onAction={handleCreateInvite}
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.inviteCard}>
              <View style={styles.inviteContent}>
                <View style={styles.inviteInfo}>
                  <Text style={styles.inviteCode}>{item.code}</Text>
                  <View style={styles.inviteMeta}>
                    <Text style={styles.inviteRole}>{item.role}</Text>
                    <Text style={styles.inviteSeparator}>•</Text>
                    <Text style={styles.inviteStatus}>
                      {item.is_used ? 'Used' : item.is_expired ? 'Expired' : 'Unused'}
                    </Text>
                  </View>
                  {item.created_at && (
                    <Text style={styles.inviteDate}>
                      Created: {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <View style={styles.inviteBadge}>
                  <MaterialCommunityIcons
                    name={
                      item.is_used ? 'check-circle' : item.is_expired ? 'alert-circle' : 'ticket'
                    }
                    size={20}
                    color={
                      item.is_used
                        ? Colors.success
                        : item.is_expired
                        ? Colors.warning
                        : Colors.primary
                    }
                  />
                </View>
              </View>
            </Card>
          )}
          scrollEnabled={true}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </>
    );
  };

  const renderSettingsTab = () => {
    return (
      <ScrollView
        style={styles.settingsContainer}
        scrollEnabled={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {settingsData.map((setting) => (
          <ListItem
            key={setting.id}
            title={setting.label}
            rightText={setting.value}
            rightColor={Colors.textSecondary}
            showChevron={false}
          />
        ))}
      </ScrollView>
    );
  };

  if (loading && activeTab !== 'settings') {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="account-multiple"
            size={20}
            color={activeTab === 'users' ? Colors.primary : Colors.textSecondary}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'users' && styles.activeTabLabel,
            ]}
          >
            Users
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'invites' && styles.activeTab]}
          onPress={() => setActiveTab('invites')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="ticket"
            size={20}
            color={activeTab === 'invites' ? Colors.primary : Colors.textSecondary}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'invites' && styles.activeTabLabel,
            ]}
          >
            Invites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="cog"
            size={20}
            color={activeTab === 'settings' ? Colors.primary : Colors.textSecondary}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'settings' && styles.activeTabLabel,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'invites' && renderInvitesTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </View>
    </View>
  );
};

function getRoleColor(role: string): string {
  switch (role) {
    case 'management':
      return Colors.roleManagement;
    default:
      return Colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabIcon: {
    marginRight: Spacing.xs,
  },
  tabLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabLabel: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  inviteHeader: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  createButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  createButtonIcon: {
    marginRight: Spacing.sm,
  },
  createButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: FontSizes.sm,
  },
  inviteCard: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  inviteContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inviteInfo: {
    flex: 1,
  },
  inviteCode: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    fontFamily: 'monospace',
  },
  inviteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  inviteRole: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.primary,
  },
  inviteSeparator: {
    color: Colors.textMuted,
  },
  inviteStatus: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  inviteDate: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  inviteBadge: {
    marginLeft: Spacing.md,
  },
  settingsContainer: {
    flex: 1,
  },
});

export default AdminPanel;
