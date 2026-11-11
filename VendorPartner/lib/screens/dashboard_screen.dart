import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../api_constants.dart';
import '../models/order_model.dart';
import '../services/menu_api_service.dart';
import '../services/platform_config_service.dart';
import '../services/restaurant_api_service.dart';
import '../services/restaurant_auth_service.dart';
import '../theme/app_colors.dart';
import 'menu_management_screen.dart';
import 'restaurant_dashboard_screen.dart';
import 'profile_screen.dart';
import 'order_details_screen.dart';
import 'cancelled_orders_screen.dart';
import '../services/restaurant_socket_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentBottomNavIndex = 0;
  bool _isOnline = true;
  String _selectedOrderType = 'delivery'; // 'delivery' or 'pickup'
  String _selectedStatusFilter = 'All'; // 'All', 'Placed', 'Preparing', 'Ready', 'Picked Up', 'Delivered'

  List<Order> _orders = [];
  Timer? _livePollingTimer;
  final AudioPlayer _audioPlayer = AudioPlayer();
  final Set<String> _knownOrderIds = {};
  bool _isFirstFetch = true;
  bool _isRingtonePlaying = false;
  Function(dynamic)? _newOrderSocketCallback;
  int _unreadNotificationCount = 0;
  Timer? _ringtoneTimeoutTimer;
  int _ringPlayCount = 0;

  // Dynamic Partner Store Profile & Stats
  String _restaurantName = 'Loading...';
  String _restaurantImage = '';
  double _monthlyEarning = 0.0;
  String _currentMonth = 'Current Month';
  bool _isLoadingOrders = false;
  String _restaurantId = '';
  String _businessType = 'grocery_store';

  bool get _isGroceryMode {
    if (PlatformConfigService.isGroceryPlatform) return true;
    final bt = _businessType.toLowerCase();
    if (bt == 'grocery_store' || bt == 'grocery' || bt == 'essentials' || bt == 'dairy_milk') {
      return true;
    }
    return RestaurantAuthService.isGroceryStore;
  }

  @override
  void initState() {
    super.initState();
    _initCurrentMonth();
    PlatformConfigService.fetchSettings();
    RestaurantAuthService.hydrateRbacFromPrefs();
    _loadLiveDashboardData();
    _setupSocketListener();
    _fetchUnreadNotificationCount();
    // Live polling for incoming real customer orders every 5 seconds
    _livePollingTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (mounted) {
        _fetchLiveOrders(isSilent: true);
        _fetchUnreadNotificationCount();
      }
    });
  }

  @override
  void dispose() {
    if (_newOrderSocketCallback != null) {
      RestaurantSocketService.offNewOrder(_newOrderSocketCallback!);
    }
    _stopOrderRingtone();
    _ringtoneTimeoutTimer?.cancel();
    _livePollingTimer?.cancel();
    _audioPlayer.dispose();
    super.dispose();
  }

  void _initCurrentMonth() {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    _currentMonth = months[DateTime.now().month - 1];
  }

  String _resolveImageUrl(String? rawPath) {
    final trimmed = (rawPath ?? '').trim();
    if (trimmed.isEmpty || trimmed == 'null') return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    if (trimmed.startsWith('assets/')) return trimmed;
    final baseOrigin = ApiConstants.baseUrl.replaceAll(RegExp(r'/api(/v1)?/?$'), '');
    return trimmed.startsWith('/') ? '$baseOrigin$trimmed' : '$baseOrigin/$trimmed';
  }

  Future<void> _loadLiveDashboardData() async {
    final prefs = await SharedPreferences.getInstance();
    _restaurantId = prefs.getString('restaurantId') ?? '';
    final savedPhone = prefs.getString('userPhone') ?? '';
    final storedName = prefs.getString('restaurantName') ?? '';
    final storedImage = prefs.getString('restaurantImage') ?? '';
    final storedBType = prefs.getString('businessType') ?? RestaurantAuthService.businessType;
    final token = prefs.getString('token') ?? '';

    if (mounted) {
      setState(() {
        if (storedName.isNotEmpty && storedName != 'null') {
          _restaurantName = storedName;
        }
        if (storedImage.isNotEmpty && storedImage != 'null') {
          _restaurantImage = _resolveImageUrl(storedImage);
        }
        if (storedBType.isNotEmpty && storedBType != 'null') {
          _businessType = storedBType;
        }
      });
    }

    // 1. Fetch live Store / Partner Profile from Backend
    try {
      String profileUrl = '';
      if (_restaurantId.isNotEmpty) {
        profileUrl = ApiConstants.getApprovalStatus(_restaurantId);
      } else if (savedPhone.isNotEmpty) {
        profileUrl = ApiConstants.checkApprovalStatusByMobile(savedPhone);
      } else if (token.isNotEmpty) {
        profileUrl = '${ApiConstants.baseUrl}/restaurants/profile';
      }

      if (profileUrl.isNotEmpty) {
        http.Response res = await http.get(
          Uri.parse(profileUrl),
          headers: {
            'Content-Type': 'application/json',
            if (token.isNotEmpty) 'Authorization': 'Bearer $token',
          },
        ).timeout(const Duration(seconds: 6));

        if (res.statusCode != 200 && token.isNotEmpty && !profileUrl.endsWith('/profile')) {
          try {
            res = await http.get(
              Uri.parse('${ApiConstants.baseUrl}/restaurants/profile'),
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer $token',
              },
            ).timeout(const Duration(seconds: 6));
          } catch (_) {}
        }

        if (res.statusCode == 200) {
          final data = jsonDecode(res.body);
          final Map<String, dynamic> restObj = data['restaurant'] is Map
              ? Map<String, dynamic>.from(data['restaurant'] as Map)
              : (data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{});

          String resolvedName = '';
          if (data['name'] != null && data['name'].toString().isNotEmpty) {
            final n = data['name'];
            resolvedName = (n is Map ? (n['en'] ?? '') : n).toString();
          } else if (restObj['name'] != null) {
            final n = restObj['name'];
            resolvedName = (n is Map ? (n['en'] ?? '') : n).toString();
          }

          final resolvedImg = _resolveImageUrl(
            (restObj['image'] ?? restObj['logo'] ?? restObj['profileImage'] ?? restObj['profilePic'] ?? data['image'])?.toString(),
          );
          final rawBType = (data['businessType'] ?? restObj['businessType'] ?? data['vertical'] ?? restObj['vertical'] ?? prefs.getString('businessType') ?? 'grocery_store').toString();
          final rawVertical = (data['vertical'] ?? restObj['vertical'] ?? prefs.getString('vertical') ?? (rawBType.toLowerCase().contains('restaurant') ? 'food' : 'grocery')).toString();
          final rawRole = (data['assignedRole'] ?? restObj['assignedRole'] ?? prefs.getString('assignedRole') ?? RestaurantAuthService.assignedRole).toString();
          final rawPerms = data['permissions'] ?? restObj['permissions'];
          final rawMode = data['platformMode'] ?? restObj['platformMode'];

          await RestaurantAuthService.saveRbacContext(
            assignedRole: rawRole,
            permissions: rawPerms is List ? rawPerms : null,
            businessType: rawBType,
            vertical: rawVertical,
            platformMode: rawMode?.toString(),
          );

          if (mounted) {
            setState(() {
              if (resolvedName.isNotEmpty && resolvedName != 'null') {
                _restaurantName = resolvedName;
                prefs.setString('restaurantName', resolvedName);
              }
              if (resolvedImg.isNotEmpty) {
                _restaurantImage = resolvedImg;
                prefs.setString('restaurantImage', resolvedImg);
              }
              _businessType = rawBType;
              prefs.setString('businessType', _businessType);
              if (_restaurantName == 'Loading...') {
                _restaurantName = storedName.isNotEmpty ? storedName : (_isGroceryMode ? 'My Grocery Store' : 'My Restaurant');
              }
              _isOnline = data['isActive'] ?? restObj['isActive'] ?? true;
              final extractedRestId = restObj['_id'] ?? data['_id'] ?? data['restaurantId'] ?? restObj['id'] ?? data['id'];
              if (extractedRestId != null && extractedRestId.toString().isNotEmpty && extractedRestId.toString() != 'null') {
                _restaurantId = extractedRestId.toString();
                prefs.setString('restaurantId', _restaurantId);
                final sToken = prefs.getString('token') ?? '';
                if (sToken.isNotEmpty) {
                  try {
                    ApiConstants.setAuthenticatedSession(restaurantId: _restaurantId, authToken: sToken);
                  } catch (_) {}
                }
              }
            });
          }
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          if (_restaurantName == 'Loading...') {
            _restaurantName = storedName.isNotEmpty ? storedName : (_isGroceryMode ? 'My Grocery Store' : 'My Restaurant');
          }
        });
      }
    }

    // 2. Fetch live Orders from Backend
    await _fetchLiveOrders();
  }

  Future<void> _fetchLiveOrders({bool isSilent = false}) async {
    if (!isSilent) {
      setState(() => _isLoadingOrders = true);
    }
    final prefs = await SharedPreferences.getInstance();
    var restId = _restaurantId.isNotEmpty ? _restaurantId : (prefs.getString('restaurantId') ?? '');
    final savedPhone = prefs.getString('userPhone') ?? '';
    if (restId.isEmpty && savedPhone.isNotEmpty) restId = savedPhone;
    final token = prefs.getString('token') ?? '';

    if (restId.isEmpty && token.isEmpty) {
      if (mounted) setState(() => _isLoadingOrders = false);
      return;
    }

    try {
      String ordersUrl = restId.isNotEmpty
          ? '${ApiConstants.baseUrl}/orders/restaurant/$restId'
          : '${ApiConstants.baseUrl}/orders/restaurant';

      http.Response res = await http.get(
        Uri.parse(ordersUrl),
        headers: {
          'Content-Type': 'application/json',
          if (token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 8));

      if (res.statusCode != 200 && token.isNotEmpty && ordersUrl.contains('/restaurant/')) {
        try {
          ordersUrl = '${ApiConstants.baseUrl}/orders/restaurant';
          res = await http.get(
            Uri.parse(ordersUrl),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
            },
          ).timeout(const Duration(seconds: 8));
        } catch (_) {}
      }

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        List<dynamic> ordersList = [];
        if (data is List) {
          ordersList = data;
        } else if (data['orders'] is List) {
          ordersList = data['orders'];
        }

        final parsedOrders = ordersList.map<Order>((json) => Order.fromJson(json)).toList();

        double computedRevenue = 0.0;
        for (var o in parsedOrders) {
          if (o.status != 'Cancelled' && o.status != 'Failed') {
            computedRevenue += o.totalAmount;
          }
        }

        // Detect new incoming orders for ringtone & alert popup
        if (_isFirstFetch) {
          for (var o in parsedOrders) {
            _knownOrderIds.add(o.id);
          }
          _isFirstFetch = false;
        } else {
          final newIncoming = parsedOrders.where((o) => (o.status == 'Placed' || o.status == 'Pending') && !_knownOrderIds.contains(o.id)).toList();
          if (newIncoming.isNotEmpty) {
            for (var o in newIncoming) {
              _knownOrderIds.add(o.id);
              _showNewOrderAlertDialog(o);
            }
          }
        }

        if (mounted) {
          setState(() {
            _orders = parsedOrders;
            _monthlyEarning = computedRevenue;
            _isLoadingOrders = false;
          });
        }
      } else {
        if (mounted) setState(() => _isLoadingOrders = false);
      }
    } catch (e) {
      if (mounted) setState(() => _isLoadingOrders = false);
    }
  }

  Future<void> _toggleOnlineStatus(bool val) async {
    setState(() => _isOnline = val);
    final prefs = await SharedPreferences.getInstance();
    final restId = _restaurantId.isNotEmpty ? _restaurantId : (prefs.getString('restaurantId') ?? '');
    final token = prefs.getString('token') ?? '';

    try {
      if (restId.isNotEmpty) {
        await http.put(
          Uri.parse(ApiConstants.toggleActive(restId)),
          headers: {
            'Content-Type': 'application/json',
            if (token.isNotEmpty) 'Authorization': 'Bearer $token',
          },
          body: jsonEncode({
            'isOnline': val,
            'isActive': val,
            'isTemporarilyClosed': !val,
          }),
        ).timeout(const Duration(seconds: 5));
      }
    } catch (_) {}

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_isOnline ? '$_restaurantName is now Online' : '$_restaurantName is now Offline'),
          backgroundColor: _isOnline ? AppColors.primaryGreen : Colors.red,
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }
  void _setupSocketListener() async {
    final prefs = await SharedPreferences.getInstance();
    final restId = _restaurantId.isNotEmpty ? _restaurantId : (prefs.getString('restaurantId') ?? '');
    final token = prefs.getString('token') ?? '';
    if (restId.isNotEmpty) {
      await RestaurantSocketService.init(restId, token);
      _newOrderSocketCallback = (data) {
        if (mounted) {
          debugPrint('Dashboard received live new order socket event!');
          _fetchLiveOrders(isSilent: true);
        }
      };
      RestaurantSocketService.onNewOrder(_newOrderSocketCallback!);
      RestaurantSocketService.onStatusUpdate((data) {
        if (!mounted || data == null) return;
        final Map<String, dynamic>? payload = (data is Map<String, dynamic>)
            ? data
            : (data is Map ? Map<String, dynamic>.from(data) : null);
        if (payload != null) {
          final eventRestId = payload['restaurantId']?.toString() ?? '';
          if (eventRestId.isEmpty || eventRestId == restId) {
            if (payload['isOnline'] != null || payload['isActive'] != null) {
              final newOnline = (payload['isOnline'] == true || payload['isActive'] == true);
              if (_isOnline != newOnline) {
                setState(() {
                  _isOnline = newOnline;
                });
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Status updated by Admin: ${newOnline ? "Online" : "Offline"}'),
                    backgroundColor: newOnline ? AppColors.primaryGreen : Colors.red,
                    duration: const Duration(seconds: 3),
                  ),
                );
              }
            }
          }
        }
      });
    }
  }

  void _playOrderRingtone() async {
    try {
      if (_isRingtonePlaying) return;
      _isRingtonePlaying = true;
      _ringPlayCount = 1;
      _ringtoneTimeoutTimer?.cancel();

      // Clean 2-ring alert (stops automatically, no endless loop)
      await _audioPlayer.setReleaseMode(ReleaseMode.release);
      await _audioPlayer.play(AssetSource('audio/ordertone.mpeg'));

      _audioPlayer.onPlayerComplete.listen((_) async {
        if (_isRingtonePlaying && _ringPlayCount < 2) {
          _ringPlayCount++;
          try {
            await _audioPlayer.play(AssetSource('audio/ordertone.mpeg'));
          } catch (_) {}
        } else {
          _isRingtonePlaying = false;
        }
      });

      // Safety timeout: auto stop after 8 seconds max
      _ringtoneTimeoutTimer = Timer(const Duration(seconds: 8), () {
        _stopOrderRingtone();
      });
    } catch (e) {
      debugPrint('Error playing ringtone: $e');
      _isRingtonePlaying = false;
    }
  }

  void _stopOrderRingtone() async {
    try {
      _ringtoneTimeoutTimer?.cancel();
      _isRingtonePlaying = false;
      await _audioPlayer.stop();
    } catch (e) {
      debugPrint('Error stopping ringtone: $e');
    }
  }

  Future<void> _fetchUnreadNotificationCount() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? ApiConstants.authToken;
      if (token.isEmpty) return;
      final res = await http.get(
        Uri.parse(ApiConstants.notifications),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200 && mounted) {
        final data = jsonDecode(res.body);
        final count = (data['unreadCount'] as num?)?.toInt() ?? 0;
        setState(() {
          _unreadNotificationCount = count;
        });
      }
    } catch (_) {}
  }

  Future<List<Map<String, dynamic>>> _loadRestaurantNotifications() async {
    List<Map<String, dynamic>> result = [];
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? ApiConstants.authToken;
      if (token.isNotEmpty) {
        final res = await http.get(
          Uri.parse(ApiConstants.notifications),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ).timeout(const Duration(seconds: 5));
        if (res.statusCode == 200) {
          final data = jsonDecode(res.body);
          if (data['notifications'] is List) {
            for (var n in data['notifications']) {
              if (n is Map) {
                result.add(Map<String, dynamic>.from(n));
              }
            }
          }
        }
      }
    } catch (_) {}

    // Fallback/Supplement from active live orders so vendor always sees real-time order lifecycle
    if (result.isEmpty && _orders.isNotEmpty) {
      for (var o in _orders.take(15)) {
        String title = 'Order #${o.id} - ${o.status}';
        String message = 'Customer: ${o.customerName} • ₹${o.totalAmount.toStringAsFixed(2)}';
        String type = 'order_status';

        if (o.status == 'Placed' || o.status == 'Pending') {
          title = '📦 New Order Received #${o.id}';
          message = '${o.customerName} placed an order for ₹${o.totalAmount.toStringAsFixed(2)}';
          type = 'order_new';
        } else if (o.status == 'Preparing') {
          title = _isGroceryMode
              ? '📦 Packing Order #${o.id}'
              : '🍳 Order #${o.id} In Kitchen';
          message = _isGroceryMode
              ? 'Order items are currently being packed.'
              : 'Food is currently being prepared.';
          type = 'order_preparing';
        } else if (o.status == 'Ready') {
          title = o.isSelfPickup ? '🛍️ Order #${o.id} Ready for Self-Pickup' : '🛵 Order #${o.id} Ready for Rider';
          message = o.isSelfPickup ? 'Customer will arrive at counter with OTP.' : 'Waiting for delivery partner pickup.';
          type = 'order_ready';
        } else if (o.status == 'Picked Up') {
          title = '🚀 Order #${o.id} Handed Over';
          message = 'Order is on the way with delivery partner.';
          type = 'order_picked';
        } else if (o.status == 'Delivered') {
          title = '✅ Order #${o.id} Completed';
          message = 'Delivered successfully to ${o.customerName}.';
          type = 'order_delivered';
        } else if (o.status == 'Cancelled') {
          title = '❌ Order #${o.id} Cancelled';
          message = 'Order has been cancelled.';
          type = 'order_cancelled';
        }

        result.add({
          '_id': o.id,
          'title': title,
          'message': message,
          'type': type,
          'createdAt': o.createdAt?.toIso8601String() ?? DateTime.now().toIso8601String(),
          'isRead': false,
          'order': o,
        });
      }
    }

    return result;
  }

  Future<void> _markAllNotificationsAsRead() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? ApiConstants.authToken;
      if (token.isNotEmpty) {
        await http.patch(
          Uri.parse(ApiConstants.markAllNotificationsRead),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ).timeout(const Duration(seconds: 4));
      }
      if (mounted) {
        setState(() => _unreadNotificationCount = 0);
      }
    } catch (_) {}
  }

  void _showNotificationsSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (sheetContext, setSheetState) {
            return FutureBuilder<List<Map<String, dynamic>>>(
              future: _loadRestaurantNotifications(),
              builder: (futureContext, snapshot) {
                final isLoading = snapshot.connectionState == ConnectionState.waiting;
                final notifications = snapshot.data ?? [];

                return Container(
                  height: MediaQuery.of(context).size.height * 0.75,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  ),
                  child: Column(
                    children: [
                      // Drag handle
                      Container(
                        margin: const EdgeInsets.only(top: 10, bottom: 8),
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      // Header
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppColors.primaryGreen.withOpacity(0.12),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.notifications_rounded, color: AppColors.primaryGreen, size: 20),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Notifications',
                                    style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
                                  ),
                                  Text(
                                    'Real-time order & store updates',
                                    style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[600]),
                                  ),
                                ],
                              ),
                            ),
                            if (notifications.isNotEmpty)
                              TextButton(
                                onPressed: () async {
                                  await _markAllNotificationsAsRead();
                                  setSheetState(() {});
                                  if (mounted) {
                                    setState(() => _unreadNotificationCount = 0);
                                  }
                                },
                                child: Text(
                                  'Mark all read',
                                  style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primaryGreen),
                                ),
                              ),
                            IconButton(
                              onPressed: () => Navigator.pop(ctx),
                              icon: const Icon(Icons.close_rounded, color: Colors.grey),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                            ),
                          ],
                        ),
                      ),
                      const Divider(height: 1),
                      // Content
                      Expanded(
                        child: isLoading
                            ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen))
                            : notifications.isEmpty
                                ? Center(
                                    child: Padding(
                                      padding: const EdgeInsets.all(32),
                                      child: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.all(20),
                                            decoration: BoxDecoration(
                                              color: Colors.grey[100],
                                              shape: BoxShape.circle,
                                            ),
                                            child: Icon(Icons.notifications_none_rounded, size: 48, color: Colors.grey[400]),
                                          ),
                                          const SizedBox(height: 16),
                                          Text(
                                            'No notifications yet',
                                            style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
                                          ),
                                          const SizedBox(height: 6),
                                          Text(
                                            'New order alerts, rider arrivals, and store updates will appear here in real time.',
                                            textAlign: TextAlign.center,
                                            style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
                                          ),
                                        ],
                                      ),
                                    ),
                                  )
                                : ListView.separated(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                    itemCount: notifications.length,
                                    separatorBuilder: (_, __) => const Divider(height: 1, indent: 60),
                                    itemBuilder: (itemCtx, index) {
                                      final item = notifications[index];
                                      return _buildNotificationItem(item);
                                    },
                                  ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  Widget _buildNotificationItem(Map<String, dynamic> item) {
    final title = (item['title'] ?? 'Order Notification').toString();
    final message = (item['message'] ?? '').toString();
    final isRead = item['isRead'] == true;
    final type = (item['type'] ?? 'order_status').toString().toLowerCase();

    IconData iconData = Icons.notifications_active_rounded;
    Color iconColor = AppColors.primaryGreen;
    Color bgColor = AppColors.primaryGreen.withOpacity(0.1);

    if (type.contains('new') || title.contains('New Order') || title.contains('Placed')) {
      iconData = Icons.shopping_bag_rounded;
      iconColor = Colors.orange[800]!;
      bgColor = Colors.orange.withOpacity(0.12);
    } else if (type.contains('rider') || type.contains('picked') || title.contains('Rider') || title.contains('Picked')) {
      iconData = Icons.delivery_dining_rounded;
      iconColor = Colors.blue[700]!;
      bgColor = Colors.blue.withOpacity(0.12);
    } else if (type.contains('delivered') || type.contains('complete') || title.contains('Completed') || title.contains('Delivered')) {
      iconData = Icons.check_circle_rounded;
      iconColor = AppColors.primaryGreen;
      bgColor = AppColors.primaryGreen.withOpacity(0.12);
    } else if (type.contains('cancel') || title.contains('Cancel')) {
      iconData = Icons.cancel_rounded;
      iconColor = Colors.red[700]!;
      bgColor = Colors.red.withOpacity(0.12);
    }

    String timeStr = '';
    if (item['createdAt'] != null) {
      try {
        final dt = DateTime.parse(item['createdAt'].toString()).toLocal();
        final diff = DateTime.now().difference(dt);
        if (diff.inMinutes < 1) {
          timeStr = 'Just now';
        } else if (diff.inMinutes < 60) {
          timeStr = '${diff.inMinutes}m ago';
        } else if (diff.inHours < 24) {
          timeStr = '${diff.inHours}h ago';
        } else {
          timeStr = '${dt.day}/${dt.month} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
        }
      } catch (_) {}
    }

    return InkWell(
      onTap: () {
        if (item['order'] is Order) {
          Navigator.pop(context);
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => OrderDetailsScreen(order: item['order'] as Order)),
          );
        }
      },
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: bgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(iconData, color: iconColor, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: isRead ? FontWeight.w500 : FontWeight.bold,
                            color: Colors.black87,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (timeStr.isNotEmpty)
                        Text(
                          timeStr,
                          style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey[500]),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    message,
                    style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showNewOrderAlertDialog(Order newOrder) {
    _playOrderRingtone();

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (alertContext) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          elevation: 12,
          backgroundColor: Colors.white,
          child: Container(
            width: 320,
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Pulsing Bell Icon Header
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.notifications_active_rounded,
                    size: 48,
                    color: Colors.orange,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  '🔔 NEW ORDER RECEIVED!',
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                  textAlign: TextAlign.center,
                ),
                Text(
                  'Order #${newOrder.id}',
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primaryGreen,
                  ),
                ),
                const SizedBox(height: 12),
                const Divider(),
                const SizedBox(height: 12),

                // Customer Info
                Row(
                  children: [
                    const Icon(Icons.person, size: 18, color: Colors.grey),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        newOrder.customerName,
                        style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 18, color: Colors.grey),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        newOrder.address,
                        style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Amount
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0FDF4),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Total Bill:', style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w500)),
                      Text(
                        '₹${newOrder.totalAmount.toStringAsFixed(2)}',
                        style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Action Buttons: Accept & Decline
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {
                          _stopOrderRingtone();
                          Navigator.pop(alertContext);
                          _rejectOrder(newOrder);
                        },
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.redAccent,
                          side: const BorderSide(color: Colors.redAccent, width: 1.5),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Text('Reject', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          _stopOrderRingtone();
                          Navigator.pop(alertContext);
                          _acceptOrder(newOrder);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryGreen,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 0,
                        ),
                        child: Text('ACCEPT ORDER', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    ).then((_) {
      _stopOrderRingtone();
    });
  }

  void _acceptOrder(Order order) async {
    final bool isGrocery = _isGroceryMode;
    int selectedPrepTime = isGrocery ? 10 : 15;
    if (order.items.isNotEmpty) {
      for (var item in order.items) {
        if (item is Map) {
          final pTime = int.tryParse(item['preparationTime']?.toString() ?? item['prepTime']?.toString() ?? '') ?? 0;
          if (pTime > selectedPrepTime) selectedPrepTime = pTime;
        }
      }
    }

    final List<int> timeOptions = isGrocery
        ? [5, 10, 15, 20, 30, 45]
        : [15, 20, 25, 30, 45, 60];
    if (!timeOptions.contains(selectedPrepTime)) {
      selectedPrepTime = isGrocery ? 10 : 15;
    }

    showDialog(
      context: context,
      builder: (dialogCtx) {
        int tempTime = selectedPrepTime;
        return StatefulBuilder(
          builder: (ctx, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Text(
                isGrocery ? 'Select Packing Time' : 'Select Preparation Time',
                style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isGrocery
                        ? 'Set item packing time for Order #${order.id}:'
                        : 'Set food preparation time for Order #${order.id}:',
                    style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: timeOptions.map((mins) {
                      final isSel = tempTime == mins;
                      return ChoiceChip(
                        label: Text('$mins mins'),
                        selected: isSel,
                        selectedColor: AppColors.primaryGreen,
                        labelStyle: TextStyle(color: isSel ? Colors.white : Colors.black87, fontWeight: FontWeight.bold),
                        onSelected: (selected) {
                          if (selected) setDialogState(() => tempTime = mins);
                        },
                      );
                    }).toList(),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogCtx),
                  child: Text('Cancel', style: GoogleFonts.poppins(color: Colors.grey[700])),
                ),
                ElevatedButton(
                  onPressed: () async {
                    Navigator.pop(dialogCtx);
                    final targetId = order.backendId.isNotEmpty ? order.backendId : order.id;
                    setState(() {
                      order.status = 'Preparing';
                      order.prepTimeMinutes = tempTime;
                    });
                    bool prepared = false;
                    try {
                      final prefs = await SharedPreferences.getInstance();
                      final token = prefs.getString('token') ?? '';
                      final resp = await http.post(
                        Uri.parse('${ApiConstants.baseUrl}/orders/restaurant/prepare/$targetId'),
                        headers: {
                          'Content-Type': 'application/json',
                          if (token.isNotEmpty) 'Authorization': 'Bearer $token',
                        },
                        body: jsonEncode({'prepTime': tempTime, 'status': 'preparing'}),
                      ).timeout(const Duration(seconds: 8));
                      prepared = resp.statusCode >= 200 && resp.statusCode < 300;
                    } catch (_) {}
                    if (!prepared) {
                      await RestaurantApiService.prepareOrder(targetId);
                    }
                    _fetchLiveOrders(isSilent: true);
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            isGrocery
                                ? 'Order Accepted! Packing time set to $tempTime mins.'
                                : 'Order Accepted! Preparation time set to $tempTime mins.',
                          ),
                          backgroundColor: AppColors.primaryGreen,
                          duration: const Duration(seconds: 2),
                        ),
                      );
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => OrderDetailsScreen(order: order)),
                      ).then((_) => _fetchLiveOrders(isSilent: true));
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryGreen),
                  child: Text(
                    isGrocery ? 'ACCEPT & PACK' : 'ACCEPT & PREPARE',
                    style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _rejectOrder(Order order) async {
    final targetId = order.backendId.isNotEmpty ? order.backendId : order.id;
    final res = await RestaurantApiService.cancelOrder(
      targetId,
      _isGroceryMode ? 'Rejected by partner store' : 'Rejected by restaurant',
    );
    if (res['success'] == true) {
      if (mounted) {
        setState(() {
          _orders.removeWhere((o) => o.id == order.id || o.backendId == order.backendId);
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Order rejected.'),
            backgroundColor: Colors.redAccent,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message']?.toString() ?? 'Failed to reject order'),
          backgroundColor: Colors.redAccent,
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  void _deleteOrder(Order order) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Delete Order', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
        content: Text('Are you sure you want to delete order #${order.id}? It will be permanently removed.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: GoogleFonts.poppins(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            child: Text('Delete', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final targetId = order.backendId.isNotEmpty ? order.backendId : order.id;
      final res = await RestaurantApiService.deleteOrder(targetId);
      if (mounted) {
        if (res['success'] == true) {
          setState(() {
            _orders.removeWhere((o) => o.id == order.id || o.backendId == order.backendId);
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Order permanently deleted.'),
              backgroundColor: Colors.redAccent,
              duration: Duration(seconds: 2),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res['message']?.toString() ?? 'Failed to delete order'),
              backgroundColor: Colors.redAccent,
            ),
          );
        }
      }
    }
  }

  Future<void> _showSearchingRiderModal(Order order) async {
    final targetId = order.backendId.isNotEmpty ? order.backendId : order.id;
    bool dialogOpen = true;
    BuildContext? activeDialogCtx;

    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (dialogContext) {
        activeDialogCtx = dialogContext;
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          elevation: 10,
          backgroundColor: Colors.white,
          child: Container(
            width: 280,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Searching Riders...',
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: 120,
                  height: 120,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        width: 96,
                        height: 96,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.primaryGreen.withOpacity(0.12),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.delivery_dining_rounded,
                            size: 50,
                            color: AppColors.primaryGreen,
                          ),
                        ),
                      ),
                      const SizedBox(
                        width: 116,
                        height: 116,
                        child: CircularProgressIndicator(
                          strokeWidth: 4.5,
                          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryGreen),
                          backgroundColor: Color(0xFFE8F5E9),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'Broadcasting order #${order.id} to nearby delivery partners...',
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () {
                    if (dialogOpen && activeDialogCtx != null && Navigator.canPop(activeDialogCtx!)) {
                      dialogOpen = false;
                      Navigator.pop(activeDialogCtx!);
                    }
                  },
                  child: Text('Hide', style: GoogleFonts.poppins(color: Colors.grey[700])),
                ),
              ],
            ),
          ),
        );
      },
    ).then((_) {
      dialogOpen = false;
    });

    final res = await RestaurantApiService.searchRiders(targetId);
    if (dialogOpen && activeDialogCtx != null && Navigator.canPop(activeDialogCtx!)) {
      dialogOpen = false;
      Navigator.pop(activeDialogCtx!);
    }

    await _fetchLiveOrders(isSilent: true);
    if (!mounted) return;

    if (res['success'] == true) {
      final data = res['data'];
      final riderName = (data is Map ? (data['riderName'] ?? data['rider']?['name']) : null)?.toString();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            (riderName != null && riderName.isNotEmpty)
                ? 'Rider Found: $riderName'
                : (res['message']?.toString() ?? 'Nearby delivery partners notified!'),
          ),
          backgroundColor: AppColors.primaryGreen,
          duration: const Duration(seconds: 3),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message']?.toString() ?? 'Unable to search riders right now.'),
          backgroundColor: Colors.redAccent,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  bool _isOrderPickupType(Order o) {
    return o.isSelfPickup || o.orderType.toLowerCase() == 'pickup' || o.orderType.toLowerCase() == 'self_pickup' || o.orderType.toLowerCase() == 'takeaway';
  }

  int _getCountForStatus(String status) {
    return _orders.where((o) {
      final bool matchesType = _selectedOrderType == 'pickup' ? _isOrderPickupType(o) : !_isOrderPickupType(o);
      if (!matchesType) return false;
      if (status == 'Ready') return o.status == 'Ready' || o.status == 'Ready for Pickup';
      if (status == 'Delivered') return o.status == 'Delivered' || o.status == 'Handed Over' || o.status == 'Picked Up' || o.status == 'Completed';
      return o.status == status;
    }).length;
  }

  List<Map<String, dynamic>> _getVisibleTabs() {
    final isGrocery = _isGroceryMode;
    final tabs = <Map<String, dynamic>>[];
    if (RestaurantAuthService.hasPermission('orders')) {
      tabs.add({
        'key': 'home',
        'icon': Icons.home_rounded,
        'label': 'Home',
        'builder': () => _buildHomeScreenContent(),
      });
    }
    if (RestaurantAuthService.hasPermission('products')) {
      tabs.add({
        'key': 'catalog',
        'icon': isGrocery ? Icons.inventory_2_outlined : Icons.assignment_outlined,
        'label': isGrocery ? 'Catalog' : 'Menu',
        'builder': () => const MenuManagementScreen(),
      });
    }
    if (RestaurantAuthService.hasPermission('analytics')) {
      tabs.add({
        'key': 'analytics',
        'icon': Icons.space_dashboard_outlined,
        'label': isGrocery ? 'Analytics' : 'Dashboard',
        'builder': () => const RestaurantDashboardScreen(),
      });
    }
    tabs.add({
      'key': 'profile',
      'icon': Icons.person_outline_rounded,
      'label': 'Profile',
      'builder': () => const ProfileScreen(),
    });
    return tabs;
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: PlatformConfigService.modeNotifier,
      builder: (context, _, __) {
        final tabs = _getVisibleTabs();
        final int safeIndex = _currentBottomNavIndex.clamp(0, tabs.length - 1);
        return Scaffold(
          backgroundColor: Colors.white,
          body: SafeArea(
            child: IndexedStack(
              index: safeIndex,
              children: tabs
                  .map<Widget>((t) => (t['builder'] as Widget Function())())
                  .toList(),
            ),
          ),
          bottomNavigationBar: _buildReferenceBottomNavBar(tabs, safeIndex),
        );
      },
    );
  }

  Widget _buildHomeScreenContent() {
    final bool isGrocery = _isGroceryMode;
    final tabs = _getVisibleTabs();
    final int catalogTabIndex = tabs.indexWhere((t) => t['key'] == 'catalog');

    // Filter orders based on status filter & order type
    final filteredOrders = _orders.where((o) {
      final bool matchesType = _selectedOrderType == 'pickup' ? _isOrderPickupType(o) : !_isOrderPickupType(o);
      if (!matchesType) return false;
      if (_selectedStatusFilter == 'All') {
        final s = o.status.toLowerCase().trim();
        final isHandedOver = s == 'picked_up' || s == 'picked up' || s == 'out_for_delivery' || s == 'out for delivery' || s == 'on_the_way' || s == 'on the way' || s == 'handed_over' || s == 'handed over' || s == 'handovered' || s == 'delivered' || s == 'completed';
        return !isHandedOver;
      }
      if (_selectedStatusFilter == 'Ready') return o.status == 'Ready' || o.status == 'Ready for Pickup';
      if (_selectedStatusFilter == 'Delivered') return o.status == 'Delivered' || o.status == 'Handed Over' || o.status == 'Picked Up' || o.status == 'Completed';
      return o.status == _selectedStatusFilter;
    }).toList();

    return Column(
      children: [
        // Top Header Section
        _buildHeaderSection(),

        // Scrollable Body
        Expanded(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                // Earnings Card Banner
                _buildEarningsCard(),
                const SizedBox(height: 12),
                _buildPartnerVerticalActionBanner(),
                const SizedBox(height: 4),

                // Order Type Selector (Delivery / Pick-up)
                _buildOrderTypeTabs(),
                const SizedBox(height: 16),

                // Horizontal Filter Pills Row
                _buildFilterPillsRow(),
                const SizedBox(height: 12),

                if (_selectedStatusFilter == 'Cancelled') ...[
                  InkWell(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const CancelledOrdersScreen()),
                      );
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.analytics_outlined, color: Colors.redAccent, size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Cancelled & Refunded Report', style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87)),
                                Text('Tap to view full cancellation log and store refund details', style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey[600])),
                              ],
                            ),
                          ),
                          const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.redAccent),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // Orders List
                if (_isLoadingOrders)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 50),
                    alignment: Alignment.center,
                    child: const CircularProgressIndicator(color: AppColors.primaryGreen),
                  )
                else if (filteredOrders.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
                    margin: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey[200]!),
                    ),
                    alignment: Alignment.center,
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGreen.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            isGrocery ? Icons.inventory_2_rounded : Icons.restaurant_menu_rounded,
                            size: 40,
                            color: AppColors.primaryGreen,
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          _selectedStatusFilter == 'All' ? 'No live orders right now' : 'No $_selectedStatusFilter orders',
                          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Incoming customer orders for $_restaurantName will appear here in real-time.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.poppins(color: Colors.grey[600], fontSize: 12),
                        ),
                        if (catalogTabIndex >= 0) ...[
                          const SizedBox(height: 16),
                          OutlinedButton.icon(
                            onPressed: () => setState(() => _currentBottomNavIndex = catalogTabIndex),
                            icon: Icon(
                              isGrocery ? Icons.add_business_rounded : Icons.menu_book_rounded,
                              size: 18,
                              color: AppColors.primaryGreen,
                            ),
                            label: Text(
                              isGrocery ? 'Manage / Add Catalog Items' : 'Manage / Add Menu Items',
                              style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primaryGreen),
                            ),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: AppColors.primaryGreen),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ],
                      ],
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: filteredOrders.length,
                    itemBuilder: (context, index) {
                      final order = filteredOrders[index];
                      return _buildReferenceOrderCard(order);
                    },
                  ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPartnerTypeBadge() {
    Color bg;
    Color text;
    IconData icon;
    String label;

    final String effectiveType = PlatformConfigService.isGroceryPlatform
        ? 'grocery_store'
        : _businessType.toLowerCase();

    switch (effectiveType) {
      case 'grocery_store':
      case 'grocery':
        bg = const Color(0xFFE8F5E9);
        text = const Color(0xFF2E7D32);
        icon = Icons.shopping_basket_rounded;
        label = 'Grocery & Mart Partner';
        break;
      case 'pharmacy':
        bg = const Color(0xFFFCE7F3);
        text = const Color(0xFFBE185D);
        icon = Icons.local_pharmacy_rounded;
        label = 'Pharmacy Partner (Rx)';
        break;
      case 'home_service_provider':
      case 'home_services':
        bg = const Color(0xFFEFF6FF);
        text = const Color(0xFF1D4ED8);
        icon = Icons.handyman_rounded;
        label = 'Home Service Partner';
        break;
      case 'laundry':
        bg = const Color(0xFFECFEFF);
        text = const Color(0xFF0E7490);
        icon = Icons.local_laundry_service_rounded;
        label = 'Laundry Partner';
        break;
      case 'dairy_milk':
      case 'water_supplier':
      case 'essentials':
        bg = const Color(0xFFF0F9FF);
        text = const Color(0xFF0369A1);
        icon = Icons.water_drop_rounded;
        label = 'Essentials Partner';
        break;
      default:
        bg = const Color(0xFFFFF3E0);
        text = const Color(0xFFE65100);
        icon = Icons.restaurant_rounded;
        label = 'Restaurant Partner';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: text),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: text,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAssignedRoleBadge() {
    final roleLabel = RestaurantAuthService.assignedRole;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: const Color(0xFFEEF2FF),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: const Color(0xFFC7D2FE)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.verified_user_rounded, size: 10, color: Color(0xFF4338CA)),
          const SizedBox(width: 3),
          Text(
            roleLabel,
            style: GoogleFonts.poppins(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF4338CA),
            ),
          ),
        ],
      ),
    );
  }

  void _openPartnerOperationalSheet(String label, Color accentColor) {
    if (label.contains('Stock') || label.contains('Price') || label.contains('Inventory')) {
      _showStockToggleSheet(accentColor, onlyOutOfStock: label.contains('Out of Stock'));
    } else if (label.contains('Prescription') || label.contains('Rx') || label.contains('Medicine')) {
      _showRxReviewSheet(accentColor);
    } else if (label.contains('Booking') || label.contains('Quotation') || label.contains('OTP')) {
      _showTechnicianJobSheet(accentColor);
    } else {
      _showGenericQueueSheet(label, accentColor);
    }
  }

  void _showStockToggleSheet(Color accentColor, {bool onlyOutOfStock = false}) {
    bool isLoading = true;
    String? errorMsg;
    List<Map<String, dynamic>> items = [];
    bool initiatedLoad = false;

    Future<void> loadInventory(void Function(void Function()) setSheetState) async {
      setSheetState(() {
        isLoading = true;
        errorMsg = null;
      });
      final invRes = await MenuApiService.fetchGroceryInventory(_restaurantId);
      List<Map<String, dynamic>> rawItems = [];
      if (invRes['success'] == true && invRes['items'] is List && (invRes['items'] as List).isNotEmpty) {
        rawItems = List<Map<String, dynamic>>.from(invRes['items'] as List);
      } else {
        rawItems = await MenuApiService.fetchRestaurantMenu(_restaurantId);
        if (rawItems.isEmpty && invRes['success'] != true) {
          errorMsg = invRes['message']?.toString();
        }
      }

      final normalized = rawItems.map<Map<String, dynamic>>((raw) {
        final nameVal = raw['name'];
        final name = nameVal is Map
            ? (nameVal['en'] ?? (nameVal.values.isNotEmpty ? nameVal.values.first : 'Product')).toString()
            : (nameVal ?? 'Product').toString();
        final id = (raw['_id'] ?? raw['id'] ?? '').toString();
        final price = double.tryParse(
              (raw['sellingPrice'] ??
                      raw['b2cSellingPrice'] ??
                      raw['pricing']?['b2c']?['sellingPrice'] ??
                      raw['price'] ??
                      raw['basePrice'] ??
                      0)
                  .toString(),
            ) ??
            0.0;
        final stockQty = int.tryParse((raw['stockQuantity'] ?? 0).toString()) ?? 0;
        final inStock = raw['outOfStock'] == true
            ? false
            : (raw['inStock'] ?? raw['isAvailable'] ?? raw['available'] ?? true) == true;
        final weight = (raw['weight'] ?? '').toString().trim();
        final unit = (raw['unit'] ?? '').toString().trim();
        final weightText = weight.isNotEmpty ? '$weight ${unit.isNotEmpty ? unit : ''}'.trim() : '';
        return {
          '_id': id,
          'name': name,
          'price': price,
          'stockQuantity': stockQty,
          'inStock': inStock,
          'weightText': weightText,
          'sku': (raw['sku'] ?? '').toString().trim(),
        };
      }).where((item) {
        if (onlyOutOfStock) {
          return item['inStock'] != true || ((item['stockQuantity'] as int) <= 0 && item['inStock'] != true);
        }
        return true;
      }).toList();

      setSheetState(() {
        items = normalized;
        isLoading = false;
      });
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (sheetCtx, setSheetState) {
          if (!initiatedLoad) {
            initiatedLoad = true;
            Future.microtask(() => loadInventory(setSheetState));
          }
          final maxHeight = MediaQuery.of(context).size.height * 0.72;
          return ConstrainedBox(
            constraints: BoxConstraints(maxHeight: maxHeight),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.inventory_2_rounded, color: accentColor),
                          const SizedBox(width: 8),
                          Text(
                            onlyOutOfStock ? 'Out-of-Stock Products' : 'Quick Stock Switcher',
                            style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: Icon(Icons.refresh_rounded, color: accentColor),
                            onPressed: () => loadInventory(setSheetState),
                          ),
                          IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    'Toggle live product availability synced with ${PlatformConfigService.appName} customer apps:',
                    style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 12),
                  if (isLoading)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 32),
                      child: Center(child: CircularProgressIndicator()),
                    )
                  else if (errorMsg != null && items.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Center(
                        child: Text(
                          errorMsg!,
                          textAlign: TextAlign.center,
                          style: GoogleFonts.poppins(fontSize: 12, color: Colors.redAccent),
                        ),
                      ),
                    )
                  else if (items.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Center(
                        child: Text(
                          onlyOutOfStock
                              ? 'All products in your store catalog are currently in stock.'
                              : 'No catalog products found for this store yet. Add SKUs in the Catalog tab.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
                        ),
                      ),
                    )
                  else
                    Flexible(
                      child: ListView.separated(
                        shrinkWrap: true,
                        itemCount: items.length,
                        separatorBuilder: (_, __) => const Divider(height: 1),
                        itemBuilder: (itemCtx, idx) {
                          final item = items[idx];
                          final id = item['_id'].toString();
                          final bool inStock = item['inStock'] == true;
                          final int stockQty = item['stockQuantity'] as int;
                          final String weightText = item['weightText'].toString();
                          final double price = (item['price'] as num).toDouble();
                          final String subtitleText = [
                            '₹${price.toStringAsFixed(0)}',
                            if (weightText.isNotEmpty) weightText,
                            'Stock: $stockQty',
                          ].join(' • ');

                          return SwitchListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text(
                              item['name'].toString(),
                              style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                            subtitle: Text(
                              subtitleText,
                              style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[600]),
                            ),
                            value: inStock,
                            activeThumbColor: accentColor,
                            onChanged: id.isEmpty
                                ? null
                                : (val) async {
                                    setSheetState(() => item['inStock'] = val);
                                    final int targetQty = val ? (stockQty > 0 ? stockQty : 10) : stockQty;
                                    final res = await MenuApiService.updateGroceryInventory(id, {
                                      'inStock': val,
                                      'outOfStock': !val,
                                      'isAvailable': val,
                                      'stockQuantity': targetQty,
                                    });
                                    bool succeeded = res['success'] == true;
                                    if (!succeeded && _restaurantId.isNotEmpty) {
                                      succeeded = await MenuApiService.toggleAvailability(_restaurantId, id);
                                    }
                                    if (!succeeded) {
                                      setSheetState(() => item['inStock'] = !val);
                                    } else {
                                      setSheetState(() => item['stockQuantity'] = targetQty);
                                    }
                                    if (!mounted) return;
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(
                                          succeeded
                                              ? '${item['name']} is now ${val ? "IN STOCK" : "OUT OF STOCK"}'
                                              : (res['message']?.toString() ?? 'Failed to update stock'),
                                        ),
                                        backgroundColor: succeeded
                                            ? (val ? Colors.green[700] : Colors.redAccent)
                                            : Colors.redAccent,
                                        duration: const Duration(seconds: 2),
                                      ),
                                    );
                                  },
                          );
                        },
                      ),
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _showRxReviewSheet(Color accentColor) {
    final pendingOrders = _orders.where((o) {
      final s = o.status.toLowerCase();
      return s == 'placed' || s == 'pending' || s == 'preparing';
    }).toList();

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.receipt_long_rounded, color: accentColor),
                const SizedBox(width: 8),
                Text('Prescription Review Queue', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            if (pendingOrders.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12)),
                child: Text(
                  'No pending prescription or pharmacy verification orders right now.',
                  style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[700]),
                ),
              )
            else
              ...pendingOrders.take(4).map((o) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: CircleAvatar(
                      backgroundColor: accentColor.withOpacity(0.12),
                      child: Icon(Icons.medical_services_outlined, color: accentColor, size: 18),
                    ),
                    title: Text('${o.customerName} (#${o.id})', style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600)),
                    subtitle: Text('₹${o.totalAmount.toStringAsFixed(0)} • ${o.status}', style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[600])),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      Navigator.pop(ctx);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => OrderDetailsScreen(order: o)))
                          .then((_) => _fetchLiveOrders(isSilent: true));
                    },
                  )),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                style: ElevatedButton.styleFrom(backgroundColor: accentColor, foregroundColor: Colors.white),
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showTechnicianJobSheet(Color accentColor) {
    final activeJobs = _orders.where((o) {
      final s = o.status.toLowerCase();
      return s == 'placed' || s == 'pending' || s == 'preparing' || s == 'ready';
    }).toList();

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.handyman_rounded, color: accentColor),
                const SizedBox(width: 8),
                Text('Scheduled Service Bookings', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            if (activeJobs.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(12)),
                child: Text(
                  'No active service bookings right now. Incoming bookings appear here in real time.',
                  style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[700]),
                ),
              )
            else
              ...activeJobs.take(4).map((o) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: CircleAvatar(
                      backgroundColor: accentColor.withOpacity(0.12),
                      child: Icon(Icons.calendar_today_rounded, color: accentColor, size: 18),
                    ),
                    title: Text('${o.customerName} (#${o.id})', style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600)),
                    subtitle: Text('${o.address} • ${o.status}', style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[600]), maxLines: 1, overflow: TextOverflow.ellipsis),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      Navigator.pop(ctx);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => OrderDetailsScreen(order: o)))
                          .then((_) => _fetchLiveOrders(isSilent: true));
                    },
                  )),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                style: ElevatedButton.styleFrom(backgroundColor: accentColor, foregroundColor: Colors.white),
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showGenericQueueSheet(String label, Color accentColor) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(
              'Operational orders and queue items are in sync with ${PlatformConfigService.appName} Partner backend.',
              style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[700]),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                style: ElevatedButton.styleFrom(backgroundColor: accentColor, foregroundColor: Colors.white),
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPartnerVerticalActionBanner() {
    String title;
    String subtitle;
    List<Map<String, dynamic>> actions;
    Color accentColor;

    final String effectiveType = PlatformConfigService.isGroceryPlatform
        ? 'grocery_store'
        : _businessType.toLowerCase();

    switch (effectiveType) {
      case 'grocery_store':
      case 'grocery':
      case 'essentials':
      case 'dairy_milk':
        title = 'Grocery & Mart Operations';
        subtitle = 'Manage live stock, weights & rapid fulfilment';
        accentColor = const Color(0xFF10B981);
        actions = [
          {'label': 'Live Stock Status', 'icon': Icons.inventory_2_rounded},
          {'label': 'Price & Weight List', 'icon': Icons.scale_rounded},
          {'label': 'Out of Stock Items', 'icon': Icons.remove_shopping_cart_rounded},
        ];
        break;
      case 'pharmacy':
        title = 'Pharmacy & Prescription Hub';
        subtitle = 'Review doctor prescriptions & Schedule H compliance';
        accentColor = const Color(0xFFEC4899);
        actions = [
          {'label': 'Pending Rx Prescriptions', 'icon': Icons.receipt_long_rounded},
          {'label': 'Medicine Catalog', 'icon': Icons.medication_rounded},
          {'label': 'Dispense Verification', 'icon': Icons.verified_user_rounded},
        ];
        break;
      case 'home_service_provider':
      case 'home_services':
        title = 'Technician & Home Services Desk';
        subtitle = 'Appointments, quotations and completion OTPs';
        accentColor = const Color(0xFF3B82F6);
        actions = [
          {'label': 'Scheduled Bookings', 'icon': Icons.calendar_today_rounded},
          {'label': 'Send Quotation', 'icon': Icons.request_quote_rounded},
          {'label': 'Job Completion OTP', 'icon': Icons.pin_rounded},
        ];
        break;
      case 'laundry':
        title = 'Laundry & Dry Clean Station';
        subtitle = 'Track washing, steam iron & packaging queue';
        accentColor = const Color(0xFF06B6D4);
        actions = [
          {'label': 'Washing Queue', 'icon': Icons.wash_rounded},
          {'label': 'Iron & Folded', 'icon': Icons.iron_rounded},
          {'label': 'Ready for Dispatch', 'icon': Icons.local_shipping_rounded},
        ];
        break;
      default:
        return const SizedBox.shrink();
    }

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: accentColor.withOpacity(0.25)),
        boxShadow: [
          BoxShadow(
            color: accentColor.withOpacity(0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: accentColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(Icons.hub_rounded, color: accentColor, size: 16),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: GoogleFonts.poppins(
                        fontSize: 10,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: actions.map((a) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: InkWell(
                    onTap: () => _openPartnerOperationalSheet(a['label'].toString(), accentColor),
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: accentColor.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: accentColor.withOpacity(0.2)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(a['icon'] as IconData, size: 13, color: accentColor),
                          const SizedBox(width: 5),
                          Text(
                            a['label'].toString(),
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: accentColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderSection() {
    final bool isGrocery = _isGroceryMode;
    final tabs = _getVisibleTabs();
    final int profileTabIndex = tabs.indexWhere((t) => t['key'] == 'profile');

    Widget buildDefaultAvatar() {
      return Container(
        color: AppColors.primaryGreen.withOpacity(0.1),
        child: Icon(
          isGrocery ? Icons.storefront_rounded : Icons.restaurant,
          color: AppColors.primaryGreen,
          size: 24,
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
        child: Row(
          children: [
            // Partner Store Avatar with live backend photo or storefront icon fallback
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.primaryGreen, width: 2),
                color: Colors.white,
              ),
              child: ClipOval(
                child: (_restaurantImage.startsWith('http://') || _restaurantImage.startsWith('https://'))
                    ? Image.network(
                        _restaurantImage,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => buildDefaultAvatar(),
                      )
                    : buildDefaultAvatar(),
              ),
            ),
            const SizedBox(width: 12),

            // Store Name, Partner Badge, Role Pill & Edit Profile Link
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _restaurantName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: [
                      _buildPartnerTypeBadge(),
                      _buildAssignedRoleBadge(),
                    ],
                  ),
                  const SizedBox(height: 2),
                  GestureDetector(
                    onTap: () {
                      if (profileTabIndex >= 0) {
                        setState(() => _currentBottomNavIndex = profileTabIndex);
                      }
                    },
                    child: Text(
                      isGrocery ? 'Edit Store Profile' : 'Edit Restaurant Profile',
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        color: AppColors.primaryGreen,
                        fontWeight: FontWeight.w600,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Online / Offline Switch
            Switch(
              value: _isOnline,
              onChanged: (val) => _toggleOnlineStatus(val),
              activeThumbColor: AppColors.primaryGreen,
            ),
            const SizedBox(width: 4),

                // Notification Bell Button
                GestureDetector(
                  onTap: () => _showNotificationsSheet(context),
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: AppColors.primaryGreen.withOpacity(0.12),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.notifications_rounded,
                          color: AppColors.primaryGreen,
                          size: 22,
                        ),
                      ),
                      if (_unreadNotificationCount > 0)
                        Positioned(
                          right: -2,
                          top: -2,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: Colors.redAccent,
                              shape: BoxShape.circle,
                            ),
                            constraints: const BoxConstraints(
                              minWidth: 18,
                              minHeight: 18,
                            ),
                            child: Text(
                              _unreadNotificationCount > 9 ? '9+' : '$_unreadNotificationCount',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
          ],
        ),
      ),
    );
  }

  // Earnings Banner Card matching Reference Image 1 with yellow background
  Widget _buildEarningsCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB), // Soft elegant yellow card background
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFDE68A), width: 1.2),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Earning',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: Colors.grey[700],
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                (_currentMonth.isNotEmpty) ? _currentMonth : 'Current Month',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
            ],
          ),
          Text(
            '₹${_monthlyEarning.toStringAsFixed(2)}',
            style: GoogleFonts.poppins(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryGreen, // Primary Green Text
            ),
          ),
        ],
      ),
    );
  }

  // Order Type Tabs (Delivery / Pick-up)
  Widget _buildOrderTypeTabs() {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFEEEEEE), width: 1.5)),
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _selectedOrderType = 'delivery'),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: _selectedOrderType == 'delivery' ? AppColors.primaryGreen : Colors.transparent,
                      width: 2.5,
                    ),
                  ),
                ),
                child: Text(
                  'Delivery',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(
                    fontSize: 15,
                    fontWeight: _selectedOrderType == 'delivery' ? FontWeight.bold : FontWeight.w500,
                    color: _selectedOrderType == 'delivery' ? Colors.black : Colors.grey[600],
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _selectedOrderType = 'pickup'),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: _selectedOrderType == 'pickup' ? AppColors.primaryGreen : Colors.transparent,
                      width: 2.5,
                    ),
                  ),
                ),
                child: Text(
                  'Pick-up',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(
                    fontSize: 15,
                    fontWeight: _selectedOrderType == 'pickup' ? FontWeight.bold : FontWeight.w500,
                    color: _selectedOrderType == 'pickup' ? Colors.black : Colors.grey[600],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Filter Pills Row matching Reference Image 1 & 2
  Widget _buildFilterPillsRow() {
    final filters = [
      {'name': 'Placed', 'count': _getCountForStatus('Placed'), 'color': const Color(0xFF6C757D)},
      {'name': 'Preparing', 'count': _getCountForStatus('Preparing'), 'color': const Color(0xFFE89D1E)},
      {'name': 'Ready', 'count': _getCountForStatus('Ready'), 'color': const Color(0xFF4A90E2)},
      {'name': 'Picked Up', 'count': _getCountForStatus('Picked Up'), 'color': const Color(0xFF8E44AD)},
      {'name': 'Delivered', 'count': _getCountForStatus('Delivered'), 'color': AppColors.primaryGreen},
      {'name': 'Cancelled', 'count': _getCountForStatus('Cancelled'), 'color': Colors.redAccent},
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: filters.map((f) {
          final String name = f['name'] as String;
          final int count = f['count'] as int;
          final Color pillColor = f['color'] as Color;
          final bool isSelected = _selectedStatusFilter == name;

          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _selectedStatusFilter = isSelected ? 'All' : name;
                });
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primaryGreen : pillColor,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: AppColors.primaryGreen.withOpacity(0.3),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          )
                        ]
                      : [],
                ),
                child: Text(
                  '$name ($count)',
                  style: GoogleFonts.poppins(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // Order Card Component matching Reference UI strictly
  Widget _buildReferenceOrderCard(Order order) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Customer Header Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              order.customerName,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.grey[100],
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: Colors.grey[300]!),
                            ),
                            child: Text(
                              '#${order.id}',
                              style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black87),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        order.address,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          color: Colors.grey[500],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: order.paymentMethod.toLowerCase().contains('cod') || order.paymentMethod.toLowerCase().contains('cash')
                              ? Colors.amber.shade50
                              : Colors.blue.shade50,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          order.paymentMethod,
                          style: GoogleFonts.poppins(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: order.paymentMethod.toLowerCase().contains('cod') || order.paymentMethod.toLowerCase().contains('cash')
                                ? Colors.amber.shade900
                                : Colors.blue.shade900,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 22),
                      tooltip: 'Delete Order',
                      onPressed: () => _deleteOrder(order),
                    ),
                    IconButton(
                      icon: const Icon(Icons.chevron_right, color: Colors.black87),
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => OrderDetailsScreen(order: order)),
                      ).then((_) => _fetchLiveOrders(isSilent: true)),
                    ),
                  ],
                ),
              ],
            ),
            const Divider(height: 20, color: Color(0xFFF0F0F0)),

            // Items Horizontal Preview Row
            Row(
              children: [
                // Item 1
                Expanded(
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: _buildOrderItemImage(
                          (order.items.isNotEmpty && order.items[0] is Map)
                              ? _resolveImageUrl((order.items[0]['image'] ?? (order.items[0]['product'] is Map ? order.items[0]['product']['image'] : null))?.toString())
                              : null,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              (order.items.isNotEmpty && order.items[0] is Map)
                                  ? (order.items[0]['name']?.toString() ?? (order.items[0]['product'] is Map ? order.items[0]['product']['name']?.toString() : 'Item') ?? 'Item')
                                  : (order.orderName.isNotEmpty ? order.orderName : 'Item'),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),
                            Text(
                              _formatOrderItemSubtitle(order.items.isNotEmpty ? order.items[0] : null),
                              style: GoogleFonts.poppins(
                                fontSize: 10,
                                color: Colors.grey[500],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),

                // Item 2
                if (order.items.length > 1)
                  Expanded(
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: _buildOrderItemImage(
                            (order.items[1] is Map)
                                ? _resolveImageUrl((order.items[1]['image'] ?? (order.items[1]['product'] is Map ? order.items[1]['product']['image'] : null))?.toString())
                                : null,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                (order.items[1] is Map)
                                    ? (order.items[1]['name']?.toString() ?? (order.items[1]['product'] is Map ? order.items[1]['product']['name']?.toString() : (_isGroceryMode ? 'Product' : 'Dish')) ?? (_isGroceryMode ? 'Product' : 'Dish'))
                                    : (_isGroceryMode ? 'Product' : 'Dish'),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.poppins(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black87,
                                ),
                              ),
                              Text(
                                _formatOrderItemSubtitle(order.items[1]),
                                style: GoogleFonts.poppins(
                                  fontSize: 10,
                                  color: Colors.grey[500],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                if (order.items.length > 2)
                  Text(
                    '+${order.items.length - 2} More',
                    style: GoogleFonts.poppins(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[600],
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 14),

            // Order Date & Price Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _formatOrderTime(order.createdAt),
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        color: Colors.grey[600],
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      order.status,
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: _getStatusTextColor(order.status),
                      ),
                    ),
                  ],
                ),
                Text(
                  '₹${order.totalAmount.toStringAsFixed(2)}',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Bottom Action Area matching each state
            _buildCardActionArea(order),
          ],
        ),
      ),
    );
  }

  String _formatOrderItemSubtitle(dynamic rawItem) {
    if (rawItem is! Map) return _isGroceryMode ? 'Qty: 1' : 'Standard';
    final qty = rawItem['quantity'] ?? rawItem['qty'] ?? 1;
    final weight = (rawItem['weight'] ?? (rawItem['product'] is Map ? rawItem['product']['weight'] : null) ?? '').toString().trim();
    final unit = (rawItem['unit'] ?? (rawItem['product'] is Map ? rawItem['product']['unit'] : null) ?? '').toString().trim();
    if (weight.isNotEmpty) {
      return '$weight ${unit.isNotEmpty ? unit : ''} • Qty: $qty'.trim();
    }
    final variant = (rawItem['variant'] ?? '').toString().trim();
    if (_isGroceryMode) {
      if (variant.isNotEmpty && variant.toLowerCase() != 'standard' && variant.toLowerCase() != 'regular' && variant.toLowerCase() != 'veg' && variant.toLowerCase() != 'non-veg') {
        return '$variant • Qty: $qty';
      }
      return 'Qty: $qty';
    }
    if (variant.isNotEmpty) return variant;
    return rawItem['isVeg'] == false ? 'Non-Veg' : 'Veg';
  }

  // State Action Section matching real backend order lifecycle
  Widget _buildCardActionArea(Order order) {
    final s = order.status.toLowerCase().trim();
    final bool isSelfPickup = order.isSelfPickup;
    final bool isGrocery = _isGroceryMode;
    final isHandedOverOrPickedUp = s == 'picked_up' || s == 'picked up' || s == 'out_for_delivery' || s == 'out for delivery' || s == 'on_the_way' || s == 'on the way' || s == 'handed_over' || s == 'handed over' || s == 'handovered';

    // 1. Placed / Pending
    if (s == 'placed' || s == 'pending') {
      return Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => _rejectOrder(order),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.primaryGreen, width: 1.5),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: Text(
                'Reject',
                style: GoogleFonts.poppins(color: AppColors.primaryGreen, fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton(
              onPressed: () => _acceptOrder(order),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: Text(
                'Accept Order',
                style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ),
          ),
        ],
      );
    }

    // 2. Preparing / Accepted
    if (s == 'preparing' || s == 'accepted') {
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            isGrocery ? '📦 Packing Order Items' : '🍳 Kitchen Preparing Food',
            style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87),
          ),
          ElevatedButton(
            onPressed: () async {
              final targetId = order.backendId.isNotEmpty ? order.backendId : order.id;
              setState(() => order.status = 'Ready');
              await RestaurantApiService.markOrderReady(targetId);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      isGrocery
                          ? (isSelfPickup
                              ? '✅ Order Packed! Customer notified for store pickup.'
                              : '✅ Order Packed! Click "Search Rider" to notify nearby riders.')
                          : (isSelfPickup
                              ? '✅ Food Marked Ready! Customer notified for self pickup.'
                              : '✅ Food Marked Ready! Click "Search Rider" to notify nearby riders.'),
                    ),
                    backgroundColor: AppColors.primaryGreen,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGreen,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            ),
            child: Text(
              'Mark Ready',
              style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ),
        ],
      );
    }

    // 3. Picked Up / Handed Over to Rider (Delivery Flow - Completed from store side)
    if (!isSelfPickup && (isHandedOverOrPickedUp || s == 'delivered' || s == 'completed')) {
      final riderNameStr = (order.riderName != null && order.riderName!.isNotEmpty) ? order.riderName : 'Delivery Partner';
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                '🚀 Order Handed Over to Rider ($riderNameStr)',
                style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black87),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const Icon(Icons.check_circle, color: AppColors.primaryGreen, size: 20),
          ],
        ),
      );
    }

    // 4. Ready / Ready for Pickup
    if (s == 'ready' || s == 'ready_for_pickup' || s == 'ready for pickup') {
      final hasRider = (order.riderName != null && order.riderName!.isNotEmpty) || (order.riderId != null && order.riderId!.isNotEmpty);
      if (hasRider && !isHandedOverOrPickedUp) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                '🚴 Rider ${order.riderName} Assigned! Ask 4-digit OTP.',
                style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black87),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => OrderDetailsScreen(order: order))).then((_) => _fetchLiveOrders(isSilent: true)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              ),
              child: Text(
                'Verify Rider OTP',
                style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ),
          ],
        );
      }
      if (isSelfPickup) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              order.customerArrived ? '🔔 Customer Arrived at Counter!' : 'Self Pickup Verification',
              style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87),
            ),
            ElevatedButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => OrderDetailsScreen(order: order))).then((_) => _fetchLiveOrders(isSilent: true)),
              style: ElevatedButton.styleFrom(
                backgroundColor: order.customerArrived ? Colors.orange : AppColors.primaryGreen,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
              ),
              child: Text(
                'Verify OTP',
                style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ),
          ],
        );
      }
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            isGrocery ? '✅ Order Ready! Click Search Rider' : '✅ Food Ready! Click Search Rider',
            style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87),
          ),
          ElevatedButton(
            onPressed: () => _showSearchingRiderModal(order),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange[800],
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            ),
            child: Text(
              'Search Rider',
              style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ),
        ],
      );
    }

    // 5. Assigned / Rider Assigned / Reached Store
    if (!isHandedOverOrPickedUp && (s == 'assigned' || s == 'rider_assigned' || s == 'rider_accepted' || s == 'reached_store' || s == 'reached_restaurant' || (order.riderName != null && order.riderName!.isNotEmpty))) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              '🚴 Rider ${order.riderName ?? ''} Assigned! Ask 4-digit OTP.',
              style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black87),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => OrderDetailsScreen(order: order))).then((_) => _fetchLiveOrders(isSilent: true)),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGreen,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            ),
            child: Text(
              'Verify Rider OTP',
              style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ),
        ],
      );
    }

    // 6. Delivered / Completed / Handed Over
    if (s == 'delivered' || s == 'completed' || s == 'handovered') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              isSelfPickup ? '🎉 Self Pickup Completed' : '🚀 Order Handed Over to Rider',
              style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black87),
            ),
            const Icon(Icons.check_circle, color: AppColors.primaryGreen, size: 20),
          ],
        ),
      );
    } else if (s == 'cancelled' || s == 'rejected' || order.status == 'Cancelled') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFFFEF2F2),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                '❌ Cancelled (${order.cancellationReason ?? 'Full Refund'})',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.redAccent),
              ),
            ),
            const Icon(Icons.cancel, color: Colors.redAccent, size: 18),
          ],
        ),
      );
    }
    return const SizedBox.shrink();
  }

  Color _getStatusTextColor(String status) {
    switch (status) {
      case 'Placed':
        return Colors.grey[600]!;
      case 'Preparing':
        return const Color(0xFFE89D1E);
      case 'Ready':
        return const Color(0xFF4A90E2);
      case 'Picked Up':
        return const Color(0xFF8E44AD);
      case 'Delivered':
        return AppColors.primaryGreen;
      case 'Cancelled':
        return Colors.redAccent;
      default:
        return Colors.black;
    }
  }

  // Custom Bottom Navigation Bar filtered by RBAC permissions & active platformMode
  Widget _buildReferenceBottomNavBar(List<Map<String, dynamic>> tabs, int safeIndex) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: List.generate(tabs.length, (idx) {
          final t = tabs[idx];
          return _buildNavItem(
            idx,
            t['icon'] as IconData,
            t['label'] as String,
            safeIndex == idx,
          );
        }),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label, bool isSelected) {
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _currentBottomNavIndex = index),
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Active top line indicator matching Reference Image 3
            Container(
              height: 3,
              width: double.infinity,
              color: isSelected ? AppColors.primaryGreen : Colors.transparent,
            ),
            const SizedBox(height: 8),
            Icon(
              icon,
              color: isSelected ? AppColors.primaryGreen : Colors.grey[500],
              size: 22,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? AppColors.primaryGreen : Colors.grey[500],
              ),
            ),
            const SizedBox(height: 6),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderItemImage(String? imagePath) {
    Widget buildFallbackIcon() {
      return Container(
        width: 44,
        height: 44,
        color: Colors.grey[100],
        child: Icon(
          _isGroceryMode ? Icons.shopping_bag_rounded : Icons.fastfood_rounded,
          size: 20,
          color: AppColors.primaryGreen,
        ),
      );
    }

    if (imagePath != null && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
      return Image.network(
        imagePath,
        width: 44,
        height: 44,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => buildFallbackIcon(),
      );
    }

    if (imagePath != null && imagePath.startsWith('assets/')) {
      return Image.asset(
        imagePath,
        width: 44,
        height: 44,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => buildFallbackIcon(),
      );
    }

    return buildFallbackIcon();
  }

  String _formatOrderTime(DateTime? date) {
    if (date == null) return 'Placed recently';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    final m = months[date.month - 1];
    final d = date.day;
    final hour = date.hour > 12 ? date.hour - 12 : (date.hour == 0 ? 12 : date.hour);
    final min = date.minute.toString().padLeft(2, '0');
    final period = date.hour >= 12 ? 'PM' : 'AM';
    return 'Order placed on $d $m, $hour:$min $period';
  }
}
