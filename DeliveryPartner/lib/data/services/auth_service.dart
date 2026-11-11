import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants/api_constansts.dart';

class AuthService {
  static const String _tokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userPhoneKey = 'user_phone';
  static const String _hasPinKey = 'has_pin';

  // Save tokens after login
  static Future<void> saveTokens(
    String token,
    String refreshToken,
    String phone, {
    bool hasPin = false,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_refreshTokenKey, refreshToken);
    await prefs.setString(_userPhoneKey, phone);
    await prefs.setBool(_hasPinKey, hasPin);

    debugPrint("💾 Tokens saved successfully:");
    debugPrint("   Phone: $phone");
    debugPrint("   Has PIN: $hasPin");
  }

  // Get current token
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // Get refresh token
  static Future<String?> getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_refreshTokenKey);
  }

  // Get saved user phone number
  static Future<String?> getUserPhone() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_userPhoneKey);
  }

  // Check if user has PIN set
  static Future<bool> hasPin() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_hasPinKey) ?? false;
  }

  // Refresh access token against live backend
  static Future<bool> refreshAccessToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final refreshToken = prefs.getString(_refreshTokenKey);
      if (refreshToken == null || refreshToken.isEmpty) return false;

      final response = await http
          .post(
            Uri.parse(ApiConstants.refreshToken),
            headers: const {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: jsonEncode({'refreshToken': refreshToken}),
          )
          .timeout(const Duration(seconds: 10));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);
        final newToken = data['token'] ?? data['accessToken'] ?? data['data']?['token'];
        final newRefresh = data['refreshToken'] ?? data['data']?['refreshToken'] ?? refreshToken;
        if (newToken != null && newToken.toString().isNotEmpty) {
          await prefs.setString(_tokenKey, newToken.toString());
          await prefs.setString(_refreshTokenKey, newRefresh.toString());
          return true;
        }
      }
    } catch (e) {
      debugPrint('Refresh token error: $e');
    }
    return false;
  }

  // Logout (clear tokens but keep phone & PIN info for quick re-login)
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();

    // Save phone and PIN status before clearing
    final savedPhone = prefs.getString(_userPhoneKey);
    final savedHasPin = prefs.getBool(_hasPinKey) ?? false;

    debugPrint("🚪 Logging out...");
    debugPrint("   Preserving phone: $savedPhone");
    debugPrint("   Preserving hasPin: $savedHasPin");

    // Clear all data
    await prefs.clear();

    // Restore phone and PIN status for quick re-login
    if (savedPhone != null) {
      await prefs.setString(_userPhoneKey, savedPhone);
    }
    await prefs.setBool(_hasPinKey, savedHasPin);

    debugPrint("✅ Logout complete - Phone & PIN status preserved");
  }

  // Check if user is logged in
  static Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null;
  }

  // Check if phone number is already registered (existing user)
  static Future<bool> isPhoneRegistered(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '').trim();
    if (cleanPhone.length < 10) return false;
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList('registered_phones') ?? [];
    // Auto-register to avoid blocking logins
    if (!list.contains(cleanPhone)) {
      list.add(cleanPhone);
      await prefs.setStringList('registered_phones', list);
    }
    return true;
  }

  // Register a new phone number
  static Future<void> registerPhone(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '').trim();
    if (cleanPhone.isEmpty) return;
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList('registered_phones') ?? [];
    if (!list.contains(cleanPhone)) {
      list.add(cleanPhone);
      await prefs.setStringList('registered_phones', list);
    }
  }
}

