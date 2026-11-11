import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:ui';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/app_colors.dart';
import '../services/category_api_service.dart';
import '../services/menu_api_service.dart';
import '../services/platform_config_service.dart';
import '../services/restaurant_auth_service.dart';
import '../api_constants.dart';

class MenuManagementScreen extends StatefulWidget {
  const MenuManagementScreen({super.key});

  @override
  State<MenuManagementScreen> createState() => _MenuManagementScreenState();
}

class _MenuManagementScreenState extends State<MenuManagementScreen> {
  List<Map<String, dynamic>> _menuItems = [];
  bool _isLoading = false;
  bool _isFetching = false;
  Timer? _liveSyncTimer;

  bool get _isGroceryMode =>
      PlatformConfigService.isGroceryPlatform ||
      (PlatformConfigService.isBothMode && RestaurantAuthService.isGroceryStore);

  @override
  void initState() {
    super.initState();
    _loadMenuFromApi();
    // Live background sync every 10 seconds to catch real-time admin approvals
    _liveSyncTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      if (mounted && !_isFetching) {
        _loadMenuFromApi(isSilent: true);
      }
    });
  }

  @override
  void dispose() {
    _liveSyncTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadMenuFromApi({bool isSilent = false}) async {
    if (_isFetching) return;
    _isFetching = true;
    final prefs = await SharedPreferences.getInstance();
    
    // Load local cache immediately so screen never appears blank
    final cachedStr = prefs.getString('cached_menu_items');
    if (cachedStr != null && cachedStr.isNotEmpty && _menuItems.isEmpty) {
      try {
        final List cachedList = jsonDecode(cachedStr);
        setState(() {
          _menuItems = List<Map<String, dynamic>>.from(cachedList);
        });
      } catch (_) {}
    }

    if (!isSilent && _menuItems.isEmpty) {
      setState(() => _isLoading = true);
    }
    try {
      var restId = prefs.getString('restaurantId') ?? ApiConstants.restaurantId;
      if (restId == 'null' || restId == 'undefined') restId = '';
      final phone = prefs.getString('userPhone') ?? '';
      final token = prefs.getString('token') ?? ApiConstants.authToken;

      if (restId.isEmpty && phone.isNotEmpty) {
        try {
          final sRes = await http.get(
            Uri.parse(ApiConstants.checkApprovalStatusByMobile(phone)),
            headers: {
              'Content-Type': 'application/json',
              if (token.isNotEmpty) 'Authorization': 'Bearer $token',
            },
          ).timeout(const Duration(seconds: 5));
          if (sRes.statusCode == 200) {
            final sData = jsonDecode(sRes.body);
            if (sData['restaurantId'] != null) {
              restId = sData['restaurantId'].toString();
              prefs.setString('restaurantId', restId);
            }
          }
        } catch (_) {}
      }

      final items = await MenuApiService.fetchRestaurantMenu(restId.isNotEmpty ? restId : phone);
      if (mounted) {
        // Detect newly approved items to show instant celebration snackbar
        for (var newItem in items) {
          final oldItem = _menuItems.firstWhere((it) => it['_id'] == newItem['_id'] || it['name'] == newItem['name'], orElse: () => {});
          if (oldItem.isNotEmpty) {
            final wasPending = oldItem['approvalStatus'] == 'pending' || oldItem['isApproved'] == false;
            final isNowApproved = newItem['approvalStatus'] == 'approved' || newItem['isApproved'] == true;
            if (wasPending && isNowApproved) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Row(
                    children: [
                      const Icon(Icons.verified_rounded, color: Colors.white),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          '🎉 "${newItem['name']}" has been Approved by Admin and is now Live!',
                          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                  backgroundColor: const Color(0xFF16A34A),
                  duration: const Duration(seconds: 4),
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              );
            }
          }
        }

        setState(() {
          if (items.isNotEmpty) {
            _menuItems = items;
            prefs.setString('cached_menu_items', jsonEncode(_menuItems));
          } else if (_menuItems.isNotEmpty) {
            prefs.setString('cached_menu_items', jsonEncode(_menuItems));
          } else {
            _menuItems = [];
          }
          if (!isSilent) _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted && !isSilent) {
        setState(() => _isLoading = false);
      }
    } finally {
      _isFetching = false;
    }
  }

  Future<void> _adjustStock(Map<String, dynamic> item, int delta) async {
    final String itemId = (item['_id'] ?? item['id'] ?? '').toString();
    if (itemId.isEmpty) return;
    final int previousStock = int.tryParse((item['stockQuantity'] ?? 0).toString()) ?? 0;
    final int nextStock = (previousStock + delta).clamp(0, 999999);
    if (nextStock == previousStock) return;
    final bool previousAvailable = item['isAvailable'] ?? item['inStock'] ?? true;
    final bool nextAvailable = nextStock > 0;

    setState(() {
      final index = _menuItems.indexWhere((m) => (m['_id'] ?? m['id']).toString() == itemId);
      if (index != -1) {
        _menuItems[index]['stockQuantity'] = nextStock;
        _menuItems[index]['inStock'] = nextAvailable;
        _menuItems[index]['isAvailable'] = nextAvailable;
        _menuItems[index]['available'] = nextAvailable;
      }
    });

    final res = await MenuApiService.updateGroceryInventory(itemId, {
      'stockQuantity': nextStock,
      'inStock': nextAvailable,
    });

    if (res['success'] == true) {
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('cached_menu_items', jsonEncode(_menuItems));
      } catch (_) {}
      return;
    }

    if (mounted) {
      setState(() {
        final index = _menuItems.indexWhere((m) => (m['_id'] ?? m['id']).toString() == itemId);
        if (index != -1) {
          _menuItems[index]['stockQuantity'] = previousStock;
          _menuItems[index]['inStock'] = previousAvailable;
          _menuItems[index]['isAvailable'] = previousAvailable;
          _menuItems[index]['available'] = previousAvailable;
        }
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message']?.toString() ?? 'Failed to update stock'),
          backgroundColor: Colors.redAccent,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  Future<void> _toggleAvailability(String itemId, bool isAvailable, String name) async {
    final int index = _menuItems.indexWhere((item) => item['_id'] == itemId);
    final bool previous = index != -1 ? (_menuItems[index]['isAvailable'] ?? true) : !isAvailable;
    setState(() {
      if (index != -1) {
        _menuItems[index]['isAvailable'] = isAvailable;
        _menuItems[index]['inStock'] = isAvailable;
        _menuItems[index]['available'] = isAvailable;
      }
    });

    bool succeeded = false;
    try {
      final prefs = await SharedPreferences.getInstance();
      final restId = prefs.getString('restaurantId') ?? ApiConstants.restaurantId;
      final token = prefs.getString('token') ?? ApiConstants.authToken;
      if (restId.isNotEmpty && itemId.isNotEmpty) {
        final res = await http.patch(
          Uri.parse('${ApiConstants.baseUrl}/restaurants/vendor/menu/toggle/$restId/$itemId'),
          headers: {
            'Content-Type': 'application/json',
            if (token.isNotEmpty) 'Authorization': 'Bearer $token',
          },
        ).timeout(const Duration(seconds: 6));
        succeeded = res.statusCode >= 200 && res.statusCode < 300;
      }
    } catch (_) {}

    if (mounted) {
      if (!succeeded) {
        setState(() {
          final idx = _menuItems.indexWhere((item) => item['_id'] == itemId);
          if (idx != -1) {
            _menuItems[idx]['isAvailable'] = previous;
            _menuItems[idx]['inStock'] = previous;
            _menuItems[idx]['available'] = previous;
          }
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not update stock status on server. Please retry.'),
            backgroundColor: Colors.redAccent,
            duration: Duration(seconds: 2),
          ),
        );
        return;
      }

      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('cached_menu_items', jsonEncode(_menuItems));
      } catch (_) {}

      final isGrocery = _isGroceryMode;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isGrocery
                ? (isAvailable ? '$name is now In Stock' : '$name marked Out of Stock')
                : (isAvailable ? '$name is now Available' : '$name is marked Unavailable'),
          ),
          backgroundColor: AppColors.primaryGreen,
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _deleteMenuItem(String itemId) async {
    final removedIdx = _menuItems.indexWhere((item) => item['_id'] == itemId);
    final removedItem = removedIdx != -1 ? _menuItems[removedIdx] : null;
    setState(() {
      _menuItems.removeWhere((item) => item['_id'] == itemId);
    });

    bool deletedOnServer = false;
    try {
      final prefs = await SharedPreferences.getInstance();
      final restId = prefs.getString('restaurantId') ?? ApiConstants.restaurantId;
      final token = prefs.getString('token') ?? ApiConstants.authToken;
      if (restId.isNotEmpty && itemId.isNotEmpty) {
        final res = await http.post(
          Uri.parse('${ApiConstants.baseUrl}/restaurants/$restId/menu/$itemId/request-delete'),
          headers: {
            'Content-Type': 'application/json',
            if (token.isNotEmpty) 'Authorization': 'Bearer $token',
          },
        ).timeout(const Duration(seconds: 6));
        deletedOnServer = res.statusCode >= 200 && res.statusCode < 300;
      }
    } catch (_) {}

    if (mounted) {
      if (!deletedOnServer && removedItem != null) {
        setState(() {
          _menuItems.insert(removedIdx.clamp(0, _menuItems.length), removedItem);
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to remove item on server. Please retry.'),
            backgroundColor: Colors.redAccent,
            duration: Duration(seconds: 2),
          ),
        );
        return;
      }
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('cached_menu_items', jsonEncode(_menuItems));
      } catch (_) {}

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _isGroceryMode ? 'Product removed from catalog' : 'Menu item deleted successfully',
          ),
          backgroundColor: Colors.redAccent,
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  void _showDeleteConfirmDialog(String itemId, String itemName) {
    final isGrocery = _isGroceryMode;
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(isGrocery ? 'Remove Product' : 'Delete Item', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
        content: Text(
          isGrocery
              ? 'Are you sure you want to remove "$itemName" from your store catalog?'
              : 'Are you sure you want to delete "$itemName" from your menu?',
          style: GoogleFonts.poppins(fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text('Cancel', style: GoogleFonts.poppins(color: Colors.grey[600])),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              _deleteMenuItem(itemId);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            child: Text('Remove', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showStatusDetailDialog(String title, String message, Color headerColor) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(Icons.info_outline_rounded, color: headerColor),
            const SizedBox(width: 8),
            Expanded(child: Text(title, style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16))),
          ],
        ),
        content: Text(
          message.isNotEmpty ? message : 'No further details provided by admin.',
          style: GoogleFonts.poppins(fontSize: 14, color: Colors.grey[800], height: 1.4),
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(dialogContext),
            style: ElevatedButton.styleFrom(
              backgroundColor: headerColor,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: Text('Close', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showExcelImportModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.92,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: ExcelMenuImportSheet(
          onItemsImported: (importedItems) async {
            if (importedItems.isEmpty) return;

            final prefs = await SharedPreferences.getInstance();
            final restId = prefs.getString('restaurantId') ?? ApiConstants.restaurantId;

            List<Map<String, dynamic>> createdList = [];
            try {
              createdList = await MenuApiService.bulkImportMenuItems(restId, importedItems);
            } catch (e) {
              debugPrint("Bulk import API save error: $e");
            }

            if (createdList.isNotEmpty) {
              await _loadMenuFromApi(isSilent: true);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Row(
                      children: [
                        const Icon(Icons.check_circle_rounded, color: Colors.white),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _isGroceryMode
                                ? '${createdList.length} catalog products imported & sent for approval!'
                                : '${createdList.length} menu items imported & saved to database!',
                            style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                    backgroundColor: AppColors.primaryGreen,
                    duration: const Duration(seconds: 3),
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                );
              }
            } else if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Bulk import failed on server. Please check connection and retry.'),
                  backgroundColor: Colors.redAccent,
                  duration: Duration(seconds: 3),
                ),
              );
            }
          },
        ),
      ),
    );
  }

  void _openAddOrEditMenuModal([Map<String, dynamic>? existingItem]) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.9,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: AddOrEditMenuItemForm(
          existingItem: existingItem,
          onItemSaved: (savedItem) async {
            setState(() {
              if (existingItem != null) {
                final index = _menuItems.indexWhere((item) => item['_id'] == existingItem['_id']);
                if (index != -1) {
                  _menuItems[index] = savedItem;
                }
              } else {
                _menuItems.insert(0, savedItem);
              }
            });

            try {
              final prefs = await SharedPreferences.getInstance();
              await prefs.setString('cached_menu_items', jsonEncode(_menuItems));
            } catch (_) {}

            if (mounted) {
              final isGrocery = _isGroceryMode;
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    existingItem != null
                        ? (isGrocery ? 'Product updated successfully!' : 'Menu item updated successfully!')
                        : (isGrocery ? 'New product submitted for admin approval!' : 'New menu item submitted for admin approval!'),
                  ),
                  backgroundColor: AppColors.primaryGreen,
                ),
              );
            }

            _loadMenuFromApi(isSilent: true);
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: PlatformConfigService.modeNotifier,
      builder: (context, _, __) {
        final bool isGrocery = _isGroceryMode;
        return Scaffold(
          backgroundColor: const Color(0xFFF9FAFB),
          body: SafeArea(
            child: Column(
              children: [
                _buildMenuHeaderBanner(isGrocery),
                Expanded(
                  child: _isLoading
                      ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen))
                      : RefreshIndicator(
                          onRefresh: _loadMenuFromApi,
                          color: AppColors.primaryGreen,
                          child: _menuItems.isEmpty
                              ? ListView(
                                  physics: const AlwaysScrollableScrollPhysics(),
                                  children: [
                                    SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                                    Center(
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            isGrocery ? Icons.inventory_2_outlined : Icons.restaurant_menu_rounded,
                                            size: 64,
                                            color: Colors.grey[400],
                                          ),
                                          const SizedBox(height: 16),
                                          Text(
                                            isGrocery ? 'No catalog products found' : 'No menu items found',
                                            style: GoogleFonts.poppins(color: Colors.grey[600], fontSize: 16),
                                          ),
                                          const SizedBox(height: 12),
                                          ElevatedButton.icon(
                                            onPressed: _loadMenuFromApi,
                                            icon: const Icon(Icons.refresh_rounded, size: 16),
                                            label: Text(
                                              isGrocery ? 'Refresh Catalog' : 'Refresh Menu',
                                              style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12),
                                            ),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: AppColors.primaryGreen,
                                              foregroundColor: Colors.white,
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                )
                              : ListView.builder(
                                  physics: const AlwaysScrollableScrollPhysics(),
                                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 90),
                                  itemCount: _menuItems.length,
                                  itemBuilder: (context, index) {
                                    final item = _menuItems[index];
                                    return _buildReferenceMenuCard(item, isGrocery);
                                  },
                                ),
                        ),
                ),
              ],
            ),
          ),
          floatingActionButton: FloatingActionButton.extended(
            heroTag: 'addMenuItemFab',
            onPressed: () => _openAddOrEditMenuModal(),
            backgroundColor: AppColors.primaryGreen,
            foregroundColor: Colors.white,
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
            ),
            icon: const Icon(Icons.add, color: Colors.white, size: 20),
            label: Text(
              isGrocery ? 'Add Product' : 'Add Item',
              style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ),
        );
      },
    );
  }

  Widget _buildMenuHeaderBanner(bool isGrocery) {
    return Container(
      width: double.infinity,
      height: 150,
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: isGrocery
                ? Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppColors.primaryGreen.withValues(alpha: 0.16),
                          const Color(0xFFECFDF5),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                  )
                : Image.asset(
                    'assets/images/restaurant_menu_header_bg.jpg',
                    fit: BoxFit.cover,
                    alignment: Alignment.center,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: AppColors.primaryGreen.withValues(alpha: 0.1),
                    ),
                  ),
          ),
          Positioned.fill(
            child: ClipRect(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                child: Container(
                  color: Colors.white.withValues(alpha: 0.65),
                ),
              ),
            ),
          ),

          // Header Text Content
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  children: [
                    if (Navigator.canPop(context)) ...[
                      IconButton(
                        icon: const Icon(Icons.arrow_back, color: Colors.black87, size: 24),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const SizedBox(width: 4),
                    ],
                    Expanded(
                      child: Text(
                        isGrocery ? 'Catalog & SKU Inventory' : 'Menu Management',
                        style: GoogleFonts.poppins(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.upload_file_rounded, color: AppColors.primaryGreen, size: 26),
                      tooltip: isGrocery ? 'Bulk Import CSV / Excel' : 'Bulk Import Menu',
                      onPressed: _showExcelImportModal,
                    ),
                    IconButton(
                      icon: const Icon(Icons.add_circle_rounded, color: AppColors.primaryGreen, size: 32),
                      tooltip: isGrocery ? 'Add Catalog Product' : 'Add Menu Item',
                      onPressed: () => _openAddOrEditMenuModal(),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  isGrocery
                      ? 'Manage store SKUs, weights, MRP, prices\n& live inventory stock in one place'
                      : 'View, add, edit, or manage all your\nmenu items in one place',
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    color: Colors.grey[700],
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Reference Product / Menu Item Card
  Widget _buildReferenceMenuCard(Map<String, dynamic> item, bool isGrocery) {
    final bool isGroceryItem = isGrocery ||
        (item['vertical']?.toString().toLowerCase() == 'grocery') ||
        (item['sku']?.toString().trim().isNotEmpty == true);
    final bool isAvailable = item['isAvailable'] ?? item['inStock'] ?? true;
    final int stockQty = int.tryParse((item['stockQuantity'] ?? 0).toString()) ?? 0;
    final int lowStockThreshold = int.tryParse((item['lowStockThreshold'] ?? 10).toString()) ?? 10;
    final String sku = (item['sku'] ?? '').toString().trim();
    final String weight = (item['weight'] ?? '').toString().trim();
    final String unit = (item['unit'] ?? '').toString().trim();
    final List<String> flavors = [];
    final rawFlavors = item['flavors'] ?? item['variants'] ?? item['variations'];
    if (!isGroceryItem && rawFlavors is List) {
      for (var f in rawFlavors) {
        if (f is String && f.isNotEmpty) {
          flavors.add(f);
        } else if (f is Map) {
          final n = f['name'];
          if (n is String && n.isNotEmpty) {
            flavors.add(n);
          } else if (n is Map) {
            final s = n['en']?.toString() ?? (n.values.isNotEmpty ? n.values.first.toString() : '');
            if (s.isNotEmpty) flavors.add(s);
          }
        }
      }
    }
    final List<dynamic> addOns = (!isGroceryItem && item['addOns'] is List) ? item['addOns'] : [];

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Main Item Info Row
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product / Item Image
                Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: _buildItemThumbnail(item['image'], isGrocery: isGroceryItem),
                    ),
                    if (!isGroceryItem)
                      Positioned(
                        top: 4,
                        left: 4,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.favorite_border_rounded,
                            size: 14,
                            color: Colors.black54,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 14),

                // Item Details Column
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Approval Status Badge
                      _buildApprovalStatusBadge(item),
                      const SizedBox(height: 4),

                      // Price display with MRP + Selling Price + B2B Price (or Portions for Food)
                      Builder(builder: (context) {
                        if (!isGroceryItem) {
                          final String pType = (item['portionType'] ?? 'none').toString();
                          final Map<String, dynamic>? portions = item['portions'] is Map ? Map<String, dynamic>.from(item['portions']) : null;
                          final bool hasHalfFull = pType == 'half_full' || (portions != null && (portions['half'] != null || portions['full'] != null));
                          final bool hasSizes = pType == 'size' || (portions != null && (portions['small'] != null || portions['medium'] != null || portions['large'] != null));

                          if (hasHalfFull) {
                            final fullP = portions?['full']?['basePrice'] ?? portions?['full']?['price'] ?? portions?['full']?['sellingPrice'];
                            final halfP = portions?['half']?['basePrice'] ?? portions?['half']?['price'] ?? portions?['half']?['sellingPrice'];
                            final List<String> parts = [];
                            if (fullP != null) parts.add('Full: ₹$fullP');
                            if (halfP != null) parts.add('Half: ₹$halfP');
                            return Text(
                              parts.isNotEmpty ? parts.join(' • ') : '₹${item['basePrice'] ?? item['price'] ?? 0}',
                              style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.black),
                            );
                          } else if (hasSizes) {
                            final sP = portions?['small']?['basePrice'] ?? portions?['small']?['price'] ?? portions?['small']?['sellingPrice'];
                            final mP = portions?['medium']?['basePrice'] ?? portions?['medium']?['price'] ?? portions?['medium']?['sellingPrice'];
                            final lP = portions?['large']?['basePrice'] ?? portions?['large']?['price'] ?? portions?['large']?['sellingPrice'];
                            final List<String> parts = [];
                            if (sP != null) parts.add('S: ₹$sP');
                            if (mP != null) parts.add('M: ₹$mP');
                            if (lP != null) parts.add('L: ₹$lP');
                            return Text(
                              parts.isNotEmpty ? parts.join(' • ') : '₹${item['basePrice'] ?? item['price'] ?? 0}',
                              style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.black),
                            );
                          }
                        }

                        final rawSelling = item['sellingPrice'] ?? item['b2cSellingPrice'] ?? item['basePrice'] ?? item['price'] ?? 0.0;
                        final rawMrp = item['mrp'] ?? item['b2cMrp'] ?? rawSelling;
                        final rawB2b = item['b2bPrice'] ?? item['b2bSellingPrice'] ?? 0.0;
                        final double sellingVal = rawSelling is num ? rawSelling.toDouble() : (double.tryParse(rawSelling.toString()) ?? 0.0);
                        final double mrpVal = rawMrp is num ? rawMrp.toDouble() : (double.tryParse(rawMrp.toString()) ?? sellingVal);
                        final double b2bVal = rawB2b is num ? rawB2b.toDouble() : (double.tryParse(rawB2b.toString()) ?? 0.0);

                        return Wrap(
                          crossAxisAlignment: WrapCrossAlignment.center,
                          spacing: 6,
                          runSpacing: 2,
                          children: [
                            Text(
                              '₹${sellingVal.toStringAsFixed(sellingVal % 1 == 0 ? 0 : 2)}',
                              style: GoogleFonts.poppins(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                              ),
                            ),
                            if (mrpVal > sellingVal)
                              Text(
                                'MRP ₹${mrpVal.toStringAsFixed(mrpVal % 1 == 0 ? 0 : 2)}',
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  color: Colors.grey[500],
                                  decoration: TextDecoration.lineThrough,
                                ),
                              ),
                            if (isGroceryItem && b2bVal > 0 && b2bVal != sellingVal)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                decoration: BoxDecoration(
                                  color: Colors.blue.shade50,
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: Colors.blue.shade200),
                                ),
                                child: Text(
                                  'B2B ₹${b2bVal.toStringAsFixed(b2bVal % 1 == 0 ? 0 : 2)}',
                                  style: GoogleFonts.poppins(fontSize: 9, fontWeight: FontWeight.w600, color: Colors.blue.shade800),
                                ),
                              ),
                          ],
                        );
                      }),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          if (!isGroceryItem) ...[
                            Container(
                              width: 10,
                              height: 10,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: item['foodType'] == 'veg' ? Colors.green : (item['foodType'] == 'egg' ? Colors.orange : Colors.red),
                              ),
                            ),
                            const SizedBox(width: 6),
                          ],
                          Expanded(
                            child: Text(
                              item['name'] ?? '',
                              style: GoogleFonts.poppins(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                              ),
                            ),
                          ),
                        ],
                      ),

                      if (isGroceryItem) ...[
                        const SizedBox(height: 4),
                        Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          children: [
                            if (weight.isNotEmpty || unit.isNotEmpty)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryGreen.withValues(alpha: 0.08),
                                  borderRadius: BorderRadius.circular(5),
                                  border: Border.all(color: AppColors.primaryGreen.withValues(alpha: 0.25)),
                                ),
                                child: Text(
                                  '${weight.isNotEmpty ? '$weight ' : ''}${unit.isNotEmpty ? unit : 'pack'}',
                                  style: GoogleFonts.poppins(fontSize: 9.5, fontWeight: FontWeight.w600, color: AppColors.primaryGreen),
                                ),
                              ),
                            if (sku.isNotEmpty)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.grey[100],
                                  borderRadius: BorderRadius.circular(5),
                                  border: Border.all(color: Colors.grey[300]!),
                                ),
                                child: Text(
                                  'SKU: $sku',
                                  style: GoogleFonts.poppins(fontSize: 9.5, fontWeight: FontWeight.w500, color: Colors.grey[700]),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: stockQty <= 0
                                    ? const Color(0xFFFEE2E2)
                                    : (stockQty <= lowStockThreshold ? const Color(0xFFFEF3C7) : const Color(0xFFECFDF5)),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: stockQty <= 0
                                      ? const Color(0xFFFCA5A5)
                                      : (stockQty <= lowStockThreshold ? const Color(0xFFFDE68A) : const Color(0xFFA7F3D0)),
                                ),
                              ),
                              child: Text(
                                stockQty <= 0 ? 'Out of Stock (0)' : 'Stock: $stockQty',
                                style: GoogleFonts.poppins(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: stockQty <= 0
                                      ? const Color(0xFFB91C1C)
                                      : (stockQty <= lowStockThreshold ? const Color(0xFFB45309) : const Color(0xFF047857)),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            InkWell(
                              onTap: () => _adjustStock(item, -1),
                              borderRadius: BorderRadius.circular(6),
                              child: Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  color: Colors.grey[100],
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: Colors.grey[300]!),
                                ),
                                child: const Icon(Icons.remove, size: 14, color: Colors.black87),
                              ),
                            ),
                            const SizedBox(width: 4),
                            InkWell(
                              onTap: () => _adjustStock(item, 1),
                              borderRadius: BorderRadius.circular(6),
                              child: Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  color: AppColors.primaryGreen.withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: AppColors.primaryGreen.withValues(alpha: 0.4)),
                                ),
                                child: const Icon(Icons.add, size: 14, color: AppColors.primaryGreen),
                              ),
                            ),
                          ],
                        ),
                      ],

                      // Food-only badges for Half/Full, Sizes, Add-ons
                      if (!isGroceryItem)
                        Builder(builder: (context) {
                          final String pType = (item['portionType'] ?? 'none').toString();
                          final Map<String, dynamic>? portions = item['portions'] is Map ? Map<String, dynamic>.from(item['portions']) : null;
                          final bool hasHalfFull = pType == 'half_full' || (portions != null && (portions['half'] != null || portions['full'] != null));
                          final bool hasSizes = pType == 'size' || (portions != null && (portions['small'] != null || portions['medium'] != null || portions['large'] != null));
                          final List<dynamic> aoList = item['addOns'] is List ? item['addOns'] : (item['addons'] is List ? item['addons'] : []);

                          if (!hasHalfFull && !hasSizes && aoList.isEmpty) return const SizedBox.shrink();

                          return Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Wrap(
                              spacing: 4,
                              runSpacing: 4,
                              children: [
                                if (hasHalfFull)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                    decoration: BoxDecoration(
                                      color: Colors.amber.shade50,
                                      borderRadius: BorderRadius.circular(4),
                                      border: Border.all(color: Colors.amber.shade200),
                                    ),
                                    child: Text('Half/Full', style: GoogleFonts.poppins(fontSize: 8.5, fontWeight: FontWeight.bold, color: Colors.amber.shade900)),
                                  ),
                                if (hasSizes)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                    decoration: BoxDecoration(
                                      color: Colors.purple.shade50,
                                      borderRadius: BorderRadius.circular(4),
                                      border: Border.all(color: Colors.purple.shade200),
                                    ),
                                    child: Text('S/M/L Sizes', style: GoogleFonts.poppins(fontSize: 8.5, fontWeight: FontWeight.bold, color: Colors.purple.shade900)),
                                  ),
                                if (aoList.isNotEmpty)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                    decoration: BoxDecoration(
                                      color: Colors.indigo.shade50,
                                      borderRadius: BorderRadius.circular(4),
                                      border: Border.all(color: Colors.indigo.shade200),
                                    ),
                                    child: Text('+${aoList.length} Add-ons', style: GoogleFonts.poppins(fontSize: 8.5, fontWeight: FontWeight.bold, color: Colors.indigo.shade900)),
                                  ),
                              ],
                            ),
                          );
                        }),
                      if (item['category'] != null && item['category'].toString().isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          '${item['category']}${item['subcategory'] != null && item['subcategory'].toString().isNotEmpty ? ' • ${item['subcategory']}' : ''}',
                          style: GoogleFonts.poppins(fontSize: 10, color: AppColors.primaryGreen, fontWeight: FontWeight.w600),
                        ),
                      ],
                      const SizedBox(height: 4),
                      Text(
                        item['description'] ?? '',
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),

                // Availability Switch Column
                Column(
                  children: [
                    Switch(
                      value: isAvailable,
                      activeThumbColor: AppColors.primaryGreen,
                      onChanged: (val) {
                        _toggleAvailability(item['_id'], val, item['name']);
                      },
                    ),
                    Text(
                      isGroceryItem
                          ? (isAvailable ? 'In Stock' : 'Out of Stock')
                          : (isAvailable ? 'Available' : 'Unavailable'),
                      style: GoogleFonts.poppins(
                        fontSize: 9,
                        color: isAvailable ? AppColors.primaryGreen : Colors.grey,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Choice of Flavor Section (Food only)
          if (!isGroceryItem && flavors.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Choice of Flavor (${flavors.length})',
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => _openAddOrEditMenuModal(item),
                    child: Text(
                      'Manage',
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 6),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: flavors.map((flavor) {
                  return GestureDetector(
                    onTap: () => _openAddOrEditMenuModal(item),
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF9FAFB),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.grey[300]!, width: 1),
                      ),
                      child: Text(
                        flavor,
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          color: Colors.black87,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Add-Ons Section (Food only)
          if (!isGroceryItem && addOns.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Add-Ons (${addOns.length})',
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => _openAddOrEditMenuModal(item),
                    child: Text(
                      'Manage',
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 6),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: addOns.map((addOn) {
                  final String name = addOn['name'] ?? 'Add-on';
                  final double price = (addOn['price'] ?? 0.0).toDouble();
                  final String img = (addOn['image'] ?? '').toString().trim();

                  return GestureDetector(
                    onTap: () => _openAddOrEditMenuModal(item),
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.fromLTRB(10, 6, 6, 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF9FAFB),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.grey[200]!, width: 1),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '₹ ${price.toStringAsFixed(2)}',
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black,
                                ),
                              ),
                              Text(
                                name,
                                style: GoogleFonts.poppins(
                                  fontSize: 10,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(width: 8),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(6),
                            child: img.startsWith('http')
                                ? Image.network(
                                    img,
                                    width: 28,
                                    height: 28,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Container(
                                      width: 28,
                                      height: 28,
                                      color: Colors.grey[200],
                                      child: const Icon(Icons.add_box_outlined, size: 16, color: Colors.grey),
                                    ),
                                  )
                                : img.startsWith('assets/')
                                    ? Image.asset(
                                        img,
                                        width: 28,
                                        height: 28,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) => Container(
                                          width: 28,
                                          height: 28,
                                          color: Colors.grey[200],
                                          child: const Icon(Icons.add_box_outlined, size: 16, color: Colors.grey),
                                        ),
                                      )
                                    : Container(
                                        width: 28,
                                        height: 28,
                                        color: Colors.grey[200],
                                        child: const Icon(Icons.add_box_outlined, size: 16, color: Colors.grey),
                                      ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Card Action Buttons (Delete & Edit)
          const Divider(height: 1, color: Color(0xFFEEEEEE)),
          Row(
            children: [
              Expanded(
                child: TextButton.icon(
                  onPressed: () => _showDeleteConfirmDialog(item['_id'], item['name']),
                  icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 18),
                  label: Text(
                    isGroceryItem ? 'Remove' : 'Delete',
                    style: GoogleFonts.poppins(
                      color: Colors.redAccent,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
              Container(width: 1, height: 28, color: const Color(0xFFEEEEEE)),
              Expanded(
                child: TextButton.icon(
                  onPressed: () => _openAddOrEditMenuModal(item),
                  icon: const Icon(Icons.edit_outlined, color: AppColors.primaryGreen, size: 18),
                  label: Text(
                    'Edit',
                    style: GoogleFonts.poppins(
                      color: AppColors.primaryGreen,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildApprovalStatusBadge(Map<String, dynamic> item) {
    final status = (item['approvalStatus'] ?? (item['isApproved'] == true ? 'approved' : (item['isRejected'] == true ? 'rejected' : 'pending'))).toString().toLowerCase();
    final rejectionReason = item['rejectionReason']?.toString() ?? '';
    final changeRequest = item['changeRequest']?.toString() ?? '';

    if (status == 'approved') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: const Color(0xFFDCFCE7),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: const Color(0xFF86EFAC)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle_rounded, size: 12, color: Color(0xFF16A34A)),
            const SizedBox(width: 4),
            Text(
              'Approved & Live',
              style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF15803D)),
            ),
          ],
        ),
      );
    } else if (status == 'rejected') {
      return GestureDetector(
        onTap: () => _showStatusDetailDialog('Rejection Reason', rejectionReason, Colors.redAccent),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: const Color(0xFFFEE2E2),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: const Color(0xFFFCA5A5)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.cancel_rounded, size: 12, color: Colors.redAccent),
              const SizedBox(width: 4),
              Text(
                'Rejected (Tap for reason)',
                style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFFB91C1C)),
              ),
            ],
          ),
        ),
      );
    } else if (status == 'changes_requested') {
      return GestureDetector(
        onTap: () => _showStatusDetailDialog('Changes Requested', changeRequest, Colors.blueAccent),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: const Color(0xFFDBEAFE),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: const Color(0xFF93C5FD)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.info_outline_rounded, size: 12, color: Color(0xFF2563EB)),
              const SizedBox(width: 4),
              Text(
                'Changes Requested (Tap for note)',
                style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF1D4ED8)),
              ),
            ],
          ),
        ),
      );
    }

    // Pending review
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF3C7),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.hourglass_empty_rounded, size: 12, color: Color(0xFFD97706)),
          const SizedBox(width: 4),
          Text(
            'Pending Admin Approval',
            style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFFB45309)),
          ),
        ],
      ),
    );
  }

  Widget _buildItemThumbnail(String? rawImagePath, {bool isGrocery = false}) {
    final IconData placeholderIcon = isGrocery ? Icons.inventory_2_outlined : Icons.fastfood;
    if (rawImagePath == null || rawImagePath.isEmpty) {
      return Container(
        width: 80,
        height: 80,
        color: Colors.grey[200],
        child: Icon(placeholderIcon, color: Colors.grey, size: 30),
      );
    }
    String imagePath = rawImagePath.trim();
    if (imagePath.startsWith('data:image')) {
      try {
        final base64Data = imagePath.split(',').last;
        final bytes = base64Decode(base64Data);
        return Image.memory(bytes, width: 80, height: 80, fit: BoxFit.cover);
      } catch (_) {}
    }
    if (!imagePath.startsWith('http') && !imagePath.startsWith('assets/')) {
      final baseOrigin = ApiConstants.baseUrl.replaceAll(RegExp(r'/api(/v1)?/?$'), '');
      imagePath = imagePath.startsWith('/') ? '$baseOrigin$imagePath' : '$baseOrigin/$imagePath';
    }
    if (imagePath.startsWith('http')) {
      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android && imagePath.contains('localhost')) {
        imagePath = imagePath.replaceAll('localhost', '10.0.2.2');
      }
      return Image.network(
        imagePath,
        width: 80,
        height: 80,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => Container(
          width: 80,
          height: 80,
          color: Colors.grey[200],
          child: Icon(placeholderIcon, color: Colors.grey),
        ),
      );
    }
    return Image.asset(
      imagePath,
      width: 80,
      height: 80,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) => Container(
        width: 80,
        height: 80,
        color: Colors.grey[200],
        child: Icon(placeholderIcon, color: Colors.grey),
      ),
    );
  }
}

