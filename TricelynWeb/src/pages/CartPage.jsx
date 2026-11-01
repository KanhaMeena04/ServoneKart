import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  MapPin, 
  Plus, 
  Minus, 
  Trash2, 
  Tag, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';

const CartPage = () => {
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
    grandTotal 
  } = useCart();
  const { selectedLocation, setIsLocationModalOpen } = useLocation();

  const [promoInput, setPromoInput] = useState('');

  const handleApplyPromo = async (codeToUse = null) => {
    const code = codeToUse || promoInput;
    if (!code) return;
    const res = await applyCoupon(code);
    if (res.success) {
      setPromoInput('');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-blue-50 text-brand-600 mx-auto flex items-center justify-center font-bold text-2xl shadow-sm">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Add fresh fruits, vegetables, dairy, and household essentials to your basket to enjoy 10-15 min delivery in Indore.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition"
        >
          <span>Start Shopping Groceries</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Location & Navigation Header (Matches Reference Image 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900">Your Cart</h1>
            <span className="text-xs font-bold bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {/* Selected Address Display (Matches Image 4) */}
        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-200 hover:border-brand-500 text-left shadow-xs transition"
        >
          <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400">Delivering to</p>
            <p className="text-xs font-extrabold text-gray-800 truncate max-w-[200px]">
              {selectedLocation?.locality || selectedLocation?.name || 'Vijay Nagar, Indore'}
            </p>
          </div>
        </button>
      </div>

      {/* Main Cart Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Items Table / List (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          
          {/* Table Header Row (Matches Image 4: Product | Price | Quantity | Subtotal) */}
          <div className="hidden sm:grid grid-cols-12 gap-4 text-[11px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-3">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Subtotal</div>
          </div>

          {/* Table Items */}
          <div className="divide-y divide-gray-100">
            {items.map((item) => {
              const price = Number(item.product.price) || 0;
              const lineTotal = price * item.quantity;

              return (
                <div 
                  key={item.product._id} 
                  className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
                >
                  {/* Product Info */}
                  <div className="sm:col-span-6 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 p-1.5 flex items-center justify-center flex-shrink-0 border border-gray-100">
                      <img
                        src={item.product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80'}
                        alt={item.product.name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {item.product.weight || item.product.unit || '1 unit'}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 mt-1 sm:hidden"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="sm:col-span-2 sm:text-center text-xs font-bold text-gray-700">
                    <span className="sm:hidden text-gray-400 mr-1 font-normal">Price:</span>
                    ₹{price}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="sm:col-span-2 flex sm:justify-center">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl shadow-xs overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 active:scale-90 transition text-gray-700 font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-black text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 active:scale-90 transition text-gray-700 font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Line Subtotal */}
                  <div className="sm:col-span-2 text-right flex items-center justify-between sm:justify-end gap-2">
                    <span className="sm:hidden text-gray-400 text-xs">Total:</span>
                    <span className="text-xs font-black text-gray-900">₹{lineTotal}</span>
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="hidden sm:inline-flex text-gray-300 hover:text-red-500 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Promocode Banner (Matches Reference Image 4) */}
          <div className="mt-6 p-4 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-bold text-gray-800">Do you have any promocode?</span>
            </div>

            {coupon ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <div>
                    <span className="text-xs font-bold text-green-800">{coupon.code} applied!</span>
                    <p className="text-[10px] text-green-700">You saved ₹{couponDiscount} on this order.</p>
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
                  placeholder="Enter code (e.g. SAVE25 or WELCOME50)"
                  className="flex-1 px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl font-bold uppercase focus:outline-none focus:border-brand-500"
                />
                <button
                  onClick={() => handleApplyPromo()}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Apply
                </button>
              </div>
            )}

            {couponError && (
              <p className="text-[11px] text-red-500 font-medium">{couponError}</p>
            )}

            {!coupon && (
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  onClick={() => handleApplyPromo('SAVE25')}
                  className="text-[11px] bg-white border border-dashed border-brand-300 text-brand-600 px-3 py-1 rounded-lg font-bold hover:bg-brand-50 transition"
                >
                  🏷️ SAVE25 (₹25 Off)
                </button>
                <button
                  onClick={() => handleApplyPromo('WELCOME50')}
                  className="text-[11px] bg-white border border-dashed border-green-300 text-green-700 px-3 py-1 rounded-lg font-bold hover:bg-green-50 transition"
                >
                  🎉 WELCOME50 (₹50 Off)
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right: Bill Summary & Checkout CTA (4 cols) (Matches Reference Image 4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 sticky top-24">
          <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-3">
            Bill Details
          </h3>

          <div className="space-y-2.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Cost of items</span>
              <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Promo code ({coupon?.code})</span>
                <span>-₹{couponDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-gray-900">
                {deliveryFee === 0 ? <span className="text-green-600 font-bold uppercase text-[10px]">FREE</span> : `₹${deliveryFee}`}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Platform Fee</span>
              <span className="font-semibold text-gray-900">₹{platformFee}</span>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-black text-gray-900">
              <span>Total Amount</span>
              <span className="text-lg text-brand-600">₹{grandTotal.toFixed(0)}</span>
            </div>
          </div>

          {/* Big Green Checkout Button (Matches Reference Image 4) */}
          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-accent-green hover:bg-accent-greenDark active:scale-[0.98] text-white rounded-2xl text-sm font-black shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-between px-6"
          >
            <span>Proceed to Checkout</span>
            <div className="flex items-center gap-1 font-black">
              <span>₹{grandTotal.toFixed(0)}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>Delivery in 10-15 Minutes across Indore</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CartPage;
