import 'package:freezed_annotation/freezed_annotation.dart';

part 'daily_report.freezed.dart';
part 'daily_report.g.dart';

@freezed
class DailyReport with _$DailyReport {
  const factory DailyReport({
    required String id,
    required DateTime date,
    required int totalStudents,
    required int presentCount,
    required int absentCount,
    required int lateCount,
    double? attendancePercentage,
    int? incidentsCount,
    int? alertsCount,
    String? summary,
    DateTime? createdAt,
  }) = _DailyReport;

  factory DailyReport.fromJson(Map<String, dynamic> json) => _$DailyReportFromJson(json);
}
