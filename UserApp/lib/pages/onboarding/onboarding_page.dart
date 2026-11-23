import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../routes/app_routes.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _setOnboardStatus();
  }

  void _setOnboardStatus() async {
    final pref = await SharedPreferences.getInstance();
    pref.setBool('onboardStatus', true);
  }

  final List<OnboardingItem> _items = [
    OnboardingItem(
      image: 'assets/onboarding_1.jpg',
      tag: 'HYPERLOCAL EXPRESS',
      title: 'Groceries Delivered in Minutes',
      subtitle:
          'Farm-fresh fruits, vegetables, dairy, snacks & household staples brought straight to your doorstep at lightning speed.',
      accentColor: const Color(0xFF0145F2),
    ),
    OnboardingItem(
      image: 'assets/onboarding_2.jpg',
      tag: 'REAL-TIME DISPATCH',
      title: 'Live 3D GPS Rider Tracking',
      subtitle:
          'Watch your order from dark store packing to rider dispatch with second-by-second live map tracking and accurate arrival countdown.',
      accentColor: const Color(0xFF0145F2),
    ),
    OnboardingItem(
      image: 'assets/onboarding_3.jpg',
      tag: 'TRICELYN PREMIER',
      title: 'VIP Savings & Zero Surge Guarantee',
      subtitle:
          'Save big every day with member-only deals, scheduled early morning delivery slots, and zero surge fees even during peak hours.',
      accentColor: const Color(0xFF0145F2),
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _skip() async {
    final pref = await SharedPreferences.getInstance();
    await pref.setBool('onboardStatus', true);
    if (mounted) {
      context.go(AppRoutes.home);
    }
  }

  void _onNextPressed() async {
    if (_currentPage < _items.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeOutCubic,
      );
    } else {
      final pref = await SharedPreferences.getInstance();
      await pref.setBool('onboardStatus', true);
      if (mounted) {
        context.go(AppRoutes.home);
      }
    }
  }

  Widget _buildStandardHeader(
      Size size, double arcHeight, String imagePath) {
    final double headerHeight = (size.height * 0.36).clamp(245.0, 295.0);

    return SizedBox(
      key: ValueKey<String>('standard_header_$imagePath'),
      width: size.width,
      height: headerHeight,
      child: Stack(
        fit: StackFit.expand,
        children: [
          Container(color: Colors.white),

          // Full-width edge-to-edge header image with smooth organic alpha dissolution
          ShaderMask(
            shaderCallback: (Rect bounds) {
              return const LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.white,
                  Colors.white,
                  Color(0xE6FFFFFF),
                  Color(0x99FFFFFF),
                  Color(0x40FFFFFF),
                  Color(0x10FFFFFF),
                  Colors.transparent,
                ],
                stops: [0.0, 0.42, 0.58, 0.72, 0.84, 0.94, 1.0],
              ).createShader(bounds);
            },
            blendMode: BlendMode.dstIn,
            child: Image.asset(
              imagePath,
              fit: BoxFit.cover,
              alignment: const Alignment(0, -0.20),
              width: size.width,
              height: headerHeight,
              errorBuilder: (_, __, ___) => Container(
                color: const Color(0xFFEBF3FE),
                child: const Center(
                  child: Icon(
                    Icons.shopping_basket_rounded,
                    size: 64,
                    color: Color(0xFF0145F2),
                  ),
                ),
              ),
            ),
          ),

          // Ultra-Smooth Continuous White Gradient Overlay (Zero Lines)
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0x00FFFFFF),
                    Color(0x00FFFFFF),
                    Color(0x1AFFFFFF),
                    Color(0x4DFFFFFF),
                    Color(0x99FFFFFF),
                    Color(0xE6FFFFFF),
                    Color(0xFFFFFFFF),
                    Color(0xFFFAF3EC),
                  ],
                  stops: [0.0, 0.35, 0.50, 0.65, 0.78, 0.88, 0.95, 1.0],
                ),
              ),
            ),
          ),

          // Top subtle gradient for status bar & skip button contrast
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: 44,
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.08),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Standard Layout for Slide 1 & Slide 2 ──
  Widget _buildSlideStandard(BuildContext context, Size size, double arcHeight,
      OnboardingItem item, int index) {
    return Column(
      children: [
        _buildStandardHeader(size, arcHeight, item.image),

        const SizedBox(height: 10),

        Expanded(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 26),
              child: Column(
                children: [
                  const SizedBox(height: 6),

                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 15, vertical: 5.5),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0145F2).withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: const Color(0xFF0145F2).withValues(alpha: 0.22),
                      ),
                    ),
                    child: Text(
                      item.tag,
                      style: GoogleFonts.poppins(
                        color: const Color(0xFF0145F2),
                        fontSize: 11.5,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),

                  const SizedBox(height: 14),

                  Text(
                    item.title,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.poppins(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF0A1931),
                      height: 1.25,
                      letterSpacing: -0.3,
                    ),
                  ),

                  const SizedBox(height: 12),

                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    child: Text(
                      item.subtitle,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        color: const Color(0xFF64748B),
                        height: 1.5,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),

        Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 36),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  _items.length,
                  (dotIndex) => AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    margin: const EdgeInsets.symmetric(horizontal: 4.5),
                    height: 6.5,
                    width: _currentPage == dotIndex ? 24 : 6.5,
                    decoration: BoxDecoration(
                      color: _currentPage == dotIndex
                          ? const Color(0xFF0145F2)
                          : const Color(0xFFCBD5E1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 18),

              Center(
                child: Container(
                  height: 52,
                  width: (size.width * 0.74).clamp(250.0, 300.0),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0145F2), Color(0xFF0038D1)],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0145F2).withValues(alpha: 0.35),
                        blurRadius: 18,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: _onNextPressed,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(28),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          index == 0 ? 'Continue' : 'Next',
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            letterSpacing: 0.3,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Icon(
                          Icons.arrow_forward_rounded,
                          color: Colors.white,
                          size: 19,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ── Custom Layout for Slide 3 (Matching Reference Screenshot ss2 & ss3) ──
  Widget _buildSlide3(BuildContext context, Size size, OnboardingItem item) {
    return Container(
      width: size.width,
      height: size.height,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF0D55FF),
            Color(0xFF0145F2),
            Color(0xFF0038D1),
          ],
          stops: [0.0, 0.45, 1.0],
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              const SizedBox(height: 24),

              // 1. Official Tricelyn Brand Logo in Pure White (No White Box, Transparent Background)
              Image.asset(
                'assets/tricelyn_logo_white.png',
                height: (size.height * 0.065).clamp(48.0, 62.0),
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) => ColorFiltered(
                  colorFilter: const ColorFilter.mode(
                    Colors.white,
                    BlendMode.srcIn,
                  ),
                  child: Image.asset(
                    'assets/logo.png',
                    height: 50,
                    fit: BoxFit.contain,
                  ),
                ),
              ),

              const SizedBox(height: 10),

              // 2. Tagline (matching ss1)
              Text(
                'Everything You Actually Want',
                style: GoogleFonts.poppins(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w600,
                  color: Colors.white.withValues(alpha: 0.95),
                  letterSpacing: 0.3,
                ),
              ),

              // 3. Center Hero Graphic: 3D generated grocery bag from ss3
              Expanded(
                child: Center(
                  child: Container(
                    constraints: BoxConstraints(
                      maxHeight: (size.height * 0.44).clamp(260.0, 390.0),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(32),
                      child: ShaderMask(
                        shaderCallback: (Rect bounds) {
                          return const RadialGradient(
                            radius: 0.92,
                            colors: [
                              Colors.white,
                              Colors.white,
                              Color(0xD9FFFFFF),
                              Colors.transparent,
                            ],
                            stops: [0.0, 0.68, 0.88, 1.0],
                          ).createShader(bounds);
                        },
                        blendMode: BlendMode.dstIn,
                        child: Image.asset(
                          'assets/onboarding_grocery_bag.png',
                          fit: BoxFit.contain,
                          errorBuilder: (_, __, ___) => Image.asset(
                            'assets/grocery_bottom.png',
                            fit: BoxFit.contain,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),

              // 4. Bottom White Pill Button: "Get Started  →"
              Padding(
                padding: const EdgeInsets.only(bottom: 36),
                child: Container(
                  height: 56,
                  width: (size.width * 0.86).clamp(280.0, 360.0),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(32),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.16),
                        blurRadius: 18,
                        offset: const Offset(0, 8),
                      ),
                      BoxShadow(
                        color: const Color(0xFF0038D1).withValues(alpha: 0.30),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: _onNextPressed,
                      borderRadius: BorderRadius.circular(32),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Get Started',
                            style: GoogleFonts.poppins(
                              fontSize: 16.5,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF0145F2),
                              letterSpacing: 0.2,
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Icon(
                            Icons.arrow_forward_rounded,
                            color: Color(0xFF0145F2),
                            size: 21,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final double arcHeight = (size.height * 0.32).clamp(210.0, 260.0);

    return Scaffold(
      body: AnnotatedRegion<SystemUiOverlayStyle>(
        value: SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness:
              _currentPage == 2 ? Brightness.light : Brightness.dark,
          statusBarBrightness:
              _currentPage == 2 ? Brightness.dark : Brightness.light,
        ),
        child: Stack(
          children: [
            // Background for Slide 1 & 2 (Cream Texture)
            Positioned.fill(
              child: AnimatedOpacity(
                opacity: _currentPage == 2 ? 0.0 : 1.0,
                duration: const Duration(milliseconds: 250),
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Color(0xFFFFFDF9),
                        Color(0xFFFAF3EC),
                        Color(0xFFF6EDE2),
                      ],
                    ),
                  ),
                  child: CustomPaint(
                    painter: CreamTexturePainter(),
                  ),
                ),
              ),
            ),

            // PageView across all slides
            PageView.builder(
              controller: _pageController,
              onPageChanged: (page) =>
                  setState(() => _currentPage = page),
              itemCount: _items.length,
              itemBuilder: (context, index) {
                if (index == 2) {
                  return _buildSlide3(context, size, _items[2]);
                }
                return SafeArea(
                  child: _buildSlideStandard(
                      context, size, arcHeight, _items[index], index),
                );
              },
            ),

            // Top-Right Skip Button (hidden on final screen)
            if (_currentPage < 2)
              SafeArea(
                child: Align(
                  alignment: Alignment.topRight,
                  child: Padding(
                    padding: const EdgeInsets.only(top: 14, right: 18),
                    child: GestureDetector(
                      onTap: _skip,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.92),
                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.06),
                              blurRadius: 10,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Text(
                          'Skip',
                          style: GoogleFonts.poppins(
                            color: const Color(0xFF334155),
                            fontWeight: FontWeight.w700,
                            fontSize: 12.5,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class OnboardingItem {
  final String image;
  final String tag;
  final String title;
  final String subtitle;
  final Color accentColor;

  OnboardingItem({
    required this.image,
    required this.tag,
    required this.title,
    required this.subtitle,
    required this.accentColor,
  });
}

class CreamTexturePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    final paint1 = Paint()
      ..color = const Color(0xFFF7E8D8).withValues(alpha: 0.50)
      ..style = PaintingStyle.fill;

    final path1 = Path()
      ..moveTo(0, h * 0.20)
      ..cubicTo(w * 0.35, h * 0.24, w * 0.65, h * 0.38, w, h * 0.32)
      ..lineTo(w, h * 0.52)
      ..cubicTo(w * 0.65, h * 0.56, w * 0.35, h * 0.40, 0, h * 0.38)
      ..close();
    canvas.drawPath(path1, paint1);

    final paint2 = Paint()
      ..color = const Color(0xFFF2DEC9).withValues(alpha: 0.42)
      ..style = PaintingStyle.fill;

    final path2 = Path()
      ..moveTo(0, h * 0.48)
      ..cubicTo(w * 0.40, h * 0.52, w * 0.70, h * 0.70, w, h * 0.64)
      ..lineTo(w, h * 0.78)
      ..cubicTo(w * 0.65, h * 0.82, w * 0.35, h * 0.66, 0, h * 0.62)
      ..close();
    canvas.drawPath(path2, paint2);

    final paint3 = Paint()
      ..color = const Color(0xFFEBD4BE).withValues(alpha: 0.35)
      ..style = PaintingStyle.fill;

    final path3 = Path()
      ..moveTo(0, h * 0.75)
      ..cubicTo(w * 0.30, h * 0.78, w * 0.70, h * 0.90, w, h * 0.85)
      ..lineTo(w, h)
      ..lineTo(0, h)
      ..close();
    canvas.drawPath(path3, paint3);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
