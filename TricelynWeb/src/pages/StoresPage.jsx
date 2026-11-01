import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, Star, Clock, MapPin, ArrowLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { groceryService } from '../services/api';

const StoresPage = () => {
  const { storeId } = useParams();
  const [stores, setStores] = useState([]);
  const [currentStore, setCurrentStore] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (storeId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <Link to="/stores" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Partner Stores</span>
          </Link>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-accent-greenDark bg-green-50 px-2.5 py-0.5 rounded-full">
                Open & Delivering in 10-15 Mins
              </span>
              <h1 className="text-2xl font-black text-gray-900 mt-1">
                {currentStore?.name || 'Indore Super Fresh Mart'}
              </h1>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>{currentStore?.address || 'Scheme 54, Vijay Nagar, Indore'}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1 font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-lg text-xs">
                  ★ {currentStore?.rating || '4.8'}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Verified Partner</p>
              </div>
            </div>
          </div>
        </div>

        {/* Store Catalog by Sections */}
        {catalog.map((sec) => (
          <div key={sec.id} className="space-y-3">
            <h2 className="text-lg font-black text-gray-900">{sec.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {sec.products.map((p) => (
                <ProductCard key={p.id} product={{ ...p, _id: p.id }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <h1 className="text-2xl font-black text-gray-900">Partner Supermarkets & Dark Stores in Indore</h1>
        <p className="text-xs text-gray-500 mt-1">Instant delivery available across Vijay Nagar, Palasia, Rajwada, and Super Corridor</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {stores.map((st) => (
          <Link
            key={st._id}
            to={`/store/${st._id}`}
            className="bg-white rounded-3xl border border-gray-100 hover:border-brand-300 hover:shadow-card-hover transition p-5 flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                <Store className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-gray-900 group-hover:text-brand-600 transition truncate">
                  {st.name}
                </h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">{st.address || 'Indore, Madhya Pradesh'}</p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="flex items-center gap-1 font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded text-[10px]">
                    ★ {st.rating || '4.6'}
                  </span>
                  <span className="text-[11px] font-bold text-gray-700">
                    ⚡ {st.deliveryTime || '12-15 mins'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-[11px] font-medium text-gray-400">Free delivery on ₹199+</span>
              <span className="font-bold text-brand-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                <span>View Catalogue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StoresPage;
