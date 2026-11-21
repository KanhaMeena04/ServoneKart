import 'dart:ui';
import 'package:flutter/material.dart';
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
      image: 'assets/grocery_header.jpg',
      tag: 'HYPERLOCAL EXPRESS',
      title: 'Groceries Delivered in Minutes',
      subtitle:
          'Farm-fresh fruits, vegetables, dairy, snacks & household staples brought straight to your doorstep at lightning speed.',
      accentColor: const Color(0xFF0055FF),
    ),
    OnboardingItem(
      image: 'assets/onboarding_2.jpg',
      tag: 'REAL-TIME DISPATCH',
      title: 'Live 3D GPS Rider Tracking',
      subtitle:
          'Watch your order from dark store packing to rider dispatch with second-by-second live map tracking and accurate arrival countdown.',
      accentColor: const Color(0xFF0055FF),
    ),
    OnboardingItem(
      image: 'assets/onboarding_3.jpg',
      tag: 'TRICELYN PREMIER',
      title: 'VIP Savings & Zero Surge Guarantee',
      subtitle:
          'Save big every day with member-only deals, scheduled early morning delivery slots, and zero surge fees even during peak hours.',
      accentColor: const Color(0xFF0055FF),
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

  Widget _buildSemiCircleHeader(Size size, double arcHeight) {
    return SizedBox(
      key: const ValueKey<String>('semi_circle_header'),
      width: size.width,
      height: arcHeight + 10,
      child: Stack(
        children: [
          // Clipped Image with White Blur / Soft Glow Blend
          ClipPath(
            clipper: FullWidthSemiCircleClipper(arcHeight: arcHeight),
            child: SizedBox(
              width: size.width,
              height: arcHeight,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Container(color: Colors.white),

                  // Hero Image for Slide 1
                  Image.asset(
                    _items[0].image,
                    fit: BoxFit.cover,
                    width: double.infinity,
                    height: double.infinity,
                    alignment: Alignment.center,
                    errorBuilder: (_, __, ___) => Container(
                      color: const Color(0xFFEBF3FE),
                      child: const Center(
                        child: Icon(
                          Icons.shopping_basket_rounded,
                          size: 64,
                          color: Color(0xFF0055FF),
                        ),
                      ),
                    ),
                  ),

                  // Soft white edge glow / vignette: keeps groceries crystal clear while adding smooth white blur/fade
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: RadialGradient(
                          center: const Alignment(0, 0.1),
                          radius: 0.95,
                          colors: [
                            Colors.transparent,
                            Colors.white.withValues(alpha: 0.05),
                            Colors.white.withValues(alpha: 0.22),
                          ],
                          stops: const [0.60, 0.82, 1.0],
                        ),
                      ),
                    ),
                  ),

                  // Bottom curved edge soft white mist
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 38,
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.white.withValues(alpha: 0.20),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Royal Blue Border Painted ONLY on the Curve (Ultra Thin)
          CustomPaint(
            size: Size(size.width, arcHeight),
            painter: FullWidthSemiCirclePainter(
              arcHeight: arcHeight,
              strokeColor: const Color(0xFF0055FF),
              strokeWidth: 1.0,
            ),
          ),
        ],
      ),
    );
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
          // Pure white base
          Container(color: Colors.white),

          // Full-width edge-to-edge header image with smooth organic alpha dissolution
          ShaderMask(
            shaderCallback: (Rect bounds) {
              return const LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.white, // 100% visible at top
                  Colors.white, // 100% visible down to rider/scooter
                  Color(0xE6FFFFFF), // 90% opacity
                  Color(0x99FFFFFF), // 60% opacity
                  Color(0x40FFFFFF), // 25% opacity
                  Color(0x10FFFFFF), // 6% opacity
                  Colors.transparent, // 0% opacity - completely dissolved at bottom
                ],
                stops: [0.0, 0.42, 0.58, 0.72, 0.84, 0.94, 1.0],
              ).createShader(bounds);
            },
            blendMode: BlendMode.dstIn,
            child: Image.asset(
              imagePath,
              fit: BoxFit.cover,
              alignment: const Alignment(0, -0.25),
              width: size.width,
              height: headerHeight,
              errorBuilder: (_, __, ___) => Container(
                color: const Color(0xFFEBF3FE),
                child: const Center(
                  child: Icon(
                    Icons.delivery_dining_rounded,
                    size: 64,
                    color: Color(0xFF0055FF),
                  ),
                ),
              ),
            ),
          ),

          // ── Ultra-Smooth Continuous White Gradient Overlay (Zero Lines, Zero Edges) ──
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0x00FFFFFF), // completely invisible at top (0%)
                    Color(0x00FFFFFF), // 0% down to 35%
                    Color(0x1AFFFFFF), // 10% soft white haze
                    Color(0x4DFFFFFF), // 30% milky white
                    Color(0x99FFFFFF), // 60% white mist
                    Color(0xE6FFFFFF), // 90% white cloud
                    Color(0xFFFFFFFF), // 100% pure solid white
                    Color(0xFFFAF3EC), // seamlessly matches screen background
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

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final double arcHeight = (size.height * 0.32).clamp(210.0, 260.0);

    return Scaffold(
      body: Container(
        // Warm cream touch background like splash screen
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
        child: Stack(
          children: [
            // ── Splash Screen Style Organic Cream Flowing Wave Texture ──
            Positioned.fill(
              child: CustomPaint(
                painter: CreamTexturePainter(),
              ),
            ),

            SafeArea(
              child: Stack(
                children: [
                  // ── Main Content Area ──
                  Column(
                    children: [
                      // Header Area: Semi-Circle on Slide 1; Clean Rounded Header on Slide 2 & 3
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 350),
                        switchInCurve: Curves.easeOutCubic,
                        switchOutCurve: Curves.easeInCubic,
                        child: _currentPage == 0
                            ? _buildSemiCircleHeader(size, arcHeight)
                            : _buildStandardHeader(
                                size, arcHeight, _items[_currentPage].image),
                      ),

                      SizedBox(height: _currentPage == 0 ? 18 : 10),

                      // Content PageView (Tag, Title, Subtitle)
                      Expanded(
                        child: PageView.builder(
                          controller: _pageController,
                          onPageChanged: (page) =>
                              setState(() => _currentPage = page),
                          itemCount: _items.length,
                          itemBuilder: (context, index) {
                            final item = _items[index];
                            return SingleChildScrollView(
                              physics: const BouncingScrollPhysics(),
                              child: Padding(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 26),
                                child: Column(
                                  children: [
                                    const SizedBox(height: 6),

                                    // Tag Badge
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 15, vertical: 5.5),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF0055FF)
                                            .withValues(alpha: 0.08),
                                        borderRadius: BorderRadius.circular(20),
                                        border: Border.all(
                                          color: const Color(0xFF0055FF)
                                              .withValues(alpha: 0.22),
                                        ),
                                      ),
                                      child: Text(
                                        item.tag,
                                        style: GoogleFonts.poppins(
                                          color: const Color(0xFF0055FF),
                                          fontSize: 11.5,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: 0.8,
                                        ),
                                      ),
                                    ),

                                    const SizedBox(height: 14),

                                    // Main Title
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

                                    // Subtitle
                                    Padding(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 10),
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
                            );
                          },
                        ),
                      ),

                      // ── Bottom Section (Dots + Lifted Prominent Get Started Button) ──
                      Padding(
                        padding: const EdgeInsets.fromLTRB(
                            20, 10, 20, 36), // Lifted up
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // Dots Indicator
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(
                                _items.length,
                                (index) => AnimatedContainer(
                                  duration: const Duration(milliseconds: 300),
                                  margin: const EdgeInsets.symmetric(
                                      horizontal: 4.5),
                                  height: 6.5,
                                  width: _currentPage == index ? 24 : 6.5,
                                  decoration: BoxDecoration(
                                    color: _currentPage == index
                                        ? const Color(0xFF0055FF)
                                        : const Color(0xFFCBD5E1),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: 18),

                            // Prominent, Nicely Sized Get Started Button
                            Center(
                              child: Container(
                                height: 52,
                                width: (size.width * 0.74).clamp(250.0, 300.0),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [
                                      Color(0xFF0052FF),
                                      Color(0xFF0038D1)
                                    ],
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                  ),
                                  borderRadius: BorderRadius.circular(28),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFF0055FF)
                                          .withValues(alpha: 0.35),
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
                                        _currentPage == 0
                                            ? 'Continue'
                                            : (_currentPage == 1
                                                ? 'Next'
                                                : 'Get Started'),
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
                  ),

                  // ── Top-Right Skip Button ──
                  Positioned(
                    top: 14,
                    right: 18,
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
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class FullWidthSemiCircleClipper extends CustomClipper<Path> {
  final double arcHeight;

  FullWidthSemiCircleClipper({required this.arcHeight});

  @override
  Path getClip(Size size) {
    final w = size.width;
    final h = arcHeight;
    final path = Path();
    path.moveTo(0, 0);
    // Smooth semi-circle curve spanning from left (0) to right (w)
    path.cubicTo(0, h * 0.552, w * 0.224, h, w / 2, h);
    path.cubicTo(w * 0.776, h, w, h * 0.552, w, 0);
    path.lineTo(w, 0);
    path.lineTo(0, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant FullWidthSemiCircleClipper oldClipper) =>
      oldClipper.arcHeight != arcHeight;
}

class FullWidthSemiCirclePainter extends CustomPainter {
  final double arcHeight;
  final Color strokeColor;
  final double strokeWidth;

  FullWidthSemiCirclePainter({
    required this.arcHeight,
    required this.strokeColor,
    required this.strokeWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = arcHeight;

    // Build the curve path ONLY (no straight top line)
    final curvePath = Path();
    curvePath.moveTo(0, 0);
    curvePath.cubicTo(0, h * 0.552, w * 0.224, h, w / 2, h);
    curvePath.cubicTo(w * 0.776, h, w, h * 0.552, w, 0);

    // Ek dum thin crisp blue line ONLY on curve
    final strokePaint = Paint()
      ..color = strokeColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;
    canvas.drawPath(curvePath, strokePaint);
  }

  @override
  bool shouldRepaint(covariant FullWidthSemiCirclePainter oldDelegate) =>
      oldDelegate.arcHeight != arcHeight ||
      oldDelegate.strokeColor != strokeColor ||
      oldDelegate.strokeWidth != strokeWidth;
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

    // Organic wavy ribbon 1 - soft warm peach/cream flowing curve
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

    // Organic wavy ribbon 2 - warm cream curve flowing in lower half
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

    // Organic wavy ribbon 3 - soft base contour
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
