import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/error_widget.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(currentUserProvider);

    return AppScaffold(
      title: 'Profile',
      body: userAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => ErrorStateWidget(
          message: error.toString(),
        ),
        data: (user) {
          if (user == null) {
            return ErrorStateWidget(
              message: 'User not found',
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Profile Header
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 50,
                          backgroundColor: AppConstants.primaryBlue,
                          backgroundImage: user.profilePictureUrl != null
                              ? NetworkImage(user.profilePictureUrl!)
                              : null,
                          child: user.profilePictureUrl == null
                              ? Text(
                                (user.firstName[0] + user.lastName[0]).toUpperCase(),
                                style: const TextStyle(
                                  color: AppConstants.neutralWhite,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              )
                              : null,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          '${user.firstName} ${user.lastName}',
                          style: Theme.of(context).textTheme.headlineSmall,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: AppConstants.primaryBlue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            user.role.name.replaceAll('_', ' ').toUpperCase(),
                            style: TextStyle(
                              color: AppConstants.primaryBlue,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Personal Information
                Text(
                  'Personal Information',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildInfoRow(context, 'Email', user.email),
                        _buildInfoRow(context, 'First Name', user.firstName),
                        _buildInfoRow(context, 'Last Name', user.lastName),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Role-Specific Information
                if (user.studentNumber != null) ...[
                  Text(
                    'Student Information',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          _buildInfoRow(context, 'Student Number', user.studentNumber!),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                if (user.department != null) ...[
                  Text(
                    'Department',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          _buildInfoRow(context, 'Department', user.department!),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // NFC Card
                Text(
                  'NFC Card',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                Card(
                  color: AppConstants.neutralGray,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (user.nfcCardId != null) ...[
                          Text(
                            'Linked Card ID',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppConstants.darkGray.withOpacity(0.6),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            user.nfcCardId!,
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontFamily: 'monospace',
                            ),
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton.icon(
                              onPressed: () {
                                SuccessSnackBar.show(context, 'Card unlinked');
                              },
                              icon: const Icon(Icons.close),
                              label: const Text('Unlink Card'),
                            ),
                          ),
                        ] else ...[
                          Text(
                            'No NFC card linked',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: AppConstants.darkGray.withOpacity(0.6),
                            ),
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () {
                                SuccessSnackBar.show(context, 'Linking card...');
                              },
                              icon: const Icon(Icons.add),
                              label: const Text('Link NFC Card'),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Account Settings
                Text(
                  'Account Settings',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      children: [
                        ListTile(
                          leading: const Icon(Icons.notification_important),
                          title: const Text('Notifications'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Notification settings')),
                            );
                          },
                        ),
                        Divider(color: AppConstants.neutralGray),
                        ListTile(
                          leading: const Icon(Icons.security),
                          title: const Text('Security'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Security settings')),
                            );
                          },
                        ),
                        Divider(color: AppConstants.neutralGray),
                        ListTile(
                          leading: const Icon(Icons.privacy_tip),
                          title: const Text('Privacy'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Privacy settings')),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Sign Out
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      _showSignOutDialog(context, ref);
                    },
                    icon: const Icon(Icons.logout),
                    label: const Text('Sign Out'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppConstants.absentRed,
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppConstants.darkGray.withOpacity(0.6),
            ),
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  void _showSignOutDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign Out?'),
        content: const Text('Are you sure you want to sign out of your account?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await ref.read(currentUserProvider.notifier).signOut();
              if (context.mounted) {
                context.go('/login');
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppConstants.absentRed,
            ),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }
}
