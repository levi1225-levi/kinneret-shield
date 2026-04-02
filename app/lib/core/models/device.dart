import 'package:freezed_annotation/freezed_annotation.dart';

part 'device.freezed.dart';
part 'device.g.dart';

@freezed
class Device with _$Device {
  const factory Device({
    required String id,
    required String name,
    required String roomId,
    required String status,
    String? firmwareVersion,
    String? hardwareVersion,
    String? macAddress,
    DateTime? lastHeartbeat,
    int? readCount,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _Device;

  factory Device.fromJson(Map<String, dynamic> json) => _$DeviceFromJson(json);
}
