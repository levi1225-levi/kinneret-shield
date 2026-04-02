import 'package:freezed_annotation/freezed_annotation.dart';

part 'invite_code.freezed.dart';
part 'invite_code.g.dart';

@freezed
class InviteCode with _$InviteCode {
  const factory InviteCode({
    required String id,
    required String code,
    required String role,
    String? createdBy,
    int? usageLimit,
    int? usageCount,
    bool? isActive,
    DateTime? expiresAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _InviteCode;

  factory InviteCode.fromJson(Map<String, dynamic> json) => _$InviteCodeFromJson(json);
}
