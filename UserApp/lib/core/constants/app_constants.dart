import 'package:flutter/foundation.dart' show kIsWeb, defaultTargetPlatform, TargetPlatform;

class AppConstants {
  static const String appName = 'Tricelyn';
  static const String appTagline = 'Fresh Groceries in 10-15 Mins';
  
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
      if (defaultTargetPlatform == TargetPlatform.android) {
        return 'http://10.0.2.2:5000/api/v1';
      }
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

  // Razorpay Key ID
  static const String razorpayKey = String.fromEnvironment('RAZORPAY_KEY_ID', defaultValue: 'rzp_test_placeholder');
  
  static const Duration splashDuration = Duration(seconds: 3);
  
  static const double defaultPadding = 16.0;
  static const double defaultRadius = 12.0;
  
  static const List<String> categories = [
    'Vegetables & Fruits',
    'Dairy, Bread & Eggs',
    'Atta, Rice & Dal',
    'Oil, Ghee & Masala',
    'Snacks & Munchies',
    'Cold Drinks & Juices',
    'Bakery & Biscuits',
    'Personal Care',
  ];
}
