import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/room_provider.dart';
import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';

class RoomDetailScreen extends ConsumerWidget {
  final String roomId;

  const RoomDetailScreen({
    Key? key,
    required this.roomId,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final roomAsync = ref.watch(roomDetailProvider(roomId));
    final occupancyAsync = ref.watch(roomOccupancyProvider(roomId));

    return AppScaffold(
      title: 'Room Details',
      body: roomAsync.when(
        loading: () => const LoadingWidget(),
        error: (error, stack) => ErrorStateWidget(
          message: error.toString(),
          onRetry: () {
            ref.invalidate(roomDetailProvider(roomId));
          },
        ),
        data: (room) {
          if (room == null) {
            return ErrorStateWidget(
              message: 'Room not found',
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    room.name ?? 'Room',
                                    style: Theme.of(context).textTheme.displaySmall?.copyWith(
                                      color: AppConstants.primaryBlue,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    '${room.building ?? 'Building'} - Floor ${room.floor ?? 0}',
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: AppConstants.darkGray.withOpacity(0.6),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Icon(
                              Icons.meeting_room,
                              size: 48,
                              color: AppConstants.primaryBlue,
                            ),
                          ],
                        ),
                        if (room.description != null) ...[
                          const SizedBox(height: 16),
                          Text(
                            room.description!,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Occupancy Card
                Card(
                  color: AppConstants.primaryBlue.withOpacity(0.05),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Current Occupancy',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 16),
                        occupancyAsync.when(
                          loading: () => const LoadingWidget(),
                          error: (_, __) => Text(
                            'Unable to load occupancy',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          data: (occupancy) {
                            final capacity = room.capacity ?? 0;
                            final percent = capacity > 0 ? occupancy / capacity : 0.0;

                            return Column(
                              children: [
                                LinearProgressIndicator(
                                  value: percent.clamp(0.0, 1.0),
                                  minHeight: 12,
                                  backgroundColor: AppConstants.neutralGray,
                                  valueColor: AlwaysStoppedAnimation(
                                    percent > 0.8
                                        ? AppConstants.lateYellow
                                        : AppConstants.presentGreen,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Occupancy Rate',
                                      style: Theme.of(context).textTheme.bodyMedium,
                                    ),
                                    Text(
                                      '${(percent * 100).toStringAsFixed(1)}%',
                                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                        color: percent > 0.8
                                            ? AppConstants.lateYellow
                                            : AppConstants.presentGreen,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            );
                          },
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildStatColumn(
                              context,
                              'Currently',
                              '${room.currentOccupancy ?? 0}',
                              AppConstants.primaryBlue,
                            ),
                            _buildStatColumn(
                              context,
                              'Capacity',
                              '${room.capacity ?? 0}',
                              AppConstants.primaryBlueLight,
                            ),
                            _buildStatColumn(
                              context,
                              'Available',
                              '${(room.capacity ?? 0) - (room.currentOccupancy ?? 0)}',
                              AppConstants.presentGreen,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Details
                Text(
                  'Room Information',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildDetailRow(context, 'Building', room.building ?? 'Unknown'),
                        _buildDetailRow(context, 'Floor', '${room.floor ?? 0}'),
                        _buildDetailRow(context, 'Capacity', '${room.capacity ?? 0} people'),
                        _buildDetailRow(context, 'Primary Device', room.deviceId ?? 'None assigned'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Linked Devices
                if (room.linkedDeviceIds != null && room.linkedDeviceIds!.isNotEmpty) ...[
                  Text(
                    'Linked Devices',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: room.linkedDeviceIds!
                            .map((deviceId) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Row(
                            children: [
                              Icon(
                                Icons.router,
                                color: AppConstants.primaryBlue,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  deviceId,
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                              ),
                              const Icon(Icons.chevron_right),
                            ],
                          ),
                        ))
                            .toList(),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // Actions
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      ref.invalidate(roomDetailProvider(roomId));
                    },
                    icon: const Icon(Icons.refresh),
                    label: const Text('Refresh Data'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatColumn(BuildContext context, String label, String value, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: AppConstants.darkGray.withOpacity(0.6),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: color,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildDetailRow(BuildContext context, String label, String value) {
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
}
