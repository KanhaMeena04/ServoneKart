import 'dart:ui';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'firebase_options.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/splash_screen.dart';
import 'api_constants.dart';
import 'services/notification_service.dart';
import 'services/platform_config_service.dart';
import 'services/restaurant_auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  await RestaurantNotificationService.initialize();
  await PlatformConfigService.loadCached();
  PlatformConfigService.fetchSettings();

  if (!kIsWeb) {
    await FirebaseCrashlytics.instance
        .setCrashlyticsCollectionEnabled(kReleaseMode);

    FlutterError.onError = (FlutterErrorDetails details) {
      FlutterError.presentError(details);
      FirebaseCrashlytics.instance.recordFlutterFatalError(details);
    };

    PlatformDispatcher.instance.onError = (error, stack) {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
      return true;
    };
  }

  final prefs = await SharedPreferences.getInstance();
  final savedId = prefs.getString('restaurantId') ?? '';
  final savedToken = prefs.getString('token') ?? '';
  await RestaurantAuthService.hydrateRbacFromPrefs();

  final hasSession = savedId.isNotEmpty && savedToken.isNotEmpty;
  if (hasSession) {
    ApiConstants.setAuthenticatedSession(
      restaurantId: savedId,
      authToken: savedToken,
    );
  }

  runApp(RestaurantApp(hasToken: hasSession));
}

class RestaurantApp extends StatelessWidget {
  final bool hasToken;
  const RestaurantApp({super.key, required this.hasToken});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tricelyn Partner',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0055FF),
          primary: const Color(0xFF0055FF),
          secondary: const Color(0xFF00B4D8),
          surface: Colors.white,
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFF),
        useMaterial3: true,
      ),
      home: SplashScreen(hasToken: hasToken),
    );
  }
}
