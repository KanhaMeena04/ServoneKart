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

  // High quality authentic quick-commerce pack shot images
  const getProductImage = () => {
    if (product.image && product.image.startsWith('http')) {
      if (product.image.includes('1516467508483')) {
        return 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80';
      }
      return product.image;
    }
    const nameLower = product.name?.toLowerCase() || '';
    if (nameLower.includes('banana')) return 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&q=80';
    if (nameLower.includes('milk') || nameLower.includes('amul')) return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80';
    if (nameLower.includes('tomato')) return 'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=400&q=80';
    if (nameLower.includes('bread')) return 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80';
    if (nameLower.includes('lays') || nameLower.includes('chips')) return 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&q=80';
    if (nameLower.includes('egg')) return 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80';
    if (nameLower.includes('atta') || nameLower.includes('flour') || nameLower.includes('rice')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80';
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80';
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-100 hover:border-[#0055ff] shadow-[0_2px_8px_rgba(0,85,255,0.04)] hover:shadow-[0_8px_20px_rgba(0,85,255,0.10)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between overflow-hidden group p-2.5 sm:p-3 relative">
      
      {/* Attractive Image Container with Rounded Corners & Soft Gradient */}
      <div 
        onClick={handleCardClick}
        className="relative w-full h-32 sm:h-34 rounded-xl overflow-hidden bg-gradient-to-b from-blue-50/25 via-white to-gray-50/60 border border-blue-50/80 p-2 mb-2 flex items-center justify-center cursor-pointer group-hover:border-blue-200/80 transition-all"
        title="View product details"
      >
        {/* Quick delivery badge */}
        <span className="absolute top-1.5 left-1.5 text-[9px] font-bold text-blue-700 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md shadow-2xs border border-blue-100/70 flex items-center gap-0.5 z-10">
          <Clock className="w-2.5 h-2.5 text-blue-600" />
          <span>10 MINS</span>
        </span>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-1.5 right-1.5 text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60 z-10">
            {discountPercent}% OFF
          </span>
        )}

        <img
          src={getProductImage()}
          alt={product.name}
          className="max-h-full max-w-full object-contain mix-blend-multiply rounded-lg group-hover:scale-108 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Product Info with Tight, Clean Spacing */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Product Name */}
          <h4 
            onClick={handleCardClick}
            className="text-xs sm:text-[13px] font-extrabold text-gray-900 line-clamp-1 group-hover:text-[#0055ff] transition cursor-pointer mb-0.5 leading-tight" 
            title={product.name}
          >
            {product.name}
          </h4>

          {/* Weight / Unit Subtitle */}
          <div className="text-[11px] font-medium text-gray-500 mb-1">
            {product.weight || product.unit || '1 unit'}
          </div>

          {/* Pricing Row with Clean Alignment */}
          <div className="flex items-baseline gap-1.5 mb-1 flex-wrap">
            <span className="text-xs sm:text-sm font-black text-gray-900">₹{price}</span>
            {mrp > price && (
              <span className="text-[10px] sm:text-[11px] font-medium text-gray-400 line-through">₹{mrp}</span>
            )}
          </div>

          {/* Star Rating & Reviews */}
          <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-gray-800">{product.rating || '4.5'}</span>
            <span className="text-gray-400">({product.ratingsCount || '1.2k'})</span>
          </div>
        </div>

        {/* Add to Cart Button (Solid Electric Blue matching Brand Theme) */}
        <div>
          {quantity === 0 ? (
            <button
              onClick={() => addToCart(product, 1)}
              className="w-full py-1.5 sm:py-2 bg-[#0055ff] hover:bg-[#0047d4] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          ) : (
            <div className="flex items-center justify-between bg-[#0055ff] text-white rounded-xl shadow-xs overflow-hidden py-1 px-1">
              <button
                onClick={() => updateQuantity(productId, quantity - 1)}
                className="w-7 h-6 flex items-center justify-center hover:bg-white/20 active:scale-90 transition font-bold"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black select-none px-2">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(productId, quantity + 1)}
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
