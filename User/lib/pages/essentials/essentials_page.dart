import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/app_constants.dart';
import '../../services/auth_service.dart';

class DailyEssentialsPage extends StatefulWidget {
  const DailyEssentialsPage({super.key});

  @override
  State<DailyEssentialsPage> createState() => _DailyEssentialsPageState();
}

class _DailyEssentialsPageState extends State<DailyEssentialsPage> {
  bool _isLoading = true;
  List<dynamic> _products = [];
  final _addressCtrl = TextEditingController(text: 'Indore, MP');

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  Future<void> _fetchProducts() async {
    setState(() => _isLoading = true);
    try {
      final res = await http.get(Uri.parse('${AppConstants.baseUrl}/essentials/products'));
      if (res.statusCode == 200) {
        final d = json.decode(res.body);
        if (d['success'] == true) _products = d['data'] ?? [];
      }
    } catch (e) {
      debugPrint('Error: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showSubscriptionDialog(dynamic prod) {
    String frequency = 'daily';
    int qty = 1;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Subscribe: ${prod['name']}',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                '₹${prod['price']} per ${prod['unit']} • Morning 06:00 - 08:00 AM delivery in Indore',
                style: const TextStyle(fontSize: 12, color: Color(0xFF0284C7)),
              ),
              const SizedBox(height: 16),
              const Text('Delivery Frequency', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 8),
              Row(
                children: [
                  ChoiceChip(
                    label: const Text('Every Day'),
                    selected: frequency == 'daily',
                    selectedColor: const Color(0xFF0284C7),
                    labelStyle: TextStyle(color: frequency == 'daily' ? Colors.white : Colors.black87),
                    onSelected: (val) => setModalState(() => frequency = 'daily'),
                  ),
                  const SizedBox(width: 8),
                  ChoiceChip(
                    label: const Text('Alternate Days'),
                    selected: frequency == 'alternate_days',
                    selectedColor: const Color(0xFF0284C7),
                    labelStyle: TextStyle(color: frequency == 'alternate_days' ? Colors.white : Colors.black87),
                    onSelected: (val) => setModalState(() => frequency = 'alternate_days'),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    Navigator.pop(ctx);
                    try {
                      final token = await AuthService.getToken();
                      await http.post(
                        Uri.parse('${AppConstants.baseUrl}/essentials/subscribe'),
                        headers: {
                          'Content-Type': 'application/json',
                          if (token != null) 'Authorization': 'Bearer $token',
                        },
                        body: json.encode({
                          'productName': prod['name'],
                          'unitPrice': prod['price'],
                          'quantity': qty,
                          'frequency': frequency,
                          'startDate': DateTime.now().add(const Duration(days: 1)).toIso8601String(),
                          'deliveryAddress': {'addressLine': _addressCtrl.text.trim()}
                        }),
                      );
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('✅ Subscription started! Fresh morning deliveries set up.'),
                          backgroundColor: Color(0xFF0284C7),
                        ),
                      );
                    } catch (e) {
                      debugPrint('Subscription error: $e');
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0284C7),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Start Morning Subscription', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('ECDKART Water & Daily Needs', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
            Text('20L Water Cans & Morning Milk Subscriptions • Indore', style: TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
        backgroundColor: const Color(0xFF0284C7),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0284C7)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _products.length,
              itemBuilder: (context, index) {
                final p = _products[index];
                final isSubEligible = p['isSubscriptionEligible'] == true;
                return Card(
                  margin: const EdgeInsets.only(bottom: 14),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Row(
                      children: [
                        Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: const Color(0xFFE0F2FE),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.water_drop_rounded, color: Color(0xFF0284C7), size: 32),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(p['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              const SizedBox(height: 4),
                              Text('₹${p['price']} / ${p['unit']}', style: const TextStyle(color: Color(0xFF0284C7), fontWeight: FontWeight.bold)),
                              const SizedBox(height: 2),
                              Text(p['description'] ?? '', style: const TextStyle(fontSize: 11, color: Colors.grey), maxLines: 2),
                            ],
                          ),
                        ),
                        if (isSubEligible)
                          ElevatedButton(
                            onPressed: () => _showSubscriptionDialog(p),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0284C7),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            ),
                            child: const Text('Subscribe', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          )
                        else
                          ElevatedButton(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Added to cart')));
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: const Color(0xFF0284C7),
                              side: const BorderSide(color: Color(0xFF0284C7)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            ),
                            child: const Text('Buy Once', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
