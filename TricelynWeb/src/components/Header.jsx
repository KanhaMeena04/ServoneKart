import React, { useState, useEffect } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { groceryService } from '../services/api';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, setIsAuthModalOpen } = useAuth();
  const { itemCount, subtotal, setIsCartDrawerOpen } = useCart();
  const { selectedLocation, setIsLocationModalOpen } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 shadow-md">
      {/* ============================================================
          MAIN NAVBAR: ELECTRIC ROYAL BLUE (Matches Master Mockup)
         ============================================================ */}
      <div className="bg-[#0055ff] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 py-2 gap-4">
            
            {/* Logo (Matches Mockup with Tricelyn T-mark) */}
            <Link to="/" className="flex flex-col flex-shrink-0 group">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white">
                  TRICELYN
                </span>
              </div>
              <span className="text-[10px] tracking-wider font-semibold text-blue-100 uppercase -mt-1">
                Everything You Actually Want
              </span>
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
            <form 
              onSubmit={handleSearchSubmit} 
              className="flex-1 max-w-2xl relative"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for groceries, fresh produce, daily essentials..."
                  className="w-full pl-5 pr-12 py-2.5 text-xs sm:text-sm bg-white text-gray-900 placeholder:text-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm transition"
                />
                <button
                  type="submit"
                  className="absolute right-3 p-1.5 text-gray-500 hover:text-[#0055ff] transition"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Right Action Icons: Auth & Cart (Matches Mockup) */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Account / Login */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white hover:bg-white/10 transition border border-white/20"
                  >
                    <div className="w-7 h-7 rounded-full bg-white text-[#0055ff] font-bold text-xs flex items-center justify-center">
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
                        <Package className="w-4 h-4 text-[#0055ff]" />
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

              {/* Cart Button Pill (White / Accent Pill) */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#0055ff] hover:bg-blue-50 rounded-full shadow-sm transition font-black text-xs"
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-900 font-black hover:text-[#0055ff] whitespace-nowrap flex-shrink-0 transition border-r border-gray-200 pr-3 mr-1"
            >
              <Menu className="w-4 h-4 text-gray-800" />
              <span>All Categories</span>
            </Link>

            {/* Top Category Nav Pills (From dynamic categories) */}
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat._id || cat.slug}
                to={`/category/${cat.slug || cat._id}`}
                className="px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-[#0055ff] transition whitespace-nowrap flex-shrink-0 text-gray-700 font-semibold"
              >
                {cat.shortName || cat.name}
              </Link>
            ))}

            <Link
              to="/categories"
              className="px-3 py-1.5 text-gray-400 hover:text-[#0055ff] transition whitespace-nowrap flex-shrink-0 font-bold"
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
