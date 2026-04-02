import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

enum UserRole {
  @JsonValue('student')
  student,
  @JsonValue('parent')
  parent,
  @JsonValue('teacher')
  teacher,
  @JsonValue('security_guard')
  securityGuard,
  @JsonValue('management')
  management,
}

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String email,
    required String firstName,
    required String lastName,
    required UserRole role,
    String? profilePictureUrl,
    String? studentNumber,
    String? department,
    String? nfcCardId,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
