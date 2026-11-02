import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Star, Clock, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { getItemQuantity, addToCart, updateQuantity } = useCart();
  const productId = product._id || product.id || product.slug;
  const quantity = getItemQuantity(productId);

  const price = Number(product.price ?? product.sellingPrice ?? product.basePrice) || 0;
  const mrp = Number(product.mrp) || Math.round(price * 1.25);
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : (product.discountPercent || 0);

  const handleCardClick = () => {
    navigate(`/product/${productId}`);
  };

  // Fallback image helper
  const getProductImage = () => {
    if (product.image && product.image.startsWith('http')) return product.image;
    const nameLower = product.name?.toLowerCase() || '';
    if (nameLower.includes('banana')) return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80';
    if (nameLower.includes('milk') || nameLower.includes('amul')) return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80';
    if (nameLower.includes('tomato')) return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80';
    if (nameLower.includes('bread')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80';
    if (nameLower.includes('lays') || nameLower.includes('chips')) return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80';
    if (nameLower.includes('egg')) return 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&q=80';
    if (nameLower.includes('atta') || nameLower.includes('flour') || nameLower.includes('rice')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80';
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group p-3 sm:p-3.5 relative">
      
      {/* Clickable Image Container */}
      <div 
        onClick={handleCardClick}
        className="relative w-full h-32 sm:h-36 flex items-center justify-center p-2 mb-2 bg-gray-50/70 rounded-xl group-hover:bg-blue-50/30 transition cursor-pointer"
        title="View product details"
      >
        <img
          src={getProductImage()}
          alt={product.name}
          className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Product Info (Matches Master Mockup) */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Product Name (Clickable) */}
          <h4 
            onClick={handleCardClick}
            className="text-xs sm:text-sm font-extrabold text-gray-900 line-clamp-1 group-hover:text-[#0055ff] transition cursor-pointer mb-0.5" 
            title={product.name}
          >
            {product.name}
          </h4>

          {/* Weight / Unit Subtitle */}
          <div className="text-[11px] font-medium text-gray-500 mb-1.5">
            {product.weight || product.unit || '1 unit'}
          </div>

          {/* Pricing Row with Green Discount Pill */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-black text-gray-900">₹{price}</span>
            {mrp > price && (
              <span className="text-[11px] font-medium text-gray-400 line-through">₹{mrp}</span>
            )}
            {discountPercent > 0 && (
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Star Rating & Reviews */}
          <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-2.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-gray-800 text-[11px]">{product.rating || '4.5'}</span>
            <span className="text-[10px] text-gray-400">({product.ratingsCount || '1.2k'})</span>
          </div>
        </div>

        {/* Add to Cart Button (Solid Electric Blue matching Mockup) */}
        <div>
          {quantity === 0 ? (
            <button
              onClick={() => addToCart(product, 1)}
              className="w-full py-2 bg-[#0055ff] hover:bg-[#0047d4] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          ) : (
            <div className="flex items-center justify-between bg-[#0055ff] text-white rounded-xl shadow-xs overflow-hidden py-1 px-1">
              <button
                onClick={() => updateQuantity(product._id || product.id, quantity - 1)}
                className="w-7 h-6 flex items-center justify-center hover:bg-white/20 active:scale-90 transition font-bold"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black select-none px-2">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(product._id || product.id, quantity + 1)}
                className="w-7 h-6 flex items-center justify-center hover:bg-white/20 active:scale-90 transition font-bold"
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
