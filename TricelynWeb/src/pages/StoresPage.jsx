import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Store, 
  Star, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  ChevronRight, 
  Search, 
  CheckCircle2, 
  SlidersHorizontal,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { groceryService } from '../services/api';

const StoresPage = () => {
  const { storeId } = useParams();
  const [stores, setStores] = useState([]);
  const [currentStore, setCurrentStore] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states for /stores
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Category filter state for /store/:storeId
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        if (storeId) {
          const res = await groceryService.getStoreCatalog(storeId);
          if (res.data?.data) {
            setCurrentStore(res.data.data.store);
            setCatalog(res.data.data.catalog || []);
          }
        } else {
          const res = await groceryService.getStores({ city: 'Indore' });
          if (res.data?.data) {
            setStores(res.data.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch store info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [storeId]);

  // -------------------------------------------------------------
  // VIEW: SPECIFIC STORE CATALOG (/store/:storeId)
  // -------------------------------------------------------------
  if (storeId) {
    const visibleCatalog = selectedCategoryTab === 'all'
      ? catalog
      : catalog.filter((sec) => sec.id === selectedCategoryTab || sec.slug === selectedCategoryTab);

    return (
      <div className="bg-[#f4f7fb] min-h-screen pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* Back Nav */}
          <div>
            <Link
              to="/stores"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0055ff] hover:text-blue-700 transition mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Partner Stores</span>
            </Link>

            {/* Store Header Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="flex items-start gap-4 z-10">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-blue-50 border border-blue-100 flex-shrink-0 flex items-center justify-center">
                  {currentStore?.image ? (
                    <img
                      src={currentStore.image}
                      alt={currentStore.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-10 h-10 text-[#0055ff]" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                      ⚡ Open & Delivering in {currentStore?.deliveryTime || '10-15 mins'}
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      Verified Multi-Vendor Partner
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                    {currentStore?.name || 'Tricelyn Express Mart'}
                  </h1>

                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0055ff] flex-shrink-0" />
                    <span>{currentStore?.address || 'Scheme 54, Vijay Nagar, Indore'}</span>
                  </p>

                  <p className="text-[11px] text-gray-400">
                    Orders from this catalog are prepared and dispatched directly by this vendor.
                  </p>
                </div>
              </div>

              {/* Store Performance Badges */}
              <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 z-10">
                <div className="text-center sm:text-right">
                  <div className="flex items-center justify-center sm:justify-end gap-1 font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl text-sm border border-amber-200/60">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{currentStore?.rating || '4.8'}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-semibold">Store Rating</p>
                </div>

                <div className="text-center sm:text-right">
                  <div className="text-sm font-black text-gray-900">
                    ₹{currentStore?.minOrderAmount || 49}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">Min Order</p>
                </div>

                <div className="text-center sm:text-right">
                  <div className="text-sm font-black text-emerald-600">
                    FREE
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">Above ₹199</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Category Tabs */}
          {catalog.length > 0 && (
            <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setSelectedCategoryTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategoryTab === 'all'
                    ? 'bg-[#0055ff] text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Categories ({catalog.reduce((acc, c) => acc + (c.products?.length || 0), 0)})
              </button>

              {catalog.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setSelectedCategoryTab(sec.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    selectedCategoryTab === sec.id
                      ? 'bg-[#0055ff] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{sec.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategoryTab === sec.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {sec.products?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Catalog Sections */}
          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-8">
              {visibleCatalog.map((sec) => (
                <div key={sec.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                        {sec.name}
                      </h2>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        {sec.products?.length || 0} items
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {sec.products.map((p) => (
                      <ProductCard key={p._id || p.id} product={{ ...p, _id: p._id || p.id }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: ALL STORES LISTING (/stores)
  // -------------------------------------------------------------
  const filteredStores = stores.filter((st) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = st.name?.toLowerCase().includes(q);
      const matchAddress = st.address?.toLowerCase().includes(q);
      const matchTags = (st.tags || []).some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchAddress && !matchTags) return false;
    }

    // Filter tabs
    if (activeFilter === 'fast') {
      const dt = String(st.deliveryTime || '');
      return dt.includes('8') || dt.includes('10') || dt.includes('12');
    }
    if (activeFilter === 'rated') {
      return Number(st.rating || 0) >= 4.7;
    }
    if (activeFilter === 'pureveg') {
      return st.isPureVeg === true;
    }
    return true;
  });

  return (
    <div className="bg-[#f4f7fb] min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0055ff] hover:text-blue-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Partner Supermarkets & Dark Stores
                </h1>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Indore Hyperlocal Mart
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Order groceries directly from local partner stores with their specific price lists and instant 10-15m delivery
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3.5">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shops by name, locality (Vijay Nagar, Palasia, Saket...) or category"
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#0055ff] focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-[#0055ff] text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              All Partner Shops ({stores.length})
            </button>
            <button
              onClick={() => setActiveFilter('fast')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'fast'
                  ? 'bg-[#0055ff] text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>⚡ Under 15 Mins</span>
            </button>
            <button
              onClick={() => setActiveFilter('rated')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'rated'
                  ? 'bg-[#0055ff] text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>Top Rated (★ 4.7+)</span>
            </button>
            <button
              onClick={() => setActiveFilter('pureveg')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'pureveg'
                  ? 'bg-[#0055ff] text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>100% Pure Veg Stores</span>
            </button>
          </div>
        </div>

        {/* Stores Grid */}
        {filteredStores.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-3">
            <Store className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-black text-gray-800">No stores match your search</h3>
            <p className="text-xs text-gray-500">Try searching with a different locality or clear filters</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
              className="px-4 py-2 bg-[#0055ff] text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStores.map((st) => (
              <Link
                key={st._id || st.id}
                to={`/store/${st._id || st.id}`}
                className="bg-white rounded-2xl border border-gray-100 hover:border-[#0055ff] shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-blue-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                    {st.image ? (
                      <img
                        src={st.image}
                        alt={st.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <Store className="w-10 h-10 text-[#0055ff]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-[#0055ff] transition truncate">
                        {st.name}
                      </h3>
                      <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50 flex-shrink-0">
                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                        <span>{st.rating || '4.8'}</span>
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {st.address || 'Indore, Madhya Pradesh'}
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span>{st.deliveryTime || '10-15 mins'}</span>
                      </span>
                      {st.distance && (
                        <span className="text-gray-400 text-[11px] font-medium">
                          • {st.distance}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-emerald-600">
                    Free delivery on ₹199+
                  </span>
                  <span className="font-bold text-[#0055ff] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    <span>Shop Catalog</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default StoresPage;
