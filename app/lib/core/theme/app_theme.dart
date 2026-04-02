import 'package:flutter/material.dart';
import '../constants/app_constants.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppConstants.primaryBlue,
        brightness: Brightness.light,
        primary: AppConstants.primaryBlue,
        secondary: AppConstants.accentBlue,
        surface: AppConstants.neutralWhite,
        background: AppConstants.neutralGray,
      ),
      scaffoldBackgroundColor: AppConstants.neutralGray,
      appBarTheme: AppBarTheme(
        backgroundColor: AppConstants.primaryBlue,
        foregroundColor: AppConstants.neutralWhite,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: AppConstants.neutralWhite,
        ),
      ),
      cardTheme: CardTheme(
        color: AppConstants.neutralWhite,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppConstants.primaryBlue,
          foregroundColor: AppConstants.neutralWhite,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppConstants.primaryBlue,
          side: const BorderSide(color: AppConstants.primaryBlue),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppConstants.primaryBlue,
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppConstants.neutralGray,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppConstants.primaryBlueLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppConstants.primaryBlueLight, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppConstants.primaryBlue, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppConstants.absentRed),
        ),
        labelStyle: const TextStyle(
          color: AppConstants.darkGray,
          fontSize: 14,
        ),
        hintStyle: TextStyle(
          color: AppConstants.darkGray.withOpacity(0.6),
          fontSize: 14,
        ),
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.w700,
          color: AppConstants.darkGray,
        ),
        displayMedium: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.w700,
          color: AppConstants.darkGray,
        ),
        headlineSmall: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: AppConstants.darkGray,
        ),
        titleLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppConstants.darkGray,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: AppConstants.darkGray,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: AppConstants.darkGray,
        ),
        labelSmall: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: AppConstants.darkGray,
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppConstants.neutralGray,
        selectedColor: AppConstants.primaryBlue,
        labelStyle: const TextStyle(
          fontSize: 14,
          color: AppConstants.darkGray,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
      dividerColor: AppConstants.primaryBlueLight.withOpacity(0.2),
      useMaterial3: true,
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppConstants.primaryBlueLight,
        brightness: Brightness.dark,
        primary: AppConstants.primaryBlueLight,
        secondary: AppConstants.accentBlue,
        surface: Color(0xFF1F2937),
        background: Color(0xFF111827),
      ),
      scaffoldBackgroundColor: Color(0xFF111827),
      appBarTheme: AppBarTheme(
        backgroundColor: AppConstants.primaryBlue,
        foregroundColor: AppConstants.neutralWhite,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: AppConstants.neutralWhite,
        ),
      ),
      cardTheme: CardTheme(
        color: Color(0xFF1F2937),
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      useMaterial3: true,
    );
  }
}
