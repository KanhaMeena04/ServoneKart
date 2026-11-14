import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import '../../core/constants/api_constansts.dart';
import '../../data/services/auth_service.dart';

class RiderPlansScreen extends StatefulWidget {
  const RiderPlansScreen({super.key});

  @override
  State<RiderPlansScreen> createState() => _RiderPlansScreenState();
}

class _RiderPlansScreenState extends State<RiderPlansScreen> {
  bool _isLoading = true;
  bool _isSubscribing = false;
  List<dynamic> _plans = [];
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
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _fetchPlans() async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}/memberships/plans?targetAudience=rider');
      final res = await http.get(url).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['data'] != null) {
          setState(() {
            _plans = data['data'] as List<dynamic>;
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching rider plans: $e');
    }
  }

  Future<void> _fetchMySubscription() async {
    try {
      final token = await AuthService.getToken();
      final url = Uri.parse('${ApiConstants.baseUrl}/memberships/my-subscription?targetAudience=rider');
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
      debugPrint('Error fetching rider subscription: $e');
    }
  }

  Future<void> _subscribeToPlan(Map<String, dynamic> plan) async {
    setState(() => _isSubscribing = true);
    try {
      final token = await AuthService.getToken();
      final user = await AuthService.getUser();
      final url = Uri.parse('${ApiConstants.baseUrl}/memberships/subscribe');
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };
      final body = jsonEncode({
        'planId': plan['_id'],
        'targetAudience': 'rider',
        'paymentMethod': 'Online',
        'userId': user?['_id'] ?? user?['id'],
        'userName': user?['name'] ?? 'Rider Partner',
        'userPhone': user?['phone'] ?? '',
      });

      final res = await http.post(url, headers: headers, body: body).timeout(const Duration(seconds: 12));
      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = jsonDecode(res.body);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(data['message'] ?? 'Successfully activated Pro Rider Pass!'),
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
            SnackBar(content: Text(err['message'] ?? 'Activation failed'), backgroundColor: Colors.red),
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
      if (mounted) setState(() => _isSubscribing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          'Ride with Tricelyn',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF07162E),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0B3EDB)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Hero Banner matching Screenshot 2 ──
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF07162E), Color(0xFF0A2B6B)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF07162E).withValues(alpha: 0.3),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Ride with Tricelyn.',
                          style: GoogleFonts.poppins(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Short rides near your station, clear pay shown for every delivery, and a weekly payout to your bank account.',
                          style: GoogleFonts.poppins(
                            fontSize: 12.5,
                            color: const Color(0xFFDBEAFE),
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 18),

                  // ── Active Subscription Badge Card (If Active) ──
                  if (_activeSubscription != null) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF0B3EDB), width: 1.5),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0B3EDB).withValues(alpha: 0.1),
                            blurRadius: 10,
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: const BoxDecoration(
                              color: Color(0xFF0B3EDB),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.workspace_premium, color: Colors.amber, size: 24),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      _activeSubscription?['planName'] ?? 'Pro Pass',
                                      style: GoogleFonts.poppins(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w800,
                                        color: const Color(0xFF07162E),
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.amber,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Text(
                                        'PRO RIDER',
                                        style: TextStyle(
                                          fontSize: 9,
                                          fontWeight: FontWeight.w900,
                                          color: Color(0xFF07162E),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Active until: ${_activeSubscription?['endDate'] != null ? _activeSubscription!['endDate'].toString().substring(0, 10) : 'Live'}',
                                  style: GoogleFonts.poppins(fontSize: 11, color: const Color(0xFF64748B)),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                  ],

                  // ── Rider Plans Grid ──
                  ..._plans.map((p) {
                    final isPro = p['price'] > 0;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: isPro ? const Color(0xFF0B3EDB) : const Color(0xFFE2E8F0),
                          width: isPro ? 1.8 : 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: isPro ? const Color(0xFF0B3EDB).withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.03),
                            blurRadius: 14,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                p['tag']?.toString().toUpperCase() ?? (isPro ? 'PRO, DAY PASS' : 'BASE'),
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w900,
                                  color: isPro ? const Color(0xFF0B3EDB) : const Color(0xFF64748B),
                                  letterSpacing: 0.5,
                                ),
                              ),
                              if (isPro)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0B3EDB),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    p['badge'] ?? 'PRO RIDER',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontSize: 9,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 8),

                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(
                                p['price'] == 0 ? 'Free' : '₹${p['price']}',
                                style: GoogleFonts.poppins(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w900,
                                  color: const Color(0xFF07162E),
                                ),
                              ),
                              if (p['price'] > 0) ...[
                                const SizedBox(width: 4),
                                Text(
                                  'a ${p['billingCycle']}',
                                  style: GoogleFonts.poppins(
                                    fontSize: 13,
                                    color: const Color(0xFF64748B),
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ],
                          ),

                          if (p['subtitle'] != null && p['subtitle'].toString().isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              p['subtitle'].toString(),
                              style: GoogleFonts.poppins(fontSize: 11.5, color: const Color(0xFF64748B)),
                            ),
                          ],

                          const SizedBox(height: 14),
                          const Divider(height: 1, color: Color(0xFFF1F5F9)),
                          const SizedBox(height: 14),

                          // Features Checklist
                          ...((p['features'] as List<dynamic>? ?? []).map(
                            (feat) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    width: 6,
                                    height: 6,
                                    margin: const EdgeInsets.only(top: 6, right: 10),
                                    decoration: const BoxDecoration(
                                      color: Color(0xFF0B3EDB),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  Expanded(
                                    child: Text(
                                      feat.toString(),
                                      style: GoogleFonts.poppins(
                                        fontSize: 12.5,
                                        color: const Color(0xFF334155),
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )),

                          const SizedBox(height: 14),

                          SizedBox(
                            width: double.infinity,
                            height: 46,
                            child: ElevatedButton(
                              onPressed: _isSubscribing ? null : () => _subscribeToPlan(p as Map<String, dynamic>),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: isPro ? const Color(0xFF0B3EDB) : const Color(0xFF07162E),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                elevation: 0,
                              ),
                              child: Text(
                                isPro ? 'Activate ${p['name']}' : 'Selected by Default',
                                style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 13),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),

                  // ── What you need Card ──
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'What you need',
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFF07162E),
                          ),
                        ),
                        const SizedBox(height: 12),
                        _buildRequirementItem('ID proof and driving licence'),
                        _buildRequirementItem('Vehicle registration and a helmet'),
                        _buildRequirementItem('Bank account for payouts'),
                        _buildRequirementItem('Wallet balance for cash orders, if you take them'),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),
                  Center(
                    child: Text(
                      'Sample prices. Pro pays off on busy days with many orders.',
                      style: GoogleFonts.poppins(fontSize: 10, color: const Color(0xFF94A3B8)),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }

  Widget _buildRequirementItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 6,
            height: 6,
            margin: const EdgeInsets.only(top: 6, right: 10),
            decoration: const BoxDecoration(
              color: Color(0xFF0B3EDB),
              shape: BoxShape.circle,
            ),
          ),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.poppins(fontSize: 12.5, color: const Color(0xFF334155)),
            ),
          ),
        ],
      ),
    );
  }
}
