import 'package:ecdkart_app/core/models/product.dart';
import 'package:ecdkart_app/core/theme/app_text_styles.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../providers/theme_provider.dart';
import '../../providers/platform_config_provider.dart';
import '../../services/grocery_api_service.dart';
import '../../services/restaurant_api_service.dart';
import '../widgets/product_card.dart';

class CategoryProducts extends StatefulWidget {
  final String cat;
  final String? displayTitle;
  const CategoryProducts({super.key, required this.cat, this.displayTitle});

  @override
  State<CategoryProducts> createState() => _CategoryProductsState();
}

class _CategoryProductsState extends State<CategoryProducts> {
  List<Product> _products = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  Future<void> _fetchProducts() async {
    try {
      final cfg = context.read<PlatformConfigProvider>();
      List<Product> matchingProducts = [];

      if (cfg.isGroceryActive) {
        final raw = await GroceryApiService.getProducts(category: widget.cat);
        matchingProducts = raw.map((e) => GroceryApiService.toProduct(e)).toList();
      } else {
        final restaurants = await RestaurantApiService.getRestaurants();
        for (var r in restaurants) {
          for (var item in r.menu) {
            if (item.category.toLowerCase() == widget.cat.toLowerCase() ||
                r.cuisine.toLowerCase() == widget.cat.toLowerCase()) {
              matchingProducts.add(item.toProduct());
            }
          }
        }
      }

      if (mounted) {
        setState(() {
          _products = matchingProducts;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final cfg = context.watch<PlatformConfigProvider>();
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.displayTitle ?? widget.cat,
          style: AppTextStyles.h4.copyWith(color: isDark ? Colors.white : Colors.black),
        ),
        actions: [
          GestureDetector(
            onTap: () {
              showFilterBottomSheet(context);
            },
            child: Row(
              children: [
                const Icon(Icons.filter_alt_outlined, size: 20),
                const SizedBox(width: 8),
                Text('Sort', style: AppTextStyles.h4.copyWith(color: isDark ? Colors.white : Colors.black)),
              ],
            ),
          ),
          const SizedBox(width: 20),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _products.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        cfg.isGroceryActive ? Icons.shopping_basket_outlined : Icons.fastfood_outlined,
                        size: 64,
                        color: Colors.grey.shade400,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No items found in this category',
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
                      ),
                    ],
                  ),
                )
              : GridView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 0.72,
                  ),
                  itemCount: _products.length,
                  itemBuilder: (context, index) {
                    return ProductCard(product: _products[index]);
                  },
                ),
    );
  }

  void showFilterBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Sort By',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: const Icon(Icons.arrow_upward),
                title: const Text('Price: Low to High'),
                onTap: () {
                  Navigator.pop(context);
                  setState(() {
                    _products.sort((a, b) => a.price.compareTo(b.price));
                  });
                },
              ),
              ListTile(
                leading: const Icon(Icons.arrow_downward),
                title: const Text('Price: High to Low'),
                onTap: () {
                  Navigator.pop(context);
                  setState(() {
                    _products.sort((a, b) => b.price.compareTo(a.price));
                  });
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

