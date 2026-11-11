import '../core/constants/app_constants.dart';
import '../core/config/app_mode.dart';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:io';
import 'auth_service.dart';

class PaymentService {
  // static String get baseUrl => '${AppConstants.baseUrl}/razorpay';
  static String get baseUrl => '${AppConstants.baseUrl}/razorpay';

  static Future<Map<String, dynamic>?> createOrder(
    double amount,
  ) async {
    if (kFrontendPreviewMode) {
      return {
        'success': true,
        'isSandbox': true,
        'id': 'rzp_preview_order_123',
        'amount': amount,
        'currency': 'INR',
      };
    }
    try {
      final token = await AuthService.getToken();
      final response = await http
          .post(
            Uri.parse("$baseUrl/create-order"),
            headers: {
              "Content-Type": "application/json",
              if (token != null) "Authorization": "Bearer $token",
            },
            body: jsonEncode({
              "amount": amount,
            }),
          )
          .timeout(const Duration(seconds: 15));

      debugPrint("RAZORPAY CREATE STATUS CODE: ${response.statusCode}");
      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      }
      return jsonDecode(response.body) as Map<String, dynamic>;
    } catch (e) {
      debugPrint("Razorpay createOrder error: $e");
      return null;
    }
  }

  static Future<Map<String, dynamic>?> verifyPayment({
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
    bool isSandboxConfirm = false,
  }) async {
    if (kFrontendPreviewMode) {
      return {
        'success': true,
        'message': 'Payment verified successfully (Preview)',
      };
    }
    try {
      final token = await AuthService.getToken();
      final response = await http
          .post(
            Uri.parse("$baseUrl/verify-payment"),
            headers: {
              "Content-Type": "application/json",
              if (token != null) "Authorization": "Bearer $token",
            },
            body: jsonEncode({
              "razorpay_order_id": razorpayOrderId,
              "razorpay_payment_id": razorpayPaymentId,
              "razorpay_signature": razorpaySignature,
              if (isSandboxConfirm) "isSandboxConfirm": true,
            }),
          )
          .timeout(const Duration(seconds: 15));

      debugPrint("VERIFY STATUS CODE: ${response.statusCode}");
      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      }
      return jsonDecode(response.body) as Map<String, dynamic>;
    } catch (e) {
      debugPrint("Razorpay verifyPayment error: $e");
      return null;
    }
  }
}
