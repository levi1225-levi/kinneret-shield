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
} from '../../utils/theme';
import { roomsAPI } from '../../api';
import { Room } from '../../types';
import { Header, SearchBar, EmptyState, Card } from '../../components';
import { useAuth } from '../../context/AuthContext';

interface RoomsScreenProps {
  navigation: any;
}

export const RoomsScreen: React.FC<RoomsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isManagement = user?.role === 'management';

  const loadRooms = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      try {
        const loader = pageNum === 1 ? setIsLoading : setIsLoadingMore;
        loader(true);

        const response = await roomsAPI.getRooms({
          page: pageNum,
          limit: 20,
        });

        if (append) {
          setRooms((prev) => [...prev, ...response.items]);
        } else {
          setRooms(response.items);
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
    []
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
          room.room_number.toLowerCase().includes(query) ||
          room.building.toLowerCase().includes(query)
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

  const handleAddRoom = useCallback(() => {
    Alert.alert('Add Room', 'Feature coming soon');
  }, []);

  const getRoomTypeIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      classroom: 'door',
      office: 'briefcase',
      gym: 'dumbbell',
      library: 'library-shelves',
      cafeteria: 'silverware-fork-knife',
      lab: 'flask-beaker',
      common_area: 'home-group',
      other: 'help-circle',
    };
    return iconMap[type] || 'help-circle';
  };

  const renderRoomItem = ({ item }: { item: Room }) => {
    const occupancyPercentage = 65; // Mock data - in real app, fetch from API
    const isAtCapacity = occupancyPercentage >= 90;
    const currentOccupancy = Math.floor((item.capacity * occupancyPercentage) / 100);

    return (
      <Card style={styles.roomCard}>
        <View style={styles.roomHeader}>
          <View style={styles.roomTitleSection}>
            <Text style={styles.roomName}>{item.name}</Text>
            <Text style={styles.roomNumber}>Room {item.room_number}</Text>
          </View>
          <MaterialCommunityIcons
            name={getRoomTypeIcon(item.type) as any}
            size={28}
            color={Colors.primary}
          />
        </View>

        <View style={styles.roomInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Building</Text>
            <Text style={styles.infoValue}>{item.building}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Floor</Text>
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
      <View style={styles.container}>
        <Header title="Rooms" subtitle="View room information" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Rooms" subtitle={`${filteredRooms.length} rooms`} />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name, number, or building..."
      />

      {/* Rooms List */}
      {filteredRooms.length === 0 ? (
        <EmptyState
          icon="door-open"
          title="No Rooms"
          subtitle={
            searchQuery.trim() !== ''
              ? 'No rooms match your search'
              : 'No rooms available'
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
          onPress={handleAddRoom}
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
