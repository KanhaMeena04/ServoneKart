import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Star, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  Tag, 
  Check, 
  Plus, 
  Minus, 
  ShoppingCart,
  Share2,
  Info,
  Package,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { groceryService } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getItemQuantity, addToCart, updateQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const similarScrollRef = useRef(null);
  const peopleScrollRef = useRef(null);

  // Fetch product data on id change
  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const res = await groceryService.getProductById(id);
        if (isMounted && res.data && res.data.data) {
          const p = res.data.data;
          setProduct(p);
          setSelectedImageIndex(0);
          if (p.variants && p.variants.length > 0) {
            setSelectedVariant(p.variants[0]);
          } else {
            setSelectedVariant({
              id: 'var_default',
              unit: p.weight || p.unit || '1 unit',
              weight: p.weight || p.unit || '1 unit',
              price: Number(p.price) || 40,
              mrp: Number(p.mrp) || Math.round((Number(p.price) || 40) * 1.25),
              discountPercent: p.discountPercent || 0,
              inStock: true
            });
          }
        }
      } catch (err) {
        console.error('Error loading product details:', err);
        if (isMounted) setError('Unable to load product information.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => { isMounted = false; };
  }, [id]);

  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.75;
      ref.current.scrollTo({
        left: direction === 'left' ? ref.current.scrollLeft - scrollAmount : ref.current.scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <Package className="w-16 h-16 text-gray-300 mx-auto" />
          <h2 className="text-lg font-black text-gray-800">Product Not Found</h2>
          <p className="text-xs text-gray-500">{error || 'This product is currently unavailable or out of stock.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-[#0055ff] text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Active pricing from selected variant or base product
  const activePrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price || 0);
  const activeMrp = selectedVariant ? Number(selectedVariant.mrp) : Number(product.mrp || Math.round(activePrice * 1.25));
  const activeDiscount = activeMrp > activePrice ? Math.round(((activeMrp - activePrice) / activeMrp) * 100) : (product.discountPercent || 0);
  const activeUnit = selectedVariant ? (selectedVariant.unit || selectedVariant.weight) : (product.weight || product.unit || '1 unit');

  // Variant-aware cart item id
  const cartItemId = product._id || product.id;
  const quantity = getItemQuantity(cartItemId);

  // Gallery images array
  const galleryImages = (product.images && product.images.length > 0) ? product.images : [
    product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80'
  ];
  const currentImage = galleryImages[selectedImageIndex] || galleryImages[0];

  const categoryName = product.categoryName || product.category?.name || 'Dairy & Bakery';
  const categorySlug = product.categorySlug || product.category?.slug || 'dairy-bread-eggs';

  return (
    <div className="bg-[#f4f7fb] min-h-screen pb-16">
      
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8">
        
        {/* ============================================================
            1. BREADCRUMBS (Matching Blinkit: Home / Category / Product)
           ============================================================ */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium overflow-x-auto whitespace-nowrap py-1">
          <Link to="/" className="hover:text-blue-600 transition flex items-center gap-1">
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <Link to={`/category/${categorySlug}`} className="hover:text-blue-600 transition">
            {categoryName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-gray-900 font-bold truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* ============================================================
            2. MAIN PRODUCT SECTION (Left Gallery + Right Purchase Specs)
           ============================================================ */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* ----------------- LEFT COLUMN: GALLERY & PRODUCT DETAILS ----------------- */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Big Main Image Preview */}
              <div className="relative w-full h-80 sm:h-96 bg-gray-50/70 rounded-2xl border border-gray-100 flex items-center justify-center p-6 overflow-hidden group">
                {activeDiscount > 0 && (
                  <span className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs z-10">
                    {activeDiscount}% OFF
                  </span>
                )}
                
                <img
                  src={currentImage}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Thumbnails Strip (Matches Blinkit 4-5 thumbnails underneath) */}
              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 sm:w-18 sm:h-18 rounded-xl border-2 p-1.5 flex items-center justify-center bg-gray-50/60 transition-all flex-shrink-0 ${
                      selectedImageIndex === idx 
                        ? 'border-[#0055ff] ring-2 ring-blue-100 bg-white' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </button>
                ))}
              </div>

              {/* Product Details Section (Beneath Images in Mockup) */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h3 className="text-base font-black text-gray-900 tracking-tight">
                  Product Details
                </h3>

                <div className="space-y-3 text-xs">
                  {/* Key Features from catalog */}
                  {product.keyFeatures && product.keyFeatures.map((feat, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                      <span className="font-bold text-gray-500 w-36 flex-shrink-0">
                        {feat.label}
                      </span>
                      <span className="font-extrabold text-gray-900">
                        {feat.value}
                      </span>
                    </div>
                  ))}

                  {/* Expandable "View more details" Accordion (Matches Mockup) */}
                  <div>
                    <button
                      onClick={() => setShowFullDetails(!showFullDetails)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0055ff] hover:text-blue-700 transition pt-1"
                    >
                      <span>{showFullDetails ? 'View less details' : 'View more details'}</span>
                      {showFullDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showFullDetails && (
                      <div className="mt-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-3.5 text-xs animate-in fade-in duration-200">
                        {product.description && (
                          <div>
                            <span className="font-bold text-gray-500 block mb-0.5">Description:</span>
                            <p className="text-gray-700 leading-relaxed font-medium">{product.description}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-gray-500 block mb-0.5">Shelf Life:</span>
                          <p className="text-gray-800 font-semibold">{product.shelfLife || 'Fresh Daily Supply'}</p>
                        </div>
                        <div>
                          <span className="font-bold text-gray-500 block mb-0.5">Country of Origin:</span>
                          <p className="text-gray-800 font-semibold">{product.countryOfOrigin || 'India 🇮🇳'}</p>
                        </div>
                        <div>
                          <span className="font-bold text-gray-500 block mb-0.5">Manufacturer Details:</span>
                          <p className="text-gray-700 font-medium leading-relaxed">{product.manufacturerDetails || 'Authorized FMCG Brand Partner & Indore Fulfillment Hub'}</p>
                        </div>
                        <div>
                          <span className="font-bold text-gray-500 block mb-0.5">Customer Care:</span>
                          <p className="text-gray-700 font-medium">support@tricelyn.com • Toll-free: 1800-TRICELYN</p>
                        </div>
                        <div>
                          <span className="font-bold text-gray-500 block mb-0.5">Disclaimer:</span>
                          <p className="text-gray-500 text-[11px] leading-relaxed">
                            {product.disclaimer || 'Every effort is made to maintain accuracy of all information. However, actual product packaging and materials may contain more and/or different information.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* ----------------- RIGHT COLUMN: SPECS, VARIANTS & VALUE PROPS ----------------- */}
            <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
              
              <div className="space-y-6">
                
                {/* Title & Veg Indicator */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded border-2 border-emerald-600 flex items-center justify-center p-0.5 flex-shrink-0" title="100% Vegetarian">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                      ⚡ 10-15 Mins Delivery
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
                    {product.name}
                  </h1>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold">
                      <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                      <span>{product.rating || '4.6'}</span>
                    </div>
                    <span className="text-gray-400 font-medium">({product.ratingsCount || '1.8k'} verified ratings)</span>
                  </div>
                </div>

                {/* ----------------- VARIANTS / "SELECT UNIT" (Exact Blinkit Screen) ----------------- */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Select Unit
                  </h3>

                  <div className="flex flex-wrap gap-3">
                    {product.variants && product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`flex flex-col items-start px-4 py-2.5 rounded-2xl border-2 transition-all text-left min-w-[100px] ${
                            isSelected 
                              ? 'border-[#0055ff] bg-blue-50/40 shadow-xs' 
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="text-xs font-extrabold text-gray-900">
                              {v.unit || v.weight}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#0055ff] flex-shrink-0" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-gray-600 mt-0.5">
                            ₹{v.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Display & Add To Cart */}
                <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold text-gray-500 mb-0.5">
                      {activeUnit}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-gray-900">
                        ₹{activePrice}
                      </span>
                      {activeMrp > activePrice && (
                        <span className="text-sm font-semibold text-gray-400 line-through">
                          ₹{activeMrp}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      (Inclusive of all taxes)
                    </p>
                  </div>

                  <div>
                    {quantity === 0 ? (
                      <button
                        onClick={() => addToCart({
                          ...product,
                          price: activePrice,
                          mrp: activeMrp,
                          weight: activeUnit,
                          selectedVariantId: selectedVariant?.id
                        }, 1)}
                        className="w-full sm:w-auto px-8 py-3 bg-[#0c831f] hover:bg-[#0a701a] text-white rounded-xl text-sm font-black shadow-sm hover:shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to cart</span>
                      </button>
                    ) : (
                      <div className="flex items-center bg-[#0c831f] text-white rounded-xl shadow-xs overflow-hidden py-1 px-1.5">
                        <button
                          onClick={() => updateQuantity(cartItemId, quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white/20 active:scale-90 transition font-bold"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-black select-none">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(cartItemId, quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white/20 active:scale-90 transition font-bold"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ----------------- "WHY SHOP FROM TRICELYN?" (Matches Mockup) ----------------- */}
                <div className="border border-gray-100 rounded-2xl p-5 bg-white space-y-4">
                  <h4 className="text-xs font-black text-gray-900 tracking-tight">
                    Why shop from Tricelyn?
                  </h4>

                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-gray-900">
                          Round The Clock Delivery
                        </h5>
                        <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                          Get items delivered to your doorstep from dark stores near you, whenever you need them.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[#0055ff] flex-shrink-0 mt-0.5">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-gray-900">
                          Best Prices & Offers
                        </h5>
                        <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                          Best price destination with offers directly from authorized brand manufacturers.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-gray-900">
                          Wide Assortment
                        </h5>
                        <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                          Choose from 30,000+ products across fresh grocery, personal care, household & daily essentials.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* ============================================================
            3. SIMILAR PRODUCTS CAROUSEL (Matches Screenshot 1 Bottom)
           ============================================================ */}
        {product.similarProducts && product.similarProducts.length > 0 && (
          <section className="space-y-4 bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-xs relative">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                  Similar products
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  More fresh choices in {categoryName}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollCarousel(similarScrollRef, 'left')}
                  className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition shadow-2xs"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCarousel(similarScrollRef, 'right')}
                  className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition shadow-2xs"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={similarScrollRef}
              className="flex gap-4 overflow-x-auto pb-2 scrollbar-none scroll-smooth -mx-1 px-1"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {product.similarProducts.map((item) => (
                <div
                  key={item._id || item.id}
                  className="flex-shrink-0 w-44 sm:w-48"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================
            4. PEOPLE ALSO BOUGHT CAROUSEL (Matches Screenshot 2 Top)
           ============================================================ */}
        {product.peopleAlsoBought && product.peopleAlsoBought.length > 0 && (
          <section className="space-y-4 bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-xs relative">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                  People also bought
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Frequently purchased together
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollCarousel(peopleScrollRef, 'left')}
                  className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition shadow-2xs"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCarousel(peopleScrollRef, 'right')}
                  className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition shadow-2xs"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={peopleScrollRef}
              className="flex gap-4 overflow-x-auto pb-2 scrollbar-none scroll-smooth -mx-1 px-1"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {product.peopleAlsoBought.map((item) => (
                <div
                  key={item._id || item.id}
                  className="flex-shrink-0 w-44 sm:w-48"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================
            5. RECIPES FOR YOU (Matches Screenshot 2 Middle)
           ============================================================ */}
        {product.recipes && product.recipes.length > 0 && (
          <section className="space-y-4 bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">
                {product.name} recipes for you
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Delicious culinary inspirations handpicked for this ingredient
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {product.recipes.map((rec) => (
                <div
                  key={rec.id}
                  className="group rounded-2xl border border-gray-100 overflow-hidden bg-white hover:shadow-md transition duration-200 flex flex-col justify-between"
                >
                  <div className="relative h-28 w-full overflow-hidden bg-gray-100">
                    <img
                      src={rec.image}
                      alt={rec.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{rec.time}</span>
                    </span>
                  </div>

                  <div className="p-3 space-y-1">
                    <h4 className="text-xs font-extrabold text-gray-900 line-clamp-1 group-hover:text-[#0055ff] transition">
                      {rec.name}
                    </h4>
                    {rec.description && (
                      <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                        {rec.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default ProductDetailPage;
