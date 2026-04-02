import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  FlatList,
  Alert,
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
import { attendanceAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRecord } from '../../types';
import { MOCK_ATTENDANCE, mockAPI } from '../../utils/mockData';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const StudentDashboard: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [todayCheckins, setTodayCheckins] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [todayActivity, setTodayActivity] = useState<AttendanceRecord[]>([]);
  const [recentHistory, setRecentHistory] = useState<AttendanceRecord[]>([]);

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      if (!user?.id) return;

      if (isDemoMode) {
        // Use mock data when in demo mode
        const allMockData = MOCK_ATTENDANCE.filter((r) => r.student_id === user.id);

        const todayRecords = allMockData.filter((record) => {
          const recordDate = record.created_at.split('T')[0];
          return recordDate === todayString;
        });

        setTodayCheckins(todayRecords.length);
        setTodayActivity(todayRecords);
        setRecentHistory(allMockData.slice(0, 5));

        // Calculate attendance rate (simple: present/total)
        if (allMockData.length > 0) {
          const presentCount = allMockData.filter(
            (r) => r.status === 'checked_in' || r.status === 'checked_out' || r.status === 'auto_checked_out'
          ).length;
          const rate = Math.round((presentCount / allMockData.length) * 100);
          setAttendanceRate(rate);
        }
      } else {
        // Get attendance records for today
        const todayData = await attendanceAPI.getStudentAttendance(user.id, {
          page: 1,
          limit: 10,
        });

        const todayRecords = todayData.items.filter((record) => {
          const recordDate = record.created_at.split('T')[0];
          return recordDate === todayString;
        });

        setTodayCheckins(todayRecords.length);
        setTodayActivity(todayRecords);

        // Get all attendance records for rate calculation
        const allData = await attendanceAPI.getStudentAttendance(user.id, {
          page: 1,
          limit: 100,
        });

        setRecentHistory(allData.items.slice(0, 5));

        // Calculate attendance rate (simple: present/total)
        if (allData.items.length > 0) {
          const presentCount = allData.items.filter(
            (r) => r.status === 'checked_in' || r.status === 'checked_out' || r.status === 'auto_checked_out'
          ).length;
          const rate = Math.round((presentCount / allData.items.length) * 100);
          setAttendanceRate(rate);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user?.id, todayString, isDemoMode]);

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
          <MaterialCommunityIcons name="account-circle" size={40} color={Colors.primary} />
          <View style={styles.welcomeText}>
            <View>
              <Text style={styles.welcomeTitle}>Welcome, {user?.name}!</Text>
              <Text style={styles.welcomeSubtitle}>
                {today.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard
          title="Check-ins Today"
          value={todayCheckins}
          icon="check-circle"
          color={Colors.success}
          style={styles.statCard}
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon="percent"
          color={Colors.info}
          style={styles.statCard}
        />
      </View>

      {/* Today's Activity Section */}
      <SectionHeader title="Today's Activity" />
      {todayActivity.length > 0 ? (
        <View style={styles.activityList}>
          {todayActivity.map((record) => (
            <Card key={record.id} style={styles.activityCard}>
              <View style={styles.activityContent}>
                <View style={styles.activityInfo}>
                  <Text style={styles.roomName}>{record.room_name || 'Unknown Room'}</Text>
                  <Text style={styles.activityTime}>
                    Check-in: {new Date(record.check_in_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {record.check_out_at && (
                    <Text style={styles.activityTime}>
                      Check-out: {new Date(record.check_out_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  )}
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
          icon="calendar-blank"
          title="No check-ins yet"
          subtitle="Your check-ins today will appear here"
        />
      )}

      {/* Recent History Section */}
      <SectionHeader title="Recent History" />
      {recentHistory.length > 0 ? (
        <View style={styles.historyList}>
          {recentHistory.map((record) => (
            <Card key={record.id} style={styles.historyCard}>
              <View style={styles.historyContent}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyRoom}>{record.room_name || 'Unknown Room'}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(record.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  {record.duration_minutes && (
                    <Text style={styles.duration}>{record.duration_minutes} min</Text>
                  )}
                  <StatusBadge
                    label={record.status.replace(/_/g, ' ')}
                    color={getStatusColor(record.status)}
                    size="sm"
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <EmptyState
          icon="history"
          title="No history yet"
          subtitle="Your attendance history will appear here"
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
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
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
  roomName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  activityTime: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  historyList: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  historyCard: {
    marginBottom: 0,
  },
  historyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
  },
  historyRoom: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  historyDate: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  duration: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});

export default StudentDashboard;
