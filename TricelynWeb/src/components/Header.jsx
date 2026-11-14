import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ShoppingCart,
  User,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Package,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Headphones,
  MessageSquare,
  Plus,
  Minus,
  TrendingUp,
  Store
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { usePlatform } from '../context/PlatformContext';
import { groceryService } from '../services/api';
import { ALL_CATALOG_PRODUCTS } from '../data/groceryCatalog';
import logoImg from '../assets/logo.png';

const POPULAR_SEARCH_CHIPS = ['Milk', 'Fresh Bread', 'Farm Eggs', 'Amul Paneer', 'Aashirvaad Atta', 'Lays Chips', 'Coca Cola', 'Butter', 'Maggi Noodles'];

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, setIsAuthModalOpen } = useAuth();
  const { itemCount, subtotal, setIsCartDrawerOpen, addToCart, getItemQuantity, updateQuantity } = useCart();
  const { selectedLocation, setIsLocationModalOpen } = useLocation();
  const { platformMode } = usePlatform();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Instant Live Search Dropdown State
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [liveSearchResults, setLiveSearchResults] = useState([]);
  const [liveCategoryResults, setLiveCategoryResults] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);

  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await groceryService.getCategories();
        if (res.data?.data) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load categories for header:', err);
      }
    };
    fetchCats();
  }, []);

  // Live Debounced Autocomplete
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveSearchResults([]);
      setLiveCategoryResults([]);
      setIsSearchingLive(false);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    // Match categories instantly
    const matchedCats = categories.filter(c =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.slug && c.slug.toLowerCase().includes(q))
    ).slice(0, 4);
    setLiveCategoryResults(matchedCats);

    setIsSearchingLive(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await groceryService.getProducts({ search: q, limit: 6 });
        if (res.data?.data && res.data.data.length > 0) {
          setLiveSearchResults(res.data.data.slice(0, 6));
        } else {
          const fallback = ALL_CATALOG_PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
            (p.description && p.description.toLowerCase().includes(q))
          ).slice(0, 6);
          setLiveSearchResults(fallback);
        }
      } catch {
        const fallback = ALL_CATALOG_PRODUCTS.filter(p =>
          p.name.toLowerCase().includes(q) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q))
        ).slice(0, 6);
        setLiveSearchResults(fallback);
      } finally {
        setIsSearchingLive(false);
      }
    }, 180);

    return () => clearTimeout(timeout);
  }, [searchQuery, categories]);

  // Click outside to close live search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        desktopSearchRef.current && !desktopSearchRef.current.contains(e.target) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectChip = (chip) => {
    setSearchQuery(chip);
    setIsSearchFocused(false);
    navigate(`/search?q=${encodeURIComponent(chip)}`);
  };

  const handleSelectProduct = (prodId) => {
    setIsSearchFocused(false);
    navigate(`/product/${prodId}`);
  };

  const handleSelectCategory = (slug) => {
    setIsSearchFocused(false);
    navigate(`/category/${slug}`);
  };

  const handleOpenChat = () => {
    window.dispatchEvent(new Event('open-support-chat'));
  };

  const renderSearchDropdown = (isMobile = false) => {
    if (!isSearchFocused) return null;

    return (
      <div
        className={`absolute left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-gray-800 animate-in fade-in slide-in-from-top-1 ${
          isMobile ? 'top-full mt-1.5 max-h-[75vh]' : 'top-full mt-2 max-h-[480px]'
        } overflow-y-auto no-scrollbar`}
      >
        {/* 1. If Query is empty: Show Popular Searches & Fast Categories */}
        {!searchQuery.trim() ? (
          <div className="p-3 sm:p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-[#0B3EDB]" />
              <span>Popular Searches</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SEARCH_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectChip(chip)}
                  className="px-2.5 py-1 bg-gray-50 hover:bg-blue-50 hover:text-[#0B3EDB] border border-gray-200 rounded-full text-xs font-semibold text-gray-700 transition"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Browse Top Categories
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {categories.slice(0, 6).map((cat) => (
                  <button
                    key={cat.slug || cat._id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.slug || cat._id)}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 text-left transition border border-gray-50"
                  >
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#0B3EDB] flex items-center justify-center text-xs font-bold flex-shrink-0">
                      🛒
                    </span>
                    <span className="text-xs font-bold text-gray-800 truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* 2. When Query is typed: Live results */
          <div className="divide-y divide-gray-100">
            {/* Matched Categories Pills */}
            {liveCategoryResults.length > 0 && (
              <div className="p-2.5 bg-blue-50/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">
                  Categories:
                </span>
                {liveCategoryResults.map((cat) => (
                  <button
                    key={cat.slug || cat._id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.slug || cat._id)}
                    className="px-2 py-0.5 bg-white border border-blue-200 rounded-lg text-xs font-bold text-[#0B3EDB] hover:bg-[#0B3EDB] hover:text-white transition whitespace-nowrap flex-shrink-0"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Matched Products */}
            {liveSearchResults.length > 0 ? (
              <div className="p-2 space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Matching Products
                </div>
                {liveSearchResults.map((prod) => {
                  const pid = prod._id || prod.id;
                  const qty = getItemQuantity(pid);
                  const price = Number(prod.price ?? prod.sellingPrice) || 0;
                  const mrp = Number(prod.mrp) || Math.round(price * 1.25);

                  return (
                    <div
                      key={pid}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition gap-2"
                    >
                      <div
                        onClick={() => handleSelectProduct(pid)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5">
                          <img
                            src={prod.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80'}
                            alt={prod.name}
                            className="max-h-full max-w-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-gray-900 truncate hover:text-[#0B3EDB]">
                            {prod.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <span>{prod.weight || prod.unit || '1 unit'}</span>
                            <span className="font-extrabold text-gray-900">₹{price}</span>
                            {mrp > price && (
                              <span className="line-through text-gray-400 text-[10px]">₹{mrp}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Add / Qty Control */}
                      <div className="flex-shrink-0">
                        {qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => addToCart(prod, 1)}
                            className="px-3 py-1 bg-blue-50 text-[#0B3EDB] hover:bg-[#0B3EDB] hover:text-white rounded-lg text-xs font-bold transition border border-blue-200 active:scale-95"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 bg-[#0B3EDB] text-white rounded-lg px-1.5 py-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(pid, qty - 1)}
                              className="w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold px-1">{qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(pid, qty + 1)}
                              className="w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : isSearchingLive ? (
              <div className="p-6 text-center text-xs text-gray-400 font-bold">
                Searching grocery dark stores...
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-gray-500">
                No products found for "{searchQuery}".
              </div>
            )}

            {/* Bottom Footer: Press Enter for Full Search */}
            <div
              onClick={handleSearchSubmit}
              className="p-2.5 bg-gray-50 hover:bg-blue-50 text-center cursor-pointer transition flex items-center justify-center gap-1.5 text-xs font-bold text-[#0B3EDB]"
            >
              <span>See all results for "{searchQuery}"</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 shadow-md">
      {/* ============================================================
          MAIN NAVBAR: TRICELYN BRAND GRADIENT (Responsive Mobile + Desktop)
         ============================================================ */}
      <div className="bg-gradient-to-r from-[#07162E] via-[#0A2B6B] to-[#0B3EDB] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

          {/* ==================== MOBILE NAVBAR (< 768px) ==================== */}
          {/* Matches Reference Screenshot 1 & 3: Top delivery row + Full search row */}
          <div className="flex flex-col py-2.5 gap-2.5 md:hidden">
            {/* Top Row: Logo, Delivery Dropdown & Profile */}
            <div className="flex items-center justify-between gap-2">
              {/* Brand Logo */}
              <Link to="/" className="flex items-center flex-shrink-0">
                <div className="bg-[#0A2B6B] px-2 py-1 rounded-xl border border-white/40 shadow-xs flex items-center">
                  <img
                    src={logoImg}
                    alt="Tricelyn"
                    className="h-7 w-auto object-contain"
                  />
                </div>
              </Link>

              {/* Delivery Speed & Location Selector (Matches Reference Screenshot 1) */}
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex-1 flex flex-col items-start px-2 py-0.5 rounded-xl text-left truncate active:bg-white/10 transition"
              >
                <div className="text-[12px] font-black text-white leading-tight flex items-center gap-1">
                  <span>Delivery in 10-15 mins</span>
                </div>
                <div className="text-[10px] text-blue-100 font-medium truncate max-w-[160px] flex items-center gap-0.5 leading-tight">
                  <span className="truncate">{selectedLocation?.locality || selectedLocation?.name || 'Vijay Nagar, Indore'}</span>
                  <ChevronDown className="w-2.5 h-2.5 flex-shrink-0 text-white/80" />
                </div>
              </button>

              {/* Profile / Account Button */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Mobile Premier Shortcut */}
                <Link
                  to="/premier"
                  className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-xs active:scale-95 transition"
                  title="Tricelyn Premier"
                >
                  <Sparkles className="w-4 h-4 text-slate-900" />
                </Link>

                {isAuthenticated ? (
                  <button
                    onClick={() => navigate('/account')}
                    className="w-8 h-8 rounded-full bg-white text-[#0B3EDB] font-black text-xs flex items-center justify-center border border-white/40 shadow-xs active:scale-95 transition"
                    title="Account"
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center border border-white/30 text-xs active:scale-95 transition"
                    title="Login"
                  >
                    <User className="w-4 h-4" />
                  </button>
                )}

                {/* Mobile 24/7 Support Chat Icon */}
                <button
                  onClick={handleOpenChat}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center relative border border-white/30 active:scale-95 transition"
                  title="24/7 Support & Chat"
                  aria-label="Support & Live Chat"
                >
                  <Headphones className="w-4 h-4 text-white" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-0.5 right-0.5 animate-pulse" />
                </button>

                {/* Header Cart Icon */}
                <button
                  onClick={() => setIsCartDrawerOpen(true)}
                  className="w-8 h-8 rounded-full bg-white text-[#0B3EDB] flex items-center justify-center relative shadow-xs active:scale-95 transition"
                  title="Cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Row: Full-Width Search Input (Matches Reference Screenshot 1) */}
            <div ref={mobileSearchRef} className="w-full relative">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Search "milk", "bread", "chips", "paneer"...'
                    className="w-full pl-9 pr-8 py-2 text-xs bg-white text-gray-900 placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-xs"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </form>
              {renderSearchDropdown(true)}
            </div>
          </div>

          {/* ==================== DESKTOP NAVBAR (>= 768px) ==================== */}
          <div className="hidden md:flex items-center justify-between h-20 py-2 gap-4">

            {/* Brand Logo (Tricelyn Logo) */}
            <Link to="/" className="flex items-center flex-shrink-0 group">
              <div className="bg-[#0A2B6B] hover:bg-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-white/40 shadow-xs transition flex items-center">
                <img
                  src={logoImg}
                  alt="Tricelyn - Everything You Actually Want"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </div>
            </Link>

            {/* Delivery Location Selector (Matches Mockup) */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:flex items-center gap-2 text-left px-3 py-1.5 rounded-xl hover:bg-white/10 transition border border-transparent hover:border-white/20 text-white"
              title="Change Delivery Location"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                  <span>Deliver to</span>
                  <ChevronDown className="w-3 h-3 text-white/70" />
                </div>
                <div className="text-xs font-bold text-white truncate max-w-[140px] lg:max-w-[180px]">
                  {selectedLocation?.name || 'Vijay Nagar, Indore'}
                </div>
              </div>
            </button>

            {/* Search Bar: White Rounded-Full Pill (Matches Mockup) */}
            <div ref={desktopSearchRef} className="flex-1 max-w-2xl relative">
              <form
                onSubmit={handleSearchSubmit}
                className="w-full relative"
              >
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={platformMode === 'food' ? 'Search dishes, meals or fresh groceries...' : 'Search for groceries, fresh produce, daily essentials...'}
                    className="w-full pl-5 pr-12 py-2.5 text-xs sm:text-sm bg-white text-gray-900 placeholder:text-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm transition"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 p-1.5 text-gray-500 hover:text-[#0B3EDB] transition"
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>
              {renderSearchDropdown(false)}
            </div>

            {/* Right Action Icons: Auth & Cart (Matches Mockup) */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Premier Navigation Link (Matches Mockup Screenshot 1) */}
              <Link
                to="/premier"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10 rounded-full transition border border-white/20 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Premier</span>
                {user?.membershipBadge && (
                  <span className="bg-amber-400 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tight">
                    {user.membershipBadge}
                  </span>
                )}
              </Link>

              {/* Account / Login */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white hover:bg-white/10 transition border border-white/20"
                  >
                    <div className="w-7 h-7 rounded-full bg-white text-[#0B3EDB] font-bold text-xs flex items-center justify-center">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-bold hidden lg:inline-block max-w-[90px] truncate">
                      {user?.name || user?.phone || 'Account'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 z-50 text-gray-800 animate-in fade-in">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-xs font-bold text-gray-900 truncate">{user?.phone || user?.name || 'Customer'}</p>
                      </div>
                      <Link
                        to="/account/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium hover:bg-gray-50"
                      >
                        <Package className="w-4 h-4 text-[#0B3EDB]" />
                        My Orders
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/10 rounded-full transition border border-white/30"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Login / Signup</span>
                </button>
              )}

              {/* 24/7 Live Support Chat Pill Button (Beside Cart) */}
              <button
                onClick={handleOpenChat}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-full transition text-xs font-bold border border-white/30 shadow-xs"
                title="24/7 Customer Support & Chat"
                aria-label="Support & Live Chat"
              >
                <div className="relative flex items-center">
                  <Headphones className="w-4 h-4 text-white" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-pulse" />
                </div>
                <span className="hidden lg:inline text-xs font-bold">Support</span>
              </button>

              {/* Cart Button Pill (White / Accent Pill) */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#0B3EDB] hover:bg-blue-50 rounded-full shadow-sm transition font-black text-xs"
                title="View Cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                </div>
                <div className="flex flex-col text-left leading-tight hidden sm:flex">
                  <span className="text-[11px] font-extrabold">₹{subtotal.toFixed(0)}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECONDARY SUBNAV STRIP (White Strip matching Mockup)
         ============================================================ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-2 py-2 overflow-x-auto no-scrollbar text-xs font-bold text-gray-700">
            {/* All Categories Button */}
            <Link
              to="/categories"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-900 font-black hover:text-[#0B3EDB] whitespace-nowrap flex-shrink-0 transition border-r border-gray-200 pr-3 mr-1"
            >
              <Menu className="w-4 h-4 text-gray-800" />
              <span>All Categories</span>
            </Link>

            {/* Top Category Nav Pills (From dynamic categories) */}
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat._id || cat.slug}
                to={`/category/${cat.slug || cat._id}`}
                className="px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-[#0B3EDB] transition whitespace-nowrap flex-shrink-0 text-gray-700 font-semibold"
              >
                {cat.shortName || cat.name}
              </Link>
            ))}

            <Link
              to="/categories"
              className="px-3 py-1.5 text-gray-400 hover:text-[#0B3EDB] transition whitespace-nowrap flex-shrink-0 font-bold"
            >
              ••• More
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
