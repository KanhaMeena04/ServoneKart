import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class PaymentPolicyScreen extends StatelessWidget {
  const PaymentPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5FAF8),
      appBar: AppBar(
        title: Text('Payment Policy', style: GoogleFonts.poppins(fontWeight: FontWeight.w700, color: const Color(0xFF2C2C2C))),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF2C2C2C),
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: const [
              BoxShadow(color: Colors.black12, blurRadius: 15, offset: Offset(0, 5))
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: const Color(0xFF248C70).withValues(alpha: 0.1), shape: BoxShape.circle),
                  child: const Icon(Icons.payment_rounded, size: 48, color: Color(0xFF248C70)),
                ),
              ),
              const SizedBox(height: 24),
              Text('Payment Policy', style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.bold, color: const Color(0xFF2C2C2C))),
              const SizedBox(height: 8),
              Text('Effective Policy • Tricelyn Partner', style: GoogleFonts.poppins(fontSize: 14, color: Colors.grey[500])),
              const Divider(height: 32, color: Color(0xFFEEEEEE)),
              _buildSection('1. Commission Structure', 'Tricelyn applies the configured platform commission rate on completed orders processed through your store account.'),
              _buildSection('2. Payout Settlements', 'Net store earnings (after applicable commission and adjustments) are tracked in real time in your Store Wallet and settled via approved payout requests to your verified bank account.'),
              _buildSection('3. Refunds & Cancellations', 'Orders cancelled within the active cancellation window prior to packing/preparation are refunded to the customer without partner settlement credits.'),
              _buildSection('4. Discrepancies', 'If you notice a discrepancy regarding payout amounts, please contact Tricelyn Partner Support through Live Support Chat within 3 days of settlement.'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF248C70))),
          const SizedBox(height: 8),
          Text(content, style: GoogleFonts.poppins(fontSize: 15, color: Colors.grey[700], height: 1.5)),
        ],
      ),
    );
  }
}
