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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
} from '../../utils/theme';
import { roomsAPI } from '../../api';
import { mockAPI } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { Room, RoomOccupancy } from '../../types';
import { Header, SearchBar, EmptyState, Card } from '../../components';

interface RoomsScreenProps {
  navigation: any;
}

export const RoomsScreen: React.FC<RoomsScreenProps> = ({ navigation }) => {
  const { user, isDemoMode } = useAuth();
  const insets = useSafeAreaInsets();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [occupancies, setOccupancies] = useState<Record<string, RoomOccupancy>>({});

  const isManagement = user?.role === 'management';

  const loadRooms = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      try {
        const loader = pageNum === 1 ? setIsLoading : setIsLoadingMore;
        loader(true);

        const response = isDemoMode
          ? await mockAPI.getRooms()
          : await roomsAPI.getRooms({
              page: pageNum,
              limit: 20,
            });

        if (append) {
          setRooms((prev) => [...prev, ...response.items]);
        } else {
          setRooms(response.items);
        }

        // Load occupancies
        if (isDemoMode) {
          const occData = mockAPI.getAllOccupancies();
          const occMap: Record<string, RoomOccupancy> = {};
          occData.forEach(occ => { occMap[occ.roomId] = occ; });
          setOccupancies(occMap);
        } else {
          // Fetch occupancies from real API
          const occData = await roomsAPI.getAllOccupancies();
          const occMap: Record<string, RoomOccupancy> = {};
          occData.forEach((occ: any) => {
            // The RPC may return id or roomId depending on the function definition
            const key = occ.roomId || occ.id;
            occMap[key] = occ;
          });
          setOccupancies(occMap);
        }

        setHasMorePages(pageNum < response.pages);
        setPage(pageNum);
      } catch (error) {
        Alert.alert('Error', 'Failed to load rooms');
        console.error(error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    [isDemoMode]
  );

  useEffect(() => {
    loadRooms(1);
  }, []);

  // Filter rooms based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRooms(rooms);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = rooms.filter(
        (room) =>
          room.name.toLowerCase().includes(query) ||
          room.location_code.toLowerCase().includes(query) ||
          room.area.toLowerCase().includes(query)
      );
      setFilteredRooms(filtered);
    }
  }, [searchQuery, rooms]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadRooms(1);
  }, [loadRooms]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMorePages) {
      loadRooms(page + 1, true);
    }
  }, [isLoadingMore, hasMorePages, page, loadRooms]);

  const handleAddLocation = useCallback(() => {
    Alert.alert('Add Location', 'Feature coming soon');
  }, []);

  const getRoomTypeIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      waterfront: 'waves',
      cabin: 'home-outline',
      dining_hall: 'silverware-fork-knife',
      sports_field: 'soccer-field',
      arts_crafts: 'palette',
      main_office: 'briefcase',
      amphitheatre: 'theater',
      canteen: 'food',
      other: 'help-circle',
    };
    return iconMap[type] || 'help-circle';
  };

  const renderRoomItem = ({ item }: { item: Room }) => {
    const occ = occupancies[item.id];
    const occupancyPercentage = occ ? occ.occupancyPercentage : 0;
    const currentOccupancy = occ ? occ.currentOccupancy : 0;
    const isAtCapacity = occ ? occ.isAtCapacity : false;

    return (
      <Card style={styles.roomCard}>
        <View style={styles.roomHeader}>
          <View style={styles.roomTitleSection}>
            <Text style={styles.roomName}>{item.name}</Text>
            <Text style={styles.roomNumber}>{item.location_code}</Text>
          </View>
          <MaterialCommunityIcons
            name={getRoomTypeIcon(item.type) as any}
            size={28}
            color={Colors.primary}
          />
        </View>

        <View style={styles.roomInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Area</Text>
            <Text style={styles.infoValue}>{item.area}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Zone</Text>
            <Text style={styles.infoValue}>{item.floor}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1).replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Occupancy Bar */}
        <View style={styles.occupancySection}>
          <View style={styles.occupancyHeader}>
            <Text style={styles.occupancyLabel}>Occupancy</Text>
            <Text
              style={[
                styles.occupancyText,
                { color: isAtCapacity ? Colors.danger : Colors.success },
              ]}
            >
              {currentOccupancy}/{item.capacity}
            </Text>
          </View>
          <View style={styles.occupancyBarBackground}>
            <View
              style={[
                styles.occupancyBarFill,
                {
                  width: `${occupancyPercentage}%`,
                  backgroundColor: isAtCapacity ? Colors.danger : Colors.success,
                },
              ]}
            />
          </View>
          <Text style={styles.occupancyPercentage}>{occupancyPercentage}% full</Text>
        </View>

        {/* Capacity Badge */}
        {isAtCapacity && (
          <View style={styles.capacityWarning}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={16}
              color={Colors.danger}
              style={styles.warningIcon}
            />
            <Text style={styles.warningText}>At Capacity</Text>
          </View>
        )}
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="Locations" subtitle="View location information" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Locations" subtitle={`${filteredRooms.length} locations`} />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name, code, or area..."
      />

      {/* Rooms List */}
      {filteredRooms.length === 0 ? (
        <EmptyState
          icon="door-open"
          title="No Locations"
          subtitle={
            searchQuery.trim() !== ''
              ? 'No locations match your search'
              : 'No locations available'
          }
        />
      ) : (
        <FlatList
          data={filteredRooms}
          renderItem={renderRoomItem}
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

      {/* FAB for Management Role */}
      {isManagement && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddLocation}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="plus"
            size={28}
            color={Colors.white}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    paddingBottom: 20,
  },
  roomCard: {
    gap: Spacing.md,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  roomTitleSection: {
    flex: 1,
  },
  roomName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  roomNumber: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  roomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  occupancySection: {
    marginTop: Spacing.sm,
  },
  occupancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  occupancyLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  occupancyText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  occupancyBarBackground: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  occupancyBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  occupancyPercentage: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  capacityWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: `${Colors.danger}15`,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  warningIcon: {
    marginRight: Spacing.xs,
  },
  warningText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.danger,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
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

export default RoomsScreen;
