import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../utils/theme';
import AuthStack from './AuthStack';
import ManagementTabs from './ManagementTabs';

/**
 * AppNavigator - Main navigation component
 * Routes based on authentication state and user role
 */
const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

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
  if (!user) {
    return <AuthStack />;
  }

  // All authenticated users go to ManagementTabs
  return <ManagementTabs />;
};

export default AppNavigator;
