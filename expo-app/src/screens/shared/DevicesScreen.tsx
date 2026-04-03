import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
  getStatusColor,
} from '../../utils/theme';
import { devicesAPI } from '../../api';
import { mockAPI, MOCK_DEVICES, MOCK_ROOMS } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { Device, DeviceStatus } from '../../types';
import { Header, FilterChip, EmptyState, Card } from '../../components';

interface DevicesScreenProps {
  navigation: any;
}

type StatusFilter = 'all' | DeviceStatus;

export const DevicesScreen: React.FC<DevicesScreenProps> = ({ navigation }) => {
  const { isDemoMode } = useAuth();
  const insets = useSafeAreaInsets();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Build location lookup from device data - in real mode devices have locations relationship
  const roomLookup = React.useMemo(() => {
    const map: Record<string, string> = {};

    if (isDemoMode) {
      // In demo mode, use mock rooms
      MOCK_ROOMS.forEach((r) => {
        map[r.id] = r.name;
      });
    }
    // In real mode, device location names come from the locations relationship
    // when the API returns devices with locations(name) selected

    return map;
  }, [isDemoMode]);

  const loadDevices = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      try {
        const loader = pageNum === 1 ? setIsLoading : setIsLoadingMore;
        loader(true);

        const response = isDemoMode
          ? await mockAPI.getDevices()
          : await devicesAPI.getDevices({
              page: pageNum,
              limit: 20,
            });

        let filteredItems = response.items;
        if (selectedStatus !== 'all') {
          filteredItems = response.items.filter((d) => d.status === selectedStatus);
        }

        if (append) {
          setDevices((prev) => [...prev, ...filteredItems]);
        } else {
          setDevices(filteredItems);
        }

        setHasMorePages(pageNum < response.pages);
        setPage(pageNum);
      } catch (error) {
        Alert.alert('Error', 'Failed to load devices');
        console.error(error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    [selectedStatus, isDemoMode]
  );

  useEffect(() => {
    loadDevices(1);
  }, [selectedStatus]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadDevices(1);
  }, [loadDevices]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMorePages) {
      loadDevices(page + 1, true);
    }
  }, [isLoadingMore, hasMorePages, page, loadDevices]);

  const formatTime = (dateString: string | undefined): string => {
    if (!dateString) return 'Never';

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
    });
  };

  const getStatusIcon = (status: DeviceStatus): string => {
    switch (status) {
      case 'online':
        return 'wifi';
      case 'offline':
        return 'wifi-off';
      case 'error':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  const renderDeviceItem = ({ item }: { item: Device }) => {
    const statusColor = getStatusColor(item.status);

    // Get location name from device relationship (real API) or room lookup (demo)
    const getLocationName = (): string => {
      if (isDemoMode) {
        return roomLookup[item.room_id] || 'Unassigned';
      }
      // In real mode, the device has a locations relationship when queried with locations(name)
      return (item as any).locations?.name || 'Unassigned';
    };

    return (
      <Card style={styles.deviceCard}>
        <View style={styles.deviceHeader}>
          <View style={styles.statusIndicator}>
            <MaterialCommunityIcons
              name={getStatusIcon(item.status) as any}
              size={20}
              color={statusColor}
            />
            <Text style={[styles.statusLabel, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.deviceInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Serial Number</Text>
            <Text style={styles.value}>{item.serial_number}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Firmware Version</Text>
            <Text style={styles.value}>{item.firmware_version}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Last Heartbeat</Text>
            <Text style={styles.value}>{formatTime(item.last_heartbeat)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{getLocationName()}</Text>
          </View>
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="Devices" subtitle="Manage device status" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Devices" subtitle={`${devices.length} total`} />

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <FilterChip
          label="All"
          isSelected={selectedStatus === 'all'}
          onPress={() => setSelectedStatus('all')}
          color={Colors.primary}
        />
        <FilterChip
          label="Online"
          isSelected={selectedStatus === 'online'}
          onPress={() => setSelectedStatus('online')}
          color={Colors.statusOnline}
        />
        <FilterChip
          label="Offline"
          isSelected={selectedStatus === 'offline'}
          onPress={() => setSelectedStatus('offline')}
          color={Colors.statusOffline}
        />
        <FilterChip
          label="Error"
          isSelected={selectedStatus === 'error'}
          onPress={() => setSelectedStatus('error')}
          color={Colors.statusError}
        />
      </View>

      {/* Devices List */}
      {devices.length === 0 ? (
        <EmptyState
          icon="devices-off"
          title="No Devices"
          subtitle={
            selectedStatus !== 'all'
              ? `No ${selectedStatus} devices found`
              : 'No devices available'
          }
        />
      ) : (
        <FlatList
          data={devices}
          renderItem={renderDeviceItem}
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
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    paddingBottom: 20,
  },
  deviceCard: {
    gap: Spacing.md,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  deviceInfo: {
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: Spacing.md,
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

export default DevicesScreen;
