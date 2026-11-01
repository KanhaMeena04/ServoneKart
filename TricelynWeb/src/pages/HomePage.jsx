import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  ShoppingBag, 
  Sparkles, 
  Truck, 
  Award, 
  Store,
  Star,
  CheckCircle2
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { groceryService, marketingService } from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback visual theme styling palette for dynamic categories
  const categoryPalettes = [
    { img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&q=80', bg: 'bg-emerald-50' },
    { img: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=200&q=80', bg: 'bg-blue-50' },
    { img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&q=80', bg: 'bg-amber-50' },
    { img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&q=80', bg: 'bg-orange-50' },
    { img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80', bg: 'bg-pink-50' },
    { img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&q=80', bg: 'bg-indigo-50' },
    { img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&q=80', bg: 'bg-yellow-50' },
    { img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&q=80', bg: 'bg-cyan-50' },
  ];

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catsRes, prodsRes, storesRes, bannersRes] = await Promise.allSettled([
          groceryService.getCategories(),
          groceryService.getProducts(),
          groceryService.getStores({ city: 'Indore' }),
          marketingService.getBanners(),
        ]);

        if (catsRes.status === 'fulfilled' && catsRes.value.data?.data) {
          setCategories(catsRes.value.data.data);
        }

        if (prodsRes.status === 'fulfilled' && prodsRes.value.data?.data) {
          setProducts(prodsRes.value.data.data);
        }

        if (storesRes.status === 'fulfilled' && storesRes.value.data?.data) {
          setStores(storesRes.value.data.data);
        }

        if (bannersRes.status === 'fulfilled') {
          const bList = bannersRes.value.data?.banners || bannersRes.value.data?.data || [];
          if (Array.isArray(bList) && bList.length > 0) {
            setBanners(bList);
          }
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // 100% Dynamic Categories mapped from MongoDB / Admin Panel
  const dynamicCategoryTiles = categories.length > 0 
    ? categories.map((cat, idx) => ({
        name: cat.name,
        slug: cat.slug || cat._id,
        img: cat.image || categoryPalettes[idx % categoryPalettes.length].img,
        bg: categoryPalettes[idx % categoryPalettes.length].bg,
      }))
    : [
        { name: 'Fruits & Vegetables', slug: 'vegetables-fruits', img: categoryPalettes[0].img, bg: categoryPalettes[0].bg },
        { name: 'Dairy & Breakfast', slug: 'dairy-breakfast', img: categoryPalettes[1].img, bg: categoryPalettes[1].bg },
        { name: 'Snacks & Beverages', slug: 'munchies-snacks', img: categoryPalettes[2].img, bg: categoryPalettes[2].bg },
        { name: 'Atta, Rice & Dal', slug: 'atta-rice-dal', img: categoryPalettes[3].img, bg: categoryPalettes[3].bg },
        { name: 'Personal Care', slug: 'personal-care', img: categoryPalettes[4].img, bg: categoryPalettes[4].bg },
        { name: 'Household Essentials', slug: 'cleaning-household', img: categoryPalettes[5].img, bg: categoryPalettes[5].bg },
        { name: 'Pet Care', slug: 'pet-care', img: categoryPalettes[6].img, bg: categoryPalettes[6].bg },
        { name: 'Baby Care', slug: 'baby-care', img: categoryPalettes[7].img, bg: categoryPalettes[7].bg },
      ];

  return (
    <div className="space-y-10 pb-16">
      
      {/* 1. Tricelyn Blue Hero Section (Matches Reference Image 1) */}
      <section className="bg-gradient-to-r from-[#0052cc] via-[#0066FF] to-[#0a3875] text-white overflow-hidden relative rounded-b-3xl shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none transform translate-x-20 -translate-y-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold tracking-wide uppercase text-blue-100">
                <Zap className="w-3.5 h-3.5 text-yellow-300 fill-current" />
                <span>Superfast Indore Delivery in 10-15 Minutes</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Groceries <br />
                <span className="text-yellow-300">in Minutes.</span>
              </h1>

              <p className="text-sm sm:text-base text-blue-100 max-w-lg font-medium leading-relaxed">
                Fresh produce · Daily essentials · Trusted brands. Delivered right to your doorstep anywhere in Indore with lightning speed.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/categories"
                  className="px-6 py-3.5 bg-white text-brand-600 hover:bg-blue-50 rounded-2xl font-extrabold text-sm shadow-md hover:shadow-xl transition-all duration-200 active:scale-95 inline-flex items-center gap-2"
                >
                  <span>Shop Now</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-2 text-xs font-semibold text-blue-100 bg-white/10 px-4 py-3 rounded-2xl backdrop-blur-xs">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                  <span>Fulfillment Dark Stores Live in Indore</span>
                </div>
              </div>
            </div>

            {/* Right Value Badges Card (Matches Reference Image 1) */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-200">
                Why Shop on Tricelyn?
              </h3>

              <div className="space-y-3.5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-yellow-300 font-black">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ultra Fast Delivery</h4>
                    <p className="text-xs text-blue-100 font-medium">10 - 15 mins to your door</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-green-300 font-black">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Fresh & Quality Guaranteed</h4>
                    <p className="text-xs text-blue-100 font-medium">Handpicked vegetables & dairy</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-purple-300 font-black">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Wide Range of Products</h4>
                    <p className="text-xs text-blue-100 font-medium">5,000+ daily grocery essentials</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-emerald-300 font-black">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Best Prices Everyday</h4>
                    <p className="text-xs text-blue-100 font-medium">Unbeatable discounts & combo offers</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* 2. Shop by Category (100% Dynamic from Master Admin) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Shop by Category
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Fresh produce, groceries, snacks and daily household needs
              </p>
            </div>
            <Link
              to="/categories"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {dynamicCategoryTiles.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-gray-100 hover:border-brand-300 hover:shadow-card-hover transition-all duration-200"
              >
                <div className={`w-16 h-16 rounded-2xl ${cat.bg} flex items-center justify-center p-2 mb-2 group-hover:scale-105 transition-transform`}>
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="max-h-full max-w-full object-contain rounded-lg"
                    loading="lazy"
                  />
                </div>
                <span className="text-[11px] font-bold text-gray-800 group-hover:text-brand-600 transition line-clamp-2 leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. Promotional Banners (Dynamic from Admin Panel /api/banners) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banners.length >= 3 ? (
            banners.slice(0, 3).map((b, i) => (
              <div 
                key={b._id || i}
                className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[170px] shadow-sm"
              >
                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200">
                    {b.tag || 'Special Offer'}
                  </span>
                  <h3 className="text-lg font-black leading-tight">
                    {b.title || b.name || 'Daily Essentials'}
                  </h3>
                  <p className="text-xs text-blue-100">{b.description || 'Save more on your daily order'}</p>
                </div>
                <div className="relative z-10 pt-4">
                  <Link
                    to={b.link || '/categories'}
                    className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition"
                  >
                    <span>Shop Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                {b.image && (
                  <img
                    src={b.image}
                    alt={b.title || 'Banner'}
                    className="absolute -right-4 -bottom-6 w-32 h-32 object-cover rounded-full opacity-40 mix-blend-screen pointer-events-none"
                  />
                )}
              </div>
            ))
          ) : (
            <>
              {/* Banner 1: Fruits & Veg */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[170px] shadow-sm">
                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200">
                    Fresh & Farm Crisp
                  </span>
                  <h3 className="text-lg font-black leading-tight">
                    Fresh Fruits & Vegetables <br />
                    <span className="text-yellow-300">Up to 40% OFF</span>
                  </h3>
                </div>
                <div className="relative z-10 pt-4">
                  <Link
                    to="/category/vegetables-fruits"
                    className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition"
                  >
                    <span>Shop Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=80"
                  alt="Fresh vegetables"
                  className="absolute -right-4 -bottom-6 w-32 h-32 object-cover rounded-full opacity-40 mix-blend-screen pointer-events-none"
                />
              </div>

              {/* Banner 2: Daily Essentials */}
              <div className="bg-gradient-to-br from-indigo-700 to-blue-900 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[170px] shadow-sm">
                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">
                    Pantry Savings
                  </span>
                  <h3 className="text-lg font-black leading-tight">
                    Daily Essentials <br />
                    <span className="text-green-300">Save More Everyday</span>
                  </h3>
                </div>
                <div className="relative z-10 pt-4">
                  <Link
                    to="/category/atta-rice-dal"
                    className="px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition"
                  >
                    <span>Shop Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80"
                  alt="Daily essentials"
                  className="absolute -right-4 -bottom-6 w-32 h-32 object-cover rounded-full opacity-40 mix-blend-screen pointer-events-none"
                />
              </div>

              {/* Banner 3: Top Brands */}
              <div className="bg-gradient-to-br from-blue-700 to-cyan-800 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[170px] shadow-sm">
                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-200">
                    Direct Brand Mart
                  </span>
                  <h3 className="text-lg font-black leading-tight">
                    Top Brands <br />
                    <span className="text-yellow-300">Lower Prices</span>
                  </h3>
                </div>
                <div className="relative z-10 pt-4">
                  <Link
                    to="/category/munchies-snacks"
                    className="px-4 py-2 bg-white text-cyan-900 hover:bg-cyan-50 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition"
                  >
                    <span>Shop Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&q=80"
                  alt="Top brands"
                  className="absolute -right-4 -bottom-6 w-32 h-32 object-cover rounded-full opacity-40 mix-blend-screen pointer-events-none"
                />
              </div>
            </>
          )}
        </section>

        {/* 4. Best Sellers Product Grid (100% Dynamic from Product Collection) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Best Sellers in Indore
                </h2>
                <span className="bg-green-100 text-accent-greenDark text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  ⚡ 10-15 Min Delivery
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Most ordered grocery staples, dairy and snacks
              </p>
            </div>

            <Link
              to="/categories"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {products.slice(0, 12).map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}

            {products.length === 0 && !loading && (
              <div className="col-span-full py-8 text-center text-xs text-gray-500">
                Products will appear here once loaded from the backend.
              </div>
            )}
          </div>
        </section>

        {/* 5. Quick Super-Vertical Cards (Blinkit Style Reference Image 2) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/category/pharmacy"
            className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-between shadow-sm hover:shadow-md transition"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                Pharmacy at your doorstep
              </span>
              <h4 className="text-base font-extrabold mt-0.5">
                Medicines & Wellness
              </h4>
              <p className="text-xs text-emerald-100 mt-1">Cough syrups, pain relief & more</p>
              <span className="mt-3 inline-block px-3 py-1 bg-white text-emerald-700 rounded-lg text-xs font-bold">
                Order Now
              </span>
            </div>
            <img
              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80"
              alt="Pharmacy"
              className="w-20 h-20 object-cover rounded-2xl shadow-sm"
            />
          </Link>

          <Link
            to="/category/pet-care"
            className="p-5 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between shadow-sm hover:shadow-md transition"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100">
                Pet Care in minutes
              </span>
              <h4 className="text-base font-extrabold mt-0.5">
                Food, Treats & Toys
              </h4>
              <p className="text-xs text-amber-100 mt-1">Pedigree, Whiskas & cat litter</p>
              <span className="mt-3 inline-block px-3 py-1 bg-white text-amber-700 rounded-lg text-xs font-bold">
                Order Now
              </span>
            </div>
            <img
              src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&q=80"
              alt="Pet Care"
              className="w-20 h-20 object-cover rounded-2xl shadow-sm"
            />
          </Link>

          <Link
            to="/category/baby-care"
            className="p-5 rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-between shadow-sm hover:shadow-md transition"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                Diaper run in minutes?
              </span>
              <h4 className="text-base font-extrabold mt-0.5">
                Baby Care Essentials
              </h4>
              <p className="text-xs text-blue-100 mt-1">Pampers, wipes, Cerelac & soaps</p>
              <span className="mt-3 inline-block px-3 py-1 bg-white text-blue-700 rounded-lg text-xs font-bold">
                Order Now
              </span>
            </div>
            <img
              src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&q=80"
              alt="Baby Care"
              className="w-20 h-20 object-cover rounded-2xl shadow-sm"
            />
          </Link>
        </section>

        {/* 6. Nearby Indore Grocery Stores & Supermarkets (100% Dynamic from Restaurant/Store Model) */}
        {stores.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Partner Supermarkets & Stores
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Order directly from certified grocery marts in Indore
                </p>
              </div>
              <Link
                to="/stores"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View All Stores</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {stores.slice(0, 3).map((st) => (
                <Link
                  key={st._id}
                  to={`/store/${st._id}`}
                  className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition flex items-center gap-3.5 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {st.image ? (
                      <img src={st.image} alt={st.name} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-6 h-6 text-brand-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-brand-600 transition">
                      {st.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">{st.address || 'Vijay Nagar, Indore'}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="flex items-center gap-1 font-bold text-green-700 bg-green-50 px-1.5 py-0.2 rounded text-[10px]">
                        ★ {st.rating || '4.5'}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-600">
                        ⚡ {st.deliveryTime || '15 mins'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 7. "Your Groceries. Our Priority" Trust Banner (Matches User Image 1) */}
        <section className="bg-gradient-to-r from-[#003882] via-[#0052cc] to-[#0b2447] rounded-3xl p-6 sm:p-8 text-white shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                TRICELYN PROMISE
              </span>
              <h3 className="text-xl sm:text-2xl font-black">
                Your Groceries. <br />
                Our Priority.
              </h3>
              <p className="text-xs text-blue-100 font-normal">
                Fast. Safe. Reliable. Sourced fresh daily from Indore mandi and certified brands.
              </p>
            </div>

            <div className="md:col-span-7 grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 text-center border border-white/10">
                <div className="w-8 h-8 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-2 font-bold text-xs">
                  1
                </div>
                <h5 className="text-xs font-bold text-white">Order</h5>
                <p className="text-[10px] text-blue-200 mt-0.5">Place order in minutes</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 text-center border border-white/10">
                <div className="w-8 h-8 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-2 font-bold text-xs">
                  2
                </div>
                <h5 className="text-xs font-bold text-white">Pick</h5>
                <p className="text-[10px] text-blue-200 mt-0.5">We pack fresh stock</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 text-center border border-white/10">
                <div className="w-8 h-8 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-2 font-bold text-xs">
                  3
                </div>
                <h5 className="text-xs font-bold text-white">Deliver</h5>
                <p className="text-[10px] text-blue-200 mt-0.5">At doorstep in 10-15m</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default HomePage;
