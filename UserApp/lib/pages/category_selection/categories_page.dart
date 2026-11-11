import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/platform_config_provider.dart';
import '../../providers/theme_provider.dart';
import '../../services/grocery_api_service.dart';
import '../../widgets/safe_image.dart';
import '../category_product/category_products.dart';
import 'food_preferences_page.dart';

class CategoriesPage extends StatefulWidget {
  final ValueChanged<List<String>>? onPreferencesSelected;
  final VoidCallback? onSkip;

  const CategoriesPage({
    super.key,
    this.onPreferencesSelected,
    this.onSkip,
  });

  @override
  State<CategoriesPage> createState() => _CategoriesPageState();
}

class _CategoriesPageState extends State<CategoriesPage> {
  List<Map<String, dynamic>> _groceryCategories = [];
  bool _isLoading = true;
  String _searchQuery = '';
  final TextEditingController _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadCategories() async {
    setState(() => _isLoading = true);
    try {
      final cats = await GroceryApiService.getCategories();
      if (mounted) {
        setState(() {
          _groceryCategories = cats;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cfg = context.watch<PlatformConfigProvider>();
    if (cfg.isFoodActive) {
      return FoodPreferencesPage(
        showBackButton: false,
        onCompleted: widget.onPreferencesSelected,
        onSkip: widget.onSkip,
      );
    }

    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final filtered = _groceryCategories.where((cat) {
      if (_searchQuery.trim().isEmpty) return true;
      final name = (cat['name'] ?? cat['title'] ?? '').toString().toLowerCase();
      return name.contains(_searchQuery.trim().toLowerCase());
    }).toList();

    return Scaffold(
      backgroundColor: isDark ? Colors.black : const Color(0xFFF5FAF8),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadCategories,
          color: AppColors.primary,
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Shop by Category',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Fresh groceries & daily essentials delivered in 10-15 mins',
                        style: TextStyle(
                          fontSize: 12.5,
                          color: isDark ? Colors.grey[400] : Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1F2937) : Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: isDark ? Colors.grey[800]! : const Color(0xFFE2E8F0),
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.search_rounded, color: AppColors.primary),
                            const SizedBox(width: 10),
                            Expanded(
                              child: TextField(
                                controller: _searchCtrl,
                                onChanged: (v) => setState(() => _searchQuery = v),
                                style: TextStyle(color: isDark ? Colors.white : Colors.black),
                                decoration: const InputDecoration(
                                  hintText: 'Search grocery categories...',
                                  hintStyle: TextStyle(fontSize: 13, color: Colors.grey),
                                  border: InputBorder.none,
                                ),
                              ),
                            ),
                            if (_searchQuery.isNotEmpty)
                              IconButton(
                                icon: const Icon(Icons.clear, size: 18, color: Colors.grey),
                                onPressed: () {
                                  _searchCtrl.clear();
                                  setState(() => _searchQuery = '');
                                },
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (_isLoading)
                const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
                )
              else if (filtered.isEmpty)
                const SliverFillRemaining(
                  child: Center(
                    child: Text(
                      'No grocery categories found',
                      style: TextStyle(color: Colors.grey, fontSize: 14),
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
                  sliver: SliverGrid(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      mainAxisExtent: 128,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final cat = filtered[index];
                        final name = (cat['name'] ?? cat['title'] ?? 'Grocery').toString();
                        final slug = (cat['slug'] ?? cat['_id'] ?? name).toString();
                        final image = (cat['image'] ?? '').toString();
                        return GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => CategoryProducts(
                                  cat: slug,
                                  displayTitle: name,
                                ),
                              ),
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.all(10),
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
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  width: 56,
                                  height: 56,
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  clipBehavior: Clip.antiAlias,
                                  child: image.isNotEmpty
                                      ? SafeImage(
                                          image,
                                          fit: BoxFit.cover,
                                          errorBuilder: (_, __, ___) => const Icon(
                                            Icons.shopping_basket_rounded,
                                            color: AppColors.primary,
                                            size: 28,
                                          ),
                                        )
                                      : const Icon(
                                          Icons.shopping_basket_rounded,
                                          color: AppColors.primary,
                                          size: 28,
                                        ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  name,
                                  textAlign: TextAlign.center,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w700,
                                    color: isDark ? Colors.white : const Color(0xFF1E293B),
                                    height: 1.15,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                      childCount: filtered.length,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
