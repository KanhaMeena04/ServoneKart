class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final double? mrp;
  final String image;
  final String category;
  final double rating;
  final bool isVeg;
  final String? weight;
  final String? unit;
  final String? vertical;
  final String? storeId;
  final String? storeName;
  final String? restaurantId;
  final String? restaurantName;
  final String? restaurantImageUrl;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.mrp,
    required this.image,
    required this.category,
    this.rating = 4.0,
    this.isVeg = true,
    this.weight,
    this.unit,
    this.vertical,
    this.storeId,
    this.storeName,
    this.restaurantId,
    this.restaurantName,
    this.restaurantImageUrl,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    final resolvedStoreId = (json['storeId'] ?? json['restaurantId'])?.toString();
    final resolvedStoreName = (json['storeName'] ?? json['restaurantName'])?.toString();
    return Product(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      mrp: (json['mrp'] as num?)?.toDouble(),
      image: (json['image'] ?? '').toString(),
      category: (json['category'] ?? '').toString(),
      rating: (json['rating'] as num?)?.toDouble() ?? 4.0,
      isVeg: json['isVeg'] ?? true,
      weight: json['weight']?.toString(),
      unit: json['unit']?.toString(),
      vertical: json['vertical']?.toString(),
      storeId: resolvedStoreId,
      storeName: resolvedStoreName,
      restaurantId: resolvedStoreId,
      restaurantName: resolvedStoreName,
      restaurantImageUrl: json['restaurantImageUrl']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      if (mrp != null) 'mrp': mrp,
      'image': image,
      'category': category,
      'rating': rating,
      'isVeg': isVeg,
      if (weight != null) 'weight': weight,
      if (unit != null) 'unit': unit,
      if (vertical != null) 'vertical': vertical,
      if (storeId != null) 'storeId': storeId,
      if (storeName != null) 'storeName': storeName,
      if (restaurantId != null) 'restaurantId': restaurantId,
      if (restaurantName != null) 'restaurantName': restaurantName,
      if (restaurantImageUrl != null) 'restaurantImageUrl': restaurantImageUrl,
    };
  }
}
