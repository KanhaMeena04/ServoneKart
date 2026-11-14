import '../core/constants/app_constants.dart';
import '../core/config/app_mode.dart';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:io';

class SettingsApiService {
  static String get baseUrl {
    return '${AppConstants.baseUrl}/settings';
  }

  static Map<String, dynamic>? _cachedSettings;
  static DateTime? _cacheTime;

  static Future<Map<String, dynamic>?> fetchSettings({bool forceRefresh = false}) async {
    if (!forceRefresh && _cachedSettings != null && _cacheTime != null) {
      if (DateTime.now().difference(_cacheTime!).inMinutes < 5) {
        return _cachedSettings;
      }
    }

    if (kFrontendPreviewMode) return _cachedSettings;
    try {
      final response = await http.get(Uri.parse(baseUrl)).timeout(const Duration(seconds: 8));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is Map<String, dynamic>) {
          final settingsMap = (data['settings'] ?? data['data'] ?? data) as Map<String, dynamic>;
          _cachedSettings = settingsMap;
          _cacheTime = DateTime.now();
          return settingsMap;
        }
      }
    } catch (e) {
      debugPrint("Settings fetch error: $e");
    }
    return _cachedSettings;
  }

  static Future<bool> isCodEnabled() async {
    final s = await fetchSettings();
    if (s != null && s['isCodEnabled'] != null) {
      return s['isCodEnabled'] == true;
    }
    return true;
  }

  static Future<String> getEstimatedDeliveryTime() async {
    final s = await fetchSettings();
    if (s != null && s['estimatedDeliveryTime'] != null) {
      return s['estimatedDeliveryTime'].toString();
    }
    return '10-15 Mins';
  }

  static Future<double> getFreeDeliveryMinAmount() async {
    final s = await fetchSettings();
    if (s != null && s['freeDeliveryMinAmount'] != null) {
      return (s['freeDeliveryMinAmount'] as num).toDouble();
    }
    return 199.0;
  }

  static Future<bool> getFirstOrderFreeDelivery() async {
    final s = await fetchSettings();
    if (s != null && s['firstOrderFreeDelivery'] != null) {
      return s['firstOrderFreeDelivery'] == true;
    }
    return true;
  }

  static Future<Map<String, dynamic>> getCancellationPolicy() async {
    final s = await fetchSettings();
    if (s != null && s['cancellationPolicy'] is Map) {
      return Map<String, dynamic>.from(s['cancellationPolicy']);
    }
    return {
      'enabled': true,
      'title': 'Order Cancellation & Refund Policy',
      'windowMinutes': 2,
      'cancellationFee': 0,
      'policyText': 'Orders can be cancelled free of charge within 2 minutes of placing or before the supermarket accepts the order.'
    };
  }

  static Future<Map<String, dynamic>?> fetchCmsPolicy(String slug) async {
    if (kFrontendPreviewMode) return null;
    try {
      final response = await http.get(Uri.parse('${AppConstants.baseUrl}/cms/$slug')).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is Map<String, dynamic>) return data;
      }
    } catch (e) {
      debugPrint("CMS Policy fetch error ($slug): $e");
    }
    return null;
  }
}
