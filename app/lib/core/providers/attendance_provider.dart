import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/attendance_record.dart';
import '../services/api_service.dart';

final apiServiceProvider = Provider((ref) => ApiService());

final attendanceRecordsProvider =
    StateNotifierProvider<AttendanceRecordsNotifier, AsyncValue<List<AttendanceRecord>>>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return AttendanceRecordsNotifier(apiService);
});

final attendanceDetailProvider =
    StateNotifierProvider.family<AttendanceDetailNotifier, AsyncValue<AttendanceRecord?>,
        String>((ref, recordId) {
  final apiService = ref.watch(apiServiceProvider);
  return AttendanceDetailNotifier(apiService, recordId);
});

final todayAttendanceProvider = FutureProvider<List<AttendanceRecord>>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return apiService.get<List<AttendanceRecord>>(
    '/attendance/today',
    converter: (data) {
      if (data is List) {
        return data
            .cast<Map<String, dynamic>>()
            .map((json) => AttendanceRecord.fromJson(json))
            .toList();
      }
      return [];
    },
  );
});

class AttendanceRecordsNotifier extends StateNotifier<AsyncValue<List<AttendanceRecord>>> {
  final ApiService _apiService;

  AttendanceRecordsNotifier(this._apiService) : super(const AsyncValue.loading()) {
    _loadRecords();
  }

  Future<void> _loadRecords() async {
    state = const AsyncValue.loading();
    try {
      final records = await _apiService.get<List<AttendanceRecord>>(
        '/attendance',
        converter: (data) {
          if (data is List) {
            return data
                .cast<Map<String, dynamic>>()
                .map((json) => AttendanceRecord.fromJson(json))
                .toList();
          }
          return [];
        },
      );
      state = AsyncValue.data(records);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> filterByDate(DateTime date) async {
    state = const AsyncValue.loading();
    try {
      final records = await _apiService.get<List<AttendanceRecord>>(
        '/attendance',
        queryParameters: {'date': date.toIso8601String().split('T')[0]},
        converter: (data) {
          if (data is List) {
            return data
                .cast<Map<String, dynamic>>()
                .map((json) => AttendanceRecord.fromJson(json))
                .toList();
          }
          return [];
        },
      );
      state = AsyncValue.data(records);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> filterByRoom(String roomId) async {
    state = const AsyncValue.loading();
    try {
      final records = await _apiService.get<List<AttendanceRecord>>(
        '/attendance',
        queryParameters: {'roomId': roomId},
        converter: (data) {
          if (data is List) {
            return data
                .cast<Map<String, dynamic>>()
                .map((json) => AttendanceRecord.fromJson(json))
                .toList();
          }
          return [];
        },
      );
      state = AsyncValue.data(records);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> refreshRecords() async {
    await _loadRecords();
  }
}

class AttendanceDetailNotifier extends StateNotifier<AsyncValue<AttendanceRecord?>> {
  final ApiService _apiService;
  final String recordId;

  AttendanceDetailNotifier(this._apiService, this.recordId)
      : super(const AsyncValue.loading()) {
    _loadDetail();
  }

  Future<void> _loadDetail() async {
    state = const AsyncValue.loading();
    try {
      final record = await _apiService.get<AttendanceRecord>(
        '/attendance/$recordId',
        converter: (data) => AttendanceRecord.fromJson(data as Map<String, dynamic>),
      );
      state = AsyncValue.data(record);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}
