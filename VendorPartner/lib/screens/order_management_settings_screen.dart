import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../api_constants.dart';
import '../services/platform_config_service.dart';
import '../services/restaurant_auth_service.dart';
import '../theme/app_colors.dart';

class OrderManagementSettingsScreen extends StatefulWidget {
  const OrderManagementSettingsScreen({super.key});

  @override
  State<OrderManagementSettingsScreen> createState() => _OrderManagementSettingsScreenState();
}

class _OrderManagementSettingsScreenState extends State<OrderManagementSettingsScreen> {
  bool _autoAcceptOrders = false;
  String _limitType = 'Unlimited'; // 'Unlimited' or 'Custom'
  final TextEditingController _customLimitController = TextEditingController(text: '50');
  final TextEditingController _prepTimeController = TextEditingController(text: '20 mins');
  bool _orderScheduling = false;
  bool _selfPickupEnabled = true;
  bool _autoReadyNotification = true;
  final TextEditingController _prepBufferController = TextEditingController(text: '5 mins');
  final TextEditingController _pickupSlotController = TextEditingController(text: '15 mins');
  final TextEditingController _maxPickupCapacityController = TextEditingController(text: '20 orders/hr');
  final TextEditingController _gracePeriodController = TextEditingController(text: '15 mins');
  final TextEditingController _cancellationWindowController = TextEditingController(text: '5 mins');
  bool _isSaving = false;

  bool get _isGrocery =>
      PlatformConfigService.isGroceryPlatform || RestaurantAuthService.isGroceryStore;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final restId = ApiConstants.restaurantId.isNotEmpty
          ? ApiConstants.restaurantId
          : (prefs.getString('restaurantId') ?? '');
      final token = prefs.getString('token') ?? '';

