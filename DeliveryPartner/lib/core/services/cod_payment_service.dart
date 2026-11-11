import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../constants/api_constansts.dart';
import '../../data/services/auth_service.dart';

class CodPaymentService {
  final BuildContext context;
  final VoidCallback onSuccess;

  CodPaymentService(this.context, {required this.onSuccess});

  void dispose() {}

  Future<void> initiatePayment({double amount = 0}) async {
    try {
      final token = await AuthService.getToken();
      final response = await http
          .post(
            Uri.parse(ApiConstants.initiateCodPayment),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
            },
            body: jsonEncode({'amount': amount}),
          )
          .timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      if (!context.mounted) return;

      if (response.statusCode >= 200 && response.statusCode < 300 && data['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              (data['message'] ?? 'COD settlement initiated with Admin Desk').toString(),
            ),
            backgroundColor: const Color(0xFF248C70),
          ),
        );
        onSuccess();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              (data['message'] ?? 'Failed to initiate COD settlement').toString(),
            ),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Network error initiating COD settlement: $e'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }
}
