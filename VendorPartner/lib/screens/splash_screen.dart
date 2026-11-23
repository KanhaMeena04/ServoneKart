import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/platform_config_service.dart';
import 'login_screen.dart';
import 'dashboard_screen.dart';

class SplashScreen extends StatefulWidget {
  final bool hasToken;
  const SplashScreen({super.key, required this.hasToken});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _mainController;
  late AnimationController _particleController;

  late Animation<double> _logoScaleUp;
  late Animation<double> _logoScaleSettle;
  late Animation<double> _logoOpacity;

  late Animation<double> _textOpacity;
  late Animation<double> _textSlideProgress;

  final List<Particle> _particles = [];

  @override
  void initState() {
    super.initState();

    // 1. Core Timeline: 3.0 seconds duration, 60fps ultra smooth
    _mainController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000), 
    );

    _particleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
    );

    _setupAnimations();
    _generateParticles();

    _mainController.forward();
    _particleController.forward();
    PlatformConfigService.fetchSettings();

    // 2. Final Hold: 1 second hold after 3 seconds animation, then transition
    Timer(const Duration(milliseconds: 4000), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            transitionDuration: const Duration(milliseconds: 800),
            pageBuilder: (context, animation, secondaryAnimation) => 
                widget.hasToken ? const DashboardScreen() : const LoginScreen(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return FadeTransition(
                opacity: CurveTween(curve: Curves.easeInOutCubic).animate(animation), 
                child: child,
              );
            },
          ),
        );
      }
    });
  }

  void _setupAnimations() {
    // Logo Scale: 0.90 -> 1.03 (Subtle overshoot)
    _logoScaleUp = Tween<double>(begin: 0.90, end: 1.03).animate(
      CurvedAnimation(
        parent: _mainController,
        curve: const Interval(0.10, 0.50, curve: Curves.easeOutCubic),
      ),
    );

    // Logo Scale Settle: 1.03 -> 1.00
    _logoScaleSettle = Tween<double>(begin: 1.03, end: 1.00).animate(
      CurvedAnimation(
        parent: _mainController,
        curve: const Interval(0.50, 0.80, curve: Curves.easeInOutCubic),
      ),
    );

    // Logo Fade In
    _logoOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainController,
        curve: const Interval(0.10, 0.40, curve: Curves.easeOut),
      ),
    );

    // Text Slide Up (using a 0.0 to 1.0 progress to map to an exact 12px shift)
    _textSlideProgress = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainController,
        curve: const Interval(0.40, 0.85, curve: Curves.easeOutCubic),
      ),
    );

    // Text Fade In
    _textOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainController,
        curve: const Interval(0.45, 0.85, curve: Curves.easeOut),
      ),
    );
  }

  void _generateParticles() {
    final random = math.Random();
    // 16 elegant branded particles for the organic burst
    for (int i = 0; i < 16; i++) {
      // Even spread around the circle + slight randomness
      final angle = (i * math.pi * 2) / 16 + (random.nextDouble() - 0.5) * 0.5;
      
      // Float outward by 40-90 pixels
      final distance = 40.0 + random.nextDouble() * 50.0; 
      
      // Tiny subtle dots (3-6px)
      final size = 3.0 + random.nextDouble() * 3.0; 
      
      // Brand colors: vivid blue & light blue glow
      final color = i % 2 == 0 ? const Color(0xFF0145F2) : const Color(0xFF60A5FA);
      
      _particles.add(Particle(
        angle: angle,
        distance: distance,
        size: size,
        color: color,
        delay: random.nextDouble() * 0.15, // Slight stagger for organic feel
      ));
    }
  }

  @override
  void dispose() {
    _mainController.dispose();
    _particleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF07162E), // Deep Navy
              Color(0xFF0A2B6B), // Royal Blue
              Color(0xFF0145F2), // Vivid Blue
            ],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
            const Spacer(flex: 3),
            SizedBox(
              width: 250,
              height: 250,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // 4. Organic Particle Burst Reveal
                  ..._particles.map((p) {
                    return AnimatedBuilder(
                      animation: _particleController,
                      builder: (context, child) {
                        double progress = (_particleController.value - p.delay) / (1.0 - p.delay);
                        if (progress < 0.0) progress = 0.0;
                        if (progress > 1.0) progress = 1.0;
                        
                        // Ultra smooth ease-out for particle motion
                        final curvedProgress = Curves.easeOutCubic.transform(progress);
                        
                        // Fade in quickly, hold, then fade out softly
                        double opacity = 0.0;
                        if (progress < 0.15) {
                          opacity = progress / 0.15; // Fade in
                        } else {
                          opacity = 1.0 - ((progress - 0.15) / 0.85); // Fade out
                        }
                        
                        // Start near center (20px) and float out
                        final currentDist = 20.0 + (p.distance * curvedProgress);

                        return Positioned(
                          child: Transform.translate(
                            offset: Offset(
                              math.cos(p.angle) * currentDist,
                              math.sin(p.angle) * currentDist,
                            ),
                            child: Opacity(
                              opacity: opacity,
                              child: Container(
                                width: p.size,
                                height: p.size,
                                decoration: BoxDecoration(
                                  color: p.color,
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    );
                  }),
                  
                  // 5. Official Logo (Exactly as uploaded)
                  AnimatedBuilder(
                    animation: _mainController,
                    builder: (context, child) {
                      double scale = _logoScaleUp.value;
                      if (_mainController.value > 0.50) {
                        scale = _logoScaleSettle.value;
                      }
                      return Opacity(
                        opacity: _logoOpacity.value,
                        child: Transform.scale(
                          scale: scale,
                          child: Container(
                            width: 140,
                            height: 140,
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF0145F2).withValues(alpha: 0.45),
                                  blurRadius: 36,
                                  spreadRadius: 6,
                                  offset: const Offset(0, 10),
                                ),
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.25),
                                  blurRadius: 18,
                                  offset: const Offset(0, 6),
                                ),
                              ],
                            ),
                            child: Image.asset(
                              'assets/images/logo.png',
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) => Container(
                                decoration: const BoxDecoration(
                                  color: Color(0xFF0145F2),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.storefront_rounded,
                                  color: Colors.white,
                                  size: 52,
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            
            // App Name & Merchant Partner Badge
            AnimatedBuilder(
              animation: _mainController,
              builder: (context, child) {
                final yOffset = 12.0 * (1.0 - _textSlideProgress.value);
                
                return Transform.translate(
                  offset: Offset(0, yOffset),
                  child: Opacity(
                    opacity: _textOpacity.value,
                    child: Column(
                      children: [
                        Text(
                          'TRICELYN',
                          style: GoogleFonts.poppins(
                            fontSize: 32,
                            fontWeight: FontWeight.w900, 
                            color: Colors.white, 
                            letterSpacing: 3.0,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                          ),
                          child: Text(
                            'MERCHANT & STORE PARTNER',
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF93C5FD),
                              letterSpacing: 2.0,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }
            ),
            const Spacer(flex: 4),
          ],
        ),
      ),
    ),
  );
}
}

// Particle data model for clean generation
class Particle {
  final double angle;
  final double distance;
  final double size;
  final Color color;
  final double delay;

  Particle({
    required this.angle,
    required this.distance,
    required this.size,
    required this.color,
    required this.delay,
  });
}
