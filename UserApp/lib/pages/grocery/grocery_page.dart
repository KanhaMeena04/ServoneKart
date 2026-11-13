import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
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
  final TextEditingController _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchGroceryData();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        NotificationApiService.refreshUnreadCount();
      }
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _heroPageCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchGroceryData() async {
    if (mounted) setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        GroceryApiService.getBanners(),
        GroceryApiService.getCategories(),
        GroceryApiService.getProducts(limit: 80),
        GroceryApiService.getStores(),
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
        final slug = (c['slug'] ?? name.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-')).toString();
        if (name.isNotEmpty && name.toLowerCase() != 'all') {
          cats.add({...c, 'name': name, 'slug': slug});
        }
      }

      if (mounted) {
        setState(() {
          _heroSlides = List<Map<String, dynamic>>.from(bannerData['heroSlides'] ?? []);
          _offerBanners = List<Map<String, dynamic>>.from(bannerData['offerBanners'] ?? []);
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
        : (locProvider.location != 'Select Location' ? locProvider.location : 'Select Location');
    final cityLabel = (defaultAddr?.city != null && defaultAddr!.city!.isNotEmpty)
        ? defaultAddr.city!
        : (locProvider.location != 'Select Location' ? locProvider.location : 'Your Area');

    final filteredProducts = _quickProducts.where((p) {
      if (_selectedCategorySlug != 'all') {
        final pSlug = (p['categorySlug'] ?? (p['category'] is Map ? p['category']['slug'] : '') ?? '').toString().toLowerCase();
        final pName = (p['categoryName'] ?? (p['category'] is Map ? p['category']['name'] : p['category']) ?? '').toString().toLowerCase();
        final selSlug = _selectedCategorySlug.toLowerCase();
        final selName = _selectedCategoryName.toLowerCase();
        if (pSlug != selSlug && !pName.contains(selName) && !selName.contains(pName)) {
          return false;
        }
      }
      if (_searchCtrl.text.trim().isNotEmpty) {
        final q = _searchCtrl.text.trim().toLowerCase();
        final name = (p['name'] ?? '').toString().toLowerCase();
        final cat = (p['categoryName'] ?? '').toString().toLowerCase();
        final store = (p['storeName'] ?? '').toString().toLowerCase();
        if (!name.contains(q) && !cat.contains(q) && !store.contains(q)) return false;
      }
      return true;
    }).toList();

    final primaryGreen = const Color(0xFF16A34A);
    final firstChar = userProvider.name.isNotEmpty ? userProvider.name[0].toUpperCase() : 'U';

    return Scaffold(
      backgroundColor: isDark ? Colors.black : const Color(0xFFF5FAF8),
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: _fetchGroceryData,
            color: primaryGreen,
            child: CustomScrollView(
              slivers: [
                // Top Quick-Commerce Header & Search Bar
                SliverToBoxAdapter(
                  child: Container(
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF064E3B) : primaryGreen,
                      borderRadius: const BorderRadius.only(
                        bottomLeft: Radius.circular(24),
                        bottomRight: Radius.circular(24),
                      ),
                    ),
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                    child: SafeArea(
                      bottom: false,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              if (!widget.isEmbedded) ...[
                                IconButton(
                                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(),
                                  onPressed: () => Navigator.of(context).maybePop(),
                                ),
                                const SizedBox(width: 10),
                              ],
                              Expanded(
                                child: GestureDetector(
                                  onTap: () => context.push(AppRoutes.locationSetup),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.location_on, color: Colors.white, size: 20),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Text(
                                                  '${cfg.appName} Mart',
                                                  style: const TextStyle(
                                                    fontSize: 15,
                                                    fontWeight: FontWeight.w800,
                                                    color: Colors.white,
                                                  ),
                                                ),
                                                const SizedBox(width: 6),
                                                Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                  decoration: BoxDecoration(
                                                    color: Colors.amber[400],
                                                    borderRadius: BorderRadius.circular(6),
                                                  ),
                                                  child: const Text(
                                                    '10-15 MINS',
                                                    style: TextStyle(
                                                      fontSize: 8.5,
                                                      fontWeight: FontWeight.w900,
                                                      color: Colors.black87,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                            Row(
                                              children: [
                                                Flexible(
                                                  child: Text(
                                                    displayLocation,
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                    style: const TextStyle(
                                                      fontSize: 12,
                                                      color: Colors.white70,
                                                      fontWeight: FontWeight.w500,
                                                    ),
                                                  ),
                                                ),
                                                const Icon(Icons.keyboard_arrow_down, color: Colors.white70, size: 16),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              if (widget.modeSwitcher != null) ...[
                                widget.modeSwitcher!,
                                const SizedBox(width: 6),
                              ],
                              // Cart button
                              GestureDetector(
                                onTap: () => context.push(AppRoutes.cart),
                                child: Stack(
                                  clipBehavior: Clip.none,
                                  children: [
                                    Container(
                                      width: 36,
                                      height: 36,
                                      decoration: BoxDecoration(
                                        color: Colors.white.withValues(alpha: 0.18),
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(Icons.shopping_cart_outlined, color: Colors.white, size: 18),
                                    ),
                                    if (cart.itemCount > 0)
                                      Positioned(
                                        right: -2,
                                        top: -2,
                                        child: Container(
                                          padding: const EdgeInsets.all(4),
                                          decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                                          child: Text(
                                            '${cart.itemCount}',
                                            style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              GestureDetector(
                                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileTab())),
                                child: CircleAvatar(
                                  radius: 17,
                                  backgroundColor: Colors.white.withValues(alpha: 0.22),
                                  child: Text(
                                    firstChar,
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          // Live search input
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF1F2937) : Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.06),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.search_rounded, color: primaryGreen),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: TextField(
                                    controller: _searchCtrl,
                                    onChanged: (_) => setState(() {}),
                                    style: TextStyle(color: isDark ? Colors.white : Colors.black, fontSize: 13.5),
                                    decoration: InputDecoration(
                                      hintText: 'Search milk, fruits, veggies, atta, snacks...',
                                      hintStyle: TextStyle(
                                        fontSize: 13,
                                        color: isDark ? Colors.grey[400] : Colors.grey[500],
                                      ),
                                      border: InputBorder.none,
                                    ),
                                  ),
                                ),
                                if (_searchCtrl.text.isNotEmpty)
                                  GestureDetector(
                                    onTap: () {
                                      _searchCtrl.clear();
                                      setState(() {});
                                    },
                                    child: const Icon(Icons.clear, size: 18, color: Colors.grey),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // Dynamic Hero Banner Carousel from Admin Panel
                SliverToBoxAdapter(
                  child: _buildHeroSection(),
                ),

                // Dynamic 3-Col / Horizontal Offer Cards from Admin Panel
                if (_offerBanners.isNotEmpty)
                  SliverToBoxAdapter(
                    child: _buildOfferCardsSection(isDark),
                  ),

                // Quick-Commerce 4-Col "Shop by Category" Visual Grid (Blinkit / Zepto Standard)
                SliverToBoxAdapter(
                  child: _buildQuickCategoryGridSection(isDark),
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
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                                color: isSelected ? Colors.white : (isDark ? Colors.white70 : const Color(0xFF334155)),
                              ),
                            ),
                            selected: isSelected,
                            selectedColor: primaryGreen,
                            backgroundColor: isDark ? const Color(0xFF1F2937) : Colors.white,
                            elevation: isSelected ? 1 : 0,
                            side: BorderSide(
                              color: isSelected ? primaryGreen : (isDark ? Colors.grey[800]! : const Color(0xFFE2E8F0)),
                              width: 1,
                            ),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                          ),
                        ),
                        const Text(
                          '10-15 mins',
                          style: TextStyle(
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
                      child: Center(child: CircularProgressIndicator(color: Color(0xFF16A34A))),
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
                          style: const TextStyle(color: Colors.grey, fontSize: 12.5),
                        ),
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: SliverGrid(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
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
                          final inStock = item['inStock'] ?? ((item['stockQuantity'] ?? 1) > 0);
                          final img = (item['image'] ?? '').toString();

                          return GestureDetector(
                            onTap: () {
                              showModalBottomSheet(
                                context: context,
                                isScrollControlled: true,
                                backgroundColor: Colors.transparent,
                                builder: (_) => ProductDetailSheet(product: prod),
                              );
                            },
                            child: Container(
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF1F2937) : Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: isDark ? Colors.grey[800]! : const Color(0xFFE2E8F0),
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
                                    borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
                                    child: Container(
                                      height: 104,
                                      width: double.infinity,
                                      color: primaryGreen.withValues(alpha: 0.08),
                                      child: img.isNotEmpty
                                          ? SafeImage(
                                              img,
                                              width: double.infinity,
                                              height: 104,
                                              fit: BoxFit.cover,
                                              errorBuilder: (_, __, ___) => const Icon(
                                                Icons.shopping_basket_rounded,
                                                size: 40,
                                                color: Color(0xFF16A34A),
                                              ),
                                            )
                                          : const Icon(
                                              Icons.shopping_basket_rounded,
                                              size: 40,
                                              color: Color(0xFF16A34A),
                                            ),
                                    ),
                                  ),
                                  Expanded(
                                    child: Padding(
                                      padding: const EdgeInsets.all(10),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            prod.name,
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 12.5,
                                              height: 1.18,
                                              color: isDark ? Colors.white : Colors.black87,
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            prod.weight ?? prod.unit ?? '1 unit',
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              fontSize: 10.5,
                                              color: isDark ? Colors.grey[400] : Colors.grey[600],
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                          if (prod.storeName != null && prod.storeName!.isNotEmpty)
                                            Text(
                                              prod.storeName!,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontSize: 9.5,
                                                color: primaryGreen,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          const Spacer(),
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  Text(
                                                    '₹${prod.price.toInt()}',
                                                    style: TextStyle(
                                                      fontSize: 14,
                                                      fontWeight: FontWeight.bold,
                                                      color: isDark ? Colors.white : Colors.black,
                                                    ),
                                                  ),
                                                  if (prod.mrp != null && prod.mrp! > prod.price)
                                                    Text(
                                                      '₹${prod.mrp!.toInt()}',
                                                      style: const TextStyle(
                                                        fontSize: 10,
                                                        color: Colors.grey,
                                                        decoration: TextDecoration.lineThrough,
                                                      ),
                                                    ),
                                                ],
                                              ),
                                              !inStock
                                                  ? Container(
                                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                                      decoration: BoxDecoration(
                                                        color: Colors.grey[200],
                                                        borderRadius: BorderRadius.circular(6),
                                                      ),
                                                      child: const Text(
                                                        'SOLD OUT',
                                                        style: TextStyle(
                                                          fontSize: 8.5,
                                                          color: Colors.red,
                                                          fontWeight: FontWeight.bold,
                                                        ),
                                                      ),
                                                    )
                                                  : qty == 0
                                                      ? SizedBox(
                                                          height: 30,
                                                          child: ElevatedButton(
                                                            onPressed: () => cart.addGroceryItem(
                                                              prod,
                                                              storeId: prod.storeId ?? 'store_tricelyn_indore_01',
                                                              storeName: prod.storeName ?? '${cfg.appName} Partner Store',
                                                              storeImageUrl: prod.restaurantImageUrl ?? '',
                                                            ),
                                                            style: ElevatedButton.styleFrom(
                                                              backgroundColor: primaryGreen,
                                                              foregroundColor: Colors.white,
                                                              elevation: 0,
                                                              padding: const EdgeInsets.symmetric(horizontal: 14),
                                                              shape: RoundedRectangleBorder(
                                                                borderRadius: BorderRadius.circular(8),
                                                              ),
                                                            ),
                                                            child: const Text(
                                                              'ADD',
                                                              style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold),
                                                            ),
                                                          ),
                                                        )
                                                      : Container(
                                                          height: 30,
                                                          decoration: BoxDecoration(
                                                            color: primaryGreen,
                                                            borderRadius: BorderRadius.circular(8),
                                                          ),
                                                          child: Row(
                                                            mainAxisSize: MainAxisSize.min,
                                                            children: [
                                                              IconButton(
                                                                icon: const Icon(Icons.remove, size: 14, color: Colors.white),
                                                                padding: EdgeInsets.zero,
                                                                constraints: const BoxConstraints(minWidth: 26),
                                                                onPressed: () => cart.updateQuantity(prod.id, qty - 1),
                                                              ),
                                                              Text(
                                                                '$qty',
                                                                style: const TextStyle(
                                                                  color: Colors.white,
                                                                  fontWeight: FontWeight.bold,
                                                                  fontSize: 12.5,
                                                                ),
                                                              ),
                                                              IconButton(
                                                                icon: const Icon(Icons.add, size: 14, color: Colors.white),
                                                                padding: EdgeInsets.zero,
                                                                constraints: const BoxConstraints(minWidth: 26),
                                                                onPressed: () => cart.updateQuantity(prod.id, qty + 1),
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
                    padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
                    child: Text(
                      'Partner Grocery Stores in $cityLabel',
                      style: TextStyle(
                        fontSize: 15.5,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                      ),
                    ),
                  ),
                ),

                // Partner Grocery Stores List
                _stores.isEmpty
                    ? SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(28, 16, 28, 100),
                          child: Center(
                            child: Text(
                              'Partner stores in $cityLabel appear here automatically.',
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                          ),
                        ),
                      )
                    : SliverPadding(
                        padding: EdgeInsets.fromLTRB(16, 0, 16, widget.isEmbedded ? 105 : 95),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final s = _stores[index];
                              final img = (s['image'] ?? '').toString();
                              return InkWell(
                                onTap: () => _openStoreCatalogSheet(s),
                                borderRadius: BorderRadius.circular(16),
                                child: Card(
                                  elevation: 0,
                                  color: isDark ? const Color(0xFF1F2937) : Colors.white,
                                  margin: const EdgeInsets.only(bottom: 12),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                    side: BorderSide(
                                      color: isDark ? Colors.grey[800]! : const Color(0xFFE2E8F0),
                                    ),
                                  ),
                                  child: Padding(
                                    padding: const EdgeInsets.all(14),
                                    child: Row(
                                      children: [
                                        ClipRRect(
                                          borderRadius: BorderRadius.circular(12),
                                          child: Container(
                                            width: 65,
                                            height: 65,
                                            color: primaryGreen.withValues(alpha: 0.1),
                                            child: img.isNotEmpty
                                                ? SafeImage(
                                                    img,
                                                    width: 65,
                                                    height: 65,
                                                    fit: BoxFit.cover,
                                                    errorBuilder: (_, __, ___) => const Icon(
                                                      Icons.storefront_rounded,
                                                      color: Color(0xFF16A34A),
                                                      size: 34,
                                                    ),
                                                  )
                                                : const Icon(
                                                    Icons.storefront_rounded,
                                                    color: Color(0xFF16A34A),
                                                    size: 34,
                                                  ),
                                          ),
                                        ),
                                        const SizedBox(width: 14),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                (s['name'] ?? '${cfg.appName} Super Mart').toString(),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 14.5,
                                                  color: isDark ? Colors.white : Colors.black87,
                                                ),
                                              ),
                                              const SizedBox(height: 3),
                                              Text(
                                                (s['address'] ?? cityLabel).toString(),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: const TextStyle(color: Colors.grey, fontSize: 11.5),
                                              ),
                                              const SizedBox(height: 6),
                                              Row(
                                                children: [
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                    decoration: BoxDecoration(
                                                      color: Colors.amber[50],
                                                      borderRadius: BorderRadius.circular(4),
                                                    ),
                                                    child: Text(
                                                      '★ ${s['rating'] ?? '4.8'}',
                                                      style: TextStyle(
                                                        color: Colors.amber[800],
                                                        fontSize: 10.5,
                                                        fontWeight: FontWeight.bold,
                                                      ),
                                                    ),
                                                  ),
                                                  const SizedBox(width: 8),
                                                  Flexible(
                                                    child: Text(
                                                      '${s['deliveryTime'] ?? '10-15 mins'} • Express',
                                                      overflow: TextOverflow.ellipsis,
                                                      style: TextStyle(
                                                        fontSize: 11.5,
                                                        color: isDark ? Colors.grey[400] : Colors.black54,
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                        OutlinedButton(
                                          onPressed: () => _openStoreCatalogSheet(s),
                                          style: OutlinedButton.styleFrom(
                                            foregroundColor: primaryGreen,
                                            side: BorderSide(color: primaryGreen),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                          ),
                                          child: const Text(
                                            'Shop',
                                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                            childCount: _stores.length,
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
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
                      child: const Icon(Icons.shopping_bag_rounded, color: Colors.white, size: 20),
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
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('View Cart', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
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

  Widget _buildHeroSection() {
    if (_heroSlides.isEmpty) {
      return Container(
        margin: const EdgeInsets.fromLTRB(16, 14, 16, 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF15803D), Color(0xFF16A34A)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
        ),
        child: const Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '10-15 MIN EXPRESS GROCERY',
                    style: TextStyle(color: Colors.amberAccent, fontSize: 10, fontWeight: FontWeight.w900),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'Fresh Fruits, Dairy &\nDaily Kitchen Staples',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, height: 1.2),
                  ),
                ],
              ),
            ),
            Icon(Icons.shopping_bag_outlined, color: Colors.white, size: 42),
          ],
        ),
      );
    }

    return Column(
      children: [
        Container(
          height: 152,
          margin: const EdgeInsets.fromLTRB(16, 14, 16, 6),
          child: PageView.builder(
            controller: _heroPageCtrl,
            itemCount: _heroSlides.length,
            onPageChanged: (i) => setState(() => _heroPageIndex = i),
            itemBuilder: (context, idx) {
              final slide = _heroSlides[idx];
              final img = (slide['image'] ?? '').toString();
              final title = (slide['title'] ?? 'Fresh Groceries').toString();
              final subtitle = (slide['subtitle'] ?? '').toString();
              final tag = (slide['tag'] ?? '10-15 MINS').toString();
              return GestureDetector(
                onTap: () => _openBannerTarget(slide['link']?.toString(), title),
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: idx % 2 == 0
                          ? [const Color(0xFF065F46), const Color(0xFF16A34A)]
                          : [const Color(0xFF0F766E), const Color(0xFF059669)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 3,
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                decoration: BoxDecoration(
                                  color: Colors.amber[300],
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  tag,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Colors.black87,
                                    fontSize: 9,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                title,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  height: 1.15,
                                ),
                              ),
                              if (subtitle.isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Text(
                                  subtitle,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(color: Colors.white70, fontSize: 10.5),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                      if (img.isNotEmpty)
                        Expanded(
                          flex: 2,
                          child: ClipRRect(
                            borderRadius: const BorderRadius.only(
                              topRight: Radius.circular(20),
                              bottomRight: Radius.circular(20),
                            ),
                            child: SafeImage(
                              img,
                              height: 152,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Icon(
                                Icons.shopping_bag_outlined,
                                color: Colors.white54,
                                size: 42,
                              ),
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
        if (_heroSlides.length > 1)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(_heroSlides.length, (i) {
              final active = i == _heroPageIndex;
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 3, vertical: 2),
                width: active ? 16 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: active ? const Color(0xFF16A34A) : Colors.grey.shade400,
                  borderRadius: BorderRadius.circular(3),
                ),
              );
            }),
          ),
      ],
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
                              ? [const Color(0xFF075985), const Color(0xFF0284C7)]
                              : [const Color(0xFF3730A3), const Color(0xFF6366F1)],
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
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(5),
                              ),
                              child: Text(
                                badge,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900),
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
    final displayCats = _categoryItems.where((c) => (c['slug'] ?? '') != 'all').take(8).toList();
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
                  fontWeight: FontWeight.w800,
                  color: isDark ? Colors.white : const Color(0xFF0F172A),
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
                    Icon(Icons.chevron_right, size: 16, color: primaryGreen),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: displayCats.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 0.74,
            ),
            itemBuilder: (context, index) {
              final cat = displayCats[index];
              final name = (cat['name'] ?? 'Category').toString();
              final slug = (cat['slug'] ?? '').toString();
              final image = (cat['image'] ?? '').toString();
              final isSelected = slug == _selectedCategorySlug;

              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedCategorySlug = slug;
                    _selectedCategoryName = name;
                  });
                },
                child: Column(
                  children: [
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: isSelected
                              ? primaryGreen.withValues(alpha: 0.15)
                              : (isDark ? const Color(0xFF1E293B) : const Color(0xFFF0F6FF)),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected
                                ? primaryGreen
                                : (isDark ? Colors.grey[800]! : const Color(0xFFE2E8F0)),
                            width: isSelected ? 1.5 : 1,
                          ),
                        ),
                        padding: const EdgeInsets.all(7),
                        child: Center(
                          child: image.isNotEmpty
                              ? SafeImage(
                                  image,
                                  fit: BoxFit.contain,
                                  errorBuilder: (_, __, ___) => Icon(
                                    Icons.shopping_basket_rounded,
                                    color: primaryGreen,
                                    size: 26,
                                  ),
                                )
                              : Icon(
                                  Icons.shopping_basket_rounded,
                                  color: primaryGreen,
                                  size: 26,
                                ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      name,
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                        color: isSelected
                            ? primaryGreen
                            : (isDark ? Colors.white70 : const Color(0xFF1E293B)),
                        height: 1.15,
                      ),
                    ),
                  ],
                ),
              );
            },
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
  State<_StoreCatalogBottomSheet> createState() => _StoreCatalogBottomSheetState();
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
    final primaryGreen = const Color(0xFF16A34A);
    final sectionTitles = ['All', ..._catalogSections.map((s) => (s['name'] ?? 'Items').toString())];

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
                            ? SafeImage((_store['image'] ?? '').toString(), fit: BoxFit.cover)
                            : const Icon(Icons.storefront_rounded, color: Color(0xFF16A34A), size: 28),
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
                            '${_store['address'] ?? ''} • ${_store['deliveryTime'] ?? '10-15 mins'}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 11.5, color: Colors.grey),
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
                            color: selected ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                          ),
                        ),
                        selected: selected,
                        selectedColor: primaryGreen,
                        backgroundColor: isDark ? const Color(0xFF1F2937) : Colors.grey.shade100,
                        onSelected: (_) => setState(() => _selectedSec = title),
                      );
                    },
                  ),
                ),
              const SizedBox(height: 8),
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator(color: Color(0xFF16A34A)))
                    : visibleProducts.isEmpty
                        ? const Center(
                            child: Text('No items in store catalog yet', style: TextStyle(color: Colors.grey)),
                          )
                        : ListView.separated(
                            controller: controller,
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                            itemCount: visibleProducts.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 10),
                            itemBuilder: (_, idx) {
                              final item = visibleProducts[idx];
                              final prod = GroceryApiService.toProduct(item, fallbackStore: _store);
                              final qty = cart.items
                                  .where((ci) => ci.product.id == prod.id)
                                  .fold<int>(0, (s, ci) => s + ci.quantity);

                              return Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: isDark ? const Color(0xFF1F2937) : Colors.grey.shade50,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: isDark ? Colors.grey[800]! : const Color(0xFFE5E7EB),
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
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            prod.name,
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 13.5,
                                              color: isDark ? Colors.white : Colors.black87,
                                            ),
                                          ),
                                          Text(
                                            prod.weight ?? prod.unit ?? '1 unit',
                                            style: const TextStyle(fontSize: 11, color: Colors.grey),
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
                                            onPressed: () => cart.addGroceryItem(
                                              prod,
                                              storeId: prod.storeId ?? widget.storeId,
                                              storeName: prod.storeName ?? widget.storeName,
                                              storeImageUrl: (_store['image'] ?? '').toString(),
                                            ),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: primaryGreen,
                                              foregroundColor: Colors.white,
                                              elevation: 0,
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                            ),
                                            child: const Text('ADD', style: TextStyle(fontWeight: FontWeight.bold)),
                                          )
                                        : Container(
                                            decoration: BoxDecoration(
                                              color: primaryGreen,
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                IconButton(
                                                  icon: const Icon(Icons.remove, size: 16, color: Colors.white),
                                                  constraints: const BoxConstraints(minWidth: 30),
                                                  padding: EdgeInsets.zero,
                                                  onPressed: () => cart.updateQuantity(prod.id, qty - 1),
                                                ),
                                                Text(
                                                  '$qty',
                                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                                ),
                                                IconButton(
                                                  icon: const Icon(Icons.add, size: 16, color: Colors.white),
                                                  constraints: const BoxConstraints(minWidth: 30),
                                                  padding: EdgeInsets.zero,
                                                  onPressed: () => cart.updateQuantity(prod.id, qty + 1),
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
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Text(
                          'View Cart (${cart.itemCount} items • ₹${cart.totalAmount.toInt()})',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
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
