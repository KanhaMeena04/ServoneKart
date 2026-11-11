import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../api_constants.dart';
import 'platform_config_service.dart';
import 'restaurant_auth_service.dart';

class MasterCategoryItem {
  final String id;
  final String name;
  final String slug;
  final String vertical;
  final List<MasterSubcategoryItem> subcategories;

  MasterCategoryItem({
    required this.id,
    required this.name,
    required this.slug,
    this.vertical = 'grocery',
    required this.subcategories,
  });

  factory MasterCategoryItem.fromJson(Map<String, dynamic> json) {
    var subs = <MasterSubcategoryItem>[];
    if (json['subcategories'] != null && json['subcategories'] is List) {
      subs = (json['subcategories'] as List)
          .map((s) => MasterSubcategoryItem.fromJson(s))
          .toList();
    }
    return MasterCategoryItem(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      slug: (json['slug'] ?? '').toString(),
      vertical: (json['vertical'] ?? 'grocery').toString(),
      subcategories: subs,
    );
  }
}

class MasterSubcategoryItem {
  final String id;
  final String name;
  final String slug;

  MasterSubcategoryItem({
    required this.id,
    required this.name,
    required this.slug,
  });

  factory MasterSubcategoryItem.fromJson(Map<String, dynamic> json) {
    return MasterSubcategoryItem(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      slug: (json['slug'] ?? '').toString(),
    );
  }
}

class CategoryApiService {
  static final Map<String, List<MasterCategoryItem>> _cacheByVertical = {};

  static String resolveActiveVertical([String? overrideVertical]) {
    if (overrideVertical != null && overrideVertical.trim().isNotEmpty) {
      return overrideVertical.trim().toLowerCase();
    }
    if (PlatformConfigService.isGroceryPlatform) return 'grocery';
    if (PlatformConfigService.platformMode == 'food') return 'food';
    if (RestaurantAuthService.isGroceryStore) return 'grocery';
    return 'all';
  }

  static Future<List<MasterCategoryItem>> fetchCategoryTree({
    bool forceRefresh = false,
    String? vertical,
  }) async {
    final targetVertical = resolveActiveVertical(vertical);
    final cached = _cacheByVertical[targetVertical];
    if (!forceRefresh && cached != null && cached.isNotEmpty) {
      return cached;
    }

    try {
      final uri = Uri.parse('${ApiConstants.baseUrl}/categories/tree')
          .replace(queryParameters: targetVertical == 'all' ? null : {'vertical': targetVertical});
      final response = await http.get(uri).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final list = data is Map ? (data['data'] as List?) : (data is List ? data : null);
        if (list != null) {
          final parsed = list.map((c) => MasterCategoryItem.fromJson(Map<String, dynamic>.from(c as Map))).toList();
          _cacheByVertical[targetVertical] = parsed;
          return parsed;
        }
      }
    } catch (e) {
      debugPrint('Error fetching master category tree for vendor partner app: $e');
    }

    return _cacheByVertical[targetVertical] ?? [];
  }
}
