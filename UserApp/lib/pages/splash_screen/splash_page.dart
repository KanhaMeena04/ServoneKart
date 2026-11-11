import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../routes/app_routes.dart';
import '../../services/auth_service.dart';
import '../../providers/user_provider.dart';
import '../../providers/platform_config_provider.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {

  Timer? _timer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<UserProvider>().fetchProfile();
        context.read<PlatformConfigProvider>().refresh();
      }
    });
    _timer = Timer(const Duration(milliseconds: 1200), () {
      if (mounted) {
        _navigate();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _navigate() async {
    SharedPreferences pref = await SharedPreferences.getInstance();
    bool onboardDone = pref.getBool('onboardStatus') ?? false;

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
    final size = MediaQuery.of(context).size;
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Logo centered in top half
          Positioned(
            top: size.height * 0.2,
            left: 0,
            right: 0,
            child: Center(
              child: Image.asset(
                'assets/logo.png', // Assuming this is the Waseeny logo
                width: 250,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => const SizedBox(),
              ),
            ),
          ),
          // Red curve and food at bottom
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SizedBox(
              height: size.height * 0.55,
              child: Stack(
                clipBehavior: Clip.none,
                alignment: Alignment.bottomCenter,
                children: [
                  // Red semi circle
                  Positioned(
                    bottom: -size.width * 0.2,
                    child: Container(
                      width: size.width * 1.4,
                      height: size.width * 1.4,
                      decoration: const BoxDecoration(
                        color: Color(0xFF248C70), // Teal Green
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                  // Quick-commerce grocery badge in semi-circle
                  Positioned(
                    bottom: 64,
                    left: 24,
                    right: 24,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 84,
                          height: 84,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.16),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.35),
                              width: 1.5,
                            ),
                          ),
                          child: const Icon(
                            Icons.local_grocery_store_rounded,
                            color: Colors.white,
                            size: 42,
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Tricelyn Quick Mart',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.3,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Fresh groceries & daily staples in 10-15 mins',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
