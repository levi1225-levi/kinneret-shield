import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../utils/theme';
import LoginScreen from '../screens/auth/LoginScreen';

export type AuthStackParamList = {
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * AuthStack - Navigation for unauthenticated users
 * Routes to the Login screen
 */
const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          animation: 'none',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
