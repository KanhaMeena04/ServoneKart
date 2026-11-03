/**
 * Master Comprehensive Dynamic Grocery & Super-Mart Catalog
 * 100% Dynamic matching Tricelyn Master Visual Design & Reference Mockup
 * Includes Hero Banner, Category Group Images, 3 Offer Banners, Best Sellers, and 20 Categories (160+ Products)
 */

const HERO_BANNERS = {
  hero: {
    id: "hero-main",
    title: "Groceries in Minutes.",
    subtitle: "Fresh produce · Daily essentials · Trusted brands",
    subBrand: "TRICELYN — Everything You Actually Want",
    buttonText: "Shop Now",
    buttonLink: "/categories",
    bagImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&q=80",
    badges: [
      { id: "b1", title: "Ultra Fast Delivery", subtitle: "10-30 mins", icon: "zap" },
      { id: "b2", title: "Fresh & Quality Guaranteed", subtitle: "Handpicked daily", icon: "shield" },
      { id: "b3", title: "Wide Range of Products", subtitle: "5,000+ essentials", icon: "bag" },
      { id: "b4", title: "Best Prices Everyday", subtitle: "Unbeatable discounts", icon: "tag" }
    ]
  },
  offerBanners: [
    {
      id: "offer-fruits-veg",
      tag: "Fresh Produce",
      title: "Fresh Fruits & Vegetables",
      highlight: "Up to 40% OFF",
      buttonText: "Shop Now",
      link: "/category/fruits-vegetables",
      bgGradient: "from-[#0066ff] via-[#0052cc] to-[#003d99]",
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80"
    },
    {
      id: "offer-daily-essentials",
      tag: "Pantry Savings",
      title: "Daily Essentials",
      highlight: "Save More Everyday",
      buttonText: "Shop Now",
      link: "/category/atta-rice-dal",
      bgGradient: "from-[#0a2558] via-[#0d3477] to-[#124296]",
      image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&q=80"
    },
    {
      id: "offer-top-brands",
      tag: "Direct Brand Mart",
      title: "Top Brands",
      highlight: "Lower Prices",
      buttonText: "Shop Now",
      link: "/category/snacks-munchies",
      bgGradient: "from-[#0070f3] via-[#005ce6] to-[#0047b3]",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80"
    }
  ],
  priorityBanner: {
    id: "priority-rider",
    title: "Your Groceries. Our Priority.",
    subtitle: "Fast. Safe. Reliable.",
    buttonText: "Learn More",
    buttonLink: "/about",
    riderImage: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&q=80",
    steps: [
      { id: "s1", title: "Order", desc: "Place your order in minutes", icon: "shopping-cart" },
      { id: "s2", title: "Pick", desc: "We pick fresh from our store", icon: "package" },
      { id: "s3", title: "Deliver", desc: "Get it at your doorstep in 10-30 mins", icon: "truck" }
    ]
  }
};

