import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/alert_provider.dart';
import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../../../shared/widgets/error_widget.dart';

class AlertsScreen extends ConsumerStatefulWidget {
  const AlertsScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends ConsumerState<AlertsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedSeverity = 'all';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final alertsAsync = ref.watch(alertsListProvider);
    final activeAlertsAsync = ref.watch(activeAlertsProvider);

    return AppScaffold(
      title: 'Alerts',
      body: Column(
        children: [
          // Tab Bar
          TabBar(
            controller: _tabController,
            tabs: const [
              Tab(text: 'Active'),
              Tab(text: 'All'),
            ],
          ),

          // Filter Bar
          Container(
            padding: const EdgeInsets.all(16),
            color: AppConstants.neutralGray,
            child: Wrap(
              spacing: 8,
              children: ['All', 'Info', 'Warning', 'Error', 'Critical']
                  .map((severity) => FilterChip(
                    label: Text(severity),
                    selected: _selectedSeverity == severity.toLowerCase(),
                    onSelected: (_) {
                      setState(() {
                        _selectedSeverity = severity.toLowerCase();
                      });
                      if (severity != 'All') {
                        ref.read(alertsListProvider.notifier).filterBySeverity(
                          _selectedSeverity,
                        );
                      } else {
                        ref.read(alertsListProvider.notifier).refreshAlerts();
                      }
                    },
                  ))
                  .toList(),
            ),
          ),

          // Content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // Active Alerts Tab
                activeAlertsAsync.when(
                  loading: () => const LoadingWidget(),
                  error: (error, stack) => ErrorStateWidget(
                    message: error.toString(),
                    onRetry: () {
                      ref.invalidate(activeAlertsProvider);
                    },
                  ),
                  data: (alerts) {
                    if (alerts.isEmpty) {
                      return EmptyStateWidget(
                        title: 'No Active Alerts',
                        subtitle: 'Everything is running smoothly',
                        icon: Icons.check_circle,
                      );
                    }

                    return ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: alerts.length,
                      itemBuilder: (context, index) {
                        final alert = alerts[index];
                        return _buildAlertCard(context, ref, alert);
                      },
                    );
                  },
                ),

                // All Alerts Tab
                alertsAsync.when(
                  loading: () => const LoadingWidget(),
                  error: (error, stack) => ErrorStateWidget(
                    message: error.toString(),
                    onRetry: () {
                      ref.invalidate(alertsListProvider);
                    },
                  ),
                  data: (alerts) {
                    if (alerts.isEmpty) {
                      return EmptyStateWidget(
                        title: 'No Alerts',
                        subtitle: 'No alerts have been recorded',
                        icon: Icons.inbox,
                      );
                    }

                    return ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: alerts.length,
                      itemBuilder: (context, index) {
                        final alert = alerts[index];
                        return _buildAlertCard(context, ref, alert);
                      },
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAlertCard(BuildContext context, WidgetRef ref, dynamic alert) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: _getAlertBackgroundColor(alert.severity),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      _getAlertIcon(alert.severity),
                      color: _getAlertColor(alert.severity),
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Text(
                      alert.severity?.toUpperCase() ?? 'ALERT',
                      style: TextStyle(
                        color: _getAlertColor(alert.severity),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getAlertColor(alert.severity).withOpacity(0.3),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    alert.type ?? 'Unknown',
                    style: TextStyle(
                      color: _getAlertColor(alert.severity),
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              alert.message ?? 'No message',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  alert.createdAt?.toString().split('.')[0] ?? 'Unknown',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppConstants.darkGray.withOpacity(0.6),
                  ),
                ),
                if (!alert.isResolved ?? false)
                  ElevatedButton.icon(
                    onPressed: () {
                      ref.read(alertsListProvider.notifier).resolveAlert(alert.id);
                    },
                    icon: const Icon(Icons.check, size: 16),
                    label: const Text('Resolve'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      backgroundColor: _getAlertColor(alert.severity),
                    ),
                  ),
              ],
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
      case 'info':
        return AppConstants.primaryBlue;
      default:
        return AppConstants.unknownGray;
    }
  }

  Color _getAlertBackgroundColor(String? severity) {
    return _getAlertColor(severity).withOpacity(0.1);
  }

  IconData _getAlertIcon(String? severity) {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'error':
        return Icons.error;
      case 'warning':
        return Icons.warning;
      case 'info':
        return Icons.info;
      default:
        return Icons.notifications;
    }
  }
}
