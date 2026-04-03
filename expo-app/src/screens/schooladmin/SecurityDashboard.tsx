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
import { devicesAPI, alertsAPI, roomsAPI } from '../../api';
import { mockAPI } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { Device, Alert as AlertType, EmergencyEvent } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const SecurityDashboard: React.FC = () => {
  const { isDemoMode } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [devicesOnline, setDevicesOnline] = useState(0);
  const [totalDevices, setTotalDevices] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [buildingOccupancy, setBuildingOccupancy] = useState(0);
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [triggeringEmergency, setTriggeringEmergency] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      if (isDemoMode) {
        // Use mock data in demo mode
        const devicesData = await mockAPI.getDevices(1, 100);
        setDevices(devicesData.items);
        setTotalDevices(devicesData.total);
        const online = devicesData.items.filter((d) => d.status === 'online').length;
        setDevicesOnline(online);

        const alertsData = await mockAPI.getAlerts(1, 5);
        setAlerts(alertsData.items);
        setActiveAlerts(alertsData.total);

        const occupancyData = await mockAPI.getAllOccupancies();
        const totalOccupancy = occupancyData.reduce((sum: number, occ) => sum + occ.currentOccupancy, 0);
        setBuildingOccupancy(totalOccupancy);

        setEmergencyActive(false);
      } else {
        // Fetch devices
        const devicesData = await devicesAPI.getDevices({ page: 1, limit: 100 });
        setDevices(devicesData.items);
        setTotalDevices(devicesData.total);
        const online = devicesData.items.filter((d) => d.status === 'online').length;
        setDevicesOnline(online);

        // Fetch active alerts
        const alertsData = await alertsAPI.getUnresolvedAlerts({ page: 1, limit: 5 });
        setAlerts(alertsData.items);
        setActiveAlerts(alertsData.total);

        // Check for active emergencies
        const emergencies = await alertsAPI.getActiveEmergencies();
        setEmergencyActive(emergencies.length > 0);

        // Fetch building occupancy
        const occupancyData = await roomsAPI.getAllOccupancies();
        const totalOccupancy = occupancyData.reduce((sum, occ) => sum + occ.currentOccupancy, 0);
        setBuildingOccupancy(totalOccupancy);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
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

  const handleEmergencyTrigger = useCallback(() => {
    Alert.alert(
      'Trigger Emergency',
      'Are you sure you want to initiate an emergency? This will alert all camp staff and counselors.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Lockdown',
          onPress: async () => {
            try {
              setTriggeringEmergency(true);
              if (isDemoMode) {
                Alert.alert('Demo mode', 'Emergency lockdown simulation initiated');
              } else {
                await alertsAPI.initiateEmergency({
                  type: 'lockdown',
                  message: 'Emergency lockdown initiated',
                });
                setEmergencyActive(true);
                Alert.alert('Success', 'Emergency lockdown initiated');
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to trigger emergency');
            } finally {
              setTriggeringEmergency(false);
            }
          },
          style: 'destructive',
        },
        {
          text: 'Evacuation',
          onPress: async () => {
            try {
              setTriggeringEmergency(true);
              if (isDemoMode) {
                Alert.alert('Demo mode', 'Emergency evacuation simulation initiated');
              } else {
                await alertsAPI.initiateEmergency({
                  type: 'evacuation',
                  message: 'Emergency evacuation initiated',
                });
                setEmergencyActive(true);
                Alert.alert('Success', 'Emergency evacuation initiated');
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to trigger emergency');
            } finally {
              setTriggeringEmergency(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  }, [isDemoMode]);

  if (loading) {
    return <LoadingScreen message="Loading security dashboard..." />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={fetchData} />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Emergency Banner */}
      <View
        style={[
          styles.emergencyBanner,
          { backgroundColor: emergencyActive ? Colors.danger : Colors.success },
        ]}
      >
        <MaterialCommunityIcons
          name={emergencyActive ? 'alert-circle' : 'check-circle'}
          size={24}
          color={Colors.white}
          style={styles.emergencyIcon}
        />
        <Text style={styles.emergencyText}>
          {emergencyActive ? 'EMERGENCY ACTIVE' : 'All Clear'}
        </Text>
      </View>

      {/* Emergency Trigger Button */}
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={handleEmergencyTrigger}
        disabled={triggeringEmergency}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="alert" size={20} color={Colors.white} />
        <Text style={styles.emergencyButtonText}>TRIGGER EMERGENCY</Text>
      </TouchableOpacity>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard
          title="Devices Online"
          value={`${devicesOnline}/${totalDevices}`}
          icon="wifi"
          color={devicesOnline === totalDevices ? Colors.success : Colors.warning}
          style={styles.statCard}
        />
        <StatCard
          title="Active Alerts"
          value={activeAlerts}
          icon="alert-circle"
          color={activeAlerts > 0 ? Colors.danger : Colors.success}
          style={styles.statCard}
        />
        <StatCard
          title="Camp Occupancy"
          value={buildingOccupancy}
          icon="account-multiple"
          color={Colors.info}
          style={styles.statCard}
        />
      </View>

      {/* Device Status Section */}
      <SectionHeader title="Device Status" />
      {devices.length > 0 ? (
        <View style={styles.deviceList}>
          {devices.map((device) => (
            <Card key={device.id} style={styles.deviceCard}>
              <View style={styles.deviceContent}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{device.serial_number}</Text>
                  <Text style={styles.deviceModel}>
                    Firmware: {device.firmware_version}
                  </Text>
                  {device.last_heartbeat && (
                    <Text style={styles.deviceTime}>
                      Last: {new Date(device.last_heartbeat).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        device.status === 'online'
                          ? Colors.success
                          : device.status === 'offline'
                          ? Colors.textMuted
                          : Colors.danger,
                    },
                  ]}
                />
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <EmptyState
          icon="wifi-off"
          title="No devices"
          subtitle="No devices configured yet"
        />
      )}

      {/* Recent Alerts Section */}
      <SectionHeader title="Recent Alerts" />
      {alerts.length > 0 ? (
        <View style={styles.alertsList}>
          {alerts.map((alert) => (
            <Card key={alert.id} style={styles.alertCard}>
              <View style={styles.alertContent}>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertType}>
                    {alert.type.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertTime}>
                    {new Date(alert.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View
                  style={[
                    styles.alertSeverityBadge,
                    {
                      backgroundColor: getSeverityColor(alert.severity),
                    },
                  ]}
                >
                  <Text style={styles.alertSeverityText}>
                    {alert.severity.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <EmptyState
          icon="check-circle"
          title="No alerts"
          subtitle="All systems operating normally"
        />
      )}
    </ScrollView>
  );
};

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'low':
      return Colors.severityLow;
    case 'medium':
      return Colors.severityMedium;
    case 'high':
      return Colors.severityHigh;
    case 'critical':
      return Colors.severityCritical;
    default:
      return Colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emergencyIcon: {
    marginRight: Spacing.sm,
  },
  emergencyText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  emergencyButton: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.danger,
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadows.lg,
  },
  emergencyButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSizes.md,
  },
  statsRow: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
  },
  deviceList: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  deviceCard: {
    marginBottom: 0,
  },
  deviceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  deviceModel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  deviceTime: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
  },
  alertsList: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  alertCard: {
    marginBottom: 0,
  },
  alertContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertInfo: {
    flex: 1,
  },
  alertType: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  alertMessage: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  alertTime: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  alertSeverityBadge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertSeverityText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
});

export default SecurityDashboard;
