import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  FlatList,
  Text,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../utils/theme';
import {
  StatCard,
  StatusBadge,
  Card,
  EmptyState,
  LoadingScreen,
  ErrorScreen,
  SectionHeader,
} from '../../components';
import { attendanceAPI, roomsAPI, alertsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRecord, Room, RoomOccupancy } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [studentsPresent, setStudentsPresent] = useState(0);
  const [activeRooms, setActiveRooms] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [rooms, setRooms] = useState<(Room & { occupancy?: RoomOccupancy })[]>([]);
  const [recentActivity, setRecentActivity] = useState<AttendanceRecord[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      // Fetch rooms
      const roomsData = await roomsAPI.getRooms({ page: 1, limit: 50 });
      const roomsList = roomsData.items;

      // Fetch occupancy for each room
      const occupancyData = await roomsAPI.getAllOccupancies();
      const roomsWithOccupancy = roomsList.map((room) => {
        const occupancy = occupancyData.find((occ) => occ.roomId === room.id);
        return { ...room, occupancy };
      });

      setRooms(roomsWithOccupancy);
      setStudentsPresent(occupancyData.reduce((sum, occ) => sum + occ.currentOccupancy, 0));
      setActiveRooms(occupancyData.filter((occ) => occ.currentOccupancy > 0).length);

      // Fetch recent attendance records
      const attendanceData = await attendanceAPI.getAttendance({}, { page: 1, limit: 10 });
      setRecentActivity(attendanceData.items);

      // Fetch active alerts
      const alertsData = await alertsAPI.getUnresolvedAlerts({ page: 1, limit: 100 });
      setActiveAlerts(alertsData.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  if (loading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={fetchData} />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeContent}>
          <MaterialCommunityIcons name="account-circle" size={40} color={Colors.roleTeacher} />
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Welcome, {user?.name}!</Text>
            <Text style={styles.welcomeSubtitle}>Teacher Dashboard</Text>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard
          title="Students Present"
          value={studentsPresent}
          icon="account-multiple-check"
          color={Colors.success}
          style={styles.statCard}
        />
        <StatCard
          title="Active Rooms"
          value={activeRooms}
          icon="door-open"
          color={Colors.info}
          style={styles.statCard}
        />
        <StatCard
          title="Alerts"
          value={activeAlerts}
          icon="alert-circle"
          color={activeAlerts > 0 ? Colors.danger : Colors.success}
          style={styles.statCard}
        />
      </View>

      {/* My Rooms Section */}
      <SectionHeader title="My Rooms" />
      {rooms.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.roomsScroll}
          contentContainerStyle={styles.roomsContent}
        >
          {rooms.map((room) => (
            <Card key={room.id} style={styles.roomCard}>
              <Text style={styles.roomCardName}>{room.name}</Text>
              <Text style={styles.roomCardNumber}>
                Room {room.room_number} • Floor {room.floor}
              </Text>

              {room.occupancy && (
                <>
                  <View style={styles.occupancyInfo}>
                    <Text style={styles.occupancyText}>
                      {room.occupancy.currentOccupancy}/{room.occupancy.capacity}
                    </Text>
                    <Text style={styles.occupancyPercent}>
                      {Math.round(room.occupancy.occupancyPercentage)}%
                    </Text>
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
                </>
              )}
            </Card>
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          icon="door-open"
          title="No rooms assigned"
          subtitle="You don't have any rooms assigned yet"
        />
      )}

      {/* Recent Activity Section */}
      <SectionHeader title="Recent Activity" />
      {recentActivity.length > 0 ? (
        <View style={styles.activityList}>
          {recentActivity.map((record) => (
            <Card key={record.id} style={styles.activityCard}>
              <View style={styles.activityContent}>
                <View style={styles.activityInfo}>
                  <Text style={styles.studentName}>{record.student_name || 'Unknown Student'}</Text>
                  <Text style={styles.activityRoom}>{record.room_name || 'Unknown Room'}</Text>
                  <Text style={styles.activityTime}>
                    {new Date(record.check_in_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </View>
                <StatusBadge
                  label={record.status.replace(/_/g, ' ')}
                  color={getStatusColor(record.status)}
                  size="sm"
                />
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <EmptyState
          icon="history"
          title="No activity yet"
          subtitle="Recent attendance records will appear here"
        />
      )}
    </ScrollView>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'checked_in':
      return Colors.attendancePresent;
    case 'checked_out':
      return Colors.success;
    case 'auto_checked_out':
      return Colors.warning;
    default:
      return Colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  welcomeSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    marginBottom: Spacing.lg,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  welcomeSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statsRow: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
  },
  roomsScroll: {
    marginBottom: Spacing.lg,
  },
  roomsContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  roomCard: {
    width: Dimensions.get('window').width * 0.7,
    marginRight: 0,
  },
  roomCardName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  roomCardNumber: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  occupancyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  occupancyText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  occupancyPercent: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  activityList: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  activityCard: {
    marginBottom: 0,
  },
  activityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  activityRoom: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  activityTime: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

export default TeacherDashboard;
