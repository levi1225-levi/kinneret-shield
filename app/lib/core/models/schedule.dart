import 'package:freezed_annotation/freezed_annotation.dart';

part 'schedule.freezed.dart';
part 'schedule.g.dart';

@freezed
class Schedule with _$Schedule {
  const factory Schedule({
    required String id,
    required String studentId,
    required String roomId,
    required String day,
    required DateTime startTime,
    required DateTime endTime,
    String? period,
    String? teacherId,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _Schedule;

  factory Schedule.fromJson(Map<String, dynamic> json) => _$ScheduleFromJson(json);
}