// 20 Categories with group product photos matching screenshot
const CATEGORIES = [
  {
    id: "cat_fruits_vegetables",
    name: "Fruits & Vegetables",
    shortName: "Fruits & Veg",
    slug: "fruits-vegetables",
    position: 1,
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80",
    icon: "🥦",
    description: "Farm-fresh vegetables, seasonal exotic fruits & organic produce"
  },
  {
    id: "cat_dairy_bakery",
    name: "Dairy & Bakery",
    shortName: "Dairy & Bakery",
    slug: "dairy-bread-eggs",
    position: 2,
    image: "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=400&q=80",
    icon: "🥛",
    description: "Fresh milk, curd, butter, paneer, artisan bread and bakery treats"
  },
  {
    id: "cat_snacks_beverages",
    name: "Snacks & Beverages",
    shortName: "Snacks & Beverages",
    slug: "snacks-munchies",
    position: 3,
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80",
    icon: "🍟",
    description: "Chips, namkeen, cold soft drinks, juices, biscuits and chocolates"
  },
  {
    id: "cat_atta_rice_dal",
    name: "Atta, Rice & Dal",
    shortName: "Atta, Rice & Dal",
    slug: "atta-rice-dal",
    position: 4,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
    icon: "🌾",
    description: "Chakki fresh atta, premium basmati rice, lentils and cooking grains"
  },
  {
    id: "cat_personal_care",
    name: "Personal Care",
    shortName: "Personal Care",
    slug: "personal-care",
    position: 5,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
    icon: "🧴",
    description: "Haircare, body wash, oral care, skincare and grooming essentials"
  },
  {
    id: "cat_household",
    name: "Household Essentials",
    shortName: "Household",
    slug: "cleaning-essentials",
    position: 6,
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80",
    icon: "🧼",
    description: "Detergents, cleaners, dishwash liquids, trash bags and disinfectants"
  },
  {
    id: "cat_pet_care",
    name: "Pet Care",
    shortName: "Pet Care",
    slug: "pet-care",
    position: 7,
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
    icon: "🐾",
    description: "Dog food, cat food, pet treats, hygiene products and pet toys"
  },
  {
    id: "cat_baby_care",
    name: "Baby Care",
    shortName: "Baby Care",
    slug: "baby-care",
    position: 8,
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
    icon: "🍼",
    description: "Baby diapers, wet wipes, baby lotions, shampoos and baby food"
  },
  {
    id: "cat_paan_corner",
    name: "Paan Corner & Mints",
    shortName: "Paan Corner",
    slug: "paan-corner",
    position: 9,
    image: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=400&q=80",
    icon: "🍃",
    description: "Mouth fresheners, digestive candies, mint sprays & chewing gums"
  },
  {
    id: "cat_cold_drinks",
    name: "Cold Drinks & Juices",
    shortName: "Drinks & Juices",
    slug: "cold-drinks-juices",
    position: 10,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80",
    icon: "🥤",
    description: "Fizzy sodas, pure drinking water, ice bags and real fruit juices"
  },
  {
    id: "cat_breakfast",
    name: "Breakfast & Instant Food",
    shortName: "Breakfast Food",
    slug: "breakfast-instant-food",
    position: 11,
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&q=80",
    icon: "🥣",
    description: "Maggi, noodles, cornflakes, muesli, oats and instant mixes"
  },
  {
    id: "cat_sweet_tooth",
    name: "Sweet Tooth",
    shortName: "Sweet Tooth",
    slug: "sweet-tooth",
    position: 12,
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80",
    icon: "🍫",
    description: "Chocolates, mithai, desserts, brownies, candies and ice cream"
  },
  {
    id: "cat_bakery_biscuits",
    name: "Bakery & Biscuits",
    shortName: "Biscuits & Cakes",
    slug: "bakery-biscuits",
    position: 13,
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80",
    icon: "🍪",
    description: "Cookies, cream biscuits, rusk, cakes, buns and tea-time snacks"
  },
  {
    id: "cat_tea_coffee",
    name: "Tea, Coffee & Drinks",
    shortName: "Tea & Coffee",
    slug: "tea-coffee-milk-drinks",
    position: 14,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80",
    icon: "☕",
    description: "Chai patti, green tea, instant coffee, Horlicks, Bournvita"
  },
  {
    id: "cat_masala_oil",
    name: "Masala, Oil & More",
    shortName: "Masala & Oil",
    slug: "masala-oil-more",
    position: 15,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
    icon: "🧂",
    description: "Cooking oil, ghee, whole spices, turmeric, red chilli & garam masala"
  },
  {
    id: "cat_sauces_spreads",
    name: "Sauces & Spreads",
    shortName: "Sauces & Jams",
    slug: "sauces-spreads",
    position: 16,
    image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80",
    icon: "🍯",
    description: "Ketchup, mayonnaise, peanut butter, jam, dips & pasta sauces"
  },
  {
    id: "cat_chicken_meat",
    name: "Chicken, Meat & Fish",
    shortName: "Meat & Fish",
    slug: "chicken-meat-fish",
    position: 17,
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80",
    icon: "🍗",
    description: "Fresh chicken breast, mutton curry cut, fish fillets and eggs"
  },
  {
    id: "cat_organic",
    name: "Organic & Healthy Living",
    shortName: "Organic Health",
    slug: "organic-healthy-living",
    position: 18,
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80",
    icon: "🥗",
    description: "Organic honey, brown rice, chia seeds, dry fruits & nuts"
  },
  {
    id: "cat_pharma",
    name: "Pharma & Wellness",
    shortName: "Pharma",
    slug: "pharma-wellness",
    position: 19,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
    icon: "💊",
    description: "First aid, pain relief balm, antacids, ORS, band-aids & vitamins"
  },
  {
    id: "cat_home_office",
    name: "Home & Office",
    shortName: "Home & Office",
    slug: "home-office",
    position: 20,
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
    icon: "💡",
    description: "Batteries, bulbs, stationery, notebooks, pens and tissue paper"
  }
];

