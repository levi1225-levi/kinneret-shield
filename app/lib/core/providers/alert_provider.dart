import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/alert.dart';
import '../services/api_service.dart';

final alertsListProvider = StateNotifierProvider<AlertsListNotifier, AsyncValue<List<Alert>>>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return AlertsListNotifier(apiService);
});

final unreadAlertsCountProvider = FutureProvider<int>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  try {
    final count = await apiService.get<int>(
      '/alerts/unread/count',
      converter: (data) => data is int ? data : int.tryParse(data.toString()) ?? 0,
    );
    return count;
  } catch (e) {
    return 0;
  }
});

final activeAlertsProvider = FutureProvider<List<Alert>>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  try {
    return await apiService.get<List<Alert>>(
      '/alerts/active',
      converter: (data) {
        if (data is List) {
          return data.cast<Map<String, dynamic>>().map((json) => Alert.fromJson(json)).toList();
        }
        return [];
      },
    );
  } catch (e) {
    return [];
  }
});

class AlertsListNotifier extends StateNotifier<AsyncValue<List<Alert>>> {
  final ApiService _apiService;

  AlertsListNotifier(this._apiService) : super(const AsyncValue.loading()) {
    _loadAlerts();
  }

  Future<void> _loadAlerts() async {
    state = const AsyncValue.loading();
    try {
      final alerts = await _apiService.get<List<Alert>>(
        '/alerts',
        converter: (data) {
          if (data is List) {
            return data.cast<Map<String, dynamic>>().map((json) => Alert.fromJson(json)).toList();
          }
          return [];
        },
      );
      state = AsyncValue.data(alerts);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> filterBySeverity(String severity) async {
    state = const AsyncValue.loading();
    try {
      final alerts = await _apiService.get<List<Alert>>(
        '/alerts',
        queryParameters: {'severity': severity},
        converter: (data) {
          if (data is List) {
            return data.cast<Map<String, dynamic>>().map((json) => Alert.fromJson(json)).toList();
          }
          return [];
        },
      );
      state = AsyncValue.data(alerts);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> resolveAlert(String alertId) async {
    try {
      await _apiService.put(
        '/alerts/$alertId/resolve',
      );
      await _loadAlerts();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> refreshAlerts() async {
    await _loadAlerts();
  }
}
