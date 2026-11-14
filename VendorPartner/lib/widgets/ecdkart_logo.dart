import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Branded Tricelyn Partner logo widget rendered crisply across Web, Android, iOS, and Desktop.
class EcdkartLogo extends StatelessWidget {
  final double? height;
  final double? width;
  final BoxFit fit;

  const EcdkartLogo({
    super.key,
    this.height,
    this.width,
    this.fit = BoxFit.contain,
  });

  @override
  Widget build(BuildContext context) {
    final h = height ?? 36.0;
    final iconBoxSize = (h * 0.95).clamp(24.0, 48.0);
    final titleSize = (h * 0.52).clamp(13.0, 24.0);
    final badgeSize = (h * 0.28).clamp(8.0, 12.0);

    return FittedBox(
      fit: fit,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: iconBoxSize,
            height: iconBoxSize,
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF0B3EDB).withValues(alpha: 0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.asset(
                'assets/images/logo.png',
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) => Container(
                  color: const Color(0xFF0B3EDB),
                  child: const Icon(
                    Icons.storefront_rounded,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'TRICELYN',
                style: GoogleFonts.poppins(
                  fontSize: titleSize,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF07162E),
                  letterSpacing: 1.0,
                  height: 1.0,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'STORE PARTNER',
                style: GoogleFonts.poppins(
                  fontSize: badgeSize,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF0B3EDB),
                  letterSpacing: 2.2,
                  height: 1.15,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
