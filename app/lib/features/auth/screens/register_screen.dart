import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/models/user.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../shared/widgets/error_widget.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  late TextEditingController _inviteCodeController;
  UserRole? _selectedRole;
  int _currentStep = 0;

  @override
  void initState() {
    super.initState();
    _inviteCodeController = TextEditingController();
  }

  @override
  void dispose() {
    _inviteCodeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Account'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/login'),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Step indicator
                _buildStepIndicator(),
                const SizedBox(height: 32),

                // Content based on step
                if (_currentStep == 0)
                  _buildInviteCodeStep()
                else if (_currentStep == 1)
                  _buildRoleSelectionStep()
                else
                  _buildSignInStep(context, authState),

                const SizedBox(height: 32),

                // Navigation buttons
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (_currentStep > 0)
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            setState(() {
                              _currentStep--;
                            });
                          },
                          child: const Text('Back'),
                        ),
                      ),
                    if (_currentStep > 0) const SizedBox(width: 16),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _currentStep < 2 ? _handleNext : null,
                        child: Text(
                          _currentStep < 2 ? 'Next' : 'Creating Account...',
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Row(
      children: List.generate(
        3,
        (index) => Expanded(
          child: Column(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: index <= _currentStep
                      ? AppConstants.primaryBlue
                      : AppConstants.neutralGray,
                ),
                child: Center(
                  child: Text(
                    '${index + 1}',
                    style: TextStyle(
                      color: index <= _currentStep
                          ? AppConstants.neutralWhite
                          : AppConstants.darkGray,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                [
                  'Invite Code',
                  'Select Role',
                  'Sign In',
                ][index],
                style: Theme.of(context).textTheme.bodySmall,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInviteCodeStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Enter Your Invite Code',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 16),
        Text(
          'You should have received an invite code from your school administrator.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: AppConstants.darkGray.withOpacity(0.6),
          ),
        ),
        const SizedBox(height: 24),
        TextFormField(
          controller: _inviteCodeController,
          decoration: InputDecoration(
            hintText: 'Enter invite code',
            prefixIcon: const Icon(Icons.vpn_key),
          ),
          textInputAction: TextInputAction.next,
        ),
      ],
    );
  }

  Widget _buildRoleSelectionStep() {
    final roles = [
      (
        UserRole.student,
        'Student',
        'Access attendance records and schedules',
        Icons.school,
      ),
      (
        UserRole.teacher,
        'Teacher',
        'Manage class attendance and records',
        Icons.person,
      ),
      (
        UserRole.parent,
        'Parent',
        'Monitor your child\'s attendance',
        Icons.family_restroom,
      ),
      (
        UserRole.securityGuard,
        'Security Guard',
        'Monitor building access',
        Icons.security,
      ),
      (
        UserRole.management,
        'Management',
        'System administration and analytics',
        Icons.admin_panel_settings,
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Select Your Role',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 16),
        Text(
          'Choose the role that best describes your position',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: AppConstants.darkGray.withOpacity(0.6),
          ),
        ),
        const SizedBox(height: 24),
        ...roles.map((role) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _selectedRole = role.$1;
                });
              },
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: _selectedRole == role.$1
                        ? AppConstants.primaryBlue
                        : AppConstants.primaryBlueLight.withOpacity(0.3),
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Icon(
                      role.$4,
                      color: _selectedRole == role.$1
                          ? AppConstants.primaryBlue
                          : AppConstants.darkGray,
                      size: 24,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            role.$2,
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: _selectedRole == role.$1
                                  ? AppConstants.primaryBlue
                                  : AppConstants.darkGray,
                            ),
                          ),
                          Text(
                            role.$3,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppConstants.darkGray.withOpacity(0.6),
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (_selectedRole == role.$1)
                      Icon(
                        Icons.check_circle,
                        color: AppConstants.primaryBlue,
                      ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildSignInStep(BuildContext context, AsyncValue authState) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Complete Your Registration',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 16),
        Text(
          'Sign in with your Google account to complete registration as a ${_selectedRole?.name ?? 'user'}.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: AppConstants.darkGray.withOpacity(0.6),
          ),
        ),
        const SizedBox(height: 32),
        authState.when(
          loading: () => _buildLoadingState(),
          data: (user) {
            if (user != null) {
              Future.microtask(() {
                context.go('/dashboard/student');
              });
            }
            return _buildSignInButton(context);
          },
          error: (error, stack) => Column(
            children: [
              ErrorStateWidget(
                message: error.toString(),
              ),
              const SizedBox(height: 24),
              _buildSignInButton(context),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSignInButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton.icon(
        onPressed: () async {
          await ref
              .read(currentUserProvider.notifier)
              .registerWithInviteCode(_inviteCodeController.text, _selectedRole!.name);
        },
        icon: const Icon(Icons.account_circle),
        label: const Text('Sign in with Google'),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          Text(
            'Creating your account...',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }

  void _handleNext() {
    if (_currentStep == 0) {
      if (_inviteCodeController.text.isEmpty) {
        ErrorSnackBar.show(context, 'Please enter an invite code');
        return;
      }
      setState(() {
        _currentStep++;
      });
    } else if (_currentStep == 1) {
      if (_selectedRole == null) {
        ErrorSnackBar.show(context, 'Please select a role');
        return;
      }
      setState(() {
        _currentStep++;
      });
    }
  }
}
