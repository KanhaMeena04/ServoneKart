import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/app_constants.dart';
import '../../services/auth_service.dart';

class HomeServicesPage extends StatefulWidget {
  const HomeServicesPage({super.key});

  @override
  State<HomeServicesPage> createState() => _HomeServicesPageState();
}

class _HomeServicesPageState extends State<HomeServicesPage> {
  bool _isLoading = true;
  List<dynamic> _categories = [];
  List<dynamic> _services = [];
  String _selectedCategory = 'ac_repair';

  @override
  void initState() {
    super.initState();
    _fetchCategoriesAndServices();
  }

  Future<void> _fetchCategoriesAndServices() async {
    setState(() => _isLoading = true);
    try {
      final catRes = await http.get(Uri.parse('${AppConstants.baseUrl}/home-services/categories'));
      if (catRes.statusCode == 200) {
        final catData = json.decode(catRes.body);
        if (catData['success'] == true) {
          _categories = catData['data'] ?? [];
        }
      }

      final servRes = await http.get(Uri.parse('${AppConstants.baseUrl}/home-services/services?category=$_selectedCategory'));
      if (servRes.statusCode == 200) {
        final servData = json.decode(servRes.body);
        if (servData['success'] == true) {
          _services = servData['data'] ?? [];
        }
      }
    } catch (e) {
      debugPrint('Error fetching home services: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _onSelectCategory(String catId) async {
    setState(() {
      _selectedCategory = catId;
      _isLoading = true;
    });
    try {
      final servRes = await http.get(Uri.parse('${AppConstants.baseUrl}/home-services/services?category=$catId'));
      if (servRes.statusCode == 200) {
        final servData = json.decode(servRes.body);
        if (servData['success'] == true) {
          setState(() {
            _services = servData['data'] ?? [];
          });
        }
      }
    } catch (e) {
      debugPrint('Error: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showBookingSheet(dynamic service) {
    final problemCtrl = TextEditingController();
    final addressCtrl = TextEditingController(text: 'Indore, Madhya Pradesh');
    String selectedTimeSlot = '10:00 AM - 12:00 PM';
    DateTime selectedDate = DateTime.now().add(const Duration(days: 1));

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
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    service['title'] ?? 'Book Service',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'Inspection Charge: ₹${service['inspectionCharge'] ?? 99} • 30 Days Warranty',
                style: const TextStyle(fontSize: 12, color: Color(0xFF2563EB), fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              const Text('Describe Your Problem', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              TextField(
                controller: problemCtrl,
                decoration: InputDecoration(
                  hintText: 'e.g. AC is not cooling properly, making humming noise...',
                  filled: true,
                  fillColor: Colors.grey[100],
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 12),
              const Text('Service Address', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              TextField(
                controller: addressCtrl,
                decoration: InputDecoration(
                  hintText: 'Complete address in Indore...',
                  filled: true,
                  fillColor: Colors.grey[100],
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    if (problemCtrl.text.trim().isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please describe the problem')));
                      return;
                    }
                    Navigator.pop(ctx);

                    // Call backend booking endpoint
                    try {
                      final token = await AuthService.getToken();
                      final res = await http.post(
                        Uri.parse('${AppConstants.baseUrl}/home-services/book'),
                        headers: {
                          'Content-Type': 'application/json',
                          if (token != null) 'Authorization': 'Bearer $token',
                        },
                        body: json.encode({
                          'category': _selectedCategory,
                          'subService': service['title'],
                          'problemDescription': problemCtrl.text.trim(),
                          'serviceAddress': {
                            'addressLine': addressCtrl.text.trim(),
                            'city': 'Indore'
                          },
                          'scheduledDate': selectedDate.toIso8601String(),
                          'timeSlot': selectedTimeSlot,
                          'inspectionFee': service['inspectionCharge'] ?? 99
                        }),
                      );

                      if (res.statusCode == 201 || res.statusCode == 200) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('✅ Technician booked! A verified pro will visit at your scheduled time.'),
                            backgroundColor: Color(0xFF2563EB),
                          ),
                        );
                      }
                    } catch (err) {
                      debugPrint('Booking failed: $err');
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Confirm Booking (Pay after Inspection)', style: TextStyle(fontWeight: FontWeight.bold)),
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
            Text('ECDKART Home Services', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
            Text('Verified & Police-checked Pros in Indore', style: TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
        backgroundColor: const Color(0xFF2563EB),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF2563EB)))
          : Column(
              children: [
                // Horizontal Categories Selector
                Container(
                  color: Colors.white,
                  height: 60,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    itemCount: _categories.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final cat = _categories[index];
                      final isSelected = cat['id'] == _selectedCategory;
                      return ChoiceChip(
                        label: Text(
                          cat['name'] ?? '',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected ? Colors.white : Colors.black87,
                          ),
                        ),
                        selected: isSelected,
                        selectedColor: const Color(0xFF2563EB),
                        backgroundColor: const Color(0xFFF1F5F9),
                        onSelected: (val) => _onSelectCategory(cat['id']),
                      );
                    },
                  ),
                ),

                // Services List
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _services.length,
                    itemBuilder: (context, index) {
                      final s = _services[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: const BorderSide(color: Color(0xFFE2E8F0)),
                        ),
                        elevation: 0,
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          s['title'] ?? 'Home Service',
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          s['description'] ?? '',
                                          style: const TextStyle(color: Colors.black54, fontSize: 12),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        '₹${s['basePrice'] ?? 199}',
                                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)),
                                      ),
                                      Text(
                                        '${s['durationMinutes'] ?? 45} mins',
                                        style: const TextStyle(fontSize: 11, color: Colors.grey),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              const Divider(height: 1, color: Color(0xFFF1F5F9)),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.verified_user_rounded, color: Colors.emerald, size: 16),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${s['warrantyDays'] ?? 30} Days Warranty',
                                        style: const TextStyle(fontSize: 12, color: Colors.emerald, fontWeight: FontWeight.w600),
                                      ),
                                    ],
                                  ),
                                  ElevatedButton(
                                    onPressed: () => _showBookingSheet(s),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF2563EB),
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                    ),
                                    child: const Text('Book Now', style: TextStyle(fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
    );
  }
}
