import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/device_provider.dart';
import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';
import '../../../shared/widgets/status_badge.dart';

class DeviceDetailScreen extends ConsumerWidget {
  final String deviceId;

  const DeviceDetailScreen({
    Key? key,
    required this.deviceId,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deviceAsync = ref.watch(deviceDetailProvider(deviceId));

    return AppScaffold(
      title: 'Device Details',
      body: deviceAsync.when(
        loading: () => const LoadingWidget(),
        error: (error, stack) => ErrorStateWidget(
          message: error.toString(),
          onRetry: () {
            ref.invalidate(deviceDetailProvider(deviceId));
          },
        ),
        data: (device) {
          if (device == null) {
            return ErrorStateWidget(
              message: 'Device not found',
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
                                    device.name ?? 'Device',
                                    style: Theme.of(context).textTheme.displaySmall?.copyWith(
                                      color: AppConstants.primaryBlue,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Room: ${device.roomId ?? 'Unknown'}',
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: AppConstants.darkGray.withOpacity(0.6),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Icon(
                              Icons.router,
                              size: 48,
                              color: AppConstants.primaryBlue,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Status Card
                Card(
                  color: _getStatusColor(device.status).withOpacity(0.05),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Device Status',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: AppConstants.darkGray.withOpacity(0.6),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              device.status?.toUpperCase() ?? 'UNKNOWN',
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                color: _getStatusColor(device.status),
                              ),
                            ),
                          ],
                        ),
                        StatusBadge(status: device.status ?? 'unknown'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Technical Specifications
                Text(
                  'Technical Specifications',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildDetailRow(context, 'Firmware Version', device.firmwareVersion ?? 'Unknown'),
                        _buildDetailRow(context, 'Hardware Version', device.hardwareVersion ?? 'Unknown'),
                        _buildDetailRow(context, 'MAC Address', device.macAddress ?? 'Unknown'),
                        _buildDetailRow(context, 'Total Reads', '${device.readCount ?? 0}'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Last Activity
                Text(
                  'Activity',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildDetailRow(
                          context,
                          'Last Heartbeat',
                          device.lastHeartbeat?.toString() ?? 'Never',
                        ),
                        _buildDetailRow(context, 'Created', device.createdAt?.toString() ?? 'Unknown'),
                        _buildDetailRow(context, 'Updated', device.updatedAt?.toString() ?? 'Unknown'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Record Information
                Text(
                  'Record Information',
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
                        _buildInfoRow(context, 'Device ID', device.id),
                        _buildInfoRow(context, 'Room ID', device.roomId ?? 'Unknown'),
                        _buildInfoRow(context, 'Active', device.isActive == true ? 'Yes' : 'No'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Actions
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      ref.invalidate(deviceDetailProvider(deviceId));
                    },
                    icon: const Icon(Icons.refresh),
                    label: const Text('Refresh Data'),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Configuration opened')),
                      );
                    },
                    icon: const Icon(Icons.settings),
                    label: const Text('Configure Device'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Color _getStatusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'online':
        return AppConstants.presentGreen;
      case 'offline':
        return AppConstants.unknownGray;
      case 'error':
        return AppConstants.absentRed;
      default:
        return AppConstants.darkGray;
    }
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
          Flexible(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppConstants.darkGray.withOpacity(0.6),
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontFamily: 'monospace',
              ),
            ),
          ),
        ],
      ),
    );
  }
}
