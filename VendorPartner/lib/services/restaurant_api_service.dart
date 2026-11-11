import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../api_constants.dart';
import 'platform_config_service.dart';
import 'restaurant_auth_service.dart';

class RestaurantApiService {
  static Map<String, String> _getHeaders([String? customToken]) {
    final token = customToken ?? (tryGetToken());
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  static String? tryGetToken() {
    try {
      return ApiConstants.authToken;
    } catch (_) {
      return null;
    }
  }

  // ==================== AUTHENTICATION ====================

  static Future<Map<String, dynamic>> sendOtp(String phone) async {
    final cleanPhone = phone.replaceAll('+91', '').replaceAll(RegExp(r'\D'), '').trim();
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.sendOtp),
        headers: _getHeaders(),
        body: jsonEncode({
          'phone': cleanPhone,
          'mobile': cleanPhone,
        }),
      ).timeout(const Duration(seconds: 12));

      final decoded = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300 && decoded is Map) {
        return {
          'success': true,
          'message': decoded['message'] ?? 'OTP sent successfully',
          'testOtp': decoded['testOtp']?.toString(),
          'data': decoded,
        };
      }
      return {
        'success': false,
        'message': (decoded is Map ? decoded['message']?.toString() : null) ?? 'Failed to send OTP (${response.statusCode})',
      };
    } catch (e) {
      debugPrint('Error sending OTP: $e');
      return {
        'success': false,
        'message': 'Network error while sending OTP: $e',
      };
    }
  }

  static Future<Map<String, dynamic>> verifyOtp(String phone, String otp) async {
    final cleanPhone = phone.replaceAll('+91', '').replaceAll(RegExp(r'\D'), '').trim();
    final cleanOtp = otp.trim();

    try {
      final response = await http.post(
        Uri.parse(ApiConstants.verifyOtp),
        headers: _getHeaders(),
        body: jsonEncode({
          'phone': cleanPhone,
          'mobile': cleanPhone,
          'otp': cleanOtp,
        }),
      ).timeout(const Duration(seconds: 12));

      final data = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300 && data is Map) {
        final token = data['token'] ?? data['data']?['token'] ?? data['authToken'];
        final restaurant = data['restaurant'] ?? data['data']?['restaurant'];
        final restaurantId = (restaurant?['_id'] ?? restaurant?['id'] ?? data['restaurantId'] ?? data['data']?['restaurantId'] ?? '').toString();
        final assignedRole = (data['assignedRole'] ?? data['user']?['assignedRole'] ?? restaurant?['assignedRole'] ?? 'Store Manager').toString();
        final permissions = data['permissions'] ?? data['user']?['permissions'] ?? restaurant?['permissions'];
        final businessType = (data['businessType'] ?? data['user']?['businessType'] ?? restaurant?['businessType'] ?? 'grocery_store').toString();
        final vertical = (data['vertical'] ?? data['user']?['vertical'] ?? restaurant?['vertical'] ?? 'grocery').toString();
        final platformMode = (data['platformMode'] ?? data['user']?['platformMode'] ?? 'grocery').toString();

        await PlatformConfigService.setMode(platformMode);

        if (token != null && token.toString().isNotEmpty && restaurantId.isNotEmpty) {
          await RestaurantAuthService.saveAuthSession(
            token: token.toString(),
            restaurantId: restaurantId,
            vendorData: restaurant is Map ? Map<String, dynamic>.from(restaurant) : null,
            assignedRole: assignedRole,
            permissions: permissions is List ? permissions : null,
            businessType: businessType,
            vertical: vertical,
            platformMode: platformMode,
          );
        } else {
          await RestaurantAuthService.saveRbacContext(
            assignedRole: assignedRole,
            permissions: permissions is List ? permissions : null,
            businessType: businessType,
            vertical: vertical,
            platformMode: platformMode,
          );
        }

        return {
          'success': true,
          'token': token,
          'restaurantId': restaurantId,
          'restaurant': restaurant,
          'isApproved': data['isApproved'] == true || data['restaurantApproved'] == true || data['approvalStatus'] == 'verified',
          'name': data['name'],
          'assignedRole': assignedRole,
          'permissions': permissions,
          'businessType': businessType,
          'vertical': vertical,
          'platformMode': platformMode,
          'data': data,
        };
      }
      return {
        'success': false,
        'message': (data is Map ? data['message']?.toString() : null) ?? 'OTP verification failed (${response.statusCode})',
      };
    } catch (e) {
      debugPrint('Error verifying OTP: $e');
      return {
        'success': false,
        'message': 'Network error verifying OTP: $e',
      };
    }
  }

  // ==================== ONBOARDING REGISTRATION ====================

  static Future<Map<String, dynamic>> applyForRestaurant({
    required Map<String, String> fields,
    Map<String, File>? files,
  }) async {
    try {
      final uri = Uri.parse(ApiConstants.restaurantApply);
      final request = http.MultipartRequest('POST', uri);

      final token = tryGetToken();
      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }

      request.fields.addAll(fields);

      if (files != null) {
        for (var entry in files.entries) {
          if (await entry.value.exists()) {
            request.files.add(
              await http.MultipartFile.fromPath(entry.key, entry.value.path),
            );
          }
        }
      }

      final streamedResponse = await request.send().timeout(const Duration(seconds: 30));
      final response = await http.Response.fromStream(streamedResponse);
      final data = jsonDecode(response.body);

      return {
        'success': response.statusCode >= 200 && response.statusCode < 300,
        'message': data['message'] ?? (response.statusCode == 200 ? 'Application submitted successfully' : 'Submission failed'),
        'data': data,
      };
    } catch (e) {
      debugPrint('Error submitting application: $e');
      return {'success': false, 'message': 'Failed to submit application: $e'};
    }
  }

  // ==================== DASHBOARD & ORDERS ====================

  static Future<Map<String, dynamic>> getDashboardStats([String filter = 'today']) async {
    try {
      final restId = ApiConstants.restaurantId;
      final response = await http.get(
        Uri.parse(ApiConstants.getDashboardStats(restId, filter)),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {'success': true, 'data': data['data'] ?? data};
      }
      return {'success': false, 'message': 'Failed to load dashboard statistics'};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> toggleActiveStatus(bool isActive) async {
    try {
      final restId = ApiConstants.restaurantId;
      final response = await http.put(
        Uri.parse(ApiConstants.toggleActive(restId)),
        headers: _getHeaders(),
        body: jsonEncode({'isActive': isActive}),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      return {
        'success': response.statusCode == 200,
        'isActive': data['isActive'] ?? isActive,
        'message': data['message'] ?? 'Status updated successfully',
      };
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> getRestaurantOrders() async {
    try {
      final restId = ApiConstants.restaurantId;
      final response = await http.get(
        Uri.parse(ApiConstants.getRestaurantOrders(restId)),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final list = data['orders'] ?? data['data'] ?? (data is List ? data : []);
        return {'success': true, 'orders': list};
      }
      return {'success': false, 'message': 'Failed to load restaurant orders'};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> prepareOrder(String orderId) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.prepareOrder(orderId)),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      return {'success': response.statusCode == 200, 'data': data, 'message': data['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> markOrderReady(String orderId) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.assignRider(orderId)),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      return {'success': response.statusCode == 200, 'data': data, 'message': data['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> verifyPickup(String orderId, String otp) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/orders/restaurant/verify-pickup/$orderId'),
        headers: _getHeaders(),
        body: jsonEncode({'otp': otp.trim(), 'code': otp.trim()}),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      return {'success': response.statusCode == 200, 'data': data, 'message': data['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> searchRiders(String orderId) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/orders/$orderId/search-riders'),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      return {'success': response.statusCode >= 200 && response.statusCode < 300, 'data': data, 'message': data['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> cancelOrder(String orderId, [String? reason]) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/orders/restaurant/cancel/$orderId'),
        headers: _getHeaders(),
        body: jsonEncode({'reason': reason ?? 'Cancelled by partner store'}),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      return {'success': response.statusCode == 200, 'data': data, 'message': data['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> deleteOrder(String orderId) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/orders/restaurant/delete/$orderId'),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      return {'success': response.statusCode == 200, 'data': data, 'message': data['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  // ==================== MENU MANAGEMENT ====================

  static Future<Map<String, dynamic>> getMenu() async {
    try {
      final restId = ApiConstants.restaurantId;
      final response = await http.get(
        Uri.parse("${ApiConstants.baseUrl}/restaurants/menu/$restId"),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {'success': true, 'menu': data['menu'] ?? data['data'] ?? data};
      }
      return {'success': false, 'message': 'Failed to load menu items'};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> addMenuItem(Map<String, dynamic> itemData) async {
    try {
      final restId = ApiConstants.restaurantId;
      final response = await http.post(
        Uri.parse(ApiConstants.addMenuItem(restId)),
        headers: _getHeaders(),
        body: jsonEncode(itemData),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      return {'success': response.statusCode >= 200 && response.statusCode < 300, 'data': data, 'message': data['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> toggleMenuItem(String itemId) async {
    try {
      final restId = ApiConstants.restaurantId;
      final response = await http.patch(
        Uri.parse(ApiConstants.toggleMenuItem(restId, itemId)),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      return {'success': response.statusCode == 200, 'data': data, 'message': data['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> deleteMenuItem(String itemId) async {
    try {
      final restId = ApiConstants.restaurantId;
      final response = await http.post(
        Uri.parse(ApiConstants.requestDeleteMenuItem(restId, itemId)),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      return {'success': response.statusCode == 200, 'data': data, 'message': data['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  // ==================== WALLET & SETTINGS ====================

  static Future<Map<String, dynamic>> getWalletData() async {
    try {
      final response = await http.get(
        Uri.parse(ApiConstants.restaurantWallet),
        headers: _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {'success': true, 'data': data['data'] ?? data};
      }
      return {'success': false, 'message': 'Failed to load wallet data'};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> updateSettings(Map<String, dynamic> settingsData) async {
    try {
      final restId = ApiConstants.restaurantId;
      final response = await http.put(
        Uri.parse(ApiConstants.restaurantSettings(restId)),
        headers: _getHeaders(),
        body: jsonEncode(settingsData),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      return {'success': response.statusCode == 200, 'data': data, 'message': data['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }
}
