import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../api_constants.dart';
import 'platform_config_service.dart';

class MenuApiService {
  static Future<List<Map<String, dynamic>>> fetchRestaurantMenu([String? restaurantId]) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      String restId = restaurantId ?? ApiConstants.restaurantId;
      if (restId.isEmpty || restId == 'null' || restId == 'undefined') {
        restId = prefs.getString('restaurantId') ?? '';
      }
      if (restId == 'null' || restId == 'undefined') {
        restId = '';
      }
      if (restId.isEmpty) {
        restId = prefs.getString('userPhone') ?? 'me';
      }
      final token = prefs.getString('token') ?? ApiConstants.authToken;
      final effectiveRestId = restId.isNotEmpty ? restId : 'me';
      final url = '${ApiConstants.baseUrl}/menu/$effectiveRestId?includePending=true';
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          if (token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 30));

      List<dynamic> itemsList = [];
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['items'] is List) {
          itemsList = data['items'];
        } else if (data['data'] is List) {
          itemsList = data['data'];
        }
      }

      if (itemsList.isNotEmpty) {
        final bool groceryDefault = PlatformConfigService.isGroceryPlatform;
        final String fallbackCategory = groceryDefault ? 'Staples & Grains' : 'Main Course';

        return itemsList.map((item) {
          final Map<String, dynamic> itemMap = Map<String, dynamic>.from(item);
          final baseP = double.tryParse((itemMap['basePrice'] ?? itemMap['price'] ?? itemMap['pricing']?['b2c']?['sellingPrice'] ?? itemMap['sellingPrice'] ?? 0).toString()) ?? 0.0;
          final p = double.tryParse((itemMap['pricing']?['b2c']?['sellingPrice'] ?? itemMap['sellingPrice'] ?? itemMap['price'] ?? baseP).toString()) ?? baseP;
          final mrp = double.tryParse((itemMap['pricing']?['b2c']?['mrp'] ?? itemMap['mrp'] ?? p).toString()) ?? p;
          final b2bP = double.tryParse((itemMap['pricing']?['b2b']?['sellingPrice'] ?? itemMap['b2bPrice'] ?? p).toString()) ?? p;

          final rawFlavors = itemMap['flavors'] ?? itemMap['variations'] ?? itemMap['variants'] ?? [];
          final List<String> normalizedFlavors = [];
          if (rawFlavors is List) {
            for (var f in rawFlavors) {
              if (f is String && f.isNotEmpty) {
                normalizedFlavors.add(f);
              } else if (f is Map) {
                final n = f['name'];
                if (n is String && n.isNotEmpty) {
                  normalizedFlavors.add(n);
                } else if (n is Map) {
                  final s = n['en']?.toString() ?? (n.values.isNotEmpty ? n.values.first.toString() : '');
                  if (s.isNotEmpty) normalizedFlavors.add(s);
                }
              }
            }
          }

          final rawAddOns = itemMap['addOns'] ?? [];
          final List<Map<String, dynamic>> normalizedAddOns = [];
          if (rawAddOns is List) {
            for (var a in rawAddOns) {
              if (a is Map) {
                final n = a['name'];
                String aName = '';
                if (n is String) {
                  aName = n;
                } else if (n is Map) {
                  aName = n['en']?.toString() ?? (n.values.isNotEmpty ? n.values.first.toString() : '');
                }
                normalizedAddOns.add({
                  'name': aName.isNotEmpty ? aName : 'Add-on',
                  'price': double.tryParse((a['price'] ?? 0).toString()) ?? 0.0,
                  'image': a['image']?.toString() ?? '',
                });
              } else if (a is String && a.isNotEmpty) {
                normalizedAddOns.add({'name': a, 'price': 0.0, 'image': ''});
              }
            }
          }

          String rawImg = (itemMap['image'] ?? '').toString().trim();
          if (rawImg.isNotEmpty && !rawImg.startsWith('http') && !rawImg.startsWith('data:')) {
            final baseOrigin = ApiConstants.baseUrl.replaceAll(RegExp(r'/api(/v1)?/?$'), '');
            rawImg = rawImg.startsWith('/') ? '$baseOrigin$rawImg' : '$baseOrigin/$rawImg';
          }

          final rawCat = itemMap['category'] is Map
              ? (itemMap['category']['name'] ?? '').toString().trim()
              : (itemMap['category'] ?? '').toString().trim();
          final stockQty = int.tryParse((itemMap['stockQuantity'] ?? 0).toString()) ?? 0;
          final lowStockThreshold = int.tryParse((itemMap['lowStockThreshold'] ?? 5).toString()) ?? 5;
          final inStockVal = itemMap['inStock'] ?? itemMap['available'] ?? itemMap['isAvailable'] ?? true;

          return {
            '_id': itemMap['_id'] ?? itemMap['id'] ?? '',
            'name': itemMap['name'] is Map ? (itemMap['name']['en'] ?? (itemMap['name'].values.isNotEmpty ? itemMap['name'].values.first.toString() : '')) : (itemMap['name'] ?? ''),
            'description': itemMap['description'] is Map ? (itemMap['description']['en'] ?? '') : (itemMap['description'] ?? ''),
            'category': rawCat.isNotEmpty ? rawCat : fallbackCategory,
            'categoryId': itemMap['categoryId'] is Map ? itemMap['categoryId']['_id'] : (itemMap['categoryId'] ?? ''),
            'subcategory': itemMap['subcategory'] is Map ? (itemMap['subcategory']['name'] ?? '') : (itemMap['subcategory'] ?? ''),
            'subcategoryId': itemMap['subcategoryId'] is Map ? itemMap['subcategoryId']['_id'] : (itemMap['subcategoryId'] ?? ''),
            'basePrice': baseP,
            'price': baseP,
            'b2cMrp': mrp,
            'mrp': mrp,
            'b2cSellingPrice': p,
            'sellingPrice': p,
            'b2bPrice': b2bP,
            'foodType': itemMap['foodType'] ?? (itemMap['isVeg'] == false ? 'non-veg' : 'veg'),
            'isVeg': itemMap['isVeg'] ?? (itemMap['foodType'] == 'veg'),
            'preparationTime': int.tryParse((itemMap['preparationTime'] ?? 15).toString()) ?? 15,
            'isAvailable': inStockVal,
            'available': inStockVal,
            'inStock': inStockVal,
            'sku': itemMap['sku']?.toString() ?? '',
            'barcode': itemMap['barcode']?.toString() ?? '',
            'weight': itemMap['weight']?.toString() ?? '',
            'unit': (itemMap['unit'] != null && itemMap['unit'].toString().trim().isNotEmpty) ? itemMap['unit'].toString() : 'pack',
            'stockQuantity': stockQty,
            'lowStockThreshold': lowStockThreshold,
            'vertical': itemMap['vertical']?.toString() ?? (groceryDefault ? 'grocery' : 'food'),
            'approvalStatus': itemMap['approvalStatus'] ?? (itemMap['isApproved'] == true ? 'approved' : (itemMap['isRejected'] == true ? 'rejected' : 'pending')),
            'isApproved': itemMap['isApproved'] == true,
            'isPublished': itemMap['isPublished'] == true,
            'isRejected': itemMap['isRejected'] == true,
            'rejectionReason': itemMap['rejectionReason'] ?? '',
            'changeRequest': itemMap['changeRequest'] ?? '',
            'image': rawImg,
            'portionType': itemMap['portionType'] ?? 'none',
            'portions': itemMap['portions'],
            'flavors': normalizedFlavors,
            'variants': normalizedFlavors,
            'variations': normalizedFlavors,
            'addOns': normalizedAddOns,
          };
        }).toList();
      }
    } catch (e) {
      debugPrint('Error fetching menu items: $e');
    }
    return [];
  }

  static Future<Map<String, dynamic>?> addMenuItem(String restaurantId, Map<String, dynamic> itemData) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? ApiConstants.authToken;
      final effectiveRestId = restaurantId.isNotEmpty ? restaurantId : (prefs.getString('restaurantId') ?? 'me');
      final url = '${ApiConstants.baseUrl}/restaurants/vendor/menu/add/$effectiveRestId';

      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          if (token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
        body: json.encode(itemData),
      ).timeout(const Duration(seconds: 12));

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['product'] != null ? Map<String, dynamic>.from(data['product']) : data;
      }
    } catch (e) {
      debugPrint('Error adding menu item: $e');
    }
    return null;
  }

  static Future<List<Map<String, dynamic>>> bulkImportMenuItems(String restaurantId, List<Map<String, dynamic>> items) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? ApiConstants.authToken;
      final effectiveRestId = restaurantId.isNotEmpty ? restaurantId : (prefs.getString('restaurantId') ?? 'me');
      final url = '${ApiConstants.baseUrl}/restaurants/vendor/menu/bulk-import/$effectiveRestId';

      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          if (token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
        body: json.encode({'items': items}),
      ).timeout(const Duration(seconds: 20));

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['products'] is List) {
          return List<Map<String, dynamic>>.from(data['products']);
        }
      }
    } catch (e) {
      debugPrint('Error bulk importing menu items: $e');
    }
    return [];
  }

  static Future<bool> updateMenuItem(String restaurantId, String itemId, Map<String, dynamic> itemData) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? ApiConstants.authToken;
      final url = '${ApiConstants.baseUrl}/restaurants/vendor/menu/edit/$restaurantId/$itemId';

      final response = await http.put(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          if (token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
        body: json.encode(itemData),
      ).timeout(const Duration(seconds: 12));

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error updating menu item: $e');
      return false;
    }
  }

  static Future<bool> deleteMenuItem(String restaurantId, String itemId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? ApiConstants.authToken;
      final url = '${ApiConstants.baseUrl}/restaurants/$restaurantId/menu/$itemId/request-delete';

      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          if (token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 8));

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error deleting menu item: $e');
      return false;
    }
  }

  static Future<bool> toggleAvailability(String restaurantId, String itemId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? ApiConstants.authToken;
      final url = '${ApiConstants.baseUrl}/restaurants/vendor/menu/toggle/$restaurantId/$itemId';

      final response = await http.patch(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          if (token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 8));

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error toggling availability: $e');
      return false;
    }
  }

  static Future<Map<String, dynamic>> fetchGroceryInventory([String? restaurantId]) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      String restId = restaurantId ?? ApiConstants.restaurantId;
      if (restId.isEmpty || restId == 'null' || restId == 'undefined') {
        restId = prefs.getString('restaurantId') ?? '';
      }
      final token = prefs.getString('token') ?? ApiConstants.authToken;
      final queryParams = <String, String>{'limit': '100'};
      if (restId.isNotEmpty) {
        queryParams['storeId'] = restId;
      }
      final uri = Uri.parse('${ApiConstants.baseUrl}/grocery/inventory').replace(queryParameters: queryParams);
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          if (token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 15));

      final decoded = json.decode(response.body);
      if (response.statusCode == 200 && decoded is Map) {
        final rawList = decoded['items'] ?? decoded['inventory'] ?? decoded['products'] ?? decoded['data'] ?? [];
        final List<Map<String, dynamic>> parsed = rawList is List
            ? rawList.map<Map<String, dynamic>>((e) => Map<String, dynamic>.from(e as Map)).toList()
            : [];
        return {
          'success': true,
          'items': parsed,
          'lowStockCount': decoded['lowStockCount'] ?? 0,
          'outOfStockCount': decoded['outOfStockCount'] ?? 0,
        };
      }
      return {
        'success': false,
        'items': <Map<String, dynamic>>[],
        'message': (decoded is Map ? decoded['message']?.toString() : null) ?? 'Failed to load inventory',
      };
    } catch (e) {
      debugPrint('Error fetching grocery inventory: $e');
      return {
        'success': false,
        'items': <Map<String, dynamic>>[],
        'message': 'Network error loading inventory: $e',
      };
    }
  }

  static Future<Map<String, dynamic>> updateGroceryInventory(
    String productId,
    Map<String, dynamic> payload,
  ) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? ApiConstants.authToken;
      final url = '${ApiConstants.baseUrl}/grocery/inventory/$productId';
      final response = await http.put(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          if (token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
        body: json.encode(payload),
      ).timeout(const Duration(seconds: 12));

      final decoded = json.decode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {
          'success': true,
          'product': decoded is Map ? decoded['product'] : null,
          'message': decoded is Map ? (decoded['message'] ?? 'Inventory updated') : 'Inventory updated',
        };
      }
      return {
        'success': false,
        'message': (decoded is Map ? decoded['message']?.toString() : null) ?? 'Failed to update inventory (${response.statusCode})',
      };
    } catch (e) {
      debugPrint('Error updating grocery inventory: $e');
      return {
        'success': false,
        'message': 'Network error updating inventory: $e',
      };
    }
  }
}
