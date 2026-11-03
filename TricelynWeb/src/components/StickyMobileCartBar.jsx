import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const StickyMobileCartBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount, subtotal, grandTotal, setIsCartDrawerOpen } = useCart();

  // Hide on checkout, order success, tracking, or cart full page
  const hiddenPaths = ['/checkout', '/order-success', '/cart', '/track'];
  const shouldHide = hiddenPaths.some(p => location.pathname.startsWith(p));

  if (itemCount === 0 || shouldHide) {
    return null;
  }

  const activeTotal = grandTotal || subtotal || 0;

  const handleOpenCart = () => {
    // Open drawer or navigate to cart
    if (window.innerWidth < 640) {
      setIsCartDrawerOpen(true);
    } else {
      setIsCartDrawerOpen(true);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:bottom-5 sm:right-6 sm:left-auto sm:w-84 p-2.5 sm:p-0 pointer-events-none animate-in slide-in-from-bottom-4 duration-200">
      <div 
        onClick={handleOpenCart}
        className="pointer-events-auto bg-[#0c831f] hover:bg-[#0a701a] text-white rounded-2xl shadow-[0_8px_25px_rgba(12,131,31,0.45)] px-4 py-3 flex items-center justify-between cursor-pointer transition-all duration-200 active:scale-98 border border-white/20 group"
      >
        {/* Left: Cart Icon & Item count + Price (Matches Mockup) */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider leading-none mb-0.5">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </div>
            <div className="text-sm sm:text-base font-black text-white leading-none">
              ₹{activeTotal}
            </div>
          </div>
        </div>

        {/* Right: View Cart Button with Chevron (Matches Mockup) */}
        <div className="flex items-center gap-1 font-black text-xs sm:text-sm text-white bg-white/15 px-3 py-1.5 rounded-xl group-hover:bg-white/25 transition">
          <span>View Cart</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default StickyMobileCartBar;

