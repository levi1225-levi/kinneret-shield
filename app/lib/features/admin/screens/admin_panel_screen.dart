import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/models/user.dart';
import '../../../shared/widgets/app_scaffold.dart';

class AdminPanelScreen extends ConsumerStatefulWidget {
  const AdminPanelScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<AdminPanelScreen> createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends ConsumerState<AdminPanelScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Administration',
      role: UserRole.management,
      body: Column(
        children: [
          TabBar(
            controller: _tabController,
            tabs: const [
              Tab(text: 'Users'),
              Tab(text: 'Invite Codes'),
              Tab(text: 'Settings'),
            ],
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // Users Tab
                _buildUsersTab(),
                // Invite Codes Tab
                _buildInviteCodesTab(),
                // Settings Tab
                _buildSettingsTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUsersTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Search Bar
        TextFormField(
          decoration: InputDecoration(
            hintText: 'Search users...',
            prefixIcon: const Icon(Icons.search),
          ),
        ),
        const SizedBox(height: 16),

        // Users List
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                _buildUserRow('John Doe', 'student@example.com', UserRole.student),
                Divider(color: AppConstants.neutralGray),
                _buildUserRow('Jane Smith', 'teacher@example.com', UserRole.teacher),
                Divider(color: AppConstants.neutralGray),
                _buildUserRow('Admin User', 'admin@example.com', UserRole.management),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildUserRow(String name, String email, UserRole role) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          CircleAvatar(
            child: Text(name[0]),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                Text(
                  email,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppConstants.darkGray.withOpacity(0.6),
                  ),
                ),
                Text(
                  role.name.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    color: AppConstants.primaryBlue,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          PopupMenuButton(
            itemBuilder: (context) => [
              const PopupMenuItem(child: Text('Edit')),
              const PopupMenuItem(child: Text('Reset Password')),
              const PopupMenuItem(child: Text('Deactivate')),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInviteCodesTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Generate Button
        ElevatedButton.icon(
          onPressed: () {
            _showGenerateInviteDialog();
          },
          icon: const Icon(Icons.add),
          label: const Text('Generate Invite Codes'),
        ),
        const SizedBox(height: 16),

        // Invite Codes List
        Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                _buildInviteCodeRow('INV-2024-001', 'student', '5/10'),
                Divider(color: AppConstants.neutralGray),
                _buildInviteCodeRow('INV-2024-002', 'teacher', '2/3'),
                Divider(color: AppConstants.neutralGray),
                _buildInviteCodeRow('INV-2024-003', 'parent', '0/5'),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInviteCodeRow(String code, String role, String usage) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  code,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontFamily: 'monospace',
                  ),
                ),
                Text(
                  role.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    color: AppConstants.primaryBlue,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          Text(
            usage,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppConstants.darkGray.withOpacity(0.6),
            ),
          ),
          const SizedBox(width: 12),
          PopupMenuButton(
            itemBuilder: (context) => [
              const PopupMenuItem(child: Text('Copy')),
              const PopupMenuItem(child: Text('Deactivate')),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'System Settings',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 16),

        // Settings Cards
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Attendance Settings',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 12),
                SwitchListTile(
                  title: const Text('Enable Late Tracking'),
                  value: true,
                  onChanged: (value) {},
                ),
                SwitchListTile(
                  title: const Text('Auto-checkout at End of Day'),
                  value: true,
                  onChanged: (value) {},
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),

        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Device Settings',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 12),
                SwitchListTile(
                  title: const Text('Enable Device Monitoring'),
                  value: true,
                  onChanged: (value) {},
                ),
                SwitchListTile(
                  title: const Text('Alert on Device Offline'),
                  value: true,
                  onChanged: (value) {},
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),

        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Notification Settings',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 12),
                SwitchListTile(
                  title: const Text('Enable Email Notifications'),
                  value: true,
                  onChanged: (value) {},
                ),
                SwitchListTile(
                  title: const Text('Enable Push Notifications'),
                  value: true,
                  onChanged: (value) {},
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  void _showGenerateInviteDialog() {
    String? selectedRole = 'student';
    int count = 1;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Generate Invite Codes'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            DropdownButtonFormField(
              value: selectedRole,
              decoration: const InputDecoration(labelText: 'Role'),
              items: ['student', 'teacher', 'parent', 'security_guard', 'management']
                  .map((role) => DropdownMenuItem(
                    value: role,
                    child: Text(role),
                  ))
                  .toList(),
              onChanged: (value) {
                selectedRole = value;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              initialValue: '1',
              decoration: const InputDecoration(labelText: 'Number of Codes'),
              keyboardType: TextInputType.number,
              onChanged: (value) {
                count = int.tryParse(value) ?? 1;
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Invite codes generated')),
              );
            },
            child: const Text('Generate'),
          ),
        ],
      ),
    );
  }
}
