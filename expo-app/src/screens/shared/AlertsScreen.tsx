import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
  getSeverityColor,
} from '../../utils/theme';
import { alertsAPI } from '../../api';
import { mockAPI, MOCK_ALERTS } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { Alert as AlertType, AlertSeverity } from '../../types';
import { Header, FilterChip, EmptyState, Card } from '../../components';

interface AlertsScreenProps {
  navigation: any;
}

type SeverityFilter = 'all' | AlertSeverity;

export const AlertsScreen: React.FC<AlertsScreenProps> = ({ navigation }) => {
  const { isDemoMode } = useAuth();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityFilter>('all');
  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const unResolvedCount = alerts.filter((a) => !a.resolved).length;

  const loadAlerts = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      try {
        const loader = pageNum === 1 ? setIsLoading : setIsLoadingMore;
        loader(true);

        const filters =
          selectedSeverity === 'all'
            ? { resolved: false }
            : { resolved: false, severity: selectedSeverity };

        const response = isDemoMode
          ? await mockAPI.getAlerts()
          : await alertsAPI.getAlerts(filters, {
              page: pageNum,
              limit: 20,
            });

        if (append) {
          setAlerts((prev) => [...prev, ...response.items]);
        } else {
          setAlerts(response.items);
        }

        setHasMorePages(pageNum < response.pages);
        setPage(pageNum);
      } catch (error) {
        Alert.alert('Error', 'Failed to load alerts');
        console.error(error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    [selectedSeverity, isDemoMode]
  );

  useEffect(() => {
    loadAlerts(1);
  }, [selectedSeverity]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadAlerts(1);
  }, [loadAlerts]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMorePages) {
      loadAlerts(page + 1, true);
    }
  }, [isLoadingMore, hasMorePages, page, loadAlerts]);

  const handleResolveAlert = useCallback(
    async (alert: AlertType) => {
      try {
        if (isDemoMode) {
          // In demo mode, just update local state
          setAlerts((prev) =>
            prev.map((a) =>
              a.id === alert.id ? { ...a, resolved: true } : a
            )
          );
        } else {
          const resolved = await alertsAPI.resolveAlert(alert.id);
          setAlerts((prev) =>
            prev.map((a) => (a.id === alert.id ? resolved : a))
          );
        }
        Alert.alert('Success', 'Alert resolved');
      } catch (error) {
        Alert.alert('Error', 'Failed to resolve alert');
      }
    },
    [isDemoMode]
  );

  const getAlertIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      unauthorized_access: 'shield-alert',
      device_offline: 'wifi-off',
      capacity_exceeded: 'account-multiple-plus',
      unknown_card: 'card-search',
      emergency: 'alert-circle',
    };
    return iconMap[type] || 'alert';
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderAlertItem = ({ item }: { item: AlertType }) => {
    const severityColor = getSeverityColor(item.severity);

    return (
      <Card style={styles.alertCard}>
        <View style={styles.alertContent}>
          <View
            style={[
              styles.alertLeftBorder,
              { backgroundColor: severityColor },
            ]}
          />
          <View style={styles.alertBody}>
            <View style={styles.alertHeader}>
              <MaterialCommunityIcons
                name={getAlertIcon(item.type) as any}
                size={20}
                color={severityColor}
                style={styles.alertIcon}
              />
              <View style={styles.alertTitleSection}>
                <Text style={styles.alertTitle} numberOfLines={1}>
                  {item.type.replace(/_/g, ' ').toUpperCase()}
                </Text>
                <Text style={styles.alertTime}>{formatTime(item.created_at)}</Text>
              </View>
            </View>

            <Text style={styles.alertMessage} numberOfLines={2}>
              {item.message}
            </Text>

            {!item.resolved && (
              <TouchableOpacity
                style={[styles.resolveButton, { borderColor: severityColor }]}
                onPress={() => handleResolveAlert(item)}
              >
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={16}
                  color={severityColor}
                  style={styles.resolveIcon}
                />
                <Text style={[styles.resolveText, { color: severityColor }]}>
                  Resolve
                </Text>
              </TouchableOpacity>
            )}

            {item.resolved && (
              <View style={styles.resolvedBadge}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={16}
                  color={Colors.success}
                  style={styles.resolveIcon}
                />
                <Text style={styles.resolvedText}>Resolved</Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header
          title="Alerts"
          subtitle={`${unResolvedCount} unresolved`}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Alerts"
        subtitle={`${unResolvedCount} unresolved`}
      />

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <FilterChip
          label="All"
          isSelected={selectedSeverity === 'all'}
          onPress={() => setSelectedSeverity('all')}
          color={Colors.primary}
        />
        <FilterChip
          label="Low"
          isSelected={selectedSeverity === 'low'}
          onPress={() => setSelectedSeverity('low')}
          color={Colors.severityLow}
        />
        <FilterChip
          label="Medium"
          isSelected={selectedSeverity === 'medium'}
          onPress={() => setSelectedSeverity('medium')}
          color={Colors.severityMedium}
        />
        <FilterChip
          label="High"
          isSelected={selectedSeverity === 'high'}
          onPress={() => setSelectedSeverity('high')}
          color={Colors.severityHigh}
        />
        <FilterChip
          label="Critical"
          isSelected={selectedSeverity === 'critical'}
          onPress={() => setSelectedSeverity('critical')}
          color={Colors.severityCritical}
        />
      </View>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <EmptyState
          icon="check-circle"
          title="No Alerts"
          subtitle="All clear! No unresolved alerts at the moment."
        />
      ) : (
        <FlatList
          data={alerts}
          renderItem={renderAlertItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  alertCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  alertContent: {
    flexDirection: 'row',
  },
  alertLeftBorder: {
    width: 4,
  },
  alertBody: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  alertIcon: {
    marginTop: Spacing.xs,
  },
  alertTitleSection: {
    flex: 1,
  },
  alertTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  alertTime: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  alertMessage: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: FontSizes.sm * 1.4,
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  resolveIcon: {
    marginRight: -Spacing.xs,
  },
  resolveText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.success}15`,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  resolvedText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.success,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMore: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});

export default AlertsScreen;
