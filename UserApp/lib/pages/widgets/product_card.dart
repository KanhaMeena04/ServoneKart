import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/models/product.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/cart_provider.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/safe_image.dart';

class ProductCard extends StatelessWidget {
  final Product product;

  const ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final cartProvider = context.watch<CartProvider>();
    final isInCart =
        cartProvider.items.any((item) => item.product.id == product.id);
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final bool isFood = product.vertical == 'food';

    return GestureDetector(
      onTap: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (context) => ProductDetailSheet(product: product),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1F2937) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            if (isDark)
              BoxShadow(
                color: AppColors.primary.withOpacity(0.15),
                blurRadius: 8,
                spreadRadius: 1,
                offset: const Offset(0, 4),
              )
            else
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: isDark
                      ? Colors.black.withOpacity(0.5)
                      : AppColors.primary.withOpacity(0.08),
                  border: isDark
                      ? Border.all(color: Colors.grey.withOpacity(0.4))
                      : null,
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(12)),
                ),
                child: Stack(
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                          top: Radius.circular(12)),
                      child: product.image.isNotEmpty
                          ? SafeImage(
                              product.image,
                              width: double.infinity,
                              height: double.infinity,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Center(
                                child: Icon(
                                  Icons.shopping_basket_rounded,
                                  color: AppColors.primary.withOpacity(0.6),
                                  size: 40,
                                ),
                              ),
                            )
                          : Center(
                              child: Icon(
                                Icons.shopping_basket_rounded,
                                color: AppColors.primary.withOpacity(0.6),
                                size: 40,
                              ),
                            ),
                    ),
                    // Classic Indian FSSAI Veg / Non-Veg Indicator
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.all(2.5),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(
                            color: product.isVeg ? const Color(0xFF16A34A) : const Color(0xFFDC2626),
                            width: 1.2,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                        child: Icon(
                          Icons.circle,
                          color: product.isVeg ? const Color(0xFF16A34A) : const Color(0xFFDC2626),
                          size: 7,
                        ),
                      ),
                    ),
                    if (product.weight != null && product.weight!.isNotEmpty)
                      Positioned(
                        top: 8,
                        left: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.65),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            product.weight!,
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.w700),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            Container(
              decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1F2937) : Colors.white,
                  borderRadius: const BorderRadius.only(
                      bottomLeft: Radius.circular(12),
                      bottomRight: Radius.circular(12))),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      style: TextStyle(
                          fontSize: 15.0,
                          color: isDark ? Colors.white : Colors.black,
                          fontWeight: FontWeight.bold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (product.storeName != null &&
                        product.storeName!.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        product.storeName!,
                        style: TextStyle(
                          fontSize: 11,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.star,
                            size: 14, color: AppColors.secondary),
                        const SizedBox(width: 4),
                        Text(product.rating.toStringAsFixed(1),
                            style: isDark
                                ? const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.normal,
                                    color: Colors.grey,
                                    height: 1.5,
                                  )
                                : AppTextStyles.bodySmall),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Text('₹${product.price.toInt()}',
                                style: AppTextStyles.price),
                            if (product.mrp != null &&
                                product.mrp! > product.price) ...[
                              const SizedBox(width: 4),
                              Text(
                                '₹${product.mrp!.toInt()}',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Colors.grey,
                                  decoration: TextDecoration.lineThrough,
                                ),
                              ),
                            ],
                          ],
                        ),
                        GestureDetector(
                          onTap: () {
                            final sid = product.storeId ??
                                product.restaurantId ??
                                'store_tricelyn_indore_01';
                            final sname = product.storeName ??
                                product.restaurantName ??
                                'Tricelyn Partner Store';
                            if (isFood) {
                              context.read<CartProvider>().addItem(
                                    product,
                                    restaurantId: sid,
                                    restaurantName: sname,
                                    restaurantImageUrl:
                                        product.restaurantImageUrl ?? '',
                                    imageUrl: product.image,
                                  );
                            } else {
                              context.read<CartProvider>().addGroceryItem(
                                    product,
                                    storeId: sid,
                                    storeName: sname,
                                    storeImageUrl:
                                        product.restaurantImageUrl ?? '',
                                  );
                            }
                            ScaffoldMessenger.of(context).hideCurrentSnackBar();
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('${product.name} added to cart'),
                                duration: const Duration(seconds: 1),
                              ),
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: isInCart
                                  ? AppColors.secondary
                                  : AppColors.primary,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Icon(
                              isInCart ? Icons.check : Icons.add,
                              color: AppColors.white,
                              size: 20,
                            ),
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
  }
}

class ProductDetailSheet extends StatelessWidget {
  final Product product;

