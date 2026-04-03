import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes } from '../utils/theme';
import ManagementDashboard from '../screens/superadmin/ManagementDashboard';
import RoomsScreen from '../screens/shared/RoomsScreen';
import DevicesScreen from '../screens/shared/DevicesScreen';
import AlertsScreen from '../screens/shared/AlertsScreen';
import AdminPanel from '../screens/superadmin/AdminPanel';
import ProfileScreen from '../screens/shared/ProfileScreen';

export type ManagementTabsParamList = {
  ManagementDashboard: undefined;
  Locations: undefined;
  Devices: undefined;
  Alerts: undefined;
  Admin: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<ManagementTabsParamList>();

/**
 * ManagementTabs - Bottom tab navigator for management role
 * Acts as both Super Admin and School Admin
 * Shows Dashboard, Rooms, Admin Panel, and Profile tabs
 */
const ManagementTabs: React.FC = () => {
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
        name="ManagementDashboard"
        component={ManagementDashboard}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Locations"
        component={RoomsScreen}
        options={{
          title: 'Locations',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" color={color} size={size} />
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
        name="Admin"
        component={AdminPanel}
        options={{
          title: 'Admin',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
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

export default ManagementTabs;
