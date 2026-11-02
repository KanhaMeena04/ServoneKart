/**
 * Comprehensive Dynamic Grocery & Super-Mart Catalog
 * 20 Quick-Commerce Categories with 8-10 Authentic Products Each (160+ Products)
 * Includes Hero Banner and 3 Promo Feature Banners matching Reference Images 1, 2, and 3
 */

const HERO_BANNERS = {
  topBanner: {
    id: "hero-daily-essentials",
    title: "Stock up on daily essentials",
    subtitle: "Get farm-fresh goodness & a range of exotic fruits, vegetables, eggs & more",
    buttonText: "Shop Now",
    link: "/category/fruits-vegetables",
    bgGradient: "from-emerald-700 via-emerald-800 to-green-900",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&q=80",
    badge: "10-15 Min Delivery"
  },
  subBanners: [
    {
      id: "promo-pharmacy",
      title: "Pharmacy at your doorstep!",
      subtitle: "Cough syrups, pain relief sprays & more",
      buttonText: "Order Now",
      link: "/category/pharma-wellness",
      bgColor: "bg-teal-500",
      textColor: "text-white",
      tag: "Medicines in 10 mins",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
    },
    {
      id: "promo-petcare",
      title: "Pet care supplies at your door",
      subtitle: "Food, treats, toys & more",
      buttonText: "Order Now",
      link: "/category/pet-care",
      bgColor: "bg-amber-400",
      textColor: "text-amber-950",
      tag: "Pet Mart Live",
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80"
    },
    {
      id: "promo-babycare",
      title: "No time for a diaper run?",
      subtitle: "Get baby care essentials in minutes",
      buttonText: "Order Now",
      link: "/category/baby-care",
      bgColor: "bg-sky-200",
      textColor: "text-sky-950",
      tag: "Mom & Baby Care",
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80"
    }
  ]
};

const CATEGORIES = [
  {
    id: "cat_paan_corner",
    name: "Paan Corner",
    slug: "paan-corner",
    position: 1,
    image: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=300&q=80",
    icon: "🍃",
    description: "Mouth fresheners, paan flavours, digestive candies & mints"
  },
  {
    id: "cat_dairy_bread_eggs",
    name: "Dairy, Bread & Eggs",
    slug: "dairy-bread-eggs",
    position: 2,
    image: "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=300&q=80",
    icon: "🥛",
    description: "Fresh milk, paneer, butter, curd, bread, toast and farm eggs"
  },
  {
    id: "cat_fruits_vegetables",
    name: "Fruits & Vegetables",
    slug: "fruits-vegetables",
    position: 3,
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=80",
    icon: "🥦",
    description: "Farm fresh vegetables, seasonal fresh fruits and herbs"
  },
  {
    id: "cat_cold_drinks_juices",
    name: "Cold Drinks & Juices",
    slug: "cold-drinks-juices",
    position: 4,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&q=80",
    icon: "🥤",
    description: "Soft drinks, energy drinks, mineral water, mocktails and juices"
  },
  {
    id: "cat_snacks_munchies",
    name: "Snacks & Munchies",
    slug: "snacks-munchies",
    position: 5,
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&q=80",
    icon: "🍟",
    description: "Chips, namkeen, bhujia, popcorn, nachos and roasted bites"
  },
  {
    id: "cat_breakfast_instant_food",
    name: "Breakfast & Instant Food",
    slug: "breakfast-instant-food",
    position: 6,
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=300&q=80",
    icon: "🥣",
    description: "Maggi, noodles, cornflakes, muesli, oats and instant mixes"
  },
  {
    id: "cat_sweet_tooth",
    name: "Sweet Tooth",
    slug: "sweet-tooth",
    position: 7,
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&q=80",
    icon: "🍫",
    description: "Chocolates, mithai, desserts, brownies, candies and ice cream"
  },
  {
    id: "cat_bakery_biscuits",
    name: "Bakery & Biscuits",
    slug: "bakery-biscuits",
    position: 8,
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&q=80",
    icon: "🍪",
    description: "Cookies, cream biscuits, rusk, cakes, buns and tea-time snacks"
  },
  {
    id: "cat_tea_coffee_milk_drinks",
    name: "Tea, Coffee & Milk Drinks",
    slug: "tea-coffee-milk-drinks",
    position: 9,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&q=80",
    icon: "☕",
    description: "Chai patti, green tea, instant coffee, Horlicks, Bournvita"
  },
  {
    id: "cat_atta_rice_dal",
    name: "Atta, Rice & Dal",
    slug: "atta-rice-dal",
    position: 10,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80",
    icon: "🌾",
    description: "Chakki fresh atta, basmati rice, pulses, toor dal, moong dal"
  },
  {
    id: "cat_masala_oil_more",
    name: "Masala, Oil & More",
    slug: "masala-oil-more",
    position: 11,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80",
    icon: "🧂",
    description: "Cooking oil, ghee, whole spices, turmeric, red chilli & garam masala"
  },
  {
    id: "cat_sauces_spreads",
    name: "Sauces & Spreads",
    slug: "sauces-spreads",
    position: 12,
    image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=300&q=80",
    icon: "🍯",
    description: "Ketchup, mayonnaise, peanut butter, jam, dips & pasta sauces"
  },
  {
    id: "cat_chicken_meat_fish",
    name: "Chicken, Meat & Fish",
    slug: "chicken-meat-fish",
    position: 13,
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&q=80",
    icon: "🍗",
    description: "Fresh chicken breast, mutton curry cut, fish fillets and eggs"
  },
  {
    id: "cat_organic_healthy_living",
    name: "Organic & Healthy Living",
    slug: "organic-healthy-living",
    position: 14,
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=300&q=80",
    icon: "🥗",
    description: "Organic honey, brown rice, chia seeds, dry fruits & nuts"
  },
  {
    id: "cat_baby_care",
    name: "Baby Care",
    slug: "baby-care",
    position: 15,
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&q=80",
    icon: "🍼",
    description: "Diapers, baby wipes, baby soap, cerelac, lotions & feeding bottles"
  },
  {
    id: "cat_pharma_wellness",
    name: "Pharma & Wellness",
    slug: "pharma-wellness",
    position: 16,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80",
    icon: "💊",
    description: "First aid, pain relief balm, antacids, ORS, band-aids & vitamins"
  },
  {
    id: "cat_cleaning_essentials",
    name: "Cleaning Essentials",
    slug: "cleaning-essentials",
    position: 17,
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&q=80",
    icon: "🧼",
    description: "Detergent powder, dishwash gel, floor cleaner, wipes and trash bags"
  },
  {
    id: "cat_home_office",
    name: "Home & Office",
    slug: "home-office",
    position: 18,
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&q=80",
    icon: "💡",
    description: "Batteries, bulbs, stationery, notebooks, pens and tissue paper"
  },
  {
    id: "cat_personal_care",
    name: "Personal Care",
    slug: "personal-care",
    position: 19,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&q=80",
    icon: "🧴",
    description: "Toothpaste, shampoo, body wash, deodorants, soaps and face wash"
  },
  {
    id: "cat_pet_care",
    name: "Pet Care",
    slug: "pet-care",
    position: 20,
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&q=80",
    icon: "🐾",
    description: "Dog food, cat treats, pet shampoo, litter trays and chew toys"
  }
];

