import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../api_constants.dart';

class PlatformConfigService {
  static const String _prefModeKey = 'platformMode';
  static const String _prefAppNameKey = 'platformAppName';

  static final ValueNotifier<String> modeNotifier = ValueNotifier<String>('grocery');
  static String _appName = 'Tricelyn';
  static bool _isLoaded = false;

  static String get platformMode => modeNotifier.value;
  static bool get isGroceryPlatform => modeNotifier.value == 'grocery';
  static bool get isFoodAllowed => modeNotifier.value != 'grocery';
  static bool get isBothMode => modeNotifier.value == 'both';
  static String get appName => _appName;
  static bool get isLoaded => _isLoaded;

  static String _normalizeMode(dynamic raw) {
    final val = (raw ?? 'grocery').toString().trim().toLowerCase();
    if (val == 'food' || val == 'both' || val == 'grocery') {
      return val;
    }
    return 'grocery';
  }

  static Future<void> setMode(dynamic rawMode, {String? appName}) async {
    final normalized = _normalizeMode(rawMode);
    if (modeNotifier.value != normalized) {
      modeNotifier.value = normalized;
    }
    if (appName != null && appName.trim().isNotEmpty) {
      _appName = appName.trim();
    }
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefModeKey, normalized);
      if (appName != null && appName.trim().isNotEmpty) {
        await prefs.setString(_prefAppNameKey, _appName);
      }
    } catch (_) {}
  }

  static void applySocketUpdate(dynamic data) {
    if (data is Map) {
      final rawMode = data['platformMode'] ?? data['mode'] ?? data['settings']?['platformMode'];
      final rawName = data['appName'] ?? data['settings']?['appName'];
      if (rawMode != null) {
        setMode(rawMode, appName: rawName?.toString());
      } else if (rawName != null && rawName.toString().trim().isNotEmpty) {
        _appName = rawName.toString().trim();
      }
    }
  }

  static Future<void> loadCached() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cached = prefs.getString(_prefModeKey);
      if (cached != null && cached.isNotEmpty) {
        modeNotifier.value = _normalizeMode(cached);
      }
      final cachedName = prefs.getString(_prefAppNameKey);
      if (cachedName != null && cachedName.trim().isNotEmpty) {
        _appName = cachedName.trim();
      }
    } catch (_) {}
  }

  static Future<void> fetchSettings() async {
    await loadCached();
    try {
      final response = await http
          .get(
            Uri.parse('${ApiConstants.baseUrl}/settings'),
            headers: {'Accept': 'application/json'},
          )
          .timeout(const Duration(seconds: 8));
      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        if (decoded is Map) {
          final settings = decoded['settings'] is Map
              ? decoded['settings'] as Map
              : (decoded['data'] is Map ? decoded['data'] as Map : decoded);
          final mode = settings['platformMode'] ?? decoded['platformMode'];
          final name = settings['appName'] ?? decoded['appName'];
          await setMode(mode, appName: name?.toString());
          _isLoaded = true;
        }
      }
    } catch (e) {
      debugPrint('[PlatformConfigService] Settings fetch failed: $e');
    }
  }
}
