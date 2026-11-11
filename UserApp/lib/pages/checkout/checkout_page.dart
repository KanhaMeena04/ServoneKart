import '../../core/constants/app_constants.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/cart_provider.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'order_success_page.dart';
import '../../map_screen.dart';
import 'map_address_picker_page.dart';
import '../../core/models/address_model.dart';
import '../../providers/address_provider.dart';
import 'package:go_router/go_router.dart';
import '../../routes/app_routes.dart';
import '../../providers/order_provider.dart';
import '../../providers/platform_config_provider.dart';
import '../../providers/user_provider.dart';
import '../../services/payment_service.dart';

class CheckoutFlow extends StatefulWidget {
  final double subtotal;
  final double deliveryFee;
  final double total;

  const CheckoutFlow({
    super.key,
    required this.subtotal,
    required this.deliveryFee,
    required this.total,
  });

  @override
  State<CheckoutFlow> createState() => _CheckoutFlowState();
}

class _CheckoutFlowState extends State<CheckoutFlow> {
  int _step = 0; // 0=Address, 1=Summary, 2=Payment

  // Address state
  int _selectedAddressIndex = 0;
  bool _isAddressesLoaded = false;
  String? _deliveryPhone;

  void _loadAddresses() async {
    await context.read<AddressProvider>().fetchAddresses();
    if (mounted) {
      setState(() => _isAddressesLoaded = true);
    }
  }

  // Payment state
  int _selectedPayment = 0; // 0=COD, 1=UPI, 2=Card
  final _upiCtrl = TextEditingController();
  final _cardNumCtrl = TextEditingController();
  final _cardNameCtrl = TextEditingController();
  final _cardExpCtrl = TextEditingController();
  final _cardCvvCtrl = TextEditingController();
  bool _isPlacingOrder = false;
  bool _isSelfPickup = false;

