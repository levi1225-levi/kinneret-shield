import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, loginDemo, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [loginError, setLoginError] = useState('');

  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!text) {
      setEmailError('Email is required');
    } else if (!emailRegex.test(text)) {
      setEmailError('Please enter a valid email');
    } else {
      setEmailError('');
    }
    setEmail(text);
  };

  const handleSignIn = useCallback(async () => {
    setLoginError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!password) {
      Alert.alert('Validation Error', 'Password is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    try {
      await login(email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed. Please check your credentials.';
      setLoginError(errorMessage);
      Alert.alert('Sign In Failed', errorMessage);
    }
  }, [email, password, login]);

  const handleDemoLogin = useCallback(async () => {
    try {
      setLoginError('');
      loginDemo();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Demo login failed';
      setLoginError(errorMessage);
      Alert.alert('Demo Login Failed', errorMessage);
    }
  }, [loginDemo]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Logo/Title Section */}
      <View style={styles.headerSection}>
        <MaterialCommunityIcons
          name="shield-account"
          size={80}
          color={Colors.primary}
          style={styles.logo}
        />
        <Text style={styles.title}>Kinneret Shield</Text>
        <Text style={styles.subtitle}>Camp Safety Management</Text>
      </View>

      {/* Error Message */}
      {loginError ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={20}
            color={Colors.danger}
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>{loginError}</Text>
        </View>
      ) : null}

      {/* Real Login Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sign In</Text>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email</Text>
          <View
            style={[
              styles.inputContainer,
              emailError ? styles.inputError : null,
            ]}
          >
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={validateEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              selectTextOnFocus
            />
          </View>
          {emailError ? (
            <Text style={styles.errorLabel}>{emailError}</Text>
          ) : null}
        </View>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[styles.signInButton, isLoading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="login"
                size={20}
                color={Colors.white}
                style={styles.buttonIcon}
              />
              <Text style={styles.signInButtonText}>Sign In</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.divider} />
      </View>

      {/* Demo Login Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Try Demo Mode</Text>
        <Text style={styles.sectionSubtitle}>
          Explore the app with sample camp data
        </Text>

        <TouchableOpacity
          style={[styles.demoButton, isLoading && styles.buttonDisabled]}
          onPress={handleDemoLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="play-circle-outline"
                size={20}
                color={Colors.white}
                style={styles.buttonIcon}
              />
              <Text style={styles.demoButtonText}>Enter Demo Mode</Text>
            </>
          )}
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
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    gap: Spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
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
  errorContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff3cd',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  errorIcon: {
    marginRight: Spacing.sm,
    color: '#856404',
  },
  errorText: {
    flex: 1,
    color: '#856404',
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  inputWrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  errorLabel: {
    fontSize: FontSizes.xs,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  signInButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  demoButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  demoButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

export default LoginScreen;
