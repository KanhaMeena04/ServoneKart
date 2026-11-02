import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/app_constants.dart';

class DailyEssentialsPage extends StatefulWidget {
  const DailyEssentialsPage({super.key});

  @override
  State<DailyEssentialsPage> createState() => _DailyEssentialsPageState();
}

class _DailyEssentialsPageState extends State<DailyEssentialsPage> {
  bool _isLoading = true;
  List<dynamic> _waterCans = [];
  List<dynamic> _milks = [];
  bool _hasEmptyBottle = true;
  final _addressCtrl = TextEditingController(text: 'Vijay Nagar, Indore, MP');

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
        if (d['success'] == true && d['data'] is List) {
          final all = d['data'] as List;
          setState(() {
            _waterCans = all.where((p) {
              final n = (p['name'] ?? '').toString().toLowerCase();
              final u = (p['unit'] ?? '').toString().toLowerCase();
              return n.contains('water') || n.contains('can') || u.contains('can') || u.contains('jar');
            }).toList();

            _milks = all.where((p) {
              final n = (p['name'] ?? '').toString().toLowerCase();
              final u = (p['unit'] ?? '').toString().toLowerCase();
              return n.contains('milk') || n.contains('dairy') || u.contains('pouch');
            }).toList();
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching essentials products: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSubscriptionModal(dynamic item, bool isWater) {
    String frequency = 'daily';
    int qty = 1;

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
                  Expanded(
                    child: Text(
                      item['name'] ?? 'Essential Product',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: const Color(0xFFE0F2FE), borderRadius: BorderRadius.circular(8)),
                child: const Text(
                  '🌅 Delivered before 07:30 AM every morning in Indore',
                  style: TextStyle(fontSize: 11.5, color: Color(0xFF0369A1), fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 16),

              if (isWater) ...[
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: _hasEmptyBottle,
                  title: const Text('I have an empty 20L can to exchange', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: Text(_hasEmptyBottle ? 'No bottle deposit charged' : 'Refundable bottle deposit: ₹150',
                      style: const TextStyle(fontSize: 11.5)),
                  activeColor: const Color(0xFF0284C7),
                  onChanged: (val) {
                    setModalState(() => _hasEmptyBottle = val);
                  },
                ),
                const Divider(),
              ],

              const Text('Delivery Frequency', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 8),
              Row(
                children: [
                  ChoiceChip(
                    label: const Text('Everyday (Daily)'),
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
              const SizedBox(height: 16),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Daily Quantity', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove_circle_outline, color: Color(0xFF0284C7)),
                        onPressed: () {
                          if (qty > 1) setModalState(() => qty--);
                        },
                      ),
                      Text('$qty', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      IconButton(
                        icon: const Icon(Icons.add_circle_outline, color: Color(0xFF0284C7)),
                        onPressed: () {
                          setModalState(() => qty++);
                        },
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 14),

              TextField(
                controller: _addressCtrl,
                decoration: InputDecoration(
                  labelText: 'Delivery Address in Indore',
                  filled: true,
                  fillColor: const Color(0xFFF1F5F9),
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
                        content: Text('Subscription activated! Morning delivery starts tomorrow (7:30 AM).'),
                        backgroundColor: Color(0xFF0284C7),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0284C7),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Start Subscription (Pay per delivery)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
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
        backgroundColor: const Color(0xFF0284C7),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Daily Water & Milk', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white)),
            Text('Morning Subscriptions • Managed live from Admin', style: TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0284C7)))
          : RefreshIndicator(
              onRefresh: _fetchProducts,
              color: const Color(0xFF0284C7),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Morning Guarantee Banner
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF0284C7), Color(0xFF0369A1)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(color: const Color(0xFF0284C7).withOpacity(0.25), blurRadius: 10, offset: const Offset(0, 4)),
                        ],
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.wb_sunny_rounded, color: Colors.amber, size: 36),
                          SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Guaranteed Morning Delivery', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                                SizedBox(height: 3),
                                Text('Silent doorstep drop before 7:30 AM • Pause or cancel anytime on app without hassle.',
                                    style: TextStyle(color: Colors.white70, fontSize: 11)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // 20L Water Cans Section
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('20 Litre Water Cans (${_waterCans.length})', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                        const Text('Clean & Sealed', style: TextStyle(fontSize: 12, color: Color(0xFF0284C7), fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 10),

                    _waterCans.isEmpty
                        ? Container(
                            padding: const EdgeInsets.all(16),
                            child: const Text('No water cans configured in database. Admin can add from Admin Tower.',
                                style: TextStyle(color: Colors.grey, fontSize: 12)),
                          )
                        : Column(
                            children: _waterCans.map((can) {
                              return Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 52,
                                      height: 52,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF0284C7).withOpacity(0.08),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Icon(Icons.water_drop_rounded, color: Color(0xFF0284C7), size: 28),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(can['name'] ?? 'Water Can', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                                          const SizedBox(height: 2),
                                          Text('${can['unit'] ?? '20L Can'} • Sealed Quality', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                                          const SizedBox(height: 4),
                                          Text('₹${can['price'] ?? 90} / Can', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0284C7))),
                                        ],
                                      ),
                                    ),
                                    ElevatedButton(
                                      onPressed: () => _showSubscriptionModal(can, true),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF0284C7),
                                        foregroundColor: Colors.white,
                                        elevation: 0,
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                      child: const Text('Order / Sub', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                    const SizedBox(height: 20),

                    // Daily Morning Milk Subscriptions
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Daily Fresh Milk Subscriptions (${_milks.length})', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                        const Text('Sanchi & Amul', style: TextStyle(fontSize: 12, color: Color(0xFF16A34A), fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 10),

                    _milks.isEmpty
                        ? Container(
                            padding: const EdgeInsets.all(16),
                            child: const Text('No milk products configured in database. Admin can add from Admin Tower.',
                                style: TextStyle(color: Colors.grey, fontSize: 12)),
                          )
                        : Column(
                            children: _milks.map((milk) {
                              return Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 52,
                                      height: 52,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF16A34A).withOpacity(0.08),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Icon(Icons.local_drink_rounded, color: Color(0xFF16A34A), size: 28),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(milk['name'] ?? 'Milk Pouch', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                                          const SizedBox(height: 2),
                                          Text('${milk['unit'] ?? '500 ml'} • Fresh Morning Supply', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                                          const SizedBox(height: 4),
                                          Text('₹${milk['price'] ?? 27} / pack', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF16A34A))),
                                        ],
                                      ),
                                    ),
                                    ElevatedButton(
                                      onPressed: () => _showSubscriptionModal(milk, false),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF16A34A),
                                        foregroundColor: Colors.white,
                                        elevation: 0,
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                      child: const Text('Subscribe', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                    ),
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