// Best Sellers directly matching the attached screenshot
const BEST_SELLERS = [
  {
    _id: "prod_best_banana",
    id: "prod_best_banana",
    name: "Banana",
    weight: "1 kg",
    unit: "kg",
    price: 45,
    mrp: 60,
    discountPercent: 24,
    rating: 4.5,
    ratingsCount: "2.4k",
    image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&q=80",
    categorySlug: "fruits-vegetables",
    categoryName: "Fruits & Vegetables",
    inStock: true,
    deliveryTime: "10-15m"
  },
  {
    _id: "prod_best_milk",
    id: "prod_best_milk",
    name: "Amul Toned Milk",
    weight: "1 ltr",
    unit: "ltr",
    price: 54,
    mrp: 60,
    discountPercent: 10,
    rating: 4.7,
    ratingsCount: "1.8k",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80",
    categorySlug: "dairy-bread-eggs",
    categoryName: "Dairy & Bakery",
    inStock: true,
    deliveryTime: "10-15m"
  },
  {
    _id: "prod_best_tomato",
    id: "prod_best_tomato",
    name: "Tomato",
    weight: "1 kg",
    unit: "kg",
    price: 32,
    mrp: 48,
    discountPercent: 34,
    rating: 4.3,
    ratingsCount: "1.2k",
    image: "https://images.unsplash.com/photo-1546470427-e26264be0b11?w=400&q=80",
    categorySlug: "fruits-vegetables",
    categoryName: "Fruits & Vegetables",
    inStock: true,
    deliveryTime: "10-15m"
  },
  {
    _id: "prod_best_bread",
    id: "prod_best_bread",
    name: "Britannia Whole Wheat Bread",
    weight: "400 g",
    unit: "loaf",
    price: 45,
    mrp: 60,
    discountPercent: 25,
    rating: 4.6,
    ratingsCount: "2.5k",
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80",
    categorySlug: "dairy-bread-eggs",
    categoryName: "Dairy & Bakery",
    inStock: true,
    deliveryTime: "10-15m"
  },
  {
    _id: "prod_best_lays",
    id: "prod_best_lays",
    name: "Lay's Classic Salted",
    weight: "52 g",
    unit: "pack",
    price: 20,
    mrp: 25,
    discountPercent: 20,
    rating: 4.4,
    ratingsCount: "980",
    image: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&q=80",
    categorySlug: "snacks-munchies",
    categoryName: "Snacks & Beverages",
    inStock: true,
    deliveryTime: "10-15m"
  },
  {
    _id: "prod_best_eggs",
    id: "prod_best_eggs",
    name: "Eggs",
    weight: "6 pcs",
    unit: "tray",
    price: 42,
    mrp: 56,
    discountPercent: 24,
    rating: 4.5,
    ratingsCount: "1.1k",
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80",
    categorySlug: "dairy-bread-eggs",
    categoryName: "Dairy & Bakery",
    inStock: true,
    deliveryTime: "10-15m"
  }
];