// 8 to 10 authentic products for EVERY SINGLE CATEGORY (Total 165+ items)
const PRODUCTS_BY_CATEGORY = {
  "paan-corner": [
    {
      name: "Spraymintt BreezBerry Mouth Spray",
      weight: "15 g",
      unit: "can",
      price: 99,
      mrp: 110,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
      description: "Instant cooling mouth freshener spray with natural berry blast."
    },
    {
      name: "Chandan Saunf Elaichi Mouth Freshener",
      weight: "100 g",
      unit: "pouch",
      price: 45,
      mrp: 50,
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
      description: "Traditional roasted fennel seeds with aromatic cardamom."
    },
    {
      name: "Rajnigandha Silver Pearls Elaichi",
      weight: "4 g",
      unit: "pack",
      price: 75,
      mrp: 80,
      image: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=400&q=80",
      description: "Premium silver-coated cardamom seeds for supreme freshness."
    },
    {
      name: "Chandan Chatpati Imli Lollipop Candy",
      weight: "145 g",
      unit: "pack",
      price: 85,
      mrp: 100,
      image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80",
      description: "Tangy tamarind spicy sweet candy treats."
    },
    {
      name: "Chandan PK's Paan Mouth Freshener",
      weight: "110 g",
      unit: "bottle",
      price: 50,
      mrp: 60,
      image: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=400&q=80",
      description: "Sweet betel leaf mix infused with gulkand and menthol."
    },
    {
      name: "Impact Cola Mint Candies - Sugar Free",
      weight: "14 g",
      unit: "tin",
      price: 147,
      mrp: 150,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
      description: "Crisp fizzy cola flavored mints in an easy-carry tin."
    },
    {
      name: "Pass Pass Sweet Herbal Mint Chew",
      weight: "100 g",
      unit: "pouch",
      price: 35,
      mrp: 40,
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
      description: "India's favorite herbal sweet mouth freshener."
    },
    {
      name: "Center Fresh Spearmint Chewing Gum",
      weight: "67 g",
      unit: "tub",
      price: 50,
      mrp: 50,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
      description: "Liquid-filled spearmint cooling chewing gum."
    }
  ],

  "dairy-bread-eggs": [
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
      name: "Amul Masti Cup Curd",
      weight: "200 g",
      unit: "cup",
      price: 25,
      mrp: 25,
      image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=400&q=80",
      description: "Ready-to-eat smooth curd cup."
    },
    {
      name: "Amul Taaza Chai Mazza Toned Milk",
      weight: "500 ml",
      unit: "pouch",
      price: 29,
      mrp: 29,
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80",
      description: "Perfect tea companion toned milk."
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
      name: "Farm Fresh Brown Eggs - High Protein",
      weight: "6 pcs",
      unit: "tray",
      price: 57,
      mrp: 65,
      image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&q=80",
      description: "Nutritious farm fresh protein rich brown eggs."
    },
    {
      name: "English Oven 100% Whole Wheat Bread",
      weight: "400 g",
      unit: "loaf",
      price: 50,
      mrp: 55,
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
      description: "Freshly baked fiber-rich healthy whole wheat sandwich bread."
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

  "cold-drinks-juices": [
    {
      name: "Coca-Cola Diet Coke Can",
      weight: "330 ml",
      unit: "can",
      price: 50,
      mrp: 50,
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80",
      description: "Zero sugar refreshing sparkling cola drink."
    },
    {
      name: "Bisleri Mineral Packaged Water",
      weight: "1 ltr",
      unit: "bottle",
      price: 20,
      mrp: 20,
      image: "https://images.unsplash.com/photo-1559839914-ba2ac5e71465?w=400&q=80",
      description: "Purified drinking water with essential minerals."
    },
    {
      name: "Party Ice Cubes Pouch",
      weight: "1 kg",
      unit: "bag",
      price: 70,
      mrp: 80,
      image: "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=400&q=80",
      description: "Triple-filtered crystal clean ice cubes for beverages."
    },
    {
      name: "Sprite Lime Flavored Soft Drink",
      weight: "750 ml",
      unit: "bottle",
      price: 38,
      mrp: 40,
      image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&q=80",
      description: "Clear lemon-lime crisp refreshing thirst quencher."
    },
    {
      name: "Bisleri Bliss Pure Water Can",
      weight: "5 ltr",
      unit: "jar",
      price: 85,
      mrp: 90,
      image: "https://images.unsplash.com/photo-1559839914-ba2ac5e71465?w=400&q=80",
      description: "Family size pure drinking water dispenser jar."
    },
    {
      name: "Thums Up Charged Carbonated Drink",
      weight: "750 ml",
      unit: "bottle",
      price: 38,
      mrp: 40,
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80",
      description: "Taste the thunder with strong fizzy cola punch."
    },
    {
      name: "Real Fruit Power Mixed Fruit Juice",
      weight: "1 ltr",
      unit: "tetra pack",
      price: 120,
      mrp: 140,
      image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=80",
      description: "Rich blended real fruit nectar with Vitamin C."
    },
    {
      name: "Red Bull Energy Drink",
      weight: "250 ml",
      unit: "can",
      price: 125,
      mrp: 125,
      image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80",
      description: "Vitalizes body and mind with taurine and caffeine."
    }
  ],

  "fruits-vegetables": [
    {
      name: "Fresh Malwa Farm Potatoes (Aloo)",
      weight: "1 kg",
      unit: "kg",
      price: 28,
      mrp: 35,
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80",
      description: "Firm, clean farm-fresh cooking potatoes."
    },
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
      name: "Fresh Hybrid Red Tomatoes",
      weight: "1 kg",
      unit: "kg",
      price: 32,
      mrp: 45,
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80",
      description: "Juicy, ripe firm hybrid tomatoes for daily cooking."
    },
    {
      name: "Fresh Robusta Bananas",
      weight: "1 kg (approx 6 pcs)",
      unit: "bunch",
      price: 49,
      mrp: 60,
      image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80",
      description: "Naturally ripened sweet potassium rich yellow bananas."
    },
    {
      name: "Shimla Royal Delicious Red Apples",
      weight: "1 kg (4 pcs)",
      unit: "pack",
      price: 180,
      mrp: 220,
      image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80",
      description: "Sweet, crunchy and aromatic orchard fresh apples."
    },
    {
      name: "Fresh Coriander Leaves (Dhaniya)",
      weight: "100 g",
      unit: "bunch",
      price: 12,
      mrp: 15,
      image: "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=400&q=80",
      description: "Aromatic fragrant green coriander bunch."
    },
    {
      name: "Juicy Yellow Lemons (Nimbu)",
      weight: "250 g (6-7 pcs)",
      unit: "pack",
      price: 30,
      mrp: 40,
      image: "https://images.unsplash.com/photo-1587496679742-bad502958fbe?w=400&q=80",
      description: "Tangy high-juice fresh yellow lemons."
    },
    {
      name: "Green Bell Capsicum (Shimla Mirch)",
      weight: "500 g",
      unit: "pack",
      price: 40,
      mrp: 55,
      image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80",
      description: "Crunchy green bell peppers for pizza, noodles & curries."
    }
  ],

  "snacks-munchies": [
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
      description: "Crunchy toasted triangle corn chips with supreme melted cheese flavor."
    },
    {
      name: "Pringles Sour Cream & Onion",
      weight: "107 g",
      unit: "can",
      price: 115,
      mrp: 125,
      image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80",
      description: "Iconic hyperbolic stacked potato crisps with sour cream tang."
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
    },
    {
      name: "Bingo! Mad Angles Achaari Masti",
      weight: "66 g",
      unit: "pack",
      price: 20,
      mrp: 20,
      image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80",
      description: "Authentic mango pickle seasoned triangular crisps."
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

  "breakfast-instant-food": [
    {
      name: "Maggi 2-Minute Masala Instant Noodles",
      weight: "280 g (Pack of 4)",
      unit: "pack",
      price: 56,
      mrp: 60,
      image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&q=80",
      description: "India's favorite classic masala noodles enriched with iron."
    },
    {
      name: "Kellogg's Corn Flakes Original",
      weight: "475 g",
      unit: "box",
      price: 195,
      mrp: 220,
      image: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400&q=80",
      description: "Golden crispy toasted corn flakes with essential B vitamins."
    },
    {
      name: "Quaker Rolled Oats 100% Wholegrain",
      weight: "1 kg",
      unit: "pouch",
      price: 185,
      mrp: 210,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
      description: "Heart healthy high-fiber whole grain rolled breakfast oats."
    },
    {
      name: "Kellogg's Chocos Crunchy Chocolate Shells",
      weight: "375 g",
      unit: "box",
      price: 175,
      mrp: 190,
      image: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400&q=80",
      description: "Chocolatey wheat shells that turn milk yummy chocolaty."
    },
    {
      name: "Chings Secret Schezwan Instant Noodles",
      weight: "240 g (Pack of 4)",
      unit: "pack",
      price: 55,
      mrp: 60,
      image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&q=80",
      description: "Fiery Schezwan desi Chinese instant noodles."
    },
    {
      name: "MTR Ready-To-Eat Khatta Meetha Poha",
      weight: "80 g",
      unit: "cup",
      price: 45,
      mrp: 50,
      image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&q=80",
      description: "Just add boiling water for authentic Indori style poha."
    },
    {
      name: "Pintola All Natural Peanut Butter Crunchy",
      weight: "350 g",
      unit: "jar",
      price: 150,
      mrp: 175,
      image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80",
      description: "High protein roasted peanut butter with no added sugar."
    },
    {
      name: "Saffola Masala Oats Veggie Twist",
      weight: "400 g",
      unit: "pouch",
      price: 155,
      mrp: 175,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
      description: "Savory spiced oats loaded with carrot and peas."
    }
  ],

  "sweet-tooth": [
    {
      name: "Cadbury Dairy Milk Silk Chocolate Bar",
      weight: "150 g",
      unit: "bar",
      price: 175,
      mrp: 185,
      image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80",
      description: "Irresistibly smooth, creamy and decadent milk chocolate."
    },
    {
      name: "Haldiram's Kaju Katli Cashew Fudge",
      weight: "200 g",
      unit: "box",
      price: 193,
      mrp: 235,
      image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80",
      description: "Melt-in-mouth cashew diamond silver leaf sweets."
    },
    {
      name: "Lindt Excellence 70% Cocoa Dark Bar",
      weight: "100 g",
      unit: "bar",
      price: 265,
      mrp: 295,
      image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80",
      description: "Master Swiss dark chocolate with balanced bitterness."
    },
    {
      name: "Ferrero Rocher Hazelnut Chocolates",
      weight: "16 pcs (200 g)",
      unit: "box",
      price: 495,
      mrp: 550,
      image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80",
      description: "Crispy whole hazelnut enveloped in creamy chocolate wafer."
    },
    {
      name: "Kwality Wall's Chocolate Fudge Brownie Tub",
      weight: "700 ml",
      unit: "tub",
      price: 240,
      mrp: 275,
      image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80",
      description: "Rich dark chocolate ice cream with soft fudge brownie bites."
    },
    {
      name: "Haldiram's Gulab Jamun Tin",
      weight: "1 kg",
      unit: "tin",
      price: 220,
      mrp: 250,
      image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80",
      description: "Soft khoya dumplings dipped in sweet cardamom rose syrup."
    },
    {
      name: "KitKat 4-Finger Crisp Wafer Chocolate",
      weight: "38 g",
      unit: "pack",
      price: 25,
      mrp: 25,
      image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80",
      description: "Crispy wafer fingers covered in creamy milk chocolate."
    },
    {
      name: "Snickers Peanut Caramel Nougat Bar",
      weight: "45 g",
      unit: "bar",
      price: 50,
      mrp: 50,
      image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80",
      description: "Loaded with roasted peanuts, caramel and chocolate."
    }
  ],

  "bakery-biscuits": [
    {
      name: "Britannia Good Day Butter Cookies",
      weight: "600 g (Pack of 5)",
      unit: "pack",
      price: 110,
      mrp: 130,
      image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80",
      description: "Rich crunchy butter cookies with curved smile design."
    },
    {
      name: "Oreo Vanilla Creme Sandwich Biscuits",
      weight: "120 g",
      unit: "pack",
      price: 35,
      mrp: 40,
      image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80",
      description: "Twist, lick and dunk dark cocoa biscuits with vanilla creme."
    },
    {
      name: "Parle-G Gold Glucose Biscuits",
      weight: "1 kg",
      unit: "pack",
      price: 90,
      mrp: 100,
      image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80",
      description: "India's beloved crunchy tea-time energy glucose biscuits."
    },
    {
      name: "Sunfeast Dark Fantasy Choco Fills",
      weight: "300 g",
      unit: "box",
      price: 140,
      mrp: 160,
      image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80",
      description: "Crisp crust with molten liquid chocolate core inside."
    },
    {
      name: "Britannia Toastea Premium Wheat Rusk",
      weight: "400 g",
      unit: "pack",
      price: 55,
      mrp: 65,
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
      description: "Crispy double-baked cardamom flavored tea toast."
    },
    {
      name: "Britannia Little Hearts Sugar Biscuits",
      weight: "75 g",
      unit: "pack",
      price: 20,
      mrp: 20,
      image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80",
      description: "Heart shaped sugar-sprinkled bite sized puff biscuits."
    },
    {
      name: "Unibic Choco Chip Cookies",
      weight: "150 g",
      unit: "pack",
      price: 45,
      mrp: 50,
      image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80",
      description: "Loaded with chocolate chips in every golden bite."
    },
    {
      name: "Bonn Sweet Garlic Herb Pav / Bread Buns",
      weight: "6 pcs (300 g)",
      unit: "pack",
      price: 40,
      mrp: 45,
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
      description: "Ultra soft fresh bakery buns for pav bhaji and burgers."
    }
  ],

  "tea-coffee-milk-drinks": [
    {
      name: "Red Label Strong CTC Tea (Chai Patti)",
      weight: "1 kg",
      unit: "pack",
      price: 475,
      mrp: 540,
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80",
      description: "Swad apnepan ka with rich color, strength and aroma."
    },
    {
      name: "Nescafé Classic 100% Pure Instant Coffee",
      weight: "100 g",
      unit: "jar",
      price: 320,
      mrp: 350,
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80",
      description: "Rich dark roasted coffee beans delivering bold wake-up cups."
    },
    {
      name: "Tata Tea Gold Fine CTC & Long Leaf Blend",
      weight: "500 g",
      unit: "pouch",
      price: 295,
      mrp: 340,
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80",
      description: "Golden blend of strength with 15% aromatic long leaves."
    },
    {
      name: "BRU Instant Roasted Chicory Coffee",
      weight: "200 g",
      unit: "pouch",
      price: 240,
      mrp: 270,
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80",
      description: "Perfect blend of 70% coffee and 30% chicory for rich froth."
    },
    {
      name: "Bournvita Inner Strength Nutrition Drink",
      weight: "1 kg",
      unit: "jar",
      price: 410,
      mrp: 460,
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80",
      description: "Chocolate malt food drink packed with Vitamin D and calcium."
    },
    {
      name: "Lipton Pure & Light Green Tea Lemon",
      weight: "25 teabags",
      unit: "box",
      price: 165,
      mrp: 185,
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80",
      description: "Zero calorie hydrating soothing green tea."
    },
    {
      name: "Horlicks Classic Malt Health Drink",
      weight: "1 kg",
      unit: "jar",
      price: 420,
      mrp: 470,
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80",
      description: "Clinically proven nutrition drink for taller, stronger kids."
    },
    {
      name: "Wagh Bakri Premium CTC Tea",
      weight: "500 g",
      unit: "pouch",
      price: 270,
      mrp: 300,
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80",
      description: "Consistent strong brisk tea liquor for true connoisseurs."
    }
  ],

  "masala-oil-more": [
    {
      name: "Everest Garam Masala Powder",
      weight: "100 g",
      unit: "box",
      price: 92,
      mrp: 98,
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
      description: "Finely ground blend of 13 fragrant spices."
    },
    {
      name: "Catch Kashmiri Red Chilli Powder (Mirch)",
      weight: "200 g",
      unit: "box",
      price: 125,
      mrp: 140,
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
      description: "Vibrant red color with gentle warmth and aroma."
    },
    {
      name: "MDH Haldi (Turmeric) Powder",
      weight: "200 g",
      unit: "box",
      price: 78,
      mrp: 85,
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
      description: "Pure golden Salem turmeric with high natural curcumin."
    },
    {
      name: "Everest Chaat Masala Tangy Sprinkler",
      weight: "100 g",
      unit: "sprinkler",
      price: 70,
      mrp: 75,
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
      description: "Zesty spicy sprinkling masala for fruit salads and snacks."
    },
    {
      name: "Amul Pure Cow Ghee Tin",
      weight: "1 ltr",
      unit: "tin",
      price: 645,
      mrp: 690,
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80",
      description: "Rich granulated golden cow milk ghee with aromatic purity."
    },
    {
      name: "Catch Coriander (Dhaniya) Powder",
      weight: "200 g",
      unit: "box",
      price: 68,
      mrp: 75,
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
      description: "Cool ground coriander seeds providing rich curry gravy body."
    },
    {
      name: "Catch Jeera (Cumin Seeds)",
      weight: "100 g",
      unit: "pouch",
      price: 85,
      mrp: 95,
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
      description: "Earthy aromatic whole cumin seeds for tempering."
    },
    {
      name: "Everest Chhole Masala",
      weight: "100 g",
      unit: "box",
      price: 85,
      mrp: 90,
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80",
      description: "Authentic spicy seasoning for Punjabi chickpea curries."
    }
  ],

  "sauces-spreads": [
    {
      name: "Kissan Fresh Tomato Ketchup Squeezo",
      weight: "950 g",
      unit: "bottle",
      price: 135,
      mrp: 155,
      image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80",
      description: "100% real ripe tomatoes sweet and tangy dipping ketchup."
    },
    {
      name: "Veeba Eggless Mayonnaise Original",
      weight: "250 g",
      unit: "squeeze",
      price: 79,
      mrp: 89,
      image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80",
      description: "Super creamy eggless sandwich and wrap spread."
    },
    {
      name: "Nutella Hazelnut Cocoa Spread",
      weight: "350 g",
      unit: "jar",
      price: 340,
      mrp: 375,
      image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80",
      description: "Famous hazelnut chocolate spread for bread, waffles and crepes."
    },
    {
      name: "Kissan Mixed Fruit Jam",
      weight: "500 g",
      unit: "jar",
      price: 155,
      mrp: 175,
      image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80",
      description: "Sweet jam prepared from pulpy ripe seasonal orchard fruits."
    },
    {
      name: "Ching's Secret Red Chilli Sauce",
      weight: "200 g",
      unit: "bottle",
      price: 55,
      mrp: 60,
      image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80",
      description: "Spicy pungent red chilli dipping sauce for momos and fried rice."
    },
    {
      name: "Veeba Sweet Onion Salad Dressing",
      weight: "300 g",
      unit: "bottle",
      price: 125,
      mrp: 145,
      image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80",
      description: "Subway style low-fat sweet onion dressing for salads and subs."
    },
    {
      name: "Dr. Oetker Funfoods Burger Mayonnaise",
      weight: "250 g",
      unit: "pouch",
      price: 85,
      mrp: 95,
      image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80",
      description: "Tangy relish mayo specially formulated for homemade burgers."
    },
    {
      name: "Tabasco Original Red Pepper Hot Sauce",
      weight: "60 ml",
      unit: "bottle",
      price: 195,
      mrp: 220,
      image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80",
      description: "Aged oak barrel pepper sauce adding fiery zip to dishes."
    }
  ],

  "chicken-meat-fish": [
    {
      name: "Fresh Chicken Breast Boneless Cut",
      weight: "500 g",
      unit: "tray",
      price: 199,
      mrp: 230,
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80",
      description: "Lean, tender antibiotic-residue-free chicken breast fillets."
    },
    {
      name: "Fresh Chicken Curry Cut with Skin",
      weight: "1 kg",
      unit: "tray",
      price: 260,
      mrp: 300,
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80",
      description: "Cleanly diced chicken pieces ideal for Indian curries and gravies."
    },
    {
      name: "Fresh Mutton Curry Cut (Goat Meat)",
      weight: "500 g",
      unit: "pack",
      price: 440,
      mrp: 490,
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80",
      description: "Succulent tender goat meat mix with ribs, shank and shoulder."
    },
    {
      name: "Fresh Rohu Fish Bengali Curry Cut",
      weight: "500 g",
      unit: "tray",
      price: 185,
      mrp: 210,
      image: "https://images.unsplash.com/photo-1534948216015-843149f72be3?w=400&q=80",
      description: "Freshwater Rohu sliced into steaks, descaled and gutted."
    },
    {
      name: "Zorabian Chicken Cocktail Sausages",
      weight: "250 g",
      unit: "pack",
      price: 165,
      mrp: 185,
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80",
      description: "Ready to pan-fry smoked seasoned chicken sausages."
    },
    {
      name: "Fresh Farm White Eggs (30 Pcs Tray)",
      weight: "30 pcs",
      unit: "crate",
      price: 195,
      mrp: 220,
      image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&q=80",
      description: "Full monthly crate of high protein farm fresh eggs."
    },
    {
      name: "Fresh Prawns Medium Cleaned & Deveined",
      weight: "250 g",
      unit: "tray",
      price: 275,
      mrp: 320,
      image: "https://images.unsplash.com/photo-1534948216015-843149f72be3?w=400&q=80",
      description: "Sweet juicy sea prawns peeled and tail-on ready to cook."
    },
    {
      name: "Venky's Frozen Chicken Seekh Kebab",
      weight: "500 g",
      unit: "pack",
      price: 245,
      mrp: 280,
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80",
      description: "Spiced minced chicken skewers ready in 5 minutes on tawa."
    }
  ],

  "organic-healthy-living": [
    {
      name: "Dabur 100% Pure Organic Raw Honey",
      weight: "500 g",
      unit: "jar",
      price: 225,
      mrp: 260,
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80",
      description: "Naturally filtered wildflower honey with zero sugar adulteration."
    },
    {
      name: "Organic India Tulsi Green Tea",
      weight: "25 bags",
      unit: "tin",
      price: 195,
      mrp: 220,
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80",
      description: "Certified organic holy basil infusion boosting natural immunity."
    },
    {
      name: "True Elements Raw Chia Seeds",
      weight: "250 g",
      unit: "pouch",
      price: 175,
      mrp: 225,
      image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80",
      description: "Fiber & Omega-3 loaded seeds for puddings, smoothies & oats."
    },
    {
      name: "Happilo California Almonds (Badam)",
      weight: "500 g",
      unit: "pouch",
      price: 460,
      mrp: 599,
      image: "https://images.unsplash.com/photo-1508061252445-5350f3ab0a55?w=400&q=80",
      description: "Crunchy premium handpicked whole California almonds."
    },
    {
      name: "True Elements Gluten-Free Steel Cut Oats",
      weight: "1 kg",
      unit: "pouch",
      price: 280,
      mrp: 350,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
      description: "Minimally processed coarse oats keeping you full for hours."
    },
    {
      name: "24 Mantra Organic Brown Basmati Rice",
      weight: "1 kg",
      unit: "pouch",
      price: 145,
      mrp: 170,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
      description: "Whole grain brown rice rich in bran and dietary fiber."
    },
    {
      name: "Kapiva Himalayan Apple Cider Vinegar",
      weight: "500 ml",
      unit: "bottle",
      price: 360,
      mrp: 450,
      image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80",
      description: "Raw unfiltered ACV with live mother strand culture."
    },
    {
      name: "Happilo Whole Natural Cashews (Kaju)",
      weight: "500 g",
      unit: "pouch",
      price: 495,
      mrp: 650,
      image: "https://images.unsplash.com/photo-1508061252445-5350f3ab0a55?w=400&q=80",
      description: "Sweet creamy whole jumbo cashew kernels for snacking."
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
  ],

  "pharma-wellness": [
    {
      name: "Volini Pain Relief Fast Spray",
      weight: "100 g",
      unit: "can",
      price: 215,
      mrp: 260,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
      description: "Instant targeted relief from sprains, backache and joint aches."
    },
    {
      name: "Eno Fast Relief Fruit Salt Regular",
      weight: "100 g",
      unit: "bottle",
      price: 135,
      mrp: 150,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
      description: "Relieves acidity in just 6 seconds with cooling effervescence."
    },
    {
      name: "Moov Instant Pain Relief Cream",
      weight: "50 g",
      unit: "tube",
      price: 175,
      mrp: 195,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
      description: "100% Ayurvedic formula with eucalyptus and wintergreen oil."
    },
    {
      name: "Vicks VapoRub Comforting Balm",
      weight: "50 ml",
      unit: "jar",
      price: 145,
      mrp: 160,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
      description: "Trusted vaporizing ointment relieving cough, cold and blocked nose."
    },
    {
      name: "Hansaplast Waterproof Band-Aid Strips",
      weight: "20 strips",
      unit: "box",
      price: 65,
      mrp: 75,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
      description: "Antiseptic medicated pads sealing cuts from water and dirt."
    },
    {
      name: "Electral Oral Rehydration Salts (ORS)",
      weight: "21.8 g (Pack of 4)",
      unit: "pack",
      price: 76,
      mrp: 88,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
      description: "WHO formulation restoring vital fluids and electrolyte balance."
    },
    {
      name: "Dabur Honitus Herbal Cough Syrup",
      weight: "100 ml",
      unit: "bottle",
      price: 95,
      mrp: 110,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
      description: "Honey-based non-drowsy relief for dry and throat-tickle cough."
    },
    {
      name: "Revital H Daily Health Supplement",
      weight: "30 capsules",
      unit: "bottle",
      price: 295,
      mrp: 345,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
      description: "Natural ginseng with 10 vitamins and 9 minerals for energy."
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

  "home-office": [
    {
      name: "Duracell Ultra Alkaline AA Batteries",
      weight: "4 pcs",
      unit: "pack",
      price: 160,
      mrp: 180,
      image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
      description: "Up to 100% longer lasting power for toys, remotes and mice."
    },
    {
      name: "Classmate Soft Cover Notebook 172 Pgs",
      weight: "Pack of 3",
      unit: "pack",
      price: 135,
      mrp: 150,
      image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
      description: "Chlorine-free smooth white paper for school and office writing."
    },
    {
      name: "Reynolds 045 Fine Carbide Ball Pens Blue",
      weight: "10 pens",
      unit: "pack",
      price: 80,
      mrp: 100,
      image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
      description: "Classic smudge-free smooth precision writing ball pens."
    },
    {
      name: "Philips 9W LED Cool Day Light Bulb",
      weight: "2 pcs",
      unit: "pack",
      price: 180,
      mrp: 220,
      image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
      description: "Energy saving B22 base 6500K bright eye-safe bulb."
    },
    {
      name: "Origami So Soft 2-Ply Facial Tissues",
      weight: "100 pulls",
      unit: "box",
      price: 75,
      mrp: 90,
      image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
      description: "Super soft absorbent facial wipes for car, desk and home."
    },
    {
      name: "Fevistick Non-Toxic Glue Stick",
      weight: "15 g (Pack of 2)",
      unit: "pack",
      price: 50,
      mrp: 50,
      image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
      description: "Clean mess-free paper adhesive for documents and crafts."
    },
    {
      name: "Kangaroo Heavy Duty Paper Stapler + Pins",
      weight: "1 set",
      unit: "set",
      price: 95,
      mrp: 110,
      image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
      description: "Quick reliable desktop document binding stapler."
    },
    {
      name: "Post-it Notes 3x3 Canary Yellow Pad",
      weight: "100 sheets",
      unit: "pad",
      price: 65,
      mrp: 75,
      image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
      description: "Self-adhesive removable note reminders that stick firmly."
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
  ]
};

// Flatten all products with generated IDs, categories, and quick-commerce attributes
const ALL_CATALOG_PRODUCTS = [];
Object.entries(PRODUCTS_BY_CATEGORY).forEach(([catSlug, items]) => {
  const catObj = CATEGORIES.find(c => c.slug === catSlug);
  items.forEach((item, idx) => {
    const price = Number(item.price) || 50;
    const mrp = Number(item.mrp) || Math.round(price * 1.25);
    const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    ALL_CATALOG_PRODUCTS.push({
      _id: `prod_${catSlug}_${idx + 1}`,
      id: `prod_${catSlug}_${idx + 1}`,
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
      price: price,
      mrp: mrp,
      discountPercent: discountPercent,
      weight: item.weight,
      unit: item.unit || 'unit',
      image: item.image,
      inStock: true,
      stockQuantity: 100,
      vertical: 'grocery',
      deliveryTime: '8 MINS',
      rating: (4.4 + ((idx * 0.1) % 0.6)).toFixed(1),
      ratingsCount: (120 + idx * 85),
      isApproved: true,
      isPublished: true,
      approvalStatus: 'approved'
    });
  });
});

module.exports = {
  HERO_BANNERS,
  CATEGORIES,
  PRODUCTS_BY_CATEGORY,
  ALL_CATALOG_PRODUCTS
};