      if (restId.isNotEmpty) {
        final res = await http.get(
          Uri.parse('${ApiConstants.baseUrl}/restaurants/vendor/profile/$restId'),
          headers: {
            'Content-Type': 'application/json',
            if (token.isNotEmpty) 'Authorization': 'Bearer $token',
          },
        ).timeout(const Duration(seconds: 6));

        if (res.statusCode == 200) {
          final data = jsonDecode(res.body);
          final rest = data['restaurant'] ?? data;
          if (mounted && rest != null) {
            setState(() {
              _autoAcceptOrders = rest['autoAcceptOrders'] == true;
              _selfPickupEnabled = rest['isSelfPickupEnabled'] != false;
              _orderScheduling = rest['orderScheduling'] == true;
              _autoReadyNotification = rest['autoReadyNotification'] != false;
              if (rest['dailyOrderLimit'] != null && (rest['dailyOrderLimit'] as num) > 0) {
                _limitType = 'Custom';
                _customLimitController.text = '${rest['dailyOrderLimit']}';
              }
              if (rest['estimatedPreparationTime'] != null) {
                _prepTimeController.text = '${rest['estimatedPreparationTime']} mins';
              }
              if (rest['prepBufferTimeMinutes'] != null) {
                _prepBufferController.text = '${rest['prepBufferTimeMinutes']} mins';
              }
              if (rest['cancellationWindowMinutes'] != null) {
                _cancellationWindowController.text = '${rest['cancellationWindowMinutes']} mins';
              }
              if (rest['gracePeriodMinutes'] != null) {
                _gracePeriodController.text = '${rest['gracePeriodMinutes']} mins';
              }
              if (rest['pickupSlotDurationMinutes'] != null) {
                _pickupSlotController.text = '${rest['pickupSlotDurationMinutes']} mins';
              }
              if (rest['maxPickupCapacity'] != null) {
                _maxPickupCapacityController.text = '${rest['maxPickupCapacity']} orders/hr';
              }
            });
          }
        }
      }
    } catch (e) {
      debugPrint('OrderManagementSettings load error: $e');
    }
  }

  Future<void> _saveSettings() async {
    if (_isSaving) return;
    setState(() => _isSaving = true);

    String? errorMsg;
    bool saved = false;
    try {
      final prefs = await SharedPreferences.getInstance();
      final restId = ApiConstants.restaurantId.isNotEmpty
          ? ApiConstants.restaurantId
          : (prefs.getString('restaurantId') ?? '');
      final token = prefs.getString('token') ?? '';

      if (restId.isEmpty) {
        errorMsg = 'Store session not found. Please log in again.';
      } else {
        final prepTimeVal = int.tryParse(_prepTimeController.text.replaceAll(RegExp(r'\D'), '')) ?? 15;
        final bufferVal = int.tryParse(_prepBufferController.text.replaceAll(RegExp(r'\D'), '')) ?? 0;
        final cancelVal = int.tryParse(_cancellationWindowController.text.replaceAll(RegExp(r'\D'), '')) ?? 5;
        final graceVal = int.tryParse(_gracePeriodController.text.replaceAll(RegExp(r'\D'), '')) ?? 15;
        final slotVal = int.tryParse(_pickupSlotController.text.replaceAll(RegExp(r'\D'), '')) ?? 15;
        final capacityVal = int.tryParse(_maxPickupCapacityController.text.replaceAll(RegExp(r'\D'), '')) ?? 20;
        final customLimit = _limitType == 'Custom'
            ? (int.tryParse(_customLimitController.text.replaceAll(RegExp(r'\D'), '')) ?? 50)
            : 0;

        final payload = {
          'autoAcceptOrders': _autoAcceptOrders,
          'isSelfPickupEnabled': _selfPickupEnabled,
          'orderScheduling': _orderScheduling,
          'autoReadyNotification': _autoReadyNotification,
          'dailyOrderLimit': customLimit,
          'estimatedPreparationTime': prepTimeVal,
          'prepBufferTimeMinutes': bufferVal,
          'cancellationWindowMinutes': cancelVal,
          'gracePeriodMinutes': graceVal,
          'pickupSlotDurationMinutes': slotVal,
          'maxPickupCapacity': capacityVal,
        };

        final response = await http.put(
          Uri.parse('${ApiConstants.baseUrl}/restaurants/vendor/profile/$restId'),
          headers: {
            'Content-Type': 'application/json',
            if (token.isNotEmpty) 'Authorization': 'Bearer $token',
          },
          body: jsonEncode(payload),
        ).timeout(const Duration(seconds: 8));

        if (response.statusCode >= 200 && response.statusCode < 300) {
          saved = true;
        } else {
          try {
            final errBody = jsonDecode(response.body);
            errorMsg = errBody['message']?.toString() ?? 'Failed to save (${response.statusCode})';
          } catch (_) {
            errorMsg = 'Failed to save settings (${response.statusCode})';
          }
        }
      }
    } catch (e) {
      errorMsg = 'Network error saving settings: $e';
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            saved
                ? 'Order management settings saved to server!'
                : (errorMsg ?? 'Could not save order management settings'),
            style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w500),
          ),
          backgroundColor: saved ? AppColors.primaryGreen : Colors.redAccent,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: Text(
          'Order Management',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.bold,
            fontSize: 20,
            color: Colors.black87,
          ),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Auto Accept Orders
                  _buildSettingCard(
                    title: 'Auto Accept Orders',
                    subtitle: 'Automatically accept incoming orders.',
                    trailing: Switch(
                      value: _autoAcceptOrders,
                      activeThumbColor: AppColors.primaryGreen,
                      activeTrackColor: AppColors.primaryGreen.withValues(alpha: 0.4),
                      onChanged: (val) {
                        setState(() {
                          _autoAcceptOrders = val;
                        });
                      },
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Daily Order Limit Section
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey[200]!, width: 1),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Daily Order Limit',
                          style: GoogleFonts.poppins(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Maximum number of orders per day.',
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Radio Pills Row matching reference image
                        Row(
                          children: [
                            Expanded(
                              child: _buildRadioOption('Unlimited'),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildRadioOption('Custom'),
                            ),
                          ],
                        ),

                        if (_limitType == 'Custom') ...[
                          const SizedBox(height: 14),
                          TextField(
                            controller: _customLimitController,
                            keyboardType: TextInputType.number,
                            style: GoogleFonts.poppins(fontSize: 14),
                            decoration: InputDecoration(
                              labelText: 'Max Orders Count',
                              hintText: 'e.g. 50',
                              hintStyle: GoogleFonts.poppins(color: Colors.grey[400], fontSize: 13),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(color: Colors.grey[300]!),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: AppColors.primaryGreen, width: 2),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Default Preparation / Packing Time Section
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey[200]!, width: 1),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isGrocery ? 'Default Packing Time' : 'Default Preparation Time',
                          style: GoogleFonts.poppins(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _isGrocery
                              ? 'Average time to pack an order'
                              : 'Average time to prepare an order',
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 14),
                        TextField(
                          controller: _prepTimeController,
                          style: GoogleFonts.poppins(fontSize: 14),
                          decoration: InputDecoration(
                            hintText: 'Enter average time',
                            hintStyle: GoogleFonts.poppins(color: Colors.grey[400], fontSize: 13),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: Colors.grey[300]!),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: AppColors.primaryGreen, width: 2),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Order Scheduling Section
                  _buildSettingCard(
                    title: 'Order Scheduling',
                    subtitle: 'Allow customers to place future orders.',
                    trailing: Switch(
                      value: _orderScheduling,
                      activeThumbColor: AppColors.primaryGreen,
                      activeTrackColor: AppColors.primaryGreen.withValues(alpha: 0.4),
                      onChanged: (val) {
                        setState(() {
                          _orderScheduling = val;
                        });
                      },
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Advanced Self Pickup Configuration Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.orange.withValues(alpha: 0.3), width: 1.2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.orange.withValues(alpha: 0.04),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.storefront, color: Colors.orange, size: 22),
                                const SizedBox(width: 8),
                                Text(
                                  'Self Pickup Settings',
                                  style: GoogleFonts.poppins(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                            Switch(
                              value: _selfPickupEnabled,
                              activeThumbColor: Colors.orange,
                              activeTrackColor: Colors.orange.withValues(alpha: 0.4),
                              onChanged: (val) => setState(() => _selfPickupEnabled = val),
                            ),
                          ],
                        ),
                        Text(
                          _isGrocery
                              ? 'Configure store pickup slots, packing buffer & counter capacity.'
                              : 'Configure pickup slots, prep buffer & counter capacity.',
                          style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
                        ),
                        const Divider(height: 24),
                        if (_selfPickupEnabled) ...[
                          _buildSubSettingRow(_isGrocery ? 'Packing Buffer Time' : 'Preparation Buffer Time', _prepBufferController, 'e.g. 5 mins'),
                          const SizedBox(height: 12),
                          _buildSubSettingRow('Pickup Slot Duration', _pickupSlotController, 'e.g. 15 mins'),
                          const SizedBox(height: 12),
                          _buildSubSettingRow('Max Pickup Capacity', _maxPickupCapacityController, 'e.g. 20 orders/hr'),
                          const SizedBox(height: 12),
                          _buildSubSettingRow('Grace Period', _gracePeriodController, 'e.g. 15 mins'),
                          const SizedBox(height: 12),
                          _buildSubSettingRow('Cancellation Window', _cancellationWindowController, 'e.g. 5 mins'),
                          const SizedBox(height: 14),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Automatic "Ready" Notification', style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold)),
                                    Text(
                                      _isGrocery
                                          ? 'Trigger notification to customer when packing timer ends'
                                          : 'Trigger notification to customer when prep timer ends',
                                      style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[600]),
                                    ),
                                  ],
                                ),
                              ),
                              Switch(
                                value: _autoReadyNotification,
                                activeThumbColor: AppColors.primaryGreen,
                                activeTrackColor: AppColors.primaryGreen.withValues(alpha: 0.4),
                                onChanged: (val) => setState(() => _autoReadyNotification = val),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Primary Green Save Button
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -3),
                ),
              ],
            ),
            child: SafeArea(
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _saveSettings,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: _isSaving
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                        )
                      : Text(
                          'Save',
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRadioOption(String label) {
    final bool isSelected = _limitType == label;
    return GestureDetector(
      onTap: () {
        setState(() {
          _limitType = label;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryGreen.withValues(alpha: 0.06) : Colors.grey[50],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primaryGreen : Colors.grey[300]!,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
              size: 18,
              color: isSelected ? AppColors.primaryGreen : Colors.grey[400],
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? AppColors.primaryGreen : Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingCard({
    required String title,
    required String subtitle,
    required Widget trailing,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          trailing,
        ],
      ),
    );
  }

  Widget _buildSubSettingRow(String label, TextEditingController controller, String hint) {
    return Row(
      children: [
        Expanded(
          flex: 3,
          child: Text(
            label,
            style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w500, color: Colors.black87),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          flex: 2,
          child: SizedBox(
            height: 40,
            child: TextField(
              controller: controller,
              style: GoogleFonts.poppins(fontSize: 12),
              decoration: InputDecoration(
                hintText: hint,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: Colors.orange, width: 1.5),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
