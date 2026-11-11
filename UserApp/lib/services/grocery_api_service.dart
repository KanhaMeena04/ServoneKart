import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../core/config/app_mode.dart';
import '../core/constants/app_constants.dart';
import '../core/models/product.dart';

class GroceryApiService {
  static String get baseUrl => '${AppConstants.baseUrl}/grocery';

  static Future<Map<String, dynamic>> getBanners() async {
    if (kFrontendPreviewMode) {
      return {'heroSlides': [], 'offerBanners': [], 'topBanner': null, 'subBanners': []};
    }
    try {
      final res = await http
          .get(Uri.parse('$baseUrl/banners'))
          .timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body);
        if (decoded is Map<String, dynamic>) {
          return {
            'heroSlides': List<Map<String, dynamic>>.from(
              (decoded['heroSlides'] as List? ?? []).whereType<Map>().map((e) => Map<String, dynamic>.from(e)),
            ),
            'offerBanners': List<Map<String, dynamic>>.from(
              (decoded['offerBanners'] as List? ?? decoded['subBanners'] as List? ?? [])
                  .whereType<Map>()
                  .map((e) => Map<String, dynamic>.from(e)),
            ),
            'topBanner': decoded['topBanner'],
          };
        }
      }
    } catch (e) {
      debugPrint('GroceryApiService.getBanners error: $e');
    }
    return {'heroSlides': [], 'offerBanners': [], 'topBanner': null, 'subBanners': []};
  }

  static Future<List<Map<String, dynamic>>> getCategories() async {
    if (kFrontendPreviewMode) return [];
    try {
      final res = await http
          .get(Uri.parse('$baseUrl/categories'))
          .timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body);
        final list = decoded['data'] as List? ?? [];
        return list.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      }
    } catch (e) {
      debugPrint('GroceryApiService.getCategories error: $e');
    }
    return [];
  }

  static Future<List<Map<String, dynamic>>> getBestSellers() async {
    if (kFrontendPreviewMode) return [];
    try {
      final res = await http
          .get(Uri.parse('$baseUrl/best-sellers'))
          .timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body);
        final list = decoded['data'] as List? ?? [];
        return list.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      }
    } catch (e) {
      debugPrint('GroceryApiService.getBestSellers error: $e');
    }
    return [];
  }

  static Future<List<Map<String, dynamic>>> getProducts({
    String? category,
    String? search,
    String? storeId,
    int? limit,
  }) async {
    if (kFrontendPreviewMode) return [];
    try {
      final params = <String, String>{};
      if (category != null && category.trim().isNotEmpty && category.toLowerCase() != 'all') {
        params['category'] = category.trim();
      }
      if (search != null && search.trim().isNotEmpty) {
        params['search'] = search.trim();
      }
      if (storeId != null && storeId.trim().isNotEmpty && storeId != 'all') {
        params['storeId'] = storeId.trim();
      }
      if (limit != null && limit > 0) {
        params['limit'] = limit.toString();
      }
      final uri = Uri.parse('$baseUrl/products').replace(queryParameters: params.isEmpty ? null : params);
      final res = await http.get(uri).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body);
        final list = decoded['data'] as List? ?? [];
        return list.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      }
    } catch (e) {
      debugPrint('GroceryApiService.getProducts error: $e');
    }
    return [];
  }

  static Future<List<Map<String, dynamic>>> getStores({String? search}) async {
    if (kFrontendPreviewMode) return [];
    try {
      final params = <String, String>{};
      if (search != null && search.trim().isNotEmpty) {
        params['search'] = search.trim();
      }
      final uri = Uri.parse('$baseUrl/stores').replace(queryParameters: params.isEmpty ? null : params);
      final res = await http.get(uri).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body);
        final list = decoded['data'] as List? ?? [];
        return list.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      }
    } catch (e) {
      debugPrint('GroceryApiService.getStores error: $e');
    }
    return [];
  }

  static Future<Map<String, dynamic>?> getStoreCatalog(String storeId) async {
    if (kFrontendPreviewMode || storeId.isEmpty) return null;
    try {
      final res = await http
          .get(Uri.parse('$baseUrl/stores/$storeId/catalog'))
          .timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body);
        if (decoded['success'] == true && decoded['data'] is Map) {
          return Map<String, dynamic>.from(decoded['data'] as Map);
        }
      }
    } catch (e) {
      debugPrint('GroceryApiService.getStoreCatalog error: $e');
    }
    return null;
  }

  static Product toProduct(Map<String, dynamic> raw, {Map<String, dynamic>? fallbackStore}) {
    final catField = raw['category'];
    final categoryName = raw['categoryName']?.toString() ??
        (catField is Map ? catField['name']?.toString() : catField?.toString()) ??
        'Grocery';
    final storeId = (raw['storeId'] ??
            raw['restaurantId'] ??
            (raw['restaurant'] is Map ? raw['restaurant']['_id'] : raw['restaurant']) ??
            fallbackStore?['_id'] ??
            fallbackStore?['id'] ??
            'store_tricelyn_indore_01')
        .toString();
    final storeName = (raw['storeName'] ??
            raw['restaurantName'] ??
            raw['vendorName'] ??
            fallbackStore?['name'] ??
            'Tricelyn Partner Store')
        .toString();

    return Product(
      id: (raw['_id'] ?? raw['id'] ?? raw['sku'] ?? '').toString(),
      name: (raw['name'] ?? 'Grocery Item').toString(),
      description: (raw['description'] ?? '').toString(),
      price: (raw['price'] as num?)?.toDouble() ??
          (raw['sellingPrice'] as num?)?.toDouble() ??
          0.0,
      mrp: (raw['mrp'] as num?)?.toDouble(),
      image: (raw['image'] ?? '').toString(),
      category: categoryName,
      rating: (raw['rating'] as num?)?.toDouble() ?? 4.7,
      isVeg: raw['isVeg'] ?? true,
      weight: raw['weight']?.toString(),
      unit: raw['unit']?.toString(),
      vertical: (raw['vertical'] ?? 'grocery').toString(),
      storeId: storeId,
      storeName: storeName,
      restaurantId: storeId,
      restaurantName: storeName,
      restaurantImageUrl: (raw['storeImage'] ?? fallbackStore?['image'] ?? '').toString(),
    );
  }
}
