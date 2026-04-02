import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { invitesAPI } from '../../api';

interface RegisterScreenProps {
  navigation: any;
}

type RegisterStep = 'code' | 'role' | 'confirmation';

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { register } = useAuth();
  const [step, setStep] = useState<RegisterStep>('code');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteRole, setInviteRole] = useState<string | null>(null);

  const handleVerifyCode = useCallback(async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    try {
      setIsLoading(true);
      const invite = await invitesAPI.getInviteByCode(inviteCode.trim());

      if (invite.is_used) {
        Alert.alert('Error', 'This invite code has already been used');
        return;
      }

      if (invite.is_expired) {
        Alert.alert('Error', 'This invite code has expired');
        return;
      }

      setInviteRole(invite.role);
      setStep('role');
    } catch (error) {
      Alert.alert(
        'Invalid Code',
        'The invite code is not valid. Please check and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [inviteCode]);

  const handleGoogleSignUp = useCallback(async () => {
    if (!inviteRole) {
      Alert.alert('Error', 'Role information missing');
      return;
    }

    try {
      setIsLoading(true);
      // Create a mock token for demo purposes
      const mockToken = `demo-token-${inviteRole}-${Date.now()}`;

      // Register with invite code
      await register({
        email: 'demo@kinneretshield.com',
        name: 'Demo User',
        inviteCode: inviteCode.trim(),
        role: inviteRole,
      });

      // In a real app, we'd also call login() with the Google token
      // For now, the register function handles the login
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  }, [inviteRole, inviteCode, register]);

  const handleBackToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.primary}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Kinneret Shield</Text>
      </View>

      {/* Step 1: Verify Code */}
      {step === 'code' && (
        <View style={styles.stepContainer}>
          <View style={styles.stepIndicator}>
            <View style={styles.stepDot}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={styles.stepLabel}>Verify Invite Code</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.inputLabel}>Invite Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your invite code"
              placeholderTextColor={Colors.textMuted}
              value={inviteCode}
              onChangeText={setInviteCode}
              editable={!isLoading}
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleVerifyCode}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Verify Code</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Step 2: Role Confirmation */}
      {step === 'role' && inviteRole && (
        <View style={styles.stepContainer}>
          <View style={styles.stepIndicator}>
            <View style={styles.stepDot}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={styles.stepLabel}>Confirm Role</Text>
          </View>

          <View style={styles.roleCard}>
            <MaterialCommunityIcons
              name="check-circle"
              size={48}
              color={Colors.success}
              style={styles.roleIcon}
            />
            <Text style={styles.roleTitle}>Role Confirmed</Text>
            <View style={styles.roleBadgeContainer}>
              <Text style={[
                styles.roleBadge,
                { backgroundColor: `${getRoleColor(inviteRole)}20` },
              ]}>
                <Text style={{ color: getRoleColor(inviteRole) }}>
                  {inviteRole.charAt(0).toUpperCase() + inviteRole.slice(1).replace('_', ' ')}
                </Text>
              </Text>
            </View>
            <Text style={styles.roleDescription}>
              You have been invited to join as a {inviteRole.replace('_', ' ')}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleSignUp}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="google"
                  size={20}
                  color={Colors.white}
                  style={styles.googleIcon}
                />
                <Text style={styles.buttonText}>Sign Up with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setStep('code');
              setInviteRole(null);
            }}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Change Code</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Login Link */}
      <View style={styles.loginSection}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity
          onPress={handleBackToLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    student: Colors.roleStudent,
    teacher: Colors.roleTeacher,
    security_guard: Colors.roleSecurity,
    management: Colors.roleManagement,
    parent: Colors.roleParent,
  };
  return colors[role] || Colors.textSecondary;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: Spacing.md,
    marginLeft: -Spacing.md,
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
  stepContainer: {
    flex: 1,
  },
  stepIndicator: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  stepDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stepNumber: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.white,
  },
  stepLabel: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  googleButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
  },
  googleIcon: {
    marginRight: Spacing.sm,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  roleCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  roleIcon: {
    marginBottom: Spacing.md,
  },
  roleTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  roleBadgeContainer: {
    marginBottom: Spacing.lg,
  },
  roleBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  roleDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  loginText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default RegisterScreen;
