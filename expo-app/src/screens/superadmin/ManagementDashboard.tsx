import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../utils/theme';
import {
  StatCard,
  Card,
  EmptyState,
  LoadingScreen,
  ErrorScreen,
  SectionHeader,
} from '../../components';
import { usersAPI, devicesAPI, alertsAPI, attendanceAPI, roomsAPI } from '../../api';
import { mockAPI } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const ManagementDashboard: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
  const [devicesOnline, setDevicesOnline] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);
  const [lateToday, setLateToday] = useState(0);
  const [totalDevices, setTotalDevices] = useState(0);
  const [offlineDevices, setOfflineDevices] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      if (isDemoMode) {
        // Use mock data in demo mode
        const usersData = await mockAPI.getUsers(1, 1000);
        const studentCount = usersData.items.filter((u) => u.role === 'student').length;
        setTotalStudents(studentCount);

        const roomsData = await mockAPI.getRooms(1, 1000);
        setTotalRooms(roomsData.total);

        const devicesData = await mockAPI.getDevices(1, 1000);
        setTotalDevices(devicesData.total);
        const online = devicesData.items.filter((d) => d.status === 'online').length;
        setDevicesOnline(online);
        setOfflineDevices(devicesData.total - online);

        const alertsData = await mockAPI.getAlerts(1, 100);
        setActiveAlerts(alertsData.total);

        const attendanceData = await mockAPI.getAttendance(1, 1000);
        const todayRecords = attendanceData.items.filter((record) => {
          const recordDate = record.created_at.split('T')[0];
          return recordDate === today;
        });

        const present = todayRecords.filter(
          (r) => r.status === 'checked_in' || r.status === 'checked_out' || r.status === 'auto_checked_out'
        ).length;
        const late = todayRecords.filter((r) => r.status === 'auto_checked_out').length;

        setPresentToday(present);
        setLateToday(late);
        setAbsentToday(studentCount - present);
      } else {
        // Fetch users (students)
        const usersData = await usersAPI.getUsers({ page: 1, limit: 1000 });
        const studentCount = usersData.items.filter((u) => u.role === 'student').length;
        setTotalStudents(studentCount);

        // Fetch rooms
        const roomsData = await roomsAPI.getRooms({ page: 1, limit: 1000 });
        setTotalRooms(roomsData.total);

        // Fetch devices
        const devicesData = await devicesAPI.getDevices({ page: 1, limit: 1000 });
        setTotalDevices(devicesData.total);
        const online = devicesData.items.filter((d) => d.status === 'online').length;
        setDevicesOnline(online);
        setOfflineDevices(devicesData.total - online);

        // Fetch active alerts
        const alertsData = await alertsAPI.getUnresolvedAlerts({ page: 1, limit: 100 });
        setActiveAlerts(alertsData.total);

        // Fetch today's attendance
        const attendanceData = await attendanceAPI.getAttendance({}, { page: 1, limit: 1000 });
        const todayRecords = attendanceData.items.filter((record) => {
          const recordDate = record.created_at.split('T')[0];
          return recordDate === today;
        });

        const present = todayRecords.filter(
          (r) => r.status === 'checked_in' || r.status === 'checked_out' || r.status === 'auto_checked_out'
        ).length;
        const late = todayRecords.filter((r) => r.status === 'auto_checked_out').length;

        setPresentToday(present);
        setLateToday(late);
        setAbsentToday(studentCount - present);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [today, isDemoMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleAutoCheckout = useCallback(() => {
    Alert.alert(
      'Auto-Checkout Students',
      'This will automatically check out any students who have been checked in beyond the configured time limit.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: async () => {
            try {
              if (isDemoMode) {
                Alert.alert(
                  'Success',
                  'Demo mode - Auto-checkout simulation completed. 12 students were checked out.'
                );
              } else {
                const result = await attendanceAPI.autoCheckout();
                Alert.alert(
                  'Success',
                  `Auto-checkout completed. ${result.count} students were checked out.`
                );
                fetchData();
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to perform auto-checkout');
            }
          },
        },
      ]
    );
  }, [fetchData, isDemoMode]);

  const handleGenerateReport = useCallback(() => {
    Alert.alert(
      'Generate Daily Reports',
      'This will generate attendance reports for all rooms.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            try {
              if (isDemoMode) {
                Alert.alert(
                  'Success',
                  'Demo mode - Reports generated for 8 rooms.'
                );
              } else {
                const result = await attendanceAPI.generateDailyReports();
                Alert.alert(
                  'Success',
                  `Reports generated for ${result.count} rooms.`
                );
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to generate reports');
            }
          },
        },
      ]
    );
  }, [isDemoMode]);

  if (loading) {
    return <LoadingScreen message="Loading management dashboard..." />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={fetchData} />;
  }

  const presentPercentage = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;
  const absentPercentage = totalStudents > 0 ? Math.round((absentToday / totalStudents) * 100) : 0;
  const latePercentage = totalStudents > 0 ? Math.round((lateToday / totalStudents) * 100) : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome Banner */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeContent}>
          <MaterialCommunityIcons name="account-tie" size={40} color={Colors.roleManagement} />
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Welcome, {user?.name}!</Text>
            <Text style={styles.welcomeSubtitle}>Management Dashboard</Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon="account-multiple"
            color={Colors.info}
            style={styles.gridCard}
          />
          <StatCard
            title="Rooms"
            value={totalRooms}
            icon="door-multiple"
            color={Colors.primary}
            style={styles.gridCard}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            title="Devices Online"
            value={`${devicesOnline}/${totalDevices}`}
            icon="wifi"
            color={devicesOnline === totalDevices ? Colors.success : Colors.warning}
            style={styles.gridCard}
          />
          <StatCard
            title="Active Alerts"
            value={activeAlerts}
            icon="alert-circle"
            color={activeAlerts > 0 ? Colors.danger : Colors.success}
            style={styles.gridCard}
          />
        </View>
      </View>

      {/* Attendance Overview Section */}
      <SectionHeader title="Today's Attendance Overview" />
      <View style={styles.attendanceContainer}>
        <Card style={styles.attendanceCard}>
          <View style={styles.attendanceStats}>
            <View style={styles.attendanceStat}>
              <MaterialCommunityIcons
                name="check-circle"
                size={32}
                color={Colors.success}
                style={styles.attendanceIcon}
              />
              <Text style={styles.attendanceValue}>{presentToday}</Text>
              <Text style={styles.attendanceLabel}>Present</Text>
              <Text style={styles.attendancePercent}>{presentPercentage}%</Text>
            </View>
            <View style={styles.attendanceStat}>
              <MaterialCommunityIcons
                name="close-circle"
                size={32}
                color={Colors.danger}
                style={styles.attendanceIcon}
              />
              <Text style={styles.attendanceValue}>{absentToday}</Text>
              <Text style={styles.attendanceLabel}>Absent</Text>
              <Text style={styles.attendancePercent}>{absentPercentage}%</Text>
            </View>
            <View style={styles.attendanceStat}>
              <MaterialCommunityIcons
                name="clock-alert"
                size={32}
                color={Colors.warning}
                style={styles.attendanceIcon}
              />
              <Text style={styles.attendanceValue}>{lateToday}</Text>
              <Text style={styles.attendanceLabel}>Late</Text>
              <Text style={styles.attendancePercent}>{latePercentage}%</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* System Health Section */}
      <SectionHeader title="System Health" />
      <View style={styles.healthContainer}>
        <Card style={styles.healthCard}>
          <View style={styles.healthItem}>
            <View style={styles.healthIconContainer}>
              <MaterialCommunityIcons
                name="wifi"
                size={24}
                color={Colors.success}
              />
            </View>
            <View style={styles.healthInfo}>
              <Text style={styles.healthLabel}>Devices Online</Text>
              <Text style={styles.healthValue}>{devicesOnline} of {totalDevices}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.healthItem}>
            <View style={styles.healthIconContainer}>
              <MaterialCommunityIcons
                name="wifi-off"
                size={24}
                color={Colors.warning}
              />
            </View>
            <View style={styles.healthInfo}>
              <Text style={styles.healthLabel}>Devices Offline</Text>
              <Text style={styles.healthValue}>{offlineDevices}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.healthItem}>
            <View style={styles.healthIconContainer}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={24}
                color={activeAlerts > 0 ? Colors.danger : Colors.success}
              />
            </View>
            <View style={styles.healthInfo}>
              <Text style={styles.healthLabel}>Active Alerts</Text>
              <Text style={styles.healthValue}>{activeAlerts}</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Quick Actions Section */}
      <SectionHeader title="Quick Actions" />
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleGenerateReport}
          activeOpacity={0.7}
        >
          <Card style={styles.actionCardContent}>
            <MaterialCommunityIcons
              name="file-document"
              size={32}
              color={Colors.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionTitle}>Generate Report</Text>
            <Text style={styles.actionSubtitle}>Daily attendance reports</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleAutoCheckout}
          activeOpacity={0.7}
        >
          <Card style={styles.actionCardContent}>
            <MaterialCommunityIcons
              name="logout"
              size={32}
              color={Colors.warning}
              style={styles.actionIcon}
            />
            <Text style={styles.actionTitle}>Auto-Checkout</Text>
            <Text style={styles.actionSubtitle}>Expired sessions</Text>
          </Card>
        </TouchableOpacity>
      </View>

      {/* Settings Info */}
      <View style={styles.infoContainer}>
        <Card style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Kinneret Shield</Text>
            <Text style={styles.infoValue}>v1.0</Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

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
  statsGrid: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  gridCard: {
    flex: 1,
  },
  attendanceContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  attendanceCard: {
    padding: Spacing.lg,
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attendanceStat: {
    alignItems: 'center',
    flex: 1,
  },
  attendanceIcon: {
    marginBottom: Spacing.sm,
  },
  attendanceValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  attendanceLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  attendancePercent: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  healthContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  healthCard: {
    padding: Spacing.lg,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  healthIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthInfo: {
    flex: 1,
  },
  healthLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  healthValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
  },
  actionCardContent: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  actionIcon: {
    marginBottom: Spacing.md,
  },
  actionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  actionSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  infoContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  infoCard: {
    padding: Spacing.lg,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  infoValue: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});

export default ManagementDashboard;
