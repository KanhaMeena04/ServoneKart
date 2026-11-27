import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../api_constants.dart';
import '../theme/app_colors.dart';

class VendorPlansScreen extends StatefulWidget {
  const VendorPlansScreen({super.key});

  @override
  State<VendorPlansScreen> createState() => _VendorPlansScreenState();
}

class _VendorPlansScreenState extends State<VendorPlansScreen> {
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
      final url = Uri.parse('${ApiConstants.baseUrl}/memberships/plans?targetAudience=vendor');
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
      debugPrint('Error fetching vendor plans: $e');
    }
  }

  Future<void> _fetchMySubscription() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? ApiConstants.authToken;
      final restId = ApiConstants.restaurantId.isNotEmpty
          ? ApiConstants.restaurantId
          : (prefs.getString('restaurantId') ?? '');

      final url = Uri.parse('${ApiConstants.baseUrl}/memberships/my-subscription?targetAudience=vendor&userId=$restId');
      final headers = {
        'Content-Type': 'application/json',
        if (token.isNotEmpty) 'Authorization': 'Bearer $token',
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
      debugPrint('Error fetching vendor subscription: $e');
    }
  }

  Future<void> _subscribeToPlan(Map<String, dynamic> plan, String paymentMethod) async {
    setState(() => _isSubscribing = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? ApiConstants.authToken;
      final restId = ApiConstants.restaurantId.isNotEmpty
          ? ApiConstants.restaurantId
          : (prefs.getString('restaurantId') ?? '000000000000000000000001');

      final url = Uri.parse('${ApiConstants.baseUrl}/memberships/subscribe');
      final headers = {
        'Content-Type': 'application/json',
        if (token.isNotEmpty) 'Authorization': 'Bearer $token',
      };
      final txnId = 'TXN-STORE-${DateTime.now().millisecondsSinceEpoch}';
      final body = jsonEncode({
        'planId': plan['_id'],
        'targetAudience': 'vendor',
        'paymentMethod': paymentMethod,
        'transactionId': txnId,
        'userId': restId,
        'userName': prefs.getString('restaurantName') ?? 'Supermarket Partner',
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
            SnackBar(content: Text(err['message'] ?? 'Subscription failed'), backgroundColor: Colors.red),
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
              child: const Icon(Icons.store, color: Color(0xFF0145F2), size: 40),
            ),
            const SizedBox(height: 16),
            Text(
              'Store Upgraded!',
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: const Color(0xFF07162E),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Your supermarket is now verified under ${plan['name']}. Enjoy priority customer ranking.',
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
                'BADGE: ${plan['badge'] ?? 'VERIFIED MERCHANT'} ✦',
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
                child: Text('Go to Store Dashboard', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showPaymentBottomSheet(Map<String, dynamic> plan) {
    String selectedMethod = 'NetBanking';

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
                        plan['name'] ?? 'Supermarket Package',
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFF07162E),
                        ),
                      ),
                      Text(
                        'Merchant Onboarding · ${plan['billingCycle'] ?? 'one-time'}',
                        style: GoogleFonts.poppins(fontSize: 12, color: const Color(0xFF64748B)),
                      ),
                    ],
                  ),
                  Text(
                    '₹${plan['price']}',
                    style: GoogleFonts.poppins(
                      fontSize: 22,
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

              // Net Banking
              _paymentOptionTile(
                icon: Icons.account_balance,
                title: 'Net Banking / Business Account',
                subtitle: 'HDFC, SBI, ICICI, Axis corporate banking',
                isSelected: selectedMethod == 'NetBanking',
                onTap: () => setSheetState(() => selectedMethod = 'NetBanking'),
              ),
              // UPI
              _paymentOptionTile(
                icon: Icons.qr_code_2,
                title: 'UPI / Merchant QR',
                subtitle: 'Google Pay, PhonePe, Paytm Business',
                isSelected: selectedMethod == 'UPI',
                onTap: () => setSheetState(() => selectedMethod = 'UPI'),
              ),
              // Card
              _paymentOptionTile(
                icon: Icons.credit_card,
                title: 'Business Debit / Credit Card',
                subtitle: 'Corporate Visa, MasterCard, RuPay',
                isSelected: selectedMethod == 'Card',
                onTap: () => setSheetState(() => selectedMethod = 'Card'),
              ),
              // Instant Test Pay
              _paymentOptionTile(
                icon: Icons.flash_on,
                title: 'Instant Test Onboarding (Demo)',
                subtitle: 'Immediate package activation for demonstration',
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
                    'Pay ₹${plan['price']} & Activate Package',
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
          'Sell with Tricelyn',
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
                  // ── Hero Banner matching Screenshot 3 ──
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
                          'Sell from your own supermarket on Tricelyn.',
                          style: GoogleFonts.poppins(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Reach customers nearby, keep your name and rating in front of them, and let us handle the app, riders and payments.',
                          style: GoogleFonts.poppins(
                            fontSize: 12.5,
                            color: const Color(0xFFDBEAFE),
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // ── 3 Value Cards ──
                  _buildValueCard('Your name shows', 'Customers pick your store and see your rating, ETA and full catalogue.'),
                  const SizedBox(height: 10),
                  _buildValueCard('Lower commission', 'Published rates by category, with a launch offer for your first 60 days.'),
                  const SizedBox(height: 10),
                  _buildValueCard('No fleet needed', 'We assign riders, collect payments and settle to your bank account.'),

                  const SizedBox(height: 20),

                  // ── Active Subscription Banner ──
                  if (_activeSubscription != null) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF0145F2), width: 1.5),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: const BoxDecoration(color: Color(0xFF0145F2), shape: BoxShape.circle),
                            child: const Icon(Icons.verified, color: Colors.white, size: 24),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _activeSubscription?['planName'] ?? 'Verified Merchant',
                                  style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w800),
                                ),
                                Text(
                                  'Status: ACTIVE · Verified Merchant Badge Live',
                                  style: GoogleFonts.poppins(fontSize: 11, color: const Color(0xFF0145F2), fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                  ] else ...[
                    // Default Base Free Listing Pill
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
                              'Current Plan: Base Free Listing (Sell with standard commission, zero upfront fee)',
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
                    const SizedBox(height: 20),
                  ],

                  // ── Onboarding & Membership Packages ──
                  Text(
                    'Supermarket Partner Packages',
                    style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w800, color: const Color(0xFF07162E)),
                  ),
                  const SizedBox(height: 12),

                  ..._plans.map((p) {
                    final isFree = (p['price'] as num? ?? 0) == 0;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: !isFree ? const Color(0xFF0145F2).withValues(alpha: 0.3) : const Color(0xFFE2E8F0),
                          width: !isFree ? 1.5 : 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 12,
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
                                p['name'],
                                style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w800, color: const Color(0xFF07162E)),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: isFree ? const Color(0xFF64748B) : const Color(0xFF0145F2),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  p['badge'] ?? 'VERIFIED',
                                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(
                                isFree ? 'Free' : '₹${p['price']}',
                                style: GoogleFonts.poppins(
                                  fontSize: 26,
                                  fontWeight: FontWeight.w900,
                                  color: isFree ? const Color(0xFF07162E) : const Color(0xFF0145F2),
                                ),
                              ),
                              if (!isFree) ...[
                                const SizedBox(width: 4),
                                Text(
                                  '/ ${p['billingCycle']}',
                                  style: GoogleFonts.poppins(fontSize: 12, color: const Color(0xFF64748B), fontWeight: FontWeight.w600),
                                ),
                              ],
                            ],
                          ),
                          if (p['commissionRate'] != null && p['commissionRate'].toString().isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              'Commission: ${p['commissionRate']}',
                              style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w700, color: const Color(0xFF10B981)),
                            ),
                          ],
                          const SizedBox(height: 12),
                          const Divider(height: 1, color: Color(0xFFF1F5F9)),
                          const SizedBox(height: 12),
                          ...((p['features'] as List<dynamic>? ?? []).map(
                            (f) => Padding(
                              padding: const EdgeInsets.only(bottom: 6),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    width: 6,
                                    height: 6,
                                    margin: const EdgeInsets.only(top: 6, right: 10),
                                    decoration: const BoxDecoration(color: Color(0xFF0145F2), shape: BoxShape.circle),
                                  ),
                                  Expanded(
                                    child: Text(
                                      f.toString(),
                                      style: GoogleFonts.poppins(fontSize: 12, color: const Color(0xFF334155)),
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
                                      if (isFree) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            content: Text('Base Free is already your active store tier!'),
                                            backgroundColor: Color(0xFF0145F2),
                                          ),
                                        );
                                      } else {
                                        _showPaymentBottomSheet(p as Map<String, dynamic>);
                                      }
                                    },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: isFree ? const Color(0xFF07162E) : const Color(0xFF0145F2),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                elevation: 0,
                              ),
                              child: Text(
                                isFree ? 'Base Free (Default Active)' : 'Select Package (Pay ₹${p['price']})',
                                style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 13),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),

                  // ── What we need from your store ──
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
                          'What we need from your store',
                          style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w800, color: const Color(0xFF07162E)),
                        ),
                        const SizedBox(height: 12),
                        _buildRequirementItem('GST, shop licence, FSSAI and a bank account'),
                        _buildRequirementItem('A catalogue with barcodes, prices and shelf codes'),
                        _buildRequirementItem('A person to accept in 30 seconds and pack in about 2:30'),
                        _buildRequirementItem('Stock marked in or out so customers never get surprises'),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }

  Widget _buildValueCard(String title, String desc) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w800, color: const Color(0xFF07162E))),
          const SizedBox(height: 4),
          Text(desc, style: GoogleFonts.poppins(fontSize: 12, color: const Color(0xFF64748B))),
        ],
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
            decoration: const BoxDecoration(color: Color(0xFF0145F2), shape: BoxShape.circle),
          ),
          Expanded(child: Text(text, style: GoogleFonts.poppins(fontSize: 12, color: const Color(0xFF334155)))),
        ],
      ),
    );
  }
}
