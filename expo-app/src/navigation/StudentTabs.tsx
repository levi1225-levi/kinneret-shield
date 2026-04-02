import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes } from '../utils/theme';
import StudentDashboard from '../screens/student/StudentDashboard';
import StudentAttendance from '../screens/student/StudentAttendance';
import ProfileScreen from '../screens/shared/ProfileScreen';

export type StudentTabsParamList = {
  StudentDashboard: undefined;
  StudentAttendance: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<StudentTabsParamList>();

/**
 * StudentTabs - Bottom tab navigator for student role
 * Shows Dashboard, Attendance, and Profile tabs
 */
const StudentTabs: React.FC = () => {
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
        name="StudentDashboard"
        component={StudentDashboard}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="StudentAttendance"
        component={StudentAttendance}
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
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

export default StudentTabs;