  // Razorpay
  late Razorpay _razorpay;
  static const String _razorpayKey = AppConstants.razorpayKey;

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
    _loadAddresses();
  }

  @override
  void dispose() {
    _upiCtrl.dispose();
    _cardNumCtrl.dispose();
    _cardNameCtrl.dispose();
    _cardExpCtrl.dispose();
    _cardCvvCtrl.dispose();
    _razorpay.clear();
    super.dispose();
  }

  // Razorpay payment handlers
  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    if (!mounted) return;

    final result = await PaymentService.verifyPayment(
      razorpayOrderId: response.orderId ?? '',
      razorpayPaymentId: response.paymentId ?? '',
      razorpaySignature: response.signature ?? '',
    );

    if (!mounted) return;
    if (result != null && result['success'] == true) {
      await _submitOrderToBackend(
        paymentStatus: 'paid',
        transactionId: response.paymentId,
      );
    } else {
      setState(() => _isPlacingOrder = false);
      _showError(result?['message'] ?? 'Payment verification failed. Please contact support.');
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    if (!mounted) return;
    setState(() => _isPlacingOrder = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Payment failed: ${response.message ?? "Unknown error"}'),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    if (!mounted) return;
    setState(() => _isPlacingOrder = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('External wallet selected: ${response.walletName}'),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _openRazorpayUPI(String razorpayOrderId, {String? overrideKey, int? amountPaise}) {
    final cfg = context.read<PlatformConfigProvider>();
    final user = context.read<UserProvider>();
    final int payablePaise = amountPaise ?? ((widget.total * 100).round());
    final options = {
      'key': overrideKey ?? _razorpayKey,
      'amount': payablePaise,
      'order_id': razorpayOrderId,
      'name': cfg.appName,
      'description': cfg.isGroceryActive ? 'Grocery Order Payment' : 'Order Payment',
      'prefill': {
        'contact': user.phone.isNotEmpty ? user.phone : '9999999999',
        'email': user.email.isNotEmpty ? user.email : 'customer@tricelyn.com',
        if (_selectedPayment == 1) 'method': 'upi',
      },
      if (_selectedPayment == 1)
        'method': {
          'upi': true,
          'card': false,
          'netbanking': false,
          'wallet': false,
        },
      'theme': {'color': '#248C70'},
    };
    try {
      _razorpay.open(options);
    } catch (e) {
      setState(() => _isPlacingOrder = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not open payment: $e'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _submitOrderToBackend({
    String? paymentStatus,
    String? transactionId,
  }) async {
    final cart = context.read<CartProvider>();
    final cfg = context.read<PlatformConfigProvider>();
    final user = context.read<UserProvider>();
    final addressProvider = context.read<AddressProvider>();
    final isGrocery = cart.hasGroceryItems || cfg.isGroceryActive;

    final safeIdx = addressProvider.addresses.isEmpty
        ? 0
        : _selectedAddressIndex.clamp(0, addressProvider.addresses.length - 1);
    final selectedAddress = addressProvider.addresses.isNotEmpty
        ? addressProvider.addresses[safeIdx]
        : null;
    final locLat = selectedAddress?.latitude ?? 22.7196;
    final locLng = selectedAddress?.longitude ?? 75.8577;
    final payableTotal = _isSelfPickup
        ? (widget.total - widget.deliveryFee).clamp(0.0, 99999.0)
        : widget.total;

    Map<String, dynamic> result;
    if (isGrocery) {
      final groceryPayload = {
        if (cart.restaurantId != null && cart.restaurantId!.isNotEmpty)
          'storeId': cart.restaurantId,
        if (cart.restaurantName != null && cart.restaurantName!.isNotEmpty)
          'storeName': cart.restaurantName,
        'orderType': _isSelfPickup ? 'self_pickup' : 'delivery',
        'isSelfPickup': _isSelfPickup,
        'items': cart.items
            .map((i) => {
                  'productId': i.product.id,
                  'name': i.product.name,
                  'image': i.product.image,
                  'quantity': i.quantity,
                  'price': i.product.price,
                  if (i.product.unit != null) 'unit': i.product.unit,
                  if (i.product.weight != null) 'weight': i.product.weight,
                  'storeId': (i.product.storeId?.isNotEmpty == true)
                      ? i.product.storeId
                      : (i.product.restaurantId ?? cart.restaurantId ?? ''),
                  'storeName': (i.product.storeName?.isNotEmpty == true)
                      ? i.product.storeName
                      : (i.product.restaurantName ?? cart.restaurantName ?? 'Partner Mart'),
                })
            .toList(),
        if (selectedAddress != null) 'addressId': selectedAddress.id,
        'deliveryAddress': {
          'addressLine': selectedAddress?.fullAddress ?? 'Selected Delivery Address',
          'coordinates': [locLng, locLat],
          'name': user.name,
          'phone': (_deliveryPhone?.isNotEmpty == true) ? _deliveryPhone : user.phone,
        },
        'paymentMethod': _selectedPayment == 1 ? 'online' : (_selectedPayment == 2 ? 'card' : 'cod'),
        if (paymentStatus != null) 'paymentStatus': paymentStatus,
        if (transactionId != null) 'transactionId': transactionId,
        'totalPrice': payableTotal,
        'tip': _isSelfPickup ? 0.0 : cart.tipAmount,
      };
      result = await context.read<OrderProvider>().placeGroceryOrder(groceryPayload);
    } else {
      final orderData = {
        'restaurantId': cart.restaurantId,
        'orderType': _isSelfPickup ? 'self_pickup' : 'delivery',
        'isSelfPickup': _isSelfPickup,
        'items': cart.items
            .map((i) => {
                  'productId': i.product.id,
                  'quantity': i.quantity,
                  'price': i.product.price,
                })
            .toList(),
        'addressId': selectedAddress?.id ?? '',
        'address': selectedAddress?.id ?? '',
        if (_deliveryPhone != null && _deliveryPhone!.isNotEmpty) 'deliveryPhone': _deliveryPhone,
        'paymentMethod': _selectedPayment == 1 ? 'online' : (_selectedPayment == 2 ? 'card' : 'cod'),
        if (paymentStatus != null) 'paymentStatus': paymentStatus,
        if (transactionId != null) 'transactionId': transactionId,
        'totalPrice': payableTotal,
        'deliveryFee': _isSelfPickup ? 0.0 : widget.deliveryFee,
        'tipAmount': _isSelfPickup ? 0.0 : cart.tipAmount,
        'status': 'pending',
      };
      result = await context.read<OrderProvider>().placeOrder(orderData);
    }

    if (!mounted) return;
    setState(() => _isPlacingOrder = false);

    if (result['success'] == true) {
      cart.clear();
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const OrderSuccessPage()),
        (route) => false,
      );
    } else {
      final String msg = result['message'] ?? result['reason'] ?? result['error'] ?? 'Failed to place order.';
      if (msg.contains('geofence') || msg.contains('outside') || result['type'] == 'out_of_geofence') {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Row(
              children: const [
                Icon(Icons.location_off, color: Colors.red),
                SizedBox(width: 8),
                Text('Location Out of Zone'),
              ],
            ),
            content: Text(msg),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Change Address'),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                onPressed: () {
                  Navigator.pop(context);
                  setState(() => _isSelfPickup = true);
                },
                child: const Text('Switch to Self-Pickup', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        );
      } else {
        _showError(msg);
      }
    }
  }

  void _placeOrder() async {
    final addressProvider = context.read<AddressProvider>();
    if (!_isSelfPickup && addressProvider.addresses.isEmpty) {
      _showError('Please add a delivery address');
      return;
    }

    setState(() => _isPlacingOrder = true);

    if (_selectedPayment == 1 || _selectedPayment == 2) {
      final payableTotal = _isSelfPickup
          ? (widget.total - widget.deliveryFee).clamp(1.0, 99999.0)
          : widget.total;
      final rzpRes = await PaymentService.createOrder(payableTotal);
      if (!mounted) return;

      if (rzpRes == null || rzpRes['success'] != true || rzpRes['id'] == null) {
        setState(() => _isPlacingOrder = false);
        _showError(rzpRes?['message'] ?? 'Failed to initialize payment gateway.');
        return;
      }

      final rzpOrderId = rzpRes['id'].toString();
      if (rzpRes['isSandbox'] == true) {
        setState(() => _isPlacingOrder = false);
        final confirmed = await showDialog<bool>(
          context: context,
          barrierDismissible: false,
          builder: (dlgCtx) => AlertDialog(
            title: const Text('Confirm Test Sandbox Payment'),
            content: Text(
              'Live gateway keys are not active. Confirm test payment of ₹${payableTotal.toStringAsFixed(2)} for Order #$rzpOrderId?',
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(dlgCtx, false), child: const Text('Cancel')),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                onPressed: () => Navigator.pop(dlgCtx, true),
                child: const Text('Confirm Payment', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        );
        if (confirmed != true || !mounted) return;
        setState(() => _isPlacingOrder = true);
        final sandboxPayId = 'pay_sandbox_${DateTime.now().millisecondsSinceEpoch}';
        final verifyRes = await PaymentService.verifyPayment(
          razorpayOrderId: rzpOrderId,
          razorpayPaymentId: sandboxPayId,
          razorpaySignature: 'sandbox_confirm',
          isSandboxConfirm: true,
        );
        if (!mounted) return;
        if (verifyRes != null && verifyRes['success'] == true) {
          await _submitOrderToBackend(paymentStatus: 'paid', transactionId: sandboxPayId);
        } else {
          setState(() => _isPlacingOrder = false);
          _showError(verifyRes?['message'] ?? 'Sandbox payment verification failed');
        }
      } else {
        _openRazorpayUPI(
          rzpOrderId,
          overrideKey: rzpRes['keyId']?.toString(),
          amountPaise: (rzpRes['amountPaise'] as num?)?.toInt(),
        );
      }
      return;
    }

    await _submitOrderToBackend(paymentStatus: 'pending');
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
          content: Text(msg),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5FAF8),
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new,
              color: Colors.white, size: 20),
          onPressed: () =>
              _step == 0 ? Navigator.pop(context) : setState(() => _step--),
        ),
        title: Text(
          _step == 0
              ? 'Delivery Address'
              : _step == 1
                  ? 'Order Summary'
                  : 'Payment',
          style: const TextStyle(
              fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: _StepIndicator(currentStep: _step),
        ),
      ),
      body: Column(
        children: [
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _isSelfPickup = false),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: !_isSelfPickup ? AppColors.primary : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.two_wheeler, size: 18, color: !_isSelfPickup ? Colors.white : Colors.grey.shade700),
                            const SizedBox(width: 6),
                            Text('Delivery', style: TextStyle(color: !_isSelfPickup ? Colors.white : Colors.grey.shade800, fontWeight: FontWeight.bold, fontSize: 13)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _isSelfPickup = true),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _isSelfPickup ? AppColors.primary : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.shopping_bag_outlined, size: 18, color: _isSelfPickup ? Colors.white : Colors.grey.shade700),
                            const SizedBox(width: 6),
                            Text('Self Pickup', style: TextStyle(color: _isSelfPickup ? Colors.white : Colors.grey.shade800, fontWeight: FontWeight.bold, fontSize: 13)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: _step == 0
                  ? Consumer<AddressProvider>(
                      builder: (context, provider, _) => _AddressStep(
                        addresses: provider.addresses,
                        selected: _selectedAddressIndex,
                        isLoading: provider.isLoading,
                        onSelect: (i) =>
                            setState(() => _selectedAddressIndex = i),
                        onAddNew: () => context.push(AppRoutes.location),
                      ),
                    )
                  : _step == 1
                      ? Consumer<AddressProvider>(
                          builder: (context, provider, _) => _SummaryStep(
                            subtotal: widget.subtotal,
                            deliveryFee: widget.deliveryFee,
                            total: widget.total,
                            address: provider.addresses.isNotEmpty
                                ? provider.addresses[_selectedAddressIndex]
                                : null,
                            deliveryPhone: _deliveryPhone,
                            onChangeAddress: () async {
                              final result = await Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const MapAddressPickerPage()),
                              );
                              if (result == true && mounted) {
                                final addrs = context.read<AddressProvider>().addresses;
                                if (addrs.isNotEmpty) {
                                  setState(() {
                                    _selectedAddressIndex = addrs.length - 1;
                                    if (addrs.last.phone != null && addrs.last.phone!.isNotEmpty) {
                                      _deliveryPhone = addrs.last.phone;
                                    }
                                  });
                                }
                              }
                            },
                            onChangeNumber: () {
                              final tc = TextEditingController(text: _deliveryPhone ?? '');
                              showDialog(
                                context: context,
                                builder: (ctx) => AlertDialog(
                                  title: const Text('Alternate Phone Number'),
                                  content: TextField(
                                    controller: tc,
                                    keyboardType: TextInputType.phone,
                                    maxLength: 10,
                                    decoration: const InputDecoration(
                                      hintText: 'Enter 10-digit number for rider',
                                      border: OutlineInputBorder(),
                                    ),
                                  ),
                                  actions: [
                                    TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                                    TextButton(
                                      onPressed: () {
                                        if (tc.text.length == 10) {
                                          setState(() => _deliveryPhone = tc.text);
                                          Navigator.pop(ctx);
                                        } else {
                                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter 10 digits')));
                                        }
                                      },
                                      child: const Text('Save'),
                                    ),
                                  ],
                                ),
                              );
                            }
                          ),
                        )
                      : _PaymentStep(
                          total: widget.total,
                          selected: _selectedPayment,
                          onSelect: (i) => setState(() => _selectedPayment = i),
                          upiCtrl: _upiCtrl,
                          cardNumCtrl: _cardNumCtrl,
                          cardNameCtrl: _cardNameCtrl,
                          cardExpCtrl: _cardExpCtrl,
                          cardCvvCtrl: _cardCvvCtrl,
                        ),
            ),
          ),
          _BottomBar(
            step: _step,
            total: widget.total,
            isPlacingOrder: _isPlacingOrder,
            onNext: () {
              if (_step < 2) {
                setState(() => _step++);
              } else {
                _placeOrder();
              }
            },
          ),
        ],
      ),
    );
  }

  void _showAddAddressSheet(BuildContext context) {
    context.push(AppRoutes.location);
  }
}

