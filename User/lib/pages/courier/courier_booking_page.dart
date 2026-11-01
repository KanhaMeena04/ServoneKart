import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/app_constants.dart';
import '../../services/auth_service.dart';

class CourierBookingPage extends StatefulWidget {
  const CourierBookingPage({super.key});

  @override
  State<CourierBookingPage> createState() => _CourierBookingPageState();
}

class _CourierBookingPageState extends State<CourierBookingPage> {
  final _pickupCtrl = TextEditingController(text: 'Palasia Square, Indore');
  final _dropCtrl = TextEditingController(text: 'Vijay Nagar, Indore');
  final _instructionsCtrl = TextEditingController();

  String _selectedParcelType = 'Documents / Papers';
  double _weightKg = 1.0;
  bool _isEstimating = false;
  Map<String, dynamic>? _estimatedFare;
  bool _isBooking = false;

  final List<String> _parcelTypes = [
    'Documents / Papers',
    'Clothing & Lifestyle',
    'Food / Lunchbox',
    'Electronics / Gadgets',
    'Medicine / Urgent',
    'Others'
  ];

  @override
  void initState() {
    super.initState();
    _calculateFareEstimate();
  }

  Future<void> _calculateFareEstimate() async {
    setState(() => _isEstimating = true);
    try {
      final res = await http.post(
        Uri.parse('${AppConstants.baseUrl}/courier/estimate'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'pickupLocation': {'lat': 22.7196, 'lng': 75.8577},
          'dropLocation': {'lat': 22.7533, 'lng': 75.8937},
          'weightKg': _weightKg,
        }),
      );

      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        if (data['success'] == true) {
          setState(() {
            _estimatedFare = data['data'];
          });
        }
      }
    } catch (e) {
      debugPrint('Error estimating fare: $e');
    } finally {
      setState(() => _isEstimating = false);
    }
  }

  Future<void> _bookCourier() async {
    if (_pickupCtrl.text.trim().isEmpty || _dropCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill pickup and drop addresses')));
      return;
    }

    setState(() => _isBooking = true);
    try {
      final token = await AuthService.getToken();
      final res = await http.post(
        Uri.parse('${AppConstants.baseUrl}/courier/book'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'pickupAddress': {'addressLine': _pickupCtrl.text.trim(), 'lat': 22.7196, 'lng': 75.8577},
          'dropAddress': {'addressLine': _dropCtrl.text.trim(), 'lat': 22.7533, 'lng': 75.8937},
          'parcelType': _selectedParcelType,
          'weightKg': _weightKg,
          'deliveryInstructions': _instructionsCtrl.text.trim(),
          'paymentMethod': 'cod'
        }),
      );

      if (res.statusCode == 201 || res.statusCode == 200) {
        final data = json.decode(res.body);
        final pickupOtp = data['data']?['pickupOtp'] ?? '----';
        final orderNumber = data['data']?['orderNumber'] ?? '';

        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: const Row(
              children: [
                Icon(Icons.check_circle, color: Color(0xFFE89D1E)),
                SizedBox(width: 8),
                Text('Parcel Booked!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Tracking No: $orderNumber', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 12),
                const Text('Give this Pickup OTP to the rider when handing over the parcel:', style: TextStyle(fontSize: 12)),
                const SizedBox(height: 8),
                Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(12)),
                    child: Text(
                      pickupOtp,
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 4, color: Color(0xFFB45309)),
                    ),
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  Navigator.pop(context);
                },
                child: const Text('Done', style: TextStyle(color: Color(0xFFE89D1E), fontWeight: FontWeight.bold)),
              )
            ],
          ),
        );
      }
    } catch (e) {
      debugPrint('Booking error: $e');
    } finally {
      setState(() => _isBooking = false);
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
            Text('ECDKART Courier & Parcel', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
            Text('Doorstep Pickup & Drop anywhere in Indore', style: TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
        backgroundColor: const Color(0xFFE89D1E),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Address Container
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: Color(0xFFE2E8F0))),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.radio_button_checked, color: Color(0xFF248C70), size: 18),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: _pickupCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Pickup Address (Sender)',
                              labelStyle: TextStyle(fontSize: 12),
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 1),
                    Row(
                      children: [
                        const Icon(Icons.location_on, color: Color(0xFFE89D1E), size: 18),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: _dropCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Drop Address (Recipient)',
                              labelStyle: TextStyle(fontSize: 12),
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),
            const Text('Parcel Category', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _parcelTypes.map((type) {
                final isSelected = type == _selectedParcelType;
                return ChoiceChip(
                  label: Text(type, style: TextStyle(fontSize: 12, color: isSelected ? Colors.white : Colors.black87)),
                  selected: isSelected,
                  selectedColor: const Color(0xFFE89D1E),
                  backgroundColor: Colors.white,
                  onSelected: (val) => setState(() => _selectedParcelType = type),
                );
              }).toList(),
            ),

            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Approx Weight (kg)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                Text('${_weightKg.toStringAsFixed(1)} kg', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFE89D1E))),
              ],
            ),
            Slider(
              value: _weightKg,
              min: 0.5,
              max: 15.0,
              divisions: 29,
              activeColor: const Color(0xFFE89D1E),
              onChanged: (val) {
                setState(() => _weightKg = val);
                _calculateFareEstimate();
              },
            ),

            const SizedBox(height: 12),
            TextField(
              controller: _instructionsCtrl,
              decoration: InputDecoration(
                labelText: 'Delivery Instructions (Optional)',
                hintText: 'e.g. Ring bell, handle with care...',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
              ),
            ),

            const SizedBox(height: 20),
            // Fare Summary Card
            Card(
              elevation: 0,
              color: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: Color(0xFFE2E8F0))),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: _isEstimating
                    ? const Center(child: Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator(color: Color(0xFFE89D1E))))
                    : Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Estimated Distance', style: TextStyle(fontSize: 13, color: Colors.black54)),
                              Text('${_estimatedFare?['distanceKm'] ?? 4.8} km', style: const TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Distance & Weight Fare', style: TextStyle(fontSize: 13, color: Colors.black54)),
                              Text('₹${_estimatedFare?['distanceFare'] ?? 74}', style: const TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const Divider(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total Payable', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              Text(
                                '₹${_estimatedFare?['total'] ?? 83}',
                                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFFE89D1E)),
                              ),
                            ],
                          ),
                        ],
                      ),
              ),
            ),

            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isBooking ? null : _bookCourier,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE89D1E),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                child: _isBooking
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Book Delivery Rider (Pay on Pickup)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
