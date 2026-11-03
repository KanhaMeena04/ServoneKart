import 'package:flutter/material.dart';

class AppColors {
  // Tricelyn Main Brand Palette
  static const Color primaryBlue = Color(0xFF0055FF);  // Primary Blue (#0055FF) - Headings, main brand, buttons
  static const Color accentCyan = Color(0xFF00B4D8);   // Accent Cyan (#00B4D8) - Highlights, CTA, pills
  static const Color darkBlack = Color(0xFF0F172A);    // Dark Slate (#0F172A) - Main text / headings
  static const Color lightBlue = Color(0xFF93C5FD);    // Light Blue (#93C5FD) - Secondary elements / borders
  static const Color lightCyan = Color(0xFF38BDF8);    // Light Cyan (#38BDF8) - Accents
  static const Color offWhite = Color(0xFFF8FAFF);     // Off-White Background (#F8FAFF)
  static const Color cream = Color(0xFFEFF6FF);        // Soft Tint Background (#EFF6FF)

  // Backward compatibility aliases for existing widgets
  static const Color primaryGreen = primaryBlue;
  static const Color accentOrange = accentCyan;
  static const Color lightGreen = lightBlue;
  static const Color lightOrange = lightCyan;

  // Aliases for compatibility
  static const Color primary = primaryBlue;
  static const Color accent = accentCyan;
  static const Color secondary = accentCyan;
  static const Color dark = darkBlack;
  static const Color white = Color(0xFFFFFFFF);

  // UI Mappings
  static const Color background = offWhite;
  static const Color cardBackground = Colors.white;
  static const Color cardAccent = cream;
  static const Color textPrimary = darkBlack;
  static const Color textSecondary = Color(0xFF64748B);
  static const Color border = lightBlue;

  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF0055FF);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryBlue, Color(0xFF0043C7)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [accentCyan, lightCyan],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
