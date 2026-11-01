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
  Layers
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
    // Fetch dynamic categories for secondary navbar
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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      {/* Top Banner Bar */}
      <div className="bg-brand-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
        <span>Indore Super Quick Delivery: Groceries delivered in 10-15 minutes! Free delivery on orders over ₹199.</span>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex flex-col flex-shrink-0 group">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-600 group-hover:text-brand-700 transition">
              TRICELYN
            </span>
            <span className="text-[10px] tracking-wider font-semibold text-gray-500 uppercase -mt-1">
              Everything You Actually Want
            </span>
          </Link>

          {/* Delivery Location Selector */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="hidden md:flex items-center gap-2 text-left px-3 py-1.5 rounded-xl hover:bg-gray-100 transition border border-transparent hover:border-gray-200"
            title="Change Delivery Location"
          >
            <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-brand-600 uppercase tracking-wider flex items-center gap-1">
                <span>Deliver in 12 Mins</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
              <div className="text-xs font-semibold text-gray-800 truncate max-w-[140px] lg:max-w-[180px]">
                {selectedLocation?.name || 'Vijay Nagar, Indore'}
              </div>
            </div>
          </button>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="flex-1 max-w-2xl relative"
          >
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search for "fresh milk", "bread", "atta", "lays", "potatoes"...'
                className="w-full pl-10 pr-24 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Action Icons: Auth & Cart */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Account / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition border border-gray-100"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 font-bold text-xs flex items-center justify-center">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold hidden lg:inline-block max-w-[90px] truncate">
                    {user?.name || user?.phone || 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-xs font-bold text-gray-900 truncate">{user?.phone || user?.name || 'Customer'}</p>
                    </div>
                    <Link
                      to="/account/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Package className="w-4 h-4 text-brand-600" />
                      My Orders
                    </Link>
                    <Link
                      to="/account/addresses"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <MapPin className="w-4 h-4 text-brand-600" />
                      Saved Addresses
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
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition"
              >
                <User className="w-4 h-4" />
                <span>Login / Sign Up</span>
              </button>
            )}

            {/* Cart Button Pill */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-2 bg-accent-green hover:bg-accent-greenDark text-white rounded-xl shadow-sm hover:shadow transition font-bold text-xs"
              title="View Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] font-medium opacity-90">{itemCount} items</span>
                <span className="text-xs font-extrabold">₹{subtotal.toFixed(0)}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Location Selector Row */}
        <div className="md:hidden pb-2 pt-1 flex items-center justify-between border-t border-gray-100 text-xs">
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 font-semibold text-gray-700"
          >
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            <span className="truncate max-w-[220px]">{selectedLocation?.name || 'Vijay Nagar, Indore'}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          <span className="bg-green-100 text-accent-greenDark px-2 py-0.5 rounded text-[10px] font-bold">
            10-15 mins
          </span>
        </div>
      </div>

      {/* Secondary Category Subnav Rail (Matches User Image 1) */}
      <div className="border-t border-gray-100 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar text-xs font-medium text-gray-700">
            {/* All Categories Dropdown/Link */}
            <Link
              to="/categories"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-900 font-bold hover:border-brand-500 whitespace-nowrap flex-shrink-0 transition"
            >
              <Layers className="w-3.5 h-3.5 text-brand-600" />
              <span>All Categories</span>
            </Link>

            {/* Quick Categories List */}
            {categories.map((cat) => (
              <Link
                key={cat._id || cat.slug}
                to={`/category/${cat.slug || cat._id}`}
                className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-brand-600 hover:shadow-sm transition whitespace-nowrap flex-shrink-0"
              >
                {cat.name}
              </Link>
            ))}

            {categories.length === 0 && (
              <>
                <Link to="/category/vegetables-fruits" className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-brand-600 transition whitespace-nowrap flex-shrink-0">
                  Fruits & Veg
                </Link>
                <Link to="/category/dairy-breakfast" className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-brand-600 transition whitespace-nowrap flex-shrink-0">
                  Dairy & Bakery
                </Link>
                <Link to="/category/munchies-snacks" className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-brand-600 transition whitespace-nowrap flex-shrink-0">
                  Snacks & Beverages
                </Link>
                <Link to="/category/atta-rice-dal" className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-brand-600 transition whitespace-nowrap flex-shrink-0">
                  Atta, Rice & Dal
                </Link>
                <Link to="/category/personal-care" className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-brand-600 transition whitespace-nowrap flex-shrink-0">
                  Personal Care
                </Link>
                <Link to="/category/cleaning-household" className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-brand-600 transition whitespace-nowrap flex-shrink-0">
                  Household
                </Link>
                <Link to="/category/pet-care" className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-brand-600 transition whitespace-nowrap flex-shrink-0">
                  Pet Care
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

