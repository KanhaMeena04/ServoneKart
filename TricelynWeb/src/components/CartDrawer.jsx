import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ArrowRight, 
  ArrowLeft,
  Share2,
  Clock,
  Info,
  ShieldCheck, 
  MapPin, 
  Sparkles,
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

const CartDrawer = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthModalOpen } = useAuth();
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    itemCount, 
    subtotal, 
    mrpTotal, 
    totalSavings, 
    deliveryFee, 
    platformFee, 
    coupon, 
    couponDiscount, 
    couponError, 
    applyCoupon, 
    removeCoupon, 
    grandTotal, 
    isCartDrawerOpen, 
    setIsCartDrawerOpen 
  } = useCart();

  const { selectedLocation } = useLocation();
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isCartDrawerOpen) return null;

  const handleApplyPromo = async (codeToApply = null) => {
    const code = codeToApply || promoCodeInput;
    if (!code) return;
    const res = await applyCoupon(code);
    if (res.success) {
      setPromoCodeInput('');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Tricelyn Cart',
        text: `Check out my grocery cart on Tricelyn! ${itemCount} items ready for 10-15 min delivery in Indore.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleProceed = () => {
    if (!isAuthenticated) {
      setIsCartDrawerOpen(false);
      setIsAuthModalOpen(true);
    } else {
      setIsCartDrawerOpen(false);
      navigate('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-[#f8fafc] shadow-2xl flex flex-col h-full h-[100dvh] transform transition-all duration-300 ease-in-out">
          
          {/* Header (Matches Reference Screenshot 5: Back Arrow + My Cart + Share) */}
          <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 active:scale-95 transition"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="text-base font-black text-gray-900">
                My Cart
              </h3>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShare ? 'Copied!' : 'Share'}</span>
            </button>
          </div>

          {/* Scrollable Body with Ample Bottom Clearance */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-16">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-[#0055ff]">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-800">Your cart is empty</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Explore fresh vegetables, dairy, fruits and snacks in Indore.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="px-6 py-2.5 bg-[#0055ff] text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* 1. Delivery in 10-15 Minutes Banner (Matches Screenshot 5) */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 leading-tight">
                      Delivery in 10-15 minutes
                    </h4>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      Shipment of {itemCount} {itemCount === 1 ? 'item' : 'items'} · Indore Dark Store Live
                    </p>
                  </div>
                </div>

                {/* 2. Cart Items Card (Matches Screenshot 5) */}
                <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs divide-y divide-gray-100">
                  {items.map((item) => {
                    const price = Number(item.product.price) || 0;
                    const mrp = Number(item.product.mrp) || Math.round(price * 1.25);

                    return (
                      <div
                        key={item.product._id}
                        className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                      >
                        {/* Thumbnail */}
                        <div className="w-14 h-14 bg-gray-50 rounded-xl p-1 flex items-center justify-center flex-shrink-0 border border-gray-100">
                          <img
                            src={item.product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80'}
                            alt={item.product.name}
                            className="max-h-full max-w-full object-contain mix-blend-multiply"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-extrabold text-gray-900 truncate">
                            {item.product.name}
                          </h5>
                          <p className="text-[11px] text-gray-500 font-medium">
                            {item.product.weight || item.product.unit || '1 unit'}
                          </p>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xs font-black text-gray-900">₹{price}</span>
                            {mrp > price && (
                              <span className="text-[10px] text-gray-400 line-through">₹{mrp}</span>
                            )}
                          </div>
                        </div>

                        {/* Solid Green Quantity Stepper (Matches Screenshot 5) */}
                        <div className="flex items-center bg-[#0c831f] text-white rounded-xl shadow-xs overflow-hidden py-1 px-1 flex-shrink-0">
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            className="w-7 h-6 flex items-center justify-center hover:bg-white/20 active:scale-90 transition font-bold"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-black select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            className="w-7 h-6 flex items-center justify-center hover:bg-white/20 active:scale-90 transition font-bold"
                            aria-label="Increase"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 3. Promo Code Input */}
                <div className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                    <Tag className="w-3.5 h-3.5 text-[#0055ff]" />
                    <span>Apply Promocode / Coupon</span>
                  </div>

                  {coupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs font-bold text-green-800">{coupon.code} Applied</p>
                          <p className="text-[10px] text-green-600 font-medium">Saved ₹{couponDiscount} extra</p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs text-red-500 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        placeholder="e.g. SAVE25, WELCOME50"
                        className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl uppercase font-bold focus:outline-none focus:border-[#0055ff]"
                      />
                      <button
                        onClick={() => handleApplyPromo()}
                        className="px-4 py-1.5 bg-[#0055ff] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <p className="text-[11px] text-red-500 font-medium">{couponError}</p>
                  )}
                </div>

                {/* 4. Bill Details Card (Matches Screenshot 5) */}
                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs space-y-2.5 text-xs">
                  <h6 className="font-extrabold text-gray-900 text-xs tracking-tight">
                    Bill details
                  </h6>

                  {/* Items Total with Saved badge */}
                  <div className="flex items-center justify-between text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>Items total</span>
                      {totalSavings > 0 && (
                        <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded">
                          Saved ₹{totalSavings}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {mrpTotal > subtotal && (
                        <span className="text-gray-400 line-through text-[11px]">₹{mrpTotal.toFixed(0)}</span>
                      )}
                      <span className="font-bold text-gray-900">₹{subtotal.toFixed(0)}</span>
                    </div>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Coupon discount</span>
                      <span>-₹{couponDiscount.toFixed(0)}</span>
                    </div>
                  )}

                  {/* Delivery Charge */}
                  <div className="flex items-center justify-between text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>Delivery charge</span>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="font-bold text-gray-900">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-black uppercase text-[10px]">FREE</span>
                      ) : (
                        `₹${deliveryFee.toFixed(0)}`
                      )}
                    </span>
                  </div>

                  {/* Handling Charge */}
                  <div className="flex items-center justify-between text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>Handling charge</span>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="font-bold text-gray-900">₹{platformFee.toFixed(0)}</span>
                  </div>

                  {/* Grand Total */}
                  <div className="border-t border-gray-100 pt-2.5 mt-1 flex items-center justify-between text-sm font-black text-gray-900">
                    <div className="flex items-center gap-1">
                      <span>Grand total</span>
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <span className="text-base text-gray-900">₹{grandTotal.toFixed(0)}</span>
                  </div>
                </div>

                {/* 5. Cancellation Policy Card (Matches Screenshot 5) */}
                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs space-y-1">
                  <h6 className="font-extrabold text-gray-900 text-xs tracking-tight">
                    Cancellation Policy
                  </h6>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                    Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* 6. Sticky Bottom Proceed Bar (Matches Screenshot 5: Green Bar) */}
          {items.length > 0 && (
            <div className="flex-shrink-0 p-3 sm:p-4 bg-white border-t border-gray-100 shadow-xl z-20">
              <button
                onClick={handleProceed}
                className="w-full py-3.5 bg-[#0c831f] hover:bg-[#0a701a] active:scale-[0.98] text-white rounded-2xl shadow-md transition flex items-center justify-between px-5 font-black text-sm"
              >
                <div className="text-left">
                  <div className="text-base font-black leading-tight">₹{grandTotal.toFixed(0)}</div>
                  <div className="text-[9px] uppercase tracking-wider text-emerald-100 leading-none">TOTAL</div>
                </div>

                <div className="flex items-center gap-1 text-sm font-black">
                  <span>{isAuthenticated ? 'Proceed to Pay' : 'Login to Proceed'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
