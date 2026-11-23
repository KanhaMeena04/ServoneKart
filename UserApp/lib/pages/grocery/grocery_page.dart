import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/models/product.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/address_provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/location_provider.dart';
import '../../providers/platform_config_provider.dart';
import '../../providers/theme_provider.dart';
import '../../providers/user_provider.dart';
import '../../routes/app_routes.dart';
import '../../services/grocery_api_service.dart';
import '../../services/notification_api_service.dart';
import '../../services/settings_api_service.dart';
import '../../widgets/safe_image.dart';
import '../category_product/category_products.dart';
import '../category_selection/categories_page.dart';
import '../profile/profile_page.dart';
import '../widgets/product_card.dart';

class GroceryPage extends StatefulWidget {
  final bool isEmbedded;
  final Widget? modeSwitcher;

  const GroceryPage({
    super.key,
    this.isEmbedded = false,
    this.modeSwitcher,
  });

  @override
  State<GroceryPage> createState() => _GroceryPageState();
}

class _GroceryPageState extends State<GroceryPage> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _heroSlides = [];
  List<Map<String, dynamic>> _offerBanners = [];
  List<Map<String, dynamic>> _stores = [];
  List<Map<String, dynamic>> _quickProducts = [];
  List<Map<String, dynamic>> _categoryItems = [
    {'name': 'All', 'slug': 'all'}
  ];
  String _selectedCategorySlug = 'all';
  String _selectedCategoryName = 'All';
  int _heroPageIndex = 0;
  final PageController _heroPageCtrl = PageController();
  final ScrollController _categoryScrollCtrl = ScrollController();
  Timer? _categoryScrollTimer;
  final ScrollController _storeScrollCtrl = ScrollController();
  Timer? _storeScrollTimer;
  final TextEditingController _searchCtrl = TextEditingController();
  String _deliveryTime = 'In minutes';

  Color get primaryGreen => AppColors.primary;

  @override
  void initState() {
    super.initState();
    _fetchGroceryData();
    _startCategoryAutoScroll();
    _startStoreAutoScroll();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        NotificationApiService.refreshUnreadCount();
      }
    });
  }

  void _startCategoryAutoScroll() {
    _categoryScrollTimer?.cancel();
    _categoryScrollTimer = Timer.periodic(const Duration(seconds: 7), (timer) {
      if (!mounted || !_categoryScrollCtrl.hasClients) return;
      final maxScroll = _categoryScrollCtrl.position.maxScrollExtent;
      if (maxScroll <= 0) return;
      final current = _categoryScrollCtrl.offset;
      final target =
          (current + 200.0) >= (maxScroll - 10) ? 0.0 : (current + 200.0);
      _categoryScrollCtrl.animateTo(
        target,
        duration: const Duration(milliseconds: 1000),
        curve: Curves.easeInOutCubic,
      );
    });
  }

  void _startStoreAutoScroll() {
    _storeScrollTimer?.cancel();
    _storeScrollTimer =
        Timer.periodic(const Duration(milliseconds: 3200), (timer) {
      if (!mounted || !_storeScrollCtrl.hasClients) return;
      final maxScroll = _storeScrollCtrl.position.maxScrollExtent;
      if (maxScroll <= 0) return;
      final current = _storeScrollCtrl.offset;
      const cardStep = 307.0;
      final target =
          (current + cardStep) >= (maxScroll - 15) ? 0.0 : (current + cardStep);
      _storeScrollCtrl.animateTo(
        target,
        duration: const Duration(milliseconds: 750),
        curve: Curves.easeInOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _heroPageCtrl.dispose();
    _categoryScrollTimer?.cancel();
    _categoryScrollCtrl.dispose();
    _storeScrollTimer?.cancel();
    _storeScrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchGroceryData() async {
    if (mounted) setState(() => _isLoading = true);
    SettingsApiService.getEstimatedDeliveryTime().then((time) {
      if (mounted && time.isNotEmpty) {
        setState(() {
          _deliveryTime = time.toUpperCase();
        });
      }
    });
    try {
      double? userLat;
      double? userLng;
      try {
        final locP = Provider.of<LocationProvider>(context, listen: false);
        final addrP = Provider.of<AddressProvider>(context, listen: false);
        userLat = addrP.defaultAddress?.latitude ?? locP.lat;
        userLng = addrP.defaultAddress?.longitude ?? locP.lng;
      } catch (_) {}

      final results = await Future.wait([
        GroceryApiService.getBanners(),
        GroceryApiService.getCategories(),
        GroceryApiService.getProducts(limit: 80),
        GroceryApiService.getStores(lat: userLat, lng: userLng),
      ]);

      final bannerData = results[0] as Map<String, dynamic>;
      final rawCats = results[1] as List<Map<String, dynamic>>;
      final rawProds = results[2] as List<Map<String, dynamic>>;
      final rawStores = results[3] as List<Map<String, dynamic>>;

      final cats = <Map<String, dynamic>>[
        {'name': 'All', 'slug': 'all'}
      ];
      for (final c in rawCats) {
        final name = (c['name'] ?? c['title'] ?? '').toString().trim();
        final slug = (c['slug'] ??
                name.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-'))
            .toString();
        if (name.isNotEmpty && name.toLowerCase() != 'all') {
          cats.add({...c, 'name': name, 'slug': slug});
        }
      }

      if (mounted) {
        setState(() {
          _heroSlides =
              List<Map<String, dynamic>>.from(bannerData['heroSlides'] ?? []);
          _offerBanners =
              List<Map<String, dynamic>>.from(bannerData['offerBanners'] ?? []);
          _categoryItems = cats;
          _quickProducts = rawProds;
          _stores = rawStores;
        });
      }
    } catch (e) {
      debugPrint('Error fetching grocery data: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _extractCategoryTarget(String? link) {
    if (link == null || link.trim().isEmpty) return 'all';
    final clean = link.trim();
    if (clean.contains('/category/')) {
      return clean.split('/category/').last.replaceAll('/', '').trim();
    }
    return clean;
  }

  void _openBannerTarget(String? link, String? title) {
    final target = _extractCategoryTarget(link);
    if (target == 'all' || target == '/categories' || target == 'categories') {
      setState(() {
        _selectedCategorySlug = 'all';
        _selectedCategoryName = 'All';
      });
      return;
    }
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CategoryProducts(
          cat: target,
          displayTitle: title,
        ),
      ),
    );
  }

  void _openStoreCatalogSheet(Map<String, dynamic> store) {
    final storeId = (store['_id'] ?? store['id'] ?? '').toString();
    final storeName = (store['name'] ?? 'Tricelyn Partner Store').toString();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _StoreCatalogBottomSheet(
        storeId: storeId,
        storeName: storeName,
        initialStore: store,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final cfg = context.watch<PlatformConfigProvider>();
    final cart = context.watch<CartProvider>();
    final addressProvider = context.watch<AddressProvider>();
    final locProvider = context.watch<LocationProvider>();
    final userProvider = context.watch<UserProvider>();

    final defaultAddr = addressProvider.defaultAddress;
    final displayLocation = (defaultAddr?.fullAddress.isNotEmpty == true)
        ? defaultAddr!.fullAddress
        : (locProvider.location != 'Select Location'
            ? locProvider.location
            : 'Select Location');
    final cityLabel =
        (defaultAddr?.city != null && defaultAddr!.city!.isNotEmpty)
            ? defaultAddr.city!
            : (locProvider.location != 'Select Location'
                ? locProvider.location
                : 'Your Area');

    final filteredProducts = _quickProducts.where((p) {
      if (_selectedCategorySlug != 'all') {
        final pSlug = (p['categorySlug'] ??
                (p['category'] is Map ? p['category']['slug'] : '') ??
                '')
            .toString()
            .toLowerCase();
        final pName = (p['categoryName'] ??
                (p['category'] is Map
                    ? p['category']['name']
                    : p['category']) ??
                '')
            .toString()
            .toLowerCase();
        final selSlug = _selectedCategorySlug.toLowerCase();
        final selName = _selectedCategoryName.toLowerCase();
        if (pSlug != selSlug &&
            !pName.contains(selName) &&
            !selName.contains(pName)) {
          return false;
        }
      }
      if (_searchCtrl.text.trim().isNotEmpty) {
        final q = _searchCtrl.text.trim().toLowerCase();
        final name = (p['name'] ?? '').toString().toLowerCase();
        final cat = (p['categoryName'] ?? '').toString().toLowerCase();
        final store = (p['storeName'] ?? '').toString().toLowerCase();
        if (!name.contains(q) && !cat.contains(q) && !store.contains(q))
          return false;
      }
      return true;
    }).toList();

    final rawFilteredStores = _stores.where((s) {
      if (_searchCtrl.text.trim().isEmpty) return true;
      final q = _searchCtrl.text.trim().toLowerCase();
      final name = (s['name'] ?? '').toString().toLowerCase();
      final addr = (s['address'] ?? '').toString().toLowerCase();
      final city = (s['city'] ?? '').toString().toLowerCase();
      final tags = (s['tags'] is List
              ? (s['tags'] as List).join(' ')
              : (s['tags'] ?? ''))
          .toString()
          .toLowerCase();
      return name.contains(q) ||
          addr.contains(q) ||
          city.contains(q) ||
          tags.contains(q);
    }).toList();

    // Landmark coordinates in Indore to compute live distances and location-based shuffle
    const Map<String, List<double>> landmarkCoords = {
      'vijay nagar': [22.7533, 75.8937],
      'scheme 54': [22.7548, 75.8950],
      'palasia': [22.7244, 75.8839],
      'saket': [22.7180, 75.8920],
      'bhawarkua': [22.6926, 75.8676],
      'bhanwarkuan': [22.6926, 75.8676],
      'rajwada': [22.7196, 75.8577],
      'ab road': [22.7350, 75.8880],
      'annapurna': [22.6978, 75.8340],
      'chandan nagar': [22.7100, 75.8200],
      'kanadiya': [22.7180, 75.9200],
      'bicholi': [22.7050, 75.9100],
    };

    double haversineKm(double lat1, double lon1, double lat2, double lon2) {
      const p = 0.017453292519943295;
      final a = 0.5 -
          math.cos((lat2 - lat1) * p) / 2 +
          math.cos(lat1 * p) *
              math.cos(lat2 * p) *
              (1 - math.cos((lon2 - lon1) * p)) /
              2;
      return 12742 * math.asin(math.sqrt(a));
    }

    final locText = displayLocation.toLowerCase();
    double? activeUserLat = defaultAddr?.latitude ?? locProvider.lat;
    double? activeUserLng = defaultAddr?.longitude ?? locProvider.lng;

    // If GPS coordinates not directly available, infer from display location landmark
    if (activeUserLat == null || activeUserLng == null) {
      for (final entry in landmarkCoords.entries) {
        if (locText.contains(entry.key)) {
          activeUserLat = entry.value[0];
          activeUserLng = entry.value[1];
          break;
        }
      }
    }
    // Default fallback center: Indore
    activeUserLat ??= 22.7196;
    activeUserLng ??= 75.8577;

    final filteredStores = rawFilteredStores.map((s) {
      final storeCopy = Map<String, dynamic>.from(s);

      // Determine store coordinates
      double? sLat;
      double? sLng;
      if (storeCopy['location'] is Map &&
          storeCopy['location']['coordinates'] is List &&
          (storeCopy['location']['coordinates'] as List).length >= 2) {
        sLng = ((storeCopy['location']['coordinates'] as List)[0] as num?)
            ?.toDouble();
        sLat = ((storeCopy['location']['coordinates'] as List)[1] as num?)
            ?.toDouble();
      } else if (storeCopy['lat'] != null && storeCopy['lng'] != null) {
        sLat = (storeCopy['lat'] as num?)?.toDouble();
        sLng = (storeCopy['lng'] as num?)?.toDouble();
      }

      if (sLat == null || sLng == null) {
        final sName = (storeCopy['name'] ?? '').toString().toLowerCase();
        final sAddr = (storeCopy['address'] ?? '').toString().toLowerCase();
        for (final entry in landmarkCoords.entries) {
          if (sName.contains(entry.key) || sAddr.contains(entry.key)) {
            sLat = entry.value[0];
            sLng = entry.value[1];
            break;
          }
        }
      }

      double distanceVal = 999.0;
      if (sLat != null &&
          sLng != null &&
          activeUserLat != null &&
          activeUserLng != null) {
        distanceVal = haversineKm(activeUserLat, activeUserLng, sLat, sLng);
      } else if (storeCopy['distanceKm'] is num) {
        distanceVal = (storeCopy['distanceKm'] as num).toDouble();
      }

      // Affinity score if store name or address matches user's location string
      double affinityBonus = 0.0;
      final sName = (storeCopy['name'] ?? '').toString().toLowerCase();
      final sAddr = (storeCopy['address'] ?? '').toString().toLowerCase();
      final words = locText.split(RegExp(r'[, -]+')).where((w) => w.length > 2);
      for (final w in words) {
        if (w == 'indore' || w == 'madhya' || w == 'pradesh' || w == 'india') {
          continue;
        }
        if (sName.contains(w) || sAddr.contains(w)) {
          affinityBonus += 5.0; // Significant boost for exact area match
        }
      }

      storeCopy['calculatedDistanceKm'] = distanceVal;
      storeCopy['effectiveScore'] =
          distanceVal - affinityBonus; // Lower score = ranked first
      storeCopy['displayDistance'] = distanceVal < 990
          ? '${distanceVal.toStringAsFixed(1)} km'
          : (storeCopy['distance'] ?? 'Nearby');

      return storeCopy;
    }).toList();

    // Live shuffle / sort: Closest and highest area-affinity stores appear first
    filteredStores.sort((a, b) {
      final scoreA = (a['effectiveScore'] as num?) ?? 999.0;
      final scoreB = (b['effectiveScore'] as num?) ?? 999.0;
      return scoreA.compareTo(scoreB);
    });

    final primaryGreen = AppColors.primary;
    final firstChar =
        userProvider.name.isNotEmpty ? userProvider.name[0].toUpperCase() : 'U';

    return Scaffold(
      backgroundColor: isDark ? Colors.black : const Color(0xFFF5FAF8),
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: _fetchGroceryData,
            color: primaryGreen,
            child: CustomScrollView(
              slivers: [
                // Top Quick-Commerce Header Bar (Matches ss1 Reference)
                SliverToBoxAdapter(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: isDark
                          ? null
                          : const LinearGradient(
                              colors: [
                                Color(0xFF07162E),
                                Color(0xFF0A2B6B),
                                Color(0xFF0145F2)
                              ],
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                            ),
                      color: isDark ? AppColors.deepNavy : null,
                      borderRadius: const BorderRadius.only(
                        bottomLeft: Radius.circular(22),
                        bottomRight: Radius.circular(22),
                      ),
                    ),
                    padding: const EdgeInsets.fromLTRB(14, 8, 14, 14),
                    child: SafeArea(
                      bottom: false,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              if (!widget.isEmbedded) ...[
                                IconButton(
                                  icon: const Icon(Icons.arrow_back,
                                      color: Colors.white),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(),
                                  onPressed: () =>
                                      Navigator.of(context).maybePop(),
                                ),
                                const SizedBox(width: 8),
                              ],

                              // Tricelyn Brand Logo (Clean White Logo as in ss1)
                              GestureDetector(
                                onTap: () {},
                                child: Image.asset(
                                  'assets/tricelyn_logo_white.png',
                                  height: 26,
                                  fit: BoxFit.contain,
                                  errorBuilder: (_, __, ___) => Image.asset(
                                    'assets/logo.png',
                                    height: 26,
                                    fit: BoxFit.contain,
                                  ),
                                ),
                              ),

                              const SizedBox(width: 12),

                              // Delivery in minutes & Location Dropdown (as in ss1)
                              Expanded(
                                child: GestureDetector(
                                  onTap: () =>
                                      context.push(AppRoutes.locationSetup),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        'Delivery in minutes',
                                        style: GoogleFonts.poppins(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w800,
                                          color: Colors.white,
                                          letterSpacing: -0.2,
                                          height: 1.15,
                                        ),
                                      ),
                                      const SizedBox(height: 1),
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Flexible(
                                            child: Text(
                                              displayLocation.isNotEmpty &&
                                                      displayLocation !=
                                                          'Select Location'
                                                  ? displayLocation
                                                  : 'Indore, Madhya Pradesh',
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: GoogleFonts.poppins(
                                                fontSize: 11,
                                                color: const Color(0xFFDBEAFE),
                                                fontWeight: FontWeight.w500,
                                                height: 1.15,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 2),
                                          const Icon(
                                            Icons.keyboard_arrow_down_rounded,
                                            color: Color(0xFFDBEAFE),
                                            size: 15,
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),

                              if (widget.modeSwitcher != null) ...[
                                widget.modeSwitcher!,
                                const SizedBox(width: 6),
                              ],

                              // Profile Avatar (White circle with bold blue letter as in ss1)
                              GestureDetector(
                                onTap: () => Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                        builder: (_) => const ProfileTab())),
                                child: Container(
                                  width: 32,
                                  height: 32,
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    shape: BoxShape.circle,
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black
                                            .withValues(alpha: 0.12),
                                        blurRadius: 6,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: Center(
                                    child: Text(
                                      firstChar,
                                      style: GoogleFonts.poppins(
                                        color: const Color(0xFF0145F2),
                                        fontWeight: FontWeight.w900,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ),
                              ),

                              const SizedBox(width: 8),

                              // Cart Button (White circle with blue shopping cart as in ss1)
                              GestureDetector(
                                onTap: () => context.push(AppRoutes.cart),
                                child: Stack(
                                  clipBehavior: Clip.none,
                                  children: [
                                    Container(
                                      width: 32,
                                      height: 32,
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        shape: BoxShape.circle,
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black
                                                .withValues(alpha: 0.12),
                                            blurRadius: 6,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                      ),
                                      child: const Center(
                                        child: Icon(
                                          Icons.shopping_cart_outlined,
                                          color: Color(0xFF0145F2),
                                          size: 17,
                                        ),
                                      ),
                                    ),
                                    if (cart.itemCount > 0)
                                      Positioned(
                                        right: -3,
                                        top: -3,
                                        child: Container(
                                          padding: const EdgeInsets.all(3.5),
                                          decoration: const BoxDecoration(
                                            color: Color(0xFFDC2626),
                                            shape: BoxShape.circle,
                                          ),
                                          constraints: const BoxConstraints(
                                              minWidth: 16, minHeight: 16),
                                          child: Center(
                                            child: Text(
                                              '${cart.itemCount}',
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 8.5,
                                                fontWeight: FontWeight.w900,
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

                          const SizedBox(height: 11),

                          // Full-Width Working Search Bar with Find stores button (Point 3)
                          Container(
                            height: 44,
                            decoration: BoxDecoration(
                              color: isDark
                                  ? const Color(0xFF1F2937)
                                  : Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.08),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                const Padding(
                                  padding: EdgeInsets.symmetric(horizontal: 12),
                                  child: Icon(
                                    Icons.search_rounded,
                                    color: Color(0xFF94A3B8),
                                    size: 20,
                                  ),
                                ),
                                Expanded(
                                  child: TextField(
                                    controller: _searchCtrl,
                                    onChanged: (_) => setState(() {}),
                                    style: TextStyle(
                                      color: isDark
                                          ? Colors.white
                                          : const Color(0xFF0F172A),
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                                    decoration: InputDecoration(
                                      hintText:
                                          'Search "milk", "bread", "chips", "paneer"...',
                                      hintStyle: TextStyle(
                                        fontSize: 12.5,
                                        color: isDark
                                            ? Colors.grey[400]
                                            : const Color(0xFF94A3B8),
                                        fontWeight: FontWeight.w400,
                                      ),
                                      border: InputBorder.none,
                                      enabledBorder: InputBorder.none,
                                      focusedBorder: InputBorder.none,
                                      disabledBorder: InputBorder.none,
                                      errorBorder: InputBorder.none,
                                      focusedErrorBorder: InputBorder.none,
                                      filled: false,
                                      fillColor: Colors.transparent,
                                      isDense: true,
                                      contentPadding:
                                          const EdgeInsets.symmetric(
                                              vertical: 11),
                                    ),
                                  ),
                                ),
                                if (_searchCtrl.text.isNotEmpty)
                                  GestureDetector(
                                    onTap: () {
                                      _searchCtrl.clear();
                                      setState(() {});
                                    },
                                    child: const Padding(
                                      padding:
                                          EdgeInsets.symmetric(horizontal: 6),
                                      child: Icon(Icons.clear,
                                          size: 18, color: Colors.grey),
                                    ),
                                  ),
                                Padding(
                                  padding: const EdgeInsets.only(right: 5),
                                  child: GestureDetector(
                                    onTap: () {
                                      FocusScope.of(context).unfocus();
                                      setState(() {});
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 13, vertical: 8),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF0145F2),
                                        borderRadius: BorderRadius.circular(10),
                                        boxShadow: [
                                          BoxShadow(
                                            color: const Color(0xFF0145F2)
                                                .withValues(alpha: 0.35),
                                            blurRadius: 6,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                      ),
                                      child: Text(
                                        'Find stores',
                                        style: GoogleFonts.poppins(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                          letterSpacing: 0.2,
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
                  ),
                ),

                // Store Finder Search Section (Replaced Banner Carousel as requested)
                SliverToBoxAdapter(
                  child: _buildStoreFinderHeroSection(isDark),
                ),

                // Quick-Commerce 4-Col "Shop by Category" Visual Grid (Moved above offers as in Point 4)
                SliverToBoxAdapter(
                  child: _buildQuickCategoryGridSection(isDark),
                ),

                // Dynamic 3-Col / Horizontal Offer Cards from Admin Panel (Moved below categories as in Point 4)
                if (_offerBanners.isNotEmpty)
                  SliverToBoxAdapter(
                    child: _buildOfferCardsSection(isDark),
                  ),

                // Dynamic Categories Chips Row
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 10),
                    child: SizedBox(
                      height: 44,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: _categoryItems.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final cat = _categoryItems[index];
                          final catName = (cat['name'] ?? 'All').toString();
                          final catSlug = (cat['slug'] ?? 'all').toString();
                          final isSelected = catSlug == _selectedCategorySlug;
                          return ChoiceChip(
                            label: Text(
                              catName,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: isSelected
                                    ? FontWeight.bold
                                    : FontWeight.w600,
                                color: isSelected
                                    ? Colors.white
                                    : (isDark
                                        ? Colors.white70
                                        : const Color(0xFF334155)),
                              ),
                            ),
                            selected: isSelected,
                            selectedColor: primaryGreen,
                            backgroundColor:
                                isDark ? const Color(0xFF1F2937) : Colors.white,
                            elevation: isSelected ? 1 : 0,
                            side: BorderSide(
                              color: isSelected
                                  ? primaryGreen
                                  : (isDark
                                      ? Colors.grey[800]!
                                      : const Color(0xFFE2E8F0)),
                              width: 1,
                            ),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                            onSelected: (_) => setState(() {
                              _selectedCategorySlug = catSlug;
                              _selectedCategoryName = catName;
                            }),
                          );
                        },
                      ),
                    ),
                  ),
                ),

                // Section Title
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 18, 16, 10),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _selectedCategoryName == 'All'
                              ? 'Fresh Groceries (${filteredProducts.length})'
                              : '$_selectedCategoryName (${filteredProducts.length})',
                          style: TextStyle(
                            fontSize: 15.5,
                            fontWeight: FontWeight.bold,
                            color:
                                isDark ? Colors.white : const Color(0xFF0F172A),
                          ),
                        ),
                        Text(
                          _deliveryTime.toLowerCase(),
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF16A34A),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Dynamic Products Grid
                if (_isLoading)
                  const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.all(40),
                      child: Center(
                          child: CircularProgressIndicator(
                              color: Color(0xFF16A34A))),
                    ),
                  )
                else if (filteredProducts.isEmpty)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Center(
                        child: Text(
                          'No grocery products found for this filter in $cityLabel.',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                              color: Colors.grey, fontSize: 12.5),
                        ),
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: SliverGrid(
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                        mainAxisExtent: 238,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final item = filteredProducts[index];
                          final prod = GroceryApiService.toProduct(item);
                          final qty = cart.items
                              .where((ci) => ci.product.id == prod.id)
                              .fold<int>(0, (s, ci) => s + ci.quantity);
                          final inStock = item['inStock'] ??
                              ((item['stockQuantity'] ?? 1) > 0);
                          final img = (item['image'] ?? '').toString();

                          return GestureDetector(
                            onTap: () {
                              showModalBottomSheet(
                                context: context,
                                isScrollControlled: true,
                                backgroundColor: Colors.transparent,
                                builder: (_) =>
                                    ProductDetailSheet(product: prod),
                              );
                            },
                            child: Container(
                              decoration: BoxDecoration(
                                color: isDark
                                    ? const Color(0xFF1F2937)
                                    : Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: isDark
                                      ? Colors.grey[800]!
                                      : const Color(0xFFE2E8F0),
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.03),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  ClipRRect(
                                    borderRadius: const BorderRadius.vertical(
                                        top: Radius.circular(15)),
                                    child: Container(
                                      height: 104,
                                      width: double.infinity,
                                      color:
                                          primaryGreen.withValues(alpha: 0.08),
                                      child: img.isNotEmpty
                                          ? SafeImage(
                                              img,
                                              width: double.infinity,
                                              height: 104,
                                              fit: BoxFit.cover,
                                              errorBuilder: (_, __, ___) =>
                                                  Icon(
                                                Icons.shopping_basket_rounded,
                                                size: 40,
                                                color: primaryGreen,
                                              ),
                                            )
                                          : Icon(
                                              Icons.shopping_basket_rounded,
                                              size: 40,
                                              color: primaryGreen,
                                            ),
                                    ),
                                  ),
                                  Expanded(
                                    child: Padding(
                                      padding: const EdgeInsets.all(10),
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            prod.name,
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 12.5,
                                              height: 1.18,
                                              color: isDark
                                                  ? Colors.white
                                                  : Colors.black87,
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            prod.weight ??
                                                prod.unit ??
                                                '1 unit',
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              fontSize: 10.5,
                                              color: isDark
                                                  ? Colors.grey[400]
                                                  : Colors.grey[600],
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                          const Spacer(),
                                          Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: [
                                              Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  Text(
                                                    '₹${prod.price.toInt()}',
                                                    style: TextStyle(
                                                      fontSize: 14,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      color: isDark
                                                          ? Colors.white
                                                          : Colors.black,
                                                    ),
                                                  ),
                                                  if (prod.mrp != null &&
                                                      prod.mrp! > prod.price)
                                                    Text(
                                                      '₹${prod.mrp!.toInt()}',
                                                      style: const TextStyle(
                                                        fontSize: 10,
                                                        color: Colors.grey,
                                                        decoration:
                                                            TextDecoration
                                                                .lineThrough,
                                                      ),
                                                    ),
                                                ],
                                              ),
                                              !inStock
                                                  ? Container(
                                                      padding: const EdgeInsets
                                                          .symmetric(
                                                          horizontal: 6,
                                                          vertical: 4),
                                                      decoration: BoxDecoration(
                                                        color: Colors.grey[200],
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(6),
                                                      ),
                                                      child: const Text(
                                                        'SOLD OUT',
                                                        style: TextStyle(
                                                          fontSize: 8.5,
                                                          color: Colors.red,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                        ),
                                                      ),
                                                    )
                                                  : qty == 0
                                                      ? SizedBox(
                                                          height: 30,
                                                          child: ElevatedButton(
                                                            onPressed: () => cart
                                                                .addGroceryItem(
                                                              prod,
                                                              storeId: prod
                                                                      .storeId ??
                                                                  'store_tricelyn_hub_01',
                                                              storeName: prod
                                                                      .storeName ??
                                                                  '${cfg.appName} Partner Store',
                                                              storeImageUrl:
                                                                  prod.restaurantImageUrl ??
                                                                      '',
                                                            ),
                                                            style:
                                                                ElevatedButton
                                                                    .styleFrom(
                                                              backgroundColor:
                                                                  primaryGreen,
                                                              foregroundColor:
                                                                  Colors.white,
                                                              elevation: 0,
                                                              padding:
                                                                  const EdgeInsets
                                                                      .symmetric(
                                                                      horizontal:
                                                                          14),
                                                              shape:
                                                                  RoundedRectangleBorder(
                                                                borderRadius:
                                                                    BorderRadius
                                                                        .circular(
                                                                            8),
                                                              ),
                                                            ),
                                                            child: const Text(
                                                              'ADD',
                                                              style: TextStyle(
                                                                  fontSize:
                                                                      11.5,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .bold),
                                                            ),
                                                          ),
                                                        )
                                                      : Container(
                                                          height: 30,
                                                          decoration:
                                                              BoxDecoration(
                                                            color: primaryGreen,
                                                            borderRadius:
                                                                BorderRadius
                                                                    .circular(
                                                                        8),
                                                          ),
                                                          child: Row(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .min,
                                                            children: [
                                                              IconButton(
                                                                icon: const Icon(
                                                                    Icons
                                                                        .remove,
                                                                    size: 14,
                                                                    color: Colors
                                                                        .white),
                                                                padding:
                                                                    EdgeInsets
                                                                        .zero,
                                                                constraints:
                                                                    const BoxConstraints(
                                                                        minWidth:
                                                                            26),
                                                                onPressed: () =>
                                                                    cart.updateQuantity(
                                                                        prod.id,
                                                                        qty -
                                                                            1),
                                                              ),
                                                              Text(
                                                                '$qty',
                                                                style:
                                                                    const TextStyle(
                                                                  color: Colors
                                                                      .white,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .bold,
                                                                  fontSize:
                                                                      12.5,
                                                                ),
                                                              ),
                                                              IconButton(
                                                                icon: const Icon(
                                                                    Icons.add,
                                                                    size: 14,
                                                                    color: Colors
                                                                        .white),
                                                                padding:
                                                                    EdgeInsets
                                                                        .zero,
                                                                constraints:
                                                                    const BoxConstraints(
                                                                        minWidth:
                                                                            26),
                                                                onPressed: () =>
                                                                    cart.updateQuantity(
                                                                        prod.id,
                                                                        qty +
                                                                            1),
                                                              ),
                                                            ],
                                                          ),
                                                        ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                        childCount: filteredProducts.length,
                      ),
                    ),
                  ),

                // Partner Grocery Stores Header
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 24, 16, 10),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _searchCtrl.text.isNotEmpty
                              ? 'Partner Stores (${filteredStores.length})'
                              : 'Partner Grocery Stores in $cityLabel',
                          style: TextStyle(
                            fontSize: 15.5,
                            fontWeight: FontWeight.bold,
                            color:
                                isDark ? Colors.white : const Color(0xFF0F172A),
                          ),
                        ),
                        if (_searchCtrl.text.isNotEmpty)
                          GestureDetector(
                            onTap: () => setState(() => _searchCtrl.clear()),
                            child: const Text(
                              'Clear',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0145F2),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),

                // Partner Grocery Stores List (Horizontal single line with smooth scrolling)
                SliverToBoxAdapter(
                  child: filteredStores.isEmpty
                      ? Padding(
                          padding: const EdgeInsets.fromLTRB(28, 16, 28, 100),
                          child: Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.store_mall_directory_outlined,
                                    size: 40, color: Colors.grey),
                                const SizedBox(height: 8),
                                Text(
                                  _searchCtrl.text.isNotEmpty
                                      ? 'No partner stores found matching "${_searchCtrl.text}" in $cityLabel.'
                                      : 'Partner stores in $cityLabel appear here automatically.',
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                      color: Colors.grey, fontSize: 12),
                                ),
                                if (_searchCtrl.text.isNotEmpty) ...[
                                  const SizedBox(height: 10),
                                  TextButton(
                                    onPressed: () =>
                                        setState(() => _searchCtrl.clear()),
                                    child: const Text('Show All Stores'),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        )
                      : Container(
                          height: 106,
                          margin: EdgeInsets.only(
                              bottom: widget.isEmbedded ? 105 : 95),
                          child: ListView.separated(
                            controller: _storeScrollCtrl,
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            physics: const BouncingScrollPhysics(),
                            itemCount: filteredStores.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(width: 12),
                            itemBuilder: (context, index) {
                              final s = filteredStores[index];
                              final img = (s['image'] ?? '').toString();
                              final distStr = (s['displayDistance'] ??
                                      s['distance'] ??
                                      'Nearby')
                                  .toString();

                              return InkWell(
                                onTap: () => _openStoreCatalogSheet(s),
                                borderRadius: BorderRadius.circular(16),
                                child: Container(
                                  width: 295,
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: isDark
                                        ? const Color(0xFF1F2937)
                                        : Colors.white,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: isDark
                                          ? Colors.grey[800]!
                                          : const Color(0xFFE2E8F0),
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.03),
                                        blurRadius: 6,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: Row(
                                    children: [
                                      ClipRRect(
                                        borderRadius:
                                            BorderRadius.circular(12),
                                        child: Container(
                                          width: 65,
                                          height: 65,
                                          color: primaryGreen.withValues(
                                              alpha: 0.1),
                                          child: img.isNotEmpty
                                              ? SafeImage(
                                                  img,
                                                  width: 65,
                                                  height: 65,
                                                  fit: BoxFit.cover,
                                                  errorBuilder:
                                                      (_, __, ___) =>
                                                          const Icon(
                                                    Icons.storefront_rounded,
                                                    color: Color(0xFF0145F2),
                                                    size: 32,
                                                  ),
                                                )
                                              : const Icon(
                                                  Icons.storefront_rounded,
                                                  color: Color(0xFF0145F2),
                                                  size: 32,
                                                ),
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Text(
                                              (s['name'] ??
                                                      '${cfg.appName} Super Mart')
                                                  .toString(),
                                              maxLines: 1,
                                              overflow:
                                                  TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 13.5,
                                                color: isDark
                                                    ? Colors.white
                                                    : Colors.black87,
                                              ),
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              (s['address'] ?? cityLabel)
                                                  .toString(),
                                              maxLines: 1,
                                              overflow:
                                                  TextOverflow.ellipsis,
                                              style: const TextStyle(
                                                  color: Colors.grey,
                                                  fontSize: 11),
                                            ),
                                            const SizedBox(height: 4),
                                            Row(
                                              children: [
                                                Container(
                                                  padding:
                                                      const EdgeInsets.symmetric(
                                                          horizontal: 5,
                                                          vertical: 1.5),
                                                  decoration: BoxDecoration(
                                                    color: Colors.amber[50],
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            4),
                                                  ),
                                                  child: Text(
                                                    '★ ${s['rating'] ?? '4.8'}',
                                                    style: TextStyle(
                                                      color: Colors.amber[800],
                                                      fontSize: 10,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                    ),
                                                  ),
                                                ),
                                                const SizedBox(width: 6),
                                                Flexible(
                                                  child: Text(
                                                    '$distStr • ${s['deliveryTime'] ?? 'Express'}',
                                                    overflow:
                                                        TextOverflow.ellipsis,
                                                    style: TextStyle(
                                                      fontSize: 10.5,
                                                      color: isDark
                                                          ? Colors.grey[400]
                                                          : Colors.black54,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      OutlinedButton(
                                        onPressed: () =>
                                            _openStoreCatalogSheet(s),
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: primaryGreen,
                                          side:
                                              BorderSide(color: primaryGreen),
                                          shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(8)),
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 10, vertical: 5),
                                          minimumSize: const Size(48, 30),
                                        ),
                                        child: const Text(
                                          'Shop',
                                          style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 11.5),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                ),
              ],
            ),
          ),

          // Persistent Multi-Vendor Bottom Cart Bar
          if (cart.itemCount > 0)
            Positioned(
              bottom: widget.isEmbedded ? 18 : 16,
              left: 16,
              right: 16,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: primaryGreen,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: primaryGreen.withValues(alpha: 0.4),
                      blurRadius: 14,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.shopping_bag_rounded,
                          color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            cart.storeCount > 1
                                ? '${cart.itemCount} ITEMS • ${cart.storeCount} STORES'
                                : '${cart.itemCount} ${cart.itemCount == 1 ? 'ITEM' : 'ITEMS'} IN CART',
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            '₹${cart.totalAmount.toStringAsFixed(0)}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () => context.push(AppRoutes.cart),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: primaryGreen,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('View Cart',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 13)),
                          SizedBox(width: 4),
                          Icon(Icons.arrow_forward_rounded, size: 16),
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

  Widget _buildStoreFinderHeroSection(bool isDark) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 6),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF061A3D), Color(0xFF0A2B6B), Color(0xFF07162E)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: const Color(0xFF1E3A8A).withValues(alpha: 0.65),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0145F2).withValues(alpha: 0.22),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: Stack(
          children: [
            // Ambient Radial Glow 1 (Top-Right)
            Positioned(
              top: -40,
              right: -40,
              child: Container(
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF3B82F6).withValues(alpha: 0.16),
                ),
              ),
            ),

            // Ambient Radial Glow 2 (Bottom-Left)
            Positioned(
              bottom: -40,
              left: -30,
              child: Container(
                width: 130,
                height: 130,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF06B6D4).withValues(alpha: 0.12),
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
              child: Text(
                'Groceries in minutes,\nfrom your own supermarket.',
                style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  height: 1.25,
                  letterSpacing: -0.3,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOfferCardsSection(bool isDark) {
    final cards = _offerBanners.take(3).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
          child: Text(
            'Top Grocery Offers',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
        ),
        SizedBox(
          height: 112,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: cards.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (context, idx) {
              final card = cards[idx];
              final badge = (card['badge'] ?? 'DEAL').toString();
              final title = (card['title'] ?? 'Daily Essentials').toString();
              final img = (card['image'] ?? '').toString();
              return GestureDetector(
                onTap: () => _openBannerTarget(card['link']?.toString(), title),
                child: Container(
                  width: 210,
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: idx == 0
                          ? [const Color(0xFF9A3412), const Color(0xFFEA580C)]
                          : idx == 1
                              ? [
                                  const Color(0xFF075985),
                                  const Color(0xFF0284C7)
                                ]
                              : [
                                  const Color(0xFF3730A3),
                                  const Color(0xFF6366F1)
                                ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(5),
                              ),
                              child: Text(
                                badge,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 9,
                                    fontWeight: FontWeight.w900),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12.5,
                                fontWeight: FontWeight.bold,
                                height: 1.15,
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (img.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: SafeImage(
                            img,
                            width: 64,
                            height: 82,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildQuickCategoryGridSection(bool isDark) {
    final displayCats = _categoryItems
        .where((c) => (c['slug'] ?? '') != 'all')
        .take(8)
        .toList();
    if (displayCats.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Shop by Category',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.3,
                  color: isDark ? Colors.white : const Color(0xFF07162E),
                ),
              ),
              GestureDetector(
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CategoriesPage()),
                ),
                child: Row(
                  children: [
                    Text(
                      'See All',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: primaryGreen,
                      ),
                    ),
                    Icon(Icons.chevron_right_rounded,
                        size: 16, color: primaryGreen),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Single-line Circular Horizontal Scroll
          SizedBox(
            height: 96,
            child: ListView.separated(
              controller: _categoryScrollCtrl,
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              itemCount: displayCats.length,
              separatorBuilder: (_, __) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                final cat = displayCats[index];
                final name = (cat['name'] ?? 'Category').toString();
                final slug = (cat['slug'] ?? '').toString();
                final image = (cat['image'] ?? '').toString();
                final isSelected = slug == _selectedCategorySlug;

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      if (_selectedCategorySlug == slug) {
                        _selectedCategorySlug = '';
                        _selectedCategoryName = 'All Groceries';
                      } else {
                        _selectedCategorySlug = slug;
                        _selectedCategoryName = name;
                      }
                    });
                  },
                  child: SizedBox(
                    width: 68,
                    child: Column(
                      children: [
                        Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: isSelected
                                ? const LinearGradient(
                                    colors: [
                                      Color(0xFF07162E),
                                      Color(0xFF0145F2)
                                    ],
                                  )
                                : LinearGradient(
                                    colors: [
                                      isDark
                                          ? const Color(0xFF1E293B)
                                          : const Color(0xFFF1F5F9),
                                      isDark
                                          ? const Color(0xFF0F172A)
                                          : Colors.white,
                                    ],
                                  ),
                            border: Border.all(
                              color: isSelected
                                  ? const Color(0xFF0145F2)
                                  : (isDark
                                      ? Colors.grey[800]!
                                      : const Color(0xFFE2E8F0)),
                              width: isSelected ? 2.2 : 1.2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: isSelected
                                    ? const Color(0xFF0145F2)
                                        .withValues(alpha: 0.3)
                                    : Colors.black.withValues(alpha: 0.04),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          padding: const EdgeInsets.all(9),
                          child: ClipOval(
                            child: image.isNotEmpty
                                ? SafeImage(
                                    image,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Icon(
                                      Icons.fastfood_rounded,
                                      color: isSelected
                                          ? Colors.white
                                          : primaryGreen,
                                      size: 26,
                                    ),
                                  )
                                : Icon(
                                    Icons.fastfood_rounded,
                                    color: isSelected
                                        ? Colors.white
                                        : primaryGreen,
                                    size: 26,
                                  ),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          name,
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight:
                                isSelected ? FontWeight.w800 : FontWeight.w600,
                            color: isSelected
                                ? primaryGreen
                                : (isDark
                                    ? Colors.white70
                                    : const Color(0xFF1E293B)),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _StoreCatalogBottomSheet extends StatefulWidget {
  final String storeId;
  final String storeName;
  final Map<String, dynamic> initialStore;

  const _StoreCatalogBottomSheet({
    required this.storeId,
    required this.storeName,
    required this.initialStore,
  });

  @override
  State<_StoreCatalogBottomSheet> createState() =>
      _StoreCatalogBottomSheetState();
}

class _StoreCatalogBottomSheetState extends State<_StoreCatalogBottomSheet> {
  bool _isLoading = true;
  Map<String, dynamic> _store = {};
  List<Map<String, dynamic>> _catalogSections = [];
  String _selectedSec = 'All';

  @override
  void initState() {
    super.initState();
    _store = widget.initialStore;
    _loadCatalog();
  }

  Future<void> _loadCatalog() async {
    setState(() => _isLoading = true);
    try {
      final data = await GroceryApiService.getStoreCatalog(widget.storeId);
      if (data != null && mounted) {
        setState(() {
          if (data['store'] is Map) {
            _store = Map<String, dynamic>.from(data['store'] as Map);
          }
          _catalogSections = (data['catalog'] as List? ?? [])
              .whereType<Map>()
              .map((e) => Map<String, dynamic>.from(e))
              .toList();
          _isLoading = false;
        });
        return;
      }
    } catch (_) {}
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final cart = context.watch<CartProvider>();
    final primaryGreen = AppColors.primary;
    final sectionTitles = [
      'All',
      ..._catalogSections.map((s) => (s['name'] ?? 'Items').toString())
    ];

    final List<Map<String, dynamic>> visibleProducts = [];
    for (final sec in _catalogSections) {
      final secName = (sec['name'] ?? 'Items').toString();
      if (_selectedSec == 'All' || _selectedSec == secName) {
        final list = sec['products'] as List? ?? [];
        for (final p in list) {
          if (p is Map) visibleProducts.add(Map<String, dynamic>.from(p));
        }
      }
    }

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.55,
      maxChildSize: 0.95,
      builder: (_, controller) {
        return Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF111827) : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              Container(
                margin: const EdgeInsets.symmetric(vertical: 10),
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade400,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 10),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        width: 52,
                        height: 52,
                        color: primaryGreen.withValues(alpha: 0.1),
                        child: (_store['image'] ?? '').toString().isNotEmpty
                            ? SafeImage((_store['image'] ?? '').toString(),
                                fit: BoxFit.cover)
                            : const Icon(Icons.storefront_rounded,
                                color: Color(0xFF16A34A), size: 28),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            (_store['name'] ?? widget.storeName).toString(),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                          Text(
                            '${_store['address'] ?? ''} • ${_store['deliveryTime'] ?? 'In minutes'}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                                fontSize: 11.5, color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),
              if (sectionTitles.length > 1)
                SizedBox(
                  height: 38,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: sectionTitles.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (_, idx) {
                      final title = sectionTitles[idx];
                      final selected = _selectedSec == title;
                      return ChoiceChip(
                        label: Text(
                          title,
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.bold,
                            color: selected
                                ? Colors.white
                                : (isDark ? Colors.white70 : Colors.black87),
                          ),
                        ),
                        selected: selected,
                        selectedColor: primaryGreen,
                        backgroundColor: isDark
                            ? const Color(0xFF1F2937)
                            : Colors.grey.shade100,
                        onSelected: (_) => setState(() => _selectedSec = title),
                      );
                    },
                  ),
                ),
              const SizedBox(height: 8),
              Expanded(
                child: _isLoading
                    ? const Center(
                        child:
                            CircularProgressIndicator(color: Color(0xFF16A34A)))
                    : visibleProducts.isEmpty
                        ? const Center(
                            child: Text('No items in store catalog yet',
                                style: TextStyle(color: Colors.grey)),
                          )
                        : ListView.separated(
                            controller: controller,
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                            itemCount: visibleProducts.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(height: 10),
                            itemBuilder: (_, idx) {
                              final item = visibleProducts[idx];
                              final prod = GroceryApiService.toProduct(item,
                                  fallbackStore: _store);
                              final qty = cart.items
                                  .where((ci) => ci.product.id == prod.id)
                                  .fold<int>(0, (s, ci) => s + ci.quantity);

                              return Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: isDark
                                      ? const Color(0xFF1F2937)
                                      : Colors.grey.shade50,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: isDark
                                        ? Colors.grey[800]!
                                        : const Color(0xFFE5E7EB),
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(10),
                                      child: SafeImage(
                                        prod.image,
                                        width: 64,
                                        height: 64,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            prod.name,
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 13.5,
                                              color: isDark
                                                  ? Colors.white
                                                  : Colors.black87,
                                            ),
                                          ),
                                          Text(
                                            prod.weight ??
                                                prod.unit ??
                                                '1 unit',
                                            style: const TextStyle(
                                                fontSize: 11,
                                                color: Colors.grey),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            '₹${prod.price.toInt()}',
                                            style: TextStyle(
                                              fontWeight: FontWeight.w800,
                                              fontSize: 14,
                                              color: primaryGreen,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    qty == 0
                                        ? ElevatedButton(
                                            onPressed: () =>
                                                cart.addGroceryItem(
                                              prod,
                                              storeId: prod.storeId ??
                                                  widget.storeId,
                                              storeName: prod.storeName ??
                                                  widget.storeName,
                                              storeImageUrl:
                                                  (_store['image'] ?? '')
                                                      .toString(),
                                            ),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: primaryGreen,
                                              foregroundColor: Colors.white,
                                              elevation: 0,
                                              shape: RoundedRectangleBorder(
                                                  borderRadius:
                                                      BorderRadius.circular(8)),
                                            ),
                                            child: const Text('ADD',
                                                style: TextStyle(
                                                    fontWeight:
                                                        FontWeight.bold)),
                                          )
                                        : Container(
                                            decoration: BoxDecoration(
                                              color: primaryGreen,
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                IconButton(
                                                  icon: const Icon(Icons.remove,
                                                      size: 16,
                                                      color: Colors.white),
                                                  constraints:
                                                      const BoxConstraints(
                                                          minWidth: 30),
                                                  padding: EdgeInsets.zero,
                                                  onPressed: () =>
                                                      cart.updateQuantity(
                                                          prod.id, qty - 1),
                                                ),
                                                Text(
                                                  '$qty',
                                                  style: const TextStyle(
                                                      color: Colors.white,
                                                      fontWeight:
                                                          FontWeight.bold),
                                                ),
                                                IconButton(
                                                  icon: const Icon(Icons.add,
                                                      size: 16,
                                                      color: Colors.white),
                                                  constraints:
                                                      const BoxConstraints(
                                                          minWidth: 30),
                                                  padding: EdgeInsets.zero,
                                                  onPressed: () =>
                                                      cart.updateQuantity(
                                                          prod.id, qty + 1),
                                                ),
                                              ],
                                            ),
                                          ),
                                  ],
                                ),
                              );
                            },
                          ),
              ),
              if (cart.itemCount > 0)
                SafeArea(
                  top: false,
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context);
                          context.push(AppRoutes.cart);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryGreen,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Text(
                          'View Cart (${cart.itemCount} items • ₹${cart.totalAmount.toInt()})',
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