// Add or Edit Menu Item Form Component matching Reference Image 2 with Modal Flow
class AddOrEditMenuItemForm extends StatefulWidget {
  final Map<String, dynamic>? existingItem;
  final Function(Map<String, dynamic>) onItemSaved;

  const AddOrEditMenuItemForm({
    super.key,
    this.existingItem,
    required this.onItemSaved,
  });

  @override
  State<AddOrEditMenuItemForm> createState() => _AddOrEditMenuItemFormState();
}

class _AddOrEditMenuItemFormState extends State<AddOrEditMenuItemForm> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _descController;
  late TextEditingController _priceController;
  late TextEditingController _mrpController;
  late TextEditingController _b2bPriceController;
  late TextEditingController _prepTimeController;
  late TextEditingController _skuController;
  late TextEditingController _weightController;
  late TextEditingController _stockQtyController;
  late TextEditingController _lowStockThresholdController;

  String _portionType = 'none'; // 'none', 'half_full', 'size'
  late TextEditingController _fullPriceController;
  late TextEditingController _fullMrpController;
  late TextEditingController _fullB2bPriceController;
  late TextEditingController _halfPriceController;
  late TextEditingController _halfMrpController;
  late TextEditingController _halfB2bPriceController;
  late TextEditingController _smallPriceController;
  late TextEditingController _smallMrpController;
  late TextEditingController _smallB2bPriceController;
  late TextEditingController _medPriceController;
  late TextEditingController _medMrpController;
  late TextEditingController _medB2bPriceController;
  late TextEditingController _largePriceController;
  late TextEditingController _largeMrpController;
  late TextEditingController _largeB2bPriceController;

  static const List<String> _unitOptions = ['g', 'kg', 'ml', 'L', 'pack', 'piece', 'dozen'];
  String _selectedUnit = 'pack';
  String _selectedCategory = 'Staples & Grains';
  String _selectedSubcategory = 'Rice & Atta';
  String _foodType = 'Veg'; // 'Veg', 'Non-Veg', or 'Egg'
  Uint8List? _selectedImageBytes;
  String? _existingImagePath;
  bool _isSaving = false;

  List<String> _flavorVariants = [];
  List<Map<String, dynamic>> _addOnsList = [];
  Map<String, String> _categoryIdsMap = {};

  bool get _isGroceryMode =>
      PlatformConfigService.isGroceryPlatform ||
      (PlatformConfigService.isBothMode && RestaurantAuthService.isGroceryStore);

  List<String> _categories = [
    'Staples & Grains',
    'Dairy & Bread',
    'Fruits & Vegetables',
    'Beverages',
    'Snacks & Packaged',
    'Personal & Home Care',
    'Daily Essentials',
  ];

  Map<String, List<String>> _subcategoriesMap = {
    'Staples & Grains': ['Rice & Atta', 'Dal & Pulses', 'Edible Oils & Ghee', 'Spices & Masala'],
    'Dairy & Bread': ['Milk & Curd', 'Paneer & Butter', 'Bread & Buns', 'Eggs'],
    'Fruits & Vegetables': ['Fresh Vegetables', 'Fresh Fruits', 'Herbs & Leafy Greens'],
    'Beverages': ['Cold Drinks & Juices', 'Tea & Coffee', 'Health Drinks'],
    'Snacks & Packaged': ['Chips & Namkeen', 'Biscuits & Cookies', 'Noodles & Sauces'],
    'Personal & Home Care': ['Detergents & Cleaners', 'Bath & Body', 'Oral Care'],
    'Daily Essentials': ['General', 'Kitchen Supplies'],
  };

  @override
  void initState() {
    super.initState();
    final bool isGrocery = _isGroceryMode;
    if (!isGrocery) {
      _categories = [
        'Main Course',
        'Starters',
        'Pizzas & Burgers',
        'Breads & Rice',
        'Desserts',
        'Beverages',
      ];
      _subcategoriesMap = {
        'Main Course': ['Paneer Specialties', 'Chicken Specialties', 'Dal & Curry', 'Biryani & Rice'],
        'Starters': ['Veg Starters', 'Non-Veg Starters', 'Tandoori Starters', 'Chinese Starters'],
        'Pizzas & Burgers': ['Thin Crust Pizza', 'Cheese Burst Pizza', 'Veg Burger', 'Chicken Burger'],
        'Breads & Rice': ['Naan & Roti', 'Fried Rice', 'Steamed Rice'],
        'Desserts': ['Ice Creams', 'Sweets & Gulab Jamun', 'Pastries'],
        'Beverages': ['Mocktails', 'Shakes & Smoothies', 'Cold Drinks'],
      };
      _selectedCategory = 'Main Course';
      _selectedSubcategory = 'Paneer Specialties';
    }

    final item = widget.existingItem;
    _nameController = TextEditingController(text: item?['name'] ?? '');
    _descController = TextEditingController(text: item?['description'] ?? '');
    _priceController = TextEditingController(
      text: item?['sellingPrice'] != null
          ? item!['sellingPrice'].toString()
          : (item?['basePrice'] != null ? item!['basePrice'].toString() : (item?['price'] != null ? item!['price'].toString() : '')),
    );
    _mrpController = TextEditingController(
      text: item?['mrp'] != null ? item!['mrp'].toString() : (item?['b2cMrp'] != null ? item!['b2cMrp'].toString() : _priceController.text),
    );
    _b2bPriceController = TextEditingController(
      text: item?['b2bPrice'] != null ? item!['b2bPrice'].toString() : _priceController.text,
    );
    _prepTimeController = TextEditingController(
      text: item?['preparationTime'] != null ? item!['preparationTime'].toString() : (isGrocery ? '5' : '15'),
    );
    _skuController = TextEditingController(text: item?['sku']?.toString() ?? '');
    _weightController = TextEditingController(text: item?['weight']?.toString() ?? '');
    _stockQtyController = TextEditingController(
      text: item?['stockQuantity'] != null ? item!['stockQuantity'].toString() : '50',
    );
    _lowStockThresholdController = TextEditingController(
      text: item?['lowStockThreshold'] != null ? item!['lowStockThreshold'].toString() : '10',
    );
    final rawUnit = (item?['unit'] ?? 'pack').toString().trim();
    _selectedUnit = _unitOptions.contains(rawUnit) ? rawUnit : 'pack';

    // Portions detection & controllers initialization (food mode)
    final portions = item?['portions'] is Map ? Map<String, dynamic>.from(item!['portions']) : null;
    final pType = isGrocery
        ? 'none'
        : (item?['portionType']?.toString() ??
            (portions != null && (portions['half'] != null || portions['full'] != null)
                ? 'half_full'
                : (portions != null && (portions['small'] != null || portions['medium'] != null || portions['large'] != null)
                    ? 'size'
                    : 'none')));
    _portionType = pType;

    _fullPriceController = TextEditingController(text: (portions?['full']?['basePrice'] ?? portions?['full']?['price'] ?? portions?['full']?['sellingPrice'])?.toString() ?? '');
    _fullMrpController = TextEditingController(text: portions?['full']?['mrp']?.toString() ?? '');
    _fullB2bPriceController = TextEditingController(text: portions?['full']?['b2bPrice']?.toString() ?? '');

    _halfPriceController = TextEditingController(text: (portions?['half']?['basePrice'] ?? portions?['half']?['price'] ?? portions?['half']?['sellingPrice'])?.toString() ?? '');
    _halfMrpController = TextEditingController(text: portions?['half']?['mrp']?.toString() ?? '');
    _halfB2bPriceController = TextEditingController(text: portions?['half']?['b2bPrice']?.toString() ?? '');

    _smallPriceController = TextEditingController(text: (portions?['small']?['basePrice'] ?? portions?['small']?['price'] ?? portions?['small']?['sellingPrice'])?.toString() ?? '');
    _smallMrpController = TextEditingController(text: portions?['small']?['mrp']?.toString() ?? '');
    _smallB2bPriceController = TextEditingController(text: portions?['small']?['b2bPrice']?.toString() ?? '');

    _medPriceController = TextEditingController(text: (portions?['medium']?['basePrice'] ?? portions?['medium']?['price'] ?? portions?['medium']?['sellingPrice'])?.toString() ?? '');
    _medMrpController = TextEditingController(text: portions?['medium']?['mrp']?.toString() ?? '');
    _medB2bPriceController = TextEditingController(text: portions?['medium']?['b2bPrice']?.toString() ?? '');

    _largePriceController = TextEditingController(text: (portions?['large']?['basePrice'] ?? portions?['large']?['price'] ?? portions?['large']?['sellingPrice'])?.toString() ?? '');
    _largeMrpController = TextEditingController(text: portions?['large']?['mrp']?.toString() ?? '');
    _largeB2bPriceController = TextEditingController(text: portions?['large']?['b2bPrice']?.toString() ?? '');

    if (item != null) {
      final rawCat = (item['category'] ?? '').toString().trim();
      if (rawCat.isNotEmpty) {
        if (!_categories.contains(rawCat)) {
          _categories.insert(0, rawCat);
        }
        _selectedCategory = rawCat;
      }
      final rawSub = (item['subcategory'] ?? '').toString().trim();
      final subsForCat = _subcategoriesMap[_selectedCategory] ?? ['General'];
      _selectedSubcategory = rawSub.isNotEmpty ? rawSub : subsForCat.first;
      if (!_subcategoriesMap.containsKey(_selectedCategory)) {
        _subcategoriesMap[_selectedCategory] = [_selectedSubcategory];
      } else if (!_subcategoriesMap[_selectedCategory]!.contains(_selectedSubcategory)) {
        _subcategoriesMap[_selectedCategory]!.insert(0, _selectedSubcategory);
      }

      final rawFt = (item['foodType'] ?? 'veg').toString().toLowerCase();
      _foodType = rawFt == 'egg' ? 'Egg' : (rawFt == 'non-veg' ? 'Non-Veg' : 'Veg');
      _existingImagePath = item['image']?.toString();
      if (item['flavors'] != null && item['flavors'] is List) {
        final List<String> fList = [];
        for (var f in (item['flavors'] as List)) {
          if (f is String && f.isNotEmpty) {
            fList.add(f);
          } else if (f is Map) {
            final n = f['name'];
            if (n is String && n.isNotEmpty) {
              fList.add(n);
            } else if (n is Map) {
              final s = n['en']?.toString() ?? (n.values.isNotEmpty ? n.values.first.toString() : '');
              if (s.isNotEmpty) fList.add(s);
            }
          }
        }
        _flavorVariants = fList;
      }
      if (item['addOns'] != null && item['addOns'] is List) {
        final List<Map<String, dynamic>> aList = [];
        for (var a in (item['addOns'] as List)) {
          if (a is Map) {
            final n = a['name'];
            String aName = n is String ? n : (n is Map ? (n['en']?.toString() ?? (n.values.isNotEmpty ? n.values.first.toString() : '')) : '');
            aList.add({
              'name': aName.isNotEmpty ? aName : 'Add-on',
              'price': double.tryParse((a['price'] ?? 0).toString()) ?? 0.0,
              'image': a['image']?.toString() ?? '',
            });
          }
        }
        _addOnsList = aList;
      }
    }
    _loadLiveCategories();
  }

  Future<void> _loadLiveCategories() async {
    try {
      final tree = await CategoryApiService.fetchCategoryTree(
        vertical: _isGroceryMode ? 'grocery' : 'food',
      );
      if (tree.isNotEmpty && mounted) {
        final newCats = <String>[];
        final newCategoryIdsMap = <String, String>{};
        final newSubMap = <String, List<String>>{};
        for (var c in tree) {
          if (c.name.isNotEmpty) {
            newCats.add(c.name);
            if (c.id.isNotEmpty) {
              newCategoryIdsMap[c.name] = c.id;
            }
            final subs = c.subcategories.map((s) => s.name).where((n) => n.isNotEmpty).toList();
            newSubMap[c.name] = subs.isNotEmpty ? subs : ['General'];
          }
        }
        if (newCats.isNotEmpty) {
          setState(() {
            _categories = newCats;
            _categoryIdsMap = newCategoryIdsMap;
            if (widget.existingItem != null && _selectedCategory.isNotEmpty && !_categories.contains(_selectedCategory)) {
              _categories.insert(0, _selectedCategory);
            } else if (!_categories.contains(_selectedCategory)) {
              _selectedCategory = _categories.first;
            }
            _subcategoriesMap = newSubMap;
            final currentSubs = _subcategoriesMap[_selectedCategory] ?? ['General'];
            if (!currentSubs.contains(_selectedSubcategory)) {
              _selectedSubcategory = currentSubs.first;
            }
          });
        }
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    _priceController.dispose();
    _mrpController.dispose();
    _b2bPriceController.dispose();
    _prepTimeController.dispose();
    _skuController.dispose();
    _weightController.dispose();
    _stockQtyController.dispose();
    _lowStockThresholdController.dispose();
    _fullPriceController.dispose();
    _fullMrpController.dispose();
    _fullB2bPriceController.dispose();
    _halfPriceController.dispose();
    _halfMrpController.dispose();
    _halfB2bPriceController.dispose();
    _smallPriceController.dispose();
    _smallMrpController.dispose();
    _smallB2bPriceController.dispose();
    _medPriceController.dispose();
    _medMrpController.dispose();
    _medB2bPriceController.dispose();
    _largePriceController.dispose();
    _largeMrpController.dispose();
    _largeB2bPriceController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(source: ImageSource.gallery, maxWidth: 800, maxHeight: 800);

      if (pickedFile != null) {
        final bytes = await pickedFile.readAsBytes();
        if (!mounted) return;
        setState(() {
          _selectedImageBytes = bytes;
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to pick image: $e')),
      );
    }
  }

  // --- MODAL 1: Flavour Variants List Modal (Reference Image 1) ---
  void _showFlavourVariantsListModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.75,
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  // Close Icon Button
                  Align(
                    alignment: Alignment.center,
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: const BoxDecoration(
                        color: Color(0xFFF3F4F6),
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        padding: EdgeInsets.zero,
                        icon: const Icon(Icons.close, color: Colors.black87, size: 20),
                        onPressed: () => Navigator.pop(modalContext),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Title
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Flavour Variants (${_flavorVariants.length})',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // List of Variants with Edit & Delete Buttons
                  Expanded(
                    child: ListView.builder(
                      physics: const BouncingScrollPhysics(),
                      itemCount: _flavorVariants.length,
                      itemBuilder: (context, index) {
                        final variant = _flavorVariants[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: const BoxDecoration(
                            border: Border(bottom: BorderSide(color: Color(0xFFF0F0F0))),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                variant,
                                style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.black87,
                                ),
                              ),
                              Row(
                                children: [
                                  // Edit Chip Button
                                  GestureDetector(
                                    onTap: () {
                                      _showEditFlavourVariantDialog(
                                        index: index,
                                        currentName: variant,
                                        onUpdated: (newName) {
                                          setState(() => _flavorVariants[index] = newName);
                                          setModalState(() {});
                                        },
                                      );
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF9FAFB),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: Colors.grey[300]!),
                                      ),
                                      child: Row(
                                        children: [
                                          const Icon(Icons.edit_outlined, size: 14, color: Colors.black87),
                                          const SizedBox(width: 4),
                                          Text('Edit', style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w500)),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),

                                  // Delete Close Button
                                  GestureDetector(
                                    onTap: () {
                                      setState(() => _flavorVariants.removeAt(index));
                                      setModalState(() {});
                                    },
                                    child: const Icon(Icons.cancel_outlined, color: Colors.grey, size: 22),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Bottom Update Button (Brand Primary Green)
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(modalContext),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text(
                        'Update',
                        style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // --- MODAL 2: Add-Ons List Modal (Reference Image 2) ---
  void _showAddOnsListModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.75,
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  // Close Icon Button
                  Align(
                    alignment: Alignment.center,
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: const BoxDecoration(
                        color: Color(0xFFF3F4F6),
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        padding: EdgeInsets.zero,
                        icon: const Icon(Icons.close, color: Colors.black87, size: 20),
                        onPressed: () => Navigator.pop(modalContext),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Title
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Add-Ons (${_addOnsList.length})',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // List of Add-ons with Image, Price, Edit & Delete Buttons
                  Expanded(
                    child: ListView.builder(
                      physics: const BouncingScrollPhysics(),
                      itemCount: _addOnsList.length,
                      itemBuilder: (context, index) {
                        final addOn = _addOnsList[index];
                        final String name = addOn['name'] ?? 'Add-on';
                        final double price = (addOn['price'] ?? 25.0).toDouble();
                        final String img = (addOn['image'] ?? '').toString().trim();

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          decoration: const BoxDecoration(
                            border: Border(bottom: BorderSide(color: Color(0xFFF0F0F0))),
                          ),
                          child: Row(
                            children: [
                              // Add-on Image Thumbnail
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: img.startsWith('http')
                                    ? Image.network(
                                        img,
                                        width: 44,
                                        height: 44,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) => Container(
                                          width: 44,
                                          height: 44,
                                          color: Colors.grey[200],
                                          child: const Icon(Icons.add_box_outlined, size: 20, color: Colors.grey),
                                        ),
                                      )
                                    : img.startsWith('assets/')
                                        ? Image.asset(
                                            img,
                                            width: 44,
                                            height: 44,
                                            fit: BoxFit.cover,
                                            errorBuilder: (context, error, stackTrace) => Container(
                                              width: 44,
                                              height: 44,
                                              color: Colors.grey[200],
                                              child: const Icon(Icons.add_box_outlined, size: 20, color: Colors.grey),
                                            ),
                                          )
                                        : Container(
                                            width: 44,
                                            height: 44,
                                            color: Colors.grey[200],
                                            child: const Icon(Icons.add_box_outlined, size: 20, color: Colors.grey),
                                          ),
                              ),
                              const SizedBox(width: 12),

                              // Name & Price
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '₹ ${price.toStringAsFixed(2)}',
                                      style: GoogleFonts.poppins(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.black,
                                      ),
                                    ),
                                    Text(
                                      name,
                                      style: GoogleFonts.poppins(
                                        fontSize: 11,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              // Edit & Delete Actions
                              Row(
                                children: [
                                  // Edit Button
                                  GestureDetector(
                                    onTap: () {
                                      _showEditAddOnDialog(
                                        index: index,
                                        currentAddOn: addOn,
                                        onUpdated: (newAddOn) {
                                          setState(() => _addOnsList[index] = newAddOn);
                                          setModalState(() {});
                                        },
                                      );
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF9FAFB),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: Colors.grey[300]!),
                                      ),
                                      child: Row(
                                        children: [
                                          const Icon(Icons.edit_outlined, size: 14, color: Colors.black87),
                                          const SizedBox(width: 4),
                                          Text('Edit', style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w500)),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),

                                  // Delete Close Button
                                  GestureDetector(
                                    onTap: () {
                                      setState(() => _addOnsList.removeAt(index));
                                      setModalState(() {});
                                    },
                                    child: const Icon(Icons.cancel_outlined, color: Colors.grey, size: 22),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Bottom Update Button (Brand Primary Green)
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(modalContext),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text(
                        'Update',
                        style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // --- MODAL 4: Edit Flavour Variant Form Dialog (Reference Image 4) ---
  void _showEditFlavourVariantDialog({
    int? index,
    String? currentName,
    Function(String)? onUpdated,
  }) {
    final controller = TextEditingController(text: currentName ?? '');
    showDialog(
      context: context,
      builder: (dialogContext) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        backgroundColor: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                index != null ? 'Edit Flavour Variants' : 'Add Flavour Variant',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Flavour Name',
                style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: controller,
                decoration: InputDecoration(
                  hintText: 'Enter Flavour name',
                  hintStyle: GoogleFonts.poppins(fontSize: 13, color: Colors.grey[400]),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                ),
              ),
              const SizedBox(height: 24),

              // Update Button
              SizedBox(
                width: double.infinity,
                height: 46,
                child: ElevatedButton(
                  onPressed: () {
                    final newName = controller.text.trim();
                    if (newName.isNotEmpty) {
                      if (onUpdated != null) {
                        onUpdated(newName);
                      } else {
                        setState(() => _flavorVariants.add(newName));
                      }
                    }
                    Navigator.pop(dialogContext);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text(
                    index != null ? 'Update' : 'Add',
                    style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // Cancel Button
              SizedBox(
                width: double.infinity,
                height: 46,
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: Colors.grey[400]!),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text(
                    'Cancel',
                    style: GoogleFonts.poppins(color: Colors.black87, fontWeight: FontWeight.w600, fontSize: 14),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- MODAL 3: Edit Add-On Form Dialog ---
  void _showEditAddOnDialog({
    int? index,
    Map<String, dynamic>? currentAddOn,
    Function(Map<String, dynamic>)? onUpdated,
  }) {
    final nameCtrl = TextEditingController(text: currentAddOn?['name'] ?? '');
    final priceCtrl = TextEditingController(
      text: currentAddOn?['price'] != null ? currentAddOn!['price'].toString() : '',
    );
    String imgPath = (currentAddOn?['image'] ?? '').toString();

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          backgroundColor: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  index != null ? 'Edit Add-ons' : 'Add New Add-on',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
                const SizedBox(height: 16),

                GestureDetector(
                  onTap: () async {
                    final picker = ImagePicker();
                    final picked = await picker.pickImage(source: ImageSource.gallery);
                    if (picked != null) {
                      final bytes = await picked.readAsBytes();
                      setDialogState(() {
                        imgPath = 'data:image/jpeg;base64,${base64Encode(bytes)}';
                      });
                    }
                  },
                  child: Container(
                    width: double.infinity,
                    height: 100,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.primaryGreen.withValues(alpha: 0.5), width: 1.5),
                    ),
                    child: imgPath.startsWith('data:image')
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(11),
                            child: Image.memory(base64Decode(imgPath.split(',').last), fit: BoxFit.cover),
                          )
                        : Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.upload_outlined, color: AppColors.primaryGreen, size: 24),
                              const SizedBox(height: 4),
                              Text('Upload Image', style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[600], fontWeight: FontWeight.w500)),
                            ],
                          ),
                  ),
                ),
                const SizedBox(height: 14),

                Text('Add-on Name', style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87)),
                const SizedBox(height: 4),
                TextField(
                  controller: nameCtrl,
                  decoration: InputDecoration(
                    hintText: 'Enter add-on name',
                    hintStyle: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[400]),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                  ),
                ),
                const SizedBox(height: 12),

                Text('Base Price', style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87)),
                const SizedBox(height: 4),
                TextField(
                  controller: priceCtrl,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    hintText: 'Enter price',
                    hintStyle: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[400]),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                  ),
                ),
                const SizedBox(height: 20),

                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: ElevatedButton(
                    onPressed: () {
                      final name = nameCtrl.text.trim();
                      final price = double.tryParse(priceCtrl.text) ?? 0.0;
                      if (name.isNotEmpty) {
                        final newAddOn = {'name': name, 'price': price, 'image': imgPath};
                        if (onUpdated != null) {
                          onUpdated(newAddOn);
                        } else {
                          setState(() => _addOnsList.add(newAddOn));
                        }
                      }
                      Navigator.pop(dialogContext);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryGreen,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      index != null ? 'Update' : 'Add',
                      style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(dialogContext),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: Colors.grey[400]!),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      'Cancel',
                      style: GoogleFonts.poppins(color: Colors.black87, fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _submitForm() async {
    if (_isSaving) return;
    if (!_formKey.currentState!.validate()) return;

    final bool isGrocery = _isGroceryMode;

    String imagePath = _existingImagePath ?? '';
    if (_selectedImageBytes != null) {
      final base64String = base64Encode(_selectedImageBytes!);
      imagePath = 'data:image/jpeg;base64,$base64String';
    }

    double priceVal = 0.0;
    double mrpVal = 0.0;
    double b2bVal = 0.0;
    final Map<String, dynamic> portionsMap = {};

    if (!isGrocery && _portionType == 'half_full') {
      final fPrice = double.tryParse(_fullPriceController.text.trim());
      if (fPrice != null && fPrice > 0) {
        portionsMap['full'] = {
          'basePrice': fPrice,
          'sellingPrice': fPrice,
          'mrp': fPrice,
          'b2bPrice': fPrice,
        };
      }

      final hPrice = double.tryParse(_halfPriceController.text.trim());
      if (hPrice != null && hPrice > 0) {
        portionsMap['half'] = {
          'basePrice': hPrice,
          'sellingPrice': hPrice,
          'mrp': hPrice,
          'b2bPrice': hPrice,
        };
      }

      if (portionsMap.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter base price for at least Full or Half plate')),
        );
        return;
      }
      priceVal = (portionsMap['full']?['basePrice'] ?? portionsMap['half']?['basePrice'] ?? 0.0).toDouble();
      final parsedMrp = double.tryParse(_mrpController.text.trim());
      final parsedB2b = double.tryParse(_b2bPriceController.text.trim());
      mrpVal = (parsedMrp != null && parsedMrp > 0) ? parsedMrp : priceVal;
      b2bVal = (parsedB2b != null && parsedB2b > 0) ? parsedB2b : priceVal;
    } else if (!isGrocery && _portionType == 'size') {
      final sPrice = double.tryParse(_smallPriceController.text.trim());
      if (sPrice != null && sPrice > 0) {
        portionsMap['small'] = {'basePrice': sPrice, 'sellingPrice': sPrice, 'mrp': sPrice, 'b2bPrice': sPrice};
      }

      final mPrice = double.tryParse(_medPriceController.text.trim());
      if (mPrice != null && mPrice > 0) {
        portionsMap['medium'] = {'basePrice': mPrice, 'sellingPrice': mPrice, 'mrp': mPrice, 'b2bPrice': mPrice};
      }

      final lPrice = double.tryParse(_largePriceController.text.trim());
      if (lPrice != null && lPrice > 0) {
        portionsMap['large'] = {'basePrice': lPrice, 'sellingPrice': lPrice, 'mrp': lPrice, 'b2bPrice': lPrice};
      }

      if (portionsMap.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter base price for at least one size (Small, Medium, or Large)')),
        );
        return;
      }
      priceVal = (portionsMap['small']?['basePrice'] ?? portionsMap['medium']?['basePrice'] ?? portionsMap['large']?['basePrice'] ?? 0.0).toDouble();
      final parsedMrp = double.tryParse(_mrpController.text.trim());
      final parsedB2b = double.tryParse(_b2bPriceController.text.trim());
      mrpVal = (parsedMrp != null && parsedMrp > 0) ? parsedMrp : priceVal;
      b2bVal = (parsedB2b != null && parsedB2b > 0) ? parsedB2b : priceVal;
    } else {
      priceVal = double.tryParse(_priceController.text.trim()) ?? 0.0;
      final parsedMrp = double.tryParse(_mrpController.text.trim());
      final parsedB2b = double.tryParse(_b2bPriceController.text.trim());
      mrpVal = (parsedMrp != null && parsedMrp > 0) ? parsedMrp : priceVal;
      b2bVal = (parsedB2b != null && parsedB2b > 0) ? parsedB2b : priceVal;
      if (priceVal <= 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(isGrocery ? 'Please enter a valid Selling Price' : 'Please enter a valid Base Price')),
        );
        return;
      }
    }

    final prepTimeVal = int.tryParse(_prepTimeController.text.trim()) ?? (isGrocery ? 5 : 15);
    final stockQtyVal = int.tryParse(_stockQtyController.text.trim()) ?? 50;
    final lowStockVal = int.tryParse(_lowStockThresholdController.text.trim()) ?? 10;
    final skuVal = _skuController.text.trim();
    final weightVal = _weightController.text.trim();
    final nameVal = _nameController.text.trim();
    final descVal = _descController.text.trim();

    final isEditing = widget.existingItem != null;
    final effectiveVertical = isGrocery
        ? 'grocery'
        : (widget.existingItem?['vertical']?.toString() ?? 'food');

    final savedItem = {
      '_id': widget.existingItem?['_id'] ?? 'm_${DateTime.now().millisecondsSinceEpoch}',
      'name': nameVal,
      'description': descVal,
      'category': _selectedCategory,
      'subcategory': _selectedSubcategory,
      'basePrice': priceVal,
      'sellingPrice': priceVal,
      'price': priceVal,
      'b2cSellingPrice': priceVal,
      'b2cMrp': mrpVal,
      'mrp': mrpVal,
      'b2bPrice': b2bVal,
      'b2bSellingPrice': b2bVal,
      'categoryId': _categoryIdsMap[_selectedCategory],
      'preparationTime': prepTimeVal,
      'sku': skuVal,
      'weight': weightVal,
      'unit': _selectedUnit,
      'stockQuantity': stockQtyVal,
      'lowStockThreshold': lowStockVal,
      'inStock': stockQtyVal > 0,
      'outOfStock': stockQtyVal <= 0,
      'vertical': effectiveVertical,
      'foodType': isGrocery ? 'veg' : _foodType.toLowerCase(),
      'isVeg': isGrocery ? true : (_foodType.toLowerCase() == 'veg'),
      'isAvailable': stockQtyVal > 0 && (widget.existingItem?['isAvailable'] ?? true),
      'available': stockQtyVal > 0 && (widget.existingItem?['isAvailable'] ?? true),
      'approvalStatus': isEditing ? (widget.existingItem?['approvalStatus'] ?? 'pending') : 'pending',
      'isApproved': isEditing ? (widget.existingItem?['isApproved'] ?? false) : false,
      'image': imagePath,
      'portionType': isGrocery ? 'none' : _portionType,
      'portions': (!isGrocery && portionsMap.isNotEmpty) ? portionsMap : null,
      'flavors': isGrocery ? <String>[] : _flavorVariants,
      'variants': isGrocery ? <String>[] : _flavorVariants,
      'addOns': isGrocery ? <Map<String, dynamic>>[] : _addOnsList,
    };

    setState(() => _isSaving = true);
    bool savedOnServer = false;
    String errorMessage = 'Unable to save product to server. Please check connection and retry.';

    try {
      final prefs = await SharedPreferences.getInstance();
      final restId = prefs.getString('restaurantId') ?? ApiConstants.restaurantId;
      final phone = prefs.getString('userPhone') ?? '';
      final token = prefs.getString('token') ?? ApiConstants.authToken;
      final effectiveRestId = restId.isNotEmpty ? restId : (phone.isNotEmpty ? phone : 'me');

      final payload = {
        'name': nameVal,
        'basePrice': priceVal,
        'price': priceVal,
        'sellingPrice': priceVal,
        'mrp': mrpVal,
        'b2cMrp': mrpVal,
        'b2cSellingPrice': priceVal,
        'b2bPrice': b2bVal,
        'b2bSellingPrice': b2bVal,
        'preparationTime': prepTimeVal,
        'category': _selectedCategory,
        'categoryId': _categoryIdsMap[_selectedCategory],
        'subcategory': _selectedSubcategory,
        'sku': skuVal,
        'weight': weightVal,
        'unit': _selectedUnit,
        'stockQuantity': stockQtyVal,
        'lowStockThreshold': lowStockVal,
        'inStock': stockQtyVal > 0,
        'outOfStock': stockQtyVal <= 0,
        'vertical': effectiveVertical,
        'foodType': isGrocery ? 'veg' : _foodType.toLowerCase(),
        'isVeg': isGrocery ? true : (_foodType.toLowerCase() == 'veg'),
        'description': descVal,
        'image': imagePath,
        'portionType': isGrocery ? 'none' : _portionType,
        'portions': (!isGrocery && portionsMap.isNotEmpty) ? portionsMap : null,
        'variants': isGrocery ? <String>[] : _flavorVariants,
        'variations': isGrocery ? <String>[] : _flavorVariants,
        'addOns': isGrocery ? <Map<String, dynamic>>[] : _addOnsList,
      };

      if (isEditing && widget.existingItem?['_id'] != null) {
        final itemId = widget.existingItem!['_id'].toString();
        final res = await http.put(
          Uri.parse('${ApiConstants.baseUrl}/restaurants/vendor/menu/edit/$effectiveRestId/$itemId'),
          headers: {
            'Content-Type': 'application/json',
            if (token.isNotEmpty) 'Authorization': 'Bearer $token',
          },
          body: jsonEncode(payload),
        ).timeout(const Duration(seconds: 12));

        final resData = jsonDecode(res.body);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          savedOnServer = true;
          if (resData is Map && resData['product'] != null) {
            final prod = resData['product'];
            savedItem['approvalStatus'] = prod['approvalStatus'] ?? savedItem['approvalStatus'];
            savedItem['isApproved'] = prod['isApproved'] ?? savedItem['isApproved'];
          }
        } else if (resData is Map && resData['message'] != null) {
          errorMessage = resData['message'].toString();
        }
      } else {
        final res = await http.post(
          Uri.parse('${ApiConstants.baseUrl}/restaurants/vendor/menu/add/$effectiveRestId'),
          headers: {
            'Content-Type': 'application/json',
            if (token.isNotEmpty) 'Authorization': 'Bearer $token',
          },
          body: jsonEncode(payload),
        ).timeout(const Duration(seconds: 12));

        final resData = jsonDecode(res.body);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          savedOnServer = true;
          if (resData is Map && resData['product'] != null) {
            final prod = resData['product'];
            if (prod['_id'] != null) savedItem['_id'] = prod['_id'].toString();
            savedItem['approvalStatus'] = prod['approvalStatus'] ?? 'pending';
            savedItem['isApproved'] = prod['isApproved'] ?? false;
            if (prod['restaurant'] != null) {
              await prefs.setString('restaurantId', prod['restaurant'].toString());
            }
          }
        } else if (resData is Map && resData['message'] != null) {
          errorMessage = resData['message'].toString();
        }
      }
    } catch (e) {
      debugPrint("Catalog item save API error: $e");
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }

    if (!mounted) return;
    if (savedOnServer) {
      widget.onItemSaved(savedItem);
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  Widget _buildExistingImagePreview() {
    final raw = (_existingImagePath ?? '').trim();
    if (raw.isEmpty) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.upload_outlined, color: AppColors.primaryGreen, size: 28),
          const SizedBox(height: 6),
          Text(
            _isGroceryMode ? 'Upload Product Image' : 'Upload Item Image',
            style: GoogleFonts.poppins(
              color: Colors.grey[600],
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      );
    }
    if (raw.startsWith('data:image')) {
      try {
        return ClipRRect(
          borderRadius: BorderRadius.circular(11),
          child: Image.memory(base64Decode(raw.split(',').last), fit: BoxFit.cover, width: double.infinity),
        );
      } catch (_) {}
    }
    final resolved = (!raw.startsWith('http') && !raw.startsWith('assets/'))
        ? '${ApiConstants.baseUrl.replaceAll(RegExp(r'/api(/v1)?/?$'), '')}${raw.startsWith('/') ? raw : '/$raw'}'
        : raw;
    if (resolved.startsWith('http')) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(11),
        child: Image.network(
          resolved,
          fit: BoxFit.cover,
          width: double.infinity,
          errorBuilder: (_, __, ___) => Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.upload_outlined, color: AppColors.primaryGreen, size: 28),
              const SizedBox(height: 6),
              Text('Tap to Change Image', style: GoogleFonts.poppins(color: Colors.grey[600], fontSize: 12)),
            ],
          ),
        ),
      );
    }
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.upload_outlined, color: AppColors.primaryGreen, size: 28),
        const SizedBox(height: 6),
        Text(
          _isGroceryMode ? 'Upload Product Image' : 'Upload Item Image',
          style: GoogleFonts.poppins(color: Colors.grey[600], fontSize: 12, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.existingItem != null;
    final bool isGrocery = _isGroceryMode;
    final subcategories = _subcategoriesMap[_selectedCategory] ?? ['General'];

    return Column(
      children: [
        // Modal Header
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.black),
                onPressed: () => Navigator.pop(context),
              ),
              Expanded(
                child: Text(
                  isEditing
                      ? (isGrocery ? 'Edit Catalog Product' : 'Edit Menu')
                      : (isGrocery ? 'Add Catalog Product' : 'Add Menu Item'),
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
              ),
              const SizedBox(width: 48),
            ],
          ),
        ),
        const Divider(height: 1, color: Color(0xFFEEEEEE)),

        // Form Content Body
        Expanded(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Name Field
                  Text(isGrocery ? 'Product Name *' : 'Item Name *', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _nameController,
                    decoration: InputDecoration(
                      hintText: isGrocery ? 'e.g. Aashirvaad Shudh Chakki Atta 5kg' : 'Enter Item Name',
                      hintStyle: GoogleFonts.poppins(fontSize: 13, color: Colors.grey[400]),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                    ),
                    validator: (v) => v == null || v.trim().isEmpty
                        ? (isGrocery ? 'Please enter product name' : 'Please enter item name')
                        : null,
                  ),
                  const SizedBox(height: 16),

                  // Upload Product Image Box
                  GestureDetector(
                    onTap: _pickImage,
                    child: Container(
                      width: double.infinity,
                      height: 110,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.primaryGreen.withValues(alpha: 0.5), width: 1.5),
                      ),
                      child: _selectedImageBytes != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(11),
                              child: Image.memory(_selectedImageBytes!, fit: BoxFit.cover),
                            )
                          : _buildExistingImagePreview(),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Category Field (Dropdown)
                  Text('Category', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    key: ValueKey('cat_${_categories.length}_$_selectedCategory'),
                    initialValue: _categories.contains(_selectedCategory) ? _selectedCategory : _categories.first,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                    ),
                    items: _categories.map((cat) {
                      return DropdownMenuItem<String>(value: cat, child: Text(cat, style: GoogleFonts.poppins(fontSize: 13)));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() {
                          _selectedCategory = val;
                          _selectedSubcategory = _subcategoriesMap[val]?.first ?? 'General';
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 16),

                  // Subcategory Field
                  Text('Subcategory', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    key: ValueKey('sub_${subcategories.length}_$_selectedSubcategory'),
                    initialValue: subcategories.contains(_selectedSubcategory) ? _selectedSubcategory : subcategories.first,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                    ),
                    items: subcategories.map((sub) {
                      return DropdownMenuItem<String>(value: sub, child: Text(sub, style: GoogleFonts.poppins(fontSize: 13)));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _selectedSubcategory = val);
                      }
                    },
                  ),
                  const SizedBox(height: 16),

                  // Grocery SKU, Weight, Unit & Stock Inventory Controls
                  if (isGrocery) ...[
                    Text('SKU / Barcode', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _skuController,
                      decoration: InputDecoration(
                        hintText: 'e.g. TRC-ATTA-5KG (Optional)',
                        hintStyle: GoogleFonts.poppins(fontSize: 13, color: Colors.grey[400]),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          flex: 3,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Pack Weight / Size', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 12)),
                              const SizedBox(height: 6),
                              TextFormField(
                                controller: _weightController,
                                decoration: InputDecoration(
                                  hintText: 'e.g. 500 or 1',
                                  hintStyle: GoogleFonts.poppins(fontSize: 13, color: Colors.grey[400]),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          flex: 2,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Unit', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 12)),
                              const SizedBox(height: 6),
                              DropdownButtonFormField<String>(
                                initialValue: _selectedUnit,
                                decoration: InputDecoration(
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                                ),
                                items: _unitOptions.map((u) => DropdownMenuItem(value: u, child: Text(u, style: GoogleFonts.poppins(fontSize: 13)))).toList(),
                                onChanged: (val) {
                                  if (val != null) setState(() => _selectedUnit = val);
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Stock Quantity *', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 12)),
                              const SizedBox(height: 6),
                              TextFormField(
                                controller: _stockQtyController,
                                keyboardType: TextInputType.number,
                                decoration: InputDecoration(
                                  hintText: 'e.g. 50',
                                  hintStyle: GoogleFonts.poppins(fontSize: 13, color: Colors.grey[400]),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Low Stock Alert At', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 12)),
                              const SizedBox(height: 6),
                              TextFormField(
                                controller: _lowStockThresholdController,
                                keyboardType: TextInputType.number,
                                decoration: InputDecoration(
                                  hintText: 'e.g. 10',
                                  hintStyle: GoogleFonts.poppins(fontSize: 13, color: Colors.grey[400]),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Food Type Selection (Food outlets only)
                  if (!isGrocery) ...[
                    Text('Food Type', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        GestureDetector(
                          onTap: () => setState(() => _foodType = 'Veg'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              color: _foodType == 'Veg' ? Colors.green.withValues(alpha: 0.1) : Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: _foodType == 'Veg' ? Colors.green : Colors.grey[300]!, width: 1.5),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 10,
                                  height: 10,
                                  decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.green),
                                ),
                                const SizedBox(width: 6),
                                Text('Veg', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () => setState(() => _foodType = 'Non-Veg'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              color: _foodType == 'Non-Veg' ? Colors.red.withValues(alpha: 0.1) : Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: _foodType == 'Non-Veg' ? Colors.red : Colors.grey[300]!, width: 1.5),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 10,
                                  height: 10,
                                  decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.red),
                                ),
                                const SizedBox(width: 6),
                                Text('Non-Veg', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () => setState(() => _foodType = 'Egg'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              color: _foodType == 'Egg' ? Colors.amber.withValues(alpha: 0.15) : Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: _foodType == 'Egg' ? Colors.amber[700]! : Colors.grey[300]!, width: 1.5),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 10,
                                  height: 10,
                                  decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.amber[700]),
                                ),
                                const SizedBox(width: 6),
                                Text('Egg', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Portion & Sizing Configuration Header
                    Text('Portion & Pricing Configuration', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 4),
                    Text(
                      'Select whether this item has Half/Full portions, S/M/L sizes, or single price',
                      style: GoogleFonts.poppins(fontSize: 10.5, color: Colors.grey[500]),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _portionType = 'none'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: _portionType == 'none' ? AppColors.primaryGreen : Colors.grey[100],
                                borderRadius: BorderRadius.circular(8),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                'Single Price',
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: _portionType == 'none' ? Colors.white : Colors.black87,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _portionType = 'half_full'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: _portionType == 'half_full' ? Colors.amber[700] : Colors.grey[100],
                                borderRadius: BorderRadius.circular(8),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                'Half & Full',
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: _portionType == 'half_full' ? Colors.white : Colors.black87,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _portionType = 'size'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: _portionType == 'size' ? Colors.purple[700] : Colors.grey[100],
                                borderRadius: BorderRadius.circular(8),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                'S / M / L',
                                style: GoogleFonts.poppins(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: _portionType == 'size' ? Colors.white : Colors.black87,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                  ],

                  // Single Price / MRP / B2B Pricing Fields
                  if (isGrocery || _portionType == 'none') ...[
                    Text(isGrocery ? 'Selling Price (₹) *' : 'Base Price (₹) *', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _priceController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: InputDecoration(
                        hintText: isGrocery ? '₹ Selling Price' : '₹ Base Price',
                        hintStyle: GoogleFonts.poppins(fontSize: 13, color: Colors.grey[400]),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                      ),
                      validator: (v) {
                        if ((isGrocery || _portionType == 'none') && (v == null || v.trim().isEmpty)) {
                          return isGrocery ? 'Please enter selling price' : 'Please enter base price';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('MRP (₹)', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 12)),
                              const SizedBox(height: 6),
                              TextFormField(
                                controller: _mrpController,
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                decoration: InputDecoration(
                                  hintText: '₹ Printed MRP',
                                  hintStyle: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[400]),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('B2B / Wholesale (₹)', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 12)),
                              const SizedBox(height: 6),
                              TextFormField(
                                controller: _b2bPriceController,
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                decoration: InputDecoration(
                                  hintText: '₹ B2B Price',
                                  hintStyle: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[400]),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ] else if (!isGrocery && _portionType == 'half_full') ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.grey[300]!),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Full Plate Base Price (₹) *', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.black87)),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _fullPriceController,
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              hintText: '₹ Full Base Price',
                              hintStyle: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[400]),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade50.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.amber.shade200),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Half Plate Base Price (₹) (Optional)', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.amber.shade900)),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _halfPriceController,
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              hintText: '₹ Half Base Price',
                              hintStyle: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[400]),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ] else if (!isGrocery && _portionType == 'size') ...[
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Small (S) Base (₹)', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 11)),
                              const SizedBox(height: 4),
                              TextFormField(
                                controller: _smallPriceController,
                                keyboardType: TextInputType.number,
                                decoration: InputDecoration(
                                  hintText: '₹ Small',
                                  hintStyle: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[400]),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Medium (M) Base (₹)', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 11)),
                              const SizedBox(height: 4),
                              TextFormField(
                                controller: _medPriceController,
                                keyboardType: TextInputType.number,
                                decoration: InputDecoration(
                                  hintText: '₹ Med',
                                  hintStyle: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[400]),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Large (L) Base (₹)', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 11)),
                              const SizedBox(height: 4),
                              TextFormField(
                                controller: _largePriceController,
                                keyboardType: TextInputType.number,
                                decoration: InputDecoration(
                                  hintText: '₹ Large',
                                  hintStyle: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[400]),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 16),

                  // Packing / Preparation Time Field
                  Text(isGrocery ? 'Packing Time (Minutes)' : 'Preparation Time (Minutes)', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _prepTimeController,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.timer_outlined, size: 20, color: AppColors.primaryGreen),
                      hintText: isGrocery ? 'e.g. 5 mins' : 'e.g. 15 mins',
                      hintStyle: GoogleFonts.poppins(fontSize: 13, color: Colors.grey[400]),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Description Field
                  Text('Description', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _descController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: isGrocery ? 'Enter brand, pack details, shelf-life...' : 'Enter description...',
                      hintStyle: GoogleFonts.poppins(fontSize: 13, color: Colors.grey[400]),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                    ),
                    validator: (v) {
                      if (!isGrocery && (v == null || v.trim().isEmpty)) {
                        return 'Please enter description';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),

                  // Flavour Variants & Add-ons (Food outlets only)
                  if (!isGrocery) ...[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Flavour Variants (${_flavorVariants.length})', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13)),
                        Row(
                          children: [
                            GestureDetector(
                              onTap: _showFlavourVariantsListModal,
                              child: Text(
                                'Manage All',
                                style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.add_circle_outline_rounded, color: AppColors.primaryGreen),
                              onPressed: () => _showEditFlavourVariantDialog(),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Text(
                      'Optional: Add flavour options that customers can choose from',
                      style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey[500]),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _flavorVariants.map((variant) {
                        return GestureDetector(
                          onTap: _showFlavourVariantsListModal,
                          child: Chip(
                            label: Text(variant, style: GoogleFonts.poppins(fontSize: 11)),
                            backgroundColor: const Color(0xFFF3F4F6),
                            deleteIcon: const Icon(Icons.edit_outlined, size: 13, color: AppColors.primaryGreen),
                            onDeleted: _showFlavourVariantsListModal,
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Add Add-ons (${_addOnsList.length})', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13)),
                        Row(
                          children: [
                            GestureDetector(
                              onTap: _showAddOnsListModal,
                              child: Text(
                                'Manage All',
                                style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.add_circle_outline_rounded, color: AppColors.primaryGreen),
                              onPressed: () => _showEditAddOnDialog(),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Text(
                      'Optional: Add add-on options that customers can choose from',
                      style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey[500]),
                    ),
                    const SizedBox(height: 8),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: _addOnsList.map((addOn) {
                          return GestureDetector(
                            onTap: _showAddOnsListModal,
                            child: Container(
                              margin: const EdgeInsets.only(right: 8),
                              padding: const EdgeInsets.fromLTRB(10, 6, 6, 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF9FAFB),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: Colors.grey[200]!, width: 1),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('₹ ${addOn['price']}', style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.bold)),
                                      Text(addOn['name'], style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey[600])),
                                    ],
                                  ),
                                  const SizedBox(width: 8),
                                  const Icon(Icons.edit_outlined, size: 14, color: AppColors.primaryGreen),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 28),
                  ] else
                    const SizedBox(height: 12),

                  // Bottom CTA Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _submitForm,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGreen,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _isSaving
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                            )
                          : Text(
                              isEditing
                                  ? (isGrocery ? 'Update Product' : 'Update')
                                  : (isGrocery ? 'Submit for Approval' : 'Save Item'),
                              style: GoogleFonts.poppins(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ==========================================
// EXCEL / CSV MENU IMPORT MODAL SHEET
// ==========================================
class ExcelMenuImportSheet extends StatefulWidget {
  final Function(List<Map<String, dynamic>>) onItemsImported;

  const ExcelMenuImportSheet({
    super.key,
    required this.onItemsImported,
  });

  @override
  State<ExcelMenuImportSheet> createState() => _ExcelMenuImportSheetState();
}

class _ExcelMenuImportSheetState extends State<ExcelMenuImportSheet> {
  int _activeTab = 0; // 0: Upload & Presets, 1: Paste CSV / Excel, 2: Excel Template Guide
  String? _selectedFileName;
  String? _selectedFileSize;
  bool _isUploading = false;
  final TextEditingController _pasteController = TextEditingController();

  List<Map<String, dynamic>> _parsedItems = [];
  final Set<int> _selectedIndices = {};

  bool get _isGroceryMode =>
      PlatformConfigService.isGroceryPlatform ||
      (PlatformConfigService.isBothMode && RestaurantAuthService.isGroceryStore);

  final List<Map<String, dynamic>> _groceryCatalogPreset = [
    {
      'name': 'Aashirvaad Shudh Chakki Atta',
      'category': 'Staples & Grains',
      'subcategory': 'Rice & Atta',
      'sellingPrice': 245.0,
      'mrp': 275.0,
      'b2bPrice': 225.0,
      'weight': '5',
      'unit': 'kg',
      'stockQuantity': 45,
      'lowStockThreshold': 10,
      'sku': 'TRC-ATTA-5KG',
      'vertical': 'grocery',
      'description': '100% whole wheat chakki-ground atta with zero maida.',
    },
    {
      'name': 'Amul Taaza Toned Milk',
      'category': 'Dairy & Bread',
      'subcategory': 'Milk & Curd',
      'sellingPrice': 54.0,
      'mrp': 56.0,
      'b2bPrice': 50.0,
      'weight': '1',
      'unit': 'L',
      'stockQuantity': 60,
      'lowStockThreshold': 15,
      'sku': 'TRC-AMUL-1L',
      'vertical': 'grocery',
      'description': 'Fresh homogenised toned milk pouch for daily kitchen needs.',
    },
    {
      'name': 'India Gate Classic Basmati Rice',
      'category': 'Staples & Grains',
      'subcategory': 'Rice & Atta',
      'sellingPrice': 189.0,
      'mrp': 220.0,
      'b2bPrice': 172.0,
      'weight': '1',
      'unit': 'kg',
      'stockQuantity': 35,
      'lowStockThreshold': 8,
      'sku': 'TRC-RICE-1KG',
      'vertical': 'grocery',
      'description': 'Aged extra-long grain basmati rice for biryani and everyday meals.',
    },
    {
      'name': 'Fortune Sunlite Refined Sunflower Oil',
      'category': 'Staples & Grains',
      'subcategory': 'Edible Oils & Ghee',
      'sellingPrice': 138.0,
      'mrp': 165.0,
      'b2bPrice': 126.0,
      'weight': '1',
      'unit': 'L',
      'stockQuantity': 40,
      'lowStockThreshold': 10,
      'sku': 'TRC-OIL-1L',
      'vertical': 'grocery',
      'description': 'Light, healthy cooking oil rich in vitamins A & D.',
    },
    {
      'name': 'Fresh Farm Red Onions',
      'category': 'Fruits & Vegetables',
      'subcategory': 'Fresh Vegetables',
      'sellingPrice': 38.0,
      'mrp': 48.0,
      'b2bPrice': 32.0,
      'weight': '1',
      'unit': 'kg',
      'stockQuantity': 85,
      'lowStockThreshold': 15,
      'sku': 'TRC-ONION-1KG',
      'vertical': 'grocery',
      'description': 'Handpicked farm-fresh red onions graded daily at local hub.',
    },
  ];

  // Sample Preset Menus for food outlets when platformMode allows food
  final List<Map<String, dynamic>> _northIndianPreset = [
    {
      'name': 'Paneer Butter Masala',
      'category': 'Main Course',
      'subcategory': 'Paneer Specialties',
      'b2bPrice': 240.0,
      'foodType': 'veg',
      'description': 'Fresh cottage cheese cubes simmered in rich creamy tomato and butter gravy.',
      'image': 'assets/images/restaurant_paneertikka_header.jpg',
      'flavors': ['Mild Creamy', 'Medium Spicy', 'Desi Ghee Tadka'],
      'addOns': [
        {'name': 'Butter Naan', 'price': 40.0, 'image': ''},
        {'name': 'Jeera Rice', 'price': 80.0, 'image': ''},
      ],
    },
    {
      'name': 'Butter Chicken Boneless',
      'category': 'Main Course',
      'subcategory': 'Chicken Curries',
      'b2bPrice': 290.0,
      'foodType': 'non-veg',
      'description': 'Tender roasted tandoori chicken cooked in authentic makhani tomato butter sauce.',
      'image': 'assets/images/restaurant_butterchicken_header.jpg',
      'flavors': ['Classic Makhani', 'Spicy Delhi Style'],
      'addOns': [
        {'name': 'Garlic Naan', 'price': 45.0, 'image': ''},
        {'name': 'Extra Gravy', 'price': 60.0, 'image': ''},
      ],
    },
    {
      'name': 'Dal Makhani Slow Cooked',
      'category': 'Main Course',
      'subcategory': 'Lentils & Dals',
      'b2bPrice': 190.0,
      'foodType': 'veg',
      'description': 'Black lentils simmered overnight with fresh cream, butter, and mild spices.',
      'image': 'assets/images/restaurant_daltadka_header.jpg',
      'flavors': ['Creamy Classic', 'Smoky Dhaba Style'],
      'addOns': [
        {'name': 'Tandoori Roti', 'price': 20.0, 'image': ''},
        {'name': 'Sirka Onion', 'price': 15.0, 'image': ''},
      ],
    },
  ];

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _pasteController.dispose();
    super.dispose();
  }

  void _loadPreset(List<Map<String, dynamic>> presetList, String fileName, String fileSize) {
    final isGrocery = _isGroceryMode;
    setState(() {
      _selectedFileName = fileName;
      _selectedFileSize = fileSize;
      _parsedItems = presetList.map((item) {
        final double sellingP = ((item['sellingPrice'] ?? item['b2bPrice'] ?? 0.0) as num).toDouble();
        final double mrpP = ((item['mrp'] ?? sellingP) as num).toDouble();
        final double b2bP = ((item['b2bPrice'] ?? sellingP) as num).toDouble();
        return {
          '_id': 'm_imp_${DateTime.now().millisecondsSinceEpoch}_${item['name'].hashCode}',
          'name': item['name'],
          'category': item['category'] ?? (isGrocery ? 'Daily Essentials' : 'General'),
          'subcategory': item['subcategory'] ?? 'General',
          'basePrice': sellingP,
          'sellingPrice': sellingP,
          'price': sellingP,
          'mrp': mrpP,
          'b2cMrp': mrpP,
          'b2bPrice': b2bP,
          'weight': item['weight']?.toString() ?? '',
          'unit': item['unit']?.toString() ?? 'pack',
          'stockQuantity': item['stockQuantity'] ?? 50,
          'lowStockThreshold': item['lowStockThreshold'] ?? 10,
          'inStock': true,
          'sku': item['sku']?.toString() ?? '',
          'vertical': isGrocery ? 'grocery' : (item['vertical'] ?? 'food'),
          'foodType': item['foodType'] ?? 'veg',
          'isVeg': (item['foodType'] ?? 'veg') == 'veg',
          'isAvailable': true,
          'description': item['description'] ?? '',
          'image': item['image'] ?? '',
          'flavors': isGrocery ? <String>[] : List<String>.from(item['flavors'] ?? ['Standard']),
          'addOns': isGrocery ? <Map<String, dynamic>>[] : List<Map<String, dynamic>>.from(item['addOns'] ?? []),
        };
      }).toList();

      _selectedIndices.clear();
      for (int i = 0; i < _parsedItems.length; i++) {
        _selectedIndices.add(i);
      }
    });
  }

  Future<void> _pickFileFromDevice() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? pickedFile = await picker.pickMedia();

      if (pickedFile == null) {
        return;
      }

      setState(() {
        _isUploading = true;
      });

      final String fileName = pickedFile.name.isNotEmpty ? pickedFile.name : 'Uploaded_Catalog_Sheet.csv';
      final int bytesLength = await pickedFile.length();
      final String fileSize = bytesLength > 0 ? '${(bytesLength / 1024).toStringAsFixed(1)} KB' : '15.4 KB';

      String fileText = '';
      try {
        fileText = await pickedFile.readAsString();
      } catch (_) {}

      if (fileText.trim().isNotEmpty && (fileText.contains(',') || fileText.contains('\t') || fileText.contains('\n'))) {
        _pasteController.text = fileText;
        _parsePastedText();
        if (mounted) {
          setState(() {
            _selectedFileName = fileName;
            _selectedFileSize = fileSize;
            _isUploading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _isUploading = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Could not read CSV rows from "$fileName". Please select a plain .csv file or paste rows in Paste CSV tab.'),
              backgroundColor: Colors.orange,
              duration: const Duration(seconds: 3),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isUploading = false;
        });
      }
      debugPrint('Error picking file: $e');
    }
  }

  void _parsePastedText() {
    final bool isGrocery = _isGroceryMode;
    final text = _pasteController.text.trim();
    if (text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please paste some CSV or Excel text first!'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    final lines = text.split('\n');
    final List<Map<String, dynamic>> newParsed = [];

    for (int i = 0; i < lines.length; i++) {
      final line = lines[i].trim();
      if (line.isEmpty) continue;

      final List<String> parts = line.contains('\t') ? line.split('\t') : line.split(',');
      if (parts.isEmpty) continue;

      final name = parts[0].trim();
      final lowerName = name.toLowerCase();
      if (name.isEmpty ||
          lowerName == 'name' ||
          lowerName == 'product name' ||
          lowerName == 'dish name' ||
          lowerName == 'item name') {
        continue; // Skip header row
      }

      if (isGrocery) {
        // Format: Product Name, Category, Selling Price, MRP, Weight, Unit, Stock Qty, SKU
        final category = parts.length > 1 && parts[1].trim().isNotEmpty ? parts[1].trim() : 'Staples & Grains';
        final sellingStr = parts.length > 2 ? parts[2].replaceAll(RegExp(r'[^0-9.]'), '').trim() : '99';
        final double sellingPrice = double.tryParse(sellingStr) ?? 99.0;
        final mrpStr = parts.length > 3 ? parts[3].replaceAll(RegExp(r'[^0-9.]'), '').trim() : '';
        final double mrp = (mrpStr.isNotEmpty ? double.tryParse(mrpStr) : null) ?? sellingPrice;
        final weight = parts.length > 4 ? parts[4].trim() : '1';
        final unit = parts.length > 5 && parts[5].trim().isNotEmpty ? parts[5].trim() : 'pack';
        final stockStr = parts.length > 6 ? parts[6].replaceAll(RegExp(r'[^0-9]'), '').trim() : '50';
        final int stockQty = int.tryParse(stockStr) ?? 50;
        final sku = parts.length > 7 ? parts[7].trim() : 'TRC-${DateTime.now().millisecondsSinceEpoch % 10000}-$i';
        final desc = parts.length > 8 && parts[8].trim().isNotEmpty ? parts[8].trim() : '$weight $unit $name';

        newParsed.add({
          '_id': 'm_imp_${DateTime.now().millisecondsSinceEpoch}_$i',
          'name': name,
          'category': category,
          'subcategory': 'General',
          'basePrice': sellingPrice,
          'sellingPrice': sellingPrice,
          'price': sellingPrice,
          'mrp': mrp > 0 ? mrp : sellingPrice,
          'b2cMrp': mrp > 0 ? mrp : sellingPrice,
          'b2bPrice': sellingPrice,
          'weight': weight,
          'unit': unit,
          'stockQuantity': stockQty,
          'lowStockThreshold': 10,
          'inStock': stockQty > 0,
          'sku': sku,
          'vertical': 'grocery',
          'foodType': 'veg',
          'isVeg': true,
          'isAvailable': stockQty > 0,
          'description': desc,
          'image': '',
          'flavors': <String>[],
          'addOns': <Map<String, dynamic>>[],
        });
      } else {
        final category = parts.length > 1 && parts[1].trim().isNotEmpty ? parts[1].trim() : 'Main Course';
        final priceStr = parts.length > 2 ? parts[2].replaceAll(RegExp(r'[^0-9.]'), '').trim() : '150';
        final double price = double.tryParse(priceStr) ?? 150.0;
        final typeStr = parts.length > 3 ? parts[3].trim().toLowerCase() : 'veg';
        final isNonVeg = typeStr.contains('non') || typeStr.contains('chicken') || typeStr.contains('mutton') || typeStr.contains('egg') || typeStr.contains('fish');
        final desc = parts.length > 4 ? parts[4].trim() : 'Freshly prepared item';

        List<String> flavors = ['Regular', 'Spicy'];
        if (parts.length > 5 && parts[5].trim().isNotEmpty) {
          flavors = parts[5].split(RegExp(r'[/;|]')).map((f) => f.trim()).where((f) => f.isNotEmpty).toList();
        }

        newParsed.add({
          '_id': 'm_imp_${DateTime.now().millisecondsSinceEpoch}_$i',
          'name': name,
          'category': category,
          'subcategory': category,
          'basePrice': price,
          'sellingPrice': price,
          'price': price,
          'mrp': price,
          'b2bPrice': price,
          'vertical': 'food',
          'foodType': isNonVeg ? 'non-veg' : 'veg',
          'isVeg': !isNonVeg,
          'isAvailable': true,
          'description': desc,
          'image': '',
          'flavors': flavors.isNotEmpty ? flavors : ['Standard'],
          'addOns': <Map<String, dynamic>>[],
        });
      }
    }

    if (newParsed.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No valid items could be parsed. Check the format guide!'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    setState(() {
      _selectedFileName = 'Pasted_Spreadsheet_Data.csv';
      _selectedFileSize = '${lines.length} lines';
      _parsedItems = newParsed;
      _selectedIndices.clear();
      for (int i = 0; i < _parsedItems.length; i++) {
        _selectedIndices.add(i);
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Parsed ${newParsed.length} products from pasted spreadsheet data!'),
        backgroundColor: AppColors.primaryGreen,
      ),
    );
  }

  void _confirmImport() {
    if (_selectedIndices.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select at least one item to import!'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    final List<Map<String, dynamic>> itemsToImport = [];
    for (final index in _selectedIndices) {
      if (index < _parsedItems.length) {
        itemsToImport.add(Map<String, dynamic>.from(_parsedItems[index]));
      }
    }

    Navigator.pop(context);
    widget.onItemsImported(itemsToImport);
  }

  @override
  Widget build(BuildContext context) {
    final isGrocery = _isGroceryMode;
    return Column(
      children: [
        // Top Drag Handle & Title Bar
        Container(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primaryGreen.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.table_chart_rounded, color: AppColors.primaryGreen, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isGrocery ? 'Bulk Import Grocery Catalog' : 'Import Menu from Excel / CSV',
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        Text(
                          isGrocery
                              ? 'Bulk import store SKUs, weights, MRP, prices & stock'
                              : 'Bulk import your complete outlet menu in seconds',
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.grey),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFF3F4F6),
                  borderRadius: BorderRadius.circular(10),
                ),
                padding: const EdgeInsets.all(3),
                child: Row(
                  children: [
                    _buildTabButton(0, 'Upload & Presets', Icons.file_present_rounded),
                    _buildTabButton(1, 'Paste CSV', Icons.paste_rounded),
                    _buildTabButton(2, 'CSV Format', Icons.help_outline_rounded),
                  ],
                ),
              ),
            ],
          ),
        ),

        // Scrollable Body
        Expanded(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(18, 14, 18, 18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_activeTab == 0) ...[
                  _buildUploadAndPresetsTab(isGrocery),
                ] else if (_activeTab == 1) ...[
                  _buildPasteCsvTab(isGrocery),
                ] else ...[
                  _buildFormatGuideTab(isGrocery),
                ],

                const SizedBox(height: 20),
                _buildPreviewSectionHeader(isGrocery),
                const SizedBox(height: 10),

                if (_parsedItems.isEmpty) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(28),
                    decoration: BoxDecoration(
                      color: Colors.grey[50],
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.grey[200]!),
                    ),
                    child: Column(
                      children: [
                        Icon(Icons.inventory_2_outlined, size: 40, color: Colors.grey[400]),
                        const SizedBox(height: 10),
                        Text(
                          isGrocery ? 'No products parsed yet' : 'No items parsed yet',
                          style: GoogleFonts.poppins(color: Colors.grey[700], fontWeight: FontWeight.w600, fontSize: 13),
                        ),
                        Text(
                          'Choose a CSV file, load sample SKUs, or paste spreadsheet rows above',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.poppins(color: Colors.grey[500], fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ] else ...[
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _parsedItems.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      return _buildParsedItemCard(index, isGrocery);
                    },
                  ),
                ],
              ],
            ),
          ),
        ),

        // Bottom CTA Bar
        Container(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.06),
                blurRadius: 10,
                offset: const Offset(0, -3),
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        '${_selectedIndices.length} of ${_parsedItems.length} selected',
                        style: GoogleFonts.poppins(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      Text(
                        isGrocery ? 'Will be submitted to store catalog' : 'Will be added directly to outlet menu',
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: _selectedIndices.isEmpty ? null : _confirmImport,
                  icon: const Icon(Icons.file_download_done_rounded, color: Colors.white, size: 18),
                  label: Text(
                    isGrocery ? 'Import (${_selectedIndices.length}) SKUs' : 'Import (${_selectedIndices.length}) Items',
                    style: GoogleFonts.poppins(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: Colors.white,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
                    disabledBackgroundColor: Colors.grey[300],
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTabButton(int index, String title, IconData icon) {
    final bool isSelected = _activeTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeTab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    )
                  ]
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 14,
                color: isSelected ? AppColors.primaryGreen : Colors.grey[600],
              ),
              const SizedBox(width: 4),
              Flexible(
                child: Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    color: isSelected ? AppColors.primaryGreen : Colors.grey[700],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUploadAndPresetsTab(bool isGrocery) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GestureDetector(
          onTap: _pickFileFromDevice,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
            decoration: BoxDecoration(
              color: AppColors.primaryGreen.withValues(alpha: 0.03),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: AppColors.primaryGreen.withValues(alpha: 0.4),
                style: BorderStyle.solid,
                width: 1.5,
              ),
            ),
            child: _isUploading
                ? const Center(
                    child: Column(
                      children: [
                        CircularProgressIndicator(color: AppColors.primaryGreen),
                        SizedBox(height: 10),
                        Text('Reading spreadsheet rows...'),
                      ],
                    ),
                  )
                : Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.cloud_upload_outlined, color: AppColors.primaryGreen, size: 28),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        _selectedFileName != null ? 'Selected: $_selectedFileName' : 'Select or Browse CSV Sheet (.csv)',
                        style: GoogleFonts.poppins(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _selectedFileSize != null ? 'Size: $_selectedFileSize • Tap to re-upload' : 'Supports standard CSV format exported from Excel / Sheets',
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          color: Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.primaryGreen,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          'Browse Files',
                          style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
          ),
        ),
        const SizedBox(height: 12),
        if (isGrocery)
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => _loadPreset(_groceryCatalogPreset, 'Grocery_Starter_SKUs.csv', '5 SKUs'),
              icon: const Icon(Icons.auto_awesome_rounded, size: 16, color: AppColors.primaryGreen),
              label: Text(
                'Load 5 Starter Grocery SKUs (Atta, Milk, Rice, Oil, Onion)',
                style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primaryGreen),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.primaryGreen),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          )
        else
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => _loadPreset(_northIndianPreset, 'North_Indian_Starter.csv', '3 Items'),
              icon: const Icon(Icons.auto_awesome_rounded, size: 16, color: AppColors.primaryGreen),
              label: Text(
                'Load Starter Outlet Items',
                style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primaryGreen),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.primaryGreen),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildPasteCsvTab(bool isGrocery) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Paste rows copied from Excel or Google Sheets:',
          style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: _pasteController,
          maxLines: 5,
          style: GoogleFonts.robotoMono(fontSize: 11),
          decoration: InputDecoration(
            hintText: isGrocery
                ? 'Product Name, Category, Selling Price, MRP, Weight, Unit, Stock Qty, SKU\ne.g. Aashirvaad Atta, Staples & Grains, 245, 275, 5, kg, 40, TRC-ATTA-5KG'
                : 'Item Name, Category, Price, Veg/Non-Veg, Description\ne.g. Paneer Tikka, Starters, 220, Veg, Grilled cottage cheese',
            hintStyle: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[400]),
            filled: true,
            fillColor: const Color(0xFFF9FAFB),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primaryGreen)),
          ),
        ),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            TextButton(
              onPressed: () {
                _pasteController.text = isGrocery
                    ? 'Aashirvaad Shudh Chakki Atta, Staples & Grains, 245, 275, 5, kg, 40, TRC-ATTA-5KG\nAmul Taaza Toned Milk, Dairy & Bread, 54, 56, 1, L, 60, TRC-MILK-1L\nFortune Sunlite Sunflower Oil, Staples & Grains, 138, 165, 1, L, 35, TRC-OIL-1L\nFresh Farm Red Onion, Fruits & Vegetables, 38, 48, 1, kg, 80, TRC-ONION-1KG'
                    : 'Kadai Paneer, Main Course, 230, Veg, Spicy tomato onion capsicum gravy\nGarlic Butter Naan, Breads & Rice, 50, Veg, Fresh clay oven naan';
              },
              child: Text('Fill Sample CSV', style: GoogleFonts.poppins(fontSize: 11, color: AppColors.primaryGreen)),
            ),
            const SizedBox(width: 8),
            ElevatedButton.icon(
              onPressed: _parsePastedText,
              icon: const Icon(Icons.flash_on_rounded, size: 16, color: Colors.white),
              label: Text('Parse Data', style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFormatGuideTab(bool isGrocery) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.info_outline_rounded, color: AppColors.primaryGreen, size: 18),
              const SizedBox(width: 8),
              Text(
                isGrocery ? 'Grocery CSV Columns Structure' : 'Excel / CSV Columns Structure',
                style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.black87),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (isGrocery) ...[
            _buildGuideRow('1. Product Name', 'e.g. Aashirvaad Shudh Chakki Atta (Required)'),
            _buildGuideRow('2. Category', 'e.g. Staples & Grains, Dairy & Bread'),
            _buildGuideRow('3. Selling Price', 'e.g. 245 (Numeric ₹ price)'),
            _buildGuideRow('4. MRP', 'e.g. 275 (Printed MRP ₹)'),
            _buildGuideRow('5. Weight', 'e.g. 5 or 500'),
            _buildGuideRow('6. Unit', 'e.g. kg, g, L, ml, pack, piece, dozen'),
            _buildGuideRow('7. Stock Qty', 'e.g. 40 (Initial store inventory count)'),
            _buildGuideRow('8. SKU Code', 'e.g. TRC-ATTA-5KG (Optional)'),
          ] else ...[
            _buildGuideRow('1. Item Name', 'e.g. Paneer Tikka (Required)'),
            _buildGuideRow('2. Category', 'e.g. Starters, Main Course'),
            _buildGuideRow('3. Base Price', 'e.g. 250 (Numeric ₹ price)'),
            _buildGuideRow('4. Type', 'e.g. "veg" or "non-veg"'),
            _buildGuideRow('5. Description', 'e.g. Rich tomato butter gravy'),
            _buildGuideRow('6. Flavours', 'e.g. Mild / Spicy (Optional)'),
          ],
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                _pasteController.text = isGrocery
                    ? 'Product Name, Category, Selling Price, MRP, Weight, Unit, Stock Qty, SKU\nAashirvaad Shudh Chakki Atta, Staples & Grains, 245, 275, 5, kg, 40, TRC-ATTA-5KG\nAmul Taaza Toned Milk, Dairy & Bread, 54, 56, 1, L, 60, TRC-MILK-1L'
                    : 'Item Name, Category, Base Price, Type, Description\nPaneer Tikka, Starters, 220, Veg, Grilled cottage cheese cubes';
                setState(() => _activeTab = 1);
              },
              icon: const Icon(Icons.copy_all_rounded, size: 16, color: AppColors.primaryGreen),
              label: Text(
                'Insert Sample CSV into Editor',
                style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primaryGreen),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.primaryGreen),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGuideRow(String col, String example) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 112,
            child: Text(
              col,
              style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black87),
            ),
          ),
          Expanded(
            child: Text(
              example,
              style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey[600]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPreviewSectionHeader(bool isGrocery) {
    final bool isAllSelected = _selectedIndices.length == _parsedItems.length && _parsedItems.isNotEmpty;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Checkbox(
              value: isAllSelected,
              activeColor: AppColors.primaryGreen,
              onChanged: (val) {
                setState(() {
                  if (val == true) {
                    for (int i = 0; i < _parsedItems.length; i++) {
                      _selectedIndices.add(i);
                    }
                  } else {
                    _selectedIndices.clear();
                  }
                });
              },
            ),
            Text(
              '${isGrocery ? 'Products' : 'Items'} to Import (${_selectedIndices.length}/${_parsedItems.length})',
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
          ],
        ),
        if (_parsedItems.isNotEmpty)
          TextButton(
            onPressed: () {
              setState(() {
                _parsedItems.clear();
                _selectedIndices.clear();
              });
            },
            child: Text(
              'Clear All',
              style: GoogleFonts.poppins(fontSize: 11, color: Colors.redAccent),
            ),
          ),
      ],
    );
  }

  Widget _buildParsedItemCard(int index, bool isGrocery) {
    final item = _parsedItems[index];
    final bool isSelected = _selectedIndices.contains(index);
    final bool isVeg = (item['foodType'] ?? 'veg') == 'veg';
    final List flavors = item['flavors'] ?? [];
    final List addOns = item['addOns'] ?? [];
    final String sku = (item['sku'] ?? '').toString().trim();
    final String weight = (item['weight'] ?? '').toString().trim();
    final String unit = (item['unit'] ?? '').toString().trim();
    final int stockQty = int.tryParse((item['stockQuantity'] ?? 0).toString()) ?? 0;
    final double sellingP = ((item['sellingPrice'] ?? item['b2bPrice'] ?? 0.0) as num).toDouble();
    final double mrpP = ((item['mrp'] ?? sellingP) as num).toDouble();

    return Container(
      decoration: BoxDecoration(
        color: isSelected ? Colors.white : const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isSelected ? AppColors.primaryGreen.withValues(alpha: 0.5) : Colors.grey[200]!,
          width: isSelected ? 1.5 : 1,
        ),
        boxShadow: isSelected
            ? [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                )
              ]
            : null,
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        child: Row(
          children: [
            Checkbox(
              value: isSelected,
              activeColor: AppColors.primaryGreen,
              onChanged: (val) {
                setState(() {
                  if (val == true) {
                    _selectedIndices.add(index);
                  } else {
                    _selectedIndices.remove(index);
                  }
                });
              },
            ),

            if (!isGrocery) ...[
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isVeg ? Colors.green : Colors.red,
                ),
              ),
              const SizedBox(width: 10),
            ],

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item['name'] ?? '',
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.black87 : Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 2),
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF3F4F6),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          item['category'] ?? 'General',
                          style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey[700]),
                        ),
                      ),
                      if (isGrocery) ...[
                        if (weight.isNotEmpty || unit.isNotEmpty)
                          Text(
                            '$weight $unit',
                            style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.primaryGreen),
                          ),
                        Text(
                          'Stock: $stockQty',
                          style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey[600]),
                        ),
                        if (sku.isNotEmpty)
                          Text(
                            sku,
                            style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey[500]),
                          ),
                      ] else ...[
                        if (flavors.isNotEmpty)
                          Text(
                            '${flavors.length} flavours',
                            style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey[500]),
                          ),
                        if (addOns.isNotEmpty)
                          Text(
                            '${addOns.length} add-ons',
                            style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey[500]),
                          ),
                      ],
                    ],
                  ),
                ],
              ),
            ),

            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '₹${sellingP.toStringAsFixed(sellingP % 1 == 0 ? 0 : 2)}',
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryGreen,
                  ),
                ),
                if (mrpP > sellingP)
                  Text(
                    'MRP ₹${mrpP.toStringAsFixed(mrpP % 1 == 0 ? 0 : 2)}',
                    style: GoogleFonts.poppins(
                      fontSize: 10,
                      color: Colors.grey[500],
                      decoration: TextDecoration.lineThrough,
                    ),
                  ),
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _parsedItems.removeAt(index);
                      _selectedIndices.remove(index);
                      final newSet = <int>{};
                      for (final idx in _selectedIndices) {
                        if (idx > index) {
                          newSet.add(idx - 1);
                        } else if (idx < index) {
                          newSet.add(idx);
                        }
                      }
                      _selectedIndices.clear();
                      _selectedIndices.addAll(newSet);
                    });
                  },
                  child: const Padding(
                    padding: EdgeInsets.only(top: 4),
                    child: Icon(Icons.delete_outline, size: 16, color: Colors.grey),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

