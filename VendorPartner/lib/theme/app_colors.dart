import 'package:flutter/material.dart';

class AppColors {
  // Tricelyn Master Brand Color Palette
  static const Color deepNavy = Color(0xFF07162E);       // #07162E Dark background / Primary Dark
  static const Color royalBlue = Color(0xFF0A2B6B);      // #0A2B6B Primary gradient / Primary
  static const Color vividBlue = Color(0xFF0B3EDB);      // #0B3EDB Gradient highlight / Accent
  static const Color highlightBlue = Color(0xFF0D5AA6);  // #0D5AA6 Glow / accent

  // Brand Palette Semantic Tokens
  static const Color primaryBlue = vividBlue;            // Primary CTA & Brand Blue (#0B3EDB)
  static const Color accentCyan = highlightBlue;         // Accent & Glow (#0D5AA6)
  static const Color darkBlack = deepNavy;               // Dark Background & Text (#07162E)
  static const Color lightBlue = Color(0xFF94BEFF);      // Soft tint for borders
  static const Color lightCyan = Color(0xFF5C98FF);      // Soft tint for badges
  static const Color offWhite = Color(0xFFF8FAFF);       // Off-White Background
  static const Color cream = Color(0xFFEFF6FF);          // Soft Tint Background

  // Backward compatibility aliases
  static const Color primaryGreen = vividBlue;
  static const Color accentOrange = highlightBlue;
  static const Color lightGreen = lightBlue;
  static const Color lightOrange = lightCyan;

  // Aliases for compatibility
  static const Color primary = vividBlue;
  static const Color primaryDark = deepNavy;
  static const Color accent = highlightBlue;
  static const Color secondary = royalBlue;
  static const Color dark = deepNavy;
  static const Color white = Color(0xFFFFFFFF);

  // UI Mappings
  static const Color background = offWhite;
  static const Color cardBackground = Colors.white;
  static const Color cardAccent = cream;
  static const Color textPrimary = deepNavy;
  static const Color textSecondary = Color(0xFF64748B);
  static const Color border = Color(0xFFD9E6FF);

  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = vividBlue;

  // Master Brand Linear Gradient: 135deg, #07162E 0%, #0A2B6B 50%, #0B3EDB 100%
  static const LinearGradient brandGradient = LinearGradient(
    colors: [deepNavy, royalBlue, vividBlue],
    stops: [0.0, 0.5, 1.0],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient primaryGradient = brandGradient;

  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [royalBlue, highlightBlue],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
