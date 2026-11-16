import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme/app_colors.dart';
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
      image: 'assets/Group 2072750484.jpg',
      tag: 'HYPERLOCAL EXPRESS',
      title: 'Groceries Delivered in Minutes',
      subtitle:
          'Farm-fresh fruits, vegetables, dairy, snacks & household staples brought straight to your doorstep at lightning speed.',
      accentColor: const Color(0xFF0B3EDB),
    ),
    OnboardingItem(
      image: 'assets/onboarding_2.jpg',
      tag: 'REAL-TIME DISPATCH',
      title: 'Live 3D GPS Rider Tracking',
      subtitle:
          'Watch your order from dark store packing to rider dispatch with second-by-second live map tracking and accurate arrival countdown.',
      accentColor: const Color(0xFF0A2B6B),
    ),
    OnboardingItem(
      image: 'assets/onboarding_3.jpg',
      tag: 'TRICELYN PREMIER',
      title: 'VIP Savings & Zero Surge Guarantee',
      subtitle:
          'Save big every day with member-only deals, scheduled early morning delivery slots, and zero surge fees even during peak hours.',
      accentColor: const Color(0xFF07162E),
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
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

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                // Top PageView with Image & Curved Bottom
                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    onPageChanged: (page) => setState(() => _currentPage = page),
                    itemCount: _items.length,
                    itemBuilder: (context, index) {
                      final item = _items[index];
                      return SingleChildScrollView(
                        physics: const BouncingScrollPhysics(),
                        child: Column(
                          children: [
                            // Hero Image Banner
                            Container(
                              height: size.height * 0.48,
                              width: double.infinity,
                              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(32),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF07162E).withValues(alpha: 0.12),
                                    blurRadius: 20,
                                    offset: const Offset(0, 8),
                                  ),
                                ],
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(32),
                                child: Stack(
                                  fit: StackFit.expand,
                                  children: [
                                    Image.asset(
                                      item.image,
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) => Container(
                                        decoration: const BoxDecoration(
                                          gradient: LinearGradient(
                                            colors: [Color(0xFF07162E), Color(0xFF0B3EDB)],
                                          ),
                                        ),
                                        child: const Center(
                                          child: Icon(Icons.shopping_bag_rounded, size: 80, color: Colors.white),
                                        ),
                                      ),
                                    ),
                                    // Gradient overlay for smooth readability
                                    Positioned.fill(
                                      child: Container(
                                        decoration: BoxDecoration(
                                          gradient: LinearGradient(
                                            begin: Alignment.topCenter,
                                            end: Alignment.bottomCenter,
                                            colors: [
                                              Colors.black.withValues(alpha: 0.15),
                                              Colors.transparent,
                                              Colors.black.withValues(alpha: 0.35),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            const SizedBox(height: 20),

                            // Tag Pill
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0B3EDB).withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFF0B3EDB).withValues(alpha: 0.2)),
                              ),
                              child: Text(
                                item.tag,
                                style: GoogleFonts.poppins(
                                  color: const Color(0xFF0B3EDB),
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.8,
                                ),
                              ),
                            ),

                            const SizedBox(height: 14),

                            // Main Title
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 24),
                              child: Text(
                                item.title,
                                textAlign: TextAlign.center,
                                style: GoogleFonts.poppins(
                                  fontSize: 23,
                                  fontWeight: FontWeight.w900,
                                  color: const Color(0xFF07162E),
                                  height: 1.25,
                                  letterSpacing: -0.3,
                                ),
                              ),
                            ),

                            const SizedBox(height: 10),

                            // Subtitle
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 32),
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
                      );
                    },
                  ),
                ),

                // Bottom Section: Dots + Button
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 10, 24, 24),
                  child: Column(
                    children: [
                      // Animated Dots Indicator
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          _items.length,
                          (index) => AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            height: 6,
                            width: _currentPage == index ? 28 : 8,
                            decoration: BoxDecoration(
                              gradient: _currentPage == index
                                  ? const LinearGradient(
                                      colors: [Color(0xFF0A2B6B), Color(0xFF0B3EDB)],
                                    )
                                  : null,
                              color: _currentPage == index ? null : const Color(0xFFCBD5E1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Next / Get Started Gradient Button
                      Container(
                        width: double.infinity,
                        height: 54,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF07162E), Color(0xFF0A2B6B), Color(0xFF0B3EDB)],
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF0B3EDB).withValues(alpha: 0.3),
                              blurRadius: 16,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: ElevatedButton(
                          onPressed: _onNextPressed,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                _currentPage == _items.length - 1 ? 'Start Shopping' : 'Continue',
                                style: GoogleFonts.poppins(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                  letterSpacing: 0.2,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 18),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // Top Right Skip Button
            Positioned(
              top: 16,
              right: 24,
              child: GestureDetector(
                onTap: () async {
                  final pref = await SharedPreferences.getInstance();
                  await pref.setBool('onboardStatus', true);
                  if (context.mounted) {
                    context.go(AppRoutes.home);
                  }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.9),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                  child: Text(
                    'Skip',
                    style: GoogleFonts.poppins(
                      color: const Color(0xFF475569),
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
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
