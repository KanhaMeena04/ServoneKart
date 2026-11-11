import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class WelcomeBackLogo extends StatelessWidget {
  final double height;
  final BoxFit fit;

  const WelcomeBackLogo({
    super.key,
    this.height = 70,
    this.fit = BoxFit.contain,
  });

  @override
  Widget build(BuildContext context) {
    final titleSize = (height * 0.38).clamp(20.0, 32.0);
    final subSize = (height * 0.17).clamp(10.0, 14.0);

    return FittedBox(
      fit: fit,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF248C70).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              'TRICELYN PARTNER HUB',
              style: GoogleFonts.poppins(
                fontSize: subSize,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF248C70),
                letterSpacing: 1.6,
              ),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Welcome Back',
            style: GoogleFonts.poppins(
              fontSize: titleSize,
              fontWeight: FontWeight.w900,
              color: const Color(0xFF0F172A),
              letterSpacing: -0.6,
              height: 1.1,
            ),
          ),
        ],
      ),
    );
  }
}
