import React from 'react';
import { Plus, Minus, Star, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { getItemQuantity, addToCart, updateQuantity } = useCart();
  const quantity = getItemQuantity(product._id);

  const price = Number(product.price) || 0;
  const mrp = Number(product.mrp) || Math.round(price * 1.25);
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const savings = mrp > price ? mrp - price : 0;

  // Placeholder images for grocery categories if image is null or placeholder
  const getProductImage = () => {
    if (product.image && product.image.startsWith('http')) return product.image;
    // High-resolution realistic grocery imagery fallback
    const nameLower = product.name?.toLowerCase() || '';
    if (nameLower.includes('milk') || nameLower.includes('amul')) {
      return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80';
    }
    if (nameLower.includes('potato') || nameLower.includes('pyaaz') || nameLower.includes('onion') || nameLower.includes('tomato')) {
      return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80';
    }
    if (nameLower.includes('bread') || nameLower.includes('bakery')) {
      return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80';
    }
    if (nameLower.includes('atta') || nameLower.includes('flour') || nameLower.includes('rice') || nameLower.includes('dal')) {
      return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80';
    }
    if (nameLower.includes('snack') || nameLower.includes('lays') || nameLower.includes('chips')) {
      return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80';
    }
    if (nameLower.includes('drink') || nameLower.includes('juice') || nameLower.includes('thums')) {
      return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80';
    }
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-brand-200 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden group p-3 relative">
      
      {/* Top Badges */}
      <div className="flex items-center justify-between w-full mb-1">
        {discountPercent > 0 ? (
          <span className="bg-brand-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
            {discountPercent}% OFF
          </span>
        ) : (
          <span className="text-[10px] font-bold text-gray-400">FRESH</span>
        )}
        
        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
          <Clock className="w-2.5 h-2.5 text-brand-600" />
          <span>10-15m</span>
        </div>
      </div>

      {/* Image Container */}
      <div className="relative w-full h-36 flex items-center justify-center p-2 mb-2 bg-gray-50/50 rounded-xl group-hover:bg-blue-50/20 transition">
        <img
          src={getProductImage()}
          alt={product.name}
          className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Weight / Unit Pill */}
          <div className="text-[11px] font-medium text-gray-500 mb-1">
            {product.weight || product.unit || '1 unit'}
          </div>

          {/* Product Name */}
          <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug mb-1.5 group-hover:text-brand-600 transition" title={product.name}>
            {product.name}
          </h4>

          {/* Rating Badge */}
          <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-2">
            <div className="flex items-center gap-0.5 bg-green-50 text-green-700 px-1.5 py-0.2 rounded font-bold text-[10px]">
              <span>4.5</span>
              <Star className="w-2.5 h-2.5 fill-current text-green-600" />
            </div>
            <span className="text-[10px] text-gray-400">(1.2k)</span>
          </div>
        </div>

        {/* Price & Add to Cart Stepper */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-gray-900">₹{price}</span>
              {mrp > price && (
                <span className="text-[11px] font-medium text-gray-400 line-through">₹{mrp}</span>
              )}
            </div>
            {savings > 0 && (
              <span className="text-[10px] font-bold text-accent-green">
                Save ₹{savings}
              </span>
            )}
          </div>

          {/* Add / Stepper Button */}
          {quantity === 0 ? (
            <button
              onClick={() => addToCart(product, 1)}
              className="px-4 py-1.5 bg-brand-50 hover:bg-brand-600 text-brand-600 hover:text-white border border-brand-200 hover:border-brand-600 rounded-xl text-xs font-extrabold uppercase transition-all shadow-xs flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD</span>
            </button>
          ) : (
            <div className="flex items-center bg-brand-600 text-white rounded-xl shadow-xs overflow-hidden">
              <button
                onClick={() => updateQuantity(product._id, quantity - 1)}
                className="w-7 h-7 flex items-center justify-center hover:bg-brand-700 active:scale-90 transition font-bold"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-black select-none">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(product._id, quantity + 1)}
                className="w-7 h-7 flex items-center justify-center hover:bg-brand-700 active:scale-90 transition font-bold"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

