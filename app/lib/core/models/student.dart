import 'package:freezed_annotation/freezed_annotation.dart';

part 'student.freezed.dart';
part 'student.g.dart';

@freezed
class Student with _$Student {
  const factory Student({
    required String id,
    required String userId,
    required String studentNumber,
    String? grade,
    String? homeroom,
    String? parentEmail,
    String? emergencyContact,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _Student;

  factory Student.fromJson(Map<String, dynamic> json) => _$StudentFromJson(json);
}
