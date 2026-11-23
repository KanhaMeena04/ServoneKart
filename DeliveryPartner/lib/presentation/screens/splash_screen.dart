import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:vegbox_driver_app/presentation/screens/home/driver_home_screen.dart';
import 'auth/login_screen.dart';
import '../../../data/services/auth_service.dart';
import '../../../logic/blocs/auth/auth_bloc.dart';
import '../../../logic/blocs/auth/auth_event.dart';
import '../../../logic/blocs/auth/auth_state.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _animationController;
  late AnimationController _pulseController;
  
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _textSlideAnimation;

  bool _animationCompleted = false;
  bool _hasNavigated = false;
  AuthState? _pendingState;

  @override
  void initState() {
    super.initState();
    
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    );

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.7, curve: Curves.elasticOut),
      ),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.5, 1.0, curve: Curves.easeIn),
      ),
    );

    _textSlideAnimation = Tween<Offset>(begin: const Offset(0, 0.5), end: Offset.zero).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.5, 1.0, curve: Curves.easeOutCubic),
      ),
    );

    _animationController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        if (mounted && !_hasNavigated) {
          _animationCompleted = true;
          _navigateIfReady();
        }
      }
    });

    // Safety timeout: Maximum 2.2 seconds
    Future.delayed(const Duration(milliseconds: 2200), () {
      if (mounted && !_hasNavigated) {
        _animationCompleted = true;
        _navigateIfReady();
      }
    });

    _animationController.forward();

    // Check authentication status
    context.read<AuthBloc>().add(const CheckAuthStatus());
  }

  void _navigateIfReady() async {
    if (_hasNavigated || !mounted) return;
    if (_animationCompleted) {
      _hasNavigated = true;
      final state = _pendingState ?? context.read<AuthBloc>().state;
      if (state is Authenticated) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const DriverHomeScreen()),
        );
      } else {
        if (!mounted) return;
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => const LoginScreen(),
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        _pendingState = state;
        _navigateIfReady();
      },
      child: Scaffold(
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
            child: AnimatedBuilder(
              animation: _animationController,
              builder: (context, child) {
                return Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ScaleTransition(
                      scale: _scaleAnimation,
                      child: AnimatedBuilder(
                        animation: _pulseController,
                        builder: (context, child) {
                          return Stack(
                            alignment: Alignment.center,
                            children: [
                              // Outer Pulse Glow
                              Transform.scale(
                                scale: 1.0 + (_pulseController.value * 0.4),
                                child: Container(
                                  width: 170,
                                  height: 170,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: const Color(0xFF0145F2).withValues(alpha: 0.2),
                                  ),
                                ),
                              ),
                              // Inner Pulse
                              Transform.scale(
                                scale: 1.0 + (_pulseController.value * 0.2),
                                child: Container(
                                  width: 150,
                                  height: 150,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: const Color(0xFF0D5AA6).withValues(alpha: 0.35),
                                  ),
                                ),
                              ),
                              // Main Logo Card (Glassmorphic)
                              Container(
                                width: 130,
                                height: 130,
                                padding: const EdgeInsets.all(18),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFF0145F2).withValues(alpha: 0.4),
                                      blurRadius: 36,
                                      spreadRadius: 6,
                                    ),
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.25),
                                      blurRadius: 15,
                                      offset: const Offset(0, 8),
                                    ),
                                  ],
                                ),
                                child: Image.asset(
                                  'assets/logo.png',
                                  fit: BoxFit.contain,
                                  errorBuilder: (context, error, stackTrace) => const Icon(
                                    Icons.two_wheeler_rounded,
                                    size: 72,
                                    color: Color(0xFF0145F2),
                                  ),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 42),
                    SlideTransition(
                      position: _textSlideAnimation,
                      child: FadeTransition(
                        opacity: _fadeAnimation,
                        child: Column(
                          children: [
                            Text(
                              'TRICELYN RIDER',
                              style: GoogleFonts.poppins(
                                fontSize: 28,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                                letterSpacing: 3.0,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                              ),
                              child: Text(
                                'Ride · Earn · Express Fleet in Minutes',
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: const Color(0xFF93C5FD),
                                  letterSpacing: 0.8,
                                ),
                              ),
                            ),
                            const SizedBox(height: 48),
                            _DotLoadingIndicator(),
                          ],
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}

class _DotLoadingIndicator extends StatefulWidget {
  @override
  _DotLoadingIndicatorState createState() => _DotLoadingIndicatorState();
}

class _DotLoadingIndicatorState extends State<_DotLoadingIndicator> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Widget _buildDot(int index, Color color) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        // Calculate a sine wave based offset for each dot to make it bounce
        final double offset = (index * 0.2);
        final double t = (_controller.value - offset) % 1.0;
        final double y = (math.sin(t * math.pi * 2) * -8.0).clamp(-8.0, 8.0); // bounce height

        return Transform.translate(
          offset: Offset(0, y < 0 ? y : 0),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 6),
            width: 14,
            height: 14,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: color.withValues(alpha: 0.3),
                  blurRadius: 6,
                  offset: const Offset(0, 4),
                )
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 24, // Give it some height for the bounce
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildDot(0, Colors.white),
          _buildDot(1, const Color(0xFF60A5FA)), // Light Blue
          _buildDot(2, const Color(0xFF0145F2)), // Vivid Blue
        ],
      ),
    );
  }
}