  const ProductDetailSheet({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final cartProvider = context.watch<CartProvider>();
    final inCartIdx =
        cartProvider.items.indexWhere((i) => i.product.id == product.id);
    final qtyInCart = inCartIdx >= 0 ? cartProvider.items[inCartIdx].quantity : 0;
    final bool isFood = product.vertical == 'food';

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.6,
      maxChildSize: 0.95,
      builder: (_, controller) {
        return Container(
          decoration: BoxDecoration(
            color: isDark ? Colors.black : Colors.white,
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(25),
            ),
          ),
          child: SingleChildScrollView(
            controller: controller,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 10),
                    height: 5,
                    width: 50,
                    decoration: BoxDecoration(
                      color: Colors.grey[400],
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),

                /// Product Image
                ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(16)),
                  child: product.image.isNotEmpty
                      ? SafeImage(
                          product.image,
                          height: 250,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            height: 250,
                            color: AppColors.primary.withOpacity(0.08),
                            child: const Center(
                              child: Icon(Icons.shopping_basket_rounded,
                                  size: 64, color: AppColors.primary),
                            ),
                          ),
                        )
                      : Container(
                          height: 250,
                          width: double.infinity,
                          color: AppColors.primary.withOpacity(0.08),
                          child: const Center(
                            child: Icon(Icons.shopping_basket_rounded,
                                size: 64, color: AppColors.primary),
                          ),
                        ),
                ),

                const SizedBox(height: 15),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      /// Title + ADD button
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  product.name,
                                  style: TextStyle(
                                    fontSize: 20,
                                    color:
                                        isDark ? Colors.white : Colors.black,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                if (product.weight != null &&
                                    product.weight!.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text(
                                      product.weight!,
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: isDark
                                            ? Colors.grey[400]
                                            : Colors.grey[600],
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          qtyInCart == 0
                              ? ElevatedButton(
                                  onPressed: () {
                                    final sid = product.storeId ??
                                        product.restaurantId ??
                                        'store_tricelyn_indore_01';
                                    final sname = product.storeName ??
                                        product.restaurantName ??
                                        'Tricelyn Partner Store';
                                    if (isFood) {
                                      cartProvider.addItem(
                                        product,
                                        restaurantId: sid,
                                        restaurantName: sname,
                                        restaurantImageUrl:
                                            product.restaurantImageUrl ?? '',
                                        imageUrl: product.image,
                                      );
                                    } else {
                                      cartProvider.addGroceryItem(
                                        product,
                                        storeId: sid,
                                        storeName: sname,
                                        storeImageUrl:
                                            product.restaurantImageUrl ?? '',
                                      );
                                    }
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primary,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                  child: const Text(
                                    'ADD',
                                    style:
                                        TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                )
                              : Container(
                                  decoration: BoxDecoration(
                                    color: AppColors.primary,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.remove,
                                            color: Colors.white, size: 18),
                                        onPressed: () =>
                                            cartProvider.updateQuantity(
                                                product.id, qtyInCart - 1),
                                      ),
                                      Text(
                                        '$qtyInCart',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15,
                                        ),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.add,
                                            color: Colors.white, size: 18),
                                        onPressed: () =>
                                            cartProvider.updateQuantity(
                                                product.id, qtyInCart + 1),
                                      ),
                                    ],
                                  ),
                                ),
                        ],
                      ),

                      const SizedBox(height: 10),

                      /// Price + MRP
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '₹${product.price.toInt()}',
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                  fontSize: 18),
                            ),
                          ),
                          if (product.mrp != null &&
                              product.mrp! > product.price) ...[
                            const SizedBox(width: 10),
                            Text(
                              '₹${product.mrp!.toInt()}',
                              style: const TextStyle(
                                fontSize: 14,
                                color: Colors.grey,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                          ],
                        ],
                      ),

                      const SizedBox(height: 10),

                      /// Rating & Store
                      Row(
                        children: [
                          const Icon(Icons.star, color: Colors.green, size: 18),
                          const SizedBox(width: 5),
                          Text(
                            product.rating.toStringAsFixed(1),
                            style: TextStyle(
                              color: isDark ? Colors.grey : Colors.black,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          if (product.storeName != null &&
                              product.storeName!.isNotEmpty) ...[
                            const SizedBox(width: 12),
                            const Icon(Icons.storefront_rounded,
                                size: 16, color: AppColors.primary),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                product.storeName!,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),

                      const SizedBox(height: 15),

                      /// Description
                      Text(
                        product.description.isNotEmpty
                            ? product.description
                            : 'Fresh quality ${product.name} sourced directly from verified partner stores for fast doorstep delivery.',
                        style: TextStyle(
                          color: isDark ? Colors.grey[400] : Colors.grey[700],
                          height: 1.5,
                        ),
                      ),

                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
