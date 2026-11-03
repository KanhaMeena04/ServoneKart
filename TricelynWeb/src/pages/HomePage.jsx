import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  ShoppingBag, 
  Sparkles, 
  Truck, 
  Award, 
  Store,
  Star,
  CheckCircle2,
  ArrowRight,
  Package,
  ShoppingCart
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import HeroBannerSlider from '../components/HeroBannerSlider';
import PromoOfferBanners from '../components/PromoOfferBanners';
import { groceryService } from '../services/api';
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

const HomePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(CATEGORIES);
  const [bestSellers, setBestSellers] = useState(BEST_SELLERS);
  const [categorySections, setCategorySections] = useState([]);
  const [bannersData, setBannersData] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catsRes, bestRes, sectionsRes, bannersRes, storesRes] = await Promise.allSettled([
          groceryService.getCategories(),
          groceryService.getBestSellers(),
          groceryService.getCategorySections(),
          groceryService.getBanners(),
          groceryService.getStores({ city: 'Indore' }),
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
              _id: 'store_tricelyn_indore_01',
              id: 'store_tricelyn_indore_01',
              name: 'Tricelyn Express Mart (Vijay Nagar Hub)',
              address: 'Scheme 54, Vijay Nagar, Indore 452010',
              rating: 4.8,
              deliveryTime: '10-15 mins',
              distance: '1.2 km',
              tags: ['Groceries', 'Dairy & Bakery', 'Instant Delivery'],
              image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80'
            },
            {
              _id: 'store_tricelyn_indore_02',
              id: 'store_tricelyn_indore_02',
              name: 'Fresh Farm Hub (Palasia Superstore)',
              address: 'Old Palasia Main Road, Near Industry House, Indore 452001',
              rating: 4.7,
              deliveryTime: '12-18 mins',
              distance: '2.5 km',
              tags: ['Farm Fresh', 'Vegetables', 'Exotic Fruits'],
              image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80'
            },
            {
              _id: 'store_tricelyn_indore_03',
              id: 'store_tricelyn_indore_03',
              name: 'Apna Super Kirana (Saket Nagar)',
              address: 'Saket Square, Near Anand Bazaar, Indore 452018',
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
  }, []);

  // Delivery Priority Banner (Matches Master Design Mockup)
  const priorityBanner = bannersData?.priorityBanner || {
    title: "Your Groceries. Our Priority.",
    subtitle: "Fast. Safe. Reliable.",
    buttonText: "Learn More",
    buttonLink: "/about"
  };

  return (
    <div className="space-y-10 pb-16 bg-[#f4f7fb]">
      
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
        
        {/* ============================================================
            1. HERO & PROMO SHOWCASE (Matches Reference Screenshot)
            - Top: Interactive 3-4 Slide Hero Banner Auto-Scroller
            - Below: 3 Promotional Offer Banners (Pharmacy, Pet Care, Baby Care)
           ============================================================ */}
        <section className="space-y-3.5 sm:space-y-4">
          <HeroBannerSlider />
          <PromoOfferBanners />
        </section>

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
              className="text-xs font-bold text-[#0055ff] hover:text-blue-700 flex items-center gap-0.5 group"
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
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full p-[2px] border border-[#0055ff]/35 group-hover:border-[#0055ff] bg-white shadow-xs group-hover:shadow-md group-hover:ring-2 group-hover:ring-blue-100/60 transition-all duration-300 flex items-center justify-center">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img
                      src={cat.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80"}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                </div>

                <span className="mt-2.5 text-xs sm:text-[13px] font-extrabold text-gray-800 group-hover:text-[#0055ff] transition line-clamp-2 leading-tight text-center max-w-[105px]">
                  {cat.shortName || cat.name}
                </span>
              </Link>
            ))}
          </div>

          {/* MOBILE VIEW (< 768px): 4-Column Quick-Commerce Sections (Matches Reference Screenshot 1 & 2) */}
          <div className="space-y-6 md:hidden">
            {MOBILE_CATEGORY_GROUPS.map((group, gIdx) => (
              <div key={gIdx} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-gray-900 tracking-tight">
                    {group.title}
                  </h3>
                  <Link
                    to="/categories"
                    className="text-[11px] font-bold text-[#0055ff] hover:underline"
                  >
                    see all
                  </Link>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  {group.items.map((cat, cIdx) => (
                    <Link
                      key={cIdx}
                      to={`/category/${cat.slug}`}
                      className="flex flex-col items-center group text-center cursor-pointer"
                    >
                      {/* Soft Light Blue Rounded Square (Matches Blinkit Reference) */}
                      <div className="w-full aspect-square bg-[#f0f6ff] active:bg-blue-100 rounded-2xl p-2 flex items-center justify-center border border-blue-100/60 shadow-2xs group-active:scale-95 transition">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="max-h-full max-w-full object-contain mix-blend-multiply rounded-lg"
                          loading="lazy"
                        />
                      </div>

                      {/* Category Label Below */}
                      <span className="text-[10px] font-bold text-gray-800 group-hover:text-[#0055ff] line-clamp-2 mt-1 leading-tight text-center">
                        {cat.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================
            SHOPS NEAR ME (Multi-Vendor Hyperlocal Stores in Indore)
           ============================================================ */}
        {stores && stores.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                    Shops Near Me
                  </h2>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                    ⚡ 10-15 Mins Delivery
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Verified partner grocery stores & supermarkets in Indore delivering to you
                </p>
              </div>

              <Link
                to="/stores"
                className="text-xs font-bold text-[#0055ff] hover:text-blue-700 flex items-center gap-0.5 group"
              >
                <span>View All ({stores.length}+ Shops)</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="flex overflow-x-auto pb-2 scrollbar-none snap-x sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 -mx-4 px-4 sm:mx-0 sm:px-0">
              {stores.slice(0, 6).map((store) => (
                <Link
                  key={store._id || store.id}
                  to={`/store/${store._id || store.id}`}
                  className="w-[84vw] flex-shrink-0 snap-start sm:w-auto bg-white rounded-2xl border border-gray-100 hover:border-[#0055ff] shadow-xs hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between group relative overflow-hidden"
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
                        <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-[#0055ff] transition truncate">
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
                          <span>{store.deliveryTime || '10-15 mins'}</span>
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
                    <span className="font-bold text-[#0055ff] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 flex-shrink-0">
                      <span>Shop Store</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}


        {/* ============================================================
            4. BEST SELLERS PRODUCT GRID
            (Matches Master Mockup: 6 Clean Product Cards + Blue Buttons)
           ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              Best Sellers
            </h2>
            <Link
              to="/categories"
              className="text-xs font-bold text-[#0055ff] hover:text-blue-700 flex items-center gap-0.5 group"
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
            5. DELIVERY PARTNER PRIORITY BANNER
            (Matches Master Mockup: Dark Navy Priority Strip)
           ============================================================ */}
        <section className="rounded-2xl bg-[#031633] text-white p-6 sm:p-8 relative overflow-hidden shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6">
            
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-2">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                Your Groceries. <br />
                <span className="text-cyan-400">Our Priority.</span>
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Fast. Safe. Reliable.
              </p>
              <div className="pt-2">
                <Link
                  to={priorityBanner.buttonLink || "/about"}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0055ff] hover:bg-[#0047d4] text-white rounded-full text-xs font-bold transition shadow-xs"
                >
                  <span>{priorityBanner.buttonText || "Learn More"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right 3 Steps (Order -> Pick -> Deliver) */}
            <div className="lg:col-span-7 grid grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-xs font-bold text-white">Order</span>
                </div>
                <p className="text-[11px] text-blue-200">Place your order in minutes</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Package className="w-4 h-4" />
                  <span className="text-xs font-bold text-white">Pick</span>
                </div>
                <p className="text-[11px] text-blue-200">We pick fresh from our store</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Truck className="w-4 h-4" />
                  <span className="text-xs font-bold text-white">Deliver</span>
                </div>
                <p className="text-[11px] text-blue-200">Get it at your doorstep in 10-30 mins</p>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================
            6. CATEGORY PRODUCT ROWS (Dynamic browse across all categories)
           ============================================================ */}
        <div className="space-y-8 pt-4">
          <div className="border-b border-gray-200 pb-2">
            <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              Explore More Daily Essentials
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Handpicked from Indore fulfillment dark stores
            </p>
          </div>

          {categorySections.map((sec) => (
            <CategoryProductRow key={sec.slug} section={sec} />
          ))}
        </div>

      </div>
    </div>
  );
};

/**
 * Category-wise Horizontal Product Carousel Row
 */
const CategoryProductRow = ({ section }) => {
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
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
            ⚡ 10-15 MINS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/category/${section.slug}`}
            className="text-xs font-bold text-[#0055ff] hover:text-blue-700 hover:underline"
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
