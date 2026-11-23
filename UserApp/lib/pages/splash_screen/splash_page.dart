import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../routes/app_routes.dart';
import '../../providers/user_provider.dart';
import '../../providers/platform_config_provider.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> with SingleTickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;
  Timer? _timer;

  @override
  void initState() {
    super.initState();

    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeIn),
    );

    _fadeController.forward();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<UserProvider>().fetchProfile();
        context.read<PlatformConfigProvider>().refresh();
      }
    });

    _timer = Timer(const Duration(milliseconds: 2200), () {
      if (mounted) {
        _navigate();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _fadeController.dispose();
    super.dispose();
  }

  Future<void> _navigate() async {
    final pref = await SharedPreferences.getInstance();
    final bool onboardDone = pref.getBool('onboardStatus') ?? false;

    if (mounted) {
      if (!onboardDone) {
        context.go(AppRoutes.onboarding);
      } else {
        context.go(AppRoutes.home);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFEFAF9),
      body: Stack(
        fit: StackFit.expand,
        children: [
          const Positioned.fill(
            child: ColoredBox(color: Color(0xFFFEFAF9)),
          ),
          FadeTransition(
            opacity: _fadeAnimation,
            child: Center(
              child: Image.asset(
                'assets/splash_screen.jpg',
                width: double.infinity,
                height: double.infinity,
                fit: BoxFit.cover,
                alignment: Alignment.center,
                errorBuilder: (context, error, stackTrace) => Container(
                  color: const Color(0xFFFEFAF9),
                  child: Center(
                    child: Text(
                      'TRICELYN',
                      style: GoogleFonts.poppins(
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF0145F2),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
