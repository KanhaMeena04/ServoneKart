import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/app_constants.dart';

class GroceryPage extends StatefulWidget {
  const GroceryPage({super.key});

  @override
  State<GroceryPage> createState() => _GroceryPageState();
}

class _GroceryPageState extends State<GroceryPage> {
  bool _isLoading = true;
  List<dynamic> _stores = [];
  List<dynamic> _quickProducts = [];
  List<String> _categories = ['All'];
  String _selectedCategory = 'All';
  final Map<String, int> _cartItems = {};
  double _cartTotal = 0.0;
  final TextEditingController _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchGroceryData();
  }

  Future<void> _fetchGroceryData() async {
    setState(() => _isLoading = true);
    try {
      // 1. Fetch Dynamic Categories from Admin / Backend
      try {
        final catRes = await http
            .get(Uri.parse('${AppConstants.baseUrl}/grocery/categories'));
        if (catRes.statusCode == 200) {
          final catData = json.decode(catRes.body);
          if (catData['success'] == true && catData['data'] is List) {
            final catNames = (catData['data'] as List)
                .map((c) => (c['name'] ?? '').toString())
                .where((n) => n.isNotEmpty)
                .toList();
            if (catNames.isNotEmpty) {
              _categories = [
                'All',
                ...catNames.where((n) => n.toLowerCase() != 'all')
              ];
            }
          }
        }
      } catch (e) {
        debugPrint('Category fetch error: $e');
      }

      // 2. Fetch Dynamic Products from Admin / Backend
      try {
        final prodRes = await http
            .get(Uri.parse('${AppConstants.baseUrl}/grocery/products'));
        if (prodRes.statusCode == 200) {
          final prodData = json.decode(prodRes.body);
          if (prodData['success'] == true && prodData['data'] is List) {
            _quickProducts = prodData['data'];
          }
        }
      } catch (e) {
        debugPrint('Product fetch error: $e');
      }

      // 3. Fetch Dynamic Stores from Admin / Backend
      try {
        final res = await http.get(
            Uri.parse('${AppConstants.baseUrl}/grocery/stores?city=Indore'));
        if (res.statusCode == 200) {
          final data = json.decode(res.body);
          if (data['success'] == true && data['data'] is List) {
            _stores = data['data'];
          }
        }
      } catch (e) {
        debugPrint('Stores fetch error: $e');
      }
    } catch (e) {
      debugPrint('Error fetching grocery data: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _addItem(dynamic item) {
    final id = (item['_id'] ?? item['id']).toString();
    final price = (item['price'] as num?)?.toDouble() ?? 0.0;
    setState(() {
      _cartItems[id] = (_cartItems[id] ?? 0) + 1;
      _cartTotal += price;
    });
  }

  void _removeItem(dynamic item) {
    final id = (item['_id'] ?? item['id']).toString();
    final price = (item['price'] as num?)?.toDouble() ?? 0.0;
    if (!_cartItems.containsKey(id) || _cartItems[id]! <= 0) return;
    setState(() {
      if (_cartItems[id]! == 1) {
        _cartItems.remove(id);
      } else {
        _cartItems[id] = _cartItems[id]! - 1;
      }
      _cartTotal = (_cartTotal - price).clamp(0.0, 999999.0);
    });
  }

  int _getItemCount() {
    return _cartItems.values.fold(0, (sum, count) => sum + count);
  }

  @override
  Widget build(BuildContext context) {
    final totalItems = _getItemCount();
    final filteredProducts = _quickProducts.where((p) {
      if (_selectedCategory != 'All') {
        final catName =
            (p['category'] is Map ? p['category']['name'] : p['category'] ?? '')
                .toString()
                .toLowerCase();
        if (!catName.contains(_selectedCategory.toLowerCase())) return false;
      }
      if (_searchCtrl.text.trim().isNotEmpty) {
        final q = _searchCtrl.text.trim().toLowerCase();
        final name = (p['name'] ?? '').toString().toLowerCase();
        if (!name.contains(q)) return false;
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF16A34A),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text(
                  'ECDKART Mart',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white),
                ),
                const SizedBox(width: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.amber[400],
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    '10-15 MINS',
                    style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                        color: Colors.black87),
                  ),
                ),
              ],
            ),
            const Text(
              'Delivering to Indore • Managed live from Admin Tower',
              style: TextStyle(fontSize: 11, color: Colors.white70),
            ),
          ],
        ),
      ),
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: _fetchGroceryData,
            color: const Color(0xFF16A34A),
            child: CustomScrollView(
              slivers: [
                // Top Search Bar
                SliverToBoxAdapter(
                  child: Container(
                    color: const Color(0xFF16A34A),
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.06),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.search_rounded,
                              color: Color(0xFF16A34A)),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextField(
                              controller: _searchCtrl,
                              onChanged: (_) => setState(() {}),
                              decoration: const InputDecoration(
                                hintText:
                                    'Search products from live inventory...',
                                hintStyle:
                                    TextStyle(fontSize: 13, color: Colors.grey),
                                border: InputBorder.none,
                              ),
                            ),
                          ),
                          if (_searchCtrl.text.isNotEmpty)
                            GestureDetector(
                              onTap: () {
                                _searchCtrl.clear();
                                setState(() {});
                              },
                              child: const Icon(Icons.clear,
                                  size: 18, color: Colors.grey),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),

                // Promotional Banner (Dynamic from Admin)
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.fromLTRB(16, 14, 16, 10),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF15803D), Color(0xFF16A34A)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF16A34A).withOpacity(0.25),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        )
                      ],
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: Colors.amber[300],
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text(
                                  '⚡ LIVE ADMIN INVENTORY',
                                  style: TextStyle(
                                      color: Colors.black87,
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.w900),
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Fresh Farm Veggies &\nDaily Dairy at Best Rates',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  height: 1.2,
                                ),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Stock-managed in real time • Zero overselling',
                                style: TextStyle(
                                    color: Colors.white70, fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.18),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.shopping_bag_outlined,
                              color: Colors.white, size: 40),
                        ),
                      ],
                    ),
                  ),
                ),

                // Dynamic Categories Chips Row
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 44,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: _categories.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, index) {
                        final cat = _categories[index];
                        final isSelected = cat == _selectedCategory;
                        return ChoiceChip(
                          label: Text(
                            cat,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: isSelected
                                  ? FontWeight.bold
                                  : FontWeight.w600,
                              color: isSelected
                                  ? Colors.white
                                  : const Color(0xFF334155),
                            ),
                          ),
                          selected: isSelected,
                          selectedColor: const Color(0xFF16A34A),
                          backgroundColor: Colors.white,
                          elevation: isSelected ? 1 : 0,
                          pressElevation: 1,
                          side: BorderSide(
                            color: isSelected
                                ? const Color(0xFF16A34A)
                                : const Color(0xFFE2E8F0),
                            width: 1,
                          ),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          onSelected: (val) =>
                              setState(() => _selectedCategory = cat),
                        );
                      },
                    ),
                  ),
                ),

                // Section Title
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 20, 16, 10),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Live Products (${filteredProducts.length})',
                          style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF0F172A)),
                        ),
                        const Text(
                          '⚡ 10 mins',
                          style: TextStyle(
                              fontSize: 12,
                              color: Color(0xFF16A34A),
                              fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),

                // Dynamic Products Grid
                filteredProducts.isEmpty
                    ? const SliverToBoxAdapter(
                        child: Padding(
                          padding: EdgeInsets.all(32),
                          child: Center(
                            child: Text(
                              'No products found matching this filter in Indore.\nAdmin can add new products from the Admin Panel!',
                              textAlign: TextAlign.center,
                              style:
                                  TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                          ),
                        ),
                      )
                    : SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        sliver: SliverGrid(
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            mainAxisSpacing: 12,
                            crossAxisSpacing: 12,
                            mainAxisExtent: 220,
                          ),
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final item = filteredProducts[index];
                              final id = (item['_id'] ?? item['id']).toString();
                              final qty = _cartItems[id] ?? 0;
                              final inStock = item['inStock'] ??
                                  ((item['stockQuantity'] ?? 1) > 0);

                              return Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                      color: const Color(0xFFE2E8F0)),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.02),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      height: 100,
                                      width: double.infinity,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF16A34A)
                                            .withOpacity(0.08),
                                        borderRadius:
                                            const BorderRadius.vertical(
                                                top: Radius.circular(15)),
                                      ),
                                      child: Center(
                                        child: (item['image'] != null &&
                                                item['image']
                                                    .toString()
                                                    .startsWith('http'))
                                            ? Image.network(item['image'],
                                                fit: BoxFit.cover,
                                                errorBuilder: (_, __, ___) =>
                                                    const Icon(
                                                        Icons
                                                            .shopping_basket_rounded,
                                                        size: 40,
                                                        color:
                                                            Color(0xFF16A34A)))
                                            : const Icon(
                                                Icons.shopping_basket_rounded,
                                                size: 40,
                                                color: Color(0xFF16A34A)),
                                      ),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.all(10),
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            item['name'] ?? 'Item',
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                            style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12.5,
                                                height: 1.2),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            item['weight'] ??
                                                item['unit'] ??
                                                '1 unit',
                                            style: const TextStyle(
                                                fontSize: 11,
                                                color: Colors.grey,
                                                fontWeight: FontWeight.w500),
                                          ),
                                          const SizedBox(height: 8),
                                          Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: [
                                              Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    '₹${item['price'] ?? 0}',
                                                    style: const TextStyle(
                                                        fontSize: 14,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        color: Colors.black),
                                                  ),
                                                  if (item['mrp'] != null &&
                                                      item['mrp'] >
                                                          (item['price'] ?? 0))
                                                    Text(
                                                      '₹${item['mrp']}',
                                                      style: const TextStyle(
                                                        fontSize: 10,
                                                        color: Colors.grey,
                                                        decoration:
                                                            TextDecoration
                                                                .lineThrough,
                                                      ),
                                                    ),
                                                ],
                                              ),
                                              !inStock
                                                  ? Container(
                                                      padding: const EdgeInsets
                                                          .symmetric(
                                                          horizontal: 8,
                                                          vertical: 4),
                                                      decoration: BoxDecoration(
                                                          color:
                                                              Colors.grey[200],
                                                          borderRadius:
                                                              BorderRadius
                                                                  .circular(6)),
                                                      child: const Text(
                                                          'OUT OF STOCK',
                                                          style: TextStyle(
                                                              fontSize: 9,
                                                              color: Colors.red,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .bold)),
                                                    )
                                                  : qty == 0
                                                      ? SizedBox(
                                                          height: 32,
                                                          child: ElevatedButton(
                                                            onPressed: () =>
                                                                _addItem(item),
                                                            style:
                                                                ElevatedButton
                                                                    .styleFrom(
                                                              backgroundColor:
                                                                  const Color(
                                                                      0xFF16A34A),
                                                              foregroundColor:
                                                                  Colors.white,
                                                              elevation: 0,
                                                              padding:
                                                                  const EdgeInsets
                                                                      .symmetric(
                                                                      horizontal:
                                                                          14),
                                                              shape: RoundedRectangleBorder(
                                                                  borderRadius:
                                                                      BorderRadius
                                                                          .circular(
                                                                              8)),
                                                            ),
                                                            child: const Text(
                                                                'ADD',
                                                                style: TextStyle(
                                                                    fontSize:
                                                                        12,
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .bold)),
                                                          ),
                                                        )
                                                      : Container(
                                                          height: 32,
                                                          decoration:
                                                              BoxDecoration(
                                                            color: const Color(
                                                                0xFF16A34A),
                                                            borderRadius:
                                                                BorderRadius
                                                                    .circular(
                                                                        8),
                                                          ),
                                                          child: Row(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .min,
                                                            children: [
                                                              IconButton(
                                                                icon: const Icon(
                                                                    Icons
                                                                        .remove,
                                                                    size: 14,
                                                                    color: Colors
                                                                        .white),
                                                                padding:
                                                                    EdgeInsets
                                                                        .zero,
                                                                constraints:
                                                                    const BoxConstraints(
                                                                        minWidth:
                                                                            28),
                                                                onPressed: () =>
                                                                    _removeItem(
                                                                        item),
                                                              ),
                                                              Text(
                                                                '$qty',
                                                                style: const TextStyle(
                                                                    color: Colors
                                                                        .white,
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .bold,
                                                                    fontSize:
                                                                        13),
                                                              ),
                                                              IconButton(
                                                                icon: const Icon(
                                                                    Icons.add,
                                                                    size: 14,
                                                                    color: Colors
                                                                        .white),
                                                                padding:
                                                                    EdgeInsets
                                                                        .zero,
                                                                constraints:
                                                                    const BoxConstraints(
                                                                        minWidth:
                                                                            28),
                                                                onPressed: () =>
                                                                    _addItem(
                                                                        item),
                                                              ),
                                                            ],
                                                          ),
                                                        ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                            childCount: filteredProducts.length,
                          ),
                        ),
                      ),

                // Nearby Marts Section
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(16, 24, 16, 8),
                    child: Text(
                      'Partner Grocery Marts in Indore (From Admin)',
                      style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0F172A)),
                    ),
                  ),
                ),

                // Stores List
                _stores.isEmpty
                    ? const SliverToBoxAdapter(
                        child: Padding(
                          padding: EdgeInsets.all(28),
                          child: Center(
                            child: Text(
                              'Certified Indore grocery partners are verified by Admin.\nOrder directly from live products above!',
                              textAlign: TextAlign.center,
                              style:
                                  TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                          ),
                        ),
                      )
                    : SliverPadding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final s = _stores[index];
                              return Card(
                                elevation: 0,
                                margin: const EdgeInsets.only(bottom: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  side: const BorderSide(
                                      color: Color(0xFFE2E8F0)),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(14),
                                  child: Row(
                                    children: [
                                      ClipRRect(
                                        borderRadius: BorderRadius.circular(12),
                                        child: Container(
                                          width: 65,
                                          height: 65,
                                          color: const Color(0xFFE2E8F0),
                                          child: const Icon(
                                              Icons.storefront_rounded,
                                              color: Color(0xFF16A34A),
                                              size: 34),
                                        ),
                                      ),
                                      const SizedBox(width: 14),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              s['name'] ?? 'Indore Super Mart',
                                              style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 14.5),
                                            ),
                                            const SizedBox(height: 3),
                                            Text(
                                              s['address'] ?? 'Indore, MP',
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(
                                                  color: Colors.grey,
                                                  fontSize: 11.5),
                                            ),
                                            const SizedBox(height: 6),
                                            Row(
                                              children: [
                                                Container(
                                                  padding: const EdgeInsets
                                                      .symmetric(
                                                      horizontal: 6,
                                                      vertical: 2),
                                                  decoration: BoxDecoration(
                                                    color: Colors.amber[50],
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            4),
                                                  ),
                                                  child: Text(
                                                    '★ ${s['rating'] ?? '4.7'}',
                                                    style: TextStyle(
                                                        color:
                                                            Colors.amber[800],
                                                        fontSize: 10.5,
                                                        fontWeight:
                                                            FontWeight.bold),
                                                  ),
                                                ),
                                                const SizedBox(width: 8),
                                                Text(
                                                  '${s['deliveryTime'] ?? 15} mins • Free delivery',
                                                  style: const TextStyle(
                                                      fontSize: 11.5,
                                                      color: Colors.black54),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                      OutlinedButton(
                                        onPressed: () {
                                          ScaffoldMessenger.of(context)
                                              .showSnackBar(
                                            SnackBar(
                                                content: Text(
                                                    'Browsing ${s['name']}...')),
                                          );
                                        },
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor:
                                              const Color(0xFF16A34A),
                                          side: const BorderSide(
                                              color: Color(0xFF16A34A)),
                                          shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(8)),
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 12, vertical: 6),
                                        ),
                                        child: const Text('Store',
                                            style: TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12)),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                            childCount: _stores.length,
                          ),
                        ),
                      ),
              ],
            ),
          ),

          // Floating Bottom Cart Bar
          if (totalItems > 0)
            Positioned(
              bottom: 16,
              left: 16,
              right: 16,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF16A34A),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF16A34A).withOpacity(0.4),
                      blurRadius: 14,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.shopping_bag_rounded,
                          color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '$totalItems ${totalItems == 1 ? 'ITEM' : 'ITEMS'} ADDED',
                          style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 10,
                              fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '₹${_cartTotal.toStringAsFixed(0)}',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const Spacer(),
                    ElevatedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                                'Proceeding to checkout with $totalItems items (₹${_cartTotal.toStringAsFixed(0)})'),
                            backgroundColor: const Color(0xFF15803D),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF16A34A),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('View Cart',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 13)),
                          SizedBox(width: 4),
                          Icon(Icons.arrow_forward_rounded, size: 16),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
