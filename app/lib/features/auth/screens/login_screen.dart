import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../shared/widgets/error_widget.dart';

class LoginScreen extends ConsumerWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(currentUserProvider);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
            child: Column(
              children: [
                // Logo/App Name
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppConstants.primaryBlue,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(
                    Icons.security,
                    color: AppConstants.neutralWhite,
                    size: 40,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  AppConstants.appName,
                  style: Theme.of(context).textTheme.displayMedium?.copyWith(
                    color: AppConstants.primaryBlue,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'School NFC Attendance System',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppConstants.darkGray.withOpacity(0.7),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 48),

                // Tagline
                Text(
                  'Welcome to TanenbaumCHAT',
                  style: Theme.of(context).textTheme.titleLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Text(
                  'Sign in to your account to continue',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppConstants.darkGray.withOpacity(0.6),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 48),

                // Google Sign-In Button
                authState.when(
                  loading: () => _buildSignInButton(
                    context,
                    ref,
                    isLoading: true,
                  ),
                  data: (user) {
                    if (user != null) {
                      Future.microtask(() {
                        context.go('/dashboard/student');
                      });
                    }
                    return _buildSignInButton(context, ref);
                  },
                  error: (error, stack) => Column(
                    children: [
                      ErrorStateWidget(
                        message: error.toString(),
                        onRetry: () {
                          ref.invalidate(currentUserProvider);
                        },
                      ),
                      const SizedBox(height: 24),
                      _buildSignInButton(context, ref),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Divider
                Row(
                  children: [
                    Expanded(
                      child: Divider(
                        color: AppConstants.primaryBlueLight.withOpacity(0.3),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        'OR',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppConstants.darkGray.withOpacity(0.6),
                        ),
                      ),
                    ),
                    Expanded(
                      child: Divider(
                        color: AppConstants.primaryBlueLight.withOpacity(0.3),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Register Button
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => context.go('/register'),
                    child: const Text('Create Account with Invite Code'),
                  ),
                ),
                const SizedBox(height: 32),

                // Footer
                Text(
                  'By signing in, you agree to our Terms of Service',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppConstants.darkGray.withOpacity(0.5),
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSignInButton(
    BuildContext context,
    WidgetRef ref, {
    bool isLoading = false,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton.icon(
        onPressed: isLoading
            ? null
            : () async {
              await ref.read(currentUserProvider.notifier).signInWithGoogle();
            },
        icon: isLoading
            ? const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation(AppConstants.neutralWhite),
              ),
            )
            : Image.asset(
              'assets/icons/google_icon.png',
              width: 20,
              height: 20,
            ),
        label: Text(
          isLoading ? 'Signing in...' : 'Sign in with Google',
          style: const TextStyle(fontSize: 16),
        ),
      ),
    );
  }
}
