import 'dart:io';
import 'dart:convert';
import 'dart:developer';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import '../../core/constants/api_constansts.dart';
import 'auth_service.dart';

class ApiService {
  static Future<Map<String, String>> _getHeaders() async {
    final token = await AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  static Map<String, dynamic> _tryDecode(String body) {
    try {
      final decoded = jsonDecode(body);
      if (decoded is Map<String, dynamic>) return decoded;
      if (decoded is Map) return Map<String, dynamic>.from(decoded);
    } catch (_) {}
    return <String, dynamic>{};
  }

  // ==================== AUTH ENDPOINTS ====================

  static Future<Map<String, dynamic>> sendOtp(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '').trim();
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.sendOtp),
        headers: await _getHeaders(),
        body: jsonEncode({'phone': '+91$cleanPhone', 'mobile': '+91$cleanPhone'}),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {'success': true, 'message': data['message'] ?? 'OTP sent successfully to +91$cleanPhone', 'data': data};
      } else {
        return {'success': false, 'message': data['message'] ?? 'Failed to send OTP'};
      }
    } catch (e) {
      log("Error sending OTP to backend: $e");
      return {"success": false, "message": "Network error sending OTP: $e"};
    }
  }

  static Future<Map<String, dynamic>> verifyOtp(
    String phone,
    String otp, {
    String? pin,
  }) async {
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '').trim();
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.verifyOtp),
        headers: await _getHeaders(),
        body: jsonEncode({'phone': '+91$cleanPhone', 'mobile': '+91$cleanPhone', 'otp': otp.trim(), if (pin != null && pin.isNotEmpty) 'pin': pin.trim()}),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300 && data['success'] == true) {
        final token = data['token'] ?? data['data']?['token'] ?? data['authToken'];
        final refreshToken = data['refreshToken'] ?? data['data']?['refreshToken'] ?? token;
        if (token != null) {
          await AuthService.saveTokens(token.toString(), refreshToken.toString(), cleanPhone, hasPin: pin != null && pin.isNotEmpty);
          await AuthService.registerPhone(cleanPhone);
        }
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'message': data['message'] ?? 'Invalid OTP code'};
      }
    } catch (e) {
      log("Error verifying OTP with backend: $e");
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> loginWithPin(
    String phone,
    String pin,
  ) async {
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '').trim();
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.loginWithPin),
        headers: await _getHeaders(),
        body: jsonEncode({'phone': '+91$cleanPhone', 'mobile': '+91$cleanPhone', 'pin': pin.trim()}),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300 && data['success'] == true) {
        final token = data['token'] ?? data['data']?['token'] ?? data['authToken'];
        final refreshToken = data['refreshToken'] ?? data['data']?['refreshToken'] ?? token;
        if (token != null) {
          await AuthService.saveTokens(token.toString(), refreshToken.toString(), cleanPhone, hasPin: true);
        }
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'message': data['message'] ?? 'Galat PIN (Invalid PIN)'};
      }
    } catch (e) {
      log("Error login with PIN: $e");
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await http.get(
        Uri.parse(ApiConstants.riderProfile),
        headers: await _getHeaders(),
      ).timeout(const Duration(seconds: 10));

      final data = _tryDecode(response.body);
      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': data['data'] ?? data,
          'user': data['user'] ?? data['data']?['user'],
          'rider': data['rider'] ?? data['data']?['rider'] ?? data['data'],
        };
      }
      return {
        'success': false,
        'statusCode': response.statusCode,
        'message': data['message'] ?? 'Failed to fetch profile',
      };
    } catch (e) {
      log("Error fetching profile: $e");
      return {"success": false, "message": "Failed to fetch profile: $e"};
    }
  }

  static Future<Map<String, dynamic>> updateUpiId(String upiId) async {
    try {
      final response = await http.patch(
        Uri.parse(ApiConstants.riderProfile),
        headers: await _getHeaders(),
        body: jsonEncode({
          'upiId': upiId.trim(),
          'upi': upiId.trim(),
          'bankDetails': {
            'upiId': upiId.trim(),
            'upi': upiId.trim(),
          }
        }),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {'success': true, 'message': data['message'] ?? 'UPI ID updated successfully', 'data': data};
      }
      return {'success': false, 'message': data['message'] ?? 'Failed to update UPI ID'};
    } catch (e) {
      log("Error updating UPI ID: $e");
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  // ==================== DRIVER ENDPOINTS ====================

  static Future<Map<String, dynamic>> toggleOnlineStatus(bool isOnline) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.driverToggleOnline),
        headers: await _getHeaders(),
        body: jsonEncode({'isOnline': isOnline, 'status': isOnline ? 'active' : 'inactive'}),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      final isSuccess = response.statusCode == 200 && (data['success'] != false);
      return {
        'success': isSuccess,
        'isOnline': isSuccess ? isOnline : false,
        'message': data['message'] ?? (isSuccess ? 'Status updated' : 'Failed to update status'),
        'data': data
      };
    } catch (e) {
      log("Error toggle online status: $e");
      return {"success": false, "isOnline": false, "message": "Connection error: $e"};
    }
  }

  static Future<Map<String, dynamic>> getRiderStatus() async {
    try {
      final response = await http.get(
        Uri.parse(ApiConstants.riderStatus),
        headers: await _getHeaders(),
      ).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data is Map<String, dynamic> ? data : {'success': true, 'data': data};
      }
      return {'success': false};
    } catch (e) {
      log("Error fetching rider status: $e");
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> markReachedStore([String? orderId]) async {
    try {
      final http.Response response;
      if (orderId != null && orderId.isNotEmpty) {
        response = await http.put(
          Uri.parse("${ApiConstants.baseUrl}/riders/orders/$orderId/arrive-restaurant"),
          headers: await _getHeaders(),
        ).timeout(const Duration(seconds: 15));
      } else {
        response = await http.post(
          Uri.parse(ApiConstants.driverReachedStore),
          headers: await _getHeaders(),
          body: jsonEncode({}),
        ).timeout(const Duration(seconds: 15));
      }

      final data = _tryDecode(response.body);
      final ok = response.statusCode >= 200 && response.statusCode < 300 && data['success'] != false;
      return {
        'success': ok,
        'message': data['message'] ?? (ok ? 'Reached store status updated' : 'Failed to update store arrival'),
      };
    } catch (e) {
      log("Error mark reached store: $e");
      return {"success": false, "message": "Network error updating store arrival: $e"};
    }
  }

  static Future<Map<String, dynamic>> updateLocation({
    required double latitude,
    required double longitude,
    double? speed,
    double? heading,
  }) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.updateLocation),
        headers: await _getHeaders(),
        body: jsonEncode({
          'latitude': latitude,
          'longitude': longitude,
          'speed': speed,
          'heading': heading,
        }),
      ).timeout(const Duration(seconds: 10));
      final ok = response.statusCode >= 200 && response.statusCode < 300;
      return {"success": ok};
    } catch (e) {
      return {"success": false, "message": "Location sync error: $e"};
    }
  }

  // ==================== ORDER ENDPOINTS ====================

  static Future<Map<String, dynamic>> getActiveOrders() async {
    try {
      final response = await http.get(
        Uri.parse(ApiConstants.driverActiveOrders),
        headers: await _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);
        final list = data is Map ? (data['orders'] ?? data['data'] ?? []) : (data is List ? data : []);
        if (list is List) {
          return {'success': true, 'data': list};
        }
        return {'success': true, 'data': data};
      }
      final errData = _tryDecode(response.body);
      return {'success': false, 'data': [], 'message': errData['message'] ?? 'Failed to fetch active orders'};
    } catch (e) {
      log("Error fetching active orders: $e");
      return {"success": false, "data": [], "message": "Network error loading active orders: $e"};
    }
  }

  static Future<Map<String, dynamic>> getOrderHistory() async {
    try {
      final response = await http.get(
        Uri.parse(ApiConstants.driverOrderHistory),
        headers: await _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);
        final list = data is Map ? (data['orders'] ?? data['data'] ?? []) : (data is List ? data : []);
        if (list is List) {
          return {'success': true, 'data': list};
        }
        return {'success': true, 'data': data};
      }
      final errData = _tryDecode(response.body);
      return {'success': false, 'data': [], 'message': errData['message'] ?? 'Failed to fetch order history'};
    } catch (e) {
      log("Error fetching order history: $e");
      return {"success": false, "data": [], "message": "Network error loading order history: $e"};
    }
  }

  static Future<Map<String, dynamic>> getOrderDetails(String orderId) async {
    try {
      final response = await http.get(
        Uri.parse("${ApiConstants.orderDetails}/$orderId"),
        headers: await _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {'success': true, 'data': data['data'] ?? data['order'] ?? data};
      }
    } catch (e) {
      log("Error fetching order details: $e");
    }
    return {"success": false, "message": "Order not found"};
  }

  static Future<Map<String, dynamic>> updateOrderStatus({
    required String orderId,
    required String status,
    String? otp,
  }) async {
    try {
      final response = await http.put(
        Uri.parse("${ApiConstants.baseUrl}/orders/$orderId/status"),
        headers: await _getHeaders(),
        body: jsonEncode({
          'status': status,
          if (otp != null) ...{'otp': otp},
        }),
      ).timeout(const Duration(seconds: 15));

      final data = _tryDecode(response.body);
      final ok = response.statusCode >= 200 && response.statusCode < 300 && data['success'] != false;
      return {
        'success': ok,
        'message': data['message'] ?? (ok ? 'Order status updated to $status' : 'Failed to update order status'),
        'data': data,
      };
    } catch (e) {
      log("Error updating order status: $e");
      return {"success": false, "message": "Network error updating order status: $e"};
    }
  }

  static Future<Map<String, dynamic>> rateCustomer({
    required String orderId,
    required double rating,
    String? note,
  }) async {
    try {
      final response = await http.post(
        Uri.parse("${ApiConstants.baseUrl}/orders/$orderId/rate-customer"),
        headers: await _getHeaders(),
        body: jsonEncode({
          'rating': rating,
          'note': note ?? '',
        }),
      ).timeout(const Duration(seconds: 15));
      final data = _tryDecode(response.body);
      final ok = response.statusCode >= 200 && response.statusCode < 300 && data['success'] != false;
      return {
        'success': ok,
        'message': data['message'] ?? (ok ? 'Customer rated successfully' : 'Failed to submit rating'),
      };
    } catch (e) {
      log("Error rating customer: $e");
      return {"success": false, "message": "Network error submitting rating: $e"};
    }
  }

  static Future<Map<String, dynamic>> sendPickupOtp(String orderId) async {
    try {
      final response = await http.post(
        Uri.parse("${ApiConstants.baseUrl}/riders/orders/$orderId/resend-pickup-otp"),
        headers: await _getHeaders(),
      ).timeout(const Duration(seconds: 15));
      final data = _tryDecode(response.body);
      final ok = response.statusCode >= 200 && response.statusCode < 300 && data['success'] != false;
      return {'success': ok, 'message': data['message'] ?? (ok ? 'Pickup OTP sent' : 'Failed to send pickup OTP')};
    } catch (e) {
      return {"success": false, "message": "Failed to send pickup OTP: $e"};
    }
  }

  static Future<Map<String, dynamic>> sendDeliveryOtp(String orderId) async {
    try {
      final response = await http.post(
        Uri.parse("${ApiConstants.baseUrl}/riders/orders/$orderId/resend-delivery-otp"),
        headers: await _getHeaders(),
      ).timeout(const Duration(seconds: 15));
      final data = _tryDecode(response.body);
      final ok = response.statusCode >= 200 && response.statusCode < 300 && data['success'] != false;
      return {
        'success': ok,
        'message': data['message'] ?? (ok ? 'Delivery OTP sent to customer' : 'Failed to send delivery OTP'),
      };
    } catch (e) {
      return {"success": false, "message": "Failed to send delivery OTP: $e"};
    }
  }

  static Future<Map<String, dynamic>> completeDeliveryWithOTP({
    required String orderId,
    required String otp,
  }) async {
    try {
      final response = await http.post(
        Uri.parse("${ApiConstants.baseUrl}/riders/orders/verify-delivery"),
        headers: await _getHeaders(),
        body: jsonEncode({'orderId': orderId, 'otp': otp.trim()}),
      ).timeout(const Duration(seconds: 15));

      final data = _tryDecode(response.body);
      final ok = response.statusCode >= 200 && response.statusCode < 300 && data['success'] != false;
      return {
        'success': ok,
        'message': data['message'] ?? (ok ? 'Delivery completed successfully!' : 'Invalid OTP or verification failed'),
      };
    } catch (e) {
      log("Error completing delivery: $e");
      return {"success": false, "message": "Network error completing delivery: $e"};
    }
  }

  static Future<Map<String, dynamic>> acceptOrder(String orderId) async {
    try {
      final response = await http.post(
        Uri.parse("${ApiConstants.baseUrl}/riders/orders/$orderId/accept"),
        headers: await _getHeaders(),
      ).timeout(const Duration(seconds: 15));
      final data = _tryDecode(response.body);
      final ok = response.statusCode >= 200 && response.statusCode < 300 && data['success'] != false;
      return {
        'success': ok,
        'message': data['message'] ?? (ok ? 'Order accepted' : 'Failed to accept order'),
        'data': data,
      };
    } catch (e) {
      return {"success": false, "message": "Network error accepting order: $e"};
    }
  }

  static Future<Map<String, dynamic>> declineOrder(String orderId, {String? reason}) async {
    try {
      final response = await http.post(
        Uri.parse("${ApiConstants.baseUrl}/riders/orders/$orderId/reject"),
        headers: await _getHeaders(),
        body: jsonEncode({
          if (reason != null) ...{'reason': reason},
        }),
      ).timeout(const Duration(seconds: 15));
      final data = _tryDecode(response.body);
      final ok = response.statusCode >= 200 && response.statusCode < 300 && data['success'] != false;
      return {
        'success': ok,
        'message': data['message'] ?? (ok ? 'Order declined' : 'Failed to decline order'),
        'data': data,
      };
    } catch (e) {
      return {"success": false, "message": "Network error declining order: $e"};
    }
  }

  static Future<Map<String, dynamic>> getDriverSummary() async {
    try {
      final response = await http.get(
        Uri.parse(ApiConstants.driverSummary),
        headers: await _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);
        return {'success': true, 'data': data['data'] ?? data};
      }
      final errData = _tryDecode(response.body);
      return {'success': false, 'message': errData['message'] ?? 'Failed to fetch summary'};
    } catch (e) {
      log("Error fetching driver summary: $e");
      return {"success": false, "message": "Network error fetching summary: $e"};
    }
  }
  static Future<String?> uploadImage(File imageFile) async {
    try {
      final token = await AuthService.getToken();
      final uploadUrl = '${ApiConstants.baseUrl}/upload';
      final request = http.MultipartRequest('POST', Uri.parse(uploadUrl));
      if (token != null && token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      request.files.add(await http.MultipartFile.fromPath('image', imageFile.path));
      final streamedResponse = await request.send().timeout(const Duration(seconds: 30));
      final response = await http.Response.fromStream(streamedResponse);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['url'] != null) {
          return data['url'].toString();
        }
      }
    } catch (e) {
      log('Error uploading image: $e');
    }
    return null;
  }

  static Future<bool> updateRiderProfilePic(String imageUrl) async {
    try {
      final token = await AuthService.getToken();
      final url = Uri.parse('${ApiConstants.baseUrl}/rider/profile');
      final response = await http.patch(
        url,
        headers: {
          'Content-Type': 'application/json',
          if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'profilePic': imageUrl,
          'avatar': imageUrl,
          'profileImage': imageUrl,
          'image': imageUrl,
        }),
      ).timeout(const Duration(seconds: 15));
      return response.statusCode >= 200 && response.statusCode < 300;
    } catch (e) {
      log('Error updating rider profile pic: $e');
      return false;
    }
  }

  static Future<Map<String, dynamic>> uploadDriverDocuments({
    required String name,
    required String upi,
    String? email,
    XFile? profileImage,
    XFile? aadharFront,
    XFile? aadharBack,
    XFile? license,
  }) async {
    try {
      final uri = Uri.parse(ApiConstants.riderOnboard);
      final request = http.MultipartRequest('POST', uri);
      final token = await AuthService.getToken();
      if (token != null && token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }

      request.fields['name'] = name;
      request.fields['upi'] = upi;
      if (email != null) request.fields['email'] = email;

      Future<void> attachFile(String field, XFile file) async {
        if (kIsWeb) {
          final bytes = await file.readAsBytes();
          request.files.add(http.MultipartFile.fromBytes(field, bytes, filename: file.name));
        } else {
          request.files.add(await http.MultipartFile.fromPath(field, file.path));
        }
      }

      if (profileImage != null) await attachFile('profilePic', profileImage);
      if (aadharFront != null) await attachFile('aadharCardImage', aadharFront);
      if (aadharBack != null) await attachFile('aadharBackImage', aadharBack);
      if (license != null) await attachFile('licenseFrontImage', license);

      final streamedResponse = await request.send().timeout(const Duration(seconds: 30));
      final response = await http.Response.fromStream(streamedResponse);
      final data = _tryDecode(response.body);
      final ok = response.statusCode >= 200 && response.statusCode < 300 && data['success'] != false;
      return {
        'success': ok,
        'message': data['message'] ?? (ok ? 'Documents uploaded successfully' : 'Failed to upload documents'),
      };
    } catch (e) {
      log("Error uploading driver documents: $e");
      return {"success": false, "message": "Failed to upload documents: $e"};
    }
  }

  static Future<Map<String, dynamic>> completeRiderOnboarding(Map<String, dynamic> payload) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConstants.riderOnboard),
        headers: await _getHeaders(),
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 20));

      final data = _tryDecode(response.body);
      final ok = response.statusCode >= 200 && response.statusCode < 300 && data['success'] != false;
      return {
        'success': ok,
        'message': data['message'] ?? (ok ? 'Rider onboarding completed successfully' : 'Failed to complete onboarding'),
        'data': data
      };
    } catch (e) {
      log("Error completing rider onboarding: $e");
      return {"success": false, "message": "Network error completing onboarding: $e"};
    }
  }

  static Future<Map<String, dynamic>> getWalletSummary() async {
    try {
      final response = await http.get(
        Uri.parse(ApiConstants.driverWallet),
        headers: await _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final walletData = data['data']?['wallet'] ?? data['wallet'] ?? data['data'] ?? data;
        final bal = (walletData['availableBalance'] as num?)?.toDouble() ?? (data['data']?['balance'] as num?)?.toDouble() ?? 0.0;
        final totalEarn = (walletData['totalEarnings'] as num?)?.toDouble() ?? 0.0;
        return {
          'success': true,
          'data': {
            'balance': bal,
            'billable_hours': data['data']?['billable_hours'] ?? "0.0",
            'today_orders': data['data']?['today_orders'] ?? 0,
            'recent_requests': data['data']?['recent_requests'] ?? []
          },
          'wallet': {
            'availableBalance': bal,
            'cashInHand': (walletData['cashInHand'] as num?)?.toDouble() ?? 0.0,
            'cashLimit': (walletData['cashLimit'] as num?)?.toDouble() ?? 2000.0,
            'isFrozen': walletData['isFrozen'] ?? false,
            'totalEarnings': totalEarn,
            'transactions': walletData['transactions'] ?? []
          }
        };
      }
      final errData = _tryDecode(response.body);
      return {'success': false, 'message': errData['message'] ?? 'Failed to fetch wallet summary'};
    } catch (e) {
      log("Error fetching wallet summary: $e");
      return {"success": false, "message": "Network error fetching wallet summary: $e"};
    }
  }

  static Future<Map<String, dynamic>> getCodBalance() async {
    try {
      final response = await http.get(
        Uri.parse(ApiConstants.getCodBalance),
        headers: await _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {'success': true, 'data': data['data'] ?? data};
      }
      final errData = _tryDecode(response.body);
      return {'success': false, 'message': errData['message'] ?? 'Failed to fetch COD balance'};
    } catch (e) {
      log("Error fetching COD balance: $e");
      return {"success": false, "message": "Network error fetching COD balance: $e"};
    }
  }

  static Future<Map<String, dynamic>> requestWithdrawal(
    double amount, {
    String? method,
    Map<String, dynamic>? bankDetails,
  }) async {
    try {
      final Map<String, dynamic> payload = {'amount': amount};
      if (method != null) payload['method'] = method;
      if (bankDetails != null) payload['bankDetails'] = bankDetails;

      final response = await http.post(
        Uri.parse("${ApiConstants.baseUrl}/riders/withdraw"),
        headers: await _getHeaders(),
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      final isSuccess = (response.statusCode >= 200 && response.statusCode < 300) && (data['success'] != false);
      return {
        'success': isSuccess,
        'message': data['message'] ?? (isSuccess ? 'Withdrawal request submitted successfully' : 'Failed to submit withdrawal request'),
        'data': data
      };
    } catch (e) {
      log("Error requesting withdrawal: $e");
      return {"success": false, "message": "Connection error: $e"};
    }
  }

  static Future<List<Map<String, dynamic>>> getWithdrawals() async {
    try {
      final response = await http.get(
        Uri.parse("${ApiConstants.baseUrl}/riders/withdrawals"),
        headers: await _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['requests'] is List) {
          return List<Map<String, dynamic>>.from(data['requests']);
        }
      }
    } catch (e) {
      log("Error fetching withdrawals: $e");
    }
    return [];
  }

  static Future<Map<String, dynamic>> confirmCodCollection({
    required String orderId,
    required double amountCollected,
  }) async {
    try {
      final response = await http.put(
        Uri.parse("${ApiConstants.baseUrl}/riders/orders/$orderId/collect-cash"),
        headers: await _getHeaders(),
        body: jsonEncode({'amount': amountCollected}),
      ).timeout(const Duration(seconds: 15));

      final data = _tryDecode(response.body);
      final ok = response.statusCode >= 200 && response.statusCode < 300 && data['success'] != false;
      return {
        'success': ok,
        'message': data['message'] ?? (ok ? 'COD payment recorded successfully' : 'Failed to record COD collection'),
      };
    } catch (e) {
      log("Error confirming COD collection: $e");
      return {"success": false, "message": "Network error recording COD collection: $e"};
    }
  }

  static Future<Map<String, dynamic>> deleteAccount() async {
    try {
      final response = await http.delete(
        Uri.parse(ApiConstants.deleteAccount),
        headers: await _getHeaders(),
      ).timeout(const Duration(seconds: 15));

      final data = _tryDecode(response.body);
      final ok = response.statusCode >= 200 && response.statusCode < 300 && data['success'] != false;
      return {
        'success': ok,
        'message': data['message'] ?? (ok ? 'Account deleted successfully' : 'Failed to delete account'),
      };
    } catch (e) {
      return {"success": false, "message": "Network error deleting account: $e"};
    }
  }

  static Future<bool> saveFcmToken(String token) async {
    if (token.isEmpty) return false;
    try {
      final headers = await _getHeaders();
      final body = jsonEncode({'fcmToken': token});
      var response = await http.post(
        Uri.parse(ApiConstants.saveFcmToken),
        headers: headers,
        body: body,
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode != 200 && response.statusCode != 201) {
        response = await http.post(
          Uri.parse(ApiConstants.riderFcmToken),
          headers: headers,
          body: body,
        ).timeout(const Duration(seconds: 10));
      }

      log("FCM Token registration response: ${response.statusCode}");
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      log("Error registering FCM token: $e");
      return false;
    }
  }
}
