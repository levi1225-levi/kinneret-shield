import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/room.dart';
import '../services/api_service.dart';

final roomsListProvider = StateNotifierProvider<RoomsListNotifier, AsyncValue<List<Room>>>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return RoomsListNotifier(apiService);
});

final roomDetailProvider = StateNotifierProvider.family<RoomDetailNotifier, AsyncValue<Room?>, String>(
  (ref, roomId) {
    final apiService = ref.watch(apiServiceProvider);
    return RoomDetailNotifier(apiService, roomId);
  },
);

final roomOccupancyProvider = FutureProvider.family<int, String>((ref, roomId) async {
  final apiService = ref.watch(apiServiceProvider);
  try {
    final occupancy = await apiService.get<int>(
      '/rooms/$roomId/occupancy',
      converter: (data) => data is int ? data : int.tryParse(data.toString()) ?? 0,
    );
    return occupancy;
  } catch (e) {
    return 0;
  }
});

class RoomsListNotifier extends StateNotifier<AsyncValue<List<Room>>> {
  final ApiService _apiService;

  RoomsListNotifier(this._apiService) : super(const AsyncValue.loading()) {
    _loadRooms();
  }

  Future<void> _loadRooms() async {
    state = const AsyncValue.loading();
    try {
      final rooms = await _apiService.get<List<Room>>(
        '/rooms',
        converter: (data) {
          if (data is List) {
            return data.cast<Map<String, dynamic>>().map((json) => Room.fromJson(json)).toList();
          }
          return [];
        },
      );
      state = AsyncValue.data(rooms);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> searchRooms(String query) async {
    state = const AsyncValue.loading();
    try {
      final rooms = await _apiService.get<List<Room>>(
        '/rooms',
        queryParameters: {'search': query},
        converter: (data) {
          if (data is List) {
            return data.cast<Map<String, dynamic>>().map((json) => Room.fromJson(json)).toList();
          }
          return [];
        },
      );
      state = AsyncValue.data(rooms);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> refreshRooms() async {
    await _loadRooms();
  }
}

class RoomDetailNotifier extends StateNotifier<AsyncValue<Room?>> {
  final ApiService _apiService;
  final String roomId;

  RoomDetailNotifier(this._apiService, this.roomId) : super(const AsyncValue.loading()) {
    _loadDetail();
  }

  Future<void> _loadDetail() async {
    state = const AsyncValue.loading();
    try {
      final room = await _apiService.get<Room>(
        '/rooms/$roomId',
        converter: (data) => Room.fromJson(data as Map<String, dynamic>),
      );
      state = AsyncValue.data(room);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> refresh() async {
    await _loadDetail();
  }
}
