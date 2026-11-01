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
  bool _isLoading = true;
  List<dynamic> _services = [];
  String _selectedServiceId = 'wash_and_iron';
  int _estimatedClothes = 10;
  final _addressCtrl = TextEditingController(text: 'Indore, MP');

  @override
  void initState() {
    super.initState();
    _fetchServices();
  }

  Future<void> _fetchServices() async {
    setState(() => _isLoading = true);
    try {
      final res = await http.get(Uri.parse('${AppConstants.baseUrl}/laundry/services'));
      if (res.statusCode == 200) {
        final d = json.decode(res.body);
        if (d['success'] == true) _services = d['data'] ?? [];
      }
    } catch (e) {
      debugPrint('Error: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _bookLaundry() async {
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
          'estimatedWeightKg': (_estimatedClothes / 3).round(),
          'pickupSlot': DateTime.now().add(const Duration(hours: 3)).toIso8601String(),
          'deliverySlot': DateTime.now().add(const Duration(days: 2)).toIso8601String(),
          'pickupAddress': {'addressLine': _addressCtrl.text.trim()},
          'paymentMethod': 'cod'
        }),
      );

      if (res.statusCode == 201 || res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Laundry pickup scheduled! Our rider will bring laundry bags.'),
            backgroundColor: Color(0xFF0D9488),
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      debugPrint('Error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('ECDKART Laundry & Dry Clean', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
            Text('Doorstep wash, steam iron & delicate care in Indore', style: TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
        backgroundColor: const Color(0xFF0D9488),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Select Fabric Care Service', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  ..._services.map((s) {
                    final isSelected = s['id'] == _selectedServiceId;
                    return Card(
                      elevation: 0,
                      margin: const EdgeInsets.only(bottom: 10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                        side: BorderSide(color: isSelected ? const Color(0xFF0D9488) : const Color(0xFFE2E8F0), width: isSelected ? 2 : 1),
                      ),
                      child: ListTile(
                        onTap: () => setState(() => _selectedServiceId = s['id']),
                        leading: Radio<String>(
                          value: s['id'],
                          groupValue: _selectedServiceId,
                          activeColor: const Color(0xFF0D9488),
                          onChanged: (val) => setState(() => _selectedServiceId = val!),
                        ),
                        title: Text(s['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        subtitle: Text(s['description'] ?? '', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                        trailing: Text(
                          '₹${s['pricePerUnit']}/${s['unitType']}',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0D9488), fontSize: 14),
                        ),
                      ),
                    );
                  }).toList(),

                  const SizedBox(height: 16),
                  const Text('Approximate Number of Clothes', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  Slider(
                    value: _estimatedClothes.toDouble(),
                    min: 5,
                    max: 40,
                    divisions: 7,
                    activeColor: const Color(0xFF0D9488),
                    label: '$_estimatedClothes clothes',
                    onChanged: (val) => setState(() => _estimatedClothes = val.round()),
                  ),

                  const SizedBox(height: 12),
                  TextField(
                    controller: _addressCtrl,
                    decoration: InputDecoration(
                      labelText: 'Pickup & Delivery Address in Indore',
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                    ),
                  ),

                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _bookLaundry,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0D9488),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('Schedule Doorstep Laundry Pickup', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
