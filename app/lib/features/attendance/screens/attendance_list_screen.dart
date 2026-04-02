import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/attendance_provider.dart';
import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../../../shared/widgets/error_widget.dart';
import '../../../shared/widgets/status_badge.dart';

class AttendanceListScreen extends ConsumerStatefulWidget {
  const AttendanceListScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<AttendanceListScreen> createState() => _AttendanceListScreenState();
}

class _AttendanceListScreenState extends ConsumerState<AttendanceListScreen> {
  late TextEditingController _searchController;
  String _selectedStatus = 'all';
  DateTime? _selectedDate;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final attendanceAsync = ref.watch(attendanceRecordsProvider);

    return AppScaffold(
      title: 'Attendance Records',
      body: Column(
        children: [
          // Filters
          Container(
            padding: const EdgeInsets.all(16),
            color: AppConstants.neutralGray,
            child: Column(
              spacing: 12,
              children: [
                // Search
                TextFormField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search by room or student...',
                    prefixIcon: const Icon(Icons.search),
                  ),
                  onChanged: (value) {
                    // Implement search
                  },
                ),

                // Filters Row
                Row(
                  children: [
                    Expanded(
                      child: _buildFilterChip(
                        'Status',
                        ['All', 'Present', 'Absent', 'Late'],
                        _selectedStatus,
                        (value) {
                          setState(() {
                            _selectedStatus = value;
                          });
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: _selectedDate ?? DateTime.now(),
                            firstDate: DateTime(2020),
                            lastDate: DateTime.now(),
                          );
                          if (date != null) {
                            setState(() {
                              _selectedDate = date;
                            });
                            ref.read(attendanceRecordsProvider.notifier).filterByDate(date);
                          }
                        },
                        icon: const Icon(Icons.calendar_today),
                        label: Text(
                          _selectedDate == null
                              ? 'Date'
                              : '${_selectedDate!.month}/${_selectedDate!.day}',
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // List
          Expanded(
            child: attendanceAsync.when(
              loading: () => const LoadingWidget(),
              error: (error, stack) => ErrorStateWidget(
                message: error.toString(),
                onRetry: () {
                  ref.invalidate(attendanceRecordsProvider);
                },
              ),
              data: (records) {
                if (records.isEmpty) {
                  return EmptyStateWidget(
                    title: 'No Records Found',
                    subtitle: 'Try adjusting your filters',
                    icon: Icons.filter_list,
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: records.length,
                  itemBuilder: (context, index) {
                    final record = records[index];
                    return GestureDetector(
                      onTap: () => context.go('/attendance/${record.id}'),
                      child: Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              Container(
                                width: 50,
                                height: 50,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: _getStatusColor(record.status).withOpacity(0.1),
                                ),
                                child: Icon(
                                  _getStatusIcon(record.status),
                                  color: _getStatusColor(record.status),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      record.roomId ?? 'Unknown Room',
                                      style: Theme.of(context).textTheme.titleLarge,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      record.checkInTime?.toString().split(' ')[1].split('.')[0] ??
                                          '--:--',
                                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                        color: AppConstants.darkGray.withOpacity(0.6),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              StatusBadge(status: record.status ?? 'unknown'),
                              const SizedBox(width: 8),
                              const Icon(Icons.chevron_right),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(
    String label,
    List<String> options,
    String selected,
    Function(String) onSelected,
  ) {
    return Wrap(
      spacing: 8,
      children: options
          .map((option) => FilterChip(
            label: Text(option),
            selected: selected.toLowerCase() == option.toLowerCase(),
            onSelected: (_) => onSelected(option.toLowerCase()),
          ))
          .toList(),
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

  IconData _getStatusIcon(String? status) {
    switch (status?.toLowerCase()) {
      case 'present':
        return Icons.check_circle;
      case 'absent':
        return Icons.cancel;
      case 'late':
        return Icons.schedule;
      default:
        return Icons.help;
    }
  }
}
