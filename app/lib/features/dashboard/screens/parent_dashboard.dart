import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/models/user.dart';
import '../../../core/providers/attendance_provider.dart';
import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../shared/widgets/error_widget.dart';

class ParentDashboard extends ConsumerWidget {
  const ParentDashboard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final attendanceAsync = ref.watch(todayAttendanceProvider);

    return AppScaffold(
      title: 'Parent Dashboard',
      role: UserRole.parent,
      body: attendanceAsync.when(
        loading: () => const LoadingWidget(),
        error: (error, stack) => ErrorStateWidget(
          message: error.toString(),
          onRetry: () {
            ref.invalidate(todayAttendanceProvider);
          },
        ),
        data: (records) {
          if (records.isEmpty) {
            return EmptyStateWidget(
              title: 'No Attendance Records',
              subtitle: 'Your child hasn\'t checked in yet today',
              icon: Icons.info,
              onAction: () => context.go('/attendance'),
              actionLabel: 'View History',
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Text(
                  'Your Child\'s Status',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                Text(
                  'Today\'s attendance overview',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppConstants.darkGray.withOpacity(0.6),
                  ),
                ),
                const SizedBox(height: 24),

                // Latest Status Card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Latest Check-In',
                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: AppConstants.darkGray.withOpacity(0.6),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  records.first.checkInTime?.toString().split(' ')[1].split('.')[0] ?? '--:--',
                                  style: Theme.of(context).textTheme.displaySmall?.copyWith(
                                    color: AppConstants.primaryBlue,
                                  ),
                                ),
                              ],
                            ),
                            StatusBadge(
                              status: records.first.status ?? 'unknown',
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Location: ${records.first.roomId ?? 'Unknown Room'}',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Time: ${records.first.checkInTime?.toString() ?? '--:--'}',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppConstants.darkGray.withOpacity(0.6),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Attendance Summary
                Text(
                  'Today\'s Summary',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                _buildSummaryCard(
                  context,
                  'Check-Ins',
                  '${records.length}',
                  Icons.login,
                  AppConstants.presentGreen,
                ),
                const SizedBox(height: 8),
                _buildSummaryCard(
                  context,
                  'Attendance',
                  '${records.where((r) => r.status == 'present').length}/${records.length}',
                  Icons.check_circle,
                  AppConstants.primaryBlue,
                ),
                const SizedBox(height: 24),

                // Full Timeline
                Text(
                  'Timeline',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                ...records.map((record) {
                  return _buildTimelineCard(context, record);
                }).toList(),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => context.go('/attendance'),
                    child: const Text('View Full History'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildSummaryCard(
    BuildContext context,
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: color.withOpacity(0.1),
              ),
              child: Icon(icon, color: color),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppConstants.darkGray.withOpacity(0.6),
                  ),
                ),
                Text(
                  value,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: color,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineCard(BuildContext context, dynamic record) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Column(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _getStatusColor(record.status).withOpacity(0.1),
                    ),
                    child: Icon(
                      Icons.location_on,
                      color: _getStatusColor(record.status),
                      size: 20,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      record.roomId ?? 'Room',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      record.checkInTime?.toString() ?? '--:--',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppConstants.darkGray.withOpacity(0.6),
                      ),
                    ),
                  ],
                ),
              ),
              StatusBadge(status: record.status ?? 'unknown'),
            ],
          ),
        ),
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
