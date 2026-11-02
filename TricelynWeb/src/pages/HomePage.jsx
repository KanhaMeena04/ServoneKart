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
import { groceryService } from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categorySections, setCategorySections] = useState([]);
  const [bannersData, setBannersData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catsRes, bestRes, sectionsRes, bannersRes] = await Promise.allSettled([
          groceryService.getCategories(),
          groceryService.getBestSellers(),
          groceryService.getCategorySections(),
          groceryService.getBanners(),
        ]);

        if (catsRes.status === 'fulfilled' && catsRes.value.data?.data) {
          setCategories(catsRes.value.data.data);
        }

        if (bestRes.status === 'fulfilled' && bestRes.value.data?.data) {
          setBestSellers(bestRes.value.data.data);
        }

        if (sectionsRes.status === 'fulfilled' && sectionsRes.value.data?.data) {
          setCategorySections(sectionsRes.value.data.data);
        }

        if (bannersRes.status === 'fulfilled' && bannersRes.value.data) {
          setBannersData(bannersRes.value.data);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // Top Hero Content (Matches Master Design Mockup)
  const heroContent = bannersData?.hero || {
    title: "Groceries in Minutes.",
    subtitle: "Fresh produce · Daily essentials · Trusted brands",
    subBrand: "TRICELYN — Everything You Actually Want",
    buttonText: "Shop Now",
    buttonLink: "/categories",
    bagImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&q=80"
  };

  // 3 Offer Banners Grid (Matches Master Design Mockup)
  const offerBanners = bannersData?.offerBanners || [
    {
      id: "offer-fruits-veg",
      title: "Fresh Fruits & Vegetables",
      highlight: "Up to 40% OFF",
      buttonText: "Shop Now",
      link: "/category/fruits-vegetables",
      bgGradient: "from-[#0066ff] via-[#0052cc] to-[#003d99]",
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80"
    },
    {
      id: "offer-daily-essentials",
      title: "Daily Essentials",
      highlight: "Save More Everyday",
      buttonText: "Shop Now",
      link: "/category/atta-rice-dal",
      bgGradient: "from-[#0a2558] via-[#0d3477] to-[#124296]",
      image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&q=80"
    },
    {
      id: "offer-top-brands",
      title: "Top Brands",
      highlight: "Lower Prices",
      buttonText: "Shop Now",
      link: "/category/snacks-munchies",
      bgGradient: "from-[#0070f3] via-[#005ce6] to-[#0047b3]",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80"
    }
  ];

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
            1. HERO SECTION: TRICELYN MASTER HERO BANNER
            (Matches Master Mockup: Blue Gradient + Tote Bag + 4 Badges)
           ============================================================ */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#021b44] via-[#0047cc] to-[#0052cc] text-white shadow-xl">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none transform translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 items-center p-6 sm:p-8 md:p-10 gap-8 relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tighter text-white">
                  TRICELYN
                </span>
                <span className="text-[10px] tracking-wider font-semibold text-blue-200 uppercase -mt-0.5">
                  Everything You Actually Want
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Groceries <br />
                <span className="text-white">in Minutes.</span>
              </h1>

              <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed max-w-sm">
                Fresh produce · Daily essentials · Trusted brands
              </p>

              <div className="pt-2">
                <Link
                  to={heroContent.buttonLink || "/categories"}
                  className="inline-flex items-center gap-2 px-7 py-3 bg-[#0055ff] hover:bg-[#0047d4] text-white rounded-full font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-transform duration-150 active:scale-95 border border-white/20"
                >
                  <span>{heroContent.buttonText || "Shop Now"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Center: Branded Grocery Tote Bag Image */}
            <div className="lg:col-span-4 flex items-center justify-center py-2">
              <div className="relative group">
                <img
                  src={heroContent.bagImage}
                  alt="Tricelyn Fresh Grocery Bag"
                  className="max-h-56 sm:max-h-64 object-contain rounded-2xl drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Right: 4 Value Proposition Badges (Matches Mockup) */}
            <div className="lg:col-span-3 flex flex-col justify-center space-y-4 border-t lg:border-t-0 lg:border-l border-white/15 pt-4 lg:pt-0 lg:pl-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-400/20 flex items-center justify-center text-cyan-300 flex-shrink-0">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Ultra Fast Delivery</h4>
                  <p className="text-[11px] text-blue-200">(10-30 mins)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-400/20 flex items-center justify-center text-cyan-300 flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Fresh & Quality</h4>
                  <p className="text-[11px] text-blue-200">Guaranteed</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-400/20 flex items-center justify-center text-cyan-300 flex-shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Wide Range</h4>
                  <p className="text-[11px] text-blue-200">of Products</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-400/20 flex items-center justify-center text-cyan-300 flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Best Prices</h4>
                  <p className="text-[11px] text-blue-200">Everyday</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================
            2. SHOP BY CATEGORY SECTION
            (Matches Master Mockup: Clean White Cards with Group Photos)
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

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-7 gap-3 sm:gap-4">
            {categories.slice(0, 7).map((cat) => (
              <Link
                key={cat.slug || cat._id}
                to={`/category/${cat.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-300 shadow-xs hover:shadow-md transition-all duration-200 p-3 flex flex-col items-center text-center"
              >
                <div className="w-full h-24 sm:h-28 rounded-xl bg-gray-50 flex items-center justify-center p-2 mb-2 group-hover:bg-blue-50/40 transition">
                  <img
                    src={cat.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80"}
                    alt={cat.name}
                    className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-bold text-gray-900 group-hover:text-[#0055ff] transition line-clamp-1">
                  {cat.shortName || cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ============================================================
            3. THREE PROMOTIONAL OFFER BANNERS
            (Matches Master Mockup: 3 Royal Blue / Navy Offer Cards)
           ============================================================ */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {offerBanners.map((card, idx) => (
            <div
              key={card.id || idx}
              className={`rounded-2xl p-6 bg-gradient-to-r ${card.bgGradient} text-white relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-md transition-shadow group`}
            >
              <div className="relative z-10 space-y-1.5 max-w-[65%]">
                <h3 className="text-base sm:text-lg font-black leading-snug">
                  {card.title}
                </h3>
                <p className="text-xs font-black text-white/90">
                  {card.highlight}
                </p>
              </div>

              <div className="relative z-10 pt-4">
                <Link
                  to={card.link || "/categories"}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-[#0055ff] hover:bg-blue-50 rounded-full text-xs font-bold transition-transform active:scale-95 shadow-xs"
                >
                  <span>{card.buttonText || "Shop Now"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Side Product Group Photo */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute -right-2 -bottom-2 w-32 h-32 object-contain rounded-xl drop-shadow-md group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            </div>
          ))}
        </section>

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
