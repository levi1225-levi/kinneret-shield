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
  Dimensions,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../utils/theme';
import {
  Card,
  EmptyState,
  LoadingScreen,
  ErrorScreen,
  Header,
  SearchBar,
} from '../../components';
import { roomsAPI, attendanceAPI } from '../../api';
import { mockAPI } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { Room, RoomOccupancy, AttendanceRecord } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const TeacherRooms: React.FC = () => {
  const { isDemoMode } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState<(Room & { occupancy?: RoomOccupancy })[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<(Room & { occupancy?: RoomOccupancy })[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      let roomsData;
      let occupancyData;

      if (isDemoMode) {
        // Use mock data in demo mode
        roomsData = await mockAPI.getRooms(1, 100);
        occupancyData = await mockAPI.getAllOccupancies();
      } else {
        // Use real API calls in normal mode
        roomsData = await roomsAPI.getRooms({ page: 1, limit: 100 });
        occupancyData = await roomsAPI.getAllOccupancies();
      }

      const roomsList = roomsData.items;
      const roomsWithOccupancy = roomsList.map((room) => {
        const occupancy = occupancyData.find((occ) => occ.roomId === room.id);
        return { ...room, occupancy };
      });

      setRooms(roomsWithOccupancy);
      setFilteredRooms(roomsWithOccupancy);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    const filtered = rooms.filter((room) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        room.name.toLowerCase().includes(searchLower) ||
        room.room_number.toLowerCase().includes(searchLower) ||
        room.building.toLowerCase().includes(searchLower)
      );
    });
    setFilteredRooms(filtered);
  }, [searchQuery, rooms]);

  const handleRoomPress = useCallback(async (room: Room & { occupancy?: RoomOccupancy }) => {
    try {
      // Fetch recent attendance for this room
      const attendanceData = await attendanceAPI.getRoomAttendance(room.id, {
        page: 1,
        limit: 10,
      });

      const attendanceList = attendanceData.items
        .map(
          (record) =>
            `${record.student_name || 'Unknown'} - ${new Date(record.check_in_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}`
        )
        .join('\n');

      Alert.alert(
        room.name,
        `Building: ${room.building}\nFloor: ${room.floor}\nCapacity: ${room.capacity}\nCurrent Occupancy: ${room.occupancy?.currentOccupancy || 0}\n\nRecent Check-ins:\n${attendanceList || 'No recent activity'}`,
        [{ text: 'Close' }]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to load room details');
    }
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading rooms..." />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={fetchData} />;
  }

  const numColumns = 2;
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - Spacing.lg * 2 - Spacing.md) / numColumns;

  return (
    <View style={styles.container}>
      <Header title="My Rooms" />
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search rooms..."
      />

      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="door-open"
            title="No rooms found"
            subtitle={
              searchQuery
                ? 'Try adjusting your search'
                : 'You don\'t have any rooms assigned yet'
            }
          />
        }
        renderItem={({ item: room }) => (
          <TouchableOpacity
            onPress={() => handleRoomPress(room)}
            style={[styles.roomCardContainer, { width: cardWidth }]}
            activeOpacity={0.7}
          >
            <Card style={styles.roomCard}>
              <View style={styles.roomHeader}>
                <View style={styles.roomTitleContainer}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomNumber}>#{room.room_number}</Text>
                </View>
                <MaterialCommunityIcons
                  name="door-open"
                  size={24}
                  color={Colors.primary}
                />
              </View>

              <View style={styles.roomMeta}>
                <Text style={styles.metaText}>{room.building}</Text>
                <Text style={styles.metaSeparator}>•</Text>
                <Text style={styles.metaText}>Floor {room.floor}</Text>
              </View>

              {room.occupancy && (
                <>
                  <View style={styles.occupancyContainer}>
                    <View>
                      <Text style={styles.occupancyLabel}>Occupancy</Text>
                      <Text style={styles.occupancyValue}>
                        {room.occupancy.currentOccupancy}/{room.occupancy.capacity}
                      </Text>
                    </View>
                    <View style={styles.percentageContainer}>
                      <Text style={styles.percentageText}>
                        {Math.round(room.occupancy.occupancyPercentage)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.min(room.occupancy.occupancyPercentage, 100)}%`,
                          backgroundColor: room.occupancy.isAtCapacity
                            ? Colors.danger
                            : Colors.success,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.statusContainer}>
                    <MaterialCommunityIcons
                      name={room.occupancy.isAtCapacity ? 'alert-circle' : 'check-circle'}
                      size={16}
                      color={room.occupancy.isAtCapacity ? Colors.danger : Colors.success}
                      style={styles.statusIcon}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: room.occupancy.isAtCapacity
                            ? Colors.danger
                            : Colors.success,
                        },
                      ]}
                    >
                      {room.occupancy.isAtCapacity ? 'At Capacity' : 'Normal'}
                    </Text>
                  </View>
                </>
              )}
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  roomCardContainer: {
    marginTop: Spacing.md,
  },
  roomCard: {
    flex: 1,
    paddingVertical: Spacing.md,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  roomTitleContainer: {
    flex: 1,
  },
  roomName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  roomNumber: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  metaText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  metaSeparator: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  occupancyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  occupancyLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  occupancyValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  percentageContainer: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  percentageText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusIcon: {
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
});

export default TeacherRooms;
