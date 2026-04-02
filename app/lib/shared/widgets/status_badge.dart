import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final TextStyle? textStyle;

  const StatusBadge({
    Key? key,
    required this.status,
    this.textStyle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final (color, label) = _getStatusColor();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color, width: 1),
      ),
      child: Text(
        label,
        style: textStyle ??
            TextStyle(
              color: color,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
      ),
    );
  }

  (Color, String) _getStatusColor() {
    switch (status.toLowerCase()) {
      case 'present':
      case 'online':
      case 'active':
        return (AppConstants.presentGreen, 'Present');
      case 'absent':
      case 'offline':
      case 'inactive':
        return (AppConstants.absentRed, 'Absent');
      case 'late':
        return (AppConstants.lateYellow, 'Late');
      case 'unknown':
      case 'pending':
        return (AppConstants.unknownGray, 'Unknown');
      default:
        return (AppConstants.unknownGray, status);
    }
  }
}
