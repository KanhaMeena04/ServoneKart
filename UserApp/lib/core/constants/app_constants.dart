import 'package:flutter/foundation.dart' show kIsWeb, defaultTargetPlatform, TargetPlatform;

class AppConstants {
  static const String appName = 'ServoneKart';
  static const String appTagline = 'Food Delivery App';
  
  // Pass --dart-define=BACKEND_URL=https://... or --dart-define=LOCAL_IP=192.168.x.x for custom backend
  static const String _customBackendUrl = String.fromEnvironment('BACKEND_URL', defaultValue: '');
  static const String _customLocalIp = String.fromEnvironment('LOCAL_IP', defaultValue: '');

  static String get baseUrl {
    if (_customBackendUrl.isNotEmpty) {
      return _customBackendUrl;
    }
    if (_customLocalIp.isNotEmpty) {
      return 'http://$_customLocalIp:5000/api/v1';
    }
    if (kIsWeb) return 'http://localhost:5000/api/v1';
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:5000/api/v1';
    }
    return 'http://localhost:5000/api/v1';
  }

  // Razorpay Key ID
  static const String razorpayKey = String.fromEnvironment('RAZORPAY_KEY_ID', defaultValue: 'rzp_test_placeholder');
  
  static const Duration splashDuration = Duration(seconds: 3);
  
  static const double defaultPadding = 16.0;
  static const double defaultRadius = 12.0;
  
  static const List<String> categories = [
    'Pizza',
    'Burger',
    'Noodles',
    'Pasta',
    'Chinese',
    'Indian',
    'Desserts',
    'Beverages',
  ];
}
