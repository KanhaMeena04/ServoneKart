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
  ArrowRight
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { groceryService } from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [categorySections, setCategorySections] = useState([]);
  const [bannersData, setBannersData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fallback palette for category background tiles
  const categoryPalettes = [
    { bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { bg: 'bg-blue-50', border: 'border-blue-100' },
    { bg: 'bg-amber-50', border: 'border-amber-100' },
    { bg: 'bg-orange-50', border: 'border-orange-100' },
    { bg: 'bg-pink-50', border: 'border-pink-100' },
    { bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { bg: 'bg-purple-50', border: 'border-purple-100' },
    { bg: 'bg-teal-50', border: 'border-teal-100' },
    { bg: 'bg-yellow-50', border: 'border-yellow-100' },
    { bg: 'bg-rose-50', border: 'border-rose-100' },
  ];

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catsRes, sectionsRes, bannersRes] = await Promise.allSettled([
          groceryService.getCategories(),
          groceryService.getCategorySections(),
          groceryService.getBanners(),
        ]);

        if (catsRes.status === 'fulfilled' && catsRes.value.data?.data) {
          setCategories(catsRes.value.data.data);
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

  // Top Hero Banner (Matches Reference Image 1)
  const topBanner = bannersData?.topBanner || {
    title: "Stock up on daily essentials",
    subtitle: "Get farm-fresh goodness & a range of exotic fruits, vegetables, eggs & more",
    buttonText: "Shop Now",
    link: "/category/fruits-vegetables",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&q=80"
  };

  // 3 Promo Banners Grid (Matches Reference Image 1)
  const subBanners = bannersData?.subBanners || [
    {
      id: "promo-pharmacy",
      title: "Pharmacy at your doorstep!",
      subtitle: "Cough syrups, pain relief sprays & more",
      buttonText: "Order Now",
      link: "/category/pharma-wellness",
      bgColor: "bg-[#00a896]",
      textColor: "text-white",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"
    },
    {
      id: "promo-petcare",
      title: "Pet care supplies at your door",
      subtitle: "Food, treats, toys & more",
      buttonText: "Order Now",
      link: "/category/pet-care",
      bgColor: "bg-[#ffb703]",
      textColor: "text-amber-950",
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80"
    },
    {
      id: "promo-babycare",
      title: "No time for a diaper run?",
      subtitle: "Get baby care essentials in minutes",
      buttonText: "Order Now",
      link: "/category/baby-care",
      bgColor: "bg-[#bde0fe]",
      textColor: "text-sky-950",
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80"
    }
  ];

  return (
    <div className="space-y-10 pb-16 bg-[#f8fafc]">
      
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* ============================================================
            1. HERO SECTION: TOP BANNER (Matches Reference Image 1)
           ============================================================ */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1b6b3e] via-[#21834b] to-[#125830] text-white shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center min-h-[220px]">
            {/* Left Content */}
            <div className="md:col-span-7 p-6 sm:p-8 md:p-10 space-y-3 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider text-green-100">
                <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span>Superfast Indore Delivery</span>
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                {topBanner.title}
              </h1>
              <p className="text-xs sm:text-sm text-green-100 max-w-lg font-medium leading-relaxed">
                {topBanner.subtitle}
              </p>
              <div className="pt-2">
                <Link
                  to={topBanner.link || "/category/fruits-vegetables"}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#1b6b3e] hover:bg-green-50 rounded-xl font-black text-xs sm:text-sm shadow-md transition-transform duration-150 active:scale-95"
                >
                  <span>{topBanner.buttonText || "Shop Now"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Fresh Produce Visual Image */}
            <div className="md:col-span-5 h-48 md:h-full relative overflow-hidden flex items-center justify-center p-4">
              <img
                src={topBanner.image}
                alt="Daily Essentials"
                className="max-h-56 md:max-h-64 object-contain rounded-2xl drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </section>

        {/* ============================================================
            2. THREE FEATURE PROMO CARDS (Matches Reference Image 1)
           ============================================================ */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subBanners.map((card, idx) => (
            <div
              key={card.id || idx}
              className={`rounded-2xl p-5 ${card.bgColor} ${card.textColor} relative overflow-hidden flex flex-col justify-between min-h-[150px] shadow-xs hover:shadow-md transition-shadow group`}
            >
              <div className="relative z-10 space-y-1.5 max-w-[65%]">
                <h3 className="text-base sm:text-lg font-black leading-snug">
                  {card.title}
                </h3>
                <p className="text-[11px] opacity-90 font-medium leading-tight">
                  {card.subtitle}
                </p>
              </div>

              <div className="relative z-10 pt-3">
                <Link
                  to={card.link || "/categories"}
                  className="inline-block px-4 py-1.5 bg-[#1e293b] text-white hover:bg-black rounded-lg text-[11px] font-black transition-transform active:scale-95 shadow-xs"
                >
                  {card.buttonText || "Order Now"}
                </Link>
              </div>

              {/* Side Illustration / Photo */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute right-2 bottom-2 w-28 h-28 object-contain rounded-xl drop-shadow-md group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            </div>
          ))}
        </section>

        {/* ============================================================
            3. CATEGORIES GRID (Matches Reference Image 2: 20 Categories)
           ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                Shop by Category
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Browse our complete selection of fresh produce, pantry staples & daily essentials
              </p>
            </div>
            <Link
              to="/categories"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
            >
              <span>View All 20 Categories</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2.5 sm:gap-3">
            {categories.map((cat, idx) => {
              const pal = categoryPalettes[idx % categoryPalettes.length];
              return (
                <Link
                  key={cat.slug || cat._id}
                  to={`/category/${cat.slug}`}
                  className="group flex flex-col items-center text-center p-2 rounded-2xl bg-white border border-gray-100 hover:border-emerald-400 hover:shadow-card-hover transition-all duration-200"
                >
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${pal.bg} flex items-center justify-center p-2 mb-1.5 group-hover:scale-105 transition-transform`}>
                    <img
                      src={cat.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80"}
                      alt={cat.name}
                      className="max-h-full max-w-full object-contain rounded-lg mix-blend-multiply"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-gray-800 group-hover:text-emerald-700 transition line-clamp-2 leading-tight">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ============================================================
            4. CATEGORY-WISE PRODUCT SECTIONS (Matches Reference Images 2 & 3)
           ============================================================ */}
        <div className="space-y-10">
          {categorySections.map((sec) => (
            <CategoryProductRow key={sec.slug} section={sec} />
          ))}
        </div>

      </div>
    </div>
  );
};

/**
 * Category-wise Horizontal Product Row with Carousel Scroll
 * (Matches exact Blinkit / Zepto layout shown in User Reference Images 2 & 3)
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
    <section className="space-y-3.5 bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-xs relative">
      {/* Row Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
            {section.title || section.name}
          </h3>
          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
            ⚡ 8 MINS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/category/${section.slug}`}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            see all
          </Link>

          {/* Navigation Arrows */}
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

      {/* Horizontal Scrollable Carousel */}
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