// Rich Product Catalog by Category (8 to 10 products each)
const PRODUCTS_BY_CATEGORY = {
  "fruits-vegetables": [
    ...BEST_SELLERS.filter(p => p.categorySlug === "fruits-vegetables"),
    {
      name: "Fresh Red Onion (Pyaaz)",
      weight: "1 kg",
      unit: "kg",
      price: 38,
      mrp: 48,
      image: "https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=400&q=80",
      description: "Crisp, pungent Indian red salad and curry onions."
    },
    {
      name: "Fresh Malwa Farm Potatoes (Aloo)",
      weight: "1 kg",
      unit: "kg",
      price: 28,
      mrp: 35,
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80",
      description: "Clean farm-fresh cooking potatoes."
    },
    {
      name: "Shimla Royal Delicious Red Apples",
      weight: "1 kg",
      unit: "pack",
      price: 180,
      mrp: 220,
      image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80",
      description: "Sweet, crunchy and aromatic orchard fresh apples."
    },
    {
      name: "Green Bell Capsicum (Shimla Mirch)",
      weight: "500 g",
      unit: "pack",
      price: 40,
      mrp: 55,
      image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80",
      description: "Crunchy green bell peppers for pizza and curries."
    },
    {
      name: "Juicy Yellow Lemons (Nimbu)",
      weight: "250 g",
      unit: "pack",
      price: 30,
      mrp: 40,
      image: "https://images.unsplash.com/photo-1587496679742-bad502958fbe?w=400&q=80",
      description: "Tangy high-juice fresh yellow lemons."
    },
    {
      name: "Fresh Green Coriander (Dhaniya)",
      weight: "100 g",
      unit: "bunch",
      price: 12,
      mrp: 15,
      image: "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=400&q=80",
      description: "Aromatic fragrant green coriander bunch."
    }
  ],

  "dairy-bread-eggs": [
    ...BEST_SELLERS.filter(p => p.categorySlug === "dairy-bread-eggs"),
    {
      name: "Amul Gold Full Cream Fresh Milk",
      weight: "500 ml",
      unit: "pouch",
      price: 35,
      mrp: 35,
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80",
      description: "Rich and wholesome pasteurized full cream milk."
    },
    {
      name: "Amul Masti Dahi Pouch Curd",
      weight: "400 g",
      unit: "pouch",
      price: 35,
      mrp: 35,
      image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=400&q=80",
      description: "Thick, creamy and delicious curd made from pasteurized milk."
    },
    {
      name: "Amul Pasteurised Salted Butter",
      weight: "500 g",
      unit: "block",
      price: 285,
      mrp: 290,
      image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80",
      description: "The classic Utterly Butterly Delicious table butter."
    },
    {
      name: "Amul Processed Cheese Cubes",
      weight: "200 g",
      unit: "pack",
      price: 132,
      mrp: 140,
      image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80",
      description: "Wholesome individual cheese cubes for snacks and breakfast."
    },
    {
      name: "Amul Malai Fresh Paneer",
      weight: "200 g",
      unit: "pack",
      price: 90,
      mrp: 95,
      image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=400&q=80",
      description: "Soft and fresh malai cottage cheese for curries."
    }
  ],

  "snacks-munchies": [
    ...BEST_SELLERS.filter(p => p.categorySlug === "snacks-munchies"),
    {
      name: "Lay's India's Magic Masala Chips",
      weight: "50 g",
      unit: "pack",
      price: 20,
      mrp: 20,
      image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80",
      description: "Crispy ridged potato chips spiced with iconic Indian seasonings."
    },
    {
      name: "Kurkure Masala Munch Crispy Puffs",
      weight: "85 g",
      unit: "pack",
      price: 20,
      mrp: 20,
      image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80",
      description: "Crunchy tea-time corn twists loaded with spicy masala."
    },
    {
      name: "Haldiram's Nagpur Aloo Bhujia",
      weight: "400 g",
      unit: "pouch",
      price: 110,
      mrp: 120,
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80",
      description: "Classic spicy potato mint sev snack."
    },
    {
      name: "Doritos Cheese Supreme Nachos",
      weight: "60 g",
      unit: "pack",
      price: 30,
      mrp: 30,
      image: "https://images.unsplash.com/photo-1518013034458-30b0ee243591?w=400&q=80",
      description: "Crunchy toasted triangle corn chips with melted cheese flavor."
    },
    {
      name: "Pringles Sour Cream & Onion",
      weight: "107 g",
      unit: "can",
      price: 115,
      mrp: 125,
      image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80",
      description: "Stacked potato crisps with sour cream tang."
    },
    {
      name: "Act II Instant Golden Sizzle Popcorn",
      weight: "70 g",
      unit: "pouch",
      price: 35,
      mrp: 40,
      image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&q=80",
      description: "Buttery delicious pressure-cooker ready golden popcorn."
    },
    {
      name: "Haldiram's Khatta Meetha Mixture",
      weight: "400 g",
      unit: "pouch",
      price: 95,
      mrp: 105,
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80",
      description: "Sweet and sour blend of sev, peas, boondi and nuts."
    }
  ],

  "atta-rice-dal": [
    {
      name: "Aashirvaad Shudh Chakki Whole Wheat Atta",
      weight: "5 kg",
      unit: "bag",
      price: 245,
      mrp: 280,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
      description: "100% pure MP wheat stone-ground chakki fresh flour for soft rotis."
    },
    {
      name: "Fortune Rozana Premium Basmati Rice",
      weight: "5 kg",
      unit: "bag",
      price: 395,
      mrp: 475,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
      description: "Long grain aromatic basmati rice for everyday pulav and biryani."
    },
    {
      name: "Tata Sampann Unpolished Toor Dal",
      weight: "1 kg",
      unit: "pouch",
      price: 175,
      mrp: 195,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
      description: "Natural unpolished pigeon peas rich in plant protein."
    },
    {
      name: "Tata Salt Vacuum Evaporated Iodized Salt",
      weight: "1 kg",
      unit: "pouch",
      price: 28,
      mrp: 30,
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
      description: "Desh Ka Namak with guaranteed purity and iodine."
    },
    {
      name: "Tata Sampann Moong Dal Dhuli",
      weight: "1 kg",
      unit: "pouch",
      price: 155,
      mrp: 170,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
      description: "Quick cooking easy-digest yellow split lentils."
    },
    {
      name: "Fortune Premium Kachi Ghani Mustard Oil",
      weight: "1 ltr",
      unit: "bottle",
      price: 145,
      mrp: 165,
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80",
      description: "Cold-pressed pungent sarson tel with rich natural aroma."
    },
    {
      name: "Fortune Sunlite Refined Sunflower Oil",
      weight: "1 ltr",
      unit: "pouch",
      price: 135,
      mrp: 155,
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80",
      description: "Light, healthy edible cooking oil with Vitamin A and D."
    },
    {
      name: "Madhur Pure & Hygienic Sugar",
      weight: "1 kg",
      unit: "pouch",
      price: 52,
      mrp: 60,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
      description: "Sulfur-free sparkling white crystal sugar."
    }
  ],

  "personal-care": [
    {
      name: "Colgate MaxFresh Peppermint Toothpaste",
      weight: "150 g",
      unit: "tube",
      price: 115,
      mrp: 130,
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
      description: "Infused with cooling breath strips for intense all-morning freshness."
    },
    {
      name: "Dettol Original Germ Protection Soap",
      weight: "125 g (Pack of 4)",
      unit: "pack",
      price: 185,
      mrp: 210,
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
      description: "Trusted pine fragrance protecting from 100 illness-causing germs."
    },
    {
      name: "Head & Shoulders Cool Menthol Anti-Dandruff",
      weight: "340 ml",
      unit: "bottle",
      price: 340,
      mrp: 399,
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
      description: "Up to 100% flake-free scalp with cooling menthol sensation."
    },
    {
      name: "Nivea Men Fresh Active Deodorant Roll-On",
      weight: "50 ml",
      unit: "roll-on",
      price: 155,
      mrp: 199,
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
      description: "48-hour ocean extracts sweat protection with zero alcohol."
    },
    {
      name: "Dove Deeply Nourishing Body Wash",
      weight: "250 ml",
      unit: "bottle",
      price: 195,
      mrp: 240,
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
      description: "1/4 moisturizing cream formulation giving instant soft skin."
    },
    {
      name: "Garnier Men Acno Fight Face Wash",
      weight: "100 g",
      unit: "tube",
      price: 175,
      mrp: 215,
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
      description: "Salicylic bark and herba repair fighting 99.9% acne-causing bacteria."
    },
    {
      name: "Parachute 100% Pure Coconut Hair Oil",
      weight: "500 ml",
      unit: "bottle",
      price: 185,
      mrp: 210,
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
      description: "Naturally sun-dried copras giving pure edible-grade hair nourishment."
    },
    {
      name: "Gillette Mach3 Turbo Razor + 1 Cartridge",
      weight: "1 set",
      unit: "pack",
      price: 295,
      mrp: 350,
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
      description: "Sharper turbo blades with long-lasting comforting lubrication strip."
    }
  ],

  "cleaning-essentials": [
    {
      name: "Surf Excel Easy Wash Detergent Powder",
      weight: "1 kg",
      unit: "pouch",
      price: 135,
      mrp: 150,
      image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80",
      description: "Engineered with super budget stain removal power."
    },
    {
      name: "Vim Dishwash Gel Lemon Liquid",
      weight: "750 ml",
      unit: "bottle",
      price: 155,
      mrp: 180,
      image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80",
      description: "Power of 100 lemons degreasing greasy kadhais easily."
    },
    {
      name: "Harpic Power Plus Toilet Cleaner",
      weight: "1 ltr",
      unit: "bottle",
      price: 185,
      mrp: 215,
      image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80",
      description: "10x better stain removal killing 99.9% germs."
    },
    {
      name: "Lizol Disinfectant Surface Cleaner Floral",
      weight: "1 ltr",
      unit: "bottle",
      price: 195,
      mrp: 230,
      image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80",
      description: "Triple-action floor disinfectant leaving sweet floral fragrance."
    },
    {
      name: "Comfort Morning Fresh Fabric Conditioner",
      weight: "860 ml",
      unit: "bottle",
      price: 220,
      mrp: 255,
      image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80",
      description: "Softens fabric fibers and gives all-day blossom freshness."
    },
    {
      name: "Scotch-Brite Sponge Wipe (Pack of 3)",
      weight: "3 pcs",
      unit: "pack",
      price: 120,
      mrp: 145,
      image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80",
      description: "Cellulose sponge absorbing 10x water without lint streaks."
    },
    {
      name: "Odonil Room Air Freshener Jasmine Block",
      weight: "50 g",
      unit: "pack",
      price: 52,
      mrp: 60,
      image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80",
      description: "Continuous fresh fragrance for bathroom and wardrobe."
    },
    {
      name: "Shalimar Biodegradable Garbage Bags (M)",
      weight: "30 bags",
      unit: "roll",
      price: 95,
      mrp: 125,
      image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80",
      description: "Leak-proof tie-string green disposable waste bags."
    }
  ],

  "pet-care": [
    {
      name: "Pedigree Adult Dry Dog Food Meat & Rice",
      weight: "1.2 kg",
      unit: "pouch",
      price: 330,
      mrp: 375,
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
      description: "Complete nutrition with dietary protein and essential zinc."
    },
    {
      name: "Whiskas Adult Wet Cat Food Salmon Gravy",
      weight: "85 g (Pack of 4)",
      unit: "pack",
      price: 180,
      mrp: 200,
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
      description: "Delicious real salmon flakes in savory tempting gravy."
    },
    {
      name: "Drools Absolute Calcium Dog Bones",
      weight: "30 treats",
      unit: "jar",
      price: 195,
      mrp: 230,
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
      description: "Chewable dental calcium bones supporting strong teeth and joints."
    },
    {
      name: "Himalaya Erina-EP Flea & Tick Dog Shampoo",
      weight: "200 ml",
      unit: "bottle",
      price: 175,
      mrp: 210,
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
      description: "Ayurvedic neem and eucalyptus formula warding off ectoparasites."
    },
    {
      name: "Pedigree Dentastix Medium Dog Dental Chews",
      weight: "7 sticks (180 g)",
      unit: "pack",
      price: 195,
      mrp: 230,
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
      description: "Reduces tartar build-up by up to 80% with X-shape texture."
    },
    {
      name: "Trixie Dog Squeaky Vinyl Chew Ball Toy",
      weight: "1 pc",
      unit: "unit",
      price: 130,
      mrp: 160,
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
      description: "Durable non-toxic fetch ball keeping pets playfully active."
    },
    {
      name: "Sheba Premium Cat Food Chicken Loaf",
      weight: "70 g",
      unit: "can",
      price: 65,
      mrp: 75,
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
      description: "Fine succulent shredded chicken loaf for feline gourmet meals."
    },
    {
      name: "Drools 100% Clumping Bentonite Cat Litter",
      weight: "5 kg",
      unit: "bag",
      price: 360,
      mrp: 450,
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
      description: "Fast-acting odor locking clumping litter for easy scoop."
    }
  ],

  "baby-care": [
    {
      name: "Pampers All-Round Protection Pants (M)",
      weight: "54 pcs",
      unit: "pack",
      price: 749,
      mrp: 999,
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
      description: "12-hour leak-proof lock diapers with anti-rash lotion."
    },
    {
      name: "Himalaya Gentle Baby Wipes with Aloe",
      weight: "72 wipes",
      unit: "pack",
      price: 135,
      mrp: 175,
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
      description: "Extra soft paraben-free baby wipes for diaper change."
    },
    {
      name: "Johnson's Baby No-More-Tears Shampoo",
      weight: "200 ml",
      unit: "bottle",
      price: 185,
      mrp: 210,
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
      description: "Gentle tear-free formula leaving fine baby hair soft and shiny."
    },
    {
      name: "Nestlé Cerelac Wheat Apple Baby Cereal",
      weight: "300 g",
      unit: "box",
      price: 275,
      mrp: 295,
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
      description: "Stage 1 baby food rich in iron and 16 vital nutrients."
    },
    {
      name: "Himalaya Baby Massage Oil",
      weight: "200 ml",
      unit: "bottle",
      price: 160,
      mrp: 190,
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
      description: "Olive oil and winter cherry blend nourishing baby skin."
    },
    {
      name: "Sebamed Baby Cleansing Bar (Soap)",
      weight: "100 g",
      unit: "bar",
      price: 235,
      mrp: 260,
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
      description: "pH 5.5 soap-free moisturizing bar protecting acid mantle."
    },
    {
      name: "MamyPoko Extra Absorb Pant Diapers (L)",
      weight: "44 pcs",
      unit: "pack",
      price: 699,
      mrp: 899,
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
      description: "Crisscross absorbent sheet spreading urine evenly without heaviness."
    },
    {
      name: "Pigeon Wide Neck Feeding Bottle 240ml",
      weight: "1 pc",
      unit: "unit",
      price: 380,
      mrp: 420,
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
      description: "BPA-free peristaltic plus teat reducing air intake and colic."
    }
  ]
};

