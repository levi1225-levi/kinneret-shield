import 'package:freezed_annotation/freezed_annotation.dart';

part 'teacher.freezed.dart';
part 'teacher.g.dart';

@freezed
class Teacher with _$Teacher {
  const factory Teacher({
    required String id,
    required String userId,
    required String department,
    List<String>? assignedRooms,
    List<String>? classIds,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _Teacher;

  factory Teacher.fromJson(Map<String, dynamic> json) => _$TeacherFromJson(json);
}
