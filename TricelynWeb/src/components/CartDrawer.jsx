import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Minus, 
  Tag, 
  ArrowRight, 
  ArrowLeft,
  Share2,
  Clock,
  Info,
  Store,
  ShoppingBag,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

const CartDrawer = () => {
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
      setIsCartDrawerOpen(false);
      setIsAuthModalOpen(true);
    } else {
      setIsCartDrawerOpen(false);
      navigate('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-[#f8fafc] shadow-2xl flex flex-col h-full h-[100dvh] transform transition-all duration-300 ease-in-out">
          
          {/* Header */}
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

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-16">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-[#0055ff]">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-800">Your cart is empty</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Explore fresh vegetables, dairy, fruits and snacks in {selectedLocation?.name || 'your area'}.
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
                {/* Delivery Speed Banner */}
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
                        ? `Multi-vendor basket: ${itemCount} items across ${storeCount} partner stores`
                        : `Shipment of ${itemCount} ${itemCount === 1 ? 'item' : 'items'} · ${storeGroups[0]?.storeName || 'Tricelyn Dark Store'}`}
                    </p>
                  </div>
                </div>

                {/* Free Delivery Milestone Progress (Quick-Commerce Standard) */}
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-3.5 rounded-2xl border border-emerald-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-gray-800 flex items-center gap-1.5">
                      <span>🚚</span>
                      {subtotal >= 199 ? (
                        <span className="text-emerald-700 font-black">Congratulations! You unlocked FREE Delivery</span>
                      ) : (
                        <span>Add items worth <strong className="text-emerald-700">₹{(199 - subtotal).toFixed(0)}</strong> for FREE Delivery</span>
                      )}
                    </span>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      ₹199 Min
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-emerald-100">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.round((subtotal / 199) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Multi-vendor Store Groups */}
                {storeGroups.map((group) => (
                  <div key={group.storeId} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between px-1 pb-1.5 border-b border-gray-100">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-[#0055ff]">
                        <Store className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[220px]">{group.storeName}</span>
                      </span>
                      <span className="text-[10px] font-bold text-gray-500">
                        {group.items.length} {group.items.length === 1 ? 'SKU' : 'SKUs'} · ₹{group.subtotal.toFixed(0)}
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
                            className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                          >
                            <div className="w-14 h-14 bg-gray-50 rounded-xl p-1 flex items-center justify-center flex-shrink-0 border border-gray-100">
                              <img
                                src={item.product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80'}
                                alt={item.product.name}
                                className="max-h-full max-w-full object-contain mix-blend-multiply"
                              />
                            </div>

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

                            <div className="flex items-center bg-[#0c831f] text-white rounded-xl shadow-xs overflow-hidden py-1 px-1 flex-shrink-0">
                              <button
                                onClick={() => updateQuantity(pid, item.quantity - 1)}
                                className="w-7 h-6 flex items-center justify-center hover:bg-white/20 active:scale-90 transition font-bold"
                                aria-label="Decrease"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center text-xs font-black select-none">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(pid, item.quantity + 1)}
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
                  </div>
                ))}

                {/* Promo Code Input */}
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

                  {/* Available Quick Coupons */}
                  {!coupon && (
                    <div className="space-y-1.5 pt-1 border-t border-gray-100">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Best Available Coupons</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div 
                          onClick={() => handleApplyPromo('WELCOME50')}
                          className="bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/80 rounded-xl p-2 cursor-pointer transition active:scale-95 text-left"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-amber-900">WELCOME50</span>
                            <span className="text-[10px] font-bold text-[#0055ff]">APPLY</span>
                          </div>
                          <p className="text-[10px] text-amber-700 mt-0.5">Flat ₹50 OFF</p>
                        </div>
                        <div 
                          onClick={() => handleApplyPromo('TRICELYN20')}
                          className="bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 rounded-xl p-2 cursor-pointer transition active:scale-95 text-left"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-blue-900">TRICELYN20</span>
                            <span className="text-[10px] font-bold text-[#0055ff]">APPLY</span>
                          </div>
                          <p className="text-[10px] text-blue-700 mt-0.5">20% OFF up to ₹100</p>
                        </div>
                      </div>
                    </div>
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

                  <div className="flex items-center justify-between text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>Handling charge</span>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="font-bold text-gray-900">₹{platformFee.toFixed(0)}</span>
                  </div>

                  <div className="border-t border-gray-100 pt-2.5 mt-1 flex items-center justify-between text-sm font-black text-gray-900">
                    <div className="flex items-center gap-1">
                      <span>Grand total</span>
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <span className="text-base text-gray-900">₹{grandTotal.toFixed(0)}</span>
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
              </>
            )}
          </div>

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
