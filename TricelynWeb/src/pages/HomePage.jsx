import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  ChevronUp,
  ShoppingBag, 
  Sparkles, 
  Truck, 
  Award, 
  Store,
  Star,
  CheckCircle2,
  ArrowRight,
  Package,
  ShoppingCart,
  RefreshCw,
  Crown,
  Bike,
  MapPin
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import HeroBannerSlider from '../components/HeroBannerSlider';
import PromoOfferBanners from '../components/PromoOfferBanners';
import { groceryService, orderService } from '../services/api';
import { usePlatform } from '../context/PlatformContext';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CATEGORIES, BEST_SELLERS, ALL_CATALOG_PRODUCTS } from '../data/groceryCatalog';

// Quick-Commerce Mobile Category Groups (Matches Reference Screenshots 1 & 2)
const MOBILE_CATEGORY_GROUPS = [
  {
    title: "Grocery & Kitchen",
    items: [
      { name: "Vegetables & Fruits", slug: "fruits-vegetables", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=80" },
      { name: "Atta, Rice & Dal", slug: "atta-rice-dal", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80" },
      { name: "Oil, Ghee & Masala", slug: "masala-oil-more", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80" },
      { name: "Dairy, Bread & Eggs", slug: "dairy-bread-eggs", image: "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=300&q=80" },
      { name: "Bakery & Biscuits", slug: "bakery-biscuits", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&q=80" },
      { name: "Dry Fruits & Cereals", slug: "organic-healthy-living", image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=300&q=80" },
      { name: "Chicken, Meat & Fish", slug: "chicken-meat-fish", image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&q=80" },
      { name: "Kitchen & Home", slug: "home-office", image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&q=80" }
    ]
  },
  {
    title: "Snacks & Drinks",
    items: [
      { name: "Chips & Namkeen", slug: "snacks-munchies", image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&q=80" },
      { name: "Sweets & Chocolates", slug: "sweet-tooth", image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&q=80" },
      { name: "Drinks & Juices", slug: "cold-drinks-juices", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&q=80" },
      { name: "Tea, Coffee & Drinks", slug: "tea-coffee-milk-drinks", image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&q=80" },
      { name: "Instant Food", slug: "breakfast-instant-food", image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=300&q=80" },
      { name: "Sauces & Spreads", slug: "sauces-spreads", image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=300&q=80" },
      { name: "Paan Corner", slug: "paan-corner", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80" },
      { name: "Ice Creams & More", slug: "sweet-tooth", image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=300&q=80" }
    ]
  },
  {
    title: "Beauty & Household",
    items: [
      { name: "Personal Care", slug: "personal-care", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&q=80" },
      { name: "Cleaning Essentials", slug: "cleaning-essentials", image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=300&q=80" },
      { name: "Pharma & Wellness", slug: "pharma-wellness", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80" },
      { name: "Baby Care", slug: "baby-care", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&q=80" }
    ]
  }
];

const POPULAR_AREAS = [
  { area: 'Scheme 54, Vijay Nagar', city: 'Indore', hub: 'Tricelyn Express Mart' },
  { area: 'Old Palasia, AB Road', city: 'Indore', hub: 'Fresh Farm Hub' },
  { area: 'Saket Nagar, Square Market', city: 'Indore', hub: 'Apna Super Kirana' },
  { area: 'Rajwada, MG Road', city: 'Indore', hub: 'Rajwada Heritage Mart' },
  { area: 'Bhawarkua Square, IT Park Road', city: 'Indore', hub: 'Malwa Daily Mart' },
  { area: 'Silicon City, Rau Bypass', city: 'Indore', hub: 'Tricelyn Express Hub' },
  { area: 'Super Corridor, TCS Square', city: 'Indore', hub: 'Tricelyn Express Hub' }
];

const HomePage = () => {
  const navigate = useNavigate();
  const { platformMode, enableFoodDelivery, appSettings } = usePlatform();
  const { selectedLocation } = useLocation();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState(CATEGORIES);
  const [shuffledCategories, setShuffledCategories] = useState([]);
  const [isMobileCatPaused, setIsMobileCatPaused] = useState(false);
  const mobileCatTrackRef = useRef(null);

  const deliveryTime = appSettings?.estimatedDeliveryTime || 'In minutes';
  const deliveryHeadline = appSettings?.deliveryHeadline || 'Hyperlocal Express • In minutes';
  const deliverySubtext = appSettings?.deliverySubtext || 'Fast. Safe. Reliable doorstep delivery in minutes.';

  const [bestSellers, setBestSellers] = useState(BEST_SELLERS);
  const [categorySections, setCategorySections] = useState([]);
  const [bannersData, setBannersData] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [areaQuery, setAreaQuery] = useState('');
  const [hasSearchedStores, setHasSearchedStores] = useState(false);
  const [searchedStoreQuery, setSearchedStoreQuery] = useState('');

  // Store Finder interactive auto-complete & single line view state
  const [isAreaInputFocused, setIsAreaInputFocused] = useState(false);
  const [isStoresExpanded, setIsStoresExpanded] = useState(false);
  const areaInputRef = useRef(null);
  const areaSuggestionsRef = useRef(null);

  // Recent Orders Carousel & Auto-scroll / Shuffle
  const recentOrdersTrackRef = useRef(null);
  const [isRecentOrdersPaused, setIsRecentOrdersPaused] = useState(false);

  // Click outside to close area suggestions dropdown
  useEffect(() => {
    const handleClickOutsideArea = (e) => {
      if (
        areaInputRef.current && !areaInputRef.current.contains(e.target) &&
        areaSuggestionsRef.current && !areaSuggestionsRef.current.contains(e.target)
      ) {
        setIsAreaInputFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideArea);
    return () => document.removeEventListener('mousedown', handleClickOutsideArea);
  }, []);

  // Filtered area suggestions
  const areaSuggestions = useMemo(() => {
    const q = areaQuery.trim().toLowerCase();
    const matchedAreas = POPULAR_AREAS.filter(a => 
      !q || a.area.toLowerCase().includes(q) || a.city.toLowerCase().includes(q)
    );
    const matchedStores = stores.filter(st => {
      const name = (typeof st.name === 'object' ? (st.name.en || Object.values(st.name)[0] || '') : (st.name || '')).toLowerCase();
      const addr = (st.address || '').toLowerCase();
      return !q || name.includes(q) || addr.includes(q);
    });
    return { areas: matchedAreas.slice(0, 4), stores: matchedStores.slice(0, 3) };
  }, [areaQuery, stores]);

  const handleSelectSuggestion = (val) => {
    setAreaQuery(val);
    setSearchedStoreQuery(val);
    setHasSearchedStores(true);
    setIsAreaInputFocused(false);
    setTimeout(() => {
      const el = document.getElementById('searched-shops-container');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleFindStores = (e) => {
    e.preventDefault();
    const q = areaQuery.trim();
    setSearchedStoreQuery(q);
    setHasSearchedStores(true);
    setIsAreaInputFocused(false);
    setTimeout(() => {
      const el = document.getElementById('searched-shops-container');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const filteredStores = useMemo(() => {
    if (!hasSearchedStores) return [];
    if (!searchedStoreQuery) return stores;
    const s = searchedStoreQuery.toLowerCase();
    return stores.filter((st) => {
      const name = (typeof st.name === 'object' ? (st.name.en || Object.values(st.name)[0] || '') : (st.name || '')).toLowerCase();
      const addr = (st.address || '').toLowerCase();
      const city = (st.city || '').toLowerCase();
      const tags = Array.isArray(st.tags) ? st.tags.join(' ').toLowerCase() : '';
      return name.includes(s) || addr.includes(s) || city.includes(s) || tags.includes(s);
    });
  }, [hasSearchedStores, searchedStoreQuery, stores]);

  useEffect(() => {
    if (isAuthenticated) {
      orderService.getMyOrders({ limit: 8 })
        .then((res) => {
          const list = res.data?.orders || res.data?.data || [];
          setRecentOrders(list);
        })
        .catch(() => {});
    } else {
      setRecentOrders([]);
    }
  }, [isAuthenticated]);

  // Live auto-shuffle & scroll for Recent Orders every 6 seconds
  useEffect(() => {
    if (isRecentOrdersPaused || !recentOrdersTrackRef.current || recentOrders.length <= 1) return;
    const interval = setInterval(() => {
      if (recentOrdersTrackRef.current) {
        const el = recentOrdersTrackRef.current;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 20) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: 290, behavior: 'smooth' });
        }
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isRecentOrdersPaused, recentOrders]);

  const handleReorderAll = (ord) => {
    if (!ord.items || ord.items.length === 0) return;
    ord.items.forEach((it) => {
      const prod = it.product || {
        _id: it._id || it.productId || `item-${Date.now()}`,
        name: it.name,
        price: it.price,
        image: it.image
      };
      addToCart(prod, it.quantity || 1);
    });
    navigate('/cart');
  };

  // Sync shuffledCategories when categories load
  useEffect(() => {
    if (categories && categories.length > 0) {
      setShuffledCategories([...categories]);
    }
  }, [categories]);

  // Live auto-shuffle & scroll every 6 seconds (between 5-10s)
  useEffect(() => {
    if (isMobileCatPaused || !mobileCatTrackRef.current) return;
    const interval = setInterval(() => {
      if (mobileCatTrackRef.current) {
        const el = mobileCatTrackRef.current;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 30) {
          setShuffledCategories((prev) => {
            if (prev.length <= 3) return prev;
            return [...prev.slice(2), ...prev.slice(0, 2)];
          });
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: 160, behavior: 'smooth' });
        }
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isMobileCatPaused, categories]);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const storeParams =
          selectedLocation?.lat && selectedLocation?.lng
            ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
            : {};
        const [catsRes, bestRes, sectionsRes, bannersRes, storesRes] = await Promise.allSettled([
          groceryService.getCategories(),
          groceryService.getBestSellers(),
          groceryService.getCategorySections(),
          groceryService.getBanners(),
          groceryService.getStores(storeParams),
        ]);

        if (catsRes.status === 'fulfilled' && catsRes.value.data?.data && catsRes.value.data.data.length > 0) {
          setCategories(catsRes.value.data.data);
        } else {
          setCategories(CATEGORIES);
        }

        if (bestRes.status === 'fulfilled' && bestRes.value.data?.data && bestRes.value.data.data.length > 0) {
          setBestSellers(bestRes.value.data.data);
        } else {
          setBestSellers(BEST_SELLERS);
        }

        if (sectionsRes.status === 'fulfilled' && sectionsRes.value.data?.data && sectionsRes.value.data.data.length > 0) {
          setCategorySections(sectionsRes.value.data.data);
        } else {
          const featuredSectionSlugs = [
            { slug: 'dairy-bread-eggs', name: 'Dairy, Bread & Eggs' },
            { slug: 'cold-drinks-juices', name: 'Cold Drinks & Juices' },
            { slug: 'paan-corner', name: 'Mouth fresheners' },
            { slug: 'snacks-munchies', name: 'Snacks & Munchies' },
            { slug: 'fruits-vegetables', name: 'Fruits & Vegetables' },
            { slug: 'atta-rice-dal', name: 'Atta, Rice & Dal' },
            { slug: 'sweet-tooth', name: 'Sweet Tooth & Chocolates' },
            { slug: 'bakery-biscuits', name: 'Bakery & Biscuits' }
          ];
          const secs = featuredSectionSlugs.map(sec => ({
            id: `sec_${sec.slug}`,
            slug: sec.slug,
            title: sec.name,
            name: sec.name,
            products: ALL_CATALOG_PRODUCTS.filter(p => p.categorySlug === sec.slug)
          }));
          setCategorySections(secs);
        }

        if (bannersRes.status === 'fulfilled' && bannersRes.value.data) {
          setBannersData(bannersRes.value.data);
        }

        if (storesRes.status === 'fulfilled' && storesRes.value.data?.data && storesRes.value.data.data.length > 0) {
          setStores(storesRes.value.data.data);
        } else {
          setStores([
            {
              _id: 'store_tricelyn_01',
              id: 'store_tricelyn_01',
              name: 'Tricelyn Express Mart (Central Hub)',
              address: 'Hub #1, Express Logistics Zone',
              rating: 4.8,
              deliveryTime: 'In minutes',
              distance: '1.2 km',
              tags: ['Groceries', 'Dairy & Bakery', 'Instant Delivery'],
              image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80'
            },
            {
              _id: 'store_tricelyn_02',
              id: 'store_tricelyn_02',
              name: 'Fresh Farm Hub (Metro Superstore)',
              address: 'Metro Hyperlocal Park, Station Road',
              rating: 4.7,
              deliveryTime: '12-18 mins',
              distance: '2.5 km',
              tags: ['Farm Fresh', 'Vegetables', 'Exotic Fruits'],
              image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80'
            },
            {
              _id: 'store_tricelyn_03',
              id: 'store_tricelyn_03',
              name: 'City Super Kirana & Staples',
              address: 'Commercial Square, City Center',
              rating: 4.6,
              deliveryTime: '15-20 mins',
              distance: '3.1 km',
              tags: ['Daily Kirana', 'Atta & Rice', 'Spices & Oil'],
              image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&q=80'
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [selectedLocation?.id, selectedLocation?.lat, selectedLocation?.lng]);

  // Delivery Priority Banner (Matches Master Design Mockup)
  const priorityBanner = bannersData?.priorityBanner || {
    title: "Your Groceries. Our Priority.",
    subtitle: "Fast. Safe. Reliable.",
    buttonText: "Learn More",
    buttonLink: "/about"
  };

  return (
    <div className="pb-12 bg-[#f4f7fb]">
      
      {/* Container */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-5 space-y-6 sm:space-y-7">
        
        {/* ============================================================
            1. HERO & PROMO SHOWCASE
           ============================================================ */}
        <section className="space-y-3.5 sm:space-y-4">
          {platformMode !== 'grocery' && enableFoodDelivery && (
            <div className="bg-gradient-to-r from-[#00297F] via-[#0145F2] to-[#0145F2] text-white rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs shadow-xs">
              <div className="flex items-center gap-2 font-bold">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {platformMode === 'both'
                    ? 'Multi-Vertical Mode Active: Quick Grocery & Food Delivery Available'
                    : 'Food Delivery & Express Kitchens Active'}
                </span>
              </div>
              <Link to="/stores" className="underline font-black text-white hover:text-blue-100 whitespace-nowrap ml-2">
                Explore Partner Hubs →
              </Link>
            </div>
          )}
          {/* Dynamic Hero Banner Slider (Controlled via Admin Panel: showHeroBanner) */}
          {appSettings?.showHeroBanner && <HeroBannerSlider />}

          {/* ============================================================
              STORE FINDER CARD (Placed at top when Hero is hidden)
              "Groceries in minutes, from your own supermarket."
             ============================================================ */}
          {/* <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#061a3d] via-[#0145F2] to-[#00297F] text-white p-5 sm:p-7 md:p-9 border border-blue-900/60 shadow-lg">
           
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-3.5 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                Groceries in minutes, from your own supermarket.
              </h2>

              <form onSubmit={handleFindStores} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 relative">
                <div ref={areaInputRef} className="flex-1 relative">
                  <input
                    type="text"
                    value={areaQuery}
                    onFocus={() => setIsAreaInputFocused(true)}
                    onChange={(e) => {
                      setAreaQuery(e.target.value);
                      setIsAreaInputFocused(true);
                    }}
                    placeholder="Enter your area, society, or shop name"
                    className="w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-white text-gray-900 placeholder:text-gray-400 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition"
                  />
                  {isAreaInputFocused && (
                    <div
                      ref={areaSuggestionsRef}
                      className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-gray-800 animate-in fade-in max-h-72 overflow-y-auto no-scrollbar divide-y divide-gray-100"
                    >
                      
                      {areaSuggestions.areas.length > 0 && (
                        <div className="p-2 space-y-1">
                          <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#0145F2]" />
                            <span>Popular Localities & Societies</span>
                          </div>
                          {areaSuggestions.areas.map((a, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectSuggestion(a.area)}
                              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-blue-50 text-left transition text-xs font-semibold text-gray-800 cursor-pointer"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-6 h-6 rounded-lg bg-blue-100 text-[#0145F2] flex items-center justify-center text-xs flex-shrink-0">
                                  📍
                                </span>
                                <span className="truncate">{a.area}</span>
                              </div>
                              <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{a.city}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      
                      {areaSuggestions.stores.length > 0 && (
                        <div className="p-2 space-y-1 bg-amber-50/40">
                          <div className="px-2.5 py-1 text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                            <Store className="w-3 h-3 text-amber-600" />
                            <span>Partner Grocery Stores</span>
                          </div>
                          {areaSuggestions.stores.map((st) => {
                            const sName = typeof st.name === 'object' ? (st.name.en || Object.values(st.name)[0]) : st.name;
                            return (
                              <button
                                key={st._id || st.id}
                                type="button"
                                onClick={() => handleSelectSuggestion(sName)}
                                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white text-left transition text-xs font-semibold text-gray-800 border border-transparent hover:border-amber-200 cursor-pointer"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs flex-shrink-0">
                                    🏪
                                  </span>
                                  <span className="truncate">{sName}</span>
                                </div>
                                <span className="text-[10px] text-emerald-600 font-bold flex-shrink-0 ml-2">Delivers in mins</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div> 
                <button
                  type="submit"
                  className="px-6 sm:px-7 py-2.5 sm:py-3 bg-[#0145F2] hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <span>Find stores</span>
                </button>
              </form>
            </div>
          </div> */}


           {/* ============================================================
            1. HERO PROMOTIONAL AUTO-SCROLLING BANNER SLIDER
           ============================================================ */}
          <PromoOfferBanners />

          {/* ============================================================
            2. SHOP BY CATEGORY SECTION
            - Desktop: Full Round Circular Cards with Thin Blue Theme Border
            - Mobile: 4-Column Quick-Commerce Grid (Matches Reference Screenshots 1 & 2)
           ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              Shop by Category
            </h2>
            <Link
              to="/categories"
              className="text-xs font-bold text-[#0145F2] hover:text-blue-700 flex items-center gap-0.5 group"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* DESKTOP VIEW: Circular Category Cards */}
          <div className="hidden md:grid md:grid-cols-7 lg:grid-cols-7 gap-4 sm:gap-6">
            {categories.slice(0, 7).map((cat) => (
              <Link
                key={cat.slug || cat._id}
                to={`/category/${cat.slug}`}
                className="group flex flex-col items-center text-center cursor-pointer"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full p-[2px] border border-[#0145F2]/35 group-hover:border-[#0145F2] bg-white shadow-xs group-hover:shadow-md group-hover:ring-2 group-hover:ring-blue-100/60 transition-all duration-300 flex items-center justify-center">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img
                      src={cat.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80"}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                </div>

                <span className="mt-2.5 text-xs sm:text-[13px] font-extrabold text-gray-800 group-hover:text-[#0145F2] transition line-clamp-2 leading-tight text-center max-w-[105px]">
                  {cat.shortName || cat.name}
                </span>
              </Link>
            ))}
          </div>

          {/* MOBILE VIEW (< 768px): Single-Line Auto-Scrolling / Shuffling Circle Categories */}
          <div className="md:hidden">
            <div 
              ref={mobileCatTrackRef}
              onMouseEnter={() => setIsMobileCatPaused(true)}
              onMouseLeave={() => setIsMobileCatPaused(false)}
              onTouchStart={() => setIsMobileCatPaused(true)}
              onTouchEnd={() => setTimeout(() => setIsMobileCatPaused(false), 2000)}
              className="flex items-center gap-3.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 -mx-1"
            >
              {shuffledCategories.map((cat, idx) => (
                <Link
                  key={cat.slug || cat._id || idx}
                  to={`/category/${cat.slug}`}
                  className="flex-shrink-0 flex flex-col items-center text-center group cursor-pointer w-[68px]"
                >
                  <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#00297F] via-[#0145F2] to-[#0145F2] shadow-xs group-active:scale-95 transition-transform duration-200">
                    <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden flex items-center justify-center">
                      <img
                        src={cat.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80"}
                        alt={cat.name}
                        className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <span className="mt-1.5 text-[11px] font-bold text-gray-800 group-hover:text-[#0145F2] line-clamp-1 leading-tight text-center w-full px-0.5">
                    {cat.shortName || cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        

          {/* ============================================================
              SEARCHED NEARBY STORES (Revealed ONLY after searching Find stores)
              - Single Line Horizontal Scrolling by default on all screen sizes
              - View All toggles full grid view
              - Clear Search hides the section
             ============================================================ */}
          {hasSearchedStores && (
            <div id="searched-shops-container" className="pt-2 animate-in fade-in space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                      Nearby Partner Stores
                    </h2>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                      Delivery in minutes
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {searchedStoreQuery
                      ? `Found ${filteredStores.length} partner store(s) matching "${searchedStoreQuery}" delivering to you`
                      : `Showing all ${stores.length} partner stores delivering to your location`}
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setHasSearchedStores(false);
                      setAreaQuery('');
                      setSearchedStoreQuery('');
                      setIsStoresExpanded(false);
                    }}
                    className="text-xs font-bold text-gray-500 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    Clear Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsStoresExpanded(!isStoresExpanded)}
                    className="text-xs font-bold text-[#0145F2] hover:text-blue-700 flex items-center gap-0.5 group cursor-pointer bg-blue-50/80 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition"
                  >
                    <span>{isStoresExpanded ? 'Show Single Line' : 'View All'}</span>
                    {isStoresExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </button>
                </div>
              </div>

              {filteredStores.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-2">
                  <Store className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm font-bold text-gray-800">
                    No partner stores found for "{searchedStoreQuery}"
                  </p>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Try entering another area, society name (e.g. Vijay Nagar, Palasia, Saket Nagar) or grocery shop name.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchedStoreQuery('');
                    }}
                    className="mt-2 text-xs font-bold text-[#0145F2] hover:underline cursor-pointer"
                  >
                    Show all available partner stores
                  </button>
                </div>
              ) : (
                <div
                  className={
                    isStoresExpanded
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 animate-in fade-in"
                      : "flex overflow-x-auto pb-3 gap-3.5 sm:gap-4 snap-x no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
                  }
                >
                  {filteredStores.map((store) => (
                    <Link
                      key={store._id || store.id}
                      to={`/store/${store._id || store.id}`}
                      className={
                        isStoresExpanded
                          ? "w-full bg-white rounded-2xl border border-gray-100 hover:border-[#0145F2] shadow-xs hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between group relative overflow-hidden"
                          : "w-[285px] sm:w-[325px] flex-shrink-0 snap-start bg-white rounded-2xl border border-gray-100 hover:border-[#0145F2] shadow-xs hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between group relative overflow-hidden"
                      }
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 group-hover:border-blue-200 transition">
                          <img
                            src={store.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80"}
                            alt={store.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            loading="lazy"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-[#0145F2] transition truncate">
                              {store.name}
                            </h3>
                            <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex-shrink-0">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              <span>{store.rating || '4.8'}</span>
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            {store.address || 'Scheme 54, Vijay Nagar, Indore'}
                          </p>

                          <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                            <span className="font-bold text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-600" />
                              <span>In minutes</span>
                            </span>
                            {store.distance && (
                              <span className="text-gray-400 font-medium">
                                • {store.distance}
                              </span>
                            )}
                            <span className="text-[10px] text-emerald-600 font-bold ml-auto">
                              Free on ₹199+
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {(store.tags || ['Groceries', 'Daily Needs']).slice(0, 2).map((t, idx) => (
                            <span key={idx} className="text-[10px] text-gray-500 bg-gray-100/70 px-1.5 py-0.5 rounded truncate">
                              {t}
                            </span>
                          ))}
                        </div>
                        <span className="font-bold text-[#0145F2] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 flex-shrink-0">
                          <span>Shop Store</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

       

        {/* ============================================================
            3. BEST SELLERS PRODUCT GRID
            (Matches Master Mockup: 6 Clean Product Cards + Blue Buttons)
           ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              Best Sellers
            </h2>
            <Link
              to="/categories"
              className="text-xs font-bold text-[#0145F2] hover:text-blue-700 flex items-center gap-0.5 group"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {bestSellers.map((prod) => (
              <ProductCard key={prod._id || prod.id} product={prod} />
            ))}
          </div>
        </section>

        {/* ============================================================
            CATEGORY PRODUCT ROWS (Dynamic browse across all categories)
           ============================================================ */}
        <div className="space-y-5 pt-1">
          <div className="border-b border-gray-200 pb-2">
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              Explore More Daily Essentials
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Handpicked from fulfillment dark stores near{' '}
              {selectedLocation?.name || selectedLocation?.locality || 'you'}
            </p>
          </div>

          {categorySections.map((sec) => (
            <CategoryProductRow key={sec.slug} section={sec} deliveryTime={deliveryTime} />
          ))}
        </div>

        {/* ============================================================
            ORDER AGAIN / RECENT ORDERS (Positioned at bottom just above footer)
            - Single horizontal scrolling row on mobile and desktop
            - Auto-scroll & shuffle every 6s (pauses on hover)
            - Matches Screenshot 5 layout
           ============================================================ */}
        {/* {isAuthenticated && recentOrders && recentOrders.length > 0 && (
          <section
            onMouseEnter={() => setIsRecentOrdersPaused(true)}
            onMouseLeave={() => setIsRecentOrdersPaused(false)}
            onTouchStart={() => setIsRecentOrdersPaused(true)}
            onTouchEnd={() => setIsRecentOrdersPaused(false)}
            className="space-y-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-blue-100 shadow-xs relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0145F2] flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                    Order Again
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                    Repeat your recent grocery essentials in 1 tap
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/account/orders"
                  className="text-xs font-bold text-[#0145F2] hover:text-blue-700 flex items-center gap-0.5 group mr-1"
                >
                  <span>All Orders</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <div className="hidden sm:flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (recentOrdersTrackRef.current) {
                        recentOrdersTrackRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                      }
                    }}
                    className="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition shadow-2xs cursor-pointer"
                    aria-label="Previous Orders"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (recentOrdersTrackRef.current) {
                        recentOrdersTrackRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                      }
                    }}
                    className="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition shadow-2xs cursor-pointer"
                    aria-label="Next Orders"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

           
            <div
              ref={recentOrdersTrackRef}
              className="flex overflow-x-auto pb-2 gap-3.5 snap-x no-scrollbar scroll-smooth -mx-1 px-1"
            >
              {recentOrders.map((ord) => {
                const orderId = ord._id || ord.orderNumber;
                const statusLabel = ord.status ? ord.status.replace(/_/g, ' ') : 'Processing';
                const itemsCount = ord.items?.length || 0;
                const total = ord.finalAmount || ord.totalAmount || 0;
                const isDelivered = ord.status === 'delivered';
                const isCancelled = ord.status === 'cancelled';

                return (
                  <div
                    key={orderId}
                    className="w-[270px] sm:w-[300px] flex-shrink-0 snap-start p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className="font-bold text-gray-800">
                          #{ord.orderNumber || String(orderId).slice(-6)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider ${
                          isDelivered
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isCancelled
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-[#0145F2] border border-blue-200'
                        }`}>
                          {statusLabel}
                        </span>
                      </div>

                      
                      <div className="flex items-center gap-1.5 overflow-hidden mb-3">
                        {(ord.items || []).slice(0, 3).map((it, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-10 rounded-lg bg-white border border-gray-200/80 p-0.5 overflow-hidden flex-shrink-0"
                            title={it.name}
                          >
                            <img
                              src={it.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&q=80"}
                              alt={it.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        ))}
                        {itemsCount > 3 && (
                          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[10px] font-black text-[#0145F2] flex-shrink-0">
                            +{itemsCount - 3}
                          </div>
                        )}
                        <div className="ml-1 text-[11px] text-gray-500 font-medium truncate">
                          {itemsCount} item{itemsCount > 1 ? 's' : ''} • <strong className="text-gray-900 font-bold">₹{total}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200/60">
                      <button
                        type="button"
                        onClick={() => handleReorderAll(ord)}
                        className="flex-1 py-1.5 px-3 bg-[#0145F2] hover:bg-[#00297F] text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Reorder</span>
                      </button>
                      <Link
                        to={`/track/${orderId}`}
                        className="py-1.5 px-2.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center"
                        title="Live Track Order"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )} */}

      </div>
    </div>
  );
};

/**
 * Category-wise Horizontal Product Carousel Row
 */
const CategoryProductRow = ({ section, deliveryTime }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!section.products || section.products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
            {section.title || section.name}
          </h3>
          {/* <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
            DELIVERY IN MINUTES
          </span> */}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/category/${section.slug}`}
            className="text-xs font-bold text-[#0145F2] hover:text-blue-700 hover:underline"
          >
            see all
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition shadow-2xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition shadow-2xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none scroll-smooth -mx-1 px-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {section.products.map((prod) => (
          <div
            key={prod._id || prod.id}
            className="flex-shrink-0 w-44 sm:w-48"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ProductCard product={prod} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomePage;
