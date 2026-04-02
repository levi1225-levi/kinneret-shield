import 'package:freezed_annotation/freezed_annotation.dart';

part 'attendance_record.freezed.dart';
part 'attendance_record.g.dart';

@freezed
class AttendanceRecord with _$AttendanceRecord {
  const factory AttendanceRecord({
    required String id,
    required String studentId,
    required String roomId,
    required String status,
    String? deviceId,
    String? nfcCardId,
    DateTime? checkInTime,
    DateTime? checkOutTime,
    String? notes,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _AttendanceRecord;

  factory AttendanceRecord.fromJson(Map<String, dynamic> json) =>
      _$AttendanceRecordFromJson(json);
}
