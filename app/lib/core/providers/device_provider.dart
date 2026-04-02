import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/device.dart';
import '../services/api_service.dart';

final devicesListProvider = StateNotifierProvider<DevicesListNotifier, AsyncValue<List<Device>>>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return DevicesListNotifier(apiService);
});

final deviceDetailProvider =
    StateNotifierProvider.family<DeviceDetailNotifier, AsyncValue<Device?>, String>((ref, deviceId) {
  final apiService = ref.watch(apiServiceProvider);
  return DeviceDetailNotifier(apiService, deviceId);
});

final onlineDevicesCountProvider = FutureProvider<int>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  try {
    final count = await apiService.get<int>(
      '/devices/status/online',
      converter: (data) => data is int ? data : int.tryParse(data.toString()) ?? 0,
    );
    return count;
  } catch (e) {
    return 0;
  }
});

class DevicesListNotifier extends StateNotifier<AsyncValue<List<Device>>> {
  final ApiService _apiService;

  DevicesListNotifier(this._apiService) : super(const AsyncValue.loading()) {
    _loadDevices();
  }

  Future<void> _loadDevices() async {
    state = const AsyncValue.loading();
    try {
      final devices = await _apiService.get<List<Device>>(
        '/devices',
        converter: (data) {
          if (data is List) {
            return data.cast<Map<String, dynamic>>().map((json) => Device.fromJson(json)).toList();
          }
          return [];
        },
      );
      state = AsyncValue.data(devices);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> filterByStatus(String status) async {
    state = const AsyncValue.loading();
    try {
      final devices = await _apiService.get<List<Device>>(
        '/devices',
        queryParameters: {'status': status},
        converter: (data) {
          if (data is List) {
            return data.cast<Map<String, dynamic>>().map((json) => Device.fromJson(json)).toList();
          }
          return [];
        },
      );
      state = AsyncValue.data(devices);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> refreshDevices() async {
    await _loadDevices();
  }
}

class DeviceDetailNotifier extends StateNotifier<AsyncValue<Device?>> {
  final ApiService _apiService;
  final String deviceId;

  DeviceDetailNotifier(this._apiService, this.deviceId) : super(const AsyncValue.loading()) {
    _loadDetail();
  }

  Future<void> _loadDetail() async {
    state = const AsyncValue.loading();
    try {
      final device = await _apiService.get<Device>(
        '/devices/$deviceId',
        converter: (data) => Device.fromJson(data as Map<String, dynamic>),
      );
      state = AsyncValue.data(device);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> refresh() async {
    await _loadDetail();
  }
}