// Multi-Vendor Store Distribution across Indore
const STORE_DISTRIBUTION = {
  "dairy-bread-eggs": { id: "store_tricelyn_indore_01", name: "Tricelyn Express Mart (Vijay Nagar Hub)", address: "Scheme 54, Vijay Nagar, Indore 452010", rating: 4.8 },
  "fruits-vegetables": { id: "store_tricelyn_indore_02", name: "Fresh Farm Hub (Palasia Superstore)", address: "Old Palasia Main Road, Near Industry House, Indore 452001", rating: 4.7 },
  "atta-rice-dal": { id: "store_tricelyn_indore_03", name: "Apna Super Kirana (Saket Nagar)", address: "Saket Square, Near Anand Bazaar, Indore 452018", rating: 4.6 },
  "masala-oil-more": { id: "store_tricelyn_indore_03", name: "Apna Super Kirana (Saket Nagar)", address: "Saket Square, Near Anand Bazaar, Indore 452018", rating: 4.6 },
  "snacks-munchies": { id: "store_tricelyn_indore_04", name: "Malwa Daily Mart (Bhawarkua Square)", address: "Tower Chouraha, Bhawarkua Main Road, Indore 452001", rating: 4.5 },
  "cold-drinks-juices": { id: "store_tricelyn_indore_04", name: "Malwa Daily Mart (Bhawarkua Square)", address: "Tower Chouraha, Bhawarkua Main Road, Indore 452001", rating: 4.5 },
  "breakfast-instant-food": { id: "store_tricelyn_indore_04", name: "Malwa Daily Mart (Bhawarkua Square)", address: "Tower Chouraha, Bhawarkua Main Road, Indore 452001", rating: 4.5 },
  "sweet-tooth": { id: "store_tricelyn_indore_04", name: "Malwa Daily Mart (Bhawarkua Square)", address: "Tower Chouraha, Bhawarkua Main Road, Indore 452001", rating: 4.5 },
  "tea-coffee": { id: "store_tricelyn_indore_05", name: "Rajwada Heritage Grocery & Dry Fruits", address: "MG Road, Near Rajwada Palace, Indore 452002", rating: 4.9 },
  "organic-healthy": { id: "store_tricelyn_indore_05", name: "Rajwada Heritage Grocery & Dry Fruits", address: "MG Road, Near Rajwada Palace, Indore 452002", rating: 4.9 },
  "bakery-biscuits": { id: "store_tricelyn_indore_01", name: "Tricelyn Express Mart (Vijay Nagar Hub)", address: "Scheme 54, Vijay Nagar, Indore 452010", rating: 4.8 },
  "personal-care": { id: "store_tricelyn_indore_06", name: "Metro Mart Quickstore (Super Corridor)", address: "Sector A, Super Corridor Highway, Indore 452005", rating: 4.7 },
  "household-essentials": { id: "store_tricelyn_indore_06", name: "Metro Mart Quickstore (Super Corridor)", address: "Sector A, Super Corridor Highway, Indore 452005", rating: 4.7 },
  "cleaning-essentials": { id: "store_tricelyn_indore_06", name: "Metro Mart Quickstore (Super Corridor)", address: "Sector A, Super Corridor Highway, Indore 452005", rating: 4.7 },
  "baby-care": { id: "store_tricelyn_indore_06", name: "Metro Mart Quickstore (Super Corridor)", address: "Sector A, Super Corridor Highway, Indore 452005", rating: 4.7 },
  "pet-care": { id: "store_tricelyn_indore_06", name: "Metro Mart Quickstore (Super Corridor)", address: "Sector A, Super Corridor Highway, Indore 452005", rating: 4.7 },
  "paan-corner": { id: "store_tricelyn_indore_04", name: "Malwa Daily Mart (Bhawarkua Square)", address: "Tower Chouraha, Bhawarkua Main Road, Indore 452001", rating: 4.5 }
};

