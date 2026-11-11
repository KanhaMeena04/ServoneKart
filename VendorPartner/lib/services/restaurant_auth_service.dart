import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../api_constants.dart';
import 'platform_config_service.dart';

class RestaurantAuthService {
  static const String _tokenKey = 'token';
  static const String _restaurantIdKey = 'restaurantId';
  static const String _vendorDataKey = 'restaurant_vendor_data';
  static const String _assignedRoleKey = 'assignedRole';
  static const String _permissionsKey = 'permissions';
  static const String _businessTypeKey = 'businessType';
  static const String _verticalKey = 'vertical';

  static const List<String> _defaultPermissions = [
    'orders',
    'inventory',
    'products',
    'payouts',
    'settings',
  ];

  static String _cachedAssignedRole = 'Store Manager';
  static List<String> _cachedPermissions = List<String>.from(_defaultPermissions);
  static String _cachedBusinessType = 'grocery_store';
  static String _cachedVertical = 'grocery';

  static String get assignedRole => _cachedAssignedRole;
  static List<String> get permissions => List<String>.unmodifiable(_cachedPermissions);
  static String get businessType => _cachedBusinessType;
  static String get vertical => _cachedVertical;

  static bool get isGroceryStore {
    if (PlatformConfigService.isGroceryPlatform) return true;
    final v = _cachedVertical.toLowerCase();
    final bt = _cachedBusinessType.toLowerCase();
    if (v == 'grocery' || bt == 'grocery' || bt == 'grocery_store' || bt == 'essentials' || bt == 'dairy_milk') {
      return true;
    }
    return bt != 'restaurant' && v != 'food';
  }

  static bool hasPermission(String permission) {
    final target = permission.trim().toLowerCase();
    if (target.isEmpty) return true;
    if (_cachedPermissions.isEmpty) return true;
    final lowerPerms = _cachedPermissions.map((e) => e.toLowerCase()).toList();
    if (lowerPerms.contains('*') || lowerPerms.contains('all') || lowerPerms.contains('admin')) {
      return true;
    }
    if (lowerPerms.contains(target)) return true;
    // Allow 'products' and 'inventory' interchangeably for catalog & stock access
    if (target == 'catalog' || target == 'products' || target == 'inventory') {
      return lowerPerms.contains('products') || lowerPerms.contains('inventory') || lowerPerms.contains('menu');
    }
    if (target == 'analytics' || target == 'payouts' || target == 'wallet') {
      return lowerPerms.contains('payouts') || lowerPerms.contains('analytics') || lowerPerms.contains('wallet');
    }
    return false;
  }

  static Future<void> hydrateRbacFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final role = prefs.getString(_assignedRoleKey);
    if (role != null && role.trim().isNotEmpty) {
      _cachedAssignedRole = role.trim();
    }
    final permsRaw = prefs.getStringList(_permissionsKey);
    if (permsRaw != null && permsRaw.isNotEmpty) {
      _cachedPermissions = permsRaw;
    }
    final bt = prefs.getString(_businessTypeKey);
    if (bt != null && bt.trim().isNotEmpty) {
      _cachedBusinessType = bt.trim();
    }
    final v = prefs.getString(_verticalKey);
    if (v != null && v.trim().isNotEmpty) {
      _cachedVertical = v.trim();
    }
  }

  static Future<void> saveRbacContext({
    String? assignedRole,
    List<dynamic>? permissions,
    String? businessType,
    String? vertical,
    String? platformMode,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    if (assignedRole != null && assignedRole.trim().isNotEmpty) {
      _cachedAssignedRole = assignedRole.trim();
      await prefs.setString(_assignedRoleKey, _cachedAssignedRole);
    }
    if (permissions != null && permissions.isNotEmpty) {
      _cachedPermissions = permissions.map((e) => e.toString().trim()).where((e) => e.isNotEmpty).toList();
      if (_cachedPermissions.isEmpty) {
        _cachedPermissions = List<String>.from(_defaultPermissions);
      }
      await prefs.setStringList(_permissionsKey, _cachedPermissions);
    }
    if (businessType != null && businessType.trim().isNotEmpty) {
      _cachedBusinessType = businessType.trim();
      await prefs.setString(_businessTypeKey, _cachedBusinessType);
    }
    if (vertical != null && vertical.trim().isNotEmpty) {
      _cachedVertical = vertical.trim();
      await prefs.setString(_verticalKey, _cachedVertical);
    }
    if (platformMode != null && platformMode.trim().isNotEmpty) {
      await PlatformConfigService.setMode(platformMode);
    }
  }

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    final restId = prefs.getString(_restaurantIdKey);
    await hydrateRbacFromPrefs();
    if (token != null && token.isNotEmpty && restId != null && restId.isNotEmpty) {
      ApiConstants.setAuthenticatedSession(
        restaurantId: restId,
        authToken: token,
      );
      return true;
    }
    return false;
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<String?> getRestaurantId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_restaurantIdKey);
  }

  static Future<Map<String, dynamic>?> getVendorData() async {
    final prefs = await SharedPreferences.getInstance();
    final dataStr = prefs.getString(_vendorDataKey);
    if (dataStr != null) {
      try {
        return jsonDecode(dataStr);
      } catch (_) {}
    }
    return null;
  }

  static Future<void> saveAuthSession({
    required String token,
    required String restaurantId,
    Map<String, dynamic>? vendorData,
    String? assignedRole,
    List<dynamic>? permissions,
    String? businessType,
    String? vertical,
    String? platformMode,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_restaurantIdKey, restaurantId);
    if (vendorData != null) {
      await prefs.setString(_vendorDataKey, jsonEncode(vendorData));
    }
    await saveRbacContext(
      assignedRole: assignedRole ?? vendorData?['assignedRole']?.toString(),
      permissions: permissions ?? (vendorData?['permissions'] is List ? vendorData!['permissions'] as List : null),
      businessType: businessType ?? vendorData?['businessType']?.toString(),
      vertical: vertical ?? vendorData?['vertical']?.toString(),
      platformMode: platformMode,
    );
    ApiConstants.setAuthenticatedSession(
      restaurantId: restaurantId,
      authToken: token,
    );
  }

  static Future<Map<String, dynamic>> getSavedAuthSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    final restId = prefs.getString(_restaurantIdKey);
    final vendor = await getVendorData();
    await hydrateRbacFromPrefs();
    return {
      'token': token,
      'restaurantId': restId,
      'vendor': vendor,
      'assignedRole': _cachedAssignedRole,
      'permissions': _cachedPermissions,
      'businessType': _cachedBusinessType,
      'vertical': _cachedVertical,
    };
  }

  static Future<void> clearAuthSession() => logout();

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_restaurantIdKey);
    await prefs.remove(_vendorDataKey);
    await prefs.remove(_assignedRoleKey);
    await prefs.remove(_permissionsKey);
    await prefs.remove(_businessTypeKey);
    await prefs.remove(_verticalKey);
    _cachedAssignedRole = 'Store Manager';
    _cachedPermissions = List<String>.from(_defaultPermissions);
    _cachedBusinessType = 'grocery_store';
    _cachedVertical = 'grocery';
    ApiConstants.clearAuthenticatedSession();
  }
}
