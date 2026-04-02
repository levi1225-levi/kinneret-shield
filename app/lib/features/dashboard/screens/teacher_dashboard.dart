import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/models/user.dart';
import '../../../core/providers/attendance_provider.dart';
import '../../../core/providers/room_provider.dart';
import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/stat_card.dart';

class TeacherDashboard extends ConsumerWidget {
  const TeacherDashboard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final attendanceAsync = ref.watch(todayAttendanceProvider);
    final roomsAsync = ref.watch(roomsListProvider);

    return AppScaffold(
      title: 'Teacher Dashboard',
      role: UserRole.teacher,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Text(
              'Today\'s Overview',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'Monitor your classes and student attendance',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppConstants.darkGray.withOpacity(0.6),
              ),
            ),
            const SizedBox(height: 24),

            // Attendance Stats
            attendanceAsync.when(
              loading: () => const LoadingWidget(itemCount: 2),
              error: (_, __) => const SizedBox(),
              data: (records) {
                final presentCount = records.where((r) => r.status == 'present').length;
                final absentCount = records.where((r) => r.status == 'absent').length;
                final lateCount = records.where((r) => r.status == 'late').length;

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
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
                          label: 'Absent',
                          value: '$absentCount',
                          icon: Icons.cancel,
                          backgroundColor: AppConstants.absentRed.withOpacity(0.1),
                          iconColor: AppConstants.absentRed,
                        ),
                        (
                          label: 'Late',
                          value: '$lateCount',
                          icon: Icons.schedule,
                          backgroundColor: AppConstants.lateYellow.withOpacity(0.1),
                          iconColor: AppConstants.lateYellow,
                        ),
                        (
                          label: 'Total',
                          value: '${records.length}',
                          icon: Icons.people,
                          backgroundColor: AppConstants.primaryBlue.withOpacity(0.1),
                          iconColor: AppConstants.primaryBlue,
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                  ],
                );
              },
            ),

            // Classes Section
            Text(
              'Your Classes',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            roomsAsync.when(
              loading: () => const LoadingWidget(itemCount: 2),
              error: (_, __) => const SizedBox(),
              data: (rooms) {
                if (rooms.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Text(
                        'No classes assigned',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppConstants.darkGray.withOpacity(0.6),
                        ),
                      ),
                    ),
                  );
                }

                return Column(
                  children: [
                    ...rooms.take(3).map((room) {
                      return _buildClassCard(context, room);
                    }).toList(),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: () => context.go('/rooms'),
                        child: const Text('View All Classes'),
                      ),
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 24),

            // Quick Actions
            Text(
              'Quick Actions',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildActionCard(
                  context,
                  'Attendance',
                  Icons.assignment,
                  () => context.go('/attendance'),
                ),
                _buildActionCard(
                  context,
                  'Alerts',
                  Icons.notifications,
                  () => context.go('/alerts'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildClassCard(BuildContext context, dynamic room) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  room.name ?? 'Room',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                Icon(
                  Icons.school,
                  color: AppConstants.primaryBlue,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Building: ${room.building ?? 'Unknown'} | Floor: ${room.floor ?? 'Unknown'}',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppConstants.darkGray.withOpacity(0.6),
              ),
            ),
            const SizedBox(height: 12),
            LinearProgressIndicator(
              value: (room.currentOccupancy ?? 0) / (room.capacity ?? 1),
              minHeight: 8,
              backgroundColor: AppConstants.neutralGray,
              valueColor: AlwaysStoppedAnimation(
                (room.currentOccupancy ?? 0) > (room.capacity ?? 1) * 0.8
                    ? AppConstants.lateYellow
                    : AppConstants.presentGreen,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Occupancy: ${room.currentOccupancy ?? 0}/${room.capacity ?? 0}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionCard(
    BuildContext context,
    String title,
    IconData icon,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 32,
                color: AppConstants.primaryBlue,
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: Theme.of(context).textTheme.titleLarge,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
