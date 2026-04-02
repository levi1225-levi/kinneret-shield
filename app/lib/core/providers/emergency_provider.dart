import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/emergency_event.dart';
import '../services/api_service.dart';

final emergencyEventsProvider =
    StateNotifierProvider<EmergencyEventsNotifier, AsyncValue<List<EmergencyEvent>>>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return EmergencyEventsNotifier(apiService);
});

final activeEmergencyProvider = FutureProvider<EmergencyEvent?>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  try {
    return await apiService.get<EmergencyEvent?>(
      '/emergency/active',
      converter: (data) {
        if (data == null || data is! Map<String, dynamic>) {
          return null;
        }
        return EmergencyEvent.fromJson(data);
      },
    );
  } catch (e) {
    return null;
  }
});

class EmergencyEventsNotifier extends StateNotifier<AsyncValue<List<EmergencyEvent>>> {
  final ApiService _apiService;

  EmergencyEventsNotifier(this._apiService) : super(const AsyncValue.loading()) {
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    state = const AsyncValue.loading();
    try {
      final events = await _apiService.get<List<EmergencyEvent>>(
        '/emergency/events',
        converter: (data) {
          if (data is List) {
            return data
                .cast<Map<String, dynamic>>()
                .map((json) => EmergencyEvent.fromJson(json))
                .toList();
          }
          return [];
        },
      );
      state = AsyncValue.data(events);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> triggerEmergency(String severity, String description) async {
    try {
      await _apiService.post(
        '/emergency/trigger',
        data: {
          'severity': severity,
          'description': description,
        },
      );
      await _loadEvents();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> resolveEmergency(String eventId) async {
    try {
      await _apiService.put(
        '/emergency/events/$eventId/resolve',
      );
      await _loadEvents();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> refreshEvents() async {
    await _loadEvents();
  }
}