// â”€â”€ Step indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _StepIndicator extends StatelessWidget {
  final int currentStep;
  const _StepIndicator({required this.currentStep});

  @override
  Widget build(BuildContext context) {
    final steps = ['Address', 'Summary', 'Payment'];
    return Container(
      color: AppColors.primary,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Row(
        children: List.generate(steps.length, (i) {
          final isDone = i < currentStep;
          final isActive = i == currentStep;
          return Expanded(
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: isDone || isActive
                                  ? Colors.white
                                  : Colors.white.withValues(alpha: 0.3),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: isDone
                                  ? const Icon(Icons.check,
                                      color: AppColors.primary, size: 16)
                                  : Text('${i + 1}',
                                      style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w800,
                                          color: isActive
                                              ? AppColors.primary
                                              : Colors.white70)),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(steps[i],
                              style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: isActive
                                      ? FontWeight.w700
                                      : FontWeight.w400,
                                  color: isActive
                                      ? Colors.white
                                      : Colors.white70)),
                        ],
                      ),
                    ],
                  ),
                ),
                if (i < steps.length - 1)
                  Container(
                      width: 24,
                      height: 1,
                      color: Colors.white.withValues(alpha: 0.4)),
              ],
            ),
          );
        }),
      ),
    );
  }
}

