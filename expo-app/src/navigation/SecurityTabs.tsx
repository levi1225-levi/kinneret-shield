import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes } from '../utils/theme';
import SecurityDashboard from '../screens/schooladmin/SecurityDashboard';
import DevicesScreen from '../screens/shared/DevicesScreen';
import AlertsScreen from '../screens/shared/AlertsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

export type SecurityTabsParamList = {
  SecurityDashboard: undefined;
  Devices: undefined;
  Alerts: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<SecurityTabsParamList>();

/**
 * SecurityTabs - Bottom tab navigator for security_guard role
 * Shows Dashboard, Devices, Alerts, and Profile tabs
 */
const SecurityTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: FontSizes.xs,
        },
      }}
    >
      <Tab.Screen
        name="SecurityDashboard"
        component={SecurityDashboard}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Devices"
        component={DevicesScreen}
        options={{
          title: 'Devices',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hardware-chip-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default SecurityTabs;
