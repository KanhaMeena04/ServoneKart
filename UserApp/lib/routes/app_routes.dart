import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/models/restaurant_models.dart';
import '../pages/auth/otp_page.dart';
import '../pages/auth/verify_google_phone_page.dart';
import '../pages/auth/register_page.dart';
import '../pages/category_product/category_products.dart';
import '../pages/food_delivery/home_page.dart';
import '../pages/food_delivery/restaurant_detail_screen.dart';
import '../pages/category_selection/categories_page.dart';
import '../pages/splash_screen/splash_page.dart';
import '../pages/onboarding/onboarding_page.dart';
import '../pages/auth/login_page.dart';
import '../pages/cart/cart_page.dart';
import '../pages/checkout/checkout_page.dart';
import '../pages/order/checkout_page.dart';
import '../pages/order/orders_page.dart';
import '../pages/order/order_details_page.dart';
import '../pages/search/search_page.dart';
import '../pages/profile/location_setup_page.dart';
import '../pages/profile/unserviceable_location_page.dart';
import '../pages/checkout/map_address_picker_page.dart';
import '../pages/order/contact_support_page.dart';
import '../pages/wishlist/wishlist_tab.dart';
import '../pages/grocery/grocery_page.dart';
import '../pages/home_services/home_services_page.dart';
import '../pages/courier/courier_booking_page.dart';
import '../pages/pharmacy/pharmacy_page.dart';
import '../pages/laundry/laundry_booking_page.dart';
import '../pages/essentials/essentials_page.dart';

class AppRoutes {
  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String contactSupport = '/contact-support';
  static const String locationSetup = '/location-setup';
  static const String mapAddressPicker = '/map-address-picker';
  static const String unserviceable = '/unserviceable';
  static const String login = '/login';
  static const String otpPage = '/otp_page';
  static const String verifyGooglePhone = '/verify-google-phone';
  static const String home = '/home';
  static const String restaurantDetail = '/restaurant_detail';
  static const String categoryProduct = '/category_products';
  static const String categories = '/categories';
  static const String productDetail = '/product-detail';
  static const String cart = '/cart';
  static const String checkout = '/checkout';
  static const String orders = '/orders';
  static const String orderDetails = '/order-details';
  static const String profile = '/profile';
  static const String wishlist = '/wishlist';
  static const String search = '/search';
  static const String location = '/location';

  // Super App Multi-Service Routes
  static const String grocery = '/grocery';
  static const String homeServices = '/home-services';
  static const String courier = '/courier';
  static const String pharmacy = '/pharmacy';
  static const String laundry = '/laundry';
  static const String essentials = '/essentials';

  static final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>();