// â”€â”€ Step 1: Address â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _AddressStep extends StatelessWidget {
  final List<Address> addresses;
  final int selected;
  final bool isLoading;
  final ValueChanged<int> onSelect;
  final VoidCallback onAddNew;

  const _AddressStep(
      {required this.addresses,
      required this.selected,
      required this.isLoading,
      required this.onSelect,
      required this.onAddNew});

  @override
  Widget build(BuildContext context) {
    if (isLoading && addresses.isEmpty) {
      return const Center(
          child: Padding(
        padding: EdgeInsets.all(40.0),
        child: CircularProgressIndicator(),
      ));
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Select Delivery Address',
            style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Color(0xFF2C2C2C))),
        const SizedBox(height: 12),
        if (addresses.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24.0),
            child: Center(
              child: Text('No saved addresses found',
                  style: TextStyle(color: Colors.grey)),
            ),
          ),
        ...List.generate(addresses.length, (i) {
          final addr = addresses[i];
          final isSelected = i == selected;
          return GestureDetector(
            onTap: () => onSelect(i),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color:
                      isSelected ? AppColors.primary : const Color(0xFFE5E7EB),
                  width: isSelected ? 2 : 1,
                ),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 8,
                      offset: const Offset(0, 2))
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primary.withValues(alpha: 0.1)
                          : const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                        addr.label.toLowerCase() == 'work'
                            ? Icons.work_outline
                            : addr.label.toLowerCase() == 'home'
                                ? Icons.home_outlined
                                : Icons.location_on_outlined,
                        color: isSelected
                            ? AppColors.primary
                            : const Color(0xFF6B7280),
                        size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(addr.label,
                            style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: isSelected
                                    ? AppColors.primary
                                    : const Color(0xFF2C2C2C))),
                        const SizedBox(height: 3),
                        Text(addr.fullAddress,
                            style: const TextStyle(
                                fontSize: 12, color: Color(0xFF6B7280)),
                            maxLines: 2),
                      ],
                    ),
                  ),
                  if (isSelected)
                    const Icon(Icons.check_circle,
                        color: AppColors.primary, size: 22),
                ],
              ),
            ),
          );
        }),
        const SizedBox(height: 4),
        GestureDetector(
          onTap: onAddNew,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF2C2C2C),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.add_circle_outline,
                    color: Color(0xFF9EF01A), size: 20),
                SizedBox(width: 8),
                Text('Add New Address',
                    style: TextStyle(
                        color: Color(0xFF9EF01A),
                        fontWeight: FontWeight.w700,
                        fontSize: 14)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// â”€â”€ Step 2: Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _SummaryStep extends StatelessWidget {
  final double subtotal, deliveryFee, total;
  final Address? address;
  final String? deliveryPhone;
  final VoidCallback onChangeAddress;
  final VoidCallback onChangeNumber;

  const _SummaryStep(
      {required this.subtotal,
      required this.deliveryFee,
      required this.total,
      required this.address,
      required this.deliveryPhone,
      required this.onChangeAddress,
      required this.onChangeNumber});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Delivering to',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF2C2C2C))),
            Row(
              children: [
                TextButton(
                  onPressed: onChangeNumber,
                  style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(50, 30), tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                  child: const Text('Change Number', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 8),
                TextButton(
                  onPressed: onChangeAddress,
                  style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(50, 30), tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                  child: const Text('Change Address', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            )
          ],
        ),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05), blurRadius: 8)
              ]),
          child: Row(
            children: [
              Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.location_on,
                      color: AppColors.primary, size: 20)),
              const SizedBox(width: 12),
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text(address?.label ?? 'No Address',
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF2C2C2C))),
                    Text(address?.fullAddress ?? 'Please select an address',
                        style: const TextStyle(
                            fontSize: 12, color: Color(0xFF6B7280))),
                    if (deliveryPhone != null && deliveryPhone!.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text('Alt Phone: $deliveryPhone',
                          style: const TextStyle(
                              fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary)),
                    ]
                  ])),
            ],
          ),
        ),
        const SizedBox(height: 20),
        const Text('Items',
            style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Color(0xFF2C2C2C))),
        const SizedBox(height: 10),
        ...cart.items.map((item) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 6)
                  ]),
              child: Row(
                children: [
                  Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(8)),
                      child: Icon(
                          (item.product.vertical == 'grocery' || (item.product.storeId?.isNotEmpty ?? false))
                              ? Icons.local_grocery_store_rounded
                              : Icons.fastfood,
                          color: AppColors.primary,
                          size: 18)),
                  const SizedBox(width: 10),
                  Expanded(
                      child: Text(item.product.name,
                          style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF2C2C2C)))),
                  Text('x${item.quantity}',
                      style: const TextStyle(
                          fontSize: 13, color: Color(0xFF6B7280))),
                  const SizedBox(width: 10),
                  Text('₹${item.totalPrice.toInt()}',
                      style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF2C2C2C))),
                ],
              ),
            )),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05), blurRadius: 8)
              ]),
          child: Column(children: [
            _summaryRow('Subtotal', '₹${subtotal.toInt()}'),
            const SizedBox(height: 8),
            _summaryRow('Delivery', '₹${deliveryFee.toInt()}'),
            const Padding(
                padding: EdgeInsets.symmetric(vertical: 10),
                child: Divider(height: 1, color: Color(0xFFF3F4F6))),
            _summaryRow('Total', '₹${total.toInt()}', isTotal: true),
          ]),
        ),
      ],
    );
  }

  Widget _summaryRow(String l, String v, {bool isTotal = false}) => Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(l,
              style: TextStyle(
                  fontSize: isTotal ? 16 : 14,
                  fontWeight: isTotal ? FontWeight.w800 : FontWeight.w500,
                  color: isTotal
                      ? const Color(0xFF2C2C2C)
                      : const Color(0xFF6B7280))),
          Text(v,
              style: TextStyle(
                  fontSize: isTotal ? 18 : 14,
                  fontWeight: isTotal ? FontWeight.w900 : FontWeight.w600,
                  color:
                      isTotal ? AppColors.primary : const Color(0xFF374151))),
        ],
      );
}

