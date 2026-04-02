import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/attendance_provider.dart';
import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/error_widget.dart';
import '../../../shared/widgets/status_badge.dart';

class AttendanceDetailScreen extends ConsumerWidget {
  final String recordId;

  const AttendanceDetailScreen({
    Key? key,
    required this.recordId,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recordAsync = ref.watch(attendanceDetailProvider(recordId));

    return AppScaffold(
      title: 'Attendance Details',
      body: recordAsync.when(
        loading: () => const LoadingWidget(),
        error: (error, stack) => ErrorStateWidget(
          message: error.toString(),
          onRetry: () {
            ref.invalidate(attendanceDetailProvider(recordId));
          },
        ),
        data: (record) {
          if (record == null) {
            return ErrorStateWidget(
              message: 'Record not found',
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Main Card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Attendance Record',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            StatusBadge(status: record.status ?? 'unknown'),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // Details Grid
                        _buildDetailRow(context, 'Room', record.roomId ?? 'Unknown'),
                        _buildDetailRow(context, 'Student', record.studentId ?? 'Unknown'),
                        _buildDetailRow(context, 'Status', record.status ?? 'Unknown'),
                        _buildDetailRow(
                          context,
                          'Check-In Time',
                          record.checkInTime?.toString() ?? 'Not available',
                        ),
                        _buildDetailRow(
                          context,
                          'Check-Out Time',
                          record.checkOutTime?.toString() ?? 'Not available',
                        ),
                        _buildDetailRow(context, 'Device', record.deviceId ?? 'Unknown'),
                        _buildDetailRow(context, 'NFC Card', record.nfcCardId ?? 'Unknown'),
                        if (record.notes != null && record.notes!.isNotEmpty)
                          _buildDetailRow(context, 'Notes', record.notes!),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Info Card
                Card(
                  color: AppConstants.neutralGray,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Record Information',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 16),
                        _buildInfoRow(
                          context,
                          'Record ID',
                          record.id,
                        ),
                        _buildInfoRow(
                          context,
                          'Created',
                          record.createdAt?.toString() ?? 'Unknown',
                        ),
                        _buildInfoRow(
                          context,
                          'Updated',
                          record.updatedAt?.toString() ?? 'Unknown',
                        ),
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
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Record shared')),
                      );
                    },
                    icon: const Icon(Icons.share),
                    label: const Text('Share Record'),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Record exported')),
                      );
                    },
                    icon: const Icon(Icons.download),
                    label: const Text('Export as PDF'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildDetailRow(BuildContext context, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppConstants.darkGray.withOpacity(0.6),
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
              ),
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
