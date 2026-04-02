import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/device_provider.dart';
import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../../../shared/widgets/error_widget.dart';
import '../../../shared/widgets/status_badge.dart';

class DevicesListScreen extends ConsumerStatefulWidget {
  const DevicesListScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<DevicesListScreen> createState() => _DevicesListScreenState();
}

class _DevicesListScreenState extends ConsumerState<DevicesListScreen> {
  String _selectedStatus = 'all';

  @override
  Widget build(BuildContext context) {
    final devicesAsync = ref.watch(devicesListProvider);

    return AppScaffold(
      title: 'Devices',
      body: Column(
        children: [
          // Filter Bar
          Container(
            padding: const EdgeInsets.all(16),
            color: AppConstants.neutralGray,
            child: Row(
              children: [
                Expanded(
                  child: Wrap(
                    spacing: 8,
                    children: ['All', 'Online', 'Offline', 'Error']
                        .map((status) => FilterChip(
                          label: Text(status),
                          selected: _selectedStatus == status.toLowerCase(),
                          onSelected: (_) {
                            setState(() {
                              _selectedStatus = status.toLowerCase();
                            });
                            if (status != 'All') {
                              ref.read(devicesListProvider.notifier).filterByStatus(
                                _selectedStatus,
                              );
                            } else {
                              ref.read(devicesListProvider.notifier).refreshDevices();
                            }
                          },
                        ))
                        .toList(),
                  ),
                ),
              ],
            ),
          ),

          // List
          Expanded(
            child: devicesAsync.when(
              loading: () => const LoadingWidget(),
              error: (error, stack) => ErrorStateWidget(
                message: error.toString(),
                onRetry: () {
                  ref.invalidate(devicesListProvider);
                },
              ),
              data: (devices) {
                if (devices.isEmpty) {
                  return EmptyStateWidget(
                    title: 'No Devices Found',
                    subtitle: 'No NFC reader devices are configured yet',
                    icon: Icons.router,
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: devices.length,
                  itemBuilder: (context, index) {
                    final device = devices[index];
                    return _buildDeviceCard(context, device);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceCard(BuildContext context, dynamic device) {
    return GestureDetector(
      onTap: () => context.go('/devices/${device.id}'),
      child: Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: Padding(
          padding: const EdgeInsets.all(12),
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
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Room: ${device.roomId ?? 'Unknown'}',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppConstants.darkGray.withOpacity(0.6),
                          ),
                        ),
                      ],
                    ),
                  ),
                  StatusBadge(status: device.status ?? 'unknown'),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(
                    Icons.access_time,
                    size: 16,
                    color: AppConstants.darkGray.withOpacity(0.6),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Last: ${device.lastHeartbeat?.toString().split(' ')[1].split('.')[0] ?? 'Never'}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppConstants.darkGray.withOpacity(0.6),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Icon(
                    Icons.signal_cellular_alt,
                    size: 16,
                    color: AppConstants.darkGray.withOpacity(0.6),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Reads: ${device.readCount ?? 0}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppConstants.darkGray.withOpacity(0.6),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
