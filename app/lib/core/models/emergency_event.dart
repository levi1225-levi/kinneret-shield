import 'package:freezed_annotation/freezed_annotation.dart';

part 'emergency_event.freezed.dart';
part 'emergency_event.g.dart';

@freezed
class EmergencyEvent with _$EmergencyEvent {
  const factory EmergencyEvent({
    required String id,
    required String status,
    required String severity,
    String? description,
    String? location,
    String? initiatedBy,
    int? affectedStudents,
    String? responseTeam,
    DateTime? startTime,
    DateTime? resolvedAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _EmergencyEvent;

  factory EmergencyEvent.fromJson(Map<String, dynamic> json) =>
      _$EmergencyEventFromJson(json);
}
