import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Truck, Clock, ArrowRight, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ActiveOrderBanner = () => {
  const location = useLocation();
  const { activeOrderId, setActiveOrderId } = useCart();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if on the track order page itself
  if (!activeOrderId || dismissed || location.pathname.includes('/track/')) {
    return null;
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-30 w-[94vw] max-w-lg animate-in slide-in-from-bottom-3">
      <div className="bg-gray-900 text-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-gray-700 flex items-center justify-between gap-3">
        
        {/* Left Icon & Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-accent-green text-white flex items-center justify-center flex-shrink-0 font-bold">
            <Truck className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white truncate">
                Order #{activeOrderId}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
            </div>
            <p className="text-[11px] text-gray-400 truncate flex items-center gap-1">
              <Clock className="w-3 h-3 text-green-400" />
              <span>Arriving in 10-15 mins · Indore</span>
            </p>
          </div>
        </div>

        {/* Right Action & Dismiss */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to={`/track/${activeOrderId}`}
            className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
          >
            <span>Track</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="w-7 h-7 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ActiveOrderBanner;