// â”€â”€ Step 3: Payment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _PaymentStep extends StatelessWidget {
  final int selected;
  final ValueChanged<int> onSelect;
  final TextEditingController upiCtrl,
      cardNumCtrl,
      cardNameCtrl,
      cardExpCtrl,
      cardCvvCtrl;
  final double total;

  const _PaymentStep(
      {required this.total,
      required this.selected,
      required this.onSelect,
      required this.upiCtrl,
      required this.cardNumCtrl,
      required this.cardNameCtrl,
      required this.cardExpCtrl,
      required this.cardCvvCtrl});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(bottom: 20),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.primary.withOpacity(0.3)),
          ),
          child: Column(
            children: [
              const Text('Total Amount Payable', style: TextStyle(color: Colors.black54, fontSize: 14)),
              const SizedBox(height: 4),
              Text(
                '₹${total.toStringAsFixed(2)}',
                style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
            ],
          ),
        ),
        const Text('Choose Payment Method',
            style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Color(0xFF2C2C2C))),
        const SizedBox(height: 12),
        _PayOption(
            index: 0,
            selected: selected,
            icon: Icons.money,
            label: 'Cash on Delivery',
            subtitle: 'Pay when your order arrives',
            onSelect: onSelect),
        const SizedBox(height: 10),
        _PayOption(
            index: 1,
            selected: selected,
            icon: Icons.account_balance_wallet_outlined,
            label: 'UPI',
            subtitle: 'Google Pay, PhonePe, Paytm',
            onSelect: onSelect),
        if (selected == 1) ...[
          const SizedBox(height: 10),
          _InputField(
              controller: upiCtrl,
              label: 'Enter UPI ID (e.g. name@upi)',
              icon: Icons.alternate_email),
        ],
        const SizedBox(height: 10),
        _PayOption(
            index: 2,
            selected: selected,
            icon: Icons.credit_card,
            label: 'Credit / Debit Card',
            subtitle: 'Visa, Mastercard, RuPay',
            onSelect: onSelect),
        if (selected == 2) ...[
          const SizedBox(height: 10),
          _InputField(
              controller: cardNumCtrl,
              label: 'Card Number',
              icon: Icons.credit_card,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(16)
              ],
              keyboardType: TextInputType.number),
          const SizedBox(height: 10),
          _InputField(
              controller: cardNameCtrl,
              label: 'Cardholder Name',
              icon: Icons.person_outline),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(
                child: _InputField(
                    controller: cardExpCtrl,
                    label: 'MM/YY',
                    icon: Icons.calendar_today_outlined,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      LengthLimitingTextInputFormatter(4)
                    ],
                    keyboardType: TextInputType.number)),
            const SizedBox(width: 12),
            Expanded(
                child: _InputField(
                    controller: cardCvvCtrl,
                    label: 'CVV',
                    icon: Icons.lock_outline,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      LengthLimitingTextInputFormatter(3)
                    ],
                    keyboardType: TextInputType.number,
                    obscureText: true)),
          ]),
        ],
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(10)),
          child: const Row(children: [
            Icon(Icons.lock, color: AppColors.primary, size: 16),
            SizedBox(width: 8),
            Expanded(
                child: Text('Your payment info is encrypted and secure',
                    style: TextStyle(
                        fontSize: 12,
                        color: AppColors.primary,
                        fontWeight: FontWeight.w500))),
          ]),
        ),
      ],
    );
  }
}

