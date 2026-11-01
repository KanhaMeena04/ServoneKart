import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Sparkles,
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';

const CartDrawer = () => {
  const navigate = useNavigate();
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
  const [promoMessage, setPromoMessage] = useState(null);

  if (!isCartDrawerOpen) return null;

  const handleApplyPromo = async (codeToApply = null) => {
    const code = codeToApply || promoCodeInput;
    if (!code) return;
    const res = await applyCoupon(code);
    setPromoMessage(res.message);
    if (res.success) {
      setPromoCodeInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-all duration-300 ease-in-out">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  <span>Your Cart</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                  <MapPin className="w-3 h-3 text-brand-600" />
                  <span className="truncate max-w-[200px]">{selectedLocation?.name || 'Vijay Nagar, Indore'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          <div className="bg-blue-50/70 px-5 py-2.5 border-b border-blue-100/60 flex items-center justify-between text-xs">
            {subtotal >= 199 ? (
              <div className="flex items-center gap-1.5 text-accent-green font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>You have unlocked FREE Delivery!</span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full text-brand-700 font-semibold text-[11px]">
                <span>Add ₹{(199 - subtotal).toFixed(0)} more for FREE Delivery</span>
                <span className="font-extrabold text-gray-700">Goal: ₹199</span>
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-800">Your cart is empty</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Explore our fresh fruits, vegetables, snacks, and daily essentials.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const price = Number(item.product.price) || 0;
                    const itemTotal = price * item.quantity;

                    return (
                      <div
                        key={item.product._id}
                        className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gray-50/70 border border-gray-100"
                      >
                        {/* Thumbnail */}
                        <div className="w-14 h-14 bg-white rounded-xl p-1 flex items-center justify-center flex-shrink-0 border border-gray-100">
                          <img
                            src={item.product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80'}
                            alt={item.product.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-gray-900 truncate">
                            {item.product.name}
                          </h5>
                          <p className="text-[11px] text-gray-500">
                            {item.product.weight || item.product.unit || '1 unit'}
                          </p>
                          <div className="text-xs font-black text-gray-900 mt-1">
                            ₹{price}{' '}
                            <span className="text-[10px] text-gray-400 font-normal">each</span>
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 active:scale-90 transition text-gray-700 font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 active:scale-90 transition text-gray-700 font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right w-14 font-black text-xs text-gray-900">
                          ₹{itemTotal}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Promo Code Section (Matches Reference Image 4) */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                    <Tag className="w-4 h-4 text-brand-600" />
                    <span>Do you have any promocode?</span>
                  </div>

                  {coupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs font-bold text-green-800">{coupon.code} Applied</p>
                          <p className="text-[10px] text-green-600 font-medium">You saved ₹{couponDiscount}!</p>
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
                        placeholder="e.g. SAVE25 or WELCOME50"
                        className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl uppercase font-bold focus:outline-none focus:border-brand-500"
                      />
                      <button
                        onClick={() => handleApplyPromo()}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <p className="text-[11px] text-red-500 font-medium">{couponError}</p>
                  )}

                  {/* Available Coupon Chips */}
                  {!coupon && (
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        onClick={() => handleApplyPromo('SAVE25')}
                        className="text-[10px] bg-white border border-dashed border-brand-300 text-brand-600 px-2 py-1 rounded-lg font-bold hover:bg-brand-50 transition"
                      >
                        🏷️ SAVE25 (₹25 Off)
                      </button>
                      <button
                        onClick={() => handleApplyPromo('WELCOME50')}
                        className="text-[10px] bg-white border border-dashed border-green-300 text-green-700 px-2 py-1 rounded-lg font-bold hover:bg-green-50 transition"
                      >
                        🎉 WELCOME50 (₹50 Off)
                      </button>
                    </div>
                  )}
                </div>

                {/* Bill Details Breakdown (Matches Reference Image 4) */}
                <div className="p-4 bg-white rounded-2xl border border-gray-100 space-y-2 text-xs">
                  <h6 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2">
                    Bill Details
                  </h6>

                  <div className="flex justify-between text-gray-600">
                    <span>Cost of items</span>
                    <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Promo code ({coupon?.code})</span>
                      <span>-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-gray-900">
                      {deliveryFee === 0 ? (
                        <span className="text-green-600 font-bold uppercase text-[10px]">FREE</span>
                      ) : (
                        `₹${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Platform Fee</span>
                    <span className="font-semibold text-gray-900">₹{platformFee.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-gray-100 pt-2.5 mt-2 flex justify-between text-sm font-black text-gray-900">
                    <span>Grand Total</span>
                    <span className="text-base text-brand-600">₹{grandTotal.toFixed(2)}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg text-center text-[11px] font-bold text-green-700">
                      🎉 Total savings on this order: ₹{totalSavings + couponDiscount}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sticky Checkout CTA Footer */}
          {items.length > 0 && (
            <div className="p-4 bg-white border-t border-gray-100 shadow-lg">
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 bg-accent-green hover:bg-accent-greenDark active:scale-[0.98] text-white rounded-2xl text-sm font-extrabold shadow-md hover:shadow-lg transition flex items-center justify-between px-6"
              >
                <div className="text-left">
                  <div className="text-[10px] font-medium opacity-90">Total Payable</div>
                  <div className="text-base font-black">₹{grandTotal.toFixed(0)}</div>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold">
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 mt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span>100% Safe & Contactless Delivery in 10-15 Minutes</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;

