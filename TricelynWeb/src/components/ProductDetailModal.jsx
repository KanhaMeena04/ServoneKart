import React from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Clock, 
  ShieldCheck, 
  Star, 
  Sparkles, 
  Truck, 
  Package, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductDetailModal = () => {
  const { selectedProductForDetail, setSelectedProductForDetail, getItemQuantity, addToCart, updateQuantity } = useCart();

  if (!selectedProductForDetail) return null;

  const product = selectedProductForDetail;
  const quantity = getItemQuantity(product._id);
  const price = Number(product.price) || 0;
  const mrp = Number(product.mrp) || Math.round(price * 1.25);
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const savings = mrp > price ? mrp - price : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header with Close */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              {product.category?.name || 'Daily Essentials'}
            </span>
          </div>
          <button
            onClick={() => setSelectedProductForDetail(null)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Top Product Section: Image + Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            
            {/* Image Gallery */}
            <div className="sm:col-span-5 bg-gray-50/80 rounded-2xl p-4 flex items-center justify-center border border-gray-100 h-64 relative">
              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-brand-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}
              <img
                src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80'}
                alt={product.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Title, Unit, Price */}
            <div className="sm:col-span-7 space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>10 - 15 Mins Delivery</span>
                </span>
                <span className="text-[10px] font-bold text-gray-400">
                  ⚡ Indore Dark Store Live
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-gray-900 leading-snug">
                {product.name}
              </h2>

              <p className="text-xs font-semibold text-gray-500">
                Pack Size: <span className="text-gray-900 font-bold">{product.weight || product.unit || '1 unit'}</span>
              </p>

              {/* Price & Savings */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl font-black text-gray-900">₹{price}</span>
                {mrp > price && (
                  <span className="text-sm font-semibold text-gray-400 line-through">₹{mrp}</span>
                )}
                {savings > 0 && (
                  <span className="text-xs font-bold text-accent-green bg-green-50 px-2 py-0.5 rounded-md">
                    Save ₹{savings}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-gray-400">Inclusive of all taxes</p>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-lg font-bold">
                  <span>4.6</span>
                  <Star className="w-3 h-3 fill-current text-green-600" />
                </div>
                <span className="text-gray-400 font-medium">1,248 Verified Indore Ratings</span>
              </div>
            </div>

          </div>

          {/* Key Product Details & Specifications */}
          <div className="border-t border-gray-100 pt-5 space-y-4 text-xs">
            <h4 className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px]">
              Product Information & Features
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Shelf Life</p>
                <p className="font-extrabold text-gray-800 mt-0.5">Fresh Daily Stock</p>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Country of Origin</p>
                <p className="font-extrabold text-gray-800 mt-0.5">India 🇮🇳</p>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Storage Instructions</p>
                <p className="font-extrabold text-gray-800 mt-0.5">Cool & Dry Place</p>
              </div>
            </div>

            {product.description && (
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/60 text-gray-700 leading-relaxed text-xs">
                <p className="font-bold text-brand-700 mb-1">About the Product:</p>
                <p>{product.description}</p>
              </div>
            )}

            {/* Return Policy & Freshness Guarantee */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-green-50 border border-green-100 text-green-900">
              <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Tricelyn Freshness & Quality Promise</p>
                <p className="text-[11px] text-green-700 mt-0.5">
                  100% replacement or instant refund if not satisfied at the time of delivery.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">Unit Price</div>
            <div className="text-lg font-black text-gray-900">₹{price}</div>
          </div>

          {quantity === 0 ? (
            <button
              onClick={() => addToCart(product, 1)}
              className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          ) : (
            <div className="flex items-center bg-brand-600 text-white rounded-2xl shadow-md overflow-hidden">
              <button
                onClick={() => updateQuantity(product._id, quantity - 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-brand-700 active:scale-90 transition font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-black select-none">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(product._id, quantity + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-brand-700 active:scale-90 transition font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductDetailModal;
