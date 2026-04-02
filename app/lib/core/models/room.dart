import 'package:freezed_annotation/freezed_annotation.dart';

part 'room.freezed.dart';
part 'room.g.dart';

@freezed
class Room with _$Room {
  const factory Room({
    required String id,
    required String name,
    required String building,
    required int floor,
    String? description,
    int? capacity,
    int? currentOccupancy,
    String? deviceId,
    List<String>? linkedDeviceIds,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _Room;

  factory Room.fromJson(Map<String, dynamic> json) => _$RoomFromJson(json);
}
