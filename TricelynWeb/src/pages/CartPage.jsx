import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Tag, 
  ArrowRight, 
  ArrowLeft,
  Share2,
  Clock,
  Info,
  Store,
  CheckCircle2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthModalOpen } = useAuth();
  const { 
    items, 
    storeGroups,
    storeCount,
    isMultiStore,
    updateQuantity, 
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
    grandTotal 
  } = useCart();
  const { selectedLocation } = useLocation();

  const [promoInput, setPromoInput] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  const handleApplyPromo = async (codeToUse = null) => {
    const code = codeToUse || promoInput;
    if (!code) return;
    const res = await applyCoupon(code);
    if (res.success) {
      setPromoInput('');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Tricelyn Cart',
        text: `Check out my grocery cart on Tricelyn! ${itemCount} items ready for 10-15 min delivery.`,
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
      setIsAuthModalOpen(true);
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-blue-50 text-[#0055ff] mx-auto flex items-center justify-center font-bold text-2xl shadow-sm">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Add fresh fruits, vegetables, dairy, and household essentials to your basket to enjoy 10-15 min delivery.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0055ff] hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition"
        >
          <span>Start Shopping Groceries</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-6 pb-36 sm:pb-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
        
        {/* Top Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base font-black text-gray-900">My Cart</h1>
              <p className="text-[11px] text-gray-500 font-medium">Delivering to {selectedLocation?.locality || selectedLocation?.name || 'your selected hub'}</p>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedShare ? 'Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* Delivery Speed & Store Count Banner */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 leading-tight">
              Delivery in {selectedLocation?.eta || '10-15 minutes'}
            </h4>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {isMultiStore
                ? `Multi-Vendor Order: ${itemCount} items fulfilled across ${storeCount} Partner Stores`
                : `Shipment of ${itemCount} ${itemCount === 1 ? 'item' : 'items'} · ${storeGroups[0]?.storeName || 'Tricelyn Dark Store'}`}
            </p>
          </div>
        </div>

        {/* Cart Items Grouped by Vendor Store */}
        {storeGroups.map((group) => (
          <div key={group.storeId} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-2">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#0055ff]">
                <Store className="w-4 h-4" />
                <span>{group.storeName}</span>
              </span>
              <span className="text-[11px] font-bold text-gray-500">
                {group.items.length} {group.items.length === 1 ? 'item' : 'items'} · ₹{group.subtotal.toFixed(0)}
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {group.items.map((item) => {
                const price = Number(item.product.price) || 0;
                const mrp = Number(item.product.mrp) || price;
                const pid = item.product._id || item.product.id;

                return (
                  <div
                    key={pid}
                    className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3.5"
                  >
                    <div className="w-16 h-16 bg-gray-50 rounded-xl p-1.5 flex items-center justify-center flex-shrink-0 border border-gray-100">
                      <img
                        src={item.product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80'}
                        alt={item.product.name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-extrabold text-gray-900 truncate">
                        {item.product.name}
                      </h5>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {item.product.weight || item.product.unit || '1 unit'}
                      </p>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-sm font-black text-gray-900">₹{price}</span>
                        {mrp > price && (
                          <span className="text-xs text-gray-400 line-through">₹{mrp}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center bg-[#0c831f] text-white rounded-xl shadow-xs overflow-hidden py-1 px-1.5 flex-shrink-0">
                      <button
                        onClick={() => updateQuantity(pid, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white/20 active:scale-90 transition font-bold"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-black select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(pid, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white/20 active:scale-90 transition font-bold"
                        aria-label="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Promo Code Section */}
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Tag className="w-4 h-4 text-[#0055ff]" />
            <span>Apply Promocode / Coupon</span>
          </div>

          {coupon ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs font-bold text-green-800">{coupon.code} Applied</p>
                  <p className="text-[11px] text-green-600 font-medium">Saved extra ₹{couponDiscount} on this order</p>
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
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE25, WELCOME50"
                className="flex-1 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl uppercase font-bold focus:outline-none focus:border-[#0055ff]"
              />
              <button
                onClick={() => handleApplyPromo()}
                className="px-5 py-2 bg-[#0055ff] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Apply
              </button>
            </div>
          )}

          {couponError && (
            <p className="text-xs text-red-500 font-medium">{couponError}</p>
          )}
        </div>

        {/* Bill Details */}
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs space-y-2.5 text-xs">
          <h6 className="font-extrabold text-gray-900 text-xs tracking-tight">
            Bill details
          </h6>

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
                <span className="text-gray-400 line-through text-xs">₹{mrpTotal.toFixed(0)}</span>
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

          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center gap-1">
              <span>Delivery charge</span>
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <span className="font-bold text-gray-900">
              {deliveryFee === 0 ? (
                <span className="text-emerald-600 font-black uppercase text-[10px]">FREE</span>
              ) : (
                `₹${deliveryFee.toFixed(0)}`
              )}
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center gap-1">
              <span>Handling charge</span>
              <Info className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <span className="font-bold text-gray-900">₹{platformFee.toFixed(0)}</span>
          </div>

          <div className="border-t border-gray-100 pt-3 mt-1 flex items-center justify-between text-sm font-black text-gray-900">
            <div className="flex items-center gap-1">
              <span>Grand total</span>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-lg text-gray-900">₹{grandTotal.toFixed(0)}</span>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs space-y-1">
          <h6 className="font-extrabold text-gray-900 text-xs tracking-tight">
            Cancellation Policy
          </h6>
          <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
            Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
          </p>
        </div>

        {/* Sticky Bottom Proceed Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 shadow-lg flex items-center justify-center">
          <div className="w-full max-w-3xl px-2">
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
        </div>

      </div>
    </div>
  );
};

export default CartPage;