  static final router = GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: splash,
    routes: [
      GoRoute(
        path: splash,
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: onboarding,
        builder: (context, state) => const OnboardingPage(),
      ),
      GoRoute(
        path: locationSetup,
        builder: (context, state) => const LocationSetupPage(),
      ),
      GoRoute(
        path: mapAddressPicker,
        builder: (context, state) => const MapAddressPickerPage(),
      ),
      GoRoute(
        path: unserviceable,
        builder: (context, state) => const UnserviceableLocationPage(),
      ),
      GoRoute(
        path: login,
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: otpPage,
        builder: (context, state) => const OtpPage(),
      ),
      GoRoute(
        path: verifyGooglePhone,
        builder: (context, state) {
          final extra = state.extra;
          final googleUser = extra is Map<String, dynamic> ? extra : <String, dynamic>{};
          return VerifyGooglePhonePage(googleUser: googleUser);
        },
      ),
      GoRoute(
        path: restaurantDetail,
        builder: (context, state) {
          final extra = state.extra;
          if (extra is Restaurant) {
            return RestaurantDetailScreen(restaurant: extra);
          }
          if (extra is Map<String, dynamic>) {
            try {
              return RestaurantDetailScreen(restaurant: Restaurant.fromJson(extra));
            } catch (_) {
              final id = extra['_id']?.toString() ?? extra['id']?.toString() ?? '';
              final slug = extra['slug']?.toString() ?? '';
              return RestaurantDetailScreen(restaurantId: id, slug: slug);
            }
          }
          final slug = state.uri.queryParameters['slug'] ?? '';
          final id = state.uri.queryParameters['id'] ?? '';
          return RestaurantDetailScreen(slug: slug, restaurantId: id);
        },
      ),
      GoRoute(
        path: '$restaurantDetail/:slug',
        builder: (context, state) {
          final slug = state.pathParameters['slug'] ?? '';
          return RestaurantDetailScreen(slug: slug);
        },
      ),
      GoRoute(
        path: '/restaurant-detail',
        builder: (context, state) {
          final extra = state.extra;
          if (extra is Restaurant) {
            return RestaurantDetailScreen(restaurant: extra);
          }
          if (extra is Map<String, dynamic>) {
            try {
              return RestaurantDetailScreen(restaurant: Restaurant.fromJson(extra));
            } catch (_) {
              final id = extra['_id']?.toString() ?? extra['id']?.toString() ?? '';
              final slug = extra['slug']?.toString() ?? '';
              return RestaurantDetailScreen(restaurantId: id, slug: slug);
            }
          }
          final slug = state.uri.queryParameters['slug'] ?? '';
          final id = state.uri.queryParameters['id'] ?? '';
          return RestaurantDetailScreen(slug: slug, restaurantId: id);
        },
      ),
      GoRoute(
        path: '/restaurant-detail/:slug',
        builder: (context, state) {
          final slug = state.pathParameters['slug'] ?? '';
          return RestaurantDetailScreen(slug: slug);
        },
      ),
      GoRoute(
        path: categoryProduct,
        builder: (context, state) {
          final cat = state.extra as String? ?? state.uri.queryParameters['cat'] ?? '';
          return CategoryProducts(cat: cat);
        },
      ),
      GoRoute(
        path: home,
        builder: (context, state) => const HomePage(),
      ),
      GoRoute(
        path: categories,
        builder: (context, state) => const CategoriesPage(),
      ),
      GoRoute(
        path: cart,
        builder: (context, state) => const CartPage(),
      ),
      GoRoute(
        path: checkout,
        builder: (context, state) => const CheckoutPage(),
      ),
      GoRoute(
        path: orders,
        builder: (context, state) => const OrdersPage(),
      ),
      GoRoute(
        path: '$orderDetails/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return OrderDetailsPage(orderId: id);
        },
      ),
      GoRoute(
        path: search,
        builder: (context, state) => const SearchPage(),
      ),
      GoRoute(
        path: location,
        builder: (context, state) => const MapAddressPickerPage(),
      ),
      GoRoute(
        path: wishlist,
        builder: (context, state) => const WishlistTab(),
      ),
      GoRoute(
        path: contactSupport,
        builder: (context, state) {
          final orderId = state.uri.queryParameters['orderId'];
          return ContactSupportPage(orderId: orderId);
        },
      ),
      GoRoute(
        path: '/support',
        builder: (context, state) {
          final orderId = state.uri.queryParameters['orderId'];
          return ContactSupportPage(orderId: orderId);
        },
      ),

      // Super App Multi-Service Routes
      GoRoute(
        path: grocery,
        builder: (context, state) => const GroceryPage(),
      ),
      GoRoute(
        path: homeServices,
        builder: (context, state) => const HomeServicesPage(),
      ),
      GoRoute(
        path: courier,
        builder: (context, state) => const CourierBookingPage(),
      ),
      GoRoute(
        path: pharmacy,
        builder: (context, state) => const PharmacyPage(),
      ),
      GoRoute(
        path: laundry,
        builder: (context, state) => const LaundryBookingPage(),
      ),
      GoRoute(
        path: essentials,
        builder: (context, state) => const DailyEssentialsPage(),
      ),
    ],
  );
}
