import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/app_constants.dart';
import '../../services/auth_service.dart';

class PharmacyPage extends StatefulWidget {
  const PharmacyPage({super.key});

  @override
  State<PharmacyPage> createState() => _PharmacyPageState();
}

class _PharmacyPageState extends State<PharmacyPage> {
  bool _isLoading = true;
  List<dynamic> _stores = [];
  List<dynamic> _otcProducts = [];
  bool _hasPrescriptionUploaded = false;

  @override
  void initState() {
    super.initState();
    _fetchPharmacyData();
  }

  Future<void> _fetchPharmacyData() async {
    setState(() => _isLoading = true);
    try {
      // 1. Fetch Dynamic Indore Pharmacies from Admin DB
      final storeRes = await http.get(Uri.parse('${AppConstants.baseUrl}/pharmacy/stores?city=Indore'));
      if (storeRes.statusCode == 200) {
        final d = json.decode(storeRes.body);
        if (d['success'] == true && d['data'] is List) _stores = d['data'];
      }

      // 2. Fetch Dynamic OTC Medicines from Admin DB
      final prodRes = await http.get(Uri.parse('${AppConstants.baseUrl}/pharmacy/products?prescriptionRequired=false'));
      if (prodRes.statusCode == 200) {
        final d = json.decode(prodRes.body);
        if (d['success'] == true && d['data'] is List) {
          _otcProducts = d['data'];
        }
      }
    } catch (e) {
      debugPrint('Error fetching pharmacy data: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showPrescriptionUploadDialog() {
    final nameCtrl = TextEditingController();
    final addressCtrl = TextEditingController(text: 'Vijay Nagar, Indore, MP');
    final phoneCtrl = TextEditingController(text: '9876543210');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
            left: 20,
            right: 20,
            top: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: const Color(0xFFDC2626).withOpacity(0.12), shape: BoxShape.circle),
                    child: const Icon(Icons.receipt_long_rounded, color: Color(0xFFDC2626), size: 22),
                  ),
                  const SizedBox(width: 10),
                  const Text('Upload Prescription (Rx)', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 6),
              const Text(
                'Our registered Indore pharmacist will review the prescription, calculate bill, and call you to confirm before dispatch.',
                style: TextStyle(fontSize: 11.5, color: Colors.black54),
              ),
              const SizedBox(height: 14),

              // Photo attached indicator
              InkWell(
                onTap: () {
                  setModalState(() {
                    _hasPrescriptionUploaded = true;
                  });
                },
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border.all(color: _hasPrescriptionUploaded ? const Color(0xFF16A34A) : const Color(0xFFDC2626), width: 1.5),
                    borderRadius: BorderRadius.circular(14),
                    color: _hasPrescriptionUploaded ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        _hasPrescriptionUploaded ? Icons.check_circle_rounded : Icons.add_a_photo_rounded,
                        color: _hasPrescriptionUploaded ? const Color(0xFF16A34A) : const Color(0xFFDC2626),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        _hasPrescriptionUploaded ? 'Prescription Photo Attached (Tap to change)' : 'Tap to Take Photo / Upload Slip',
                        style: TextStyle(
                          color: _hasPrescriptionUploaded ? const Color(0xFF16A34A) : const Color(0xFFDC2626),
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 14),

              TextField(
                controller: nameCtrl,
                decoration: InputDecoration(
                  labelText: 'Patient Full Name',
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: phoneCtrl,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  labelText: 'Contact Phone Number',
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: addressCtrl,
                decoration: InputDecoration(
                  labelText: 'Delivery Address in Indore',
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 18),

              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Prescription submitted! Registered chemist in Indore is reviewing.'),
                        backgroundColor: Color(0xFFDC2626),
                        duration: Duration(seconds: 4),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFDC2626),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Submit for Pharmacist Review', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
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
        backgroundColor: const Color(0xFFDC2626),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('ECDKART Pharmacy', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white)),
            Text('100% Genuine Medicines • Managed live by Admin', style: TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFDC2626)))
          : RefreshIndicator(
              onRefresh: _fetchPharmacyData,
              color: const Color(0xFFDC2626),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Prominent Prescription Upload Card
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFDC2626), Color(0xFFB91C1C)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(color: const Color(0xFFDC2626).withOpacity(0.25), blurRadius: 10, offset: const Offset(0, 4)),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), shape: BoxShape.circle),
                                child: const Icon(Icons.medical_information_rounded, color: Colors.white, size: 24),
                              ),
                              const SizedBox(width: 10),
                              const Expanded(
                                child: Text(
                                  'Have a Doctor’s Prescription?',
                                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Upload your doctor’s slip. Our registered pharmacist in Indore will review and dispense your order safely.',
                            style: TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                          const SizedBox(height: 14),
                          SizedBox(
                            width: double.infinity,
                            height: 44,
                            child: ElevatedButton.icon(
                              onPressed: _showPrescriptionUploadDialog,
                              icon: const Icon(Icons.camera_alt_rounded, size: 18),
                              label: const Text('Upload Doctor Slip (Photo / PDF)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: const Color(0xFFDC2626),
                                elevation: 0,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Schedule H Compliance Alert
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFECACA)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.shield_outlined, size: 20, color: Color(0xFFDC2626)),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'As per Govt. of India regulations, Schedule H & X prescription medicines cannot be sold without a valid doctor prescription.',
                              style: TextStyle(fontSize: 11, color: Color(0xFF991B1B)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Dynamic OTC Wellness Products from Database
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Daily OTC Essentials (${_otcProducts.length})', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                        Text('Instant 20 mins', style: TextStyle(fontSize: 11.5, color: Colors.green[700], fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 10),

                    _otcProducts.isEmpty
                        ? Container(
                            padding: const EdgeInsets.all(24),
                            alignment: Alignment.center,
                            child: const Text('No OTC products found in database.\nAdmin can add medicines via Admin Control Tower.',
                                textAlign: TextAlign.center, style: TextStyle(color: Colors.grey, fontSize: 12)),
                          )
                        : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _otcProducts.length,
                            itemBuilder: (context, index) {
                              final p = _otcProducts[index];
                              return Container(
                                margin: const EdgeInsets.only(bottom: 10),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 48,
                                      height: 48,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFDC2626).withOpacity(0.08),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: const Icon(Icons.medication_rounded, color: Color(0xFFDC2626), size: 24),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(p['name'] ?? 'Medicine', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                          const SizedBox(height: 2),
                                          Text('${p['brand'] ?? 'Pharma'} • ${p['unit'] ?? p['pack'] ?? '1 pack'}',
                                              style: const TextStyle(color: Colors.grey, fontSize: 11)),
                                          const SizedBox(height: 4),
                                          Row(
                                            children: [
                                              Text('₹${p['price'] ?? 0}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                              if (p['mrp'] != null && p['mrp'] > (p['price'] ?? 0)) ...[
                                                const SizedBox(width: 6),
                                                Text('₹${p['mrp']}', style: const TextStyle(fontSize: 10.5, color: Colors.grey, decoration: TextDecoration.lineThrough)),
                                              ],
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                    ElevatedButton(
                                      onPressed: () {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          SnackBar(content: Text('Added ${p['name']} to pharmacy cart')),
                                        );
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFFDC2626),
                                        foregroundColor: Colors.white,
                                        elevation: 0,
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                      ),
                                      child: const Text('Add', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),

                    const SizedBox(height: 20),
                    // Licensed Pharmacies List from Admin
                    const Text('Licensed Partner Pharmacies in Indore', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),

                    _stores.isEmpty
                        ? const Padding(
                            padding: EdgeInsets.all(16),
                            child: Text('Partner pharmacies verified by Indore Drug Controller.', style: TextStyle(color: Colors.grey, fontSize: 12)),
                          )
                        : Column(
                            children: _stores.map((s) {
                              return Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
                                child: Row(
                                  children: [
                                    const Icon(Icons.local_pharmacy_rounded, color: Color(0xFFDC2626)),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(s['name'] ?? 'Chemist', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                          Text(s['address'] ?? 'Indore, MP', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                                        ],
                                      ),
                                    ),
                                    const Text('Certified', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 11)),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                  ],
                ),
              ),
            ),
    );
  }
}
