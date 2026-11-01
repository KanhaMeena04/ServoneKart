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
      // 1. Fetch Dynamic Categories from Admin DB
      final catRes = await http.get(Uri.parse('${AppConstants.baseUrl}/home-services/categories'));
      if (catRes.statusCode == 200) {
        final catData = json.decode(catRes.body);
        if (catData['success'] == true && catData['data'] is List) {
          _categories = catData['data'];
          if (_categories.isNotEmpty && !_categories.any((c) => c['id'] == _selectedCategory)) {
            _selectedCategory = _categories[0]['id'];
          }
        }
      }

      // 2. Fetch Dynamic Catalog Services from Admin DB
      final servRes = await http.get(Uri.parse('${AppConstants.baseUrl}/home-services/services?category=$_selectedCategory'));
      if (servRes.statusCode == 200) {
        final servData = json.decode(servRes.body);
        if (servData['success'] == true && servData['data'] is List) {
          _services = servData['data'];
        }
      }
    } catch (e) {
      debugPrint('Error fetching home services: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
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
        if (servData['success'] == true && servData['data'] is List) {
          setState(() {
            _services = servData['data'];
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching category services: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showBookingSheet(dynamic service) {
    final problemCtrl = TextEditingController();
    final addressCtrl = TextEditingController(text: 'Vijay Nagar, Indore, MP');
    String selectedTimeSlot = '10:00 AM - 01:00 PM';
    String selectedDay = 'Today';

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
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        service['title'] ?? 'Book Inspection',
                        style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                      ),
                    ),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                  ],
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(8)),
                  child: Text(
                    'Fixed Inspection Fee: ₹${service['inspectionCharge'] ?? 99} • ${service['warrantyDays'] ?? 30} Days Warranty',
                    style: const TextStyle(fontSize: 11.5, color: Color(0xFF1D4ED8), fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 16),

                // Operational Workflow Explanation
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.info_outline, size: 18, color: Color(0xFF2563EB)),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Technician inspects on-site -> Sends transparent quotation on your app -> You approve -> OTP completion.',
                          style: TextStyle(fontSize: 11, color: Colors.black87),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Select Day
                const Text('Choose Visit Day', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 8),
                Row(
                  children: ['Today', 'Tomorrow', 'Day After'].map((day) {
                    final isSel = selectedDay == day;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(day, style: TextStyle(fontSize: 12, fontWeight: isSel ? FontWeight.bold : FontWeight.normal)),
                        selected: isSel,
                        selectedColor: const Color(0xFF2563EB),
                        labelStyle: TextStyle(color: isSel ? Colors.white : Colors.black87),
                        onSelected: (val) => setModalState(() => selectedDay = day),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 14),

                // Time Slots
                const Text('Choose Arrival Time Slot', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    '09:00 AM - 12:00 PM',
                    '12:00 PM - 03:00 PM',
                    '03:00 PM - 06:00 PM',
                    '06:00 PM - 09:00 PM',
                  ].map((slot) {
                    final isSel = selectedTimeSlot == slot;
                    return InkWell(
                      onTap: () => setModalState(() => selectedTimeSlot = slot),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSel ? const Color(0xFF2563EB) : Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: isSel ? const Color(0xFF2563EB) : const Color(0xFFCBD5E1)),
                        ),
                        child: Text(
                          slot,
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: isSel ? FontWeight.bold : FontWeight.w500,
                            color: isSel ? Colors.white : Colors.black87,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),

                const Text('Problem Description & Address', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 8),
                TextField(
                  controller: problemCtrl,
                  decoration: InputDecoration(
                    hintText: 'e.g. AC cooling low, water dripping from indoor unit...',
                    hintStyle: const TextStyle(fontSize: 12),
                    filled: true,
                    fillColor: const Color(0xFFF1F5F9),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: addressCtrl,
                  decoration: InputDecoration(
                    labelText: 'Service Address in Indore',
                    filled: true,
                    fillColor: const Color(0xFFF1F5F9),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 20),

                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () async {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Appointment confirmed for $selectedDay ($selectedTimeSlot)! Technician assigned.'),
                          backgroundColor: const Color(0xFF2563EB),
                          duration: const Duration(seconds: 4),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text('Confirm Inspection Visit (Pay ₹${service['inspectionCharge'] ?? 99} on arrival)',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  ),
                ),
              ],
            ),
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
        backgroundColor: const Color(0xFF2563EB),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('ECDKART Home Services', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white)),
            Text('Verified Technicians • Managed live from Admin Tower', style: TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF2563EB)))
          : RefreshIndicator(
              onRefresh: _fetchCategoriesAndServices,
              color: const Color(0xFF2563EB),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Trust & Quality Banner
                    Container(
                      margin: const EdgeInsets.all(16),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF1D4ED8), Color(0xFF2563EB)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(color: const Color(0xFF2563EB).withOpacity(0.25), blurRadius: 10, offset: const Offset(0, 4)),
                        ],
                      ),
                      child: Column(
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.verified_user_rounded, color: Colors.white, size: 28),
                              SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  '100% Verified Indore Technicians',
                                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _buildTrustPill(Icons.shield_outlined, '30 Days\nWarranty'),
                              _buildTrustPill(Icons.currency_rupee_rounded, 'Fixed ₹99\nInspection'),
                              _buildTrustPill(Icons.security_rounded, 'Background\nChecked'),
                              _buildTrustPill(Icons.pin_rounded, 'OTP Job\nClosure'),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Dynamic Service Category Selector Pills from Admin
                    if (_categories.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: _categories.map((c) {
                              final catId = (c['id'] ?? c['_id']).toString();
                              final label = (c['name'] ?? 'Category').toString();
                              return _buildCategoryPill(catId, label, Icons.handyman_rounded);
                            }).toList(),
                          ),
                        ),
                      ),
                    const SizedBox(height: 16),

                    // Section Title
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Available Services (${_services.length})',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.grey[900]),
                          ),
                          const Text('4.8 ★ Rated', style: TextStyle(color: Color(0xFF2563EB), fontWeight: FontWeight.bold, fontSize: 12)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Dynamic Services Cards List from Database
                    _services.isEmpty
                        ? Container(
                            padding: const EdgeInsets.all(32),
                            alignment: Alignment.center,
                            child: const Text('No services found in this category.\nAdmin can add new service items in the Admin Panel.',
                                textAlign: TextAlign.center, style: TextStyle(color: Colors.grey, fontSize: 12)),
                          )
                        : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: _services.length,
                            itemBuilder: (context, index) {
                              final s = _services[index];
                              return Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                  boxShadow: [
                                    BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 6, offset: const Offset(0, 2)),
                                  ],
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      width: 50,
                                      height: 50,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF2563EB).withOpacity(0.08),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Icon(Icons.handyman_rounded, color: Color(0xFF2563EB), size: 28),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            s['title'] ?? 'Service',
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                          ),
                                          const SizedBox(height: 4),
                                          Row(
                                            children: [
                                              const Text('★ 4.8', style: TextStyle(color: Color(0xFFD97706), fontWeight: FontWeight.bold, fontSize: 11)),
                                              const SizedBox(width: 6),
                                              Text('• ${s['durationMinutes'] ?? 45} mins', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                                              const SizedBox(width: 6),
                                              Text('• ${s['warrantyDays'] ?? 30}d warranty', style: const TextStyle(fontSize: 11, color: Color(0xFF16A34A), fontWeight: FontWeight.w600)),
                                            ],
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            'Inspection Charge: ₹${s['inspectionCharge'] ?? 99}',
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                                          ),
                                        ],
                                      ),
                                    ),
                                    ElevatedButton(
                                      onPressed: () => _showBookingSheet(s),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF2563EB),
                                        foregroundColor: Colors.white,
                                        elevation: 0,
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                      child: const Text('Book', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5)),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildTrustPill(IconData icon, String text) {
    return Column(
      children: [
        Icon(icon, color: Colors.white70, size: 20),
        const SizedBox(height: 4),
        Text(
          text,
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w500, height: 1.1),
        ),
      ],
    );
  }

  Widget _buildCategoryPill(String id, String label, IconData icon) {
    final isSel = _selectedCategory == id;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        onTap: () => _onSelectCategory(id),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: isSel ? const Color(0xFF2563EB) : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isSel ? const Color(0xFF2563EB) : const Color(0xFFCBD5E1)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 16, color: isSel ? Colors.white : const Color(0xFF2563EB)),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSel ? FontWeight.bold : FontWeight.w600,
                  color: isSel ? Colors.white : Colors.black87,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
