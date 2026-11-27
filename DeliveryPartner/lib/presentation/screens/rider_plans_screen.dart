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
        } else {
          setState(() {
            _activeSubscription = null;
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching rider subscription: $e');
    }
  }

  Future<void> _subscribeToPlan(Map<String, dynamic> plan, String paymentMethod) async {
    setState(() => _isSubscribing = true);
    try {
      final token = await AuthService.getToken();
      final user = await AuthService.getUser();
      final url = Uri.parse('${ApiConstants.baseUrl}/memberships/subscribe');
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };
      final txnId = 'TXN-RIDER-${DateTime.now().millisecondsSinceEpoch}';
      final body = jsonEncode({
        'planId': plan['_id'],
        'targetAudience': 'rider',
        'paymentMethod': paymentMethod,
        'transactionId': txnId,
        'userId': user?['_id'] ?? user?['id'],
        'userName': user?['name'] ?? 'Rider Partner',
        'userPhone': user?['phone'] ?? user?['mobile'] ?? '',
      });

      final res = await http.post(url, headers: headers, body: body).timeout(const Duration(seconds: 12));
      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = jsonDecode(res.body);
        if (mounted) {
          _showCelebrationDialog(plan, txnId);
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

  void _showCelebrationDialog(Map<String, dynamic> plan, String txnId) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        contentPadding: const EdgeInsets.all(24),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: const Color(0xFF0145F2).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.two_wheeler, color: Color(0xFF0145F2), size: 40),
            ),
            const SizedBox(height: 16),
            Text(
              '${plan['name']} Activated!',
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: const Color(0xFF07162E),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Your Pro Rider status is live! Enjoy upfront payouts & priority dispatch.',
              style: GoogleFonts.poppins(fontSize: 12.5, color: const Color(0xFF64748B), height: 1.4),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF0145F2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'BADGE: ${plan['badge'] ?? 'PRO RIDER'} ✦',
                style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 11),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Ref: $txnId',
              style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8), fontFamily: 'monospace'),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0145F2),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  elevation: 0,
                ),
                child: Text('Start Riding', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showPaymentBottomSheet(Map<String, dynamic> plan) {
    String selectedMethod = 'UPI';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: const EdgeInsets.all(22),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        plan['name'] ?? 'Pro Pass',
                        style: GoogleFonts.poppins(
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFF07162E),
                        ),
                      ),
                      Text(
                        'Rider Partner · ${plan['billingCycle'] ?? 'day'}',
                        style: GoogleFonts.poppins(fontSize: 12, color: const Color(0xFF64748B)),
                      ),
                    ],
                  ),
                  Text(
                    '₹${plan['price']}',
                    style: GoogleFonts.poppins(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF0145F2),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(height: 1),
              const SizedBox(height: 14),
              Text(
                'Select Payment Option',
                style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w800, color: const Color(0xFF07162E)),
              ),
              const SizedBox(height: 10),

              // UPI Option
              _paymentOptionTile(
                icon: Icons.qr_code_2,
                title: 'UPI / Google Pay / PhonePe',
                subtitle: 'Instant deduction & pass activation',
                isSelected: selectedMethod == 'UPI',
                onTap: () => setSheetState(() => selectedMethod = 'UPI'),
              ),
              // Rider Wallet
              _paymentOptionTile(
                icon: Icons.account_balance_wallet,
                title: 'Rider Payout Wallet',
                subtitle: 'Deduct from accumulated delivery earnings',
                isSelected: selectedMethod == 'Wallet',
                onTap: () => setSheetState(() => selectedMethod = 'Wallet'),
              ),
              // Card Option
              _paymentOptionTile(
                icon: Icons.credit_card,
                title: 'Debit / Credit Card',
                subtitle: 'Visa, MasterCard, RuPay',
                isSelected: selectedMethod == 'Card',
                onTap: () => setSheetState(() => selectedMethod = 'Card'),
              ),
              // Instant Test Pay
              _paymentOptionTile(
                icon: Icons.flash_on,
                title: 'Instant Test Pass (Demo)',
                subtitle: 'One-click activation for test rides',
                isSelected: selectedMethod == 'TestPay',
                onTap: () => setSheetState(() => selectedMethod = 'TestPay'),
              ),

              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    _subscribeToPlan(plan, selectedMethod);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0145F2),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: Text(
                    'Pay ₹${plan['price']} & Activate Pass',
                    style: GoogleFonts.poppins(fontWeight: FontWeight.w900, fontSize: 14),
                  ),
                ),
              ),
              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
  }

  Widget _paymentOptionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0145F2).withValues(alpha: 0.06) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? const Color(0xFF0145F2) : Colors.grey.shade200,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? const Color(0xFF0145F2) : Colors.grey.shade600, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: isSelected ? const Color(0xFF07162E) : Colors.grey.shade800,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey.shade500),
                  ),
                ],
              ),
            ),
            Icon(
              isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
              color: isSelected ? const Color(0xFF0145F2) : Colors.grey.shade400,
              size: 20,
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
        title: Text(
          'Ride with Tricelyn',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF07162E),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0145F2)))
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
                          offset: const Offset(0, 4),
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

                  // ── Active Subscription Badge Card ──
                  if (_activeSubscription != null) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF0145F2), width: 1.5),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0145F2).withValues(alpha: 0.1),
                            blurRadius: 10,
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: const BoxDecoration(
                              color: Color(0xFF0145F2),
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
                  ] else ...[
                    // Default Base Free Rider Status Pill
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle, color: Color(0xFF059669), size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Current Plan: Base Free (Deliver freely anytime without upfront fee)',
                              style: GoogleFonts.poppins(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF334155),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                  ],

                  // ── Rider Plans Grid ──
                  ..._plans.map((p) {
                    final isPro = (p['price'] as num? ?? 0) > 0;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: isPro ? const Color(0xFF0145F2) : const Color(0xFFE2E8F0),
                          width: isPro ? 1.8 : 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: isPro ? const Color(0xFF0145F2).withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.03),
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
                                  color: isPro ? const Color(0xFF0145F2) : const Color(0xFF64748B),
                                  letterSpacing: 0.5,
                                ),
                              ),
                              if (isPro)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0145F2),
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
                              if ((p['price'] as num? ?? 0) > 0) ...[
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
                                      color: Color(0xFF0145F2),
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
                              onPressed: _isSubscribing
                                  ? null
                                  : () {
                                      if (isPro) {
                                        _showPaymentBottomSheet(p as Map<String, dynamic>);
                                      } else {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            content: Text('Base Free is already your default plan. Ride freely!'),
                                            backgroundColor: Color(0xFF0145F2),
                                          ),
                                        );
                                      }
                                    },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: isPro ? const Color(0xFF0145F2) : const Color(0xFF07162E),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                elevation: 0,
                              ),
                              child: Text(
                                isPro ? 'Activate ${p['name']} (Pay ₹${p['price']})' : 'Base Free (Default Active)',
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
              color: Color(0xFF0145F2),
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
