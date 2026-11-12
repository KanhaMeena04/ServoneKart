import 'package:flutter/foundation.dart' show kIsWeb;

import 'dart:io' show Platform;

class ApiConstants {
  // Pass --dart-define-from-file=.env or --dart-define=BACKEND_URL=https://...
  // Pass --dart-define=USE_LOCAL=true or --dart-define=LOCAL_IP=192.168.x.x for local backend
  static const String _defaultProductionBackendUrl =
      'https://servonekart.onrender.com/api/v1';
  static const String _customBackendUrl =
      String.fromEnvironment('BACKEND_URL', defaultValue: _defaultProductionBackendUrl);
  static const String _customLocalIp =
      String.fromEnvironment('LOCAL_IP', defaultValue: '');
  static const bool _useLocalBackend =
      bool.fromEnvironment('USE_LOCAL', defaultValue: false);

  static String get baseUrl {
    if (_customLocalIp.isNotEmpty) {
      return 'http://$_customLocalIp:5000/api/v1';
    }
    if (_useLocalBackend) {
      if (kIsWeb) return 'http://localhost:5000/api/v1';
      try {
        if (Platform.isAndroid) return 'http://10.0.2.2:5000/api/v1';
      } catch (_) {}
      return 'http://localhost:5000/api/v1';
    }
    return _customBackendUrl.isNotEmpty
        ? _customBackendUrl
        : _defaultProductionBackendUrl;
  }

  static const String _customSocketUrl =
      String.fromEnvironment('SOCKET_URL', defaultValue: '');
  static String get socketUrl => _customSocketUrl.isNotEmpty
      ? _customSocketUrl
      : baseUrl.replaceAll(RegExp(r'/api(/v1)?/?$'), '');

  static const String websiteUrl = String.fromEnvironment(
    'WEBSITE_URL',
    defaultValue: 'https://tricelynwebsite.vercel.app',
  );
  static const String adminUrl = String.fromEnvironment(
    'ADMIN_URL',
    defaultValue: 'https://tricelynadmin.vercel.app',
  );

  static const String razorpayKeyId = String.fromEnvironment('RAZORPAY_KEY_ID', defaultValue: 'rzp_test_placeholder');

  // Auth endpoints (Driver specific)
  static String get sendOtp => "$baseUrl/auth/driver/send-otp";
  static String get verifyOtp => "$baseUrl/auth/driver/verify-otp";
  static String get loginWithPin => "$baseUrl/auth/driver/login-with-pin";
  static String get refreshToken => "$baseUrl/auth/driver/refresh-token";
  static String get deleteAccount => "$baseUrl/drivers/delete-account";

  // ✅ Rider Profile & Status
  static String get riderProfile => "$baseUrl/riders/profile";
  static String get riderOnboard => "$baseUrl/riders/onboard";
  static String get riderStatus => "$baseUrl/riders/status";

  // User endpoints
  static String get profile => "$baseUrl/user/me";
  static String get saveFcmToken => "$baseUrl/user/fcm-token";
  static String get riderFcmToken => "$baseUrl/riders/fcm-token";

  // ✅ Driver endpoints
  static String get driverToggleOnline => "$baseUrl/drivers/toggle-online";
  static String get driverReachedStore => "$baseUrl/drivers/reached-store";
  static String get driverOrders => "$baseUrl/orders/driver/my-orders";
  static String get driverUpdateStatus => "$baseUrl/orders/driver/update-status";

  // ✅ Order endpoints
  static String get driverActiveOrders => "$baseUrl/drivers/orders/active";
  static String get driverOrderHistory => "$baseUrl/drivers/orders/history";
  static String get driverSummary => "$baseUrl/drivers/summary";
  static String get driverWallet => "$baseUrl/payment/rider/wallet";
  static String get orderDetails => "$baseUrl/orders"; // + /{orderId}
  static String get updateOrderStatus => "$baseUrl/orders";

  // 💰 Payment & COD endpoints (New Backend)
  static String get confirmCod => "$baseUrl/payment/cod/confirm";
  static String get getCodBalance => "$baseUrl/payment/rider/wallet";
  static String get initiateCodPayment => "$baseUrl/drivers/cod-payment/initiate";
  static String get verifyCodPayment => "$baseUrl/drivers/cod-payment/verify";

  // ✅ Location endpoints
  static String get updateLocation => "$baseUrl/drivers/update-location";
}