// Flatten all catalog products
const ALL_CATALOG_PRODUCTS = [];
Object.entries(PRODUCTS_BY_CATEGORY).forEach(([catSlug, items]) => {
  const catObj = CATEGORIES.find(c => c.slug === catSlug);
  const assignedStore = STORE_DISTRIBUTION[catSlug] || {
    id: "store_tricelyn_indore_01",
    name: "Tricelyn Express Mart (Vijay Nagar Hub)",
    address: "Scheme 54, Vijay Nagar, Indore 452010",
    rating: 4.8
  };

  items.forEach((item, idx) => {
    const price = Number(item.price) || 50;
    const mrp = Number(item.mrp) || Math.round(price * 1.25);
    const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    ALL_CATALOG_PRODUCTS.push({
      _id: item._id || `prod_${catSlug}_${idx + 1}`,
      id: item.id || `prod_${catSlug}_${idx + 1}`,
      name: item.name,
      slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: item.description,
      category: {
        _id: catObj ? catObj.id : catSlug,
        id: catObj ? catObj.id : catSlug,
        name: catObj ? catObj.name : catSlug,
        slug: catSlug,
      },
      categorySlug: catSlug,
      categoryName: catObj ? catObj.name : catSlug,
      // Vendor / Store Linking
      restaurant: assignedStore.id,
      restaurantId: assignedStore.id,
      restaurantName: assignedStore.name,
      storeId: assignedStore.id,
      storeName: assignedStore.name,
      storeAddress: assignedStore.address,
      storeRating: assignedStore.rating,
      vendorName: assignedStore.name,
      vendorId: assignedStore.id,
      price: price,
      mrp: mrp,
      discountPercent: item.discountPercent || discountPercent,
      weight: item.weight,
      unit: item.unit || 'unit',
      image: item.image,
      inStock: true,
      stockQuantity: 100,
      vertical: 'grocery',
      deliveryTime: item.deliveryTime || '10-15m',
      rating: item.rating || (4.4 + ((idx * 0.1) % 0.6)).toFixed(1),
      ratingsCount: item.ratingsCount || (120 + idx * 85),
      isApproved: true,
      isPublished: true,
      approvalStatus: 'approved'
    });
  });
});

module.exports = {
  HERO_BANNERS,
  CATEGORIES,
  BEST_SELLERS,
  PRODUCTS_BY_CATEGORY,
  ALL_CATALOG_PRODUCTS
};
