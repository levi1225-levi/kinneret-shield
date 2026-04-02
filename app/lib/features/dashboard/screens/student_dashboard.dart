import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/models/user.dart';
import '../../../core/providers/attendance_provider.dart';
import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../../../shared/widgets/stat_card.dart';
import '../../../shared/widgets/error_widget.dart';

class StudentDashboard extends ConsumerWidget {
  const StudentDashboard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final attendanceAsync = ref.watch(todayAttendanceProvider);

    return AppScaffold(
      title: 'My Dashboard',
      role: UserRole.student,
      body: attendanceAsync.when(
        loading: () => const LoadingWidget(),
        error: (error, stack) => ErrorStateWidget(
          message: error.toString(),
          onRetry: () {
            ref.invalidate(todayAttendanceProvider);
          },
        ),
        data: (records) {
          final presentCount = records.where((r) => r.status == 'present').length;
          final absentCount = records.where((r) => r.status == 'absent').length;
          final lateCount = records.where((r) => r.status == 'late').length;

          if (records.isEmpty) {
            return EmptyStateWidget(
              title: 'No Attendance Records',
              subtitle: 'You haven\'t checked in yet today',
              icon: Icons.check_circle,
              onAction: () => context.go('/attendance'),
              actionLabel: 'View Full History',
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Welcome Section
                Text(
                  'Welcome back!',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                Text(
                  'Here\'s your attendance overview for today',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppConstants.darkGray.withOpacity(0.6),
                  ),
                ),
                const SizedBox(height: 24),

                // Stats
                StatCardRow(
                  stats: [
                    (
                      label: 'Present',
                      value: '$presentCount',
                      icon: Icons.check_circle,
                      backgroundColor: AppConstants.presentGreen.withOpacity(0.1),
                      iconColor: AppConstants.presentGreen,
                    ),
                    (
                      label: 'Late',
                      value: '$lateCount',
                      icon: Icons.schedule,
                      backgroundColor: AppConstants.lateYellow.withOpacity(0.1),
                      iconColor: AppConstants.lateYellow,
                    ),
                    (
                      label: 'Absent',
                      value: '$absentCount',
                      icon: Icons.cancel,
                      backgroundColor: AppConstants.absentRed.withOpacity(0.1),
                      iconColor: AppConstants.absentRed,
                    ),
                    (
                      label: 'Attendance %',
                      value: '${((presentCount / (records.length)).clamp(0.0, 1.0) * 100).toStringAsFixed(0)}%',
                      icon: Icons.trending_up,
                      backgroundColor: AppConstants.primaryBlue.withOpacity(0.1),
                      iconColor: AppConstants.primaryBlue,
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Recent Check-ins
                Text(
                  'Recent Check-ins',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                ...records.take(3).map((record) {
                  return _buildCheckInCard(context, record);
                }).toList(),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => context.go('/attendance'),
                    child: const Text('View Full History'),
                  ),
                ),
                const SizedBox(height: 24),

                // Quick Actions
                Text(
                  'Quick Actions',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildActionButton(
                      context,
                      'Schedule',
                      Icons.calendar_today,
                      () {},
                    ),
                    _buildActionButton(
                      context,
                      'Classes',
                      Icons.school,
                      () => context.go('/rooms'),
                    ),
                    _buildActionButton(
                      context,
                      'Alerts',
                      Icons.notifications,
                      () => context.go('/alerts'),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildCheckInCard(BuildContext context, dynamic record) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  record.roomId ?? 'Room',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 4),
                Text(
                  record.checkInTime?.toString().split(' ')[1].split('.')[0] ?? '--:--',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppConstants.darkGray.withOpacity(0.6),
                  ),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: _getStatusColor(record.status).withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                record.status?.toUpperCase() ?? 'UNKNOWN',
                style: TextStyle(
                  color: _getStatusColor(record.status),
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(
    BuildContext context,
    String label,
    IconData icon,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: AppConstants.primaryBlue.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: AppConstants.primaryBlue,
              size: 28,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'present':
        return AppConstants.presentGreen;
      case 'absent':
        return AppConstants.absentRed;
      case 'late':
        return AppConstants.lateYellow;
      default:
        return AppConstants.unknownGray;
    }
  }
}
