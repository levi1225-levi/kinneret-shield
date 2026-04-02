import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/models/user.dart';
import '../../../core/providers/alert_provider.dart';
import '../../../core/providers/device_provider.dart';
import '../../../core/providers/room_provider.dart';
import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/stat_card.dart';
import '../../../shared/widgets/error_widget.dart';

class SecurityDashboard extends ConsumerWidget {
  const SecurityDashboard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final roomsAsync = ref.watch(roomsListProvider);
    final alertsAsync = ref.watch(activeAlertsProvider);
    final devicesCountAsync = ref.watch(onlineDevicesCountProvider);

    return AppScaffold(
      title: 'Security Dashboard',
      role: UserRole.securityGuard,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Text(
              'Building Overview',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'Real-time facility status and alerts',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppConstants.darkGray.withOpacity(0.6),
              ),
            ),
            const SizedBox(height: 24),

            // Status Stats
            devicesCountAsync.when(
              loading: () => const LoadingWidget(itemCount: 1),
              error: (_, __) => const SizedBox(),
              data: (onlineCount) {
                return StatCardRow(
                  stats: [
                    (
                      label: 'Devices Online',
                      value: '$onlineCount',
                      icon: Icons.router,
                      backgroundColor: AppConstants.presentGreen.withOpacity(0.1),
                      iconColor: AppConstants.presentGreen,
                    ),
                    (
                      label: 'Active Alerts',
                      value: '0',
                      icon: Icons.warning,
                      backgroundColor: AppConstants.lateYellow.withOpacity(0.1),
                      iconColor: AppConstants.lateYellow,
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 24),

            // Emergency Button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton.icon(
                onPressed: () {
                  _showEmergencyDialog(context);
                },
                icon: const Icon(Icons.emergency),
                label: const Text('TRIGGER EMERGENCY'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppConstants.absentRed,
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Rooms Occupancy
            Text(
              'Room Occupancy Status',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            roomsAsync.when(
              loading: () => const LoadingWidget(itemCount: 3),
              error: (_, __) => ErrorStateWidget(
                message: 'Failed to load rooms',
              ),
              data: (rooms) {
                if (rooms.isEmpty) {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Text('No rooms available'),
                    ),
                  );
                }

                return Column(
                  children: rooms.map((room) {
                    final occupancyPercent =
                        ((room.currentOccupancy ?? 0) / (room.capacity ?? 1)).clamp(0.0, 1.0);
                    final isOverCapacity = (room.currentOccupancy ?? 0) > (room.capacity ?? 0);

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Card(
                        color: isOverCapacity
                            ? AppConstants.lateYellow.withOpacity(0.1)
                            : null,
                        child: Padding(
                          padding: const EdgeInsets.all(12),
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
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 6,
                                    ),
                                    decoration: BoxDecoration(
                                      color: isOverCapacity
                                          ? AppConstants.lateYellow
                                          : AppConstants.presentGreen,
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      isOverCapacity ? 'OVER CAPACITY' : 'OK',
                                      style: const TextStyle(
                                        color: AppConstants.neutralWhite,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              LinearProgressIndicator(
                                value: occupancyPercent,
                                minHeight: 8,
                                backgroundColor: AppConstants.neutralGray,
                                valueColor: AlwaysStoppedAnimation(
                                  isOverCapacity
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
                      ),
                    );
                  }).toList(),
                );
              },
            ),
            const SizedBox(height: 24),

            // Active Alerts
            Text(
              'Active Alerts',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            alertsAsync.when(
              loading: () => const LoadingWidget(itemCount: 2),
              error: (_, __) => const SizedBox(),
              data: (alerts) {
                if (alerts.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Text(
                        'No active alerts',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppConstants.darkGray.withOpacity(0.6),
                        ),
                      ),
                    ),
                  );
                }

                return Column(
                  children: alerts.take(3).map((alert) {
                    return Card(
                      color: _getAlertColor(alert.severity).withOpacity(0.1),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            Icon(
                              Icons.warning,
                              color: _getAlertColor(alert.severity),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                alert.message ?? 'Alert',
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                );
              },
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => context.go('/alerts'),
                child: const Text('View All Alerts'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getAlertColor(String? severity) {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return AppConstants.absentRed;
      case 'error':
        return AppConstants.absentRed;
      case 'warning':
        return AppConstants.lateYellow;
      default:
        return AppConstants.unknownGray;
    }
  }

  void _showEmergencyDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Trigger Emergency?'),
        content: const Text(
          'This will send an immediate alert to all staff and emergency contacts. Are you sure?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              SuccessSnackBar.show(context, 'Emergency triggered');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppConstants.absentRed,
            ),
            child: const Text('CONFIRM'),
          ),
        ],
      ),
    );
  }
}
