import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../utils/theme';
import AuthStack from './AuthStack';
import StudentTabs from './StudentTabs';
import TeacherTabs from './TeacherTabs';
import SecurityTabs from './SecurityTabs';
import ManagementTabs from './ManagementTabs';
import ParentTabs from './ParentTabs';

/**
 * AppNavigator - Main navigation component
 * Routes based on authentication state and user role
 */
const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // If not authenticated, show auth stack
  if (!isAuthenticated) {
    return <AuthStack />;
  }

  // Route to role-appropriate navigator
  switch (user?.role) {
    case 'student':
      return <StudentTabs />;
    case 'teacher':
      return <TeacherTabs />;
    case 'security_guard':
      return <SecurityTabs />;
    case 'management':
      return <ManagementTabs />;
    case 'parent':
      return <ParentTabs />;
    default:
      return <AuthStack />;
  }
};

export default AppNavigator;
