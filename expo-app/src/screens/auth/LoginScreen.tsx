import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { demoLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = useCallback(async () => {
    Alert.alert(
      'Google Sign-In',
      'Google Sign-In will be configured with your Expo project credentials.\n\nFor now, please use the Demo Login section below to test the app.'
    );
  }, []);

  const handleDemoLogin = useCallback(
    async (role: UserRole) => {
      try {
        setIsLoading(true);
        await demoLogin(role);
      } catch (error) {
        Alert.alert(
          'Login Failed',
          error instanceof Error ? error.message : 'An error occurred during login'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [demoLogin]
  );

  const demoRoles: Array<{ role: UserRole; label: string; color: string }> = [
    { role: 'student', label: 'Student', color: Colors.roleStudent },
    { role: 'teacher', label: 'Teacher', color: Colors.roleTeacher },
    { role: 'security_guard', label: 'Security', color: Colors.roleSecurity },
    { role: 'management', label: 'Management', color: Colors.roleManagement },
    { role: 'parent', label: 'Parent', color: Colors.roleParent },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Logo/Title Section */}
      <View style={styles.headerSection}>
        <MaterialCommunityIcons
          name="shield-account"
          size={80}
          color={Colors.primary}
          style={styles.logo}
        />
        <Text style={styles.title}>Kinneret Shield</Text>
        <Text style={styles.subtitle}>School Safety Management</Text>
      </View>

      {/* Google Sign-In Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <MaterialCommunityIcons
            name="google"
            size={20}
            color={Colors.white}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>

      {/* Demo Login Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demo Login</Text>
        <Text style={styles.sectionSubtitle}>
          Select a role to test the application
        </Text>

        <View style={styles.rolesGrid}>
          {demoRoles.map((item) => (
            <TouchableOpacity
              key={item.role}
              style={[
                styles.roleButton,
                { borderColor: item.color },
              ]}
              onPress={() => handleDemoLogin(item.role)}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color={item.color}
                  style={styles.loadingIndicator}
                />
              )}
              {!isLoading && (
                <>
                  <View style={[styles.roleDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.roleButtonText, { color: item.color }]}>
                    {item.label}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Register Link */}
      <View style={styles.registerSection}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          disabled={isLoading}
        >
          <Text style={styles.registerLink}>Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logo: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.xxxl,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    marginRight: Spacing.sm,
  },
  googleButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  roleButton: {
    width: '48%',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleDot: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  roleButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  loadingIndicator: {
    marginBottom: Spacing.sm,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default LoginScreen;