class _PayOption extends StatelessWidget {
  final int index, selected;
  final IconData icon;
  final String label, subtitle;
  final ValueChanged<int> onSelect;

  const _PayOption(
      {required this.index,
      required this.selected,
      required this.icon,
      required this.label,
      required this.subtitle,
      required this.onSelect});

  @override
  Widget build(BuildContext context) {
    final isSelected = index == selected;
    return GestureDetector(
      onTap: () => onSelect(index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
              color: isSelected ? AppColors.primary : const Color(0xFFE5E7EB),
              width: isSelected ? 2 : 1),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withValues(alpha: 0.04), blurRadius: 6)
          ],
        ),
        child: Row(children: [
          Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.primary.withValues(alpha: 0.1)
                      : const Color(0xFFF3F4F6),
                  borderRadius: BorderRadius.circular(10)),
              child: Icon(icon,
                  color:
                      isSelected ? AppColors.primary : const Color(0xFF6B7280),
                  size: 22)),
          const SizedBox(width: 12),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(label,
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: isSelected
                            ? AppColors.primary
                            : const Color(0xFF2C2C2C))),
                Text(subtitle,
                    style: const TextStyle(
                        fontSize: 12, color: Color(0xFF9CA3AF))),
              ])),
          if (isSelected)
            const Icon(Icons.check_circle, color: AppColors.primary, size: 22),
        ]),
      ),
    );
  }
}

