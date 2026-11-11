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
    final h = height ?? 32.0;
    final iconSize = (h * 0.72).clamp(16.0, 34.0);
    final titleSize = (h * 0.56).clamp(13.0, 24.0);
    final badgeSize = (h * 0.30).clamp(8.0, 12.0);

    return FittedBox(
      fit: fit,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(5),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0055FF), Color(0xFF00B4D8)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              Icons.shopping_basket_rounded,
              color: Colors.white,
              size: iconSize,
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'TRICELYN',
                style: GoogleFonts.poppins(
                  fontSize: titleSize,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF0F172A),
                  letterSpacing: 1.0,
                  height: 1.0,
                ),
              ),
              Text(
                'PARTNER',
                style: GoogleFonts.poppins(
                  fontSize: badgeSize,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF248C70),
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
