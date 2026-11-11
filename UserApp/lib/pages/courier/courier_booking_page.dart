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
  final _senderNameCtrl = TextEditingController(text: 'Sender Name');
  final _senderPhoneCtrl = TextEditingController(text: '9876543210');

  final _dropCtrl = TextEditingController(text: 'Vijay Nagar, Indore');
  final _receiverNameCtrl = TextEditingController(text: 'Recipient Name');
  final _receiverPhoneCtrl = TextEditingController(text: '9123456780');

  final _instructionsCtrl = TextEditingController();

  String _selectedParcelType = 'Documents & Papers';
  String _selectedVehicle = 'bike'; // 'bike' or 'auto'
  double _weightKg = 1.0;
  bool _isEstimating = false;
  Map<String, dynamic>? _estimatedFare;
  bool _isBooking = false;

  final List<String> _indoreLandmarks = [
    'Vijay Nagar',
    'Palasia Square',
    'Rajwada',
    '56 Dukan',
    'Bhanwarkuan',
    'Super Corridor',
    'Geeta Bhawan',
    'Sapna Sangeeta'
  ];

  final List<Map<String, dynamic>> _parcelTypes = [
    {'title': 'Documents & Papers', 'icon': Icons.description_rounded},
    {'title': 'Clothes & Lifestyle', 'icon': Icons.checkroom_rounded},
    {'title': 'Food & Tiffin', 'icon': Icons.lunch_dining_rounded},
    {'title': 'Electronics & Gadgets', 'icon': Icons.devices_rounded},
    {'title': 'Medicine & Urgent', 'icon': Icons.medical_services_rounded},
    {'title': 'Fragile / Gift Item', 'icon': Icons.card_giftcard_rounded},
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
          'vehicle': _selectedVehicle,
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
      if (mounted) setState(() => _isEstimating = false);
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
          'senderName': _senderNameCtrl.text.trim(),
          'senderPhone': _senderPhoneCtrl.text.trim(),
          'dropAddress': {'addressLine': _dropCtrl.text.trim(), 'lat': 22.7533, 'lng': 75.8937},
          'receiverName': _receiverNameCtrl.text.trim(),
          'receiverPhone': _receiverPhoneCtrl.text.trim(),
          'parcelType': _selectedParcelType,
          'vehicle': _selectedVehicle,
          'weightKg': _weightKg,
          'deliveryInstructions': _instructionsCtrl.text.trim(),
          'paymentMethod': 'cod'
        }),
      );

      if (res.statusCode == 201 || res.statusCode == 200) {
        final data = json.decode(res.body);
        final pickupOtp = data['data']?['pickupOtp'] ?? '8421';
        final orderNumber = data['data']?['orderNumber'] ?? 'CR-IND-4921';

        if (!mounted) return;
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(color: Color(0xFFFEF3C7), shape: BoxShape.circle),
                  child: const Icon(Icons.check_circle_rounded, color: Color(0xFFD97706), size: 28),
                ),
                const SizedBox(width: 10),
                const Text('Courier Booked!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Tracking ID:', style: TextStyle(color: Colors.grey, fontSize: 12)),
                      Text(orderNumber, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                const Text('Rider is heading to your pickup location.', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: 8),
                const Text('Give this Pickup OTP to the rider when handing over the parcel:', style: TextStyle(fontSize: 12, color: Colors.black54)),
                const SizedBox(height: 12),
                Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFF59E0B)),
                    ),
                    child: Text(
                      pickupOtp,
                      style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, letterSpacing: 6, color: Color(0xFFB45309)),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                const Row(
                  children: [
                    Icon(Icons.shield_outlined, size: 16, color: Colors.green),
                    SizedBox(width: 6),
                    Expanded(
                      child: Text('Receiver will receive a delivery OTP upon arrival.', style: TextStyle(fontSize: 11, color: Colors.green)),
                    ),
                  ],
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
                  backgroundColor: const Color(0xFFD97706),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                ),
                child: const Text('Track Delivery Live', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Booking error: $e')));
    } finally {
      if (mounted) setState(() => _isBooking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final double estimatedTotal = (_estimatedFare?['totalFare'] ?? 75.0).toDouble();
    final double distanceKm = (_estimatedFare?['distanceKm'] ?? 5.4).toDouble();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF7C3AED),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Tricelyn Courier & Parcel', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white)),
            Text('Instant Pick & Drop in Indore • 30-45 mins', style: TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Security Banner: 2-Step OTP Handshake
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF7C3AED), Color(0xFF6D28D9)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(color: const Color(0xFF7C3AED).withOpacity(0.25), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), shape: BoxShape.circle),
                    child: const Icon(Icons.verified_user_rounded, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('100% Safe 2-Step OTP Delivery', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13.5)),
                        SizedBox(height: 2),
                        Text('Sender gives Pickup OTP to rider • Recipient gives Delivery OTP upon arrival in Indore.',
                            style: TextStyle(color: Colors.white70, fontSize: 11)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Pickup & Drop Location Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('ROUTE DETAILS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 0.8)),
                  const SizedBox(height: 14),

                  // Pickup Field
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Padding(
                        padding: EdgeInsets.only(top: 12),
                        child: Icon(Icons.radio_button_checked, color: Color(0xFF16A34A), size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Pickup Point', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.grey)),
                            TextField(
                              controller: _pickupCtrl,
                              decoration: const InputDecoration(
                                isDense: true,
                                contentPadding: EdgeInsets.symmetric(vertical: 6),
                                hintText: 'Enter complete sender address',
                                border: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFFE2E8F0))),
                              ),
                              style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Expanded(
                                  child: TextField(
                                    controller: _senderNameCtrl,
                                    decoration: const InputDecoration(
                                      isDense: true,
                                      hintText: 'Sender Name',
                                      border: InputBorder.none,
                                    ),
                                    style: const TextStyle(fontSize: 12, color: Colors.black54),
                                  ),
                                ),
                                Expanded(
                                  child: TextField(
                                    controller: _senderPhoneCtrl,
                                    keyboardType: TextInputType.phone,
                                    decoration: const InputDecoration(
                                      isDense: true,
                                      hintText: 'Sender Phone',
                                      border: InputBorder.none,
                                    ),
                                    style: const TextStyle(fontSize: 12, color: Colors.black54),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const Padding(
                    padding: EdgeInsets.only(left: 8),
                    child: SizedBox(height: 20, child: VerticalDivider(color: Color(0xFFCBD5E1), thickness: 1.5)),
                  ),

                  // Drop Field
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Padding(
                        padding: EdgeInsets.only(top: 12),
                        child: Icon(Icons.location_on, color: Color(0xFFDC2626), size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Drop-off Point', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.grey)),
                            TextField(
                              controller: _dropCtrl,
                              decoration: const InputDecoration(
                                isDense: true,
                                contentPadding: EdgeInsets.symmetric(vertical: 6),
                                hintText: 'Enter complete receiver address',
                                border: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFFE2E8F0))),
                              ),
                              style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Expanded(
                                  child: TextField(
                                    controller: _receiverNameCtrl,
                                    decoration: const InputDecoration(
                                      isDense: true,
                                      hintText: 'Receiver Name',
                                      border: InputBorder.none,
                                    ),
                                    style: const TextStyle(fontSize: 12, color: Colors.black54),
                                  ),
                                ),
                                Expanded(
                                  child: TextField(
                                    controller: _receiverPhoneCtrl,
                                    keyboardType: TextInputType.phone,
                                    decoration: const InputDecoration(
                                      isDense: true,
                                      hintText: 'Receiver Phone',
                                      border: InputBorder.none,
                                    ),
                                    style: const TextStyle(fontSize: 12, color: Colors.black54),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),
                  const Text('Quick Landmark Shortcuts in Indore:', style: TextStyle(fontSize: 11, color: Colors.grey)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: _indoreLandmarks.map((lm) {
                      return InkWell(
                        onTap: () {
                          setState(() {
                            _dropCtrl.text = '$lm, Indore';
                          });
                          _calculateFareEstimate();
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Text(lm, style: const TextStyle(fontSize: 11, color: Color(0xFF475569))),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Parcel Type Selector
            const Text('What are you sending?', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            const SizedBox(height: 10),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _parcelTypes.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
                mainAxisExtent: 72,
              ),
              itemBuilder: (context, index) {
                final pt = _parcelTypes[index];
                final isSelected = pt['title'] == _selectedParcelType;
                return InkWell(
                  onTap: () => setState(() => _selectedParcelType = pt['title'] as String),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF7C3AED).withOpacity(0.08) : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: isSelected ? const Color(0xFF7C3AED) : const Color(0xFFE2E8F0), width: isSelected ? 1.5 : 1),
                    ),
                    padding: const EdgeInsets.all(8),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(pt['icon'] as IconData, size: 22, color: isSelected ? const Color(0xFF7C3AED) : Colors.black54),
                        const SizedBox(height: 4),
                        Text(
                          pt['title'] as String,
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            color: isSelected ? const Color(0xFF7C3AED) : Colors.black87,
                            height: 1.1,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 18),

            // Vehicle & Weight Selector
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () {
                      setState(() => _selectedVehicle = 'bike');
                      _calculateFareEstimate();
                    },
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _selectedVehicle == 'bike' ? const Color(0xFF7C3AED).withOpacity(0.08) : Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: _selectedVehicle == 'bike' ? const Color(0xFF7C3AED) : const Color(0xFFE2E8F0),
                          width: _selectedVehicle == 'bike' ? 1.5 : 1,
                        ),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.two_wheeler_rounded, color: Color(0xFF7C3AED), size: 28),
                          SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Two-Wheeler', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              Text('Up to 10 kg • Fast', style: TextStyle(fontSize: 10.5, color: Colors.grey)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: InkWell(
                    onTap: () {
                      setState(() => _selectedVehicle = 'auto');
                      _calculateFareEstimate();
                    },
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _selectedVehicle == 'auto' ? const Color(0xFF7C3AED).withOpacity(0.08) : Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: _selectedVehicle == 'auto' ? const Color(0xFF7C3AED) : const Color(0xFFE2E8F0),
                          width: _selectedVehicle == 'auto' ? 1.5 : 1,
                        ),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.local_shipping_rounded, color: Color(0xFF7C3AED), size: 28),
                          SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Loader / Auto', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              Text('Up to 50 kg • Large', style: TextStyle(fontSize: 10.5, color: Colors.grey)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Delivery Instructions
            TextField(
              controller: _instructionsCtrl,
              decoration: InputDecoration(
                labelText: 'Delivery Instructions (Optional)',
                hintText: 'e.g. Call sender before reaching, handle box carefully...',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 20),

            // Live Fare Estimate Card
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
                      const Text('Estimated Fare Breakdown', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                      _isEstimating
                          ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                          : Text('~${distanceKm.toStringAsFixed(1)} km in Indore', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                  const Divider(height: 20),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Base Fare (First 2 km)', style: TextStyle(color: Colors.black54, fontSize: 12)),
                      Text('₹40.00', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Distance Fare', style: TextStyle(color: Colors.black54, fontSize: 12)),
                      Text('₹${(estimatedTotal - 40.0).clamp(0.0, 999.0).toStringAsFixed(0)}.00',
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                    ],
                  ),
                  const Divider(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Estimated Pay', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      Text('₹${estimatedTotal.toStringAsFixed(0)}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF7C3AED))),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Book Now Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _isBooking ? null : _bookCourier,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF7C3AED),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 2,
                ),
                child: _isBooking
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.send_rounded, size: 20),
                          SizedBox(width: 8),
                          Text('Book Pickup Now (COD / Cashless)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                        ],
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
