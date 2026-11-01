import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/app_constants.dart';
import '../../services/auth_service.dart';

class LaundryBookingPage extends StatefulWidget {
  const LaundryBookingPage({super.key});

  @override
  State<LaundryBookingPage> createState() => _LaundryBookingPageState();
}

class _LaundryBookingPageState extends State<LaundryBookingPage> {
  String _selectedServiceId = 'wash_and_iron';
  int _estimatedClothes = 12;
  String _selectedPickupSlot = 'Today (04:00 PM - 07:00 PM)';
  String _selectedDeliverySlot = 'Day After (48 hrs)';
  final _addressCtrl = TextEditingController(text: 'Vijay Nagar, Indore, MP');
  bool _isBooking = false;

  final List<Map<String, dynamic>> _laundryPlans = [
    {
      'id': 'wash_and_fold',
      'title': 'Wash & Fold',
      'priceRate': '₹49 / kg',
      'pricePerKg': 49,
      'turnaround': '24-36 hrs',
      'icon': Icons.local_laundry_service_rounded,
      'tag': 'Popular for Daily Wear',
    },
    {
      'id': 'wash_and_iron',
      'title': 'Wash & Steam Iron',
      'priceRate': '₹79 / kg',
      'pricePerKg': 79,
      'turnaround': '36-48 hrs',
      'icon': Icons.iron_rounded,
      'tag': 'Best for Office & Shirts',
    },
    {
      'id': 'steam_iron',
      'title': 'Steam Iron Only',
      'priceRate': '₹15 / piece',
      'pricePerKg': 45,
      'turnaround': '24 hrs Express',
      'icon': Icons.dry_cleaning_rounded,
      'tag': 'Crisp Wrinkle-Free',
    },
    {
      'id': 'dry_clean',
      'title': 'Delicate Dry Clean',
      'priceRate': '₹120 / piece',
      'pricePerKg': 120,
      'turnaround': '48-72 hrs',
      'icon': Icons.checkroom_rounded,
      'tag': 'Suits, Sarees & Blazers',
    },
  ];

  double _calculateEstimate() {
    final plan = _laundryPlans.firstWhere((p) => p['id'] == _selectedServiceId, orElse: () => _laundryPlans[1]);
    final estKg = (_estimatedClothes / 3).clamp(1.0, 50.0);
    return estKg * (plan['pricePerKg'] as num).toDouble();
  }

  Future<void> _bookLaundry() async {
    setState(() => _isBooking = true);
    try {
      final token = await AuthService.getToken();
      final res = await http.post(
        Uri.parse('${AppConstants.baseUrl}/laundry/book'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'serviceType': _selectedServiceId,
          'clothesCount': _estimatedClothes,
          'pickupSlot': _selectedPickupSlot,
          'deliverySlot': _selectedDeliverySlot,
          'pickupAddress': {'addressLine': _addressCtrl.text.trim()},
          'paymentMethod': 'cod'
        }),
      );

      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            title: const Row(
              children: [
                Icon(Icons.check_circle_rounded, color: Color(0xFF0D9488), size: 28),
                SizedBox(width: 10),
                Text('Laundry Scheduled!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Our Indore pickup partner will arrive with fresh laundry bags to weigh and tag your clothes.',
                    style: TextStyle(fontSize: 12.5, color: Colors.black87)),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: const Color(0xFFF0FDFA), borderRadius: BorderRadius.circular(12)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Pickup: $_selectedPickupSlot', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0D9488))),
                      const SizedBox(height: 4),
                      Text('Delivery: $_selectedDeliverySlot', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F766E))),
                    ],
                  ),
                ),
              ],
            ),
            actions: [
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0D9488),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Done', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      debugPrint('Error: $e');
    } finally {
      if (mounted) setState(() => _isBooking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final estTotal = _calculateEstimate();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D9488),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('ECDKART Laundry & Dry Clean', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white)),
            Text('Doorstep Fabric Care in Indore • Weight Based', style: TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0D9488), Color(0xFF0F766E)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(color: const Color(0xFF0D9488).withOpacity(0.25), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: const Row(
                children: [
                  Icon(Icons.bubble_chart_rounded, color: Colors.white, size: 36),
                  SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Eco-Friendly Steam & Wash', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                        SizedBox(height: 3),
                        Text('Germ-free sanitization • Anti-bacterial wash • Individual customer cycle',
                            style: TextStyle(color: Colors.white70, fontSize: 11)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            const Text('Choose Fabric Care Plan', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),

            // Plan Cards
            ..._laundryPlans.map((plan) {
              final isSel = plan['id'] == _selectedServiceId;
              return InkWell(
                onTap: () => setState(() => _selectedServiceId = plan['id']),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isSel ? const Color(0xFF0D9488).withOpacity(0.08) : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: isSel ? const Color(0xFF0D9488) : const Color(0xFFE2E8F0), width: isSel ? 1.5 : 1),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isSel ? const Color(0xFF0D9488) : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(plan['icon'] as IconData, color: isSel ? Colors.white : const Color(0xFF0D9488), size: 24),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(plan['title'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(color: const Color(0xFFCCFBF1), borderRadius: BorderRadius.circular(6)),
                                  child: Text(plan['tag'], style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF0F766E))),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text('Estimated turnaround: ${plan['turnaround']}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                          ],
                        ),
                      ),
                      Text(plan['priceRate'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0D9488))),
                    ],
                  ),
                ),
              );
            }),
            const SizedBox(height: 16),

            // Clothes Count Estimator
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Estimated Clothes Count', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                          Text('Weight will be confirmed live by rider bag', style: TextStyle(fontSize: 11, color: Colors.grey)),
                        ],
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove_circle_outline, color: Color(0xFF0D9488)),
                            onPressed: () {
                              if (_estimatedClothes > 3) setState(() => _estimatedClothes -= 3);
                            },
                          ),
                          Text('$_estimatedClothes pcs', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          IconButton(
                            icon: const Icon(Icons.add_circle_outline, color: Color(0xFF0D9488)),
                            onPressed: () {
                              setState(() => _estimatedClothes += 3);
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                  const Divider(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Estimated Cost (~4 kg)', style: TextStyle(color: Colors.black54, fontSize: 12.5)),
                      Text('₹${estTotal.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0D9488))),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Pickup & Delivery Slots
            const Text('Pickup & Delivery Slots', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),

            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('PICKUP', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                        SizedBox(height: 4),
                        Text('Today', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        Text('4:00 PM - 7:00 PM', style: TextStyle(fontSize: 11, color: Colors.black54)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('DELIVERY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                        SizedBox(height: 4),
                        Text('Day After', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        Text('10:00 AM - 1:00 PM', style: TextStyle(fontSize: 11, color: Colors.black54)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            TextField(
              controller: _addressCtrl,
              decoration: InputDecoration(
                labelText: 'Pickup Address in Indore',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
              ),
            ),
            const SizedBox(height: 22),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isBooking ? null : _bookLaundry,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0D9488),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 2,
                ),
                child: _isBooking
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Schedule Doorstep Laundry Pickup', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