// â”€â”€ Shared input field â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _InputField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final IconData icon;
  final int maxLines;
  final bool obscureText;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;

  const _InputField(
      {required this.controller,
      required this.label,
      required this.icon,
      this.maxLines = 1,
      this.obscureText = false,
      this.keyboardType,
      this.inputFormatters});

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      obscureText: obscureText,
      keyboardType: keyboardType,
      inputFormatters: inputFormatters,
      style: const TextStyle(fontSize: 14, color: Color(0xFF2C2C2C)),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: AppColors.primary, size: 20),
        filled: true,
        fillColor: Colors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.primary, width: 2)),
      ),
    );
  }
}

// â”€â”€ Bottom action bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _BottomBar extends StatelessWidget {
  final int step;
  final double total;
  final bool isPlacingOrder;
  final VoidCallback onNext;

  const _BottomBar(
      {required this.step,
      required this.total,
      required this.isPlacingOrder,
      required this.onNext});

  @override
  Widget build(BuildContext context) {
    final labels = [
      'Continue to Summary',
      'Continue to Payment',
      'Place Order  •  ₹${total.toInt()}'
    ];
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
              color: Color(0x14000000), blurRadius: 12, offset: Offset(0, -3))
        ],
      ),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: isPlacingOrder ? null : onNext,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.black,
            foregroundColor: Colors.white,
            disabledBackgroundColor: AppColors.primary.withValues(alpha: 0.6),
            padding: const EdgeInsets.symmetric(vertical: 15),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            elevation: 0,
          ),
          child: isPlacingOrder
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                      color: Colors.white, strokeWidth: 2.5))
              : Text(labels[step],
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.w700)),
        ),
      ),
    );
  }
}
