import 'package:flutter/material.dart';

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
    return Image.asset(
      'assets/logo.png',
      height: height,
      fit: fit,
      errorBuilder: (context, error, stackTrace) => Image.asset(
        'assets/welcome_back.png',
        height: height,
        fit: fit,
        errorBuilder: (ctx, err, stack) => Icon(
          Icons.delivery_dining_rounded,
          size: height,
          color: const Color(0xFF0B3EDB),
        ),
      ),
    );
  }
}
