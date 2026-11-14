import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../services/auth_service.dart';

class PremierMembershipPage extends StatefulWidget {
  const PremierMembershipPage({super.key});

  @override
  State<PremierMembershipPage> createState() => _PremierMembershipPageState();
}

class _PremierMembershipPageState extends State<PremierMembershipPage> {
  bool _isLoading = true;
  bool _isSubscribing = false;
  List<dynamic> _plans = [];
  Map<String, dynamic>? _selectedPlan;
  Map<String, dynamic>? _activeSubscription;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    await Future.wait([
      _fetchPlans(),
      _fetchMySubscription(),
    ]);
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchPlans() async {
    try {
      final url = Uri.parse('${AppConstants.baseUrl}/memberships/plans?targetAudience=user');
      final res = await http.get(url).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['data'] != null) {
          final list = data['data'] as List<dynamic>;
          setState(() {
            _plans = list;
            if (list.isNotEmpty && _selectedPlan == null) {
              _selectedPlan = list[0] as Map<String, dynamic>;
            }
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching premier plans: $e');
    }
  }

  Future<void> _fetchMySubscription() async {
    try {
      final token = await AuthService.getToken();
      final url = Uri.parse('${AppConstants.baseUrl}/memberships/my-subscription?targetAudience=user');
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };
      final res = await http.get(url, headers: headers).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['hasActiveSubscription'] == true) {
          setState(() {
            _activeSubscription = data['subscription'] as Map<String, dynamic>?;
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching my subscription: $e');
    }
  }

  Future<void> _subscribeToPlan(Map<String, dynamic> plan) async {
    setState(() => _isSubscribing = true);
    try {
      final token = await AuthService.getToken();
      final url = Uri.parse('${AppConstants.baseUrl}/memberships/subscribe');
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };
      final body = jsonEncode({
        'planId': plan['_id'],
        'targetAudience': 'user',
        'paymentMethod': 'Online',
      });

      final res = await http.post(url, headers: headers, body: body).timeout(const Duration(seconds: 12));
      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = jsonDecode(res.body);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(data['message'] ?? 'Successfully subscribed to Premier!'),
              backgroundColor: const Color(0xFF0B3EDB),
              behavior: SnackBarBehavior.floating,
            ),
          );
          _fetchMySubscription();
        }
      } else {
        final err = jsonDecode(res.body);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(err['message'] ?? 'Subscription failed'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubscribing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Tricelyn Premier',
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF07162E),
        centerTitle: false,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Top Title Block ──
                  const Text(
                    'Tricelyn Premier',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF07162E),
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Real perks, no free-delivery tricks.',
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFF64748B),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // ── Active Subscription Banner (If Active) ──
                  if (_activeSubscription != null) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF07162E), Color(0xFF0A2B6B), Color(0xFF0B3EDB)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0B3EDB).withValues(alpha: 0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.15),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.workspace_premium, color: Colors.amber, size: 28),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      _activeSubscription?['planName'] ?? 'Premier Member',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 15,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.amber,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Text(
                                        'ACTIVE',
                                        style: TextStyle(
                                          color: Color(0xFF07162E),
                                          fontSize: 9,
                                          fontWeight: FontWeight.w900,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Expires: ${_activeSubscription?['endDate'] != null ? _activeSubscription!['endDate'].toString().substring(0, 10) : 'Active'}',
                                  style: TextStyle(
                                    color: Colors.white.withValues(alpha: 0.8),
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // ── Plan Selector Chips ──
                  if (_plans.length > 1) ...[
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: _plans.map((p) {
                          final isSelected = _selectedPlan?['_id'] == p['_id'];
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: ChoiceChip(
                              label: Text('${p['name']} · ₹${p['price']}'),
                              selected: isSelected,
                              selectedColor: AppColors.primary,
                              labelStyle: TextStyle(
                                color: isSelected ? Colors.white : const Color(0xFF334155),
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                              onSelected: (_) => setState(() => _selectedPlan = p as Map<String, dynamic>),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // ── Main Premier Plan Card (Matching Screenshot 1) ──
                  if (_selectedPlan != null) ...[
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFF0B3EDB).withValues(alpha: 0.3), width: 1.5),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0B3EDB).withValues(alpha: 0.06),
                            blurRadius: 16,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Tag
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0B3EDB),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              _selectedPlan?['tag']?.toString().toUpperCase() ?? 'PREMIER',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),

                          // Price Row
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(
                                '₹${_selectedPlan?['price']}',
                                style: const TextStyle(
                                  fontSize: 32,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF07162E),
                                ),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '/ ${_selectedPlan?['billingCycle'] ?? 'month'}',
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: Color(0xFF64748B),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Divider(height: 1, color: Color(0xFFF1F5F9)),
                          const SizedBox(height: 16),

                          // Features Bullet List
                          ...((_selectedPlan?['features'] as List<dynamic>? ?? []).map(
                            (feat) => Padding(
                              padding: const EdgeInsets.only(bottom: 10),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    width: 7,
                                    height: 7,
                                    margin: const EdgeInsets.only(top: 6, right: 10),
                                    decoration: const BoxDecoration(
                                      color: Color(0xFF0B3EDB),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  Expanded(
                                    child: Text(
                                      feat.toString(),
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color: Color(0xFF334155),
                                        fontWeight: FontWeight.w500,
                                        height: 1.35,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )),

                          const SizedBox(height: 16),

                          // Subscribe Action Button
                          SizedBox(
                            width: double.infinity,
                            height: 48,
                            child: ElevatedButton(
                              onPressed: _isSubscribing ? null : () => _subscribeToPlan(_selectedPlan!),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0B3EDB),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                elevation: 0,
                              ),
                              child: _isSubscribing
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                    )
                                  : Text(
                                      _activeSubscription != null ? 'Renew Premier' : 'Choose Premier',
                                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                                    ),
                            ),
                          ),

                          const SizedBox(height: 10),
                          const Center(
                            child: Text(
                              'Sample price. Priority is capped so other customers are never left waiting.',
                              style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // ── Highlight Cards matching Screenshot 1 ──
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Cash on delivery',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF07162E),
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Available to Premier members. Other customers can pay online or by UPI at the door.',
                          style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B), height: 1.4),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),

                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Priority is fair',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF07162E),
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Priority applies when riders are short, and non-members never wait beyond a set limit.',
                          style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B), height: 1.4),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }
}

