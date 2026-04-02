import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  FlatList,
  Text,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../utils/theme';
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
import { mockAPI } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRecord } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const ParentDashboard: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [presentToday, setPresentToday] = useState(false);
  const [weekPresent, setWeekPresent] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [recentActivity, setRecentActivity] = useState<AttendanceRecord[]>([]);

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      if (!user?.id) return;

      // Get attendance records (using current user ID as student_id for demonstration)
      const allData = isDemoMode
        ? await mockAPI.getStudentAttendance('usr-0001')
        : await attendanceAPI.getStudentAttendance(user.id, {
            page: 1,
            limit: 100,
          });

      // Check if present today
      const todayRecords = allData.items.filter((record) => {
        const recordDate = record.created_at.split('T')[0];
        return recordDate === todayString;
      });

      setPresentToday(todayRecords.length > 0);

      // Get records from this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoString = weekAgo.toISOString().split('T')[0];

      const weekRecords = allData.items.filter((record) => {
        const recordDate = record.created_at.split('T')[0];
        return recordDate >= weekAgoString && recordDate <= todayString;
      });

      const weekPresentDays = new Set(
        weekRecords
          .filter(
            (r) =>
              r.status === 'checked_in' ||
              r.status === 'checked_out' ||
              r.status === 'auto_checked_out'
          )
          .map((r) => r.created_at.split('T')[0])
      ).size;

      setWeekPresent(weekPresentDays);

      // Calculate attendance rate
      if (allData.items.length > 0) {
        const presentCount = allData.items.filter(
          (r) =>
            r.status === 'checked_in' ||
            r.status === 'checked_out' ||
            r.status === 'auto_checked_out'
        ).length;
        const rate = Math.round((presentCount / allData.items.length) * 100);
        setAttendanceRate(rate);
      }

      // Get recent activity
      setRecentActivity(allData.items.slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
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
    return <LoadingScreen message="Loading dashboard..." />;
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
          <MaterialCommunityIcons name="account-circle" size={40} color={Colors.roleParent} />
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Welcome, {user?.name}!</Text>
            <Text style={styles.welcomeSubtitle}>Parent Dashboard</Text>
          </View>
        </View>
      </View>

      {/* Your Children Section */}
      <SectionHeader title="Your Children" />

      {/* Child Card */}
      <View style={styles.childCardContainer}>
        <Card style={styles.childCard}>
          <View style={styles.childHeader}>
            <View style={styles.childName}>
              <MaterialCommunityIcons name="account-child" size={24} color={Colors.primary} />
              <Text style={styles.childTitle}>Student</Text>
            </View>
            <MaterialCommunityIcons name="information-outline" size={20} color={Colors.textMuted} />
          </View>

          {/* Child Stats */}
          <View style={styles.childStats}>
            <View style={styles.childStat}>
              <Text style={styles.childStatLabel}>Today</Text>
              <View style={styles.childStatValue}>
                <MaterialCommunityIcons
                  name={presentToday ? 'check-circle' : 'close-circle'}
                  size={20}
                  color={presentToday ? Colors.success : Colors.danger}
                  style={styles.childStatIcon}
                />
                <Text style={styles.childStatText}>
                  {presentToday ? 'Present' : 'Absent'}
                </Text>
              </View>
            </View>

            <View style={styles.childStatDivider} />

            <View style={styles.childStat}>
              <Text style={styles.childStatLabel}>This Week</Text>
              <View style={styles.childStatValue}>
                <Text style={styles.childStatNumber}>{weekPresent}</Text>
                <Text style={styles.childStatText}>/5 days</Text>
              </View>
            </View>

            <View style={styles.childStatDivider} />

            <View style={styles.childStat}>
              <Text style={styles.childStatLabel}>Overall</Text>
              <View style={styles.childStatValue}>
                <Text style={styles.childStatNumber}>{attendanceRate}%</Text>
                <Text style={styles.childStatText}>Rate</Text>
              </View>
            </View>
          </View>
        </Card>
      </View>

      {/* Detailed Stats Row */}
      <View style={styles.statsRow}>
        <StatCard
          title="Present Today"
          value={presentToday ? 'Yes' : 'No'}
          icon={presentToday ? 'check-circle' : 'close-circle'}
          color={presentToday ? Colors.success : Colors.danger}
          style={styles.statCard}
        />
        <StatCard
          title="This Week"
          value={`${weekPresent}/5`}
          icon="calendar-week"
          color={Colors.info}
          style={styles.statCard}
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon="percent"
          color={Colors.primary}
          style={styles.statCard}
        />
      </View>

      {/* Recent Activity Section */}
      <SectionHeader title="Recent Activity" />
      {recentActivity.length > 0 ? (
        <View style={styles.activityList}>
          {recentActivity.map((record) => {
            const recordDate = new Date(record.created_at);
            const dateString = recordDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: '2-digit',
            });

            return (
              <Card key={record.id} style={styles.activityCard}>
                <View style={styles.activityContent}>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityRoom}>{record.room_name || 'Unknown Room'}</Text>
                    <View style={styles.activityMeta}>
                      <Text style={styles.activityDate}>{dateString}</Text>
                      <Text style={styles.activitySeparator}>•</Text>
                      <Text style={styles.activityTime}>
                        {recordDate.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </Text>
                    </View>
                    {record.duration_minutes && (
                      <Text style={styles.activityDuration}>
                        Duration: {record.duration_minutes} minutes
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
            );
          })}
        </View>
      ) : (
        <EmptyState
          icon="history"
          title="No activity yet"
          subtitle="Your child's attendance records will appear here"
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
  childCardContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  childCard: {
    padding: Spacing.lg,
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  childName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  childTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  childStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  childStat: {
    flex: 1,
    alignItems: 'center',
  },
  childStatLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  childStatValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  childStatIcon: {
    marginRight: Spacing.xs,
  },
  childStatNumber: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  childStatText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  childStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
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
  activityRoom: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  activityDate: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  activitySeparator: {
    color: Colors.textMuted,
  },
  activityTime: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  activityDuration: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
});

export default ParentDashboard;
