import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/constants/app_constants.dart';

class LoadingWidget extends StatelessWidget {
  final String? message;
  final int itemCount;

  const LoadingWidget({
    Key? key,
    this.message,
    this.itemCount = 5,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        children: List.generate(
          itemCount,
          (index) => Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: _buildShimmerItem(),
          ),
        ),
      ),
    );
  }

  Widget _buildShimmerItem() {
    return Shimmer.fromColors(
      baseColor: AppConstants.neutralGray,
      highlightColor: AppConstants.neutralWhite,
      child: Container(
        height: 100,
        decoration: BoxDecoration(
          color: AppConstants.neutralWhite,
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}

class LoadingCard extends StatelessWidget {
  final double height;
  final double? width;

  const LoadingCard({
    Key? key,
    this.height = 100,
    this.width,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppConstants.neutralGray,
      highlightColor: AppConstants.neutralWhite,
      child: Container(
        height: height,
        width: width ?? double.infinity,
        decoration: BoxDecoration(
          color: AppConstants.neutralWhite,
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}

class SkeletonLoader extends StatelessWidget {
  final int lineCount;
  final double lineHeight;
  final EdgeInsets padding;

  const SkeletonLoader({
    Key? key,
    this.lineCount = 3,
    this.lineHeight = 12,
    this.padding = const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppConstants.neutralGray,
      highlightColor: AppConstants.neutralWhite,
      child: Padding(
        padding: padding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: List.generate(
            lineCount,
            (index) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Container(
                height: lineHeight,
                width: index == lineCount - 1 ? MediaQuery.of(context).size.width * 0.6 : double.infinity,
                decoration: BoxDecoration(
                  color: AppConstants.neutralWhite,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
