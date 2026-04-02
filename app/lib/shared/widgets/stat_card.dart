import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';

class StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color? backgroundColor;
  final Color? iconColor;
  final VoidCallback? onTap;

  const StatCard({
    Key? key,
    required this.label,
    required this.value,
    required this.icon,
    this.backgroundColor,
    this.iconColor,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        color: backgroundColor ?? AppConstants.neutralWhite,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    label,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppConstants.darkGray.withOpacity(0.7),
                    ),
                  ),
                  Icon(
                    icon,
                    color: iconColor ?? AppConstants.primaryBlue,
                    size: 20,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                value,
                style: Theme.of(context).textTheme.displaySmall?.copyWith(
                  color: AppConstants.primaryBlue,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class StatCardRow extends StatelessWidget {
  final List<({String label, String value, IconData icon, Color? backgroundColor, Color? iconColor})>
      stats;

  const StatCardRow({
    Key? key,
    required this.stats,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: stats
          .map((stat) => StatCard(
            label: stat.label,
            value: stat.value,
            icon: stat.icon,
            backgroundColor: stat.backgroundColor,
            iconColor: stat.iconColor,
          ))
          .toList(),
    );
  }
}
