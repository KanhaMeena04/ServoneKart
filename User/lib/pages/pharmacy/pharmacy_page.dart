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

  @override
  void initState() {
    super.initState();
    _fetchPharmacyData();
  }

  Future<void> _fetchPharmacyData() async {
    setState(() => _isLoading = true);
    try {
      final storeRes = await http.get(Uri.parse('${AppConstants.baseUrl}/pharmacy/stores?city=Indore'));
      if (storeRes.statusCode == 200) {
        final d = json.decode(storeRes.body);
        if (d['success'] == true) _stores = d['data'] ?? [];
      }

      final prodRes = await http.get(Uri.parse('${AppConstants.baseUrl}/pharmacy/products?prescriptionRequired=false'));
      if (prodRes.statusCode == 200) {
        final d = json.decode(prodRes.body);
        if (d['success'] == true) _otcProducts = d['data'] ?? [];
      }
    } catch (e) {
      debugPrint('Error: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showPrescriptionUploadDialog() {
    final nameCtrl = TextEditingController();
    final addressCtrl = TextEditingController(text: 'Indore, MP');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
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
            const Row(
              children: [
                Icon(Icons.medical_information_rounded, color: Color(0xFFDC2626)),
                SizedBox(width: 8),
                Text('Upload Prescription (Rx)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 6),
            const Text(
              'A registered pharmacist in Indore will review your prescription, verify medicines, and call you to confirm.',
              style: TextStyle(fontSize: 12, color: Colors.black54),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: nameCtrl,
              decoration: InputDecoration(
                labelText: 'Patient Name',
                filled: true,
                fillColor: Colors.grey[100],
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: addressCtrl,
              decoration: InputDecoration(
                labelText: 'Delivery Address in Indore',
                filled: true,
                fillColor: Colors.grey[100],
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 16),
            // Mock prescription image placeholder selector
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFFDC2626), style: BorderStyle.solid),
                borderRadius: BorderRadius.circular(12),
                color: const Color(0xFFFEF2F2),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.camera_alt_rounded, color: Color(0xFFDC2626)),
                  SizedBox(width: 8),
                  Text('Prescription attached (Photo / PDF)', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.bold, fontSize: 13)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  Navigator.pop(ctx);
                  try {
                    final token = await AuthService.getToken();
                    final storeId = _stores.isNotEmpty ? _stores[0]['_id'] : '000000000000000000000001';
                    await http.post(
                      Uri.parse('${AppConstants.baseUrl}/pharmacy/upload-prescription'),
                      headers: {
                        'Content-Type': 'application/json',
                        if (token != null) 'Authorization': 'Bearer $token',
                      },
                      body: json.encode({
                        'pharmacyId': storeId,
                        'prescriptionUrl': 'https://ik.imagekit.io/servonekart/sample_prescription.jpg',
                        'patientName': nameCtrl.text.trim().isNotEmpty ? nameCtrl.text.trim() : 'Patient',
                        'deliveryAddress': {'addressLine': addressCtrl.text.trim()}
                      }),
                    );
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('✅ Prescription submitted to Indore Chemist! They will confirm shortly.'),
                        backgroundColor: Color(0xFFDC2626),
                      ),
                    );
                  } catch (e) {
                    debugPrint('Upload error: $e');
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFDC2626),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Submit Prescription for Verification', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
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
            Text('ECDKART Pharmacy', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
            Text('100% Genuine Medicines • Licensed Indore Chemists', style: TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
        backgroundColor: const Color(0xFFDC2626),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFDC2626)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Prescription Upload Banner Card
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFFDC2626), Color(0xFFB91C1C)]),
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFFDC2626).withOpacity(0.25), blurRadius: 10, offset: const Offset(0, 4)),
                      ],
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Have a Prescription?', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              const Text('Upload your prescription & our licensed pharmacist will arrange the rest.', style: TextStyle(color: Colors.white70, fontSize: 12)),
                              const SizedBox(height: 12),
                              ElevatedButton(
                                onPressed: _showPrescriptionUploadDialog,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.white,
                                  foregroundColor: const Color(0xFFDC2626),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                child: const Text('Upload Rx Now', style: TextStyle(fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.document_scanner_rounded, color: Colors.white, size: 54),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),
                  const Text('Licensed Partner Chemists in Indore', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  _stores.isEmpty
                      ? const Card(
                          child: Padding(
                            padding: EdgeInsets.all(16),
                            child: Text('Indore licensed pharmacies are active. You can upload prescriptions above.'),
                          ),
                        )
                      : Column(
                          children: _stores.map((s) => Card(
                            margin: const EdgeInsets.only(bottom: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: Color(0xFFE2E8F0))),
                            elevation: 0,
                            child: ListTile(
                              leading: const CircleAvatar(backgroundColor: Color(0xFFFEE2E2), child: Icon(Icons.local_pharmacy, color: Color(0xFFDC2626))),
                              title: Text(s['name'] ?? 'Chemist', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              subtitle: Text(s['address'] ?? 'Indore, MP', style: const TextStyle(fontSize: 12)),
                              trailing: Text('★ ${s['rating'] ?? '4.8'}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.amber)),
                            ),
                          )).toList(),
                        ),
                ],
              ),
            ),
    );
  }
}
