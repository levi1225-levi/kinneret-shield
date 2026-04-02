import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/models/user.dart';
import '../../../core/providers/attendance_provider.dart';
import '../../../core/providers/device_provider.dart';
import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/stat_card.dart';
import '../../../shared/widgets/error_widget.dart';

class ManagementDashboard extends ConsumerWidget {
  const ManagementDashboard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final attendanceAsync = ref.watch(todayAttendanceProvider);
    final devicesAsync = ref.watch(devicesListProvider);

    return AppScaffold(
      title: 'Management Dashboard',
      role: UserRole.management,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Text(
              'System Overview',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'Real-time analytics and system health',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppConstants.darkGray.withOpacity(0.6),
              ),
            ),
            const SizedBox(height: 24),

            // KPI Cards
            attendanceAsync.when(
              loading: () => const LoadingWidget(itemCount: 1),
              error: (_, __) => const SizedBox(),
              data: (records) {
                final presentCount = records.where((r) => r.status == 'present').length;
                final absentCount = records.where((r) => r.status == 'absent').length;
                final lateCount = records.where((r) => r.status == 'late').length;
                final total = records.length;
                final percentage = total > 0 ? ((presentCount / total) * 100).toStringAsFixed(1) : '0.0';

                return Column(
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
                          label: 'Attendance %',
                          value: '$percentage%',
                          icon: Icons.trending_up,
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

            // Attendance Trend Chart
            Text(
              'Attendance Trends',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: SizedBox(
                  height: 300,
                  child: LineChart(
                    LineChartData(
                      gridData: const FlGridData(show: false),
                      titlesData: FlTitlesData(
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            getTitlesWidget: (value, meta) {
                              const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                              if (value.toInt() < labels.length) {
                                return Text(labels[value.toInt()]);
                              }
                              return const Text('');
                            },
                          ),
                        ),
                        leftTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: true),
                        ),
                      ),
                      borderData: FlBorderData(show: true),
                      lineBarsData: [
                        LineChartBarData(
                          spots: const [
                            FlSpot(0, 95),
                            FlSpot(1, 92),
                            FlSpot(2, 88),
                            FlSpot(3, 91),
                            FlSpot(4, 89),
                          ],
                          isCurved: true,
                          color: AppConstants.primaryBlue,
                          barWidth: 3,
                          isStrokeCapRound: true,
                          dotData: const FlDotData(show: true),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Device Health
            Text(
              'Device Health',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            devicesAsync.when(
              loading: () => const LoadingWidget(itemCount: 2),
              error: (_, __) => ErrorStateWidget(
                message: 'Failed to load device status',
              ),
              data: (devices) {
                final onlineCount = devices.where((d) => d.status == 'online').length;
                final offlineCount = devices.where((d) => d.status == 'offline').length;
                final errorCount = devices.where((d) => d.status == 'error').length;

                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            Column(
                              children: [
                                Container(
                                  width: 60,
                                  height: 60,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: AppConstants.presentGreen.withOpacity(0.1),
                                  ),
                                  child: Center(
                                    child: Text(
                                      '$onlineCount',
                                      style: TextStyle(
                                        color: AppConstants.presentGreen,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 18,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                const Text('Online'),
                              ],
                            ),
                            Column(
                              children: [
                                Container(
                                  width: 60,
                                  height: 60,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: AppConstants.unknownGray.withOpacity(0.1),
                                  ),
                                  child: Center(
                                    child: Text(
                                      '$offlineCount',
                                      style: TextStyle(
                                        color: AppConstants.unknownGray,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 18,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                const Text('Offline'),
                              ],
                            ),
                            Column(
                              children: [
                                Container(
                                  width: 60,
                                  height: 60,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: AppConstants.absentRed.withOpacity(0.1),
                                  ),
                                  child: Center(
                                    child: Text(
                                      '$errorCount',
                                      style: TextStyle(
                                        color: AppConstants.absentRed,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 18,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                const Text('Error'),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 24),

            // Admin Actions
            Text(
              'Admin Actions',
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
                  'Users',
                  Icons.people,
                  () => context.go('/admin'),
                ),
                _buildActionCard(
                  context,
                  'Invite Codes',
                  Icons.card_giftcard,
                  () => context.go('/admin'),
                ),
                _buildActionCard(
                  context,
                  'Devices',
                  Icons.router,
                  () => context.go('/devices'),
                ),
                _buildActionCard(
                  context,
                  'Reports',
                  Icons.analytics,
                  () => context.go('/admin'),
                ),
              ],
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
                style: Theme.of(context).textTheme.titleMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
